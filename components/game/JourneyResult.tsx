'use client';
import {ArrowRight,BookOpen,Check,Compass,Gift,Star} from 'lucide-react';
import {journeyGoal,masteryCopy} from '@/lib/game/achievement-view';
import type {DiscoveryReward} from '@/lib/game/discovery';
import type {SavedLevel} from '@/lib/game/progress';
import {timeLabel} from '@/lib/game/engine';
import {CollectionScene} from './Discovery';
import {PieceTrail} from './AchievementLoop';
import {worldChapter} from '@/lib/game/world-presentation';
import {SceneArt} from './SceneArt';

export function JourneyResult({before,after,rewards,save,best}:{before:ReturnType<typeof journeyGoal>;after:ReturnType<typeof journeyGoal>;rewards:DiscoveryReward[];save:SavedLevel;best?:SavedLevel}){
 if(!after)return null;
 const newPiece=rewards.some(r=>r.kind==='piece'&&r.themeId===after.chapter.themeId&&r.title===after.piece),unlocks=rewards.filter(r=>r.kind!=='piece'),mastery=masteryCopy(save.hints);
 return <div className={'journey-result'+(newPiece?' has-new-piece':'')}>
  <p className="world-result-heading">{after.state.expedition.title} · {worldChapter(after.chapter.id)?.topic}</p>
  <div className="journey-result-piece"><span className="journey-result-check" aria-hidden="true"><Check size={24}/></span><small>{newPiece?'YENİ ALBÜM PARÇASI':'ALBÜMÜNDEKİ PARÇA'}</small><h3>{after.piece}</h3><p>{after.state.album.title}</p></div>
  <div className="journey-result-medallion"><SceneArt theme={after.chapter.themeId}/><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="55" className="medallion-track"/><circle cx="60" cy="60" r="55" className="medallion-progress" pathLength="100" strokeDasharray={`${after.state.pieces/6*100} 100`}/></svg><span><b>{after.state.pieces}<small>/6</small></b>albüm parçası</span></div>

  <PieceTrail earned={after.state.earned}/>
  {!newPiece&&<p className="journey-replay-note">Bu parça daha önce kazanıldı.</p>}
  {unlocks.map(reward=><div className="journey-unlock" key={reward.id}><div className="unlock-scene"><SceneArt theme={reward.themeId}/></div><span><small>{reward.kind==='world'?'YENİ DÜNYA AÇILDI':reward.kind==='bonus'?'ALBÜM FİNALİ AÇILDI':'ALBÜM TAMAMLANDI'}</small><b>{reward.title}</b></span><Check size={18}/></div>)}
  <div className="journey-result-stars" aria-label={`Bu tur ${save.stars} / 3 yıldız`}>{[0,1,2].map(i=><Star key={i} fill={i<save.stars?'currentColor':'none'} className={i<save.stars?'earned':''} aria-hidden="true"/>)}<span>{mastery.label}</span></div>
  <details className="journey-result-details"><summary>Bölüm ayrıntıları</summary><p>Albümün: {before?.state.pieces??after.state.pieces}/6 → {after.state.pieces}/6 parça.</p><p>{timeLabel(save.elapsed)} · {save.hints} ipucu. {mastery.rule}</p>{best?.complete&&<p>Önceki en iyi: {best.stars} yıldız · {timeLabel(best.elapsed)}. Daha iyi sonuç korunur.</p>}</details>
 </div>;
}
