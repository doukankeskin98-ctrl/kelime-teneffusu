import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {fixture} from './fixtures.ts';
import {AdminStore,ChapterStore,nativeAdminIdentity} from '../lib/studio/store.ts';
import {NEW_CHAPTER,checkChapter,StudioError} from '../lib/studio/content.ts';
import {recordOperationalFault} from '../lib/studio/health.ts';
import {digest} from '../lib/game/security.ts';
import type {SavedLevel} from '../lib/game/progress.ts';

const token='a'.repeat(64);
async function setup(){const f=fixture(),config={hash:await digest('kelime-admin-setup-v1:'+token),expiresAt:String(f.clock()+86400000)},admin=new AdminStore(f.db,config,f.clock),chapters=new ChapterStore(f.db,f.clock);await admin.claim('owner',token);return {...f,admin,chapters,config};}
async function published(){const f=await setup(),draft=await f.admin.saveDraft('owner',NEW_CHAPTER),chapter=await f.admin.transition('owner',draft.id,'publish',draft.revision,draft.spec.title);return {...f,chapter};}
const denied=(status:number)=>(e:unknown)=>e instanceof StudioError&&e.status===status;
const saved=(strokes:SavedLevel['strokes'],hints=0,elapsed=20):SavedLevel=>({strokes,hints,elapsed,complete:true,stars:99});

