// Prints a valid local save with every main chapter complete, so a layout audit can
// open any chapter. It only builds a fixture; it never reads or writes a player save.
import {journeyBoard} from '../../lib/game/content.ts';
import {EXPEDITIONS} from '../../lib/game/discovery.ts';
import {MECHANIC_GUIDES} from '../../lib/game/journey-flow.ts';
import {MAIN_JOURNEY} from '../../lib/game/main-journey.ts';
import {emptyProgress, loadProgress, PROGRESS_KEY} from '../../lib/game/progress.ts';

const progress = {...emptyProgress(), tutorialDone: true, guideDone: true as const,
  welcomedWorlds: EXPEDITIONS.map(world => world.id), mechanicGuides: [...MECHANIC_GUIDES]};
for (const {chapter} of MAIN_JOURNEY) {
  const board = journeyBoard(chapter);
  progress.saves['route:' + chapter.id] = {strokes: board.placements.map(p => ({id: p.id, a: p.a, b: p.b})), elapsed: 60, hints: 0, complete: true, stars: 3};
}
const value = JSON.stringify(progress);
const accepted = Object.values(loadProgress(value).saves).filter(save => save.complete).length;
if (accepted !== MAIN_JOURNEY.length) throw new Error(`Kayıt yükleyicisi ${accepted}/${MAIN_JOURNEY.length} bölümü kabul etti.`);
process.stdout.write(JSON.stringify({key: PROGRESS_KEY, value,
  chapters: MAIN_JOURNEY.map(item => ({number: item.number, id: item.chapter.id, world: Math.floor((item.number - 1) / 6), position: (item.number - 1) % 6}))}));
