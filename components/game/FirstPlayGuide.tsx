'use client';
import type {firstPlayStep} from '@/lib/game/first-play';
export function FirstPlayGuide({guide,onSkip}:{guide:ReturnType<typeof firstPlayStep>;onSkip:()=>void}){
 return <div className="first-play-guide"><div role="status"><b>{guide.target?guide.target.label:'Sıra sende'}</b><span>{guide.message}</span></div><button type="button" className="text-button" onClick={onSkip} aria-label="İlk oyun rehberini kapat">{guide.step===3?'Tamam':'Atla'}</button></div>;
}
