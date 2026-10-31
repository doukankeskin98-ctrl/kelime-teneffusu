'use client';
import {useId} from 'react';
import {ArrowRight,Check,ChevronDown,Lightbulb} from 'lucide-react';
import {RIDDLE_CHAPTERS} from '@/lib/game/riddle-content';
import type {Progress} from '@/lib/game/progress';
import type {SoloConfig} from './Solo';

export function RiddleShelf({progress,onPlay}:{progress:Progress;onPlay:(config:SoloConfig)=>void}){
 const id=useId(),done=RIDDLE_CHAPTERS.filter(c=>progress.saves['route:'+c.id]?.complete).length;
 const next=RIDDLE_CHAPTERS.find(c=>!progress.saves['route:'+c.id]?.complete);
 const play=(chapter:typeof RIDDLE_CHAPTERS[number])=>onPlay({themeId:chapter.themeId,journey:chapter.id,level:0,practice:progress.saves['route:'+chapter.id]?.complete===true});
 return <section className="riddle-shelf" aria-labelledby={id}><header><Lightbulb size={22}/><h2 id={id}>İpucu Avı</h2><span>{done}/{RIDDLE_CHAPTERS.length}</span></header><p>Küçük bir bilmece, tatlı bir aydınlanma. Tanımları çöz, saklanan dört kelimeyi bul.</p>
  {next?<button className="button secondary full" onClick={()=>play(next)}><span>{progress.saves['route:'+next.id]?.strokes.length?'Devam et':'İpucu Avı oyna'}<small>{next.title}</small></span><ArrowRight size={18}/></button>:<p className="riddle-complete"><Check size={18}/>Mevcut bütün İpucu Avı bölümleri tamamlandı.</p>}
  <details><summary>Bütün İpucu Avı bölümleri<ChevronDown size={18}/></summary><div className="riddle-chapter-list">{RIDDLE_CHAPTERS.map(chapter=>{const save=progress.saves['route:'+chapter.id];return <button key={chapter.id} onClick={()=>play(chapter)}><span><b>{chapter.title}</b><small>4 tanım · {chapter.size}×{chapter.size} · {chapter.difficulty}</small></span><span>{save?.complete?<>Tekrar oyna · {save.stars}★</>:save?.strokes.length?'Devam et':'Oyna'}<ArrowRight size={16}/></span></button>;})}</div></details>
 </section>;
}
