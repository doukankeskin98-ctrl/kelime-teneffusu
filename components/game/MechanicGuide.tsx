'use client';
import {ArrowRight,Clock,Lightbulb,Link,Search} from 'lucide-react';
import type {MechanicGuideId} from '@/lib/game/journey-flow';
import {Modal} from './common';

const copy={
 riddle:{title:'Tanımı çöz, kelimeyi bul',sample:'Geceleri gökyüzünü aydınlatır.',answer:'2 harf',text:'Her tanım bir kelimeyi anlatır. Cevabı tahtada çiz; bulduğunda tanımın yerinde kelimen açılır.',Icon:Lightbulb},
 concealed:{title:'Saklı kelimeyi keşfet',sample:'Renkler',answer:'M • • •',text:'Noktalar saklı harfleri gösterir. Bölümün konusundan ve varsa ilk harften yola çık. Kelimeyi bulunca tamamı açılır.',Icon:Search},
 mystery:{title:'Ortak bağlantıyı bul',sample:'En az üç kelime bul',answer:'Bağlantıyı bul',text:'Bulduğun kelimeleri birlikte düşün. “Bağlantıyı bul” açılınca ortak konuyu seç; son kelime tahtada aranabilir hâle gelir.',Icon:Link},
 daily:{title:'Bugünün ortak tahtası',sample:'8 kelime · tek sıralama hakkı',answer:'İpucu +15 saniye',text:'Başladığında yarış süren çalışır; uygulamadan ayrılsan da durmaz. Sekiz kelimeyi bul, süreni diğer oyuncularla karşılaştır.',Icon:Clock},
} satisfies Record<MechanicGuideId,{title:string;sample:string;answer:string;text:string;Icon:typeof Clock}>;
export function MechanicGuide({kind,onClose,onStart}:{kind:MechanicGuideId;onClose:()=>void;onStart?:()=>void}){
 const c=copy[kind];return <Modal className="game-tools-modal mechanic-guide" title={c.title} onClose={onClose} footer={<button className="button primary full" onClick={onStart??onClose}>{onStart?'Başla':'Anladım'}<ArrowRight size={18}/></button>}><div className="mechanic-example"><c.Icon size={32}/><span>{c.sample}</span><b>{c.answer}</b></div><p>{c.text}</p>{kind!=='daily'&&<p className="guide-reassurance">Acele yok. Yanlış seçim ceza getirmez.</p>}</Modal>;
}
