import * as mainJourney from '../lib/game/main-journey.ts';
// Real goal data and stateless component SSR. This is not browser/device geometry QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describe,it} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import * as icons from 'lucide-react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as achievement from '../lib/game/achievement-view.ts';
import * as engine from '../lib/game/engine.ts';
import {JOURNEYS,JOURNEY_BONUSES,journeyById,journeyBoard} from '../lib/game/content.ts';
import {emptyProgress,cleanSave,type Progress} from '../lib/game/progress.ts';
import {discoveryRewards,nextJourneyAfter} from '../lib/game/discovery.ts';
import {nextDiscovery} from '../lib/game/next-discovery.ts';

function finish(p:Progress,id:string,hints=0,elapsed=45){const board=journeyBoard(journeyById(id)!);p.saves['route:'+id]=cleanSave({strokes:board.placements,hints,elapsed,complete:false,stars:0},board);return p;}
const copy=(p:Progress):Progress=>JSON.parse(JSON.stringify(p));
function first(count:number){const p=emptyProgress();for(let i=1;i<=count;i++)finish(p,'uzay-'+i);return p;}
// Only decorative WorldArt is substituted. CollectionScene, PieceTrail, home and result bodies are real.
const art={WorldArt:({themeId}:{themeId:string})=>React.createElement('svg',{'data-theme':themeId,'aria-hidden':true})};
function component(file:string,imports:Record<string,unknown>){
 const exports:Record<string,any>={};
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const modules:Record<string,unknown>={react:React,'react/jsx-runtime':jsx,'lucide-react':icons,'@/lib/game/engine':engine,'@/lib/game/achievement-view':achievement,'@/lib/game/main-journey':mainJourney,...imports};
 vm.runInNewContext(code,{exports,require:(name:string)=>modules[name]??{}});return exports;
}
const collection=component('components/game/Discovery.tsx',{'./WorldArt':art});
const loop=component('components/game/AchievementLoop.tsx',{'./Discovery':collection});
const home=component('components/game/DiscoveryStart.tsx',{'./WorldArt':art,'./AchievementLoop':loop});
const render=(fn:any,props:Record<string,unknown>)=>renderToStaticMarkup(React.createElement(fn,props));
const result=(p:Progress,id:string,before:Progress,extra:Record<string,unknown>={})=>render(loop['VictorySummary'],{goal:achievement.journeyGoal(p,id),rewards:discoveryRewards(before,p),stars:3,hints:0,seconds:45,total:4,...extra});

describe('the visible goal follows real permanent progression',()=>{
 it('does not invent a collection goal for standard, missing or unknown chapters and never writes progress',()=>{
  const p=emptyProgress(),raw=JSON.stringify(p);assert.equal(achievement.journeyGoal(p),null);assert.equal(achievement.journeyGoal(p,'unknown'),null);
  const goal=achievement.journeyGoal(p,'uzay-1')!;assert.equal(goal.piece,'İlk yıldız');assert.equal(goal.position,0);assert.equal(goal.earned,false);assert.equal(JSON.stringify(p),raw);
 });
 it('moves the visible milestone from the third stop to the fifth and then the sixth real piece',()=>{
  const p=first(2);let g=achievement.journeyGoal(p,'uzay-3')!;assert.equal(g.milestone.total,3);assert.equal(g.milestone.value,2);assert.match(g.milestone.label,/1 durak daha/);
  finish(p,'uzay-3',3);g=achievement.journeyGoal(p,'uzay-4')!;assert.equal(g.milestone.total,5);assert.equal(g.milestone.value,3);assert.match(g.milestone.label,/2 durak kaldı/);
  finish(p,'uzay-4');finish(p,'uzay-5');const bonus=JOURNEY_BONUSES.find(j=>j.themeId==='uzay')!;g=achievement.journeyGoal(p,bonus.id)!;assert.equal(g.milestone.total,6);assert.equal(g.milestone.value,5);assert.equal(g.position,5);assert.match(g.milestone.label,/Bonus açık/);
  finish(p,bonus.id);g=achievement.journeyGoal(p,bonus.id)!;assert.equal(g.milestone.value,6);assert.equal(g.earned,true);assert.match(g.milestone.label,/Altı parça da albümünde/);
 });
 it('respects previously started worlds and a completed catalogue instead of promising a locked reward',()=>{
  const p=emptyProgress(),b=journeyBoard(journeyById('turkiye-4')!);p.saves['route:turkiye-4']=cleanSave({strokes:[b.placements[0]!],elapsed:1,hints:0,complete:false,stars:0},b);
  assert.equal(achievement.journeyGoal(p,'uzay-1')!.milestone.total,5);
  for(const j of [...JOURNEYS,...JOURNEY_BONUSES])finish(p,j.id);
  assert.equal(nextJourneyAfter(p,'uzay-1'),null);assert.equal(achievement.journeyGoal(p,nextJourneyAfter(p,'uzay-1')?.id),null);
 });
 it('keeps all allowed hint counts explicit and independent of speed',()=>{
  assert.deepEqual([0,1,2,3].map(n=>achievement.masteryCopy(n).stars),[3,2,1,1]);assert.match(achievement.masteryCopy(2).rule,/2–3 ipucu: 1 yıldız/);assert.match(achievement.masteryCopy(0).rule,/Süre yıldızı etkilemez/);
 });
});

