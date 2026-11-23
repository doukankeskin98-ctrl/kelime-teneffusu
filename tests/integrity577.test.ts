import assert from 'node:assert/strict';
import {it} from 'node:test';
import {readFileSync,mkdtempSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fixture} from './fixtures.ts';
import {createGuest} from '../lib/auth/guest.ts';
import {GameService} from '../lib/game/server.ts';
import {dailyBoard} from '../lib/game/daily-board.ts';
import {loadProgress,collectionStats,emptyProgress} from '../lib/game/progress.ts';
import {completedWorldCount,discoveryState} from '../lib/game/discovery.ts';
import {mainJourneyChapters} from '../lib/game/main-journey.ts';
import {PROFILE_TITLES,ARENA_TITLES,profileTitle,arenaTitle} from '../lib/game/glossary.ts';
import {WORD_TRAIL} from '../lib/game/journey-flow.ts';
import {supportDraft} from '../lib/platform/support.ts';

it('keeps historical stars, badge themes, album pieces and all preferences while adding completed worlds',()=>{
 for(const [name,completed,stars,themes,worlds] of [['kayit-120-bolum',120,360,16,20],['kayit-gezgin-ruh',7,21,3,0]] as const){
  const fixture=JSON.parse(readFileSync(`scripts/visual/integrity/${name}.json`,'utf8'));
  const p=loadProgress(fixture.value),before=JSON.stringify(p),stats=collectionStats(p);
  assert.equal(stats.completed,completed);assert.equal(stats.stars,stars);assert.equal(stats.worlds,themes);assert.equal(completedWorldCount(p),worlds);
  assert.equal(mainJourneyChapters(p).filter(c=>c.complete).length,completed);
  assert.ok(stats.worlds>=3);assert.equal(JSON.stringify(p),before);
  assert.deepEqual(discoveryState(p).map(w=>w.earned),discoveryState(loadProgress(before)).map(w=>w.earned));
 }
 const p={...emptyProgress(),sound:false,haptics:false,zoom:true,contrast:true,analytics:false,boardColor:'sand' as const};
 const loaded=loadProgress(JSON.stringify(p));for(const k of ['sound','haptics','zoom','contrast','analytics','boardColor'] as const)assert.equal(loaded[k],p[k]);
 assert.deepEqual(mainJourneyChapters(emptyProgress()).slice(0,6).map(c=>c.unlocked),[true,true,true,true,true,false]);
});
it('keeps title thresholds and separates all three achievement ladders',()=>{
 const words=WORD_TRAIL.map(t=>t.title);assert.equal(new Set([...PROFILE_TITLES,...ARENA_TITLES,...words]).size,PROFILE_TITLES.length+ARENA_TITLES.length+words.length);
 assert.deepEqual([0,11,12,47,48].map(profileTitle),['Yeni gezgin','Yeni gezgin','Meraklı gezgin','Meraklı gezgin','Usta gezgin']);
 assert.deepEqual([1199,1200,1499,1500].map(arenaTitle),['Meraklı yarışmacı','Keskin bakış','Keskin bakış','Arena ustası']);
});
it('anonymous guest completes a server-verified daily and names that same result without replay',async()=>{
 const f=fixture();try{
  const guest=await createGuest(f.db,undefined,f.clock()),daily=await f.game.daily(guest.userId);
  assert.equal((await f.game.profile(guest.userId)).nickname,'');
  await assert.rejects(()=>f.game.enter(guest.userId,'quick'),/oyuncu adı/i);
  for(const word of dailyBoard(daily.day).placements)await f.game.dailyClaim(guest.userId,daily.id,word.a,word.b);
  const before=await f.game.dailyState(guest.userId,daily.id);assert.notEqual(before.finished,null);assert.equal((await f.game.rankings()).daily.length,0);
  await f.game.rename(guest.userId,'Yeni gezgin');
  assert.equal((await f.game.rankings()).daily[0]?.nickname,'Yeni gezgin');assert.equal((await f.game.daily(guest.userId)).id,daily.id);
  assert.deepEqual(await f.game.dailyState(guest.userId,daily.id),before);
 }finally{f.sqlite.close();}
});
it('uses the current name atomically if naming races with daily creation',async()=>{
 const f=fixture();try{
  const guest=await createGuest(f.db,undefined,f.clock()),game=new GameService(f.db,f.clock),original=game.profile.bind(game);let once=true;
  game.profile=async id=>{const snapshot=await original(id);if(once){once=false;await f.game.rename(id,'Yeni ad');}return snapshot;};
  const daily=await game.daily(guest.userId);for(const word of dailyBoard(daily.day).placements)await game.dailyClaim(guest.userId,daily.id,word.a,word.b);
  assert.equal((await game.rankings()).daily[0]?.nickname,'Yeni ad');assert.equal((await game.daily(guest.userId)).id,daily.id);
 }finally{f.sqlite.close();}
});
it('support copy contains chosen diagnostics and respects the opt-out',()=>{
 const input={kind:'Kelime seçimi' as const,detail:'Son harf algılanmadı.',technical:true,version:'0.57.7',platform:'iOS uygulaması',viewport:'393 × 852'};
 const text=supportDraft(input);for(const value of [input.detail,input.version,input.platform,input.viewport])assert.ok(text.includes(value));
 const privateText=supportDraft({...input,technical:false});for(const value of [input.version,input.platform,input.viewport])assert.ok(!privateText.includes(value));
});
it('integrity tools reject vacuous runs and malformed inputs before opening Chrome',()=>{
 const dir=mkdtempSync(join(tmpdir(),'kt577-gates-'));
 try{
  const tool=(name:string,args:string[])=>spawnSync(process.execPath,[`scripts/visual/integrity/${name}.mjs`,...args],{encoding:'utf8',timeout:3000});
  for(const n of ['0','NaN','-1','1.5']){const r=tool('kayit-kaliciligi',[join(dir,'out.json'),n]);assert.notEqual(r.status,0,r.stdout);assert.equal(r.error,undefined);}
  assert.notEqual(tool('kayit-kaliciligi',[join(dir,'out.json'),'1','0','SIGKILL','--kapi','duzgun']).status,0);
  for(const args of [[dir,'393','--kaynak'],[dir,'393','--yolculuk'],[dir,'393','--typo']])assert.notEqual(tool('terim-denetimi',args).status,0);
  mkdirSync(join(dir,'393'));
  for(const value of ['null','false','[]','{}']){writeFileSync(join(dir,'393','metrics.json'),value);assert.notEqual(tool('terim-denetimi',[dir,'393']).status,0);}
  const labels=JSON.parse(readFileSync('scripts/visual/integrity/terim-denetimi.mjs','utf8').match(/const ZORUNLU=(\[.*\]);/)![1]!.replaceAll("'",'"')) as string[];
  const clean=Object.fromEntries(labels.map(k=>[k,{texts:[{t:'Temiz metin'},{t:'Temiz metin iki'},{t:'Temiz metin uc'}]}]));
  clean['13-destek']!.texts.push({t:'Diğer'});writeFileSync(join(dir,'393','metrics.json'),JSON.stringify(clean));assert.equal(tool('terim-denetimi',[dir,'393']).status,0);
  clean['01-ana']!.texts.push({t:'Diğer'});writeFileSync(join(dir,'393','metrics.json'),JSON.stringify(clean));assert.equal(tool('terim-denetimi',[dir,'393']).status,1);
  const baseline=JSON.parse(readFileSync('scripts/visual/integrity/aliskanlik-0.57.6-393.json','utf8'));
  writeFileSync(join(dir,'base.json'),JSON.stringify(baseline));writeFileSync(join(dir,'same.json'),JSON.stringify(baseline));
  const result=tool('aliskanlik-olcumu',['karsilastir',join(dir,'base.json'),join(dir,'same.json')]);assert.equal(result.status,0,result.stdout+result.stderr);
  // A different row count can change height but never the top anchor or horizontal centre.
  const taller=structuredClone(baseline);taller.oyun.tahta[3]+=40;
  const compareCard=()=>tool('aliskanlik-olcumu',['karsilastir',join(dir,'base.json'),join(dir,'same.json'),'--tahta-ustu']);
  writeFileSync(join(dir,'same.json'),JSON.stringify(taller));assert.equal(compareCard().status,0);
  taller.oyun.tahta[1]+=5;writeFileSync(join(dir,'same.json'),JSON.stringify(taller));assert.equal(compareCard().status,1);
  taller.oyun.tahta[1]-=5;taller.oyun.tahta[0]+=5;writeFileSync(join(dir,'same.json'),JSON.stringify(taller));assert.equal(compareCard().status,1);
  writeFileSync(join(dir,'same.json'),'{}');assert.notEqual(tool('aliskanlik-olcumu',['karsilastir',join(dir,'base.json'),join(dir,'same.json')]).status,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
