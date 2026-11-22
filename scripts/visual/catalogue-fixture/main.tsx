// Local QA entry. This directory is never an entry point in the shipped build.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Solo} from '../../../components/game/Solo';
import {MAIN_JOURNEY} from '../../../lib/game/main-journey';
import {emptyProgress,cleanSave,progressBoard} from '../../../lib/game/progress';
import {MECHANIC_GUIDES} from '../../../lib/game/journey-flow';
import '../../../app/game-styles.css';
const root=createRoot(document.getElementById('root')!);
function Chapter({number,published}:{number:number;published:boolean}){
 const item=MAIN_JOURNEY[number-1]!;
 const [progress,setProgress]=useState(()=>{const p=emptyProgress();p.tutorialDone=true;p.guideDone=true;p.mechanicGuides=[...MECHANIC_GUIDES];p.sound=false;p.haptics=false;
 if(published){const key='route:'+item.chapter.id;p.saves[key]=cleanSave(undefined,progressBoard(key)!);}
 return p;});
 Object.assign(window,{qaProgress:progress});
 return <div className="game-app journey-session" data-board-color="white" data-palette="classic"><Solo config={{campaign:true,themeId:item.chapter.themeId,level:0,journey:item.chapter.id}} progress={progress} onProgress={setProgress} onNext={()=>{}} onBack={()=>{}} onMap={()=>{}}/></div>;
}
Object.assign(window,{showChapter:(number:number,published:boolean)=>flushSync(()=>root.render(<Chapter key={String(published)+number} number={number} published={published}/>))});
