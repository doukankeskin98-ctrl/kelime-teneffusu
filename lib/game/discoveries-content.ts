import type {Journey} from './content.ts';
import type {CoastRoute} from './coast-content.ts';
type Row=[topic:string,words:string,size:number,clues?:string[]];
function route(id:string,title:string,themeId:string,light:CoastRoute['light'],pieces:string[],rows:Row[]):CoastRoute{
 return {id,title,subtitle:'Küçük Keşifler',album:title+' albümü',light,pieces,chapters:rows.map(([topic,bank,size,definitions],i)=>{
  const words=bank.split('|');return {id:`${id}-${i+1}`,themeId,title:topic,subtitle:'Küçük Keşifler',words,size,difficulty:i===0||i===3?'Rahat':i===4?'Ustalık':'Dengeli',note:definitions?'Tanımı çöz, kelimeyi bul.':'Yatay, dikey, çapraz; tersten de seçebilirsin.',...(definitions?{clues:Object.fromEntries(words.map((word,n)=>[word,definitions[n]!]))}:{})} satisfies Journey;
 })};
}
/** Authored append-only pack. Each title is the actual target inclusion rule. */
export const DISCOVERIES_ROUTES:CoastRoute[]=[
 route('kesif-zanaat','Ustaların Sokağı','teknoloji','afternoon',['Seramik vazo','Deri cüzdan','Usta çekici','Cam sürahi','Mermer parçası','Kumpas'],[
  ['Seramik kaplar','VAZO|TESTİ|KÜP|TABAK',6],
  ['Deri eşyalar','ÇANTA|KEMER|CÜZDAN|ELDİVEN',7],
  ['Metal atölyesi','ÖRS|KÖRÜK|MAŞA|PERÇİN',6,['Isıtılan metalin çekiçle dövüldüğü ağır demir blok.','Ateşi canlandırmak için hava üfleyen araç.','Kızgın parçaları tutmaya yarayan kıskaçlı araç.','İki parçayı birleştirmek için ucu ezilerek sabitlenen metal çivi.']],
  ['Cam eşyalar','BARDAK|SÜRAHİ|ŞİŞE|KAVANOZ',7],
  ['Yapı taşları','MERMER|GRANİT|BAZALT|KALKER|KAYRAK',7],
  ['Ölçüm araçları','METRE|CETVEL|KUMPAS|GÖNYE',6],
 ]),
 route('kesif-kitap','Kitap Köşesi','okul','day',['Öykü kitabı','Kitap kapağı','Noktalama kartı','Raf etiketi','Yazı sayfası','Editör notu'],[
  ['Edebiyat türleri','ROMAN|ÖYKÜ|MASAL|ŞİİR',6],
  ['Kitabın parçaları','KAPAK|ÖNSÖZ|DİZİN|SAYFA',6],
  ['Noktalama','VİRGÜL|NOKTA|TIRNAK|TİRE',6,['Eş görevli kelimeleri ayıran, kısa duraklamayı gösteren işaret.','Tamamlanmış cümlenin sonuna konan küçük yuvarlak işaret.','Alıntı sözlerin başına ve sonuna konan çift işaret.','Satır sonunda bölünen kelimede kullanılan kısa çizgi.']],
  ['Kitaplıkta','RAF|KİTAP|AYRAÇ|ETİKET',6],
  ['Yazının düzeni','SATIR|PARAGRAF|SÜTUN|BAŞLIK|DİPNOT',8],
  ['Kitabı hazırlayanlar','YAZAR|EDİTÖR|ÇEVİRMEN|ÇİZER',8],
 ]),
 route('kesif-yolculuk','Yolcu Günlüğü','dunya','morning',['Otobüs bileti','Tramvay rayı','Kano küreği','Planör kanadı','Yol krokisi','Pasaport'],[
  ['Kara taşıtları','OTOMOBİL|OTOBÜS|KAMYON|MİNİBÜS',8],
  ['Raylı taşıtlar','TREN|TRAMVAY|METRO|VAGON',7],
  ['Su taşıtları','VAPUR|FERİBOT|GONDOL|KANO',7,['Şehir içi deniz ulaşımında yolcu taşıyan büyük tekne.','Yolcularla birlikte otomobil de taşıyan gemi.','Venedik kanallarıyla anılan, uzun ve dar tekne.','Kürekle ilerletilen, hafif ve dar küçük tekne.']],
  ['Hava taşıtları','UÇAK|PLANÖR|BALON|ZEPLİN',6],
  ['Yolun bölümleri','ŞERİT|BANKET|KAVŞAK|KALDIRIM|REFÜJ',8],
  ['Yolculuk belgeleri','PASAPORT|BİLET|VİZE|KİMLİK',8],
 ]),
 route('kesif-zaman','Zamanın İzinde','uzay','night',['Hafta çizelgesi','Takvim yaprağı','Kum saati','Mevsim kartı','Saat kadranı','Gün batımı'],[
  ['Haftanın günleri','PAZAR|SALI|CUMA|PERŞEMBE',8],
  ['Aylar','OCAK|NİSAN|TEMMUZ|EKİM',6],
  ['Zaman ölçüleri','SANİYE|DAKİKA|SAAT|HAFTA',6,['Bir dakikanın altmışta biri.','Altmış saniyelik süre.','Altmış dakikalık süre.','Yedi günlük süre.']],
  ['Mevsimler','İLKBAHAR|YAZ|SONBAHAR|KIŞ',8],
  ['Saatin parçaları','AKREP|YELKOVAN|KADRAN|PİL|ZEMBEREK',8],
  ['Günün vakitleri','SABAH|ÖĞLE|İKİNDİ|AKŞAM|GECE',6],
 ]),
];
export const DISCOVERIES_CHAPTERS=DISCOVERIES_ROUTES.flatMap(r=>r.chapters);
export const discoveriesRouteForChapter=(id?:string)=>DISCOVERIES_ROUTES.find(r=>r.chapters.some(c=>c.id===id));
