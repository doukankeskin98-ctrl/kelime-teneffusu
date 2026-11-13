import assert from 'node:assert/strict';
import {it} from 'node:test';
import {reviewNovelty,difficultyIssues,type ChapterLoad} from '../lib/game/editorial-quality.ts';
import {reviewDraft} from '../lib/game/content-review.ts';
import {checkNewChapter,NEW_CHAPTER} from '../lib/studio/content.ts';
import {HORIZON_CHAPTERS,HORIZON_ROUTES} from '../lib/game/horizons-content.ts';
import {chapterPace} from '../lib/game/journey-flow.ts';
import {sceneForJourney,sceneForRoute,sceneForTheme,ROUTE_SCENES,sceneImage} from '../lib/game/scene.ts';
import {existsSync} from 'node:fs';
it('rejects reordered near-copies and subsets while measuring Turkish whole-word repeats and distance',()=>{
 const history=[{id:'a',title:'Gezegenler',words:['DÜNYA','MARS','VENÜS','MERKÜR']},{id:'b',title:'Gökyüzü',words:['AY','UYDU','ROKET','GEZEGEN']}];
 const review=reviewNovelty(['venüs','dünya','MARS','KOMET'],history);assert.equal(review.nearCopies[0]!.id,'a');assert.equal(review.repeatRatio,.75);assert.equal(review.nearestRepeat,2);
 assert.equal(reviewNovelty(['MARS','VENÜS','DÜNYA'],history).nearCopies.length,1);
 assert.equal(reviewNovelty(['AY','YAY','KAYIK','ÇAY'],history).repeatRatio,.25);
 assert.equal(reviewNovelty(['BULUT','YILDIZ','IŞIK','HAVA'],history).nearCopies.length,0);
});
it('blocks a one-word replacement in both the editor and the server admission path',()=>{
 const prior=HORIZON_CHAPTERS[0]!,words=[...prior.words.slice(0,3),'TEKER'];
 assert(reviewDraft(words,8,'').errors.some(e=>e.includes('çok benzer')));
 assert.throws(()=>checkNewChapter({...NEW_CHAPTER,words,size:8}),/çok benziyor/);
 assert.doesNotThrow(()=>checkNewChapter(NEW_CHAPTER));
});
it('rejects flat or easier new routes without making excessive concealment a substitute for content',()=>{
 const load:ChapterLoad={words:4,cells:36,diagonal:1,reverse:0,initial:0,hidden:0,riddle:false},flat=Array.from({length:6},()=>({...load}));
 assert(difficultyIssues(flat,flat).includes('flat-route'));
 const growing=[4,5,5,6,6,6].map((words,i)=>({...load,words,cells:64,reverse:i>0?1:0,initial:i===4?1:0}));
 assert.deepEqual(difficultyIssues(growing,flat),[]);
 assert(difficultyIssues(flat,growing).includes('late-route-below-opening'));
 assert(difficultyIssues(growing.map(r=>({...r,hidden:4})),flat).includes('excessive-concealment'));
});
it('does not label a four-open-word finale as mastery merely because of its position',()=>{
 assert.equal(chapterPace('ufuk-kis-6')?.kind,'normal');assert.equal(chapterPace('ufuk-kis-6')?.label,'Keşif');
});
it('resolves route artwork independently from immutable puzzle theme and packages every chosen asset',()=>{
 assert.deepEqual(Object.keys(ROUTE_SCENES).sort(),HORIZON_ROUTES.map(r=>r.id).sort());
 for(const route of HORIZON_ROUTES)for(const chapter of route.chapters){const before=JSON.stringify(chapter);const scene=sceneForJourney(chapter.id,chapter.themeId);assert.equal(scene,sceneForRoute(route.id,chapter.themeId));assert(existsSync('public'+sceneImage(scene)));assert.equal(JSON.stringify(chapter),before);}
 assert.equal(sceneForJourney('ufuk-kis-6','turkiye'),'winter-room');assert.equal(sceneForJourney('ufuk-ciftlik-1','hayvanlar'),'farmstead');
 assert.equal(sceneForJourney('uzay-gozlemevi','uzay'),sceneForTheme('uzay'));assert.equal(sceneForTheme('futbol'),'stadium');
});
