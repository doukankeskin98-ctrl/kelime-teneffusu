import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {capacityProbe,catalogueQuality} from '../scripts/content-quality-model.ts';
import {emptyProgress,readProgress,progressBoard,cleanSave,mergeProgress,collectionStats} from '../lib/game/progress.ts';
import {encodeProgress,parseProgressEnvelope,sameProgress,ProgressFormatError} from '../lib/game/progress-codec.ts';
import {progressStorageKeys,readStoredProgress,writeStoredProgress,shadowProgress} from '../lib/game/progress-storage.ts';
import {CloudProgress,ProgressUpgradeRequired} from '../lib/game/cloud.ts';
import {COMPACT_PROGRESS_WRITES,CONTENT_REVISION_TWO} from '../lib/game/progress-rollout.ts';
import {JOURNEY_REVISION_TWO,playableJourney,journeyRevision,journeyPresentationKey,revisionSave} from '../lib/game/journey-revisions.ts';
import {journeyBoard} from '../lib/game/content.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {boardIssues,PRESENTATION_RULES} from '../lib/game/board-quality.ts';
import {discoveryRewards} from '../lib/game/discovery.ts';
import {wordTrail} from '../lib/game/journey-flow.ts';
import {clearErasedProgress} from '../lib/auth/erasure-client.ts';
import {fixture} from './fixtures.ts';
const key='route:ufuk-gok-1';
function progress(revision:1|2=1,count=1){const p=emptyProgress(),b=progressBoard(key,revision)!;p.saves[key]=cleanSave({strokes:b.placements.slice(0,count),elapsed:35,hints:1,complete:false,stars:0,...(revision===2?{revision:2 as const}:{})},b);return p;}
function storage(){const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};}

