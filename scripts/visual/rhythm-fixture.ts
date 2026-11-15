import {MAIN_JOURNEY} from '../../lib/game/main-journey.ts';
import {journeyBoard} from '../../lib/game/content.ts';
import {emptyProgress,cleanSave} from '../../lib/game/progress.ts';
import {presentationBoard} from '../../lib/game/journey-presentation.ts';
import {projectBoard} from '../../lib/game/board-projection.ts';
import {bonusBoard} from '../../lib/game/journey-bonus.ts';
const progress={...emptyProgress(),sound:false,guideDone:true,tutorialDone:true,mechanicGuides:['riddle','concealed']};
const worlds=structuredClone(progress);
for(const {chapter} of MAIN_JOURNEY.slice(0,5))worlds.saves['route:'+chapter.id]=cleanSave({strokes:journeyBoard(chapter).placements,elapsed:20,hints:0,complete:false,stars:0},journeyBoard(chapter));
function fixture(board:ReturnType<typeof journeyBoard>,key:string){const display=presentationBoard(board,key),p=projectBoard(display);return {shape:p.shape,placements:display.placements.map(s=>({...s,a:p.toView(s.a),b:p.toView(s.b)}))};}
const chapters=MAIN_JOURNEY.slice(0,6).map(({chapter,number})=>({id:chapter.id,number,...fixture(journeyBoard(chapter),'route:'+chapter.id)}));
process.stdout.write(JSON.stringify({progress,worlds,chapters,bonus:fixture(bonusBoard('uzay'),'bonus:uzay')}));
