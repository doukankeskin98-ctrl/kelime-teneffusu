import {discoveriesRouteForChapter} from './discoveries-content.ts';
import {everydayRouteForChapter} from './everyday-content.ts';
import {natureRouteForChapter} from './nature-content.ts';
import {coastRouteForChapter} from './coast-content.ts';
import {EXPEDITIONS,expeditionForChapter,expeditionBonusId} from './discovery.ts';
import {journeyById} from './content.ts';
import type {Target} from './engine.ts';
import type {WordVeil} from './word-card.ts';

/** Presentation metadata only: never used in generation, save keys or rewards. */
const TOPICS:Record<string,readonly string[]>={
 'doga-bahce':['Bahçe gereçleri','Filizler','Bahçe işleri','Renkler','Kokulu bitkiler','Sebzeler'],
 'doga-dere':['Dere kıyısı','Akarsular','Suyun hâlleri','Ahşap köprü','Dere canlıları','Vadi'],
 'doga-kamp':['Çadır kurma','Kamp çantası','Yürüyüş gereçleri','Sofra','Hava olayları','Yol bulma'],
 'doga-gozlem':['Gün batımı','Ay','Gözlem araçları','Gece sesleri','Gökyüzü haritası','Gözlem notları'],
 uzay:['Gökyüzüne bak','Gezegen komşuları','Uzay yolculuğu','Evrenin derinlikleri','Uzak uzay','Gözlemevinde bir gece'],
 turkiye:['Kıyıdan şehre','Türkiye sokakları','Dağlar ve göller','Tarihin izleri','Bir Türkiye gezisi','Anadolu hatıraları'],
 hababam:['Sınıfın içinden','Teneffüs zamanı','Hababam anıları','Sınıf yoklaması','Bütün sınıf burada','Mezuniyet hatırası'],
 hayvanlar:['Küçük dostlarımız','Ormanın sakinleri','Yuvadaki sırlar','Denizde ve karada','Vahşi doğa','Ormanın gizli canlıları'],
 lezzetler:['Fırından sofraya','Ev yemekleri','Mutfağın sırları','Sofra hazır','Sofranın lezzetleri','Son lokmanın bilmecesi'],
 muzik:['Müziğin alfabesi','Çalgılar konuşuyor','Sahnede ne var?','Orkestranın sesi','Şarkının içinden','Konserin son alkışı'],
 dunya:['Dört şehir, dört durak','Dünya sokakları','Yol çantamda ne var?','Şehirler ve çöller','Yeryüzünün izleri','Kıyıdaki sırlar'],
 bilim:['En küçük yapı taşları','Fiziğin dünyası','Gözlem ve deney','Maddenin içinde','Bilimin peşinde','Laboratuvar bilmeceleri'],
 teknoloji:['İlk bağlantı','Bilgisayarın içinde','Masanın üzerindekiler','Bağlı bir dünya','Dijital izler','Atölyenin sırları'],
 doksanlar:['Doksanlar','Doksanlara dönüş','Sokaktan haberler','Bir yaz öğleden sonrası','Hatıra çekmecesi','Müzik ve sinema'],
 futbol:['İlk düdük','Takım ruhu','Sahanın kuralları','Maçın içinden','Golün yolları','Son düdüğün bilmecesi'],
 basketbol:['Potaya doğru','Takım sahada','Oyunun dili','Hücum ve savunma','Sayının yolları','Parkenin sırları'],
 sinema:['İlk sahne','Kamera arkasında','Perdenin ipuçları','Film dünyası','Setten salona','Salonda son ışık'],
 yesilcam:['Mahalleye hoş geldin','Perdeye yansıyanlar','Tanıdık replikler','Film setinde','Yazlık sinema','Mahalle hatıraları'],
 diziler:['Hikâye başlıyor','Dizi seti','Sıradaki bölüm','Bir mahalle dizisi','Çekim arası','Ekranın sırları'],
 mitoloji:['Olimpos sakinleri','Tanrıların öyküleri','Efsanevi izler','Yunan mitolojisi','Mitoloji dünyası','Efsanenin son sayfası'],
};
export function worldChapter(id?:string){
 const chapter=id?journeyById(id):null;if(!chapter)return null;
 const world=expeditionForChapter(chapter.id);if(!world)return null;
 const index=world.chapterIds.indexOf(chapter.id),bonus=chapter.id===expeditionBonusId(world);
 if(index<0&&!bonus)return null;
 const position=bonus?5:index;
 return {world,position,topic:chapter.id.startsWith('ozgun-')?chapter.title:TOPICS[world.id]?.[position]??chapter.title,chapter};
}

/** Fixed per chapter/group across resumes, devices and replays. Clues retain their own rules. */
export function chapterVeils(id:string|undefined,targets:Target[]):Record<number,WordVeil>{
 const info=worldChapter(id),veils:Record<number,WordVeil>={};
 if(!info||info.chapter.clues)return veils;
 const groups=[...new Set(targets.map(t=>t.group))];
 for(const [i,group] of groups.entries()){
  const step=info.position;
  if(discoveriesRouteForChapter(id)||coastRouteForChapter(id)||natureRouteForChapter(id)||everydayRouteForChapter(id)){veils[group]=i===groups.length-1?(step===4?'initial':(id==='kiyi-fener-6'||id==='doga-gozlem-6'||id==='renkler-muzik-6'||id==='kesif-zaman-6')?'hidden':'open'):'open';continue;}
  // Concealed words are occasional challenges; most targets stay readable.
  veils[group]=step>=4?(i===groups.length-1?'hidden':i===groups.length-2?'initial':'open'):step>=2&&i===groups.length-1?'initial':'open';
 }
 return veils;
}
export function veilInstruction(veils:Record<number,WordVeil>){
 const modes=Object.values(veils);
 return modes.includes('hidden')?'Her yıldız saklı bir harf. Bölümün konusundan yola çık.':modes.includes('initial')?'Bazı kelimelerde yalnız ilk harf açık. Yıldızlar kalan harfler.':null;
}
