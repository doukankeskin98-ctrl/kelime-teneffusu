import {MAIN_JOURNEY} from '../../lib/game/main-journey.ts';
import {journeyBoard} from '../../lib/game/content.ts';
import {emptyProgress,cleanSave} from '../../lib/game/progress.ts';
import {presentationBoard} from '../../lib/game/journey-presentation.ts';
import {releaseCatalogue} from '../../lib/studio/releases.ts';
import {projectBoard} from '../../lib/game/board-projection.ts';

const progress={...emptyProgress(),sound:false,guideDone:true,tutorialDone:true,welcomedWorlds:['uzay','turkiye']};
for(const {chapter} of MAIN_JOURNEY.slice(0,8)){
 const board=journeyBoard(chapter);
 progress.saves['route:'+chapter.id]=cleanSave({strokes:board.placements,hints:0,elapsed:20,complete:false,stars:0},board);
}
const beforeEighth={...progress,saves:{...progress.saves}};
const eighth=MAIN_JOURNEY[7]!.chapter,eighthBoard=journeyBoard(eighth),eighthKey='route:'+eighth.id;
beforeEighth.saves[eighthKey]=cleanSave({strokes:eighthBoard.placements.slice(1),elapsed:15,hints:0,complete:false,stars:0},eighthBoard);
const presented=presentationBoard(eighthBoard,eighthKey),eighthView=projectBoard(presented);
const remaining=presented.placements.find(p=>p.id===eighthBoard.placements[0]!.id)!;
const ordinaryFinale={progress:beforeEighth,shape:eighthView.shape,word:{a:eighthView.toView(remaining.a),b:eighthView.toView(remaining.b)}};
const {chapter}=MAIN_JOURNEY[8]!;
const key='route:'+chapter.id,canonical=journeyBoard(chapter);
const board=presentationBoard(canonical,key),view=projectBoard(board);
const first=canonical.placements.find(word=>word.id===board.placements[0]!.id)!;
progress.saves[key]=cleanSave({strokes:[first],hints:0,elapsed:3,complete:false,stars:0},canonical);
console.log(JSON.stringify({progress,ordinaryFinale,catalogue:releaseCatalogue(0,Date.UTC(2026,10,18)),shape:view.shape,words:board.placements.map(w=>({...w,a:view.toView(w.a),b:view.toView(w.b)}))}));
