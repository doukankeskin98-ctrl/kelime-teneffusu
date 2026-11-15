'use client';
import {Check,Star} from 'lucide-react';
import {useLayoutEffect,useRef,type CSSProperties,type ReactNode} from 'react';
import {journeyGoal,masteryCopy} from '@/lib/game/achievement-view';
import type {DiscoveryReward} from '@/lib/game/discovery';
import type {SavedLevel} from '@/lib/game/progress';
import {timeLabel} from '@/lib/game/engine';
import {mainChapter} from '@/lib/game/main-journey';
import {worldChapter} from '@/lib/game/world-presentation';
import {SceneArt} from './SceneArt';
import {playResultSequence} from '@/lib/game/result-motion';

export function JourneyResult({before,after,rewards,save,best,reward}:{reward?:ReactNode;before:ReturnType<typeof journeyGoal>;after:ReturnType<typeof journeyGoal>;rewards:DiscoveryReward[];save:SavedLevel;best?:SavedLevel}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>root.current?playResultSequence(root.current):undefined,[after?.chapter.id]);
 if(!after)return null;
 const newPiece=rewards.some(r=>r.id===`piece:${after.state.expedition.id}:${after.position}`),unlocks=rewards.filter(r=>r.kind!=='piece'),mastery=masteryCopy(save.hints);
 const openedWorld=unlocks.find(unlock=>unlock.kind==='world');
 return <div ref={root} className={'journey-result polished-result world-reward'+(newPiece?' has-new-piece':'')}>
  <p className="result-chapter-number">Bölüm {mainChapter(after.chapter.id)?.number} tamamlandı</p>
  <p className="world-result-heading">{worldChapter(after.chapter.id,save.revision)?.topic??after.chapter.title}</p>
  <div className="result-star-stage" aria-label={`Bu tur ${save.stars} / 3 yıldız`}>
   {[0,1,2].map(i=><div className={'result-star'+(i<save.stars?' earned':'')} key={i} style={{'--star-index':i} as CSSProperties}><Star fill={i<save.stars?'currentColor':'none'} aria-hidden="true"/></div>)}
  </div>
  <figure className="result-world">
   <div className="result-world-medallion" aria-label={`${after.state.album.title}: ${after.state.pieces} / 6 albüm parçası`}>
    <div className="result-world-art"><SceneArt theme={after.chapter.themeId} journeyId={after.chapter.id} eager/></div>
    <svg className="result-world-pieces" viewBox="0 0 200 200" aria-hidden="true">{after.state.earned.map((earned,i)=><circle key={i} cx="100" cy="100" r="91" pathLength="360" strokeDasharray="52 308" transform={`rotate(${i*60-116} 100 100)`} className={'world-piece'+(earned?' earned':'')+(newPiece&&i===after.position?' just-earned':'')}/>)}</svg>
    <span className="result-world-count" aria-hidden="true">{after.state.pieces===6&&<Check size={18}/>} {after.state.pieces}<small>/6</small></span>
   </div>
   <figcaption className="result-world-caption"><h3>{after.state.pieces===6?(newPiece?'Albüm tamamlandı':'Albümün tamam'):newPiece?after.piece:'Yeniden keşfettin'}</h3><p>{after.state.album.title}</p></figcaption>
  </figure>
  {openedWorld&&<p className="result-unlock-notice">Yeni dünya açıldı<br/><b>{openedWorld.title}</b></p>}
  {!newPiece&&<p className="journey-replay-note">Bu parça daha önce kazanıldı.</p>}
  <details className="journey-result-details"><summary>{timeLabel(save.elapsed)} · {save.hints} ipucu · Ayrıntılar</summary><p>{newPiece?`${after.piece} albümüne eklendi.`:`Albümündeki parça: ${after.piece}.`}</p><p>Albüm: {before?.state.pieces??after.state.pieces}/6 → {after.state.pieces}/6 parça.</p>{unlocks.map(unlock=><p key={unlock.id}>{unlock.kind==='world'?'Yeni dünya':unlock.kind==='bonus'?'Final bölümü açıldı':'Albüm tamamlandı'}: <b>{unlock.title}</b></p>)}{reward}<p>{mastery.label}. {mastery.rule}</p>{best?.complete&&<p>Önceki en iyi: {best.stars} yıldız · {timeLabel(best.elapsed)}.</p>}</details>
 </div>;
}
