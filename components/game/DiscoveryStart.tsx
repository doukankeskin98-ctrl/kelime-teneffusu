'use client';
import {ArrowRight,Compass,Grid2X2,Sparkles,Swords} from 'lucide-react';
import type {nextDiscovery} from '@/lib/game/next-discovery';
import {WorldArt} from './WorldArt';

/** One clear starting point, using the existing validated solo recommendation. */
export function DiscoveryStart({recommendation,onPlay,onArena}:{
 recommendation:ReturnType<typeof nextDiscovery>;
 onPlay:()=>void;
 onArena:()=>void;
}){
 const continuing=recommendation.mode==='continue';
 const replay=recommendation.mode==='replay';
 return <section className="discovery-start island-start" aria-labelledby="discovery-start-title"><div className="island-scene" aria-hidden="true"><img src="/art/discovery-island.webp" alt="" width="1280" height="853" fetchPriority="high"/><i>✦</i><i>✦</i><i>✦</i></div>
  <div className="start-intro">
   <div className="start-intro-copy">
    <span className="eyebrow"><Sparkles size={14}/>KENDİ TEMPONDA KEŞFET</span>
    <h2 id="discovery-start-title">Bir mola.<br/><em>Bir sürü keşif.</em></h2>
    <p>Kelimeleri bul, kendi dünyanı keşfet.</p>
   </div>
   <div className="start-world-art" aria-hidden="true"><WorldArt themeId={recommendation.config.themeId} crop/><span className="floating-letter letter-k">K</span><span className="floating-letter letter-t">T</span><span className="art-spark">✦</span></div>
  </div>
  <div className="start-route">
   <span className="eyebrow">{continuing?'KALDIĞIN YERDEN':replay?'BİR KEZ DAHA KEŞFET':'SIRADAKİ KÜÇÜK ADIM'}</span>
   <h3>{recommendation.title}</h3>
   <p id="discovery-start-detail">{recommendation.theme}{continuing?` · ${recommendation.found} kelime bulundu`:''}</p>
   <button className="button primary" onClick={onPlay} aria-describedby="discovery-start-detail">{recommendation.label}<ArrowRight size={18}/></button>
   <small>{replay?'En iyi sonucun korunur.':'Süre baskısı yok. İstediğin zaman ara ver.'}</small>
  </div>
  <nav className="start-shortcuts" aria-label="Keşif kısayolları">
   <a href="#kesif-haritasi"><Compass size={18}/><span>Harita</span></a>
   <a href="#dunyalar"><Grid2X2 size={18}/><span>Dünyalar</span></a>
   <button onClick={onArena}><Swords size={18}/><span>Arkadaşla oyna</span></button>
  </nav>
 </section>;
}
