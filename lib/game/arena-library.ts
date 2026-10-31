import {ARENA_BANKS} from './arena-content.ts';
import {RIDDLE_BANKS,riddleId} from './riddle-content.ts';

// Competition-only additions. Published solo chapters and legacy definitions are untouched.
// Each line is a whole answer (at most eight Turkish letters) and its authored clue.
const additions:Record<string,string>={
hayvanlar:`
KEDİ|Miyavlayan, bıyıklı evcil hayvan.
KÖPEK|Havlayarak ses çıkaran evcil hayvan.
AT|Kişneyen, yelesi ve toynakları olan binek hayvanı.
EŞEK|Anırmasıyla tanınan uzun kulaklı yük hayvanı.
KATIR|At ile eşeğin çiftleşmesinden doğan yük hayvanı.
İNEK|Sütü sağılan dişi sığır.
BOĞA|Sığırın yetişkin erkeği.
BUZAĞI|Sığırın henüz çok küçük yavrusu.
KOYUN|Yünü kırkılan evcil sürü hayvanı.
KUZU|Koyunun yavrusu.
KEÇİ|Tırmanışta becerikli, sakallı olabilen evcil hayvan.
OĞLAK|Keçinin yavrusu.
DEVE|Sırtında hörgüç bulunan çöl hayvanı.
TAVUK|Yumurtası için de yetiştirilen kümes kuşu.
HOROZ|Sabah ötüşüyle tanınan erkek kümes kuşu.
CİVCİV|Yumurtadan yeni çıkmış tavuk yavrusu.
ÖRDEK|Geniş gagalı, perdeli ayaklı su kuşu.
KAZ|Uzun boyunlu, tıslayabilen iri kümes kuşu.
HİNDİ|Erkeği kuyruğunu yelpaze gibi açan kümes kuşu.
GÜVERCİN|Yön bulma becerisiyle eskiden haber taşımada da kullanılan kuş.
SERÇE|Şehirlerde de yaşayan küçük, kahverengi gri kuş.
KARGA|Siyah tüyleri ve gaklamasıyla tanınan kuş.
LEYLEK|Uzun kırmızı gagalı, göç eden beyaz siyah kuş.
BÜLBÜL|Güzel ötüşüyle şiirlere konu olan küçük kuş.
KANARYA|Sarı türleriyle tanınan, kafeste de beslenen ötücü kuş.
PAPAĞAN|Bazı türleri insan sesini taklit eden renkli kuş.
TAVUS|Erkeği göz desenli kuyruğunu büyükçe açan kuş.
KUĞU|Uzun kıvrık boynuyla su üzerinde süzülen kuş.
PELİKAN|Gagasının altında geniş bir kese bulunan su kuşu.
ŞAHİN|Gündüz avlanan, kıvrık gagalı yırtıcı kuş.
AKBABA|Çoğunlukla leşle beslenen iri yırtıcı kuş.
YARASA|Zar kanatlarıyla uçan memeli.
TİLKİ|Sivri burunlu, gür kuyruklu yabani köpekgil.
KURT|Sürü hâlinde avlanabilen yabani köpekgil.
AYI|Bal düşkünlüğüyle masallara giren iri memeli.
GEYİK|Erkeklerinin çoğunda dallı boynuz bulunan otçul.
CEYLAN|İnce bacaklı, hızlı koşan zarif otçul.
SIĞIN|Geniş, yassı boynuzlarıyla tanınan iri geyik.
SUAYGIRI|Günün çoğunu suda geçiren, iri gövdeli Afrika memelisi.
GERGEDAN|Burnunun üzerinde boynuz taşıyan iri otçul.
KANGURU|Güçlü arka ayaklarıyla sıçrayan Avustralya keselisi.
KÖSTEBEK|Toprak altında tüneller kazan küçük memeli.
SANSAR|Uzun gövdeli, kısa bacaklı çevik küçük yırtıcı.
KUNDUZ|Dallarla suya bent kuran, yassı kuyruklu kemirgen.
RAKUN|Göz çevresindeki koyu maske ve halkalı kuyruğuyla tanınır.
LEMUR|Madagaskar ile özdeşleşen, uzun kuyruklu primat.
GORİL|İri yapılı, kuyruksuz Afrika primatı.
MAKAK|Yanak keseleri bulunan bir maymun grubu.
ŞEMPANZE|Alet kullanabilen, Afrika kökenli kuyruksuz primat.
FOK|Yüzgeç biçimli üyeleri olan deniz memelisi.
MORS|Uzun üst köpek dişleriyle tanınan kutup deniz memelisi.
AHTAPOT|Sekiz kollu, mürekkep püskürtebilen deniz canlısı.
KALAMAR|Uzun gövdeli, on uzantılı deniz yumuşakçası.
YENGEÇ|Yan yürüyüşü ve kıskaçlarıyla tanınan kabuklu.
ISTAKOZ|İri kıskaçlı, uzun gövdeli deniz kabuklusu.
KARİDES|İnce uzun gövdeli küçük deniz kabuklusu.
MİDYE|İki parçalı koyu kabuğu olan deniz yumuşakçası.
SOMON|Pembe etiyle bilinen, üremek için akarsulara göç eden balık.
ALABALIK|Serin ve temiz sularda yaşayan benekli balık.
HAMSİ|Karadeniz mutfağıyla özdeş küçük sürü balığı.
PALAMUT|Sonbaharda sık avlanan, sırtı çizgili deniz balığı.
LEVREK|Gümüş renkli, avcı bir kıyı balığı.
ÇİPURA|Gözleri arasında altın renkli bant bulunan deniz balığı.
SAZAN|Göllerde de yaşayan, ağız kenarı bıyıklı balık.
YILAN|Bacaksız, pullu gövdeli sürüngen.
TİMSAH|Güçlü çeneli, suda da avlanan iri sürüngen.
KURBAĞA|Yavrusu iribaş olan, sıçrayarak ilerleyen amfibi.
SEMENDER|Kuyruğu yetişkinliğinde de kalan amfibi.
ÇEKİRGE|Güçlü arka bacaklarıyla sıçrayan böcek.
CIRCIR|Kanatlarını sürterek ses çıkaran böcek.
SİNEK|Evlerde de görülen, bir çift kanatlı küçük böcek.
GÜVE|Larvası yünlü giysilere zarar verebilen küçük kelebek.
ÖRÜMCEK|Sekiz bacaklı, ağ örebilen eklembacaklı.
AKREP|Kuyruğunun ucunda zehirli iğnesi olan eklembacaklı.
SOLUCAN|Toprakta yaşayan, bacaksız ve halkalı gövdeli canlı.
SÜLÜK|Vantuzları olan, bazı türleri kan emen halkalı canlı.
`,
lezzetler:`
ELMA|Çekirdek evi olan, kırmızı veya yeşil yenebilen meyve.
ARMUT|Genellikle sapına doğru daralan, sulu meyve.
AYVA|Sarı, sert ve kokulu; reçeli de yapılan meyve.
ERİK|Yeşil veya mor türleri olan, tek çekirdekli meyve.
KİRAZ|Uzun saplı, küçük kırmızı yaz meyvesi.
VİŞNE|Kiraza benzeyen, daha ekşi meyve.
ŞEFTALİ|Tüylü kabuklu, iri çekirdekli yaz meyvesi.
KAYISI|Turuncu renkli, kurutularak da yenen meyve.
İNCİR|İçi çok sayıda küçük çekirdekle dolu yumuşak meyve.
ÜZÜM|Asmada salkımlar hâlinde yetişen meyve.
KARPUZ|Yeşil kabuklu, içi çoğunlukla kırmızı büyük yaz meyvesi.
KAVUN|Sarı kabuklu türleriyle bilinen, kokulu yaz meyvesi.
ÇİLEK|Küçük çekirdekleri dış yüzeyinde görülen kırmızı meyve.
AHUDUDU|Küçük tanelerin birleşmesiyle oluşan kırmızı orman meyvesi.
DUT|Ağaçta yetişen, beyaz veya koyu mor küçük meyve.
NAR|Kalın kabuğunun içinde çok sayıda sulu kırmızı tane bulunur.
MUZ|Sarı kabuğu soyularak yenen kıvrık tropikal meyve.
KİVİ|Dışı kahverengi tüylü, içi yeşil ve küçük siyah çekirdekli meyve.
ANANAS|Sert desenli kabuğu ve tepede yaprak tacı olan tropikal meyve.
MANGO|İçinde yassı büyük çekirdek bulunan tropikal meyve.
AVOKADO|Yağlı yeşil etli, ortasında iri yuvarlak çekirdek olan meyve.
LİMON|Ekşi suyu yemeklerde kullanılan sarı turunçgil.
PORTAKAL|Turuncu kabuklu, dilimlere ayrılan turunçgil.
GREYFURT|Portakaldan iri, hafif acımsı ekşi turunçgil.
CEVİZ|Sert kabuğu kırılınca kıvrımlı içi çıkan yemiş.
FINDIK|Yuvarlak sert kabuk içinde tek içi bulunan yemiş.
BADEM|Uzunca biçimli, sert kabuklu yemiş.
FISTIK|Baklavasıyla da bilinen yeşil içli yemiş.
KESTANE|Dikenli dış kılıfı olan, közlenerek de yenen yemiş.
FASULYE|Tazesi kabuğuyla, kurusu taneleriyle pişirilen baklagil.
NOHUT|Leblebi yapımında da kullanılan yuvarlak baklagil.
MERCİMEK|Kırmızı veya yeşil türleri olan küçük yassı baklagil.
BEZELYE|Yeşil kabuğunun içinde sıralı yuvarlak taneler bulunur.
BAKLA|İri yassı taneleri ve yeşil kabuğuyla yenen baklagil.
PİRİNÇ|Sulu tarlalarda yetiştirilen, pilavlık beyaz tahıl tanesi.
BULGUR|Buğdayın haşlanıp kurutularak kırılmasıyla elde edilir.
YULAF|Lapası da yapılan, kahvaltıda gevrek olarak kullanılan tahıl.
ARPA|Taneleri hayvan yemi ve malt üretiminde kullanılan tahıl.
ÇAVDAR|Koyu renk ekmek yapımında kullanılan tahıl.
MISIR|Taneleri koçan üzerinde dizilen tahıl.
DOMATES|Salçanın temel malzemesi olan kırmızı sulu ürün.
BİBER|Tatlı ve acı çeşitleri olan, içi tohumlu sebze.
PATLICAN|Mor kabuklu, karnıyarık yapılan sebze.
KABAK|Mücver yapımında da kullanılan, yeşil uzun sebze.
HIYAR|Cacığa doğranan, yeşil kabuklu sulu sebze.
HAVUÇ|Turuncu kökü yenen sebze.
TURP|Çiğ yenen, beyaz veya kırmızı, keskin tatlı kök sebze.
PANCAR|Koyu kırmızı köküyle yemeklere renk veren sebze.
PATATES|Kızartması ve püresi yapılan yumru.
SOĞAN|Doğranırken gözleri yaşartabilen katmanlı sebze.
SARIMSAK|Dişlere ayrılan, keskin kokulu soğansı bitki.
PIRASA|Beyaz sapı ve uzun yeşil yaprakları pişirilen sebze.
ISPANAK|Koyu yeşil yaprakları yenen sebze.
MARUL|Salatalara yaprakları doğranan yeşillik.
ROKA|Salatada kullanılan, keskin tatlı yeşil yaprak.
TERE|Küçük yapraklı, hafif yakıcı tatlı salata yeşilliği.
NANE|Serin kokulu yaprakları yemek ve çayda kullanılan bitki.
KEKİK|Et yemeklerine de katılan, küçük yapraklı kokulu baharat.
KİMYON|Köfteye de katılan, kendine özgü keskin kokulu baharat.
TARÇIN|Çubuk veya toz biçiminde kullanılan tatlı kokulu ağaç kabuğu.
ZENCEFİL|Çay ve yemeklerde kullanılan, keskin kokulu köksap.
ZERDEÇAL|Yemeklere sarı renk veren baharat.
SAFRAN|Çiçeğinin ince kırmızı parçaları baharat olarak kullanılır.
SUSAM|Simitlerin üzerine serpilen küçük yağlı tohum.
HAŞHAŞ|Hamur işlerinde de kullanılan küçük yağlı tohumların bitkisi.
VANİLYA|Tatlılara kokusunu veren uzun kapsüllü orkide ürünü.
KAKAO|Çikolatanın temel ham maddesi olan koyu renkli ürün.
KAHVE|Kavrulmuş çekirdeklerin öğütülmesiyle hazırlanan içecek.
ÇAY|Yaprakları sıcak suda demlenerek hazırlanan içecek.
ŞERBET|Su ve şekerle hazırlanan, tatlılara da dökülen sıvı.
LİMONATA|Sarı turunçgilin suyu, su ve şekerle yapılan içecek.
KOMPOSTO|Meyvelerin şekerli suda pişirilmesiyle yapılan içecekli tatlı.
HOŞAF|Kuru meyvelerle hazırlanan sulu tatlı.
REÇEL|Meyvenin şekerle kaynatılmasıyla yapılan kahvaltılık.
KAYMAK|Sütün üstünde biriken yağlı tabaka.
TEREYAĞI|Süt yağından elde edilen, kahvaltıda da kullanılan katı yağ.
YUMURTA|Kabuğu kırılınca akı ve sarısı çıkan besin.
OMLET|Çırpılmış yumurtanın tavada pişirildiği yemek.
MENEMEN|Yumurta, domates ve biberle tavada yapılan yemek.
ÇORBA|Kaşıkla içilen sıcak sulu yemeklerin genel adı.
KÖFTE|Yoğrulmuş kıymaya biçim verilerek yapılan yemek.
KEBAP|Etin ateşte veya fırında pişirildiği yemeklerin genel adı.
LAHMACUN|İnce hamur üstüne kıymalı harç yayılarak pişirilir.
GÖZLEME|İç konmuş ince hamurun sacda pişirildiği yiyecek.
POĞAÇA|Peynirli veya sade yapılabilen küçük yumuşak hamur işi.
AÇMA|Halka biçimli, yumuşak ve yağlı kahvaltılık hamur işi.
KURABİYE|Çay yanında yenen küçük tatlı veya tuzlu fırın ürünü.
KEK|Un, yumurta ve şekerle kabartılarak pişirilen tatlı.
PASTA|Krema veya meyveyle süslenen kutlama tatlısı.
LOKUM|Nişasta ve şekerle yapılan, küçük parçalara kesilen tatlı.
HELVA|Tahin veya kavrulmuş unla da yapılan tatlıların genel adı.
KÜNEFE|Tel kadayıf ve eriyen peynirle yapılan sıcak şerbetli tatlı.
KADAYIF|İnce hamur tellerinden yapılan şerbetli tatlı.
REVANİ|İrmikle hazırlanan, üzerine şerbet dökülen tatlı.
PUDİNG|Sütle pişirilen, soğuyunca kıvamlanan kaşık tatlısı.
`,
dunya:`
DAĞ|Çevresindeki araziye göre çok yükselen kara şekli.
TEPE|Dağdan daha küçük doğal yükselti.
OVA|Geniş ve az engebeli düz arazi.
YAYLA|Yazın serin olduğu için çıkılan yüksek düzlük.
PLATO|Akarsularla yarılmış yüksek düzlük.
YAMAÇ|Bir yükseltinin eğimli yan yüzü.
ZİRVE|Bir dağın en yüksek noktası.
GEÇİT|Dağlar arasında ulaşımı sağlayan alçak yol.
UÇURUM|Çok dik ve derin düşüş gösteren arazi kenarı.
KANYON|Dik yamaçlı, dar ve derin akarsu vadisi.
MAĞARA|Kaya içinde oluşmuş, girilebilen doğal boşluk.
SARKIT|Mağara tavanından aşağı uzanan taş oluşumu.
DİKİT|Mağara tabanından yukarı doğru büyüyen taş oluşumu.
ŞELALE|Akarsuyun yüksekten dökülmesiyle oluşan çağlayan.
IRMAK|Geniş yatağı olan büyük akarsu.
DERE|Küçük akarsu.
ÇAYIR|Çoğunlukla otlarla kaplı yeşil arazi.
GÖL|Karalar içinde bir çukurda birikmiş büyük su kütlesi.
GÖLET|Gölden küçük durgun su birikintisi.
BATAKLIK|Zemini sürekli ıslak ve çamurlu alan.
KAYNAK|Yer altı suyunun yüzeye çıktığı nokta.
DELTA|Akarsuyun ağzında biriktirdiği malzemeyle oluşan düzlük.
KIYI|Kara ile suyun birleştiği kenar.
KUMSAL|Deniz kenarındaki kumlu alan.
KOY|Denizin karaya sokulduğu küçük girinti.
KÖRFEZ|Denizin karaya doğru yaptığı büyük girinti.
BURUN|Karanın suya doğru uzanan sivri bölümü.
BOĞAZ|İki denizi birbirine bağlayan dar su geçidi.
RESİF|Su yüzeyine yakın kaya veya mercan yükseltisi.
MERCAN|İskeleti resif oluşturabilen küçük deniz hayvanı.
ORMAN|Sık ağaçlarla kaplı geniş alan.
KORU|Korunmuş küçük ağaçlık alan.
BOZKIR|Kurak iklimlerde otların baskın olduğu geniş arazi.
VAHA|Çölde su bulunan, bitkilerin yetiştiği yer.
KUMUL|Rüzgârın biriktirdiği kum tepesi.
BUZUL|Karların sıkışmasıyla oluşan, yavaş hareket eden buz kütlesi.
ÇIĞ|Dağ yamacından hızla kayan büyük kar kütlesi.
LAV|Yanardağdan yüzeye çıkan erimiş kaya.
MAGMA|Yer altında bulunan erimiş kaya maddesi.
YANARDAĞ|İçinden lav, gaz ve kül çıkabilen dağ.
KÜL|Yanma sonunda kalan ince toz.
DEPREM|Yer kabuğundaki hareketlerle oluşan sarsıntı.
RÜZGAR|Havanın bir yerden başka yere doğru hareketi.
FIRTINA|Çok güçlü esen, bazen yağış getiren hava olayı.
HORTUM|Yere doğru uzanan, dönerek ilerleyen hava sütunu.
YAĞMUR|Buluttan sıvı damlalar hâlinde düşen yağış.
KAR|Beyaz buz kristalleri hâlinde yağan yağış.
DOLU|Küçük buz taneleri biçiminde düşen yağış.
SİS|Yere yakın havada asılı su damlacıkları.
ÇİY|Serin yüzeylerde oluşan küçük su damlacıkları.
KIRAĞI|Soğuk yüzeylerde oluşan ince beyaz buz kristalleri.
ŞİMŞEK|Bulutlarda görülen ani elektriksel ışık parlaması.
GÖLGE|Işığın bir nesneyle engellendiği karanlık alan.
UFUK|Gökle yerin birleşiyor gibi göründüğü çizgi.
KAYIK|Kürekle de yürütülebilen küçük su taşıtı.
GEMİ|Denizde yolcu veya yük taşıyan büyük araç.
VAPUR|Kıyı kentlerinde yolcu taşıyan büyük tekne.
FERİBOT|Yolcularla birlikte kara araçlarını da taşıyan gemi.
YELKEN|Rüzgârla tekneyi ilerleten geniş bez yüzey.
KÜREK|Kayığı insan gücüyle ilerleten uzun saplı araç.
DÜMEN|Geminin yönünü değiştiren düzenek.
ÇAPA|Tekneyi yerinde tutmak için suya bırakılan ağır araç.
İSKELE|Kıyıdan suya uzanan yanaşma yapısı.
GÜVERTE|Geminin üstteki açık döşeme bölümü.
KABİN|Taşıtlarda ayrılmış küçük oda.
TREN|Raylar üzerinde vagonlarla ilerleyen taşıt.
VAGON|Trenin yolcu veya yük taşıyan bağlı bölümü.
RAY|Tren tekerleklerinin üzerinde ilerlediği metal hat.
PERON|İstasyonda yolcuların trene bindiği platform.
GİŞE|Bilet gibi işlemlerin yapıldığı küçük pencere veya bölüm.
OTOBÜS|Çok sayıda yolcuyu karayolunda taşıyan araç.
MİNİBÜS|Otobüsten küçük toplu yolcu taşıtı.
TAKSİ|Ücret karşılığı istenen adrese yolcu götüren otomobil.
KAMYON|Karayolunda ağır yük taşımaya yarayan araç.
TRAKTÖR|Tarlada tarım araçlarını çeken motorlu taşıt.
BİSİKLET|Pedal çevrilerek ilerleyen iki tekerlekli taşıt.
SKUTER|Ayakta durulan tabanlı, gidonlu küçük iki tekerlekli araç.
UÇAK|Sabit kanatlarıyla havada yolcu veya yük taşıyan araç.
PLANÖR|Motor kullanmadan süzülerek uçabilen hava aracı.
BALON|Havadan hafif gaz veya sıcak havayla yükselen araç.
PARAŞÜT|Havada düşüşü yavaşlatan geniş kumaş düzenek.
PİST|Uçakların kalkıp indiği özel düz alan.
KASK|Başı darbelerden koruyan sert başlık.
FREN|Hareketli aracı yavaşlatıp durduran düzenek.
VİTES|Araçta hız ve çekiş oranını değiştiren aktarım kademesi.
PEDAL|Ayağın basarak bir mekanizmayı çalıştırdığı parça.
LASTİK|Tekerleğin yola değen esnek dış çemberi.
BAGAJ|Taşıtta eşyaların konduğu bölüm.
ROTA|Bir yolculukta izlenecek güzergâh.
`,
teknoloji:`
MASA|Üzerinde yemek yenilen veya çalışılan ayaklı eşya.
SANDALYE|Genellikle tek kişinin oturduğu sırtlıklı eşya.
KOLTUK|Yumuşak döşemeli, çoğunlukla kolluklu oturma eşyası.
KANEPE|Birden çok kişinin yan yana oturabildiği döşemeli eşya.
SEHPA|Küçük ve alçak masa.
DOLAP|Kapaklı, eşya saklamaya yarayan mobilya.
ÇEKMECE|Mobilyada çekilerek açılan eşya gözü.
RAF|Eşyaları dizmek için duvara veya dolaba konan yatay levha.
YATAK|Uzanıp uyumak için kullanılan eşya.
YASTIK|Uyurken başın altına konan yumuşak eşya.
YORGAN|Uyurken üstü örten içi dolgulu kalın örtü.
ÇARŞAF|Yatağın üzerine serilen ince kumaş.
NEVRESİM|Yorganı içine alan kumaş kılıf.
PERDE|Pencereyi örten kumaş veya benzeri düzenek.
HALI|Zemine serilen, havlı dokuma.
KİLİM|Havsız, düz dokunmuş yer yaygısı.
PASPAS|Kapı önünde ayak silmek için kullanılan yaygı.
AYNA|Karşısındakinin görüntüsünü yansıtan yüzey.
ÇERÇEVE|Resmi veya fotoğrafı çevreleyen kenarlık.
LAMBA|Elektrikle veya yakıtla ışık veren araç.
AMPUL|Duyuna takılarak ışık veren cam veya plastik kaplı parça.
AVİZE|Tavandan asılan süslü aydınlatma aracı.
PRİZ|Elektrikli cihazın fişinin takıldığı yuva.
FİŞ|Elektrik almak için prize takılan uç.
KABLO|Elektrik veya veri ileten yalıtılmış tel demeti.
PİL|Taşınabilir elektrik enerjisi kaynağı.
KUMANDA|Bir cihazı uzaktan yönetmeye yarayan küçük aygıt.
TELEFON|Uzaktaki kişilerle sesli görüşmeye yarayan cihaz.
RADYO|Kablosuz yayın sinyallerini alıp dinlenebilir sese dönüştüren aygıt.
HOPARLÖR|Elektrik sinyalini duyulabilir sese çeviren aygıt.
KULAKLIK|Sesi doğrudan kulağa ileten kişisel dinleme aracı.
MİKROFON|Sesi elektrik sinyaline dönüştüren aygıt.
KAMERA|Hareketli veya durağan görüntü kaydeden aygıt.
TRİPOD|Kamera gibi araçları sabit tutan üç ayaklı destek.
OBJEKTİF|Fotoğraf makinesinin merceklerden oluşan ön bölümü.
ŞARJ|Pilin yeniden elektrik enerjisiyle doldurulması.
DOSYA|Bilgisayarda belirli adla saklanan veri bütünü.
KLASÖR|Bilgisayarda dosyaları bir arada tutan bölüm.
İMLEÇ|Ekranda seçilen veya yazı girilecek yeri gösteren işaret.
SİMGE|Bir uygulamayı veya işlevi temsil eden küçük işaret.
KISAYOL|Bir işleve daha az adımla erişmeyi sağlayan yol.
KOMUT|Bilgisayara yaptırılacak işi bildiren talimat.
KOD|Programın yazıldığı talimatlar dizisi.
VERİ|İşlenebilen bilgi veya ölçüm değerleri.
AĞ|Birbirine bağlanmış cihazların oluşturduğu iletişim düzeni.
İNTERNET|Dünya çapındaki bilgisayar ağlarını birbirine bağlayan sistem.
EPOSTA|İnternet üzerinden gönderilen elektronik mektup.
BAĞLANTI|Bir sayfadan başka bir adrese götüren tıklanabilir öğe.
SEKME|Tarayıcıda birden fazla sayfayı ayrı başlıklarla açan bölüm.
OTURUM|Bir kullanıcının giriş yaptıktan sonraki etkin kullanım dönemi.
PROFİL|Bir kullanıcıya ait ad ve bilgilerin yer aldığı sayfa.
İNDİRME|Uzak bir kaynaktaki dosyayı kendi cihazına alma işlemi.
YEDEK|Kaybolma ihtimaline karşı tutulan ikinci kopya.
GÜNCEL|En son duruma uygun, eski kalmamış olan.
KAPAK|Bir kabın veya eşyanın ağzını örten parça.
KİLİT|Anahtar veya şifreyle açılan kapatma düzeneği.
ANAHTAR|Bir kilidi açıp kapatmaya yarayan araç.
MENTEŞE|Kapı veya kapağın dönerek açılmasını sağlayan bağlantı.
KAPI|Bir yere girip çıkmak için açılan geçit kanadı.
PENCERE|Duvarda ışık ve hava almak için bırakılan camlı açıklık.
DUVAR|Bir yapıyı sınırlayan veya odaları ayıran dik yüzey.
TAVAN|Bir odanın üstünü örten iç yüzey.
ÇATI|Binayı üstten yağışa karşı örten bölüm.
BACA|Dumanı yapı dışına taşıyan dik kanal.
MERDİVEN|Basamaklarla yükseğe çıkmayı sağlayan yapı.
BASAMAK|Üzerine ayak basılarak çıkılan merdiven kademesi.
BALKON|Bir binanın dışına taşan, kenarı çevrili açık bölüm.
ASANSÖR|Katlar arasında insan veya yük taşıyan hareketli kabin.
MUSLUK|Suyun akışını açıp kapatan düzenek.
LAVABO|El yıkarken kullanılan, giderli çanak.
KÜVET|İçine girerek yıkanılabilen büyük tekne.
DUŞ|Suyu küçük deliklerden yağmur gibi akıtan yıkanma düzeneği.
SABUN|Suyla köpürerek temizlemeye yarayan madde.
HAVLU|Islak yüzeyleri ve vücudu kurulayan emici bez.
TARAK|Saçı düzeltmeye yarayan dişli araç.
FIRÇA|Bir sap üzerindeki kıllarla temizleyen veya süren araç.
SÜNGER|Sıvıyı emebilen gözenekli temizlik malzemesi.
KOVA|Sapından taşınan, sıvı konabilen açık kap.
LEĞEN|Yıkama işlerinde kullanılan geniş ve alçak kap.
SÜPÜRGE|Toz ve çöpleri toplamaya yarayan temizlik aracı.
ÜTÜ|Giysilerin kırışıklıklarını ısıyla düzelten araç.
ASKI|Giysileri asmak için kullanılan biçimli araç.
MANDAL|Çamaşırı ipe tutturan küçük sıkıştırıcı.
İĞNE|İplik geçirilerek dikiş dikilen ince sivri araç.
İPLİK|Dikiş ve dokumada kullanılan ince lif dizisi.
DÜĞME|Giysi kenarlarını birleştiren küçük delikli parça.
FERMUAR|Karşılıklı dişleri sürgüyle birleştiren kapatma düzeneği.
MAKAS|İki keskin kanadını birleştirerek kesen araç.
ÇEKİÇ|Çivi çakmak için kullanılan saplı araç.
ÇİVİ|Çakılarak parçaları birleştiren sivri metal çubuk.
VİDA|Döndürülerek yerleştirilen dişli bağlantı parçası.
SOMUN|Cıvataya geçirilerek sıkılan içi dişli metal parça.
PENSE|Nesneleri sıkıca tutmaya veya tel kesmeye yarayan araç.
TESTERE|Dişli ağzıyla ileri geri hareket ederek kesen araç.
MATKAP|Döner ucuyla delik açan araç.
ZIMPARA|Yüzeyleri aşındırıp düzeltmek için kullanılan pürüzlü malzeme.
MENGENE|İşlenecek parçayı iki çene arasında sıkıca tutan düzenek.
ELDİVEN|Eli ve parmakları örten giysi.
ÖNLÜK|Giysinin önünü kirden koruyan örtü.
`,
bilim:`
KİTAP|Sayfaları bir araya getirilmiş yazılı veya resimli eser.
DEFTER|Üzerine yazı yazmak için birleştirilmiş boş sayfalar.
KALEM|Yazı yazmak veya çizmek için kullanılan araç.
SİLGİ|Kurşun kalem izlerini kaldıran kırtasiye gereci.
CETVEL|Düz çizgi çizmek ve uzunluk ölçmek için kullanılan araç.
GÖNYE|Dik açı çizmek için kullanılan üçgen araç.
PERGEL|Bir ucu sabitken çember çizmeye yarayan araç.
İLETKİ|Açı ölçmek için kullanılan dereceli araç.
TEBEŞİR|Yazı tahtasına yazmaya yarayan beyaz veya renkli çubuk.
TAHTA|Sınıfta üzerine yazı yazılan geniş yüzey.
SIRA|Sınıfta öğrencilerin oturup yazı yazdığı mobilya.
ÇANTA|Eşyaları taşıyan saplı veya askılı kap.
SÖZLÜK|Kelimelerin anlamlarını veya karşılıklarını açıklayan kaynak.
ATLAS|Haritaları bir araya getiren kitap.
ROMAN|Olayları ve kişileri uzun biçimde anlatan edebî tür.
ÖYKÜ|Genellikle tek olay çevresinde gelişen kısa anlatı.
MASAL|Olağanüstü olaylar içerebilen, çoğu zaman tekerlemeyle başlayan anlatı.
ŞİİR|Duygu ve düşünceleri dizelerle anlatan edebî tür.
DİZE|Şiirin her bir satırı.
UYAK|Dize sonlarındaki ses benzerliği.
BAŞLIK|Bir yazının adını veya konusunu gösteren üstteki ifade.
SATIR|Yazının soldan sağa uzanan her bir dizisi.
PARAGRAF|Bir düşünce etrafında toplanan cümleler bütünü.
CÜMLE|Bir yargı bildiren sözcük veya sözcük dizisi.
SÖZCÜK|Dilde tek başına anlam veya görev taşıyan ses birliği.
HECE|Bir ağız hareketiyle söylenen ses veya ses grubu.
HARF|Konuşma seslerini yazıda gösteren işaret.
ALFABE|Bir dilin harflerinin belirli sırayla dizilmiş bütünü.
NOKTA|Tamamlanmış cümlenin sonuna konan küçük yuvarlak işaret.
VİRGÜL|Sıralı öğeleri ayırmada kullanılan noktalama işareti.
ÜNLEM|Sevinç, korku gibi güçlü duyguları belirten noktalama işareti.
TIRNAK|Alıntıları çevrelemek için kullanılan çiftli yazı işareti.
PARANTEZ|Ek açıklamaları iki yandan içine alan yazı işareti.
ÖZNE|Cümlede işi yapanı veya yargının ilgili olduğu varlığı gösteren öğe.
YÜKLEM|Cümlenin yargı bildiren temel öğesi.
SIFAT|Bir adın niteliğini veya sayısını belirten sözcük türü.
ZAMİR|Bir adın yerine kullanılan sözcük türü.
FİİL|İş, oluş veya hareket bildiren sözcük türü.
ZARF|Fiilin nasıl veya ne zaman yapıldığını da belirtebilen sözcük türü.
BAĞLAÇ|Sözcükleri veya cümleleri birbirine bağlayan görevli sözcük.
RAKAM|Sayıları yazmak için kullanılan tek işaret.
SAYI|Bir miktarı veya sıralamayı belirten matematik kavramı.
TOPLAM|Sayıların toplanmasıyla elde edilen sonuç.
FARK|Çıkarma işleminin sonucu.
ÇARPIM|Çarpma işleminin sonucu.
BÖLÜM|Bölme işleminde elde edilen sonuç.
KALAN|Tam bölünmeyen bir bölme işleminde artan miktar.
KESİR|Bir bütünün eş parçalarından kaçının alındığını gösterir.
PAY|Kesrin çizgi üstünde yazılan sayısı.
PAYDA|Kesrin çizgi altında yazılan sayısı.
ORAN|İki büyüklüğün birbirine bölünerek karşılaştırılması.
YÜZDE|Bir miktarın yüz eş parça üzerinden anlatımı.
ÜÇGEN|Üç kenarı ve üç köşesi olan çokgen.
KARE|Dört kenarı eşit ve dört açısı dik olan dörtgen.
DÖRTGEN|Dört kenarı olan kapalı geometrik şekil.
BEŞGEN|Beş kenarı olan çokgen.
ALTIGEN|Altı kenarı olan çokgen.
ÇEMBER|Bir merkezden eşit uzaklıktaki noktaların çizdiği kapalı eğri.
DAİRE|Çember ile iç bölgesinin oluşturduğu şekil.
ÇAP|Çember üzerindeki iki noktayı merkezden geçerek birleştiren doğru parçası.
YARIÇAP|Çemberin merkeziyle üzerindeki bir nokta arasındaki uzaklık.
AÇI|Aynı başlangıçtan çıkan iki ışının arasındaki açıklık.
KENAR|Bir çokgenin sınırını oluşturan doğru parçalarından biri.
KÖŞE|Geometrik bir şeklin iki kenarının birleştiği nokta.
KÜP|Altı yüzü de eş kare olan geometrik cisim.
KÜRE|Merkezinden yüzeyine uzaklığı her yönde aynı olan yuvarlak cisim.
KONİ|Daire tabanı bir tepe noktasına daralan geometrik cisim.
SİLİNDİR|Eş iki daire tabanı ve eğri yan yüzeyi olan geometrik cisim.
PRİZMA|İki eş ve paralel çokgen tabanı bulunan geometrik cisim.
PİRAMİT|Çokgen tabanının köşeleri bir tepe noktasında birleşen cisim.
HACİM|Bir cismin uzayda kapladığı yerin ölçüsü.
ALAN|Bir yüzeyin büyüklüğünün ölçüsü.
ÇEVRE|Kapalı bir şeklin sınırlarının toplam uzunluğu.
KÜTLE|Bir cismin madde miktarıyla ilgili temel büyüklük.
TERAZİ|Kütle karşılaştırmak veya tartmak için kullanılan araç.
METRE|Uzunluğun temel ölçü birimi.
LİTRE|Sıvıların hacminde yaygın kullanılan ölçü birimi.
GRAM|Kilogramın binde biri olan kütle birimi.
SANİYE|Bir dakikanın altmışta biri olan zaman birimi.
DAKİKA|Altmış saniyelik zaman dilimi.
SAAT|Altmış dakikalık zaman birimi.
TAKVİM|Günleri, ayları ve yılları gösteren düzen.
MEVSİM|Yılın iklim özelliklerine göre ayrılan dört bölümünden biri.
İLKBAHAR|Kış ile yaz arasındaki mevsim.
SONBAHAR|Yaz ile kış arasındaki mevsim.
HAFTA|Yedi günlük zaman dilimi.
SABAH|Günün güneş doğduktan sonraki ilk bölümü.
ÖĞLE|Günün ortasına denk gelen zaman.
AKŞAM|Güneşin batışına yakın zaman.
GECE|Güneş battıktan sonra başlayan karanlık zaman dilimi.
ŞAFAK|Güneş doğmadan önce beliren ilk aydınlık.
TAŞ|Doğada bulunan sert mineral kütlesi.
KAYA|Büyük ve sert taş kütlesi.
KUM|Çok küçük mineral ve kaya taneleri.
KİL|Suyla yoğrulabilen, ince taneli toprak malzemesi.
TOPRAK|Bitkilerin kök saldığı yer yüzeyi tabakası.
MADEN|Yer altından çıkarılan, ekonomik değer taşıyan doğal madde.
DEMİR|Çelik yapımının ana bileşeni olan metal.
BAKIR|Kızılımsı renkli, elektrik tellerinde kullanılan metal.
ALTIN|Sarı renkli, takılarda kullanılan değerli metal.
GÜMÜŞ|Parlak beyaz renkli değerli metal.
KURŞUN|Yumuşak ve ağır, gri renkli metal.
KALAY|Teneke kaplamada da kullanılan açık renkli metal.
ÇİNKO|Demiri paslanmaya karşı kaplamada kullanılan metal.
ÇELİK|Demirin karbonla oluşturduğu dayanıklı alaşım.
BRONZ|Başlıca bakır ve kalaydan oluşan alaşım.
KRİSTAL|Atomları düzenli dizilmiş katı yapı.
FOSİL|Çok eski canlıların taşlaşmış kalıntı veya izleri.
BİTKİ|Genellikle kök, gövde ve yaprak taşıyan canlı grubu.
KÖK|Bitkiyi toprağa bağlayan ve su almasını sağlayan bölüm.
GÖVDE|Bitkide kök ile dallar arasındaki ana taşıyıcı bölüm.
DAL|Ağaç gövdesinden ayrılan uzantı.
YAPRAK|Bitkide çoğunlukla yeşil ve yassı olan organ.
ÇİÇEK|Birçok bitkinin üreme organlarını taşıyan renkli bölümü.
TOHUM|Uygun koşullarda yeni bitkiyi oluşturabilen yapı.
FİDAN|Henüz genç ve küçük ağaç.
FİLİZ|Bitkide yeni çıkan taze sürgün.
TOMURCUK|Henüz açılmamış çiçek veya yaprak taslağı.
POLEN|Çiçeklerin üremesinde rol alan ince toz tanecikleri.
NEKTAR|Çiçeklerin böcekleri çeken şekerli sıvısı.
REÇİNE|Bazı ağaçların salgıladığı yapışkan madde.
KOZALAK|Çam gibi ağaçların tohumlarını taşıyan pullu yapı.
ÇAM|İğne yapraklı ve kozalaklı ağaç.
MEŞE|Palamut veren, dayanıklı odunlu ağaç.
KAVAK|Hızlı büyüyen, uzun boylu ağaç türü.
SÖĞÜT|Dalları sarkabilen, su kenarını seven ağaç.
ÇINAR|Geniş gövdeli, büyük parçalı yapraklı uzun ömürlü ağaç.
SEDİR|Kokulu odunu olan, dağlarda yetişen iğne yapraklı ağaç.
ARDIÇ|Küçük kozalakları meyveye benzeyen dayanıklı ağaç veya çalı.
LALE|Soğandan yetişen, kadeh biçimli çiçek.
GÜL|Dikenli dalları ve kokulu çiçeğiyle tanınan bitki.
PAPATYA|Beyaz taç yaprakları ve sarı merkeziyle tanınan çiçek.
MENEKŞE|Mor çiçekli türleriyle bilinen küçük süs bitkisi.
SÜMBÜL|Salkım gibi dizilmiş kokulu çiçekleri olan soğanlı bitki.
NİLÜFER|Yaprak ve çiçekleri su yüzeyinde görülen bitki.
ZAMBAK|Büyük, gösterişli çiçekler açan soğanlı bitki.
KARANFİL|Kenarı dişli taç yaprakları olan kokulu süs çiçeği.
ORKİDE|Çok farklı renk ve biçimlerde çiçek açan süs bitkisi ailesi.
KAKTÜS|Kuraklığa dayanıklı, çoğunlukla dikenli ve etli gövdeli bitki.
EĞRELTİ|Çiçek açmadan sporlarla çoğalan, parçalı yapraklı bitki.
YOSUN|Nemli yerlerde küçük yeşil örtüler oluşturabilen bitki grubu.
`,
muzik:`
RESİM|Boya veya çizgilerle yüzey üzerinde yapılan görsel eser.
HEYKEL|Taş, metal veya kil gibi malzemelerle yapılan üç boyutlu sanat eseri.
SERGİ|Eserlerin izleyicilere topluca sunulduğu etkinlik.
MÜZE|Kültür veya doğa varlıklarının korunup sergilendiği yer.
GALERİ|Sanat eserlerinin sergilendiği mekân.
PALET|Ressamın boyaları karıştırdığı yüzey.
TUVAL|Resim yapmak için gerilen özel kumaş.
ESKİZ|Bir eserden önce yapılan hızlı taslak çizim.
DESEN|Bir yüzeyi süsleyen çizgi ve biçim düzeni.
PORTRE|Bir kişinin yüzünü veya görünüşünü konu alan eser.
MANZARA|Doğal veya kentsel bir görünümü konu alan resim.
RENK|Işığın gözümüzde oluşturduğu kırmızı, mavi gibi görsel özellik.
TON|Bir rengin açık veya koyu derecesi.
BOYA|Yüzeye renk vermek için sürülen madde.
MOZAİK|Küçük renkli parçalar birleştirilerek yapılan süsleme.
ÇİNİ|Sırlı ve desenli seramik kaplama veya eşya.
SERAMİK|Biçimlendirilip pişirilmiş kilden yapılan ürün.
ÇÖMLEK|Kilden yapılıp pişirilen toprak kap.
VİTRAY|Renkli cam parçalarıyla oluşturulan süsleme.
EBRU|Su yüzeyindeki boyaların kâğıda aktarılmasıyla yapılan sanat.
HAT|Güzel yazı yazma sanatı.
OYMA|Malzemeyi kesip çıkararak biçim veya desen oluşturma.
NAKIŞ|Kumaş üzerine iplikle işlenen süsleme.
DOKUMA|İpliklerin birbirinin arasından geçirilmesiyle yapılan kumaş.
ÖRGÜ|İpliğin şiş veya tığla ilmeklenmesiyle yapılan iş.
TİYATRO|Oyuncuların sahnede canlandırdığı gösteri sanatı.
SAHNE|Oyuncu veya müzisyenlerin gösteri yaptığı yükseltilmiş alan.
KULİS|Sanatçıların gösteri öncesi hazırlandığı sahne arkası.
DEKOR|Bir gösterinin geçtiği ortamı sahnede kuran eşyalar ve düzen.
KOSTÜM|Sahnede canlandırılan role uygun giysi.
MASKE|Yüzü örten veya başka bir yüz görünümü veren nesne.
KUKLA|El veya iplerle hareket ettirilen küçük gösteri figürü.
PANDOMİM|Söz kullanmadan beden hareketleriyle anlatılan gösteri.
BALE|Belirli tekniklerle yapılan sahne dansı.
OPERA|Sözlerinin büyük bölümü şarkıyla söylenen sahne eseri.
DANS|Müzik veya ritme uyarak yapılan düzenli beden hareketleri.
TANGO|Arjantin ile özdeşleşen çiftli dans.
VALS|Üç zamanlı müzikle dönerek yapılan çiftli dans.
ZEYBEK|Ege yöresine özgü ağır ve gösterişli halk oyunu.
HORON|Karadeniz yöresinde çoğunlukla sıra hâlinde oynanan halk oyunu.
HALAY|Yan yana tutuşularak topluca oynanan halk oyunu.
BESTE|Bir müzik eserinin seslerle oluşturulmuş yapısı.
EZGİ|Birbiri ardına düzenlenmiş müzik sesleri.
TÜRKÜ|Halk kültüründen doğan, sözlü müzik eseri.
ŞARKI|Söylenmek üzere bestelenmiş sözlü müzik eseri.
MARŞ|Düzenli yürüyüş temposuna uygun müzik eseri.
NİNNİ|Bebeği uyutmak için yumuşakça söylenen ezgi.
ISLIK|Dudaklardan hava üflenerek çıkarılan ince ses.
TEMPO|Müzik eserinin çalınma hızı.
VİYOLA|Kemandan biraz büyük, daha kalın sesli yaylı çalgı.
KONTRBAS|Yaylı çalgı ailesinin çok büyük ve kalın sesli üyesi.
ARP|Çok sayıda dikey teli parmakla çekilerek çalınan çalgı.
UD|Kısa saplı, perdesiz ve bombeli gövdeli telli çalgı.
KANUN|Yatay tutulan çok telli, mızraplarla çalınan çalgı.
NEY|Kamıştan yapılan, uçtan üflenen geleneksel çalgı.
ZURNA|Keskin güçlü sesli, halk müziğinde kullanılan üflemeli çalgı.
KAVAL|Çobanlarla özdeşleşen boru biçimli nefesli çalgı.
TROMPET|Üç pistonlu yaygın bakır üflemeli çalgı.
TROMBON|Sürgüsü ileri geri hareket ettirilerek çalınan bakır üflemeli.
SAKSAFON|Metal gövdeli, tek kamışla üflenen çalgı.
AKORDEON|Körüğü açılıp kapanan, tuşlu veya düğmeli çalgı.
BATERİ|Birlikte çalınan davul ve zillerden oluşan takım.
TEF|Kenarında küçük ziller bulunabilen çember biçimli vurmalı çalgı.
DARBUKA|Kadeh biçimli gövdesinin üstüne deri gerilmiş vurmalı çalgı.
ZİL|Birbirine vurularak ses çıkaran yuvarlak metal çalgı.
TOKMAK|Vurmalı çalgıya vurmak için kullanılan başı kalın çubuk.
PENA|Telli çalgının tellerini çekmeye yarayan küçük ince parça.
YAY|Keman gibi çalgılarda tellere sürtülen kıllı çubuk.
TEL|Telli çalgılarda titreşerek ses çıkaran ince uzun parça.
KASET|Sesin manyetik şeride kaydedildiği küçük kutulu ortam.
ALBÜM|Bir arada yayımlanan müzik parçaları bütünü.
FİLM|Hareketli görüntülerden oluşan sinema eseri.
SENARYO|Bir filmin olaylarını ve konuşmalarını yazan metin.
REPLİK|Oyuncunun bir rol içinde söylediği söz.
KURGU|Çekilmiş görüntülerin seçilip birleştirilmesi işlemi.
OYUNCU|Sahne veya kamerada bir rolü canlandıran kişi.
DUBLAJ|Görüntüdeki konuşmaların sonradan başka seslerle eşlenmesi.
ALTYAZI|Konuşmaların ekranın alt kısmında yazıyla gösterimi.
AFİŞ|Bir etkinliği veya ürünü duyuran büyük görsel ilan.
FRAGMAN|Bir filmi tanıtmak için hazırlanan kısa görüntü seçkisi.
FESTİVAL|Belirli bir sanat veya kültür alanında düzenlenen toplu etkinlik.
`,
futbol:`
KALE|Futbolda topun içine gönderilmeye çalışıldığı direkli hedef.
GOL|Futbolda topun kurallara uygun biçimde kale çizgisini geçmesi.
KALECİ|Futbolda kendi ceza alanında topu eliyle tutabilen oyuncu.
FORVET|Takımın hücumda gol arayan ön oyuncusu.
DEFANS|Takımın rakip hücumlarını durdurmaya çalışan bölümü.
KORNER|Top savunandan kale çizgisi dışına çıkınca köşeden kullanılan vuruş.
PENALTI|Futbolda belirli ihlal sonrası özel noktadan kullanılan vuruş.
OFSAYT|Futbolda hücum oyuncusunun konumuna bağlı ihlal.
TAÇ|Futbolda yan çizgiden çıkan topun elle oyuna sokulması.
VOLE|Top yere değmeden yapılan vuruş.
RÖVEŞATA|Oyuncunun havada ters dönerek yaptığı gösterişli vuruş.
BARAJ|Serbest vuruşta yan yana duran savunma oyuncuları.
DÜDÜK|Hakemin oyunu durdurmak için üflediği küçük ses aracı.
FORMA|Takım oyuncularının ortak renk ve desenli spor giysisi.
KAPTAN|Takımını oyun alanında temsil eden oyuncu.
TAKIM|Birlikte yarışan oyuncular topluluğu.
SKOR|Karşılaşmadaki sayısal sonuç.
DERBİ|Özellikle aynı kentin rakip takımları arasındaki maç.
STADYUM|Saha ve seyirci tribünlerini birleştiren büyük spor yapısı.
TURNUVA|Birden fazla karşılaşmadan oluşan yarışma düzeni.
FİNAL|Bir yarışmada şampiyonu belirleyen son karşılaşma.
MADALYA|Bir başarı karşılığında verilen küçük metal ödül.
KUPA|Sportif başarı karşılığında verilen ayaklı ödül kabı.
YÜZME|Kollar ve bacaklarla su içinde ilerleme sporu.
KOŞU|Adımlar arasında iki ayağın da yerden kesildiği hızlı ilerleyiş.
GÜREŞ|İki sporcunun tutuşarak birbirini yenmeye çalıştığı spor.
BOKS|Eldivenlerle yumruk atılarak yapılan dövüş sporu.
ESKRİM|Özel kılıçlarla puan kazanılmaya çalışılan spor.
TENİS|Raketle topu file üzerinden karşı alana gönderme sporu.
RAKET|Teniste topa vurmak için kullanılan telli araç.
SERVİS|Tenis veya voleybolda oyunu başlatan vuruş.
KORT|Tenisin oynandığı çizgili alan.
VOLEYBOL|Topun file üzerinden elle geçirildiği takım sporu.
HENTBOL|Topun elle taşınıp kaleye atıldığı takım sporu.
KAYAK|Kar üzerinde uzun tabanlarla kayma sporu ve aracı.
PATEN|Ayağa takılan tekerlek veya bıçaklı kayma aracı.
KIZAK|Kar üzerinde oturarak kayılan tabanlı araç.
KÜREKÇİ|Tekneyi kol gücüyle ilerleten sporcu.
OKÇULUK|Yayla hedefe ok atılan spor dalı.
HALTER|Ağırlık yüklü çubuğu kaldırmaya dayanan spor.
DAMBIL|Tek elle tutulan küçük ağırlık aracı.
BARFİKS|Yatay çubuğa tutunup gövdeyi yukarı çekme hareketi.
MARATON|42 kilometre 195 metre uzunluğundaki yol koşusu.
BAYRAK|Sporcuların sırayla koşup çubuk devrettiği yarış türü.
PARKUR|Bir yarışta izlenmesi gereken belirli yol.
ENGEL|Koşuda üzerinden atlanılan veya aşılması gereken düzenek.
KULVAR|Yarış pistinde sporcuya ayrılan şerit.
REKOR|Bir alanda kaydedilmiş en iyi ölçülebilir derece.
ANTRENÖR|Sporcuları çalıştırıp hazırlayan kişi.
`,
};

export interface ArenaEntry {word:string;clue?:string;themeId:string;riddleId?:string}
const byWord=new Map<string,ArenaEntry>();
for(const bank of RIDDLE_BANKS)for(const [word,clue] of bank.items)byWord.set(word,{word,clue,themeId:bank.themeId,riddleId:riddleId(bank.themeId,word)});
export const ARENA_ADDITIONS=Object.entries(additions).flatMap(([themeId,lines])=>lines.trim().split('\n').map(line=>{const [word,clue]=line.split('|');return {word:word!,clue:clue!,themeId};}));
// Reused words retain their original, already-published definition and identifier.
for(const entry of ARENA_ADDITIONS)if(!byWord.has(entry.word))byWord.set(entry.word,{...entry,riddleId:'arena-clue-v2:'+entry.word});
export const ARENA_CLUES=[...byWord.values()];
for(const bank of ARENA_BANKS)for(const word of bank.words)if(!byWord.has(word))byWord.set(word,{word,themeId:bank.themeId});
export const ARENA_LIBRARY=[...byWord.values()];