describe('lossless reader-first save compatibility',()=>{
 it('retains every normalized catalogue field and all paths while restoring at least 64KB capacity',()=>{
  const {progress:p,bytes}=capacityProbe(),raw=encodeProgress(p),normalized=readProgress(JSON.stringify(p));
  assert(sameProgress(parseProgressEnvelope(raw),p));assert.deepEqual(readProgress(raw),normalized);
  assert(Buffer.byteLength(raw)<=256000-64000);assert(Buffer.byteLength(raw)<bytes);
  for(const saved of Object.values(normalized.saves)){assert(saved.strokes.length>0);}
  assert.equal(COMPACT_PROGRESS_WRITES,false);assert.equal(CONTENT_REVISION_TWO,false);
 });
 it('preserves partial, reversed valid paths, hints, timers and preferences over repeated conversions',()=>{
  const p=progress(1,2);p.saves[key]!.strokes=p.saves[key]!.strokes.map(s=>({...s,a:s.b,b:s.a}));p.haptics=true;p.sound=true;p.palette='orchid';
  let next=p;for(let i=0;i<8;i++)next=readProgress(encodeProgress(next));assert.deepEqual(next,p);
 });
 it('fails closed on future envelopes, unknown revision/ids and malformed tuple expansion',()=>{
  const valid=JSON.parse(encodeProgress(progress()));
  for(const raw of [{...valid,v:4},{...valid,saves:{'route:future':valid.saves[key]}},{...valid,saves:{[key]:[[],0,0,0,0,9]}},{...valid,saves:{[key]:[[['0',0,0,1]],0,0,0,0,1]}},{...valid,saves:{[key]:[Array(31).fill(['0',0,0,1,1]),0,0,0,0,1]}}])assert.throws(()=>readProgress(JSON.stringify(raw)),ProgressFormatError);
 });
 it('shadow is never authoritative and activation leaves exact original backup and last atomic pointer',()=>{
  const s=storage(),keys=progressStorageKeys('a'),p=progress();const old=JSON.stringify(p);s.setItem(keys.legacy,old);shadowProgress(s,'a',p);
  assert.equal(s.getItem(keys.legacy),old);assert.equal(s.getItem(keys.compact),null);assert.deepEqual(readStoredProgress(s,'a'),p);
  writeStoredProgress(s,'a',p,true);assert.equal(s.getItem(keys.backup),old);assert.equal(s.getItem(keys.pending),null);
  const next=progress(1,2);next.sound=true;writeStoredProgress(s,'a',next,true);assert.equal(s.getItem(keys.backup),old);assert.equal(readStoredProgress(s,'a').sound,true);
  assert.equal(readStoredProgress(s,'b').saves[key],undefined);
 });
 it('interruption/quota at each migration write preserves readable old or committed new progress',()=>{
  for(let failAt=1;failAt<=3;failAt++){
   const s=storage(),keys=progressStorageKeys('a'),old=progress(),next=progress(1,2),raw=JSON.stringify(old);s.setItem(keys.legacy,raw);let writes=0;
   const faulty={...s,setItem:(k:string,v:string)=>{if(++writes===failAt)throw new Error('quota');s.setItem(k,v);}};
   assert.throws(()=>writeStoredProgress(faulty,'a',next,true));assert.equal(s.getItem(keys.legacy),raw);assert.deepEqual(readStoredProgress(s,'a'),old);
  }
 });
 it('does not replace corrupted originals and erases every owner-scoped migration key only for that owner',()=>{
  const s=storage(),a=progressStorageKeys('a'),b=progressStorageKeys('b');for(const k of [...Object.values(a),...Object.values(b)])s.setItem(k,'{corrupt');
  assert.throws(()=>readStoredProgress(s,'a'));assert.throws(()=>writeStoredProgress(s,'a',emptyProgress()));assert.equal(s.getItem(a.legacy),'{corrupt');
  clearErasedProgress('a',s,storage());for(const k of Object.values(a))assert.equal(s.getItem(k),null);for(const k of Object.values(b))assert.equal(s.getItem(k),'{corrupt');
 });
 it('keeps main v2, writes verified owner-bound shadow, and retains immutable backup after opt-in',async()=>{
  const f=fixture();try{const legacy=new CloudProgress(f.db,f.clock),modern=new CloudProgress(f.db,f.clock,256000,true),p=progress();await legacy.save('a',p);
   const before=f.sqlite.prepare('SELECT * FROM campaign_saves WHERE user_id=?').get('a')!;
   assert.equal(JSON.parse(String(before['data'])).v,2);const shadow=f.sqlite.prepare('SELECT * FROM campaign_save_migrations WHERE user_id=?').get('a')!;
   assert.deepEqual(readProgress(String(shadow['compact_data'])),p);assert.equal(shadow['backup_data'],null);
   await modern.save('a',progress(1,2),3);assert.equal(JSON.parse(String(f.sqlite.prepare('SELECT data FROM campaign_saves WHERE user_id=?').get('a')!['data'])).v,3);
   assert.equal(f.sqlite.prepare('SELECT backup_data FROM campaign_save_migrations WHERE user_id=?').get('a')!['backup_data'],before['data']);
   // Old client may still merge rev1 discoveries; reader-first rollback preserves v3 storage.
   await legacy.save('a',progress(1,3));assert.equal(JSON.parse(String(f.sqlite.prepare('SELECT data FROM campaign_saves WHERE user_id=?').get('a')!['data'])).v,3);
   assert.equal(f.sqlite.prepare('SELECT backup_data FROM campaign_save_migrations WHERE user_id=?').get('a')!['backup_data'],before['data']);
   assert.equal((await legacy.read('b')).progress.saves[key],undefined);
  }finally{f.sqlite.close();}
 });
 it('rejects an old client before touching a modern content record or shadow',async()=>{
  const f=fixture();try{const cloud=new CloudProgress(f.db,f.clock,256000,true);await cloud.save('a',JSON.parse(encodeProgress(progress(2))),3);
   const before=f.sqlite.prepare('SELECT * FROM campaign_saves').all(),shadow=f.sqlite.prepare('SELECT * FROM campaign_save_migrations').all();
   await assert.rejects(()=>cloud.read('a'),ProgressUpgradeRequired);await assert.rejects(()=>cloud.save('a',progress()),ProgressUpgradeRequired);
   assert.deepEqual(f.sqlite.prepare('SELECT * FROM campaign_saves').all(),before);assert.deepEqual(f.sqlite.prepare('SELECT * FROM campaign_save_migrations').all(),shadow);
   assert.equal((await cloud.read('a',3)).progress.saves[key]!.revision,2);
  }finally{f.sqlite.close();}
 });
 it('rolls back the main CAS if the shadow transaction fails',async()=>{
  const f=fixture();try{const cloud=new CloudProgress(f.db,f.clock);await cloud.save('a',progress());const before=f.sqlite.prepare('SELECT * FROM campaign_saves').all();
   f.sqlite.exec("CREATE TRIGGER fail_shadow BEFORE UPDATE ON campaign_save_migrations BEGIN SELECT RAISE(ABORT,'disk failure'); END;");
   await assert.rejects(()=>cloud.save('a',progress(1,2)));assert.deepEqual(f.sqlite.prepare('SELECT * FROM campaign_saves').all(),before);
  }finally{f.sqlite.close();}
 });
 it('retries a lost CAS without publishing stale shadow data',async()=>{
  const f=fixture();try{const cloud=new CloudProgress(f.db,f.clock);await cloud.save('a',progress());let raced=false;const batch=f.db.batch;
   f.db.batch=async statements=>{if(!raced){raced=true;f.sqlite.prepare('UPDATE campaign_saves SET revision=revision+1 WHERE user_id=?').run('a');}return batch(statements);};
   await cloud.save('a',progress(1,2));const row=f.sqlite.prepare('SELECT * FROM campaign_saves').get()!,shadow=f.sqlite.prepare('SELECT * FROM campaign_save_migrations').get()!;
   assert.equal(row['revision'],shadow['source_revision']);assert.equal(row['data'],shadow['source_data']);assert.deepEqual(readProgress(String(shadow['compact_data'])),readProgress(String(row['data'])));
  }finally{f.sqlite.close();}
 });
});

