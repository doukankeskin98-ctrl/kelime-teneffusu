/// <reference types="vite/client" />
// Isolated development fixture. No player storage, account, network or release entry.
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Solo} from '@/components/game/Solo';
import {PlayLayout,MatchTools} from '@/components/game/common';
import {CompetitionHud} from '@/components/game/CompetitionHud';
import {freshArenaPuzzle} from '@/lib/game/arena-fresh';
import {match,type Stroke} from '@/lib/game/engine';
import {MAIN_JOURNEY} from '@/lib/game/main-journey';
import {journeyRevision} from '@/lib/game/journey-revisions';
import {journeyBoard} from '@/lib/game/content';
import {cleanSave,emptyProgress} from '@/lib/game/progress';
import type {SoloConfig} from '@/components/game/Solo';
import '@/app/game-styles.css';
const number=Number(new URLSearchParams(location.search).get('chapter')??193);
const base=MAIN_JOURNEY.find(c=>c.number===number)??MAIN_JOURNEY[192]!;
const revision=new URLSearchParams(location.search).get('revision')==='2'?2:1;
const initial={...base,chapter:journeyRevision(base.chapter.id,revision)??base.chapter};
const arena=new URLSearchParams(location.search).get('arena');
const sampleArena=arena?freshArenaPuzzle(0,{group:true,clue:arena==='riddle',safety:'wide-v1'}):null;
// The real shared competition surface, with synthetic local state. No matchmaking.
function ArenaSurfaceFixture(){
 const [strokes,setStrokes]=useState<Stroke[]>([]),[preview,setPreview]=useState('');
 if(!sampleArena)return null;
 const board=sampleArena.board;
 return <div className="app-shell native-shell native-arena arena-session"><div className="main-area"><main className="main-content arena-is-playing">
  <PlayLayout title="Arena" kicker="Yerel yerleşim kontrolü" scene="stadium" onBack={()=>{}} board={board} strokes={strokes} paused={false} zoom={false} preview={preview} onPreview={setPreview}
   headerAction={<MatchTools finished={false} review={false} zoom={false} onZoom={()=>{}} sound={false} onSound={()=>{}} onHelp={()=>{}}/>}
   wordList={{board,strokes,clues:sampleArena.clues}} wordListKey="qa-arena" onCommit={(a,b)=>{const target=match(board,a,b);if(target)setStrokes(current=>current.some(s=>s.id===target.id)?current:[...current,{id:target.id,a,b}]);}}
   footer={<div className="duel-controls"><button className="text-button">2 kişi · Sıralama</button></div>} aside={null}>
   <CompetitionHud seconds={83} leftLabel={`Sen · ${strokes.length}/7`} leftValue={`${strokes.length*100} puan`} rightLabel="Sıralaman" rightValue="1 / 2" onRank={()=>{}}/><div className="competition-meta" role="status"/>
  </PlayLayout>
 </main></div></div>;
}
function StudioFixture(){
 const [playing,setPlaying]=useState(true);
 const [config,setConfig]=useState<SoloConfig>({themeId:initial.chapter.themeId,journey:initial.chapter.id,level:0,campaign:true});
 const [progress,setProgress]=useState(()=>{
  const p=emptyProgress();if(initial.chapter.revision===2)p.saves['route:'+initial.chapter.id]={...cleanSave(undefined,journeyBoard(initial.chapter)),revision:2};p.guideDone=true;p.tutorialDone=true;p.mechanicGuides=['daily','mystery','concealed','riddle'];
  for(const item of MAIN_JOURNEY.slice(0,initial.number-1)){const b=journeyBoard(item.chapter);p.saves['route:'+item.chapter.id]=cleanSave({strokes:b.placements,elapsed:35,hints:0,stars:3,complete:true},b);}
  return p;
 });
 if(!playing)return <button onClick={()=>setPlaying(true)}>Yerel alıştırmayı aç</button>;
 return <div className="game-app journey-session" data-board-color="white"><Solo key={config.journey} config={config} progress={progress} onProgress={setProgress} onBack={()=>setPlaying(false)} onMap={()=>setPlaying(false)} onNext={setConfig}/></div>;
}
if(import.meta.env.DEV){const root=createRoot(document.getElementById('root')!);root.render(arena?<ArenaSurfaceFixture/>:<StudioFixture/>);import.meta.hot?.dispose(()=>root.unmount());}
