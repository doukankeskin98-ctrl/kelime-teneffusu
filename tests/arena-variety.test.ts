import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {ARENA_ADDITIONS,ARENA_CLUES,ARENA_LIBRARY} from '../lib/game/arena-library.ts';
import {freshArenaPuzzle,freshEntries,hasFreshRiddles,type WordHistory} from '../lib/game/arena-fresh.ts';
import {RIDDLE_BANKS,riddleId} from '../lib/game/riddle-content.ts';
import {groupRiddlePuzzle} from '../lib/game/group-content.ts';
import {match} from '../lib/game/engine.ts';
import {GameService} from '../lib/game/server.ts';
import {fixture} from './fixtures.ts';

describe('expanded reviewed Arena vocabulary',()=>{
 it('adds630 distinct answers and definitions without replacing144 published clues',()=>{
  assert.equal(ARENA_ADDITIONS.length,630);assert.equal(ARENA_CLUES.length,774);assert.equal(ARENA_LIBRARY.length,919);
  assert.equal(new Set(ARENA_LIBRARY.map(e=>e.word)).size,ARENA_LIBRARY.length);
  assert.equal(new Set(ARENA_CLUES.map(e=>e.clue)).size,ARENA_CLUES.length);
  for(const e of ARENA_LIBRARY){assert(/^[A-ZÇĞİÖŞÜ]{2,8}$/u.test(e.word),e.word);if(e.clue){assert(e.clue.length>=12&&e.clue.length<=110,e.word);assert(!e.clue.toLocaleUpperCase('tr-TR').split(/[^A-ZÇĞİÖŞÜ]+/u).includes(e.word),e.word+' reveals answer');assert(e.riddleId);}}
  for(const b of RIDDLE_BANKS)for(const [word,clue] of b.items){const e=ARENA_CLUES.find(e=>e.word===word)!;assert.equal(e.clue,clue);assert.equal(e.riddleId,riddleId(b.themeId,word));}
 });
 it('places every dictionary answer in complete seven-target boards with both diagonal slopes',()=>{
  // Content-wide placement coverage, not a count of theoretical combinations.
  const history:WordHistory[]=[],placed=new Set<string>();let ordinal=0;
  while(placed.size<ARENA_LIBRARY.length){const candidate=freshArenaPuzzle(ordinal++,{group:true,history});assert(ordinal<500,'bounded coverage');if(!candidate)continue;
   assert.equal(candidate.board.size,9);assert.equal(candidate.board.targets.length,7);
   for(const p of candidate.board.placements){assert.equal(match(candidate.board,p.a,p.b)?.id,p.id);placed.add(p.text);const h=history.find(h=>h.word===p.text);if(h){h.uses++;h.lastSeen=ordinal;}else history.push({word:p.text,uses:1,lastSeen:ordinal,recent:0});}
  }
  assert.equal(placed.size,919);
 });
 it('prefers unseen, then cool least-used/oldest words and supports mixed-history library exhaustion',()=>{
  const history=ARENA_LIBRARY.map((e,i)=>({word:e.word,uses:2,lastSeen:i+1,recent:0}));
  history[0]!.uses=0;history[1]!.uses=1;history[2]!.uses=1;history[1]!.lastSeen=500;history[2]!.lastSeen=400;
  const selected=freshEntries(1,{group:true,history});assert.equal(selected[0]!.word,history[0]!.word);assert.equal(selected[1]!.word,history[2]!.word);assert.equal(selected[2]!.word,history[1]!.word);
  for(const h of history)h.recent=1;assert(freshArenaPuzzle(2,{group:true,history}),'no-new-word fallback still produces a complete board');
  const excluded=freshArenaPuzzle(0,{group:true,clue:true,usedRiddleIds:RIDDLE_BANKS.flatMap(b=>b.items.map(([w])=>riddleId(b.themeId,w)))})!;
  assert(excluded&&hasFreshRiddles(RIDDLE_BANKS.flatMap(b=>b.items.map(([w])=>riddleId(b.themeId,w)))));
  assert(excluded.words.every(w=>!RIDDLE_BANKS.some(b=>b.items.some(i=>i[0]===w))));
 });
});

