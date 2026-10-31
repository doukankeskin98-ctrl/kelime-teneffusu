import type {Journey} from './content.ts';
import type {Puzzle,Stroke} from './engine.ts';

export type StorySceneKind='harbor'|'garden'|'bakery'|'observatory'|'courtyard';
export interface StoryStep {word:string;clue:string;reveal:string}
export interface LivingStory extends Journey {scene:StorySceneKind;tagline:string;ending:string;keepsake:string;steps:StoryStep[]}
const story=(id:string,themeId:string,title:string,scene:StorySceneKind,size:number,tagline:string,ending:string,keepsake:string,steps:StoryStep[]):LivingStory=>({id,themeId,title,scene,size,tagline,ending,keepsake,steps,words:steps.map(s=>s.word),subtitle:tagline,difficulty:size===6?'Rahat':'Dengeli',note:'Bir kelime bul, sahnenin bir parçasını canlandır. Her buluş bir sonraki ipucunu açar.',clues:Object.fromEntries(steps.slice(1).map(s=>[s.word,s.clue]))});
/** Published story IDs and their word order are immutable. Append future stories. */
export const LIVING_STORIES:LivingStory[]=[
 story('dunya-story-fener-v1','dunya','Fenerin ışığı','harbor',6,'Küçük bir ışık, eve uzanan bir yol.','Fener yanıyor. Yelkenli, ışığını izleyerek limana ulaştı. Bu kıyıda artık senin de bir izin var.','Işıklı kıyı',[
  {word:'KIYI',clue:'İlk adım: KIYI kelimesini bul.',reveal:'Dalgaların kıyısı beliriyor.'},
  {word:'FENER',clue:'Gece gemilere ışığıyla yol gösterir.',reveal:'Fenerin ışığı denize uzanıyor.'},
  {word:'YELKEN',clue:'Teknede rüzgârla dolan büyük bez.',reveal:'Bir yelken rüzgârla doluyor.'},
  {word:'LİMAN',clue:'Gemilerin sığındığı, kıyıdaki güvenli yer.',reveal:'Yolculuk sıcak bir limanda tamamlandı.'},
 ]),
 story('hayvanlar-story-bahce-v1','hayvanlar','Ormanın uyanışı','garden',7,'Bir tohumun sakladığı kocaman dünya.','Yağmur toprağı canlandırdı, çiçekler açtı. Küçücük bir tohum, kelebeğin uğradığı bir bahçeye dönüştü.','İlk çiçek',[
  {word:'TOHUM',clue:'İlk adım: TOHUM kelimesini bul.',reveal:'Küçük bir tohum toprağa yerleşti.'},
  {word:'YAĞMUR',clue:'Bulutlardan damlalar hâlinde düşer.',reveal:'Toprak yağmurla canlanıyor.'},
  {word:'FİLİZ',clue:'Tohumdan çıkan ilk küçük sürgün.',reveal:'Toprağın içinden bir filiz yükseldi.'},
  {word:'ÇİÇEK',clue:'Bitkinin arıları çeken renkli bölümü.',reveal:'Bahçenin ilk çiçeği açıldı.'},
  {word:'KELEBEK',clue:'Tırtılken dönüşüp renkli kanatlarıyla uçar.',reveal:'Bahçeye kanatlı bir misafir geldi.'},
 ]),
 story('lezzetler-story-firin-v1','lezzetler','Fırında ilk sabah','bakery',7,'Sokağı uyandıran sıcacık bir koku.','Fırının ilk ekmeği sofrada. Sokak uyanırken senin küçük keşfin de bu sabahın bir parçası oldu.','Sabah sofrası',[
  {word:'ELEK',clue:'İlk adım: ELEK kelimesini bul.',reveal:'Un, tezgâha ince ince dökülüyor.'},
  {word:'HAMUR',clue:'Un ve su yoğrulunca oluşur.',reveal:'Tezgâhta yumuşacık bir hamur var.'},
  {word:'FIRIN',clue:'Hamurun ekmeğe dönüştüğü sıcak yer.',reveal:'Fırının içi sıcacık aydınlandı.'},
  {word:'EKMEK',clue:'Mayalı hamurun pişmiş hâli; sofranın tanıdık tadı.',reveal:'İlk ekmek fırından çıktı.'},
  {word:'SOFRA',clue:'Yemek için hazırlanan masa düzeni.',reveal:'Sabah sofrası hazır. Hoş geldin.'},
 ]),
 story('uzay-story-gozlem-v1','uzay','Gökyüzüne bir pencere','observatory',8,'Uzak sandığın şeylere biraz daha yaklaş.','Gözlemevinin penceresinden yepyeni bir gökyüzü açıldı. Bazen büyük bir keşif, küçük bir mercekle başlar.','Gece gözlemi',[
  {word:'MERCEK',clue:'İlk adım: MERCEK kelimesini bul.',reveal:'Gökyüzüne açılan ilk cam yerine oturdu.'},
  {word:'TELESKOP',clue:'Uzak gök cisimlerini yakından gösteren araç.',reveal:'Teleskop geceye doğru çevrildi.'},
  {word:'UYDU',clue:'Bir gezegenin çevresinde dolanır; doğal ya da yapay olabilir.',reveal:'Gökyüzünde bir uydu süzülüyor.'},
  {word:'GEZEGEN',clue:'Bir yıldızın çevresinde dolanır; Dünya da bunlardan biri.',reveal:'Halkalı bir gezegen göründü.'},
  {word:'YILDIZ',clue:'Gökyüzünde kendi ışığını yayan gök cismi.',reveal:'Gece, yıldızlarla tamamlandı.'},
 ]),
 story('muzik-story-avlu-v1','muzik','Avluda akşam','courtyard',7,'Bir melodiyle bir araya gelen insanlar.','Avlu müzikle doldu. Bir notadan başlayan akşam, birlikte söylenen bir şarkıya dönüştü.','Avlu konseri',[
  {word:'NOTA',clue:'İlk adım: NOTA kelimesini bul.',reveal:'İlk nota akşamın sessizliğine karıştı.'},
  {word:'GİTAR',clue:'Genellikle altı teli olan, elle çalınan müzik aleti.',reveal:'Gitar sahnede yerini aldı.'},
  {word:'RİTİM',clue:'Müzikte vuruşların düzeni.',reveal:'Vuruşlar melodinin yolunu buldu.'},
  {word:'KORO',clue:'Birlikte şarkı söyleyen topluluk.',reveal:'Sesler aynı şarkıda buluştu.'},
  {word:'ALKIŞ',clue:'Beğenimizi ellerimizi birbirine vurarak gösteririz.',reveal:'Avlunun küçük konseri alkışlarla bitti.'},
 ]),
];
export const livingStory=(id?:string)=>LIVING_STORIES.find(s=>s.id===id)??null;
/** Read progress from full-board confirmed strokes. Never store a second stage counter. */
export function storyStage(story:LivingStory,board:Pick<Puzzle,'targets'>,strokes:Stroke[]){
 const found=new Set(strokes.map(s=>s.id));
 const index=story.steps.findIndex(step=>board.targets.some(t=>t.text===step.word&&!found.has(t.id)));
 const current=index<0?null:story.steps[index]!;
 return {index:index<0?story.steps.length:index,current,complete:index<0,target:current?board.targets.find(t=>t.text===current.word)??null:null};
}
