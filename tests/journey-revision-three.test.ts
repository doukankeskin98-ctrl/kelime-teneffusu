import assert from 'node:assert/strict';
import {it} from 'node:test';
import {readFileSync} from 'node:fs';
import {emptyProgress,readProgress,progressBoard,cleanSave,mergeProgress,type Progress} from '../lib/game/progress.ts';
import {encodeProgress} from '../lib/game/progress-codec.ts';
import {playableJourney,revisionSave} from '../lib/game/journey-revisions.ts';
import {writeStoredProgress,readStoredProgress} from '../lib/game/progress-storage.ts';
import {CloudProgress,ProgressUpgradeRequired} from '../lib/game/cloud.ts';
import {fixture} from './fixtures.ts';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {authoredRevision,AUTHORED_JOURNEY} from '../lib/game/authored-journey.ts';
import {chapterVeils} from '../lib/game/world-presentation.ts';
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/journey-legacy-revision-two.json',import.meta.url),'utf8')).fixtures;
it('opens all twelve frozen 0.57.7 local/cloud saves on their original rev2 grid and reversed paths',async()=>{
 const db=fixture();try{const cloud=new CloudProgress(db.db,db.clock,256000,true);
 for(const [index,f] of fixtures.entries()){
  const p=f.progress as Progress,owner='frozen-'+index,key='route:'+f.id;
  assert.deepEqual(progressBoard(key,2),f.board);assert.equal(playableJourney(f.id,p,true)?.revision,2);
  const map=new Map<string,string>(),store={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};
  writeStoredProgress(store,owner,p);assert.deepEqual(readStoredProgress(store,owner),p);
  await cloud.save(owner,JSON.parse(encodeProgress(p)),3);assert.deepEqual((await cloud.read(owner,3)).progress,p);
  assert.equal(playableJourney(f.id,emptyProgress(),true)?.revision,3);assert.notDeepEqual(progressBoard(key,3),f.board);
 }
 }finally{db.sqlite.close();}
});
it('keeps rev1, rev2 and rev3 histories separate and rejects older cloud readers before modifying bytes',async()=>{
 const key='route:ufuk-gok-1',p=emptyProgress();let combined=p;
 for(const rev of [1,2,3] as const){const b=progressBoard(key,rev)!,q=emptyProgress();q.saves[key]=cleanSave({strokes:b.placements.slice(0,2).map(s=>({...s,a:s.b,b:s.a})),hints:1,elapsed:41,complete:false,stars:0,...(rev>1?{revision:rev as 2|3}:{})},b);combined=mergeProgress(combined,q);}
 assert.deepEqual(readProgress(encodeProgress(combined)),combined);for(const rev of [1,2,3] as const)assert.equal(revisionSave(combined,key,rev)?.strokes.length,2);
 const f=fixture();try{const cloud=new CloudProgress(f.db,f.clock,256000,true);await cloud.save('modern',JSON.parse(encodeProgress(combined)),3,2);const before=f.sqlite.prepare('SELECT * FROM campaign_saves').all();await assert.rejects(cloud.read('modern',3),ProgressUpgradeRequired);await assert.rejects(cloud.save('modern',emptyProgress(),3),ProgressUpgradeRequired);await assert.rejects(cloud.read('modern'),ProgressUpgradeRequired);await assert.rejects(cloud.save('modern',emptyProgress()),ProgressUpgradeRequired);assert.deepEqual(f.sqlite.prepare('SELECT * FROM campaign_saves').all(),before);}finally{f.sqlite.close();}
});
it('matches exact authored target IDs, order, coordinates, clues and concealment for all 312 levels',()=>{
 const source=JSON.parse(readFileSync(new URL('../scripts/journey-content/veri/yerlesim.json',import.meta.url),'utf8'));
 for(const level of source.levels){const id=level.id,rev=authoredRevision(id),board=progressBoard('route:'+id,rev)!,chapter=playableJourney(id,emptyProgress(),true)!,authored=AUTHORED_JOURNEY[id]!;
  assert.deepEqual(authored.placements,level.placements);assert.deepEqual(authored.hiddenIds,level.hiddenIds);assert.deepEqual(chapter.clues??{},level.clues??{});
  assert.deepEqual(board.placements.map(s=>[s.text,...s.a,...s.b]),level.placements);
  if(!level.clues){const veils=chapterVeils(id,board.targets,rev);assert.deepEqual(board.placements.filter(s=>veils[s.group]==='initial').map(s=>s.id).sort(),[...level.hiddenIds].sort());}
 }
});
it('stores a full authored catalogue losslessly within the existing compact cap without widening limits',async()=>{
 const p=emptyProgress();for(const {chapter} of MAIN_JOURNEY){const rev=authoredRevision(chapter.id),key='route:'+chapter.id,b=progressBoard(key,rev)!;p.saves[key]=cleanSave({revision:rev,strokes:b.placements,hints:1,elapsed:100,complete:true,stars:2},b);}
 const raw=encodeProgress(p);assert(Buffer.byteLength(raw)<256000);assert.deepEqual(readProgress(raw),p);
 const map=new Map<string,string>(),store={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};
 writeStoredProgress(store,'full',p);assert.deepEqual(readStoredProgress(store,'full'),p);
 const fixtureDb=fixture();
 try{
  const cloud=new CloudProgress(fixtureDb.db,fixtureDb.clock);
  const saved=await cloud.save('full',JSON.parse(raw),3,2);
  assert.deepEqual(saved.progress,p);
  assert.deepEqual((await cloud.read('full',3,2)).progress,p);
  const ordinary=emptyProgress(),key='route:'+MAIN_JOURNEY[18]!.chapter.id;
  ordinary.saves[key]=p.saves[key]!;
  await cloud.save('new-rev-two',JSON.parse(encodeProgress(ordinary)),3,2);
  await assert.rejects(cloud.save('new-rev-two',emptyProgress(),3,1),ProgressUpgradeRequired);
  await assert.rejects(cloud.read('new-rev-two',3,1),ProgressUpgradeRequired);
  assert.deepEqual((await cloud.read('new-rev-two',3,2)).progress,ordinary);
 }finally{fixtureDb.sqlite.close();}
});
