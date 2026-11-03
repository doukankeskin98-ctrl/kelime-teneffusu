import type {Journey} from './content.ts';
import type {CoastRoute} from './coast-content.ts';

type Row=[topic:string,words:string,size:number,clues?:string[]];
function route(id:string,title:string,themeId:string,light:CoastRoute['light'],pieces:string[],rows:Row[]):CoastRoute{
 return {id,title,subtitle:'Doğa Günlüğü',album:title+' albümü',light,pieces,chapters:rows.map(([topic,bank,size,definitions],i)=>{
  const words=bank.split('|');return {id:`${id}-${i+1}`,themeId,title:topic,subtitle:'Doğa Günlüğü',words,size,difficulty:i===0||i===3?'Rahat':i===4?'Ustalık':'Dengeli',note:definitions?'Tanımı çöz, kelimeyi bul.':'Kelimeler yatay, dikey, çapraz veya ters olabilir.',...(definitions?{clues:Object.fromEntries(words.map((word,n)=>[word,definitions[n]!]))}:{})} satisfies Journey;
 })};
}
/** Authored append-only pack. Four routes alternate discovery, clues and a breathing level. */
export const NATURE_ROUTES:CoastRoute[]=[
 route('doga-bahce','Bahçede İlkbahar','hayvanlar','morning',['Tohum kesesi','Filiz','Sera camı','Çiçek tacı','Toprak saksı','Bahçe defteri'],[
  ['Toprağa ilk dokunuş','TOHUM|SAKSI|KÜREK|FİDE',6],
  ['Yeşeren bahçe','FİLİZ|TOMURCUK|SÜRGÜN|FİDAN',8],
  ['Seranın içinde','SERA|GÜBRE|SULAMA|ÇAPA',6,['Bitkileri soğuktan koruyan, ışık geçiren yetiştirme yapısı.','Toprağın verimini artırmak için eklenen madde.','Bitkilerin su ihtiyacını karşılama işi.','Toprağı kabartmak ve yabani otları temizlemek için kullanılan el aleti.']],
  ['Renkli yapraklar','MOR|SARI|PEMBE|BEYAZ',6],
  ['Bahçenin kokusu','LAVANTA|NANE|FESLEĞEN|KEKİK|ADAÇAYI',8],
  ['Hasat sepeti','DOMATES|BİBER|MARUL|TURP',7],
 ]),
 route('doga-dere','Dere Boyunca','bilim','day',['Düz çakıl','Su halkası','Saz yaprağı','Yusufçuk','Ahşap köprü','Dere resmi'],[
  ['Suyun kenarında','ÇAKIL|SAZ|KIYI|YOSUN',6],
  ['Akıp giden su','PINAR|ŞELALE|AKARSU|IRMAK',7],
  ['Suyun şekilleri','BUZ|BUHAR|DAMLA|ÇİY',6,['Suyun donmuş, katı hâli.','Suyun gaz hâli.','Küçük, yuvarlak bir su parçası.','Serin sabahlarda yüzeylerde oluşan küçük su damlaları.']],
  ['Köprüde mola','KÖPRÜ|TAHTA|KORKULUK|AYAK',8],
  ['Dere komşuları','KURBAĞA|SU SAMURU|YUSUFÇUK|BALIK',8],
  ['Vadinin içinden','VADİ|YAMAÇ|KAYA|TÜNEL|GEÇİT',7],
 ]),
 route('doga-kamp','Vadide Kamp','bilim','afternoon',['Çadır kazığı','Mat','Düğüm','Çelik kupa','Yürüyüş izi','Kamp rozeti'],[
  ['Kamp kuruluyor','ÇADIR|KAZIK|MAT|İP',6],
  ['Sırt çantası','TERMOS|DÜDÜK|FENER|ÇAKI',6],
  ['Yolda gerekenler','PUSULA|BOT|PONÇO|BATON',7,['Yön bulmak için kullanılan, iğnesi kuzeyi gösteren araç.','Ayak bileğini de örten dayanıklı ayakkabı.','Baştan geçirilerek giyilen, yağmurdan koruyan geniş örtü.','Yürüyüşte dengeye yardımcı olan elde taşınan çubuk.']],
  ['Küçük bir sofra','KUPA|KAŞIK|TABAK|SU',6],
  ['Hava değişiyor','SİS|RÜZGAR|YAĞMUR|DOLU|KIRAĞI',7],
  ['Dönüş yolu','İZ|PATİKA|TABELA|DÖNEMEÇ',7],
 ]),
 route('doga-gozlem','Yıldızlı Gece','uzay','night',['Gözlem notu','Hilal','Takımyıldız','Dürbün','Işık izi','Gece kartı'],[
  ['Akşam göğü','AKŞAM|ALACA|BATI|UFUK',6],
  ['Ayın yüzleri','HİLAL|DOLUNAY|EVRE|KRATER',7],
  ['Göğe bakarken','DÜRBÜN|MERCEK|TRİPOD|OKÜLER',7,['İki gözle bakılarak uzaktaki nesneleri yakın gösteren optik araç.','Işığı toplayan veya dağıtan saydam optik parça.','Bir aracı sabit tutan üç ayaklı destek.','Teleskopta gözün yaklaştırıldığı mercekli bölüm.']],
  ['Gece sesleri','CIRCIR|BAYKUŞ|ESİNTİ|HIŞIRTI',7],
  ['Gökyüzü haritası','KUTUP|ZODYAK|EKVATOR|YÖRÜNGE|EKSEN',7],
  ['Gözlem defteri','TARİH|SAAT|ÇİZİM|NOT|KAYIT',6],
 ]),
];
export const NATURE_CHAPTERS=NATURE_ROUTES.flatMap(r=>r.chapters);
export const natureRouteForChapter=(id?:string)=>NATURE_ROUTES.find(r=>r.chapters.some(c=>c.id===id));
