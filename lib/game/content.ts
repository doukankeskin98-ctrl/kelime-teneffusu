import {hash,makeCustomPuzzle} from './engine.ts';

export interface Journey {
 id:string;themeId:string;title:string;subtitle:string;words:string[];size:number;difficulty:'Rahat'|'Dengeli'|'Ustalık';note:string;
}
const route=(themeId:string,items:[string,string,string,number,'Rahat'|'Dengeli'|'Ustalık',string][]):Journey[]=>items.map(([title,subtitle,words,size,difficulty,note],i)=>({id:`${themeId}-${i+1}`,themeId,title,subtitle,words:words.split('|'),size,difficulty,note}));
export const JOURNEYS:Journey[]=[
 ...route('hababam',[
  ['Zil çaldı','Sınıfın kapısını arala.','SINIF|TAHTA|SOBA|KOPYA',6,'Rahat','Bir kelimeyi iki ucuna dokunarak da seçebilirsin.'],
  ['Arka sıra','Tanıdık yüzlerle ilk karşılaşma.','BACAKSIZ|MÜDÜR|KARNE|TEBEŞİR|TENEFFÜS',8,'Rahat','Çapraz kelimeler iki farklı eğimde saklanır.'],
  ['Sınıfın neşesi','İsimlerin izini sür.','İNEK ŞABAN|HAFİZE ANA|BADİ EKREM|KOPYA|SOBA',9,'Dengeli','Uzun isimleri bulurken önce ilk ve son harfe bak.'],
  ['Yoklama zamanı','Bakış açını değiştir.','KEL MAHMUT|GÜDÜK NECMİ|DAMAT FERİT|AKİL HOCA|TAHTA|KARNE',10,'Dengeli','Kelimeyi tersten seçmek de geçerli.'],
  ['Son ders','Bütün sınıf bir arada.','HAYTA İSMAİL|DOMDOM ALİ|PAŞA NURİ|SEMRA HOCA|ZÜHTÜ HOCA|TULUM HAYRİ|VEYSEL EFENDİ',12,'Ustalık','Bu rotanın her bölümünü bitirince Sınıf Hatırası albümünü açarsın.'],
 ]),
 ...route('uzay',[
  ['Pencereden göğe','Yakın çevremizden başla.','GÜNEŞ|DÜNYA|MARS|YILDIZ',6,'Rahat','Kısa kelimelerle çapraz bakışını ısıt.'],
  ['Gezegen komşuları','Yörüngede yeni bir durak.','VENÜS|SATÜRN|NEPTÜN|MERKÜR|JÜPİTER',7,'Rahat','Aynı harfin birden çok kelimeye ait olabileceğini unutma.'],
  ['Kalkışa hazır','Keşif ekibini tamamla.','ROKET|UYDU|YÖRÜNGE|ASTRONOT|TELESKOP',9,'Dengeli','Önce en farklı harfleri aramak işini kolaylaştırabilir.'],
  ['Yıldızların arası','Gökyüzünün ötesine bak.','GALAKSİ|BULUTSU|ASTEROİT|SAMANYOLU|KOZMOS|EVREN',9,'Dengeli','Tahtada yatay, dikey ve çapraz tarama yapmayı dene.'],
  ['Uzak ufuklar','Merakın sınırını genişlet.','ANDROMEDA|IŞIK YILI|KARA DELİK|UZAY MEKİĞİ|KUYRUKLU YILDIZ|METEOR|URANÜS',12,'Ustalık','Yörünge Günlüğü için son durak burası.'],
 ]),
 ...route('turkiye',[
  ['Küçük bir kaçamak','Harflerle yola çık.','KAŞ|FOÇA|EFES|BURSA',6,'Rahat','İlk keşfin için zaman baskısı yok.'],
  ['Şehir ışıkları','Yeni sokaklara uğra.','İZMİR|ANKARA|MARDİN|DATÇA|AMASRA',7,'Rahat','Çaprazları kontrol ederek arama alanını genişlet.'],
  ['Doğanın izinde','Biraz yeşil, biraz mavi.','ULUDAĞ|AYDER|VAN GÖLÜ|TUZ GÖLÜ|AĞRI DAĞI',8,'Dengeli','Boşluklar tahtada yer kaplamaz.'],
  ['Zamanda yolculuk','Her durakta başka bir iz.','TROYA|NEMRUT|SÜMELA|ANITKABİR|PAMUKKALE|GÖBEKLİTEPE',11,'Dengeli','Zorlandığında başka bir kelimeye geçip geri dönebilirsin.'],
  ['Yol defterinin sonu','Bir keşif daha seni bekliyor.','İSTANBUL|KAPADOKYA|SAFRANBOLU|BOĞAZİÇİ|TRABZON|ESKİŞEHİR|ANTALYA',11,'Ustalık','Anadolu Defteri bütün rotayı tamamlayınca albümüne eklenir.'],
 ]),
];
export const journeyById=(id:string)=>JOURNEYS.find(j=>j.id===id);
export const journeyBoard=(j:Journey)=>makeCustomPuzzle(j.words,hash('journey-v1:'+j.id),j.size);

