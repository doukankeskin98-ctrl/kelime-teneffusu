import {emptyProgress} from '../../../lib/game/progress.ts';
import {journeyBoard} from '../../../lib/game/content.ts';
import {MAIN_JOURNEY,mainJourneyChapters,mainJourneyState} from '../../../lib/game/main-journey.ts';
import {worldChapter} from '../../../lib/game/world-presentation.ts';
const fixtures=[0,1,3,5,6,120,312].map(count=>{
 const progress=emptyProgress();progress.tutorialDone=true;
 for(const {chapter} of MAIN_JOURNEY.slice(0,count))progress.saves['route:'+chapter.id]={strokes:journeyBoard(chapter).placements,elapsed:60,hints:0,complete:true,stars:3};
 const current=mainJourneyState(progress).current?.number;
 return{count,progress,chapters:mainJourneyChapters(progress).map(c=>({number:c.number,world:Math.floor((c.number-1)/6)+1,title:worldChapter(c.chapter.id,c.chapter.revision)?.topic??c.chapter.title,state:c.complete?'complete':!c.unlocked?'locked':c.number===current?'current':'playable'}))};
});
process.stdout.write(JSON.stringify(fixtures));
