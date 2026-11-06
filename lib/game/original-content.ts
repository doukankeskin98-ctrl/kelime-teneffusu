import type {Journey} from './content.ts';
import type {Progress,SavedLevel} from './progress.ts';

/** New authored content; legacy IDs/words remain solely for save validation. */
const definitions:[string,string,string,string,string,string[]][]=[
 ['hababam','okul','Okul Günleri','school','#8eaf91',[
  'İlk zil|SINIF|TAHTA|SIRA|ZİL','Çantamda|KALEM|DEFTER|SİLGİ|CETVEL|KİTAP',
  'Ders zamanı|ÖĞRETMEN|ÖĞRENCİ|DERS|SORU|CEVAP|ÖDEV','Okul bahçesi|BAHÇE|AĞAÇ|BANK|POTA|TOP|ÇİÇEK',
  'Okul şenliği|SAHNE|KORO|DANS|KERMES|SERGİ|ALKIŞ|GÖSTERİ','Okul yıllığı|YILLIK|HATIRA|DOSTLUK|FOTOĞRAF|MEZUN|İMZA']],
 ['yesilcam','tiyatro','Tiyatro Sokağı','film','#b6ba86',[
  'Perde açılıyor|PERDE|SAHNE|OYUNCU|SEYİRCİ','Kuliste|KULİS|AYNA|MAKYAJ|ASKI|FIRÇA',
  'Kostüm odası|KOSTÜM|KUMAŞ|İĞNE|İPLİK|DÜĞME|ŞAPKA','Prova saati|PROVA|REPLİK|ROL|EZBER|VURGU|JEST',
  'Sahne düzeni|DEKOR|IŞIK|PERDE|FON|SAHNE|SES|AKSESUAR','Son alkış|ALKIŞ|SELAM|SEYİRCİ|ÇİÇEK|FUAYE|BİLET']],
 ['diziler','oyku','Öykü Atölyesi','tv','#c9a8ce',[
  'Bir fikir|FİKİR|DÜŞ|MERAK|HAYAL','Defter sayfası|DEFTER|KALEM|SATIR|SAYFA|NOT',
  'Öykü kişileri|KAHRAMAN|ANLATICI|DOST|YOLCU|GEZGİN|KOMŞU','Öykünün mekânları|EV|BAHÇE|ORMAN|LİMAN|KASABA|SARAY',
  'Olay örgüsü|BAŞLANGIÇ|OLAY|DÜĞÜM|ÇÖZÜM|SONUÇ|SERÜVEN','Son sayfa|BAŞLIK|KAPAK|ÖNSÖZ|YAZAR|OKUR|KİTAP']],
 ['sinema','film-atolyesi','Film Atölyesi','film','#8aacc8',[
  'İlk kare|KARE|PLAN|KAMERA|FİLM','Kamera arkasında|KAMERA|MERCEK|ODAK|TRİPOD|KADRAJ',
  'Işık ve ses|IŞIK|SES|MİKROFON|SPOT|GÖLGE|YANKI','Kurgu masası|KURGU|KESME|GEÇİŞ|SAHNE|SES|RENK',
  'Çekim günü|SET|KLAKET|OYUNCU|YÖNETMEN|SENARYO|TEKRAR','Gösterim zamanı|SALON|PERDE|BİLET|SEYİRCİ|FESTİVAL|ALKIŞ']],
 ['doksanlar','sokak-oyunlari','Sokak Oyunları','cassette','#d6a4a0',[
  'Mahallede oyun|SOKAK|PARK|TOP|EBE','Bilye çemberi|BİLYE|MİSKET|ÇEMBER|ÇUKUR|HEDEF',
  'İp ve seksek|İP|SEKSEK|TEBEŞİR|ÇİZGİ|TAŞ|KARE','Takım oyunu|TAKIM|KALE|PAS|YAKANTOP|ÇEMBER|BAYRAK',
  'Parkta|SALINCAK|KAYDIRAK|OYUNCAK|KUM|BANK|TIRMANMA','Saklambaç|SAKLAMBAÇ|SOBE|EBE|SAKLANMA|KÖŞE|GÖLGE']],
];
export const ORIGINAL_ROUTES=definitions.map(([legacyThemeId,themeId,title,icon,color,rows])=>({legacyThemeId,themeId,title,icon,color,chapters:rows.map((row,i):Journey=>{
 const [name,...words]=row.split('|');
 const longest=Math.max(...words.map(w=>w.length)),size=Math.max(i<2?6:8,longest);
 return {id:`ozgun-${themeId}-${i+1}`,themeId,title:name!,subtitle:title,words,size,difficulty:i<2?'Rahat':i===4?'Ustalık':'Dengeli',note:'Kelimeleri yatay, dikey veya çapraz bulabilirsin.'};
})}));
export const ORIGINAL_CHAPTERS=ORIGINAL_ROUTES.flatMap(r=>r.chapters);
export const RETIRED_THEMES=new Set(definitions.map(d=>d[0]));
export const CHAPTER_REPLACEMENTS:Readonly<Record<string,string>>=Object.fromEntries(ORIGINAL_ROUTES.flatMap(r=>r.chapters.map((c,i)=>[r.legacyThemeId==='hababam'?(i===5?'hababam-yillik':`hababam-${i+1}`):`${r.legacyThemeId}-atlas-${i+1}`,c.id])));
export const replacementChapterId=(id:string)=>CHAPTER_REPLACEMENTS[id]??id;
export const originalThemeId=(id:string)=>ORIGINAL_ROUTES.find(r=>r.legacyThemeId===id)?.themeId??id;
const predecessor=Object.fromEntries(Object.entries(CHAPTER_REPLACEMENTS).map(([old,next])=>[next,old]));
/** Gate/reward credit only. Never use these strokes to play a replacement board. */
export function chapterCredit(p:Pick<Progress,'saves'>,id:string):SavedLevel|undefined{
 const current=p.saves['route:'+id],old=predecessor[id]?p.saves['route:'+predecessor[id]]:undefined;
 if(current?.complete&&old?.complete)return current.stars>=old.stars?current:old;
 const started=(save:SavedLevel|undefined)=>!!save&&(save.strokes.length>0||save.elapsed>0||save.hints>0);
 return current?.complete?current:old?.complete?old:started(current)?current:started(old)?old:current??old;
}
export const RETIRED_RELEASE_IDS=new Set(['20261027-0002-4000-8000-000000000001']);
export const RETIRED_SPRINT_WORDS=new Set(['AMELİE','MATRİX','ATARI','OSCAR','ROCKY','TAZO','TASO','AVATAR','BATMAN','ASLI','BURHAN','FATOŞ','İSMAİL','ŞEVKET','TAHSİN','PAGER','VHS','DISKET']);