describe('immutable content revisions and logical rewards',()=>{
 it('preserves all 312 old content, canonical and display hashes',()=>{
  const baseline=JSON.parse(readFileSync(new URL('./fixtures/journey-0500-quality.json',import.meta.url),'utf8'));
  const rows=catalogueQuality().rows;for(const expected of baseline.rows){const row=rows[expected.number-1]!;for(const key of ['id','number','contentHash','boardHash','displayHash'])assert.equal(row[key as keyof typeof row],expected[key]);}
 });
 it('pins even empty, elapsed-only, hint-only and completed legacy runs; fresh pilot selection is explicitly gated',()=>{
  for(const save of [cleanSave(undefined,progressBoard(key)!),{...cleanSave(undefined,progressBoard(key)!),elapsed:5},{...cleanSave(undefined,progressBoard(key)!),hints:1},progress(1,30).saves[key]!]){
   const p=emptyProgress();p.saves[key]=save;assert.equal(playableJourney('ufuk-gok-1',p,true)?.revision,undefined);
  }
  assert.equal(playableJourney('ufuk-gok-1',emptyProgress())?.revision,undefined);assert.equal(playableJourney('ufuk-gok-1',emptyProgress(),true)?.revision,2);
 });
 it('never unions same target IDs across revisions, preserves both histories and awards each logical chapter once',()=>{
  const old=progress(1,1),next=progress(2,2),merged=mergeProgress(old,next);
  assert.deepEqual(revisionSave(merged,key,1),old.saves[key]);assert.deepEqual(revisionSave(merged,key,2),next.saves[key]);
  assert.deepEqual(readProgress(encodeProgress(merged)),merged);
  const finished=mergeProgress(progress(1,30),progress(2,30));assert.equal(collectionStats(finished).completed,1);assert.equal(collectionStats(finished).stars,2);
  assert.equal(discoveryRewards(progress(1,30),finished).filter(r=>r.kind==='piece').length,0);
  assert.equal(wordTrail(progress(1,30)).words,4);assert.equal(wordTrail(progress(2,30)).words,5);
 });
 it('prepares distinct safe revision layouts without aliasing old target IDs or changing released keys',()=>{
  for(const id of Object.keys(JOURNEY_REVISION_TWO)){const old=journeyRevision(id,1)!,next=journeyRevision(id,2)!;
   assert.notDeepEqual(journeyBoard(old),journeyBoard(next));assert.notEqual(journeyPresentationKey(old),journeyPresentationKey(next));
   const display=presentationBoard(journeyBoard(next),journeyPresentationKey(next));assert.deepEqual(boardIssues(display,PRESENTATION_RULES),[]);
  }
 });
});