describe('one lasting content history across rooms and Arena modes',()=>{
 it('shows350+ different words over54 room exits/reentries, alternating quick/private and ranked duel with service reloads',async()=>{
  const f=fixture(),seen=new Set<string>();let shown=0;
  try{for(let n=0;n<54;n++){
   const game=new GameService(f.db,f.clock),duel=n%9===8,kind=n%2?'quick':'friend',a=(await game.enter('returning-a',kind,undefined,!duel))!;
   const b=(await game.enter('returning-b',kind,kind==='friend'?a.code:undefined,!duel))!;assert.equal(b.id,a.id);
   await game.ready('returning-a',a.id,1);const ready=await game.ready('returning-b',a.id,1);const active=duel?ready:await game.start('returning-a',a.id,1);
   assert.equal(active.board!.size,duel?8:9);assert.equal(active.board!.targets.length,duel?6:7);
   for(const t of active.board!.targets){assert(!seen.has(t.text),`repeat after reentry ${n}: ${t.text}`);seen.add(t.text);shown++;}
   const peer=await new GameService(f.db,f.clock).state('returning-b');assert.deepEqual(peer!.board,active.board);
   // Some rounds are played to a real win, others abandoned after seeing the board.
   f.advance(4000);if(n%3===0){for(const p of f.puzzle(a.id).placements)await game.claim('returning-a',a.id,p.a,p.b,1);}else f.advance(2000);
   await game.leave('returning-a',a.id,1);await game.leave('returning-b',a.id,1);assert.equal(await game.state('returning-a'),null);f.advance(1000);
  }
  assert.equal(shown,372);assert.equal(seen.size,shown);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM arena_seen WHERE user_id=?').get('returning-a')!['n'],54);
  }finally{f.sqlite.close();}
 });
 it('uses old receipts and the history of every participant even when the host is new',async()=>{
  const f=fixture();try{
   const old=groupRiddlePuzzle(0)!;f.sqlite.prepare('INSERT INTO arena_seen VALUES(?,?,?,?,?,?)').run('veteran',old.wordsKey,old.gridKey,'expired-v2-room',1,f.clock()-100000);
   const room=(await f.game.enter('new-host','friend',undefined,true))!;await f.game.enter('veteran','friend',room.code);await f.game.ready('new-host',room.id,1);await f.game.ready('veteran',room.id,1);
   const active=await f.game.start('new-host',room.id,1);assert(active.board!.targets.every(t=>!old.words.includes(t.text)));assert.equal(f.sqlite.prepare('SELECT count(*) n FROM arena_seen WHERE user_id=?').get('veteran')!['n'],2);
  }finally{f.sqlite.close();}
 });
 it('unions disjoint player histories and respects each participant last12 rather than the group last12',async()=>{
  const f=fixture();try{
   const historical=new Set<string>();const add=(u:string,words:string[],n:number,time:number)=>{for(const w of words)historical.add(w);f.sqlite.prepare('INSERT INTO arena_seen VALUES(?,?,?,?,?,?)').run(u,JSON.stringify(words),'grid-'+u+n,'old-'+u+n,1,time);};
   for(let i=0;i<20;i++)add('busy',ARENA_LIBRARY.slice(i*7,i*7+7).map(e=>e.word),i,f.clock()-1000+i);
   add('quiet',ARENA_LIBRARY.slice(200,207).map(e=>e.word),0,f.clock()-50000);
   const room=(await f.game.enter('quiet','friend',undefined,true))!;await f.game.enter('busy','friend',room.code);for(const u of ['quiet','busy'])await f.game.ready(u,room.id,1);
   const v=await f.game.start('quiet',room.id,1);assert(v.board!.targets.every(t=>!historical.has(t.text)));
  }finally{f.sqlite.close();}
 });
 it('handles malformed legacy receipt keys without discarding the valid permanent history',async()=>{
  const f=fixture();try{const room=(await f.game.enter('a','friend',undefined,true))!;await f.game.enter('b','friend',room.code);
   for(const [i,key] of ['not-json','{}','null','"text"'].entries())f.sqlite.prepare('INSERT INTO arena_seen VALUES(?,?,?,?,?,?)').run('a',key,'old-grid-'+i,'old',i,f.clock());
   for(const u of ['a','b'])await f.game.ready(u,room.id,1);assert.equal((await f.game.start('a',room.id,1)).board!.targets.length,7);
  }finally{f.sqlite.close();}
 });
});

it('escapes an oldest least-used set already seen instead of retrying the same seven words forever',async()=>{
 const f=fixture();try{
  const oldest=ARENA_CLUES.slice(0,7).map(e=>e.word),key=JSON.stringify([...oldest].sort());
  f.sqlite.prepare('INSERT INTO arena_seen VALUES(?,?,?,?,?,?)').run('veteran',key,'old-set-grid','old-seven',1,1);
  for(const [i,e] of ARENA_CLUES.slice(7).entries())f.sqlite.prepare('INSERT INTO arena_seen VALUES(?,?,?,?,?,?)').run('veteran',JSON.stringify([e.word]),'single-'+i,'old-single-'+i,1,i+2);
  const room=(await f.game.enter('new','friend',undefined,true))!;await f.game.enter('veteran','friend',room.code);for(const u of ['new','veteran'])await f.game.ready(u,room.id,1);
  const active=await f.game.start('new',room.id,1);assert.equal(active.phase,'active');assert(active.contentOrdinal!>0);assert.notEqual(JSON.stringify(active.board!.targets.map(t=>t.text).sort()),key);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM arena_seen WHERE user_id=?').get('veteran')!['n'],ARENA_CLUES.length-7+2);
 }finally{f.sqlite.close();}
});
