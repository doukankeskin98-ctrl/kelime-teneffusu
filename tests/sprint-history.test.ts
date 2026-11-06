import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {emptySprintHistory,parseSprintHistory,rememberSprintBoard,sprintHistoryKey,variedSprintBoard} from '../lib/game/sprint-history.ts';
import {ACTIVE_SPRINT_WORDS as SPRINT_WORDS} from '../lib/game/sprint-vocabulary.ts';
import {freshSprint,sprintReducer} from '../lib/game/sprint.ts';
import {match} from '../lib/game/engine.ts';

describe('fresh fast play survives leaving and reloading',()=>{
 it('keeps the last four unseen long words on a six-by-six board without forcing conflicting diagonals',()=>{
  const last=new Set(['BARAJ','BASKET','BAŞLIK','BATERİ']),history=emptySprintHistory();history.sequence=200;
  for(const w of SPRINT_WORDS)if(!last.has(w))history.words[w]={uses:1,last:1};
  const board=variedSprintBoard(91,0,history);assert.equal(board.size,6);
  assert.deepEqual(new Set(board.targets.map(t=>t.text)),last);
  for(const p of board.placements)assert.equal(match(board,p.a,p.b)?.id,p.id);
 });
 it('uses new actual targets across 100 abandoned/reloaded sessions even with the same seed',()=>{
  let history=emptySprintHistory();const seen=new Set<string>();
  for(let run=0;run<100;run++){
   const state=sprintReducer(freshSprint(1),{type:'start',now:run*1000,history});
   assert.equal(state.board.size,6);assert.equal(state.board.targets.length,4);
   for(const p of state.board.placements){assert.equal(match(state.board,p.a,p.b)?.id,p.id);assert(!seen.has(p.text),p.text+' repeated after reload');seen.add(p.text);}
   history=parseSprintHistory(JSON.stringify(state.history));
  }
  assert.equal(seen.size,400);assert.equal(history.sequence,100);
 });
 it('covers the full reviewed vocabulary before balanced reuse, with fresh sets after exhaustion',()=>{
  let history=emptySprintHistory();const seen=new Set<string>(),sets=new Set<string>();
  for(let run=0;run<220;run++){
   const board=variedSprintBoard(77,0,history),unseenBefore=SPRINT_WORDS.filter(w=>!seen.has(w));
   const words=board.targets.map(t=>t.text);if(unseenBefore.length>=4)for(const w of words)assert(!seen.has(w));
   else if(unseenBefore.length)for(const w of unseenBefore)assert(words.includes(w));
   const key=[...words].sort().join('|');assert(!sets.has(key));sets.add(key);words.forEach(w=>seen.add(w));
   history=parseSprintHistory(JSON.stringify(rememberSprintBoard(history,board)));
  }
  assert.equal(seen.size,SPRINT_WORDS.length);assert(Math.max(...Object.values(history.words).map(w=>w.uses))<=2);
 });
 it('records transition boards once and keeps score, clock and duplicate selection rules',()=>{
  let state=sprintReducer(freshSprint(13),{type:'start',now:0});state=sprintReducer(state,{type:'tick',now:3000});
  for(const p of state.board.placements)state=sprintReducer(state,{type:'select',now:3100,a:p.a,b:p.b});
  assert.equal(state.history.sequence,1);const {score,ends}=state;
  state=sprintReducer(state,{type:'tick',now:state.nextAt});assert.equal(state.history.sequence,2);
  state=sprintReducer(state,{type:'tick',now:4000});assert.equal(state.history.sequence,2);assert.equal(state.score,score);assert.equal(state.ends,ends);
  assert.equal(new Set(Object.keys(state.history.words)).size,8);
 });
 it('does not reuse an already recorded exact set even when low-use priorities tie',()=>{
  const history=emptySprintHistory(),first=variedSprintBoard(5,0,history);
  history.sets=[first.targets.map(t=>t.text).sort().join('|')];
  assert.notDeepEqual(variedSprintBoard(5,0,history).targets.map(t=>t.text).sort(),first.targets.map(t=>t.text).sort());
 });
 it('isolates owners, rejects malformed receipts and bounds history without touching old record keys',()=>{
  assert.notEqual(sprintHistoryKey('one'),sprintHistoryKey('two'));assert.notEqual(sprintHistoryKey(),sprintHistoryKey('one'));
  for(const raw of [null,'bad','{}','{"v":2,"sequence":1}','{"v":1,"sequence":-1}'])assert.deepEqual(parseSprintHistory(raw),emptySprintHistory());
  const word=SPRINT_WORDS[0]!,raw=JSON.stringify({v:1,sequence:1,words:{[word]:{uses:1,last:2},unknown:{uses:2,last:0}},sets:['bad']});
  assert.deepEqual(parseSprintHistory(raw),{v:1,sequence:1,words:{},sets:[]});
 });
});
