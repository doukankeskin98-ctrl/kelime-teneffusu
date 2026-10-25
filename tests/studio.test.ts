import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fixture} from './fixtures.ts';
import {JOURNEYS,MYSTERIES,TUTORIAL,journeyBoard,mysteryBoard} from '../lib/game/content.ts';
import {cleanSave,emptyProgress,loadProgress,mergeProgress} from '../lib/game/progress.ts';
import {CloudProgress} from '../lib/game/cloud.ts';
import {SocialService} from '../lib/game/social.ts';
import {createGuest,deleteGuest,guestMember,sessionCookie} from '../lib/auth/guest.ts';
import {digest,rateLimit} from '../lib/game/security.ts';
import {eloChange,GameError} from '../lib/game/server.ts';
import {exactLine,hash,makePuzzle,match} from '../lib/game/engine.ts';
import {safeReturnTo} from '../lib/auth/shared.ts';

describe('authored discoveries and compatibility',()=>{
 it('keeps existing campaign layouts byte-identical after adding the authored generator',()=>{
  for(const [theme,level,seed,expected] of [['hababam',0,42,'8fce45e5e028722c19e35262429207614edaec963c1e1d906703c7daf8c52133'],['uzay',4,107,'e978656054aed0e0de39f60ef10b0769aa32c79c6f4945f6a87cbc3dfae8312f'],['turkiye',5,321,'cac8a39b93d6ab1b19318b1a556a207364bdf1ccab30f9aba88dd35a7b2374d9']] as const)assert.equal(createHash('sha256').update(JSON.stringify(makePuzzle(theme,level,seed))).digest('hex'),expected);
 });
 it('opens with a six-cell tutorial and places every authored target on both diagonal slopes',()=>{
  assert.equal(TUTORIAL.size,6);assert.equal(JOURNEYS.filter(j=>!j.id.includes('-atlas-')).length,15);assert.equal(JOURNEYS.length,80);assert.equal(MYSTERIES.length,6);
  for(const board of [TUTORIAL,...JOURNEYS.map(journeyBoard),...MYSTERIES.map(mysteryBoard)]){
   assert.equal(board.targets.length,board.placements.length);const slopes=new Set<number>();
   for(const p of board.placements){assert.equal(match(board,p.a,p.b)?.id,p.id);assert.equal(match(board,p.b,p.a)?.id,p.id);assert(exactLine(p.a,p.b,board.size));if(p.a[0]!==p.b[0]&&p.a[1]!==p.b[1])slopes.add(Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1])));}
   assert(slopes.has(1)&&slopes.has(-1));
  }
  assert(JOURNEYS.filter(j=>j.id.endsWith('-1')).every(j=>journeyBoard(j).size<=6));
 });
 it('retains new discoveries while rejecting forged completions and unknown save keys',()=>{
  const j=JOURNEYS[0]!,b=journeyBoard(j),p=b.placements[0]!,raw={...emptyProgress(),saves:{['route:'+j.id]:{strokes:[p],elapsed:12,hints:0,complete:true,stars:999},'route:unknown':{strokes:[],complete:true}}};
  const loaded=loadProgress(JSON.stringify(raw));assert.equal(loaded.saves['route:'+j.id]?.strokes.length,1);assert.equal(loaded.saves['route:'+j.id]?.complete,false);assert(!loaded.saves['route:unknown']);
 });
 it('merges concurrent solo discoveries without deleting a better completed run or last destination',()=>{
  const key='route:'+JOURNEYS[0]!.id,b=journeyBoard(JOURNEYS[0]!),a=emptyProgress(),c=emptyProgress();a.saves[key]=cleanSave({strokes:[b.placements[0]!],elapsed:5,hints:0,stars:0,complete:false},b);c.saves[key]=cleanSave({strokes:[b.placements[1]!],elapsed:7,hints:1,stars:0,complete:false},b);
  assert.equal(mergeProgress(a,c).saves[key]!.strokes.length,2);
  a.saves[key]=cleanSave({strokes:b.placements,elapsed:20,hints:0,stars:0,complete:false},b);c.saves[key]=cleanSave({strokes:b.placements,elapsed:5,hints:2,stars:0,complete:false},b);a.last={themeId:'hababam',level:0,journey:JOURNEYS[0]!.id};const combined=mergeProgress(a,c);assert.equal(combined.saves[key]!.stars,3);assert.equal(combined.saves[key]!.elapsed,20);assert.deepEqual(combined.last,a.last);
 });
});
describe('private sessions and cloud saves',()=>{
 it('stores only a cryptographic token hash, scopes secure cookies, and expires and revokes guests',async()=>{
  const s=fixture(),created=await createGuest(s.db,'Doğukan',s.clock()),cookie=sessionCookie(created.token),req=new Request('https://game.test/',{headers:{cookie}});
  assert.match(cookie,/Secure; HttpOnly; SameSite=Lax/);assert.equal(created.token.length,64);
  assert.equal((await guestMember(s.db,req,s.clock()))?.userId,created.userId);const row=s.sqlite.prepare('SELECT token_hash FROM game_sessions').get() as {token_hash:string};assert.equal(row.token_hash,await digest(created.token));assert.notEqual(row.token_hash,created.token);
  assert.equal(await guestMember(s.db,new Request('https://game.test/',{headers:{cookie:'__Host-kt-player='+created.token.slice(0,63)+'Z'}}),s.clock()),null);
  assert.equal(await guestMember(s.db,req,s.clock()+91*86400000),null);await deleteGuest(s.db,req);assert.equal(await guestMember(s.db,req,s.clock()),null);
 });
 it('serializes concurrent device saves and isolates each identity from the others',async()=>{
  const s=fixture(),store=new CloudProgress(s.db,s.clock),j=JOURNEYS[0]!,b=journeyBoard(j),key='route:'+j.id,a=emptyProgress(),c=emptyProgress();
  a.saves[key]=cleanSave({strokes:[b.placements[0]!],elapsed:5,hints:0,stars:0,complete:false},b);c.saves[key]=cleanSave({strokes:[b.placements[1]!],elapsed:10,hints:1,stars:0,complete:false},b);
  await Promise.all([store.save('alice',a),store.save('alice',c)]);assert.equal((await store.read('alice')).progress.saves[key]!.strokes.length,2);assert.deepEqual((await store.read('bob')).progress,emptyProgress());assert.equal((await s.game.rating('alice')).played,0);
 });
 it('limits repeated requests and opens a fresh quota at the next server time window',async()=>{
  const s=fixture();for(let i=0;i<3;i++)await rateLimit(s.db,'attempt',3,s.clock(),600000);
  await assert.rejects(()=>rateLimit(s.db,'attempt',3,s.clock(),600000),e=>e instanceof GameError&&e.status===429);s.advance(600000);await rateLimit(s.db,'attempt',3,s.clock(),600000);
 });
 it('preserves only valid friend and challenge invitations through account redirects',()=>{
  assert.equal(safeReturnTo('/?meydan=ABCDEFGH23&evil=https://attacker.test'), '/?meydan=ABCDEFGH23&sekme=arena');assert.equal(safeReturnTo('//attacker.test'),'/');assert(!safeReturnTo('/?arkadas=invalid').includes('arkadas'));
 });
});
describe('real asynchronous challenges',()=>{
 it('uses the same puzzle and server time, exposes a genuine timeline, and never leaks another player’s paths',async()=>{
  const s=fixture(),social=new SocialService(s.db,s.clock);await s.game.rename('alice','Alice');await s.game.rename('bob','Bob');const host=await social.create('alice','uzay');assert.equal(host.ghost,null);assert.equal(host.creator,true);assert(!('placements' in host.board));
  const row=s.sqlite.prepare('SELECT theme_id,level,seed FROM challenges WHERE code=?').get(host.code) as {theme_id:string;level:number;seed:number},board=makePuzzle(row.theme_id,row.level,row.seed);
  for(const p of board.placements){s.advance(1000);await social.claim('alice',host.code,p.a,p.b);}const finished=await social.state('alice',host.code);assert.equal(finished.duration,board.targets.length*1000);
  const challenger=await social.start('bob',host.code);assert.deepEqual(challenger.board,host.board);assert.equal(challenger.ghost?.nickname,'Alice');assert.equal(challenger.ghost?.timeline.length,board.targets.length);assert(!('strokes' in challenger.ghost!));assert.equal(challenger.strokes.length,0);assert.equal(challenger.creator,false);
  await assert.rejects(()=>social.claim('mallory',host.code,board.placements[0]!.a,board.placements[0]!.b));assert.equal((await social.start('bob',host.code)).starts,challenger.starts);
 });
 it('keeps simultaneous claims exactly once and leaves a finished duration unchanged',async()=>{
  const s=fixture(),social=new SocialService(s.db,s.clock),host=await social.create('alice','lezzetler');const row=s.sqlite.prepare('SELECT theme_id,level,seed FROM challenges WHERE code=?').get(host.code) as {theme_id:string;level:number;seed:number},board=makePuzzle(row.theme_id,row.level,row.seed),[a,b]=board.placements;assert(a&&b);s.advance(1000);
  await Promise.all([social.claim('alice',host.code,a.a,a.b),social.claim('alice',host.code,b.a,b.b),social.claim('alice',host.code,a.a,a.b)]);assert.equal((await social.state('alice',host.code)).strokes.length,2);
  s.advance(12345);for(const p of board.placements)await social.claim('alice',host.code,p.a,p.b);const done=await social.state('alice',host.code);assert.equal(done.duration,13345);s.advance(50000);assert.equal((await social.claim('alice',host.code,a.a,a.b)).duration,done.duration);assert.equal((await social.state('alice',host.code)).results.length,1);
 });
 it('rejects expired invitations and keeps unfinished runs off completed result lists',async()=>{
  const s=fixture(),social=new SocialService(s.db,s.clock),host=await social.create('alice','turkiye');assert.equal((await social.preview(host.code)).ready,false);assert.equal(host.results.length,0);s.advance(31*86400000);await assert.rejects(()=>social.start('bob',host.code),e=>e instanceof GameError&&e.status===410);
 });
});
describe('friend consent, ranked fairness and live revisions',()=>{
 it('attributes a delayed timeout result to its actual deadline across the Istanbul weekly boundary',async()=>{
  const s=fixture(Date.parse('2026-10-25T20:57:00Z')),social=new SocialService(s.db,s.clock),room=await s.game.enter('alice','friend');assert(room);await s.game.enter('bob','friend',room.code);await s.game.ready('alice',room.id);const active=await s.game.ready('bob',room.id);s.advance(240000);await s.game.state('bob',room.id);
  const result=s.sqlite.prepare('SELECT created FROM results WHERE user_id=?').get('alice') as {created:number};assert.equal(result.created,active.ends);assert.equal((await social.overview('alice')).weekly[0]!.played,0);
 });
 it('adds friends only after acceptance and keeps history and weekly scores scoped to the viewer',async()=>{
  const s=fixture(),social=new SocialService(s.db,s.clock);await s.game.rename('alice','Alice');await s.game.rename('bob','Bob');await s.game.rename('carol','Carol');const invite=await social.invite('alice');assert.equal((await social.overview('bob')).friends.length,0);await assert.rejects(()=>social.accept('alice',invite.code));await social.accept('bob',invite.code);assert.equal((await social.overview('alice')).friends[0]!.nickname,'Bob');assert.equal((await social.overview('carol')).friends.length,0);assert.equal((await social.overview('carol')).weekly.length,1);await social.remove('carol','alice');assert.equal((await social.overview('alice')).friends.length,1);await social.remove('bob','alice');assert.equal((await social.overview('alice')).friends.length,0);
 });
 it('applies Elo once per ranked round, never changes it for private rooms, and never ranks an unfinished run',async()=>{
  const s=fixture();assert.equal(eloChange(1000,1000,1),16);assert.equal(eloChange(1000,1000,0),-16);assert.equal(eloChange(1000,1000,.5),0);
  const waiting=await s.game.enter('alice','quick');assert(waiting);await s.game.enter('bob','quick');await s.game.ready('alice',waiting.id);await s.game.ready('bob',waiting.id);s.advance(4000);const board=s.puzzle(waiting.id);for(const p of board.placements)await s.game.claim('alice',waiting.id,p.a,p.b);
  await Promise.all([s.game.state('alice',waiting.id),s.game.state('bob',waiting.id)]);assert.deepEqual({...await s.game.rating('alice')},{value:1016,played:1});assert.deepEqual({...await s.game.rating('bob')},{value:984,played:1});assert.equal((await s.game.rankings()).arena[0]!.rating,1016);assert.equal((await s.game.rankings()).arena.length,2);
  await s.game.leave('alice',waiting.id);await s.game.leave('bob',waiting.id);const privateRoom=await s.game.enter('alice','friend');assert(privateRoom);await s.game.enter('bob','friend',privateRoom.code);await s.game.ready('alice',privateRoom.id);await s.game.ready('bob',privateRoom.id);s.advance(124000);await s.game.state('bob',privateRoom.id);assert.equal((await s.game.rating('alice')).played,1);
 });
 it('widens skill matching by actual queue age and returns monotonic room revisions to members only',async()=>{
  const s=fixture();await s.game.profile('alice');s.sqlite.prepare('INSERT INTO ratings(user_id,value,played,updated) VALUES(?,2200,20,?)').run('alice',s.clock());const a=await s.game.enter('alice','quick'),b=await s.game.enter('bob','quick');assert(a&&b);assert.notEqual(a.id,b.id);s.advance(61000);await s.game.state('alice',a.id);const joined=await s.game.state('bob',b.id);assert(joined);assert.equal(joined.phase,'ready');assert.equal((await s.game.state('alice'))?.id,joined.id);
  const before=await s.game.watch('alice',joined.id);await s.game.ready('alice',joined.id);const after=await s.game.watch('alice',joined.id);assert(after.revision>before.revision);assert.equal(after.view.revision,after.revision);await assert.rejects(()=>s.game.watch('mallory',joined.id),e=>e instanceof GameError&&e.status===403);
 });
});
