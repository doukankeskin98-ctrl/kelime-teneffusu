import type {Journey} from './content.ts';

/** Kıyı Günlüğü v1. Published rows are append-only, including word order and size. */
export interface CoastRoute {id:string;title:string;subtitle:string;album:string;pieces:string[];chapters:Journey[];light:'morning'|'day'|'afternoon'|'night'}
type Row=[title:string,words:string,size:number,clues?:string[]];
function route(id:string,title:string,subtitle:string,album:string,light:CoastRoute['light'],pieces:string[],rows:Row[]):CoastRoute{
 return {id,title,subtitle,album,light,pieces,chapters:rows.map(([topic,bank,size,definitions],i)=>{
  const words=bank.split('|');return {id:`${id}-${i+1}`,themeId:light==='day'?'lezzetler':light==='afternoon'?'hayvanlar':'dunya',title:topic,subtitle,words,size,difficulty:i===0||i===3?'Rahat':i===4?'Ustalık':'Dengeli',note:definitions?'Tanımı çöz, cevabı tahtada bul.':'Yatay, dikey ve çapraz. Kelimeleri tersten de seçebilirsin.',...(definitions?{clues:Object.fromEntries(words.map((word,n)=>[word,definitions[n]!]))}:{})};
 })};
}
export const COAST_ROUTES:CoastRoute[]=[
 route('kiyi-liman','Limanda Sabah','Kıyı Günlüğü · 1. rota','Limanın ilk ışığı','morning',['Halat halkası','Cep pusulası','Küçük çapa','Kıyı taşı','Beyaz yelken','Vapur bileti'],[
  ['İskelede',['TEKNE','HALAT','İSKELE','GÜVERTE'].join('|'),7],
  ['Rotanı çiz','PUSULA|HARİTA|ROTA|YÖN',7],
  ['Teknenin parçaları','DÜMEN|ÇAPA|KÜREK|FİLİKA',7,['Teknenin yönünü değiştirmeye yarayan düzenek.','Tekneyi sabitlemek için denize indirilen ağır araç.','Suyu iterek tekneyi ilerleten uzun araç.','Gemide taşınan küçük kurtarma teknesi.']],
  ['Kıyıda bir mola','MARTI|DALGA|KÖPÜK|KUM',6],
  ['Yelken açılıyor','YELKEN|RÜZGAR|AKINTI|AÇIKLAR|DÜĞÜM',8],
  ['İlk sefer','FENER|LİMAN|VAPUR|SEFER',7],
 ]),
 route('kiyi-carsi','Çarşı Sokakları','Kıyı Günlüğü · 2. rota','Çarşının renkleri','day',['Pazar sepeti','Kahvaltı tabağı','Fiyat etiketi','Çay bardağı','Susam tanesi','Fırın tepsisi'],[
  ['Pazar kuruluyor','SEPET|TEZGAH|TERAZİ|KASA',6],
  ['Kahvaltılık tezgâhı','ZEYTİN|PEYNİR|REÇEL|KAYMAK',7],
  ['Alışveriş çantası','KESE|TARTI|ETİKET|BOZUKLUK',8,['Ağzı büzülen küçük torba.','Bir şeyin ağırlığını ölçen araç.','Ürünün adını veya fiyatını gösteren küçük kâğıt.','Alışverişte kullanılan madeni paralar.']],
  ['Çay molası','SİMİT|ÇAY|TOST|BAL',6],
  ['Fırında hazırlık','HAMUR|FIRIN|SUSAM|MAYA|UN',7],
  ['Sıcak tepsi','KEK|BÖREK|KURABİYE|POĞAÇA',8],
 ]),
 route('kiyi-patika','Kıyı Patikası','Kıyı Günlüğü · 3. rota','Patikanın izleri','afternoon',['Patika taşı','Kuş tüyü','Çam kozalağı','Papatya','Kelebek izi','Gölgeli kıyı'],[
  ['Ağaçların arasından','PATİKA|ÇAM|OT|TAŞ',6],
  ['Daldaki sesler','SERÇE|SAKA|BÜLBÜL|SAKSAĞAN',8],
  ['Ağacın izleri','KOZALAK|YAPRAK|KABUK|KÖK',7,['Çam gibi ağaçların tohumlarını taşıyan sert yapı.','Ağacın dalında büyüyen yassı, çoğu zaman yeşil bölüm.','Ağacın gövdesini dıştan örten katman.','Bitkiyi toprağa bağlayan, suyu alan bölüm.']],
  ['Çiçekli köşe','LALE|GÜL|MENEKŞE|PAPATYA',7],
  ['Küçük komşular','KELEBEK|KİRPİ|SİNCAP|KARINCA',8],
  ['Serin gölge','ÇİMEN|DERE|ÇİÇEK|TOPRAK|GÖLGE',7],
 ]),
 route('kiyi-fener','Fenerde Akşam','Kıyı Günlüğü · 4. rota','Akşamın feneri','night',['Fener anahtarı','Ufuk çizgisi','Cam mercek','Ay ışığı','Gece yıldızı','Kıyı kartpostalı'],[
  ['Fenerin kapısı','FENER|KULE|LAMBA|IŞIK',6],
  ['Gün batarken','GÜNEŞ|UFUK|BULUT|BATI',7],
  ['Işığın yolu','MERCEK|CAM|AYNA|PRİZMA',7,['Işığı toplayan veya dağıtan özel biçimli saydam parça.','Pencerelerde kullanılan sert, saydam malzeme.','Üzerine düşen görüntüyü yansıtan parlak yüzey.','Beyaz ışığı renklerine ayırabilen saydam optik cisim.']],
  ['Gece sessizliği','AY|GECE|YILDIZ|UYKU',6],
  ['Göğe son bakış','DOLUNAY|GÖKYÜZÜ|PARILTI|KARANLIK',8],
  ['Kıyıdan hatıra','KART|RESİM|PUL|ZARF|HATIRA',7],
 ]),
];
export const COAST_CHAPTERS=COAST_ROUTES.flatMap(r=>r.chapters);
export const coastRouteForChapter=(id?:string)=>COAST_ROUTES.find(r=>r.chapters.some(c=>c.id===id));
