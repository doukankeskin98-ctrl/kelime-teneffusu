'use client';
import {ArrowRight,BookOpen,Check,Compass,Star} from 'lucide-react';
import {journeyGoal,masteryCopy} from '@/lib/game/achievement-view';
import type {DiscoveryReward} from '@/lib/game/discovery';
import type {SavedLevel} from '@/lib/game/progress';
import {timeLabel} from '@/lib/game/engine';
import {CollectionScene} from './Discovery';
import {PieceTrail} from './AchievementLoop';

export function JourneyResult({before,after,rewards,save,best}:{before:ReturnType<typeof journeyGoal>;after:ReturnType<typeof journeyGoal>;rewards:DiscoveryReward[];save:SavedLevel;best?:SavedLevel}){
 if(!after)return null;
 const newPiece=rewards.some(r=>r.kind==='piece'&&r.themeId===after.chapter.themeId&&r.title===after.piece),unlocks=rewards.filter(r=>r.kind==='world'||r.kind==='album'),mastery=masteryCopy(save.hints);
 return <div className="journey-result">
  <div className="journey-result-piece"><span className="journey-result-check" aria-hidden="true"><Check size={24}/></span><small>{newPiece?'ALBÜM PARÇAN KAZANILDI':'BU PARÇA ZATEN SENİN'}</small><h3>{after.piece}</h3><p>{after.state.album.title}</p></div>
  <div className="journey-result-scene"><CollectionScene state={after.state} compact/></div>
  <div className="journey-album-change" aria-label="Albümün önceki ve sonraki durumu"><span>Önce <b>{before?.state.pieces??after.state.pieces}/6</b></span><ArrowRight size={18}/><span>Şimdi <b>{after.state.pieces}/6</b></span></div>
  <PieceTrail earned={after.state.earned}/>
  {!newPiece&&<p className="journey-replay-note">Tekrar oyununda yeni parça verilmez. En iyi sonucun korunur.</p>}
  {unlocks.map(reward=><div className="journey-unlock" key={reward.id}>{reward.kind==='world'?<Compass size={21}/>:<BookOpen size={21}/>}<span><small>{reward.kind==='world'?'YENİ DÜNYA AÇILDI':'ALBÜM TAMAMLANDI'}</small><b>{reward.title}</b></span><Check size={18}/></div>)}
  <div className="journey-result-stars" aria-label={`Bu tur ${save.stars} / 3 yıldız`}>{[0,1,2].map(i=><Star key={i} fill={i<save.stars?'currentColor':'none'} className={i<save.stars?'earned':''} aria-hidden="true"/>)}<span>{mastery.label}</span></div>
  <details className="journey-result-details"><summary>Sonuç ve yıldız koşulları</summary><p>{timeLabel(save.elapsed)} · {save.hints} ipucu. {mastery.rule}</p>{best?.complete&&<p>Önceki en iyi: {best.stars} yıldız · {timeLabel(best.elapsed)}. Daha iyi sonuç korunur.</p>}</details>
 </div>;
}