describe('real home and victory markup',()=>{
 it('shows the exact recommended piece and stage, with permanent collection status',()=>{
  const p=first(1),rec=nextDiscovery(p),goal=achievement.journeyGoal(p,rec.config.journey)!;
  const html=render(home['DiscoveryStart'],{recommendation:rec,progress:p,onPlay(){},onArena(){}});
  assert.ok(html.includes(goal.piece));assert.ok(html.includes(rec.title));assert.match(html,/1 \/ 6 koleksiyon parçası/);assert.match(html,/Keşfe başla/);assert.match(html,/İpuçlarıyla da parçanı kazanırsın/);
 });
 it('keeps a standard continuation honest without promising an unrelated map piece',()=>{
  const p=emptyProgress();p.last={themeId:'hababam',level:0};const b=engine.makePuzzle('hababam',0,engine.hash('campaign-v2:hababam:0'));p.saves['hababam.0']=cleanSave({strokes:[b.placements[0]!],elapsed:12,hints:0,complete:false,stars:0},b);
  const html=render(home['DiscoveryStart'],{recommendation:nextDiscovery(p),progress:p,onPlay(){},onArena(){}});assert.match(html,/Devam et/);assert.doesNotMatch(html,/quest-collection|albümüne ekle|İlk yıldız/);
 });
 it('puts the actually earned piece and new world before stats and mastery',()=>{
  const before=first(2),p=finish(copy(before),'uzay-3',3),html=result(p,'uzay-3',before,{stars:1,hints:3});
  assert.match(html,/YENİ PARÇAN SENİN/);assert.match(html,/YENİ DÜNYA AÇILDI/);assert.match(html,/3 \/ 6 koleksiyon parçası/);assert.ok(html.indexOf('victory-keepsake')<html.indexOf('victory-stats'));assert.ok(html.indexOf('YENİ DÜNYA AÇILDI')<html.indexOf('victory-mastery'));assert.match(html,/Bu tur 1 \/ 3 yıldız/);assert.match(html,/Parçanı kazanmak için yıldız şartı yok/);
 });
 it('shows the bonus and completed album only when their existing gates are reached',()=>{
  const four=first(4),five=finish(copy(four),'uzay-5'),bonus=JOURNEY_BONUSES.find(j=>j.themeId==='uzay')!;
  const fifth=result(five,'uzay-5',four);assert.match(fifth,/BONUS KEŞİF AÇILDI/);assert.doesNotMatch(fifth,/KOLEKSİYON TAMAMLANDI/);
  const six=finish(copy(five),bonus.id),final=result(six,bonus.id,five);assert.match(final,/KOLEKSİYON TAMAMLANDI/);assert.match(final,/6 \/ 6 koleksiyon parçası/);
 });
 it('distinguishes the current replay from the preserved best and never awards another piece',()=>{
  const p=first(1),best=p.saves['route:uzay-1']!,raw=JSON.stringify(p),html=result(p,'uzay-1',p,{stars:1,hints:3,seconds:90,best});
  assert.match(html,/Bu parça zaten senin/);assert.doesNotMatch(html,/YENİ PARÇAN SENİN|YENİ DÜNYA AÇILDI/);assert.match(html,/Bu tur 1 \/ 3 yıldız/);assert.match(html,/En iyi sonucun korunuyor/);assert.match(html,/3 yıldız · 0:45/);assert.equal(JSON.stringify(p),raw);
 });
 it('announces a personal best only when the real caller confirms it and explains stars for standard play',()=>{
  const props={goal:null,rewards:[],stars:2,hints:1,seconds:25,total:4};const unknown=render(loop['VictorySummary'],props),known=render(loop['VictorySummary'],{...props,improved:true});
  assert.doesNotMatch(unknown,/yeni kişisel en iyin|En iyi sonucun|parça|albümüne/);assert.match(unknown,/Bir ipucuyla keşif/);assert.match(unknown,/Süre yıldızı etkilemez/);assert.match(known,/Bu bölümde yeni kişisel en iyin/);
 });
 it('shows the actual next journey and returns no misleading goal when the route is exhausted',()=>{
  const p=first(1),next=nextJourneyAfter(p,'uzay-1')!,goal=achievement.journeyGoal(p,next.id)!;
  const html=render(loop['NextJourneyPreview'],{goal});assert.ok(html.includes(next.title));assert.ok(html.includes(goal.piece));assert.equal(render(loop['NextJourneyPreview'],{goal:null}),'');
 });
});