it('accepts a bounded compact record whose expanded runtime is larger than the legacy wire budget',async()=>{
 const f=fixture();try{const p=readProgress(JSON.stringify(capacityProbe().progress));p.revisionSaves=Object.fromEntries(Object.entries(p.saves).filter(([key])=>key.startsWith('route:')).slice(0,100).map(([key,s])=>[key,{'1':s}]));
  const raw=encodeProgress(p);assert(Buffer.byteLength(JSON.stringify(p))>256000);assert(Buffer.byteLength(raw)<256000);assert.deepEqual(readProgress(raw),p);
  const cloud=new CloudProgress(f.db,f.clock,256000,true);await cloud.save('expanded',JSON.parse(raw),3);assert.deepEqual((await cloud.read('expanded',3)).progress,p);await assert.rejects(()=>cloud.read('expanded'),ProgressUpgradeRequired);
 }finally{f.sqlite.close();}
});
it('rejects well-shaped compact tuples with unknown target, wrong coordinates or forged completion instead of discarding them',()=>{
 for(const mode of ['target','coordinate','completion']){const raw=JSON.parse(encodeProgress(progress()));if(mode==='target')raw.saves[key][0][0][0]='unknown-target';if(mode==='coordinate')raw.saves[key][0][0][1]=31;if(mode==='completion')raw.saves[key][3]=1;assert.throws(()=>readProgress(JSON.stringify(raw)),ProgressFormatError);}
});
it('restores the previous authoritative local value if the new read-back is corrupted',()=>{
 const s=storage(),keys=progressStorageKeys('a'),old=progress();writeStoredProgress(s,'a',old,true);const before=s.getItem(keys.compact);let corrupt=true;
 const faulty={...s,setItem:(k:string,v:string)=>{s.setItem(k,k===keys.compact&&corrupt?(corrupt=false,'{broken'):v);}};
 assert.throws(()=>writeStoredProgress(faulty,'a',progress(1,2),true));assert.equal(s.getItem(keys.compact),before);assert.deepEqual(readStoredProgress(s,'a'),old);
});
it('word milestones never fall when a better-star result from an older revision arrives and never double count the two',()=>{
 const old=progress(1,30),next=progress(2,30);old.saves[key]!.hints=0;old.saves[key]!.stars=3;
 for(const merged of [mergeProgress(old,next),mergeProgress(next,old)]){assert.equal(collectionStats(merged).stars,3);assert.equal(wordTrail(merged).words,5);assert.equal(collectionStats(merged).completed,1);}
});

it('new players receive sound and haptics while existing explicit or missing preferences remain unchanged',()=>{
 const fresh=emptyProgress();assert.equal(fresh.sound,true);assert.equal(fresh.haptics,true);
 for(const prefs of [{sound:false,haptics:false},{sound:true,haptics:false},{sound:false,haptics:true},{}]){
  const old=readProgress(JSON.stringify({v:2,saves:{},...prefs}));
  assert.equal(old.sound,'sound' in prefs&&prefs.sound===true);assert.equal(old.haptics,'haptics' in prefs&&prefs.haptics===true);
 }
});
