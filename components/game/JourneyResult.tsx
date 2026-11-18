'use client';
import {Star} from 'lucide-react';
import {useLayoutEffect,useRef,type ReactNode} from 'react';
import {journeyGoal,masteryCopy} from '@/lib/game/achievement-view';
import type {DiscoveryReward} from '@/lib/game/discovery';
import type {SavedLevel} from '@/lib/game/progress';
import {mainChapter} from '@/lib/game/main-journey';
import {timeLabel} from '@/lib/game/engine';
import {SceneArt} from './SceneArt';
import {playResultSequence} from '@/lib/game/result-motion';

export function JourneyResult({before,after,rewards,save,best,reward,animateReward=true}:{animateReward?:boolean;reward?:ReactNode;before:ReturnType<typeof journeyGoal>;after:ReturnType<typeof journeyGoal>;rewards:DiscoveryReward[];save:SavedLevel;best?:SavedLevel}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>root.current&&animateReward?playResultSequence(root.current,true):undefined,[after?.chapter.id,animateReward]);
 if(!after)return null;
 const newPiece=rewards.some(r=>r.id===`piece:${after.state.expedition.id}:${after.position}`);
 const unlocks=rewards.filter(r=>r.kind!=='piece'),openedWorld=unlocks.find(r=>r.kind==='world');
 const mastery=masteryCopy(save.hints),chapter=mainChapter(after.chapter.id);
 const subtitle=openedWorld?`${openedWorld.title} açıldı.`:!newPiece?'Yeniden keşfettin.':after.state.pieces===6?'Albüm tamamlandı.':after.state.pieces===1?'İlk parça senin!':`${['','İlk','İkinci','Üçüncü','Dördüncü','Beşinci'][after.state.pieces]} durak tamam!`;
 return <div ref={root} className={'journey-result world-reward'+(newPiece?' has-new-piece':'')}>
  <p className={openedWorld?'result-unlock-notice':'result-subtitle'}>{subtitle}</p>
  <div className="result-star-stage" aria-label={`Bu tur ${save.stars} / 3 yıldız`}>
   {[0,1,2].map(i=><div className={'result-star'+(i<save.stars?' earned':'')} key={i}><Star fill={i<save.stars?'currentColor':'none'} aria-hidden="true"/></div>)}
  </div>
  <details className="journey-result-details">
   <summary className="result-world" aria-label={`${after.piece} · Albüm ve tur ayrıntıları`}>
    <span className="result-world-medallion" aria-label={`${after.state.album.title}: ${after.state.pieces} / 6 albüm parçası`}>
     <span className="result-world-art"><SceneArt theme={after.chapter.themeId} journeyId={after.chapter.id} eager/></span>
     <svg className="result-world-pieces" viewBox="0 0 200 200" aria-hidden="true">{after.state.earned.map((earned,i)=><circle key={i} cx="100" cy="100" r="93" pathLength="360" strokeDasharray="51 309" transform={`rotate(${i*60-86} 100 100)`} className={'world-piece'+(earned?' earned':'')+(newPiece&&i===after.position?' just-earned':'')}/>)}</svg>
     <span className="result-world-count" aria-hidden="true">{after.state.pieces}/6</span>
    </span>
    <span className="result-world-caption"><b>{after.piece}</b>{newPiece&&<small>Albümüne eklendi</small>}</span>
   </summary>
   <div className="result-record">
    {chapter&&<p>Bölüm {chapter.number} tamamlandı</p>}
    {!newPiece&&<p>Albümündeki parça · {after.piece}</p>}
    <p>{timeLabel(save.elapsed)} · {save.hints} ipucu</p>
    <p>Albüm: {before?.state.pieces??after.state.pieces}/6 → {after.state.pieces}/6 parça</p>
    {unlocks.map(r=><p key={r.id}>{r.kind==='world'?'Yeni dünya':r.kind==='bonus'?'Final bölümü açıldı':'Albüm'} · {r.title}</p>)}
    {reward}<p>{mastery.label}. {mastery.rule}</p>
    {best?.complete&&<p>Önceki en iyi turun · {best.stars} yıldız · {timeLabel(best.elapsed)}</p>}
   </div>
  </details>
 </div>;
}
