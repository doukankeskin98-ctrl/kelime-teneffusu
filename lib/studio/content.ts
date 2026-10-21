import {THEMES,normalize} from '../game/catalog.ts';
import {makeCustomPuzzle,exactLine,type Puzzle} from '../game/engine.ts';

export class StudioError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status;}}
export interface ChapterSpec {title:string;themeId:string;words:string[];size:number;seed:number;difficulty:'Rahat'|'Dengeli'|'Ustalık';note:string}
export interface PublishedChapter {id:string;spec:ChapterSpec;contentHash:string;publishedAt:number}
export interface PlayableChapter extends PublishedChapter {board:Puzzle;archived:boolean}
export interface AdminChapter extends PlayableChapter {status:'draft'|'published'|'archived';revision:number;created:number;updated:number;starts:number;completions:number}
export interface ChapterCheck {targets:number;alternateLayouts:number;diagonals:boolean;size:number}
const cleanText=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max&&!/[\u0000-\u001f\u007f-\u009f]/u.test(v)?v.normalize('NFC').trim():'';
export function parseChapterSpec(raw:unknown):ChapterSpec {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new StudioError('Bölüm bilgileri okunamadı.');
 const r=raw as Record<string,unknown>,title=cleanText(r['title'],60),note=cleanText(r['note']??'',220);
 if(title.length<3)throw new StudioError('Bölüm adı 3–60 karakter olmalı.');
 if(typeof r['note']==='string'&&(r['note'].length>220||r['note']&&!note))throw new StudioError('Bölüm notu en fazla 220 karakter olmalı.');
 const themeId=typeof r['themeId']==='string'?r['themeId']:'';if(!THEMES.some(t=>t.id===themeId))throw new StudioError('Geçerli bir tema seç.');
 if(!Array.isArray(r['words'])||r['words'].length<3||r['words'].length>10)throw new StudioError('Her satıra bir kelime yazarak 3–10 kelime ekle.');
 const words=r['words'].map((v:unknown)=>cleanText(v,40).replace(/\s+/g,' ').toLocaleUpperCase('tr-TR'));
 if(words.some(w=>normalize(w).length<2||!/^[-A-ZÇĞİÖŞÜ0-9 ’']+$/u.test(w)))throw new StudioError('Kelimeler en az iki harf içermeli; yalnızca harf, rakam, boşluk ve kesme işareti kullan.');
 if(typeof r['size']!=='number'||!Number.isInteger(r['size'])||r['size']<6||r['size']>12)throw new StudioError('Tahta boyutu 6–12 arasında olmalı.');
 if(typeof r['seed']!=='number'||!Number.isInteger(r['seed'])||r['seed']<1||r['seed']>2147483647)throw new StudioError('Yerleşim numarası 1–2147483647 arasında olmalı.');
 const difficulty=r['difficulty'];if(difficulty!=='Rahat'&&difficulty!=='Dengeli'&&difficulty!=='Ustalık')throw new StudioError('Bölümün zorluk düzeyini seç.');
 return {title,themeId,words,size:r['size'],seed:r['seed'],difficulty,note};
}
export function checkChapter(raw:unknown){
 const spec=parseChapterSpec(raw);let board:Puzzle;
 try{board=makeCustomPuzzle(spec.words,spec.seed,spec.size);}catch(e){throw new StudioError(e instanceof Error?e.message:'Kelimeler yerleştirilemedi.');}
 if(board.size!==spec.size)throw new StudioError(`Bu kelimeler için tahta boyutunu en az ${board.size} olarak seç.`);
 const slopes=new Set<number>();
 for(const p of board.placements){const line=exactLine(p.a,p.b,board.size);if(!line||line.map(([r,c])=>board.grid[r]![c]).join('')!==p.text)throw new StudioError('Bir kelimenin yerleşimi doğrulanamadı.');if(p.a[0]!==p.b[0]&&p.a[1]!==p.b[1])slopes.add(Math.sign((p.b[0]-p.a[0])*(p.b[1]-p.a[1])));}
 if(!slopes.has(1)||!slopes.has(-1))throw new StudioError('Her iki yönde çapraz kelime yerleşmeli.');
 try{for(let seed=1;seed<=20;seed++)makeCustomPuzzle(spec.words,seed,spec.size);}catch{throw new StudioError('Kelime grubu alternatif yerleşim denetiminden geçemedi.');}
 return {spec,board,checks:{targets:board.targets.length,alternateLayouts:20,diagonals:true,size:board.size} satisfies ChapterCheck};
}
export const validChapterId=(id:unknown):id is string=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
export const NEW_CHAPTER:ChapterSpec={title:'Küçük bir keşif',themeId:'uzay',words:['KELİME','MERAK','KEŞİF','DÜNYA'],size:6,seed:42,difficulty:'Rahat',note:'Acele yok. Çaprazlara da bak.'};
