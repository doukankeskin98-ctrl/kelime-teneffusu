import type {Journey} from './content.ts';
import type {CoastRoute} from './coast-content.ts';

type Row=[topic:string,words:string,size:number,clues?:string[]];
function route(id:string,title:string,themeId:string,light:CoastRoute['light'],pieces:string[],rows:Row[]):CoastRoute{
 return {id,title,subtitle:'Günün Renkleri',album:title+' albümü',light,pieces,chapters:rows.map(([topic,bank,size,definitions],i)=>{
  const words=bank.split('|');return {id:`${id}-${i+1}`,themeId,title:topic,subtitle:'Günün Renkleri',words,size,difficulty:i===0||i===3?'Rahat':i===4?'Ustalık':'Dengeli',note:definitions?'Tanımı çöz, kelimeyi bul.':'Kelimeler yatay, dikey, çapraz veya ters olabilir.',...(definitions?{clues:Object.fromEntries(words.map((word,n)=>[word,definitions[n]!]))}:{})} satisfies Journey;
 })};
}
/** Append-only authored pack. Chapter titles are the visible topics, with no separate override. */
export const EVERYDAY_ROUTES:CoastRoute[]=[
 route('renkler-bahce','Meyve Bahçesi','hayvanlar','morning',['Elma dalı','Limon çiçeği','Kurutma sepeti','Ceviz kabuğu','Kiraz çifti','Reçel kavanozu'],[
  ['Bahçe meyveleri','ELMA|ARMUT|AYVA|ERİK',6],
  ['Turunçgiller','LİMON|PORTAKAL|TURUNÇ|GREYFURT',8],
  ['Kuru meyveler','ÜZÜM|KAYISI|İNCİR|DUT',6,['Asmada salkımlar hâlinde yetişen, kurutularak da yenen meyve.','Turuncu renkli, tek çekirdekli; Malatya ile anılan meyve.','İçinde çok sayıda küçük çekirdek bulunan, tazesi ve kurusu yenen tatlı meyve.','Beyaz veya kara türleri olan, küçük taneleri bir arada duran; kurusu da yenen meyve.']],
  ['Kuruyemişler','CEVİZ|BADEM|FINDIK|FISTIK',6],
  ['Kırmızı meyveler','ÇİLEK|KİRAZ|VİŞNE|NAR|AHUDUDU',7],
  ['Meyveden lezzetler','REÇEL|HOŞAF|KOMPOSTO|PESTİL',8],
 ]),
 route('renkler-mutfak','Mutfakta Bir Gün','lezzetler','day',['Sebze sepeti','Bakliyat kavanozu','Tahta havan','Yoğurt kâsesi','Baharat kutusu','Çorba kâsesi'],[
  ['Sebzeler','PATATES|HAVUÇ|PIRASA|KABAK',7],
  ['Baklagiller','NOHUT|MERCİMEK|FASULYE|BAKLA',8],
  ['Mutfak gereçleri','RENDE|SÜZGEÇ|KEVGİR|HAVAN',6,['Sebze veya peyniri delikli yüzeyine sürterek ufaltmaya yarayan araç.','Yiyecekleri sudan ayırmak için kullanılan delikli veya tel kap.','Tenceredeki yiyecekleri suyunu süzerek almaya yarayan delikli kepçe.','Sarımsak veya baharatı bir tokmakla dövmeye yarayan kap.']],
  ['Süt ürünleri','AYRAN|YOĞURT|PEYNİR|KAYMAK',6],
  ['Baharatlar','KİMYON|TARÇIN|ZENCEFİL|ZERDEÇAL|KARANFİL',8],
  ['Çorbalar','TARHANA|YAYLA|EZOGELİN|İŞKEMBE',8],
 ]),
 route('renkler-atolye','El İşi Atölyesi','teknoloji','afternoon',['Renk paleti','İğnelik','Yün çilesi','Kumaş parçası','Ahşap kutu','Boncuk kolye'],[
  ['Resim gereçleri','FIRÇA|BOYA|PALET|TUVAL',6],
  ['Dikiş kutusu','İĞNE|İPLİK|MAKAS|YÜKSÜK',6],
  ['Örgü sepeti','ŞİŞ|TIĞ|YÜN|ÇİLE',6,['İlmekleri geçirerek örgü örmeye yarayan uzun, sivri uçlu çubuk.','Ucu kancalı küçük örgü aracı.','Koyun gibi hayvanların kıllarından elde edilen, iplik yapımında kullanılan lif.','İpliğin büyük halkalar hâlinde sarılmış demeti.']],
  ['Kumaşlar','KETEN|İPEK|SATEN|KADİFE',6],
  ['Ahşap atölyesi','ÇEKİÇ|TESTERE|ZIMPARA|KESKİ|MATKAP',7],
  ['Takılar','KOLYE|BİLEZİK|KÜPE|YÜZÜK',7],
 ]),
 route('renkler-muzik','Müzik Sokağı','muzik','night',['Nota sayfası','Gitar teli','Kaval','Küçük tef','Şarkı defteri','Konser bileti'],[
  ['Müzik yazısı','NOTA|PORTE|ÖLÇÜ|SUS',6],
  ['Telli çalgılar','GİTAR|BAĞLAMA|KEMAN|KANUN',7],
  ['Üflemeli çalgılar','FLÜT|NEY|KAVAL|KLARNET',7,['Yan tutularak da çalınan, delikli bir üflemeli çalgı.','Kamıştan yapılan, tasavvuf müziğinde de kullanılan üflemeli çalgı.','Çobanlarla özdeşleşen, genellikle ağaçtan yapılan üflemeli çalgı.','Tek kamışlı ağızlığı ve tuşları olan, çoğunlukla siyah gövdeli üflemeli çalgı.']],
  ['Vurmalı çalgılar','DAVUL|ZİL|TEF|BONGO',6],
  ['Şarkının bölümleri','KITA|NAKARAT|GİRİŞ|KÖPRÜ|FİNAL',7],
  ['Müzik toplulukları','KORO|TRİO|ORKESTRA|BANDO',8],
 ]),
];
export const EVERYDAY_CHAPTERS=EVERYDAY_ROUTES.flatMap(r=>r.chapters);
export const everydayRouteForChapter=(id?:string)=>EVERYDAY_ROUTES.find(r=>r.chapters.some(c=>c.id===id));
