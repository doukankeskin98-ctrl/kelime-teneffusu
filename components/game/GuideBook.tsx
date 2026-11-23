'use client';
import {useState} from 'react';
import {ChevronRight,Hand,Lightbulb} from 'lucide-react';
import {Window,Button} from '../ui/GameUI';
import {Disclosure} from './Disclosure';
import {RULES_COPY} from '@/lib/game/rules-copy';
const steps=[
 {title:'Kelimeyi çiz',text:'İlk harfe dokun. Parmağını son harfe kadar kaydırıp bırak.'},
 {title:'Çapraz da çizebilirsin',text:'Parmağını ilk harften son harfe kaydır. Elini kaldırmadan yatay, dikey ve çapraz yönler arasında geçebilirsin.'},
 {title:'Saklı harfleri bul',text:RULES_COPY.masked},
 {title:'İpucu al',text:'Ampule dokun, yardım istediğin kelimeyi seç. İşaretlenen harften başla.'}
];
export function GuideBook({onClose,daily=false,onPractice}:{onClose:()=>void;daily?:boolean;onPractice?:()=>void}){
 const [step,setStep]=useState(0),item=steps[step]!;
 const letters=Array.from((step===1?['KEMİK','ŞANON','BUSUT','SÜRIM','ÇİZİM']:['KEMİK','ŞATON','BULUT','SÜREÇ','ÇİZİM']).join(''));
 return <Window title="Nasıl oynanır" className="guide-window" onClose={onClose} footer={<div className="kt-guide-actions"><Button kind="secondary" disabled={step===0} onClick={()=>setStep(step-1)}>Geri</Button><Button onClick={step===3?onClose:()=>setStep(step+1)}>{step===3?'Anladım':'Sonraki'}{step<3&&<ChevronRight size={20} aria-hidden="true"/>}</Button></div>}>
  <div className="kt-guide-dots" aria-label={`Adım ${step+1} / 4`}>{steps.map((_,i)=><i key={i} data-current={step===i}/>)}</div>
  <div className="kt-guide-art" aria-hidden="true"><div className="kt-mini-board" data-step={step}>{letters.map((c,i)=><b key={i} data-marked={(step===1?[0,6,12,18,24]:step===3?[0]:[0,1,2,3,4]).includes(i)||undefined}>{step===2&&i===1?'✱':c}</b>)}{step===3?<Lightbulb/>:<Hand/>}</div></div>
  <div className="kt-guide-copy" aria-live="polite"><span className="kt-chip">{step+1} / 4 · {["Çizim","Yön","Saklı harf","İpucu"][step]}</span><h3>{item.title}</h3><p>{item.text}</p></div>
  {step===3&&<><p>{daily?'Günlük yarışta her ipucu bitiş sürene 15 saniye ekler. Günde bir sıralama hakkın var.':'Yolculukta ipuçsuz bitirince üç, bir ipucuyla iki, daha fazla ipucuyla bir yıldız kazanırsın.'}</p>{onPractice&&<Button kind="secondary" onClick={onPractice}>Çizerek dene</Button>}</>}
  <Disclosure title="Diğer kontroller"><p>İki uca sırayla dokunarak veya klavyede oklar ve Enter ile de kelime seçebilirsin. Uzun isimlerin her parçasını ayrı bul. Büyük harf modunda tahtada gezinmek için Tahtayı kaydır seçeneğini kullan.</p></Disclosure>
 </Window>;
}
