import type {CoastRoute} from './coast-content.ts';

/** Yeni Ufuklar v1: append-only authored topics. Published IDs/word order must not change. */
type RouteSpec={id:string;title:string;themeId:string;light:CoastRoute['light'];bonus:string;rows:([string,string]|[string,string,string[]])[]};
const SPECS:RouteSpec[]=[
 {
  "id": "ufuk-ciftlik",
  "title": "Çiftlik Sabahı",
  "themeId": "hayvanlar",
  "light": "morning",
  "rows": [
   [
    "Tarladan tahıllar",
    "BUĞDAY|ARPA|YULAF|ÇAVDAR"
   ],
   [
    "Köy avlusunda",
    "AHIR|KÜMES|SAMAN|YEMLİK"
   ],
   [
    "Arılığın ürünleri",
    "BAL|PETEK|POLEN|BALMUMU",
    [
     "Arıların çiçek özünden yaptığı tatlı besin.",
     "Arıların bal biriktirdiği, altıgen gözlerden oluşan yapı.",
     "Çiçeklerin üremesinde görev alan ince toz.",
     "Arıların petek yapmak için ürettiği madde."
    ]
   ],
   [
    "Tarla işleri",
    "EKİM|HASAT|SULAMA|SÜRÜM"
   ],
   [
    "Çiftlik araçları",
    "SABAN|TIRMIK|ORAK|DİRGEN"
   ],
   [
    "Kiler kapları",
    "ÇUVAL|SEPET|BİDON|KAVANOZ"
   ]
  ],
  "bonus": "PETEK"
 },
 {
  "id": "ufuk-orman",
  "title": "Ormanın Katları",
  "themeId": "hayvanlar",
  "light": "day",
  "rows": [
   [
    "Ormanın ağaçları",
    "MEŞE|KAYIN|LADİN|SEDİR"
   ],
   [
    "Ağacın gövdesi",
    "KABUK|GÖVDE|KÖK|DAL"
   ],
   [
    "Orman izleri",
    "PENÇE|TÜY|KOZALAK|PALAMUT",
    [
     "Bazı hayvanların parmak uçlarındaki sivri ve kıvrık tırnak.",
     "Kuşların gövdesini örten hafif örtünün bir parçası.",
     "Çam gibi ağaçların pullu, odunsu üreme yapısı.",
     "Meşe ağacının sert kabuklu meyvesi."
    ]
   ],
   [
    "Orman memelileri",
    "GEYİK|TİLKİ|VAŞAK|SANSAR"
   ],
   [
    "Toprağın üstünde",
    "YOSUN|MANTAR|EĞRELTİ|LİKEN"
   ],
   [
    "Ağaç tepelerinde",
    "KARGA|SAKSAĞAN|SİNCAP|BAYKUŞ"
   ]
  ],
  "bonus": "MEŞE"
 },
 {
  "id": "ufuk-gol",
  "title": "Göl Kıyısında",
  "themeId": "hayvanlar",
  "light": "morning",
  "rows": [
   [
    "Gölün kuşları",
    "ÖRDEK|KUĞU|PELİKAN|BALIKÇIL"
   ],
   [
    "Suyun çevresi",
    "KIYI|SAZLIK|KUMSAL|KÖRFEZ"
   ],
   [
    "Tatlı su balıkları",
    "SAZAN|YAYIN|TURNA|ALABALIK",
    [
     "Göllerde de yaşayan, ağzının kenarında bıyıkları bulunan pullu balık.",
     "Geniş ağızlı, uzun bıyıklı ve pulsuz derili büyük tatlı su balığı.",
     "Uzun gövdeli, sivri dişli, yırtıcı tatlı su balığı.",
     "Serin ve temiz akarsularda yaşayan, benekli gövdeli balık."
    ]
   ],
   [
    "Göl bitkileri",
    "NİLÜFER|KAMIŞ|SAZ|SÜSEN"
   ],
   [
    "Kıyıdaki küçük canlılar",
    "KURBAĞA|YUSUFÇUK|SİNEK|KELEBEK"
   ],
   [
    "Sakin bir piknik",
    "ÖRTÜ|TERMOS|KAP|MİNDER"
   ]
  ],
  "bonus": "SAZ"
 },
 {
  "id": "ufuk-yagmur",
  "title": "Yağmurdan Sonra",
  "themeId": "dunya",
  "light": "afternoon",
  "rows": [
   [
    "Gökteki hava",
    "BULUT|YAĞMUR|DOLU|ŞİMŞEK"
   ],
   [
    "Rüzgârın adları",
    "POYRAZ|LODOS|MELTEM|FIRTINA"
   ],
   [
    "Yağış ve yüzey izleri",
    "KAR|ÇİY|KIRAĞI|SAĞANAK",
    [
     "Bulutlardan beyaz kristaller hâlinde düşen yağış.",
     "Serinleyen yüzeylerde su buharının oluşturduğu küçük damlalar.",
     "Soğuk yüzeylerin üstünde oluşan ince buz kristalleri.",
     "Birden başlayan, kısa sürede yoğunlaşan yağmur."
    ]
   ],
   [
    "Havayı ölçmek",
    "DERECE|BASINÇ|NEM|HIZ"
   ],
   [
    "Yağmurlu gün çantası",
    "ŞEMSİYE|ÇİZME|MONT|KILIF"
   ],
   [
    "Yağmurun izleri",
    "DAMLA|ÇAMUR|GÖLET|SEL"
   ]
  ],
  "bonus": "DAMLA"
 },
 {
  "id": "ufuk-kamp",
  "title": "Dağ Evinin Yolu",
  "themeId": "dunya",
  "light": "afternoon",
  "rows": [
   [
    "Kamp çantasında",
    "ÇADIR|MAT|TULUM|FENER"
   ],
   [
    "Patikanın çevresi",
    "YAMAÇ|SIRT|VADİ|ZİRVE"
   ],
   [
    "Yön bulma araçları",
    "PUSULA|HARİTA|KROKİ|GPS",
    [
     "İğnesiyle kuzeyi gösteren yön bulma aracı.",
     "Bir bölgenin ölçekli olarak düzlemde gösterimi.",
     "Bir yerin önemli noktalarını kabaca gösteren çizim.",
     "Uydulardan gelen sinyallerle konum belirleyen sistemin kısa adı."
    ]
   ],
   [
    "Yürüyüş donanımı",
    "BOT|BATON|ÇANTA|TOZLUK"
   ],
   [
    "Kamp ateşi yanında",
    "ODUN|KÖZ|MAŞA|KİBRİT"
   ],
   [
    "Dağ evinin içi",
    "SOBA|SEDİR|KİLİM|YORGAN"
   ]
  ],
  "bonus": "ÇADIR"
 },
 {
  "id": "ufuk-ada",
  "title": "Ada İskelesi",
  "themeId": "turkiye",
  "light": "day",
  "rows": [
   [
    "İskeleye yanaşırken",
    "HALAT|DUBA|İSKELE|RİHTIM"
   ],
   [
    "Tekne gövdesi ve donanım",
    "DÜMEN|ÇAPA|PRUVA|OMURGA"
   ],
   [
    "Denizin hareketi",
    "DALGA|AKINTI|GELGİT|KÖPÜK",
    [
     "Rüzgârla su yüzeyinde oluşan yükselip alçalma hareketi.",
     "Suyun belirli bir yönde sürekli yer değiştirmesi.",
     "Ay ve Güneş'in çekimiyle deniz düzeyinin düzenli değişmesi.",
     "Suyun üstünde biriken küçük hava kabarcıkları."
    ]
   ],
   [
    "Adanın koyları",
    "KOY|BURUN|KAYALIK|PLAJ"
   ],
   [
    "Yelkenli güvertesi",
    "DİREK|YELKEN|MAKARA|İSKOTA"
   ],
   [
    "Kıyıda dinlenirken",
    "ŞEZLONG|HAVLU|GÖLGELİK|MAYO"
   ]
  ],
  "bonus": "YELKEN"
 },
 {
  "id": "ufuk-kent",
  "title": "Kentin Ayrıntıları",
  "themeId": "turkiye",
  "light": "day",
  "rows": [
   [
    "Sokağın üstünde",
    "TABELA|LAMBA|LEVHA|PANO"
   ],
   [
    "Kent yapıları",
    "MÜZE|KULE|OKUL|HASTANE"
   ],
   [
    "Yapının dışı",
    "CEPHE|BALKON|ÇATI|OLUK",
    [
     "Bir yapının dışarıdan görülen ön veya yan yüzü.",
     "Binanın dışına doğru uzanan, çevresi korkuluklu açık bölüm.",
     "Yapıyı üstten örten ve yağıştan koruyan bölüm.",
     "Çatıda biriken yağmur suyunu taşıyan dar kanal."
    ]
   ],
   [
    "Meydanda buluşma",
    "HEYKEL|ÇEŞME|BANK|SAAT"
   ],
   [
    "Yaya yolunda",
    "RAMPA|GEÇİT|BORDÜR|KALDIRIM"
   ],
   [
    "Apartman girişinde",
    "ZİL|KAPI|PASPAS|POSTALIK"
   ]
  ],
  "bonus": "SOKAK"
 },
 {
  "id": "ufuk-pazar",
  "title": "Mahalle Pazarı",
  "themeId": "lezzetler",
  "light": "morning",
  "rows": [
   [
    "Yeşil tezgâh",
    "ROKA|TERE|MARUL|PAZI"
   ],
   [
    "Mor tezgâh",
    "PANCAR|TURP|LAHANA|PATLICAN"
   ],
   [
    "Pazar ölçüleri",
    "KİLO|GRAM|ADET|DEMET",
    [
     "Bin grama eşit kütle ölçüsünün günlük kısa adı.",
     "Bir kilogramın binde biri olan kütle birimi.",
     "Tek tek sayılan nesneler için kullanılan sayı birimi.",
     "Saplarından bir araya bağlanan çiçek veya yeşillik topluluğu."
    ]
   ],
   [
    "Tezgâh düzeni",
    "KASA|TERAZİ|ETİKET|POŞET"
   ],
   [
    "Kokulu yeşillikler",
    "NANE|REYHAN|DEREOTU|MAYDANOZ"
   ],
   [
    "Kışlık alışveriş",
    "KABAK|PIRASA|KEREVİZ|ISPANAK"
   ]
  ],
  "bonus": "PAZAR"
 },
 {
  "id": "ufuk-firin",
  "title": "Fırın Sokağı",
  "themeId": "lezzetler",
  "light": "morning",
  "rows": [
   [
    "Hamurun malzemeleri",
    "MAYA|ŞEKER|SÜT|TUZ"
   ],
   [
    "Fırının tezgâhı",
    "TEPSİ|MERDANE|KÜREK|KALIP"
   ],
   [
    "Fırından sıcak",
    "SİMİT|POĞAÇA|BAZLAMA|PİDE",
    [
     "Genellikle susamla kaplı halka biçimindeki hamur işi.",
     "Peynirli veya sade yapılabilen küçük, yumuşak hamur işi.",
     "Sacda pişirilen, yuvarlak ve kalın ekmek.",
     "Yassı biçimde yapılan, Ramazan'da da sık tüketilen ekmek."
    ]
   ],
   [
    "Hamura şekil vermek",
    "BEZE|ÖRGÜ|HALKA|RULO"
   ],
   [
    "Üstüne serpilir",
    "SUSAM|HAŞHAŞ|KEPEK|ÇÖREKOTU"
   ],
   [
    "Fırın tatlıları",
    "KEK|KURABİYE|TURTA|SUFLE"
   ]
  ],
  "bonus": "SİMİT"
 },
 {
  "id": "ufuk-sofra",
  "title": "Kahvaltı Sofrası",
  "themeId": "lezzetler",
  "light": "day",
  "rows": [
   [
    "Sofraya hazırlık",
    "ÇATAL|BIÇAK|KAŞIK|PEÇETE"
   ],
   [
    "Küçük kahvaltılıklar",
    "ZEYTİN|BAL|REÇEL|PEYNİR"
   ],
   [
    "Kahvaltı kapları",
    "FİNCAN|KASE|DEMLİK|ŞEKERLİK",
    [
     "Kahve gibi sıcak içecekler için kullanılan küçük, kulplu kap.",
     "Çorba veya yoğurt konabilen derin ve yuvarlak kap.",
     "Çayın demlendiği, emzikli ve kulplu kap.",
     "Sofrada şeker konan küçük kap."
    ]
   ],
   [
    "Yumurtayla yapılanlar",
    "OMLET|MENEMEN|ÇILBIR|KREP"
   ],
   [
    "Ekmek üstüne",
    "KAYMAK|TAHİN|PEKMEZ|TEREYAĞI"
   ],
   [
    "Sofranın içecekleri",
    "ÇAY|SÜT|KAHVE|AYRAN"
   ]
  ],
  "bonus": "ÇAY"
 },
 {
  "id": "ufuk-ev",
  "title": "Evde Bir Gün",
  "themeId": "okul",
  "light": "day",
  "rows": [
   [
    "Pencere çevresinde",
    "PERDE|PANJUR|CAM|SİNEKLİK"
   ],
   [
    "Oturma odası",
    "KOLTUK|SEHPA|HALI|ABAJUR"
   ],
   [
    "Temizlik araçları",
    "FIRÇA|SÜNGER|KOVA|BEZ",
    [
     "Bir yüzeyi kıllarıyla temizlemeye yarayan saplı araç.",
     "Suyu içine çekebilen, yumuşak ve gözenekli temizlik malzemesi.",
     "Su taşımak için kullanılan, üstü açık ve kulplu kap.",
     "Silme veya kurulama için kullanılan kumaş parçası."
    ]
   ],
   [
    "Çamaşır köşesi",
    "ASKI|MANDAL|ÜTÜ|SEPET"
   ],
   [
    "Yatak odası",
    "YASTIK|ÇARŞAF|NEVRESİM|DÖŞEK"
   ],
   [
    "Çekmecede saklı",
    "ANAHTAR|DÜĞME|PİL|TARAK"
   ]
  ],
  "bonus": "KOLTUK"
 },
 {
  "id": "ufuk-bahcivan",
  "title": "Minik Bahçıvan",
  "themeId": "hayvanlar",
  "light": "morning",
  "rows": [
   [
    "Bitkinin parçaları",
    "YAPRAK|ÇİÇEK|TOHUM|SAP"
   ],
   [
    "Bahçe işleri",
    "BUDAMA|DİKİM|ÇAPALAMA|SULAMA"
   ],
   [
    "Bahçıvanın gereçleri",
    "ÇAPA|KÜREK|SULUK|MAKAS",
    [
     "Toprağı kabartmak ve yabani otları temizlemek için kullanılan araç.",
     "Toprağı kazıp taşımaya yarayan, geniş ağızlı saplı araç.",
     "Bitkilere su vermek için kullanılan kap.",
     "Budamada dalları kesmeye yarayan iki ağızlı araç."
    ]
   ],
   [
    "Saksıdaki çiçekler",
    "LALE|MENEKŞE|SÜMBÜL|BEGONYA"
   ],
   [
    "Bahçe toprağı",
    "KUM|KİL|TORF|KOMPOST"
   ],
   [
    "Filizlenirken",
    "FİLİZ|TOMURCUK|FİDE|ÇİMLENME"
   ]
  ],
  "bonus": "FİLİZ"
 },
 {
  "id": "ufuk-fotograf",
  "title": "Fotoğraf Gezisi",
  "themeId": "teknoloji",
  "light": "afternoon",
  "rows": [
   [
    "Fotoğraf makinesi",
    "MERCEK|GÖVDE|EKRAN|FİLTRE"
   ],
   [
    "Çekimin ayarları",
    "ODAK|POZ|ISO|DİYAFRAM"
   ],
   [
    "Işık ve görüntü",
    "GÖLGE|SİLUET|YANSIMA|PARLAMA",
    [
     "Işığın bir nesne tarafından engellenmesiyle oluşan karanlık alan.",
     "Bir nesnenin ayrıntıları görünmeyen dış çizgi biçimi.",
     "Işığın bir yüzeye çarpıp geri dönmesiyle oluşan görüntü.",
     "Bir yüzeyde veya ışık kaynağında görülen güçlü aydınlık."
    ]
   ],
   [
    "Fotoğraf türleri",
    "PORTRE|MANZARA|MAKRO|SOKAK"
   ],
   [
    "Çekim çantası",
    "TRİPOD|FLAŞ|PİL|KART"
   ],
   [
    "Karanlık odada",
    "FİLM|BANYO|NEGATİF|BASKI"
   ]
  ],
  "bonus": "ODAK"
 },
 {
  "id": "ufuk-sahne",
  "title": "Tiyatro Kulisi",
  "themeId": "muzik",
  "light": "night",
  "rows": [
   [
    "Sahnenin çevresi",
    "PERDE|DEKOR|KULİS|SAHNE"
   ],
   [
    "Oyuncunun hazırlığı",
    "KOSTÜM|MAKYAJ|PERUK|MASKE"
   ],
   [
    "Tiyatroda duyulur",
    "REPLİK|TİRAD|ALKIŞ|SUFLE",
    [
     "Bir oyunda oyuncunun söylediği karşılıklı konuşma cümlesi.",
     "Bir oyuncunun sahnede söylediği uzun ve kesintisiz konuşma.",
     "Beğeniyi göstermek için elleri birbirine vurma sesi.",
     "Unutulan repliği seyirciye duyurmadan oyuncuya hatırlatma işi."
    ]
   ],
   [
    "Gösteriye giderken",
    "BİLET|AFİŞ|FUAYE|LOCA"
   ],
   [
    "Oyun türleri",
    "KOMEDİ|DRAM|TRAJEDİ|MÜZİKAL"
   ],
   [
    "Sahne ekibi",
    "OYUNCU|REJİSÖR|YAZAR|IŞIKÇI"
   ]
  ],
  "bonus": "PERDE"
 },
 {
  "id": "ufuk-desen",
  "title": "Renk ve Desen",
  "themeId": "teknoloji",
  "light": "day",
  "rows": [
   [
    "Sıcak renkler",
    "KIRMIZI|TURUNCU|SARI|KİREMİT"
   ],
   [
    "Maviye yakın tonlar",
    "LACİVERT|TURKUAZ|PETROL|İNDİGO"
   ],
   [
    "Resmin çizgileri",
    "NOKTA|ÇİZGİ|KONTUR|TARAMA",
    [
     "Kalemin kâğıda tek dokunuşuyla oluşan küçük iz.",
     "Bir noktanın hareketiyle oluşan uzun iz.",
     "Bir biçimin dış sınırını belirleyen çizgi.",
     "Gölge vermek için yan yana veya çapraz çizgiler çizme yöntemi."
    ]
   ],
   [
    "Tekrarlanan desenler",
    "PUANTİYE|ÇİZGİLİ|EKOSE|BAKLAVA"
   ],
   [
    "Resim malzemeleri",
    "PASTEL|GUAJ|AKRİLİK|KÖMÜR"
   ],
   [
    "Resmin yüzeyi",
    "KAĞIT|TUVAL|KARTON|DUVAR"
   ]
  ],
  "bonus": "RENK"
 },
 {
  "id": "ufuk-dokuma",
  "title": "Dokuma Evi",
  "themeId": "teknoloji",
  "light": "afternoon",
  "rows": [
   [
    "Doğal lifler",
    "PAMUK|YÜN|KETEN|İPEK"
   ],
   [
    "Dokuma tezgâhında",
    "MEKİK|ÇÖZGÜ|ATKI|TARAK"
   ],
   [
    "İplik biçimleri",
    "YUMAK|MAKARA|ÇİLE|BOBİN",
    [
     "İpliğin yuvarlak biçimde sarılmış hâli.",
     "İpliğin üzerine sarıldığı küçük silindir.",
     "İpliğin büyük halkalar hâlinde sarılmış demeti.",
     "İpliğin makinede kullanılmak üzere sarıldığı silindirik parça."
    ]
   ],
   [
    "Dokunmuş ev eşyaları",
    "HALI|KİLİM|ÖRTÜ|HEYBE"
   ],
   [
    "Kumaş yüzeyleri",
    "KADİFE|SATEN|TÜL|KEÇE"
   ],
   [
    "El işi süsleri",
    "DANTEL|OYA|NAKIŞ|PÜSKÜL"
   ]
  ],
  "bonus": "İPLİK"
 },
 {
  "id": "ufuk-deney",
  "title": "Deney Masası",
  "themeId": "teknoloji",
  "light": "day",
  "rows": [
   [
    "Laboratuvar kapları",
    "BEHER|TÜP|BALON|PİPET"
   ],
   [
    "Madde hâlleri",
    "KATI|SIVI|GAZ|PLAZMA"
   ],
   [
    "Ölçülen büyüklükler",
    "KÜTLE|HACİM|UZUNLUK|SICAKLIK",
    [
     "Bir cismin içerdiği madde miktarı.",
     "Bir cismin uzayda kapladığı yer.",
     "Bir nesnenin iki ucu arasındaki uzaklık.",
     "Bir maddenin ne kadar sıcak veya soğuk olduğunu belirten büyüklük."
    ]
   ],
   [
    "Basit elektrik devresi",
    "PİL|KABLO|AMPUL|ANAHTAR"
   ],
   [
    "Mıknatısın çevresi",
    "KUTUP|ALAN|DEMİR|NİKEL"
   ],
   [
    "Bir deneyin aşamaları",
    "SORU|DENEY|GÖZLEM|SONUÇ"
   ]
  ],
  "bonus": "DENEY"
 },
 {
  "id": "ufuk-gok",
  "title": "Gökyüzü Defteri",
  "themeId": "uzay",
  "light": "night",
  "rows": [
   [
    "Güneş çevresinde",
    "MERKÜR|VENÜS|DÜNYA|MARS"
   ],
   [
    "Gaz ve buz devleri",
    "JÜPİTER|SATÜRN|URANÜS|NEPTÜN"
   ],
   [
    "Uzayın küçük cisimleri",
    "METEOR|ASTEROİT|UYDU|KOMET",
    [
     "Atmosfere giren bir göktaşının oluşturduğu ışıklı olay.",
     "Güneş çevresinde dolanan, gezegenden küçük kayalık gök cismi.",
     "Bir gezegenin çevresinde dolanan doğal veya yapay cisim.",
     "Güneş'e yaklaşınca kuyruğu belirginleşen gök cisminin diğer adı."
    ]
   ],
   [
    "Göğü gözlerken",
    "TELESKOP|MERCEK|KUBBE|ODAK"
   ],
   [
    "Uzay yolculuğu",
    "ROKET|KAPSÜL|YÖRÜNGE|MODÜL"
   ],
   [
    "Gökyüzü olayları",
    "TUTULMA|ŞAFAK|GURUP|AURORA"
   ]
  ],
  "bonus": "YILDIZ"
 },
 {
  "id": "ufuk-yol",
  "title": "Yol Kenarı Defteri",
  "themeId": "dunya",
  "light": "afternoon",
  "rows": [
   [
    "Kara yolu yapıları",
    "TÜNEL|VİYADÜK|KÖPRÜ|MENFEZ"
   ],
   [
    "Tren istasyonu",
    "RAY|PERON|VAGON|MAKAS"
   ],
   [
    "Yol işaretleri",
    "DÖNÜŞ|DUR|YAYA|HIZ",
    [
     "Yolun yön değiştirdiği yeri anlatan hareket.",
     "Kavşakta ilerlemeden önce tamamen durmayı isteyen levhadaki sözcük.",
     "Yolda yürüyerek ilerleyen kişi.",
     "Bir aracın birim zamanda aldığı yolu anlatan büyüklük."
    ]
   ],
   [
    "Dinlenme tesisinde",
    "OTOPARK|LOKANTA|MARKET|MESCİT"
   ],
   [
    "Yolculukta konaklama",
    "OTEL|PANSİYON|HOSTEL|KAMP"
   ],
   [
    "Gezginin notları",
    "GÜNLÜK|ROTA|ADRES|BÜTÇE"
   ]
  ],
  "bonus": "ROTA"
 },
 {
  "id": "ufuk-kis",
  "title": "Kışın Renkleri",
  "themeId": "dunya",
  "light": "morning",
  "rows": [
   [
    "Soğuğa hazırlanırken",
    "ATKI|BERE|ELDİVEN|KABAN"
   ],
   [
    "Karlı yamaçlarda",
    "KAYAK|KIZAK|KASK|BATON"
   ],
   [
    "Kışın içecekleri",
    "SALEP|BOZA|ÇAY|IHLAMUR",
    [
     "Orkide yumrularından elde edilen tozla yapılan sıcak içecek.",
     "Tahıldan yapılan, koyu kıvamlı ve hafif ekşimsi içecek.",
     "Kurutulmuş yaprakların sıcak suda demlenmesiyle hazırlanan yaygın içecek.",
     "Güzel kokulu ağaç çiçeklerinin demlenmesiyle yapılan içecek."
    ]
   ],
   [
    "Kış havası",
    "SİS|TİPİ|AYAZ|BULUT"
   ],
   [
    "Buzun biçimleri",
    "SARKIT|KRİSTAL|BUZUL|TABAKA"
   ],
   [
    "Sıcak odada",
    "ŞÖMİNE|SOBA|YORGAN|MİNDER"
   ]
  ],
  "bonus": "KAR"
 }
];
const PIECES:Record<string,string>={
 "ufuk-ciftlik": "Buğday başağı|Kümes kapısı|Petek gözü|Hasat sepeti|Ahşap tırmık|Kiler anahtarı",
 "ufuk-orman": "Meşe yaprağı|Gövde halkası|Çam kozalağı|Geyik izi|Yosun örtüsü|Kuş yuvası",
 "ufuk-gol": "Kuğu tüyü|Kıyı çakılı|Balık pulu|Nilüfer yaprağı|Kelebek kanadı|Piknik örtüsü",
 "ufuk-yagmur": "Yağmur bulutu|Rüzgâr gülü|Çiy damlası|Hava günlüğü|Sarı şemsiye|Su halkası",
 "ufuk-kamp": "Kamp feneri|Zirve taşı|Cep pusulası|Yürüyüş batonu|Ateş kıvılcımı|Yün kilim",
 "ufuk-ada": "İskele bileti|Küçük çapa|Dalga izi|Koy kartpostalı|Beyaz yelken|Plaj havlusu",
 "ufuk-kent": "Sokak levhası|Müze bileti|Balkon çiçeği|Meydan saati|Kaldırım taşı|Kapı tokmağı",
 "ufuk-pazar": "Marul yaprağı|Mor lahana|Terazi ağırlığı|Pazar etiketi|Nane demeti|Kış sepeti",
 "ufuk-firin": "Maya kavanozu|Fırın küreği|Susamlı simit|Örgü hamur|Haşhaş tanesi|Turta dilimi",
 "ufuk-sofra": "İşlemeli peçete|Zeytin dalı|Çay fincanı|Bakır tava|Pekmez kavanozu|Çay bardağı",
 "ufuk-ev": "Perde bağı|Abajur ışığı|Temizlik fırçası|Tahta mandal|Yastık kılıfı|Eski anahtar",
 "ufuk-bahcivan": "Tohum zarfı|Bahçe eldiveni|Küçük kürek|Menekşe saksısı|Toprak kesesi|İlk tomurcuk",
 "ufuk-fotograf": "Mercek kapağı|Poz defteri|Gölge karesi|Manzara baskısı|Fotoğraf çantası|Film şeridi",
 "ufuk-sahne": "Kadife perde|Tiyatro maskesi|Replik kartı|Gösteri bileti|Oyun afişi|Son selam",
 "ufuk-desen": "Kırmızı boya|Turkuaz fırça|Çizim kalemi|Desenli kâğıt|Pastel kutusu|Boş tuval",
 "ufuk-dokuma": "Pamuk kozası|Ahşap mekik|Renkli yumak|Kilim parçası|Kadife şerit|Dantel motifi",
 "ufuk-deney": "Cam beher|Madde kartı|Ölçü cetveli|Küçük ampul|Çubuk mıknatıs|Gözlem defteri",
 "ufuk-gok": "Mars kartı|Satürn halkası|Meteor izi|Yıldız merceği|Roket rozeti|Kutup ışığı",
 "ufuk-yol": "Köprü çizimi|Tren bileti|Yön levhası|Mola kartı|Otel anahtarı|Gezi günlüğü",
 "ufuk-kis": "Yün bere|Kızak izi|Salep fincanı|Kar bulutu|Buz kristali|Sıcak battaniye"
};
export const HORIZON_ROUTES:CoastRoute[]=SPECS.map(spec=>({
 id:spec.id,title:spec.title,subtitle:'Yeni Ufuklar',album:spec.title+' Albümü',light:spec.light,
 pieces:PIECES[spec.id]!.split('|'),
 chapters:spec.rows.map(([title,bank,definitions],i)=>{
  const words=bank.split('|');return {id:`${spec.id}-${i+1}`,themeId:spec.themeId,title,subtitle:spec.title,words,size:Math.max(6,...words.map(w=>w.length)),
   difficulty:i===0||i===5?'Rahat':i===4?'Ustalık':'Dengeli',note:definitions?'Tanımı çöz, cevabı tahtada bul.':'Yatay, dikey ve çapraz. Kelimeleri iki uçtan da seçebilirsin.',
   ...(definitions?{clues:Object.fromEntries(words.map((w,n)=>[w,definitions[n]!]))}:{})};
 })
}));
export const HORIZON_CHAPTERS=HORIZON_ROUTES.flatMap(r=>r.chapters);
export const HORIZON_BONUS_WORDS=Object.fromEntries(SPECS.map(r=>[r.id,r.bonus]));
export const horizonRouteForChapter=(id?:string)=>HORIZON_ROUTES.find(r=>r.chapters.some(c=>c.id===id));
