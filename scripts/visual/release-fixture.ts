import {MAIN_JOURNEY} from '../../lib/game/main-journey.ts';
import {journeyBoard} from '../../lib/game/content.ts';
import {emptyProgress} from '../../lib/game/progress.ts';
import {presentationBoard} from '../../lib/game/journey-presentation.ts';
import {projectBoard} from '../../lib/game/board-projection.ts';
import {MECHANIC_GUIDES} from '../../lib/game/journey-flow.ts';
const progress={...emptyProgress(),sound:false,guideDone:true,tutorialDone:true,mechanicGuides:[...MECHANIC_GUIDES]};
const chapters=MAIN_JOURNEY.slice(0,6).map(({chapter,number})=>{
 const board=presentationBoard(journeyBoard(chapter),'route:'+chapter.id),projection=projectBoard(board);
 return {id:chapter.id,number,shape:projection.shape,placements:board.placements.map(p=>({...p,a:projection.toView(p.a),b:projection.toView(p.b)}))};
});
process.stdout.write(JSON.stringify({progress,chapters}));
