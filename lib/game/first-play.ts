import type {Puzzle,Stroke} from './engine.ts';
import type {Progress} from './progress.ts';

/** Presentation only. Never changes a target, save, hint charge or selection rule. */
export function needsFirstPlayGuide(progress:Progress){
 return !progress.tutorialDone&&!progress.guideDone&&!Object.entries(progress.saves).some(([key,save])=>save.complete||save.strokes.length>0||save.hints>0||(key!=='route:uzay-1'&&save.elapsed>10))&&progress.days.length===0&&progress.mysteries.length===0;
}
export function firstPlayStep(board:Puzzle,strokes:Stroke[]){
 const found=new Set(strokes.map(s=>s.id));
 const diagonal=(p:Puzzle['placements'][number])=>p.a[0]!==p.b[0]&&p.a[1]!==p.b[1];
 const straight=board.placements.filter(p=>!diagonal(p)),cross=board.placements.filter(diagonal);
 if(straight.length&&!straight.some(p=>found.has(p.id)))return {step:1,target:straight.find(p=>!found.has(p.id))!,message:'İşaretli harften çizginin sonuna kaydır.'};
 if(cross.length&&!cross.some(p=>found.has(p.id)))return {step:2,target:cross.find(p=>!found.has(p.id))!,message:'Şimdi çapraz dene. Parmağını kaldırmadan yön değiştirebilirsin.'};
 return {step:3,target:null,message:'Artık sende. Kalan kelimeleri istediğin sırayla bul.'};
}
