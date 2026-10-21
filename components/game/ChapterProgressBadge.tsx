import {CheckCircle2,Compass,LoaderCircle} from 'lucide-react';
import {chapterCardCopy,type ChapterCardProgress,type ChapterCardState} from '@/lib/studio/card-progress';
import type {ChapterSpec} from '@/lib/studio/content';

export function ChapterProgressBadge({progress,status,spec}:{progress?:ChapterCardProgress;status:ChapterCardState;spec:ChapterSpec}){
 const copy=chapterCardCopy(progress,status,spec);
 return <span className={'chapter-card-progress '+copy.kind} aria-live="polite">{copy.kind==='complete'?<CheckCircle2 size={16}/>:copy.kind==='unknown'&&status==='loading'?<LoaderCircle size={15} className="spin"/>:<Compass size={15}/>}<span>{copy.kind==='complete'&&<strong>Tamamlandı</strong>}<span>{copy.detail}</span></span></span>;
}
