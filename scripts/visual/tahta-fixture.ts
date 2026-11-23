// Synthetic progress only. The runner copies the completed prefix for each fresh player.
import {MAIN_JOURNEY} from '../../lib/game/main-journey.ts';
import {journeyBoard} from '../../lib/game/content.ts';
import {emptyProgress,cleanSave,PROGRESS_KEY} from '../../lib/game/progress.ts';
import {EXPEDITIONS} from '../../lib/game/discovery.ts';
import {MECHANIC_GUIDES} from '../../lib/game/journey-flow.ts';

const all = process.argv[2] === 'hepsi';
const n = Number(process.argv[2] ?? 118);
if (!all && (!Number.isInteger(n) || n < 1 || n > MAIN_JOURNEY.length)) throw new Error('Bölüm numarası geçersiz.');
const progress = {...emptyProgress(), sound:false, guideDone:true as const, tutorialDone:true,
  welcomedWorlds:EXPEDITIONS.map(world=>world.id), mechanicGuides:[...MECHANIC_GUIDES]};
const ids = MAIN_JOURNEY.map(({chapter})=>chapter.id);
for (const {chapter} of MAIN_JOURNEY.slice(0,all ? ids.length : n-1)) {
  const board = journeyBoard(chapter);
  progress.saves['route:'+chapter.id] = cleanSave({strokes:board.placements,hints:0,elapsed:40,complete:true,stars:3},board);
}
process.stdout.write(JSON.stringify({key:PROGRESS_KEY, ...(all ? {ids} : {id:ids[n-1]}), progress}));
