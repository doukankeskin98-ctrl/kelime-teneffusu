// Isolated development fixture. No player storage, account, network or release entry.
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Solo} from '@/components/game/Solo';
import {MAIN_JOURNEY} from '@/lib/game/main-journey';
import {journeyBoard} from '@/lib/game/content';
import {cleanSave,emptyProgress} from '@/lib/game/progress';
import type {SoloConfig} from '@/components/game/Solo';
import '@/app/game-styles.css';
const number=Number(new URLSearchParams(location.search).get('chapter')??193);
const initial=MAIN_JOURNEY.find(c=>c.number===number)??MAIN_JOURNEY[192]!;
function StudioFixture(){
 const [playing,setPlaying]=useState(true);
 const [config,setConfig]=useState<SoloConfig>({themeId:initial.chapter.themeId,journey:initial.chapter.id,level:0,campaign:true});
 const [progress,setProgress]=useState(()=>{
  const p=emptyProgress();p.guideDone=true;p.tutorialDone=true;p.mechanicGuides=['daily','mystery','concealed','riddle'];
  for(const item of MAIN_JOURNEY.slice(0,initial.number-1)){const b=journeyBoard(item.chapter);p.saves['route:'+item.chapter.id]=cleanSave({strokes:b.placements,elapsed:35,hints:0,stars:3,complete:true},b);}
  return p;
 });
 if(!playing)return <button onClick={()=>setPlaying(true)}>Yerel alıştırmayı aç</button>;
 return <div className="game-app journey-session" data-board-color="white"><Solo key={config.journey} config={config} progress={progress} onProgress={setProgress} onBack={()=>setPlaying(false)} onMap={()=>setPlaying(false)} onNext={setConfig}/></div>;
}
if(import.meta.env.DEV)createRoot(document.getElementById('root')!).render(<StudioFixture/>);