export interface Mystery {id:string;title:string;themeId:string;words:string[];answer:string;options:string[];bonus:string;size:number;note:string}
export const MYSTERIES:Mystery[]=[
 {id:'raylar',title:'Bir yere gidiyoruz','themeId':'dunya',words:['PERON','BİLET','VAGON','MAKİNİST'],answer:'Tren yolculuğu',options:['Tren yolculuğu','Bir konser','Deniz tatili'],bonus:'İSTASYON',size:8,note:'Kelimeler aynı yolculukta buluştu.'},
 {id:'perde',title:'Işıklar biraz kısılsın','themeId':'sinema',words:['PERDE','KAMERA','OYUNCU','SENARYO'],answer:'Sinema',options:['Sinema','Uzay araştırması','Bir restoran'],bonus:'FESTİVAL',size:8,note:'Her kelime bu sahnenin bir parçası.'},
 {id:'mutfak',title:'Tanıdık bir koku','themeId':'lezzetler',words:['UN','MAYA','HAMUR','FIRIN'],answer:'Ekmek yapımı',options:['Bahçe bakımı','Ekmek yapımı','Kış sporları'],bonus:'EKMEK',size:7,note:'Bir avuç malzemeden ortak bir hikâye çıktı.'},
 {id:'konser',title:'Birlikte duyalım','themeId':'muzik',words:['SAHNE','RİTİM','GİTAR','ALKIŞ'],answer:'Canlı konser',options:['Bir müze','Canlı konser','Tren istasyonu'],bonus:'MELODİ',size:7,note:'Kelimelerin hepsi aynı ritmi tuttu.'},
 {id:'bahce',title:'Yavaşça büyüyen şeyler','themeId':'hayvanlar',words:['TOHUM','TOPRAK','FİLİZ','SULAMA'],answer:'Bahçecilik',options:['Bahçecilik','Basketbol','Fotoğrafçılık'],bonus:'ÇİÇEK',size:7,note:'Küçük keşifler de tohumlar gibi büyür.'},
 {id:'gok',title:'Başını biraz kaldır','themeId':'uzay',words:['YILDIZ','TELESKOP','GALAKSİ','YÖRÜNGE'],answer:'Gökyüzü gözlemi',options:['Deniz yolculuğu','Gökyüzü gözlemi','Yemek tarifi'],bonus:'EVREN',size:9,note:'Ortak bağlantı hep gözümüzün önündeydi.'},
];
export const mysteryBoard=(m:Mystery)=>makeCustomPuzzle([...m.words,m.bonus],hash('mystery-v1:'+m.id),m.size);
export const TUTORIAL=makeCustomPuzzle(['KELİME','MERAK','KEŞİF'],hash('first-discovery-v1'),6);

export const ALBUMS=[
 {themeId:'hababam',title:'Sınıf Hatırası',description:'Her teneffüste yeni bir anı.',stamp:'BİR SINIF DOLUSU ANI'},
 {themeId:'uzay',title:'Yörünge Günlüğü',description:'Merakın hep biraz daha uzağa.',stamp:'YILDIZLARIN İZİNDE'},
 {themeId:'turkiye',title:'Anadolu Defteri',description:'Her köşede bir keşif.',stamp:'YOLLAR VE KELİMELER'},
];
