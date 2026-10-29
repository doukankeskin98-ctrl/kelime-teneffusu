'use client';
import {BookOpen,Check,Compass,Flag,Gift,Star,Sparkles,Trophy} from 'lucide-react';
import {journeyGoal,masteryCopy} from '@/lib/game/achievement-view';
import type {DiscoveryReward} from '@/lib/game/discovery';
import type {SavedLevel} from '@/lib/game/progress';
import {timeLabel} from '@/lib/game/engine';
import {CollectionScene} from './Discovery';

type Goal=ReturnType<typeof journeyGoal>;
export function PieceTrail({earned,current}:{earned:boolean[];current?:number}){
 return <ol className="piece-trail" aria-label={`${earned.filter(Boolean).length} / ${earned.length} koleksiyon parçası`}>
  {earned.map((done,i)=><li key={i} className={done?'earned':i===current?'current':''} aria-label={`${i+1}. parça: ${done?'koleksiyonunda':i===current?'bu keşfin hedefi':'henüz açılmadı'}`}><span>{done?<Check size={15}/>:i===5?<Gift size={15}/>:i+1}</span></li>)}
 </ol>;
}
export function JourneyObjective({goal,complete}:{goal:Goal;complete:boolean}){
 if(!goal)return null;
 return <div className="journey-objective"><span className="objective-icon" aria-hidden="true">{goal.earned?<Check size={18}/>:<Gift size={18}/>}</span><div><small>{goal.earned?'ALBÜMÜNDEKİ PARÇAN':complete?'KEŞFİNİN PARÇASI':'BU KEŞFİN ÖDÜLÜ'}</small><strong>{goal.piece}</strong></div><span className="objective-fraction">{goal.position+1}<small>/6</small></span></div>;
}
/** Presentation only: the collection and unlocks come from existing validated saves. */
export function VictorySummary({goal,rewards,stars,hints,seconds,total,improved,best,tutorial=false,daily=false}:{
 goal:Goal;rewards:DiscoveryReward[];stars:number;hints:number;seconds:number;total:number;improved?:boolean;best?:SavedLevel;tutorial?:boolean;daily?:boolean;
}){
 const piece=goal?rewards.find(r=>r.kind==='piece'&&r.themeId===goal.chapter.themeId&&r.title===goal.piece):undefined;
 const milestones=rewards.filter(r=>r.kind!=='piece'),mastery=masteryCopy(hints);
 return <div className="victory-summary">
  {goal?<div className={'victory-keepsake'+(piece?' is-new':'')}>
   <span className="victory-eyebrow"><Sparkles size={15}/>{piece?'YENİ PARÇAN SENİN':'KEŞFİN ALBÜMÜNDE'}</span>
   <h3>{goal.piece}</h3><p>{goal.state.album.title}</p>
   <div className="victory-scene"><CollectionScene state={goal.state}/><span className="victory-seal" aria-label={piece?'Yeni koleksiyon parçası':'Kazanılmış koleksiyon parçası'}><Check size={25}/></span></div>
   <PieceTrail earned={goal.state.earned}/>
   <p className="victory-caption">{piece?`${goal.state.pieces}/6 parça tamam. Bir adımın daha kalıcı bir hatıraya dönüştü.`:'Bu parça zaten senin. Tekrar oyunu koleksiyonunu çoğaltmaz.'}</p>
  </div>:<div className="victory-keepsake victory-simple"><span className="victory-medal" aria-hidden="true"><Trophy size={38}/></span><span className="victory-eyebrow">{tutorial?'İLK ADIM TAMAM':daily?'GÜNLÜK KEŞİF TAMAM':'KEŞİF TAMAM'}</span><h3>{tutorial?'İşte bu, başardın!':'Bütün kelimeleri buldun.'}</h3></div>}
  {milestones.length>0&&<ul className="victory-unlocks" aria-label="Yeni açılanlar">{milestones.map(r=><li key={r.id}><span aria-hidden="true">{r.kind==='world'?<Compass/>:r.kind==='album'?<BookOpen/>:<Gift/>}</span><div><small>{r.kind==='world'?'YENİ DÜNYA AÇILDI':r.kind==='album'?'KOLEKSİYON TAMAMLANDI':'BONUS KEŞİF AÇILDI'}</small><b>{r.title}</b></div><Check size={18}/></li>)}</ul>}
  <div className="victory-mastery"><div className="victory-stars" aria-label={`Bu tur ${stars} / 3 yıldız`}>{[0,1,2].map(i=><Star key={i} aria-hidden="true" className={i<stars?'earned':''} fill={i<stars?'currentColor':'none'}/>)}</div><strong>{mastery.label}</strong><span>Bu turun sonucu</span></div>
  {!tutorial&&<div className="victory-stats" aria-label="Bölüm özeti"><div><b>{total}</b><span>kelime</span></div><div><b>{timeLabel(seconds)}</b><span>{daily?'toplam süre':'keşif süresi'}</span></div><div><b>{hints}</b><span>ipucu</span></div></div>}
  {improved&&<p className="victory-record"><Trophy size={18}/>Bu bölümde yeni kişisel en iyin!</p>}
  {!improved&&best?.complete&&!tutorial&&!daily&&<p className="victory-best">En iyi sonucun korunuyor: <b>{best.stars} yıldız · {timeLabel(best.elapsed)}</b></p>}
  {!daily&&<details className="mastery-explainer"><summary>Yıldızlar nasıl kazanılıyor?</summary><p>{mastery.rule}{goal&&' Parçanı kazanmak için yıldız şartı yok.'}</p></details>}
 </div>;
}
export function NextJourneyPreview({goal}:{goal:Goal}){
 if(!goal)return null;
 return <div className="next-journey-preview"><span aria-hidden="true"><Flag size={20}/></span><div><small>SIRADAKİ HEDEFİN</small><strong>{goal.chapter.title}</strong><p>{goal.earned?'En iyi sonucunu geliştir.':`Kazanılacak parça: ${goal.piece}`}</p><p>{goal.milestone.label}</p></div></div>;
}
