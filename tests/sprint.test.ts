import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {CHAIN_WINDOW,freshSprint,parseSprintBest,sprintBoard,sprintReducer} from '../lib/game/sprint.ts';
import {match} from '../lib/game/engine.ts';
const active=()=>sprintReducer(sprintReducer(freshSprint(914),{type:'start',now:1000}),{type:'tick',now:4000});
describe('local fast play rules',()=>{
 it('generates reproducible small boards with four solvable words and changes between rounds',()=>{
  for(let seed=0;seed<40;seed++){const board=sprintBoard(seed,0);assert.equal(board.targets.length,4);assert.equal(board.size,6);for(const p of board.placements)assert.equal(match(board,p.a,p.b)?.id,p.id);assert.deepEqual(board,sprintBoard(seed,0));assert.notDeepEqual(board.grid,sprintBoard(seed,1).grid);}
 });
 it('rejects countdown input and scores each valid word only once',()=>{
  const ready=freshSprint(914),count=sprintReducer(ready,{type:'start',now:1000}),p=count.board.placements[0]!;
  assert.equal(sprintReducer(count,{type:'select',a:p.a,b:p.b,now:3999}).score,0);
  const state=sprintReducer(active(),{type:'select',a:p.a,b:p.b,now:4100});assert.equal(state.score,p.text.length*10);assert.equal(state.words,1);
  assert.equal(sprintReducer(state,{type:'select',a:p.a,b:p.b,now:4200}),state);
 });
 it('scores a cleared board once, blocks transition taps, then opens a fresh board',()=>{
  let s=active();const placements=s.board.placements;
  for(let i=0;i<4;i++){const p=placements[i]!;s=sprintReducer(s,{type:'select',a:p.a,b:p.b,now:4100+i*300});}
  assert.equal(s.words,4);assert.equal(s.round,1);assert.equal(s.chain,4);assert(s.nextAt>0);
  const before=s.score,p=placements[0]!;s=sprintReducer(s,{type:'select',a:p.a,b:p.b,now:5100});assert.equal(s.score,before);
  s=sprintReducer(s,{type:'tick',now:s.nextAt});assert.equal(s.strokes.length,0);assert.equal(s.nextAt,0);assert.notDeepEqual(s.board.grid,active().board.grid);
 });
 it('expires chains without losing earned points and rejects deadline input',()=>{
  let s=active();let p=s.board.placements[0]!;s=sprintReducer(s,{type:'select',a:p.a,b:p.b,now:4100});p=s.board.placements[1]!;
  s=sprintReducer(s,{type:'select',a:p.a,b:p.b,now:4100+CHAIN_WINDOW+1});assert.equal(s.chain,1);
  const before=s.score;s=sprintReducer(s,{type:'select',a:p.a,b:p.b,now:s.ends});assert.equal(s.phase,'finished');assert.equal(s.score,before);
 });
 it('resets a chain after a miss and catches up after background time',()=>{
  let s=active();const p=s.board.placements[0]!;s=sprintReducer(s,{type:'select',a:p.a,b:p.b,now:4100});const score=s.score;
  s=sprintReducer(s,{type:'select',a:[0,0],b:[0,0],now:4200});assert.equal(s.chain,0);assert.equal(s.score,score);
  s=sprintReducer(s,{type:'tick',now:90000});assert.equal(s.phase,'finished');assert.equal(s.score,score);
 });
 it('accepts only bounded integer device records',()=>{
  for(const raw of [null,'oops','{}','-1','1.5','1000000'])assert.equal(parseSprintBest(raw),0);assert.equal(parseSprintBest('1450'),1450);
 });
});
