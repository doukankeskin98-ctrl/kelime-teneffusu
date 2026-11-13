import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import {freshArenaPuzzle} from '../lib/game/arena-fresh.ts';
import {dailyBoard,SAFE_DAILY_FROM} from '../lib/game/daily-board.ts';
import {hash} from '../lib/game/engine.ts';
import {parseSprintHistory,variedSprintBoard} from '../lib/game/sprint-history.ts';

// Digests recorded from 0.48.0 (ce70fba) keep these generators stable in this patch.
// Daily generation needs a date boundary; Arena persists each room's board and
// Sprint is local single-player. New catalogue challenges may use new layouts:
// their already-issued board snapshots are covered by original-catalogue.test.ts.
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,16);

test('daily boards issued before and after the safe boundary are byte-identical to 0.48.0',()=>{
  const boards=[];
  for(let n=-10;n<60;n++) boards.push(dailyBoard(new Date(Date.parse(SAFE_DAILY_FROM)+n*86400000).toISOString().slice(0,10)));
  assert.equal(digest(boards),'b06c8ec070bb4010');
});

test('fresh Arena rounds are byte-identical to 0.48.0 for duel, group and clue modes',()=>{
  const rounds=[];
  for(const group of [true,false]) for(const clue of [true,false]) for(let i=0;i<10;i++) {
    const round=freshArenaPuzzle(hash('digest:'+i)%(2**31),{group,clue});
    rounds.push(round&&[round.board.grid,round.board.placements,round.wordsKey,round.gridKey]);
  }
  assert.equal(digest(rounds),'c9adfe854512653e');
});

test('Sprint rounds are byte-identical to 0.48.0',()=>{
  const history=parseSprintHistory(null),rounds=[];
  for(let seed=0;seed<12;seed++) for(let round=0;round<3;round++) rounds.push(variedSprintBoard(hash('s'+seed),round,history));
  assert.equal(digest(rounds),'c4b76d4b071520fd');
});