describe('admin identity and one-use owner enrollment',()=>{
 it('fails closed without configuration, native identity, a correct token or an unexpired enrollment',async()=>{
  const f=fixture(),empty=new AdminStore(f.db,{},f.clock);await assert.rejects(()=>empty.claim('visitor',token),denied(403));
  const valid=new AdminStore(f.db,{hash:await digest('kelime-admin-setup-v1:'+token),expiresAt:String(f.clock()+1000)},f.clock);await assert.rejects(()=>valid.claim(null,token),denied(401));await assert.rejects(()=>valid.claim('visitor','b'.repeat(64)),denied(403));f.advance(1001);await assert.rejects(()=>valid.claim('visitor',token),denied(403));assert.equal((await valid.session(null)).setupAvailable,false);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM admin_owners').get()!['n'],0);
  assert.equal(nativeAdminIdentity(new Request('https://game.test',{headers:{authorization:'Bearer something','x-user-role':'owner'}})),null);assert.equal(nativeAdminIdentity(new Request('https://game.test',{headers:{'oai-authenticated-user-id':'native-owner'}})),'native-owner');
 });
 it('allows exactly one owner in simultaneous claims and never exposes the bound identity to another visitor',async()=>{
  const f=fixture(),admin=new AdminStore(f.db,{hash:await digest('kelime-admin-setup-v1:'+token),expiresAt:String(f.clock()+86400000)},f.clock),attempts=await Promise.allSettled([admin.claim('alice',token),admin.claim('bob',token)]);assert.equal(attempts.filter(a=>a.status==='fulfilled').length,1);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM admin_owners').get()!['n'],1);assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM admin_audit').get()!['n'],1);
  const owner=f.sqlite.prepare('SELECT user_id FROM admin_owners').get()!['user_id'] as string;assert.equal((await admin.session(owner)).authorized,true);const other=await admin.session('someone-else');assert.equal(other.authorized,false);assert.equal(other.setupAvailable,false);assert(!JSON.stringify(other).includes(owner));await assert.rejects(()=>admin.claim('someone-else',token),denied(409));await admin.claim(owner,token);assert.equal((await admin.audit(owner)).rows.length,1);
 });
 it('authorizes every administrative read and mutation on the server, independently of UI state',async()=>{
  const f=await setup();for(const actor of [null,'guest','other-native']){const status=actor?403:401;for(const action of [()=>f.admin.overview(actor),()=>f.admin.metrics(actor),()=>f.admin.faults(actor),()=>f.admin.audit(actor),()=>f.admin.chapters(actor),()=>f.admin.chapter(actor,'bad'),()=>f.admin.preview(actor,NEW_CHAPTER),()=>f.admin.saveDraft(actor,NEW_CHAPTER),()=>f.admin.transition(actor,'bad','publish',1,'title'),()=>f.admin.reviewFault(actor,'2026-10-21','game','unexpected_server_error')])await assert.rejects(action,denied(status));}
 });
});
describe('immutable publication and audited content editing',()=>{
 it('retries a new draft without duplicating the chapter or its audit record',async()=>{
  const f=await setup(),creationId=crypto.randomUUID(),draft=await f.admin.saveDraft('owner',NEW_CHAPTER,undefined,undefined,creationId),retry=await f.admin.saveDraft('owner',NEW_CHAPTER,undefined,undefined,creationId);assert.equal(retry.id,draft.id);assert.equal(retry.revision,1);assert.equal((await f.admin.chapters('owner')).total,1);assert.equal((await f.admin.audit('owner')).rows.length,2);await assert.rejects(()=>f.admin.saveDraft('owner',{...NEW_CHAPTER,note:'Başka içerik.'},undefined,undefined,creationId),denied(409));await assert.rejects(()=>f.admin.saveDraft('owner',NEW_CHAPTER,''),denied(404));
 });
 it('validates meaningful Turkish content, both diagonal slopes and twenty alternative layouts',()=>{
  const checked=checkChapter(NEW_CHAPTER);assert.equal(checked.checks.alternateLayouts,20);assert.equal(checked.board.size,6);assert.equal(checked.checks.diagonals,true);
  for(const spec of [{...NEW_CHAPTER,words:['MERAK','MERAK','KEŞİF']},{...NEW_CHAPTER,words:['<script>','MERAK','KEŞİF']},{...NEW_CHAPTER,size:20},{...NEW_CHAPTER,words:['GÖZLEMEVİ','MERAK','KEŞİF'],size:6},{...NEW_CHAPTER,themeId:'unknown'}])assert.throws(()=>checkChapter(spec),StudioError);
 });
 it('keeps drafts private, requires the exact confirmation, and records only committed operations',async()=>{
  const f=await setup(),draft=await f.admin.saveDraft('owner',NEW_CHAPTER);assert.equal((await f.chapters.catalogue()).total,0);await assert.rejects(()=>f.chapters.playable(draft.id),denied(404));await assert.rejects(()=>f.chapters.progress('player',draft.id),denied(404));await assert.rejects(()=>f.admin.transition('owner',draft.id,'publish',draft.revision,'wrong title'),denied(400));assert.equal((await f.admin.audit('owner')).rows.length,2);
  const live=await f.admin.transition('owner',draft.id,'publish',draft.revision,draft.spec.title);assert.equal((await f.chapters.catalogue()).total,1);assert.deepEqual((await f.chapters.playable(live.id)).board,draft.board);assert.equal((await f.admin.audit('owner')).rows.length,3);
 });
 it('rejects a stale editor without an inaccurate audit entry and safely searches Turkish titles and wildcard text',async()=>{
  const f=await setup(),draft=await f.admin.saveDraft('owner',{...NEW_CHAPTER,title:'İnce bir keşif'}),attempts=await Promise.allSettled([f.admin.saveDraft('owner',{...draft.spec,note:'Birinci not.'},draft.id,draft.revision),f.admin.saveDraft('owner',{...draft.spec,note:'İkinci not.'},draft.id,draft.revision)]);assert.equal(attempts.filter(a=>a.status==='fulfilled').length,1);assert.equal((await f.admin.audit('owner')).rows.length,3);
  assert.equal((await f.admin.chapters('owner','all','ince')).total,1);assert.equal((await f.admin.chapters('owner','all','%_')).total,0);assert.equal((await f.admin.chapters('owner','all',"' OR 1=1 --")).total,0);
 });
 it('preserves published boards and saves when archiving or restoring and refuses edits to both states',async()=>{
  const f=await published(),live=f.chapter;await f.chapters.saveProgress('player',live.id,saved([live.board.placements[0]!]));await assert.rejects(()=>f.admin.saveDraft('owner',{...live.spec,title:'Changed'},live.id,live.revision),denied(409));const archived=await f.admin.transition('owner',live.id,'archive',live.revision,live.spec.title);assert.equal((await f.chapters.catalogue()).total,0);assert.deepEqual((await f.chapters.playable(live.id)).board,live.board);assert.equal((await f.chapters.progress('player',live.id)).save.strokes.length,1);await assert.rejects(()=>f.admin.saveDraft('owner',live.spec,live.id,archived.revision),denied(409));const restored=await f.admin.transition('owner',live.id,'restore',archived.revision,live.spec.title);assert.equal((await f.chapters.catalogue()).total,1);assert.equal(restored.contentHash,live.contentHash);assert.equal(restored.publishedAt,live.publishedAt);assert.deepEqual(restored.board,live.board);
 });
});
describe('real player progress and truthful management data',()=>{
 it('validates strokes, merges concurrent devices, retains the first completion date and isolates identities',async()=>{
  const f=await published(),chapter=f.chapter,placements=chapter.board.placements;const fake=await f.chapters.saveProgress('alice',chapter.id,saved([]));assert.equal(fake.save.complete,false);assert.equal(fake.save.stars,0);
  await Promise.all([f.chapters.saveProgress('alice',chapter.id,saved([placements[0]!])),f.chapters.saveProgress('alice',chapter.id,saved([placements[1]!]))]);assert.equal((await f.chapters.progress('alice',chapter.id)).save.strokes.length,2);assert.equal((await f.chapters.progress('bob',chapter.id)).save.strokes.length,0);
  const complete=await f.chapters.saveProgress('alice',chapter.id,saved(placements,0,30));assert.equal(complete.save.stars,3);const first=f.clock();f.advance(86400000);await f.chapters.saveProgress('alice',chapter.id,saved(placements,3,2));const retained=await f.chapters.progress('alice',chapter.id);assert.equal(retained.save.elapsed,30);assert.equal(retained.save.stars,3);assert.equal(f.sqlite.prepare('SELECT completed_at FROM chapter_saves').get()!['completed_at'],first);assert.equal((await f.game.rating('alice')).played,0);
 });
 it('counts actual profiles, completed duels, unique duel players and opted-in metric events without fake activity',async()=>{
  const f=await setup();await f.game.rename('alice','Alice');await f.game.rename('bob','Bob');for(const [id,user,at] of [['one','alice',f.clock()],['one','bob',f.clock()],['old','alice',f.clock()-2*86400000]] as const)f.sqlite.prepare('INSERT INTO results(room_id,user_id,nickname,score,win,created) VALUES(?,?,?,100,1,?)').run(id,user,user,at);
  f.sqlite.prepare("INSERT INTO metrics(day,event,bucket,count) VALUES('2026-10-21','level_start','count',7)").run();const overview=await f.admin.overview('owner');assert.equal(overview.profiles,2);assert.equal(overview.finishedDuels,1);assert.equal(overview.duelPlayers,2);assert.equal(overview.trend.length,7);assert.equal(overview.trend.at(-1)!.duels,1);assert.equal((await f.admin.metrics('owner')).rows[0]!.count,7);assert.equal((await f.admin.faults('owner')).rows.length,0);
 });
 it('records sanitized operational counters, audits review and reopens only new occurrences',async()=>{
  const f=await setup();await recordOperationalFault(f.db,'game',f.clock());f.advance(1000);await recordOperationalFault(f.db,'game',f.clock());let fault=(await f.admin.faults('owner')).rows[0]!;assert.equal(fault.count,2);assert.equal(fault.reviewed_count,0);await f.admin.reviewFault('owner',fault.day,fault.area,fault.code);await assert.rejects(()=>f.admin.reviewFault('owner',fault.day,fault.area,fault.code),denied(409));assert.equal((await f.admin.overview('owner')).unreviewedFaults,0);f.advance(1000);await recordOperationalFault(f.db,'game',f.clock());fault=(await f.admin.faults('owner')).rows[0]!;assert.equal(fault.count,3);assert.equal(fault.reviewed_count,2);assert.equal((await f.admin.overview('owner')).unreviewedFaults,1);assert.equal((await f.admin.audit('owner')).rows.length,2);assert.deepEqual(Object.keys(fault).sort(),['day','area','code','count','reviewed_count','first_seen','last_seen'].sort());
 });
});
