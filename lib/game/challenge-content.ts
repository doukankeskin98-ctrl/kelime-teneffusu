import {worldChapter} from './world-presentation.ts';
import {ACTIVE_JOURNEYS,journeyBoard,MYSTERIES,mysteryBoard} from './content.ts';
import {MAIN_JOURNEY} from './main-journey.ts';
import {RETIRED_RELEASE_IDS,RETIRED_THEMES,originalThemeId} from './original-content.ts';
import {findTheme} from './catalog.ts';
import {RELEASE_BATCHES,releasedChapter} from '../studio/releases.ts';
import {ChapterStore} from '../studio/store.ts';
import {GameError,type Database} from './server.ts';
import type {Puzzle} from './engine.ts';
import {hash} from './engine.ts';
import {presentationBoard} from './journey-presentation.ts';
import {safeSnapshot} from './board-quality.ts';

export interface ChallengeChoice {id:string;title:string;themeId:string;world:string;words:number;kind:'journey'|'extra';number?:number}
export interface ChallengeContent {version:1;chapterId:string;title:string;themeId:string;board:Puzzle;clues?:Record<string,string>}
const ordered=[...MAIN_JOURNEY.map(x=>x.chapter),...ACTIVE_JOURNEYS.filter(j=>!MAIN_JOURNEY.some(x=>x.chapter.id===j.id))];
const coreChoices=ordered.map((j):ChallengeChoice=>({id:j.id,title:worldChapter(j.id)?.topic??j.title,themeId:originalThemeId(j.themeId),world:findTheme(originalThemeId(j.themeId)).title,words:j.words.length,kind:'journey',number:MAIN_JOURNEY.find(x=>x.chapter.id===j.id)?.number}));
export async function challengeCatalogue(db:Database,now:number):Promise<ChallengeChoice[]>{
 const entries:ChallengeChoice[]=[...coreChoices,...MYSTERIES.map(m=>({id:'mystery:'+m.id,title:m.answer,themeId:originalThemeId(m.themeId),world:'Gizli Tema',words:m.words.length+1,kind:'journey' as const}))],store=new ChapterStore(db,()=>now);
 // Source releases are immutable. Traverse every batch, not the 24-card shelf page.
 for(const batch of RELEASE_BATCHES)for(const {chapter} of batch.chapters){
  if(batch.date>new Date(now).toISOString().slice(0,10)||chapter.publishedAt>now||RETIRED_RELEASE_IDS.has(chapter.id))continue;
  entries.push({id:chapter.id,title:chapter.spec.title,themeId:originalThemeId(chapter.spec.themeId),world:'Tarihli keşifler',words:chapter.spec.words.length,kind:'extra'});
 }
 for(let offset=0;offset!==null;){
  const page=await store.catalogue(offset);
  for(const c of page.chapters)if(!RETIRED_THEMES.has(c.spec.themeId))entries.push({id:c.id,title:c.spec.title,themeId:c.spec.themeId,world:'Ek keşifler',words:c.spec.words.length,kind:'extra'});
  if(page.nextOffset===null)break;offset=page.nextOffset;
 }
 return entries;
}
export async function challengeContent(db:Database,id:unknown,now:number):Promise<ChallengeContent>{
 if(typeof id!=='string')throw new GameError('Bir bölüm seç.');
 const mystery=MYSTERIES.find(m=>'mystery:'+m.id===id);if(mystery)return {version:1,chapterId:id,title:mystery.answer,themeId:originalThemeId(mystery.themeId),board:presentationBoard(mysteryBoard(mystery),id)};
 // Old clients may still submit a generic theme. Route them to a real active chapter.
 const chapter=ACTIVE_JOURNEYS.find(j=>j.id===id)??(!RETIRED_THEMES.has(id)?ACTIVE_JOURNEYS.find(j=>j.themeId===id):undefined);
 if(chapter)return {version:1,chapterId:chapter.id,title:worldChapter(chapter.id)?.topic??chapter.title,themeId:originalThemeId(chapter.themeId),board:presentationBoard(journeyBoard(chapter),'route:'+chapter.id),clues:chapter.clues};
 const choice=(await challengeCatalogue(db,now)).find(c=>c.id===id);if(!choice)throw new GameError('Bu bölüm yeni meydan okumalara açık değil.',404);
 const extra=releasedChapter(id,now)??await new ChapterStore(db,()=>now).playable(id);
 return {version:1,chapterId:extra.id,title:extra.spec.title,themeId:originalThemeId(extra.spec.themeId),board:safeSnapshot(extra.board,hash('challenge-safe:'+extra.id))};
}
