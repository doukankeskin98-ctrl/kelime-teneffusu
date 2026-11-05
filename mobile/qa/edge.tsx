// Simulator-only entry. Normal builds start at mobile/index.html.
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Solo} from '@/components/game/Solo';
import {journeyBoard,journeyById} from '@/lib/game/content';
import {cleanSave,emptyProgress} from '@/lib/game/progress';
import '@/app/game-styles.css';

const chapter=journeyById('hababam-3')!;
const board=journeyBoard(chapter);
function initialProgress(){
 const progress=emptyProgress();
 progress.saves['route:'+chapter.id]=cleanSave({
  strokes:board.placements.filter(p=>p.label==='İNEK ŞABAN'||p.label==='HAFİZE ANA'),
  hints:3,elapsed:104,complete:false,stars:0
 },board);
 return progress;
}
function EdgeFixture(){
 const [progress,setProgress]=useState(initialProgress);
 return <div className="game-app journey-session" data-board-color="white">
  <Solo config={{themeId:chapter.themeId,level:0,journey:chapter.id,campaign:true}}
   progress={progress} onProgress={setProgress} onBack={()=>{}} onMap={()=>{}} onNext={()=>{}}/>
 </div>;
}
createRoot(document.getElementById('root')!).render(<EdgeFixture/>);
