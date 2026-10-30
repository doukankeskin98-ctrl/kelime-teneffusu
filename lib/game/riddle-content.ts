import type {Journey} from './content.ts';

/** Reviewed riddle-v1 vocabulary. Published IDs, answers and definitions are immutable. */
export const RIDDLE_BANKS:{themeId:string;title:string;items:readonly (readonly [string,string])[]}[]=[
 {themeId:'hayvanlar',title:'Doğanın sırları',items:[
  ['FİL','Hortumu olan büyük memeli.'],['ASLAN','Erkeğinin yelesi olan büyük kedi.'],['KAPLAN','Turuncu kürkünde siyah çizgiler olan büyük kedi.'],['ZEBRA','Siyah beyaz çizgili Afrika otçulu.'],
  ['ZÜRAFA','Çok uzun boynuyla yüksek dallara ulaşır.'],['KOALA','Okaliptüs yaprakları yiyen keseli.'],['PANDA','Bambu yiyen siyah beyaz ayı.'],['TAVŞAN','Uzun kulakları ve güçlü arka bacakları vardır.'],
  ['YUNUS','Sıçrayışlarıyla tanınan, balinaya akraba deniz memelisi.'],['BALİNA','Dev türleri bulunan deniz memelisi.'],['PENGUEN','Uçamayan, kanatlarıyla yüzen siyah beyaz kuş.'],['MARTI','Deniz kıyısında sık görülen beyaz gri kuş.'],
  ['BAYKUŞ','Çoğu türü gece avlanan, iri gözlü kuş.'],['KİRPİ','Sırtı dikenlerle kaplı küçük memeli.'],['SİNCAP','Ağaçlarda yaşayan, kabarık kuyruklu kemirgen.'],['ARI','Çiçeklerden nektar toplayan bal üreticisi.'],
  ['KARINCA','Koloniler kuran, antenli küçük böcek.'],['KELEBEK','Tırtıldan dönüşen, renkli kanatlı böcek.'],
 ]},
 {themeId:'lezzetler',title:'Sofranın sırları',items:[
  ['EKMEK','Unlu hamurun pişirilmesiyle yapılan temel yiyecek.'],['SİMİT','Üzeri susamlı, halka biçimli hamur işi.'],['BÖREK','Yufka katları arasına iç konan hamur işi.'],['PİDE','Genellikle uzun biçimde yapılan, üzeri içli hamur işi.'],
  ['MANTI','Küçük hamur bohçalarıyla yapılan, yoğurtlu yemek.'],['DOLMA','İçi oyulmuş sebzenin harçla doldurulduğu yemek.'],['SARMA','İç harcın yaprağa dolanmasıyla yapılan yemek.'],['PİLAV','Taneli kalacak biçimde pişirilen pirinç yemeği.'],
  ['AYRAN','Yoğurt, su ve tuzla yapılan içecek.'],['YOĞURT','Sütün mayalanmasıyla oluşan kaşıkla yenen besin.'],['PEYNİR','Sütün pıhtılaştırılmasıyla yapılan kahvaltılık.'],['BAL','Arıların ürettiği yoğun tatlı besin.'],
  ['ZEYTİN','Salamurası yenilen, yağı da çıkarılan meyve.'],['TAHİN','Öğütülmüş susamdan yapılan koyu ezme.'],['PEKMEZ','Meyve suyunun koyulaştırılmasıyla yapılan tatlı ürün.'],['BAKLAVA','İnce yufkalı, fıstık ya da cevizli şerbetli tatlı.'],
  ['SÜTLAÇ','Süt ve pirinçle yapılan kaşık tatlısı.'],['AŞURE','Buğday, bakliyat ve kuru meyveli geleneksel tatlı.'],
 ]},
 {themeId:'muzik',title:'Seslerin sırları',items:[
  ['NOTA','Müzikte bir sesin yazılı işareti.'],['AKOR','Birlikte duyulan uyumlu sesler topluluğu.'],['RİTİM','Müzikte düzenli vuruş ve süre örüntüsü.'],['MELODİ','Birbiri ardına gelen seslerden oluşan ezgi.'],
  ['KORO','Birlikte şarkı söyleyen topluluk.'],['SOLİST','Bir eserde tek başına öne çıkan yorumcu.'],['GİTAR','Telleri parmakla veya penayla çalınan perdeli çalgı.'],['KEMAN','Çene altında tutulan küçük yaylı çalgı.'],
  ['FLÜT','Yana tutularak üflenen ince borulu çalgı.'],['DAVUL','Gergin derisine vurularak çalınan çalgı.'],['PİYANO','Siyah beyaz tuşlarla tellerine çekiç vuran çalgı.'],['BAĞLAMA','Uzun saplı, tezene ile de çalınan halk çalgısı.'],
  ['KLARNET','Tek kamışlı ağızlığı olan üflemeli çalgı.'],['ÇELLO','Dizler arasında tutulan büyük yaylı çalgı.'],['KONSER','Müziğin dinleyici önünde canlı sunumu.'],['NAKARAT','Şarkıda aynı sözlerle geri gelen bölüm.'],
  ['PLAK','İğneyle okunan yuvarlak müzik kaydı.'],['ALKIŞ','Beğeniyi elleri birbirine vurarak gösterme.'],
 ]},
 {themeId:'dunya',title:'Yolun sırları',items:[
  ['HARİTA','Bir yerin kuşbakışı çizilmiş gösterimi.'],['PUSULA','Manyetik iğnesiyle yön bulmaya yarayan araç.'],['VALİZ','Yolculuk eşyalarının konduğu taşıma çantası.'],['BİLET','Bir yolculuğa ya da etkinliğe giriş belgesi.'],
  ['PASAPORT','Yurt dışı yolculuklarında kullanılan kimlik belgesi.'],['VİZE','Bir ülkeye giriş için gereken izin türü.'],['LİMAN','Gemilerin yanaşıp yük ve yolcu aldığı yer.'],['FENER','Deniz kıyısında ışıkla gemilere yol gösteren yapı.'],
  ['KÖPRÜ','Bir engelin iki yanını üstten birleştiren yapı.'],['TÜNEL','Yer altından veya dağın içinden geçen yol.'],['ADA','Dört yanı suyla çevrili kara parçası.'],['YARIMADA','Üç yanı suyla çevrili kara parçası.'],
  ['KITA','Yeryüzündeki çok büyük kara bölümlerinden biri.'],['OKYANUS','Kıtalar arasında uzanan çok büyük su kütlesi.'],['EKVATOR','Dünya’yı kuzey ve güney yarıya ayıran hayali çember.'],['KUTUP','Dünya ekseninin yüzeyle kesiştiği iki uçtan biri.'],
  ['ÇÖL','Yağışın çok az olduğu kurak bölge.'],['VADİ','Akarsuyun aşındırmasıyla oluşabilen uzun çukur alan.'],
 ]},
 {themeId:'bilim',title:'Merakın sırları',items:[
  ['ATOM','Bir elementin kimyasal özelliğini taşıyan en küçük birimi.'],['HÜCRE','Canlıların temel yapı ve işlev birimi.'],['PROTON','Atom çekirdeğinin artı yüklü parçacığı.'],['NÖTRON','Atom çekirdeğinin yüksüz parçacığı.'],
  ['ELEKTRON','Atomun eksi yüklü parçacığı.'],['MOLEKÜL','Kimyasal bağlarla birleşmiş atom topluluğu.'],['MERCEK','Işığı kırıp görüntüyü odaklayan saydam parça.'],['MIKNATIS','Demir gibi bazı maddeleri kendine çeken nesne.'],
  ['DENEY','Bir fikri kontrollü koşullarda sınama işi.'],['GÖZLEM','Olayı dikkatle izleyip bilgi toplama.'],['ÖLÇÜM','Bir büyüklüğü belirli bir birimle karşılaştırma.'],['ENERJİ','Bir sistemin iş yapabilme kapasitesi.'],
  ['KUVVET','Bir cismi iten veya çeken etki.'],['DALGA','Enerjinin titreşimlerle yayılma biçimi.'],['IŞIK','Görmemizi sağlayan elektromanyetik ışıma.'],['SES','Bir ortamda yayılan ve kulağın algılayabildiği titreşim.'],
  ['DOKU','Benzer görevli hücrelerin oluşturduğu yapı.'],['GEN','Kalıtsal bilginin işlevsel birimi.'],
 ]},
 {themeId:'teknoloji',title:'Atölyenin sırları',items:[
  ['EKRAN','Dijital görüntünün gösterildiği yüzey.'],['KLAVYE','Harf ve komut girmeye yarayan tuş takımı.'],['FARE','İmleci el hareketiyle yöneten masaüstü aygıtı.'],['YAZICI','Dijital belgeyi kâğıda aktaran aygıt.'],
  ['TARAYICI','Web sitelerini gezmek için kullanılan program.'],['İŞLEMCİ','Bilgisayarda komutları yürüten ana birim.'],['BELLEK','Bilgisayarda verileri tutan birimlerin genel adı.'],['YAZILIM','Bilgisayara ne yapacağını söyleyen programlar.'],
  ['DONANIM','Bir bilgisayarın elle tutulabilen parçaları.'],['SUNUCU','Ağdaki diğer cihazlara hizmet veren bilgisayar.'],['ROBOT','Programlandığı işleri yapan otomatik makine.'],['SENSÖR','Isı veya hareket gibi değişimleri algılayan aygıt.'],
  ['YONGA','Küçük bir yüzeye işlenmiş elektronik devre parçası.'],['PİKSEL','Dijital görüntüyü oluşturan küçük renk noktası.'],['ŞİFRE','Bir hesaba erişimi koruyan gizli karakter dizisi.'],['MODEM','İletişim sinyallerini bağlantıya uygun biçime çeviren aygıt.'],
  ['DEVRE','Elektrik akımının izlediği bağlantılı düzen.'],['ANTEN','Radyo dalgalarını alan veya yayan düzenek.'],
 ]},
 {themeId:'uzay',title:'Göğün sırları',items:[
  ['GÜNEŞ','Dünya’ya en yakın yıldız.'],['DÜNYA','Üzerinde yaşadığımız gezegen.'],['AY','Dünya’nın doğal uydusu.'],['MARS','Kızıl gezegen olarak tanınır.'],
  ['VENÜS','Güneş’e yakınlıkta ikinci gezegen.'],['MERKÜR','Güneş’e en yakın gezegen.'],['JÜPİTER','Güneş sisteminin en büyük gezegeni.'],['SATÜRN','Geniş ve belirgin halka sistemiyle tanınan gezegen.'],
  ['URANÜS','Dönme ekseni yörüngesine göre çok yatık buz devi.'],['NEPTÜN','Güneş’e en uzak gezegen.'],['UYDU','Bir gök cisminin çevresinde dolanan cisim.'],['ROKET','Püskürttüğü gazla uzaya doğru itilen araç.'],
  ['YILDIZ','Çekirdeğindeki tepkimelerle enerji üreten gök cismi.'],['GALAKSİ','Yıldız, gaz ve tozdan oluşan büyük kütleçekim sistemi.'],['BULUTSU','Uzaydaki gaz ve toz bulutu.'],['METEOR','Atmosfere giren küçük cismin oluşturduğu ışık olayı.'],
  ['KRATER','Çarpma sonucunda da oluşabilen çanak biçimli çukur.'],['EVREN','Uzay, zaman, madde ve enerjinin bütünü.'],
 ]},
 {themeId:'basketbol',title:'Parkenin sırları',items:[
  ['POTA','Basketbolda çember ve panyanın bulunduğu hedef.'],['FİLE','Basketbol çemberinden aşağı sarkan ağ.'],['TOP','Oyuncuların sürdüğü ve çembere attığı yuvarlak nesne.'],['PAS','Topu takım arkadaşına aktarma.'],
  ['ŞUT','Sayı kazanmak için topu çembere atma.'],['SMAÇ','Topu yukarıdan çemberin içine kuvvetle bırakma.'],['RİBAUNT','Kaçan atışın ardından topu kazanma.'],['ASİST','Takım arkadaşının sayısına doğrudan yardım eden pas.'],
  ['BLOK','Rakibin şutunu kurallar içinde elle engelleme.'],['FAUL','Kurallara aykırı oyuncu teması.'],['MOLA','Takımın oyun sırasında istediği kısa ara.'],['PARKE','Basketbol salonunda kullanılan ahşap zemin.'],
  ['PİVOT','Çember yakınında oynayan uzun oyuncunun pozisyonu.'],['ÜÇLÜK','Yayın gerisinden kazanılan üç sayılık basket.'],['PERİYOT','Basketbol maçının ana süre bölümlerinden biri.'],['UZATMA','Beraberlik sürünce oynanan ek süre.'],
  ['TRİBÜN','Seyircilerin oturduğu basamaklı bölüm.'],['HAKEM','Maçta kuralları uygulayan görevli.'],
 ]},
];
export const riddleId=(themeId:string,answer:string)=>`riddle-v1:${themeId}:${answer}`;
const TITLES=['İlk ipuçları','Saklı yanıtlar','Bir bağlantı daha','Son ipuçları'];
export const RIDDLE_CHAPTERS:Journey[]=RIDDLE_BANKS.flatMap(bank=>TITLES.map((title,i)=>{
 const items=bank.items.filter((_,n)=>n<16&&n%4===i),words=items.map(([answer])=>answer);
 return {id:`riddle-${bank.themeId}-${i+1}`,themeId:bank.themeId,title:`${bank.title} · ${title}`,subtitle:'Tanımı oku, cevabı tahtada bul.',words,size:Math.max(6,...words.map(w=>w.length)),difficulty:i<2?'Rahat':'Dengeli',note:'İpucu Avı: her tanım bir kelimeyi anlatır. Harf sayısına bak; yatay, dikey ve çapraz ara.',clues:Object.fromEntries(items)} as Journey;
}));
export const isRiddleChapter=(id?:string)=>RIDDLE_CHAPTERS.some(chapter=>chapter.id===id);