// New home/result render actual collection pieces; these assertions are not pixel QA.
const numberedHome=component('components/game/JourneyHome.tsx',{'./WorldArt':art,'./AchievementLoop':loop});
const numberedResult=component('components/game/JourneyResult.tsx',{'./Discovery':collection,'./AchievementLoop':loop});
describe('numbered journey home and real result',()=>{
 it('shows one primary action, the correct chapter and nearby reward without mode cards',()=>{
  const html=render(numberedHome['JourneyHome'],{progress:emptyProgress(),onPlay(){},onExplore(){}});
  assert.match(html,/Bölüm 1 — Oyna/);assert.match(html,/İlk yıldız/);assert.match(html,/3 bölüm sonra/);assert.match(html,/Anadolu Patikası/);assert.equal((html.match(/class="button primary/g)??[]).length,1);assert.doesNotMatch(html,/theme-grid|play-modes|atlas-adventure/);
 });
 it('continues an existing route and shows a truthful complete-catalogue state',()=>{
  const p=emptyProgress(),b=journeyBoard(journeyById('uzay-2')!);p.saves['route:uzay-2']=cleanSave({strokes:[b.placements[0]!],hints:0,elapsed:10,complete:false,stars:0},b);p.last={themeId:'uzay',level:0,journey:'uzay-2'};
  let html=render(numberedHome['JourneyHome'],{progress:p,onPlay(){},onExplore(){}});assert.match(html,/Bölüm 2/);assert.match(html,/Devam et/);assert.match(html,/0<\/b> \/ 96/);
  for(const item of mainJourney.MAIN_JOURNEY)finish(p,item.chapter.id);
  html=render(numberedHome['JourneyHome'],{progress:p,onPlay(){},onExplore(){}});assert.match(html,/Yolculuğu tamamladın/);assert.doesNotMatch(html,/— Oyna|Devam et/);
 });
 it('renders actual album before/after and the new world, then keeps replay unchanged',()=>{
  const before=first(2),p=finish(copy(before),'uzay-3'),props={before:achievement.journeyGoal(before,'uzay-3'),after:achievement.journeyGoal(p,'uzay-3'),rewards:discoveryRewards(before,p),save:p.saves['route:uzay-3']};
  let html=render(numberedResult['JourneyResult'],props);assert.match(html,/Önce <b>2\/6/);assert.match(html,/Şimdi <b>3\/6/);assert.match(html,/YENİ DÜNYA AÇILDI/);assert.match(html,/Anadolu Patikası/);
  html=render(numberedResult['JourneyResult'],{...props,before:props.after,rewards:[]});assert.match(html,/BU PARÇA ZATEN SENİN/);assert.match(html,/Önce <b>3\/6/);assert.match(html,/Şimdi <b>3\/6/);assert.doesNotMatch(html,/YENİ DÜNYA AÇILDI/);
 });
 it('explains tutorial reward status and displays no permanent stars',()=>{
  const html=render(loop['VictorySummary'],{goal:null,rewards:[],stars:3,hints:0,seconds:15,total:3,tutorial:true});assert.match(html,/Yıldız ve albüm parçası verilmez/);assert.doesNotMatch(html,/victory-stars|Bu tur 3|Yıldızlar nasıl/);
 });
});
