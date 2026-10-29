'use client';
import {ArrowRight,Compass,Grid2X2,Gift,Star,Swords} from 'lucide-react';
import type {nextDiscovery} from '@/lib/game/next-discovery';
import type {Progress} from '@/lib/game/progress';
import {journeyGoal} from '@/lib/game/achievement-view';
import {PieceTrail} from './AchievementLoop';
import {WorldArt} from './WorldArt';

export function DiscoveryStart({recommendation,progress,onPlay,onArena}:{
 recommendation:ReturnType<typeof nextDiscovery>;progress:Progress;onPlay:()=>void;onArena:()=>void;
}){
 const continuing=recommendation.mode==='continue',replay=recommendation.mode==='replay',goal=journeyGoal(progress,recommendation.config.journey);
 return <section className="quest-start" aria-labelledby="discovery-start-title">
  <div className="quest-art" aria-hidden="true"><WorldArt themeId={recommendation.config.themeId}/><span className="quest-art-seal"><Compass size={27}/></span></div>
  <div className="quest-copy"><span className="quest-eyebrow">{goal?`${goal.state.expedition.title} · ${goal.position+1}. durak`:continuing?'Kaldığın yerden':replay?'Kendi en iyinin peşinde':'Yeni bir keşif'}</span>
   <h2 id="discovery-start-title">{goal&&!goal.earned?goal.piece:continuing?'Yarım kalan keşfin seni bekliyor.':'Bir sonraki başarın burada.'}</h2>
   <p className="quest-promise">{goal&&!goal.earned?<><Gift size={17}/>Bu keşfi tamamla, parçayı albümüne ekle.</>:<><Star size={17}/>Kelimeleri bul, kendi en iyi sonucunu geliştir.</>}</p>
   <div className="quest-launch"><span id="discovery-start-detail"><small>{continuing?'DEVAM EDEN KEŞFİN':'OYNAYACAĞIN BÖLÜM'}</small><b>{recommendation.title}</b><em>{recommendation.theme}{continuing?' · Devam eden keşif':''}</em></span><button className="button primary" onClick={onPlay} aria-describedby="discovery-start-detail">{continuing?'Devam et':replay?'Tekrar oyna':'Keşfe başla'}<ArrowRight size={19}/></button></div>
   {goal&&<div className="quest-collection"><div><span>{goal.state.album.title}</span><b>{goal.state.pieces}/6 parça</b></div><PieceTrail earned={goal.state.earned} current={goal.position}/><p>{goal.milestone.label}</p></div>}
   <small className="quest-reassurance">{replay?'En iyi sonucun korunur.':goal?'İpuçlarıyla da parçanı kazanırsın. Kendi temponda oyna.':'Süre baskısı yok. İstediğin zaman ara ver.'}</small>
  </div>
  <nav className="quest-shortcuts" aria-label="Keşif kısayolları"><a href="#kesif-haritasi"><Compass size={18}/>Harita</a><a href="#dunyalar"><Grid2X2 size={18}/>Dünyalar</a><button onClick={onArena}><Swords size={18}/>Arkadaşla oyna</button></nav>
 </section>;
}
