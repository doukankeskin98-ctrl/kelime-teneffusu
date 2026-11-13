'use client';
import {Check,Star} from 'lucide-react';
import type {CSSProperties,ReactNode} from 'react';
import {journeyGoal,masteryCopy} from '@/lib/game/achievement-view';
import type {DiscoveryReward} from '@/lib/game/discovery';
import type {SavedLevel} from '@/lib/game/progress';
import {timeLabel} from '@/lib/game/engine';
import {mainChapter} from '@/lib/game/main-journey';
import {worldChapter} from '@/lib/game/world-presentation';
import {SceneArt} from './SceneArt';

export function JourneyResult({before,after,rewards,save,best,reward}:{reward?:ReactNode;before:ReturnType<typeof journeyGoal>;after:ReturnType<typeof journeyGoal>;rewards:DiscoveryReward[];save:SavedLevel;best?:SavedLevel}){
 if(!after)return null;
 const major=rewards.some(r=>r.kind==='world'||r.kind==='album');
 const newPiece=rewards.some(r=>r.id===`piece:${after.state.expedition.id}:${after.position}`),unlocks=rewards.filter(r=>r.kind!=='piece'),mastery=masteryCopy(save.hints);
 return <div className={'journey-result polished-result'+(newPiece?' has-new-piece':'')}>
  <p className="result-chapter-number">Bölüm {mainChapter(after.chapter.id)?.number} tamamlandı</p>
  <p className="world-result-heading">{worldChapter(after.chapter.id,save.revision)?.topic??after.chapter.title}</p>
  <div className="result-star-stage" aria-label={`Bu tur ${save.stars} / 3 yıldız`}>
   {[0,1,2].map(i=><div className={'result-star'+(i<save.stars?' earned':'')} key={i} style={{'--star-index':i} as CSSProperties}><Star fill={i<save.stars?'currentColor':'none'} aria-hidden="true"/></div>)}
  </div>
  <div className={"result-keepsake"+(major?'':' compact-keepsake')}><div className="result-keepsake-art"><SceneArt theme={after.chapter.themeId} journeyId={after.chapter.id}/><Check size={16}/></div><div><small>{newPiece?'Albümüne eklendi':'Albümündeki parça'}</small><h3>{after.piece}</h3><p>{after.state.expedition.title}</p></div></div>
  <div className="result-album-progress" aria-label={`${after.state.pieces} / 6 albüm parçası`}><span>{after.state.album.title}</span><b>{after.state.pieces}/6</b><div>{after.state.earned.map((earned,i)=><i key={i} className={(earned?'earned':'')+(newPiece&&i===after.position?' just-earned':'')}/>)}</div></div>
  {!newPiece&&<p className="journey-replay-note">Bu parça daha önce kazanıldı.</p>}
  {unlocks.map(reward=><div className="journey-unlock" key={reward.id}><div className="unlock-scene"><SceneArt theme={reward.themeId} worldId={reward.id.split(':')[1]}/></div><span><small>{reward.kind==='world'?'Yeni dünya':reward.kind==='bonus'?'Final bölümü açıldı':'Albüm tamamlandı'}</small><b>{reward.title}</b></span><Check size={18}/></div>)}
  {reward}
  <details className="journey-result-details"><summary>{timeLabel(save.elapsed)} · {save.hints} ipucu</summary><p>Albüm: {before?.state.pieces??after.state.pieces}/6 → {after.state.pieces}/6 parça.</p><p>{mastery.label}. {mastery.rule}</p>{best?.complete&&<p>Önceki en iyi: {best.stars} yıldız · {timeLabel(best.elapsed)}.</p>}</details>
 </div>;
}
