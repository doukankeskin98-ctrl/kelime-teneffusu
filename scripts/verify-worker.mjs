import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {ATLAS_JOURNEYS} from '../lib/game/atlas-content.ts';
import {EXPEDITIONS} from '../lib/game/discovery.ts';
import {JOURNEY_BONUSES,journeyBoard} from '../lib/game/content.ts';
import {NEW_CHAPTER} from '../lib/studio/content.ts';
import {releaseCatalogue,releasedChapter} from '../lib/studio/releases.ts';
import {releasePairs,releaseRunResult} from '../lib/studio/release-stamps.ts';
const require=createRequire(import.meta.url);
const {Miniflare,Log,LogLevel}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler/package.json')]}));
const root=path.resolve('dist/server');
async function files(directory){const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const full=path.join(directory,entry.name);if(entry.isDirectory())result.push(...await files(full));else if(entry.name.endsWith('.js'))result.push(full);}return result;}
const modules=(await files(root)).sort((a,b)=>Number(b===path.join(root,'index.js'))-Number(a===path.join(root,'index.js'))).map(file=>({type:'ESModule',path:file}));
const setupToken='e'.repeat(64),setupHash=createHash('sha256').update('kelime-admin-setup-v1:'+setupToken).digest('hex');
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{ADMIN_SETUP_HASH:setupHash,ADMIN_SETUP_EXPIRES_AT:String(Date.now()+86400000)},d1Databases:{DB:'integration'},assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},log:new Log(LogLevel.ERROR)});
let checks=0;
const check=(condition,label)=>{assert(condition,label);checks++;};
const origin='https://game.test';
async function request(url,{cookie,nativeUser,method='GET',body,expected=200,originHeader=origin}={}){
 const headers={};if(cookie)headers.Cookie=cookie;if(method!=='GET'){headers.Origin=originHeader;headers['Content-Type']='application/json';}
 // Only this isolated Worker harness supplies the trusted dispatch identity headers.
 if(nativeUser){headers['oai-authenticated-user-id']=nativeUser;headers['oai-authenticated-user-email']=nativeUser+'@example.test';}
 const response=await mf.dispatchFetch(origin+url,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
 assert.equal(response.status,expected,`${method} ${url}: ${response.status}`);checks++;return response;
}
async function json(url,options){return (await request(url,options)).json();}
function solution(board,target){for(let r=0;r<board.size;r++)for(let c=0;c<board.size;c++)for(const [dr,dc] of [[1,0],[0,1],[1,1],[1,-1],[-1,0],[0,-1],[-1,-1],[-1,1]]){const cells=[...target.text].map((_,i)=>[r+dr*i,c+dc*i]);if(cells.every(([y,x])=>y>=0&&x>=0&&y<board.size&&x<board.size)&&cells.map(([y,x])=>board.grid[y][x]).join('')===target.text)return {a:cells[0],b:cells.at(-1)};}throw new Error('Target not found');}
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await readdir('drizzle')).filter(x=>x.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(sql).run();
 const home=await (await request('/')).text();check(home.includes('Kelime Teneffüsü')&&home.includes('Merakına'),'public page renders');
 check(home.includes('id="discovery-start-title"')&&home.includes('id="fresh-discoveries-title"')&&home.indexOf('id="discovery-start-title"')<home.indexOf('id="fresh-discoveries-title"'),'personal starting point precedes the daily catalogue');
 check(home.includes('href="#kesif-haritasi"')&&home.includes('href="#dunyalar"')&&home.includes('id="kesif-haritasi"')&&home.includes('id="dunyalar"'),'home shortcuts point to existing map and world sections');
 check(home.includes('kesif-haritasi')&&home.includes('Yıldız İskelesi')&&home.includes('Yolculuğun devam ediyor.')&&home.includes('atlas-node')&&EXPEDITIONS.length===16,'public illustrated atlas renders with sixteen registered destinations');
 const released=releaseCatalogue();check(home.includes('fresh-discoveries-title')&&home.includes('Neler değişti?')&&released.chapters.slice(0,2).every(c=>home.includes(c.spec.title)),'home visibly presents the new chapters and in-game release notes');
 check(home.includes('İki keşif, bir hatıra')&&home.includes('İki bölümü de tamamla.')&&!home.includes('Damganı gör'),'home presents the stamp condition without awarding an unauthenticated visitor');
 const archive=await json('/api/chapters?collection=releases');check(archive.total===released.total&&archive.chapters.every(c=>!('board' in c)),'permanent release archive exposes summaries without board payloads');
 check(archive.chapters.every(c=>typeof c.releaseDate==='string'&&(c.slot===1||c.slot===2)),'archive preserves dated pair metadata for permanent stamp goals');
 check(home.includes('Hızlı Tur')&&home.includes('/art/discovery-island.webp'),'home includes the playable sprint entry and original island artwork');
 const themeId=released.chapters[0].spec.themeId,themeArchive=await json('/api/chapters?collection=releases&theme='+themeId);
 check(themeArchive.total===archive.themeCounts[themeId]&&themeArchive.chapters.every(c=>c.spec.themeId===themeId),'world catalogue filters before pagination and counts all releases in that world');
 check(themeArchive.companions.every(c=>!('board' in c))&&themeArchive.chapters.every(c=>releasePairs([...themeArchive.chapters,...themeArchive.companions]).some(p=>p.chapters.some(member=>member.id===c.id))),'world catalogue retains complete stamp pairs without exposing board paths');
 await request('/api/chapters?collection=releases&theme=not-a-world',{expected:400});
 await request('/art/discovery-island.webp');
 for(const c of archive.chapters){const playable=await json('/api/chapters?id='+c.id);check(JSON.stringify(playable.board)===JSON.stringify(releasedChapter(c.id).board),'source release API returns the immutable reviewed board');}
 check((await json('/api/auth/config')).available===false,'email availability is honest without configuration');
 await request('/api/game',{method:'POST',body:{action:'enter'},expected:401});
 await request('/api/session',{method:'POST',body:{name:'Alice'},originHeader:'https://foreign.test',expected:403});
 const aResponse=await request('/api/session',{method:'POST',body:{name:'Alice'}}),bResponse=await request('/api/session',{method:'POST',body:{name:'Bob'}});
 const aCookie=aResponse.headers.get('Set-Cookie'),bCookie=bResponse.headers.get('Set-Cookie');check(aCookie?.includes('HttpOnly')&&bCookie?.includes('Secure'),'protected guest cookies');
 const a=await json('/api/game',{cookie:aCookie}),b=await json('/api/game',{cookie:bCookie});check(a.profile.id!==b.profile.id,'independent identities');check(a.profile.nickname==='Alice'&&b.profile.nickname==='Bob','chosen display names');
 const dailyGame=await json('/api/game',{cookie:aCookie,method:'POST',body:{action:'daily',expectedOwnerId:a.profile.id}});
 const dailyPath='/api/game?action=dailyState&id='+dailyGame.id;
 await request(dailyPath,{expected:401});await request(dailyPath+'&expectedOwnerId=',{cookie:aCookie,expected:409});
 await request(dailyPath+'&expectedOwnerId='+encodeURIComponent(a.profile.id),{cookie:bCookie,expected:409});
 await request(dailyPath+'&expectedOwnerId='+encodeURIComponent(b.profile.id),{cookie:bCookie,expected:404});
 await request('/api/game',{cookie:bCookie,method:'POST',body:{action:'daily',expectedOwnerId:a.profile.id},expected:409});
 const dailyState=await json(dailyPath+'&expectedOwnerId='+encodeURIComponent(a.profile.id),{cookie:aCookie});check(dailyState.id===dailyGame.id&&dailyState.day===dailyGame.day&&!('placements' in dailyState.board),'recovery reads the original private daily without exposing solutions');
 const hintKey=crypto.randomUUID(),hintBody={action:'dailyHint',id:dailyGame.id,expectedOwnerId:a.profile.id,requestId:hintKey};
 await request('/api/game',{cookie:bCookie,method:'POST',body:hintBody,expected:409});
 const firstHint=await json('/api/game',{cookie:aCookie,method:'POST',body:hintBody}),hintRetry=await json('/api/game',{cookie:aCookie,method:'POST',body:hintBody});
 check(firstHint.hints===1&&hintRetry.hints===1&&JSON.stringify(firstHint.hintCell)===JSON.stringify(hintRetry.hintCell)&&!('hintReceipts' in hintRetry),'retrying one hint operation charges one penalty and keeps its original cell private');
 await request('/api/game',{cookie:aCookie,method:'POST',body:{...hintBody,requestId:'invalid'},expected:400});
 const dailyTarget=dailyGame.board.targets[0],claimBody={action:'dailyClaim',id:dailyGame.id,expectedOwnerId:a.profile.id,...solution(dailyGame.board,dailyTarget)};
 await request('/api/game',{cookie:bCookie,method:'POST',body:claimBody,expected:409});await json('/api/game',{cookie:aCookie,method:'POST',body:claimBody});
 const currentHint=await json('/api/game',{cookie:aCookie,method:'POST',body:hintBody});check(currentHint.strokes.length===1&&currentHint.hints===1,'hint receipt replay returns current confirmed words rather than an old snapshot');
 await json('/api/game',{cookie:aCookie,method:'POST',body:{...hintBody,requestId:crypto.randomUUID()}});
 await json('/api/game',{cookie:aCookie,method:'POST',body:{action:'dailyHint',id:dailyGame.id}});
 const hintLimit=await json('/api/game',{cookie:aCookie,method:'POST',body:{...hintBody,requestId:crypto.randomUUID()},expected:400});check(hintLimit.code==='DAILY_HINT_LIMIT','terminal hint limit distinguishes a closed unknown key from a transient rejection');
 const cappedRetry=await json('/api/game',{cookie:aCookie,method:'POST',body:hintBody});check(cappedRetry.hints===3&&cappedRetry.strokes.length===1&&!('hintReceipts' in cappedRetry),'old hint receipts remain recoverable at the quota while legacy requests and private state remain compatible');
 // Isolated integration DB only: simulate an old attempt; production player data is untouched.
 const oldDailyRow=await db.prepare('SELECT data FROM dailies WHERE id=?').bind(dailyGame.id).first();
 const oldDaily=JSON.stringify({...JSON.parse(oldDailyRow.data),starts:Date.now()-86400001});
 await db.prepare('UPDATE dailies SET data=?,revision=revision+1 WHERE id=?').bind(oldDaily,dailyGame.id).run();
 const ended=await json('/api/game',{cookie:aCookie,method:'POST',body:{...hintBody,requestId:crypto.randomUUID()},expected:409});check(ended.code==='DAILY_EXPIRED','expired unresolved intent receives an explicit CAS-fenced terminal result');
 const endedRow=await db.prepare('SELECT data FROM dailies WHERE id=?').bind(dailyGame.id).first();check(endedRow.data===oldDaily,'expiry fence preserves daily JSON, hints, confirmed words and scores');
 const endedReceipt=await json('/api/game',{cookie:aCookie,method:'POST',body:hintBody});check(endedReceipt.hints===3&&endedReceipt.strokes.length===1&&!('hintReceipts' in endedReceipt)&&!('placements' in endedReceipt.board),'an accepted original hint remains recoverable after expiry without an extra penalty');
 const sourceChapter=releasedChapter(released.chapters[0].id);await request('/api/chapters?action=progress&id='+sourceChapter.id,{expected:401});
 await request('/api/chapters',{cookie:bCookie,method:'PUT',body:{id:sourceChapter.id,expectedOwnerId:a.profile.id,save:{strokes:sourceChapter.board.placements,elapsed:20,hints:0}},expected:409});
 await request('/api/chapters',{cookie:bCookie,method:'PUT',body:{id:sourceChapter.id,expectedOwnerId:'',save:{}},expected:409});
 await request('/api/chapters',{method:'PUT',body:{id:sourceChapter.id,expectedOwnerId:a.profile.id,save:{}},expected:401});
 const unchangedOther=await json('/api/chapters?action=progress&id='+sourceChapter.id,{cookie:bCookie});check(unchangedOther.save.strokes.length===0,'a queued snapshot for an old owner cannot be written under a changed or absent session');
 const sourceSave=await json('/api/chapters',{cookie:aCookie,method:'PUT',body:{id:sourceChapter.id,expectedOwnerId:a.profile.id,save:{strokes:sourceChapter.board.placements,elapsed:35,hints:0,complete:false,stars:99}}});check(sourceSave.save.complete&&sourceSave.save.stars===3,'source release saves are validated by the production Worker');
 await request('/api/chapters?action=progress&id='+sourceChapter.id+'&expectedOwnerId='+encodeURIComponent(a.profile.id),{cookie:bCookie,expected:409});
 await request('/api/chapters?action=progress&id='+sourceChapter.id+'&expectedOwnerId=',{cookie:bCookie,expected:409});
 const guardedSource=await json('/api/chapters?action=progress&id='+sourceChapter.id+'&expectedOwnerId='+encodeURIComponent(a.profile.id),{cookie:aCookie});check(guardedSource.save.complete,'cold startup reads require the expected authenticated owner');
 const otherSource=await json('/api/chapters?action=progress&id='+sourceChapter.id,{cookie:bCookie});check(otherSource.save.strokes.length===0,'daily release progress remains scoped to its actual player');
 await request('/api/chapters?action=card-progress&ids='+sourceChapter.id,{expected:401});
 const cardResponse=await request('/api/chapters?action=card-progress&ids='+sourceChapter.id,{cookie:aCookie}),cards=await cardResponse.json();check(cards.chapters[0].progress.complete&&cards.chapters[0].progress.stars===3&&cards.chapters[0].progress.foundIds.length===sourceChapter.board.targets.length,'card progress reflects the actual completed board');check(cardResponse.headers.get('Cache-Control')==='no-store'&&!JSON.stringify(cards).includes('placements')&&!JSON.stringify(cards).includes('strokes'),'card replies do not cache private progress or expose word paths');
 const otherCards=await json('/api/chapters?action=card-progress&ids='+sourceChapter.id+'&userId='+a.profile.id,{cookie:bCookie});check(otherCards.chapters[0].progress.foundIds.length===0,'a query cannot select another account for card progress');
 const sourcePair=releasePairs(archive.chapters).find(pair=>pair.chapters.some(c=>c.id===sourceChapter.id)),companionSummary=sourcePair.chapters.find(c=>c.id!==sourceChapter.id),companionCards=await json('/api/chapters?action=card-progress&ids='+companionSummary.id,{cookie:aCookie});
 const firstStamp=releaseRunResult(sourcePair,sourceChapter,sourceSave.save,Object.fromEntries(companionCards.chapters.map(c=>[c.id,c.progress])),'ready');check(firstStamp.stamp.completed===1&&firstStamp.next.id===companionSummary.id,'actual completed result points to the other fixed chapter');
 await request('/api/chapters?action=card-progress&ids=invalid',{cookie:aCookie,expected:400});await request('/api/chapters?action=card-progress&ids='+Array(25).fill(sourceChapter.id).join(','),{cookie:aCookie,expected:400});
 const friendInvite=await json('/api/social',{cookie:aCookie,method:'POST',body:{action:'invite'}});
 await json('/api/social',{cookie:bCookie,method:'POST',body:{action:'accept',code:friendInvite.code}});
 check((await json('/api/social',{cookie:aCookie})).friends[0].nickname==='Bob','friend consent flow');
 const challenge=await json('/api/social',{cookie:aCookie,method:'POST',body:{action:'create',themeId:'uzay'}});
 check(!('placements' in challenge.board),'solutions are omitted from player views');
 for(const target of challenge.board.targets)await json('/api/social',{cookie:aCookie,method:'POST',body:{action:'claim',code:challenge.code,...solution(challenge.board,target)}});
 const ghost=await json('/api/social',{cookie:bCookie,method:'POST',body:{action:'start',code:challenge.code}});check(ghost.ghost.nickname==='Alice'&&ghost.ghost.timeline.length===challenge.board.targets.length,'actual recorded opponent timeline');
 const room=await json('/api/game',{cookie:aCookie,method:'POST',body:{action:'enter',kind:'friend',userId:b.profile.id}});check(room.you.id===a.profile.id,'request bodies cannot spoof the actor');
 await json('/api/game',{cookie:bCookie,method:'POST',body:{action:'enter',kind:'friend',code:room.code}});
 await json('/api/game',{cookie:aCookie,method:'POST',body:{action:'ready',id:room.id}});
 const active=await json('/api/game',{cookie:bCookie,method:'POST',body:{action:'ready',id:room.id}});
 await request('/api/game',{cookie:aCookie,method:'POST',body:{action:'claim',id:room.id,...solution(active.board,active.board.targets[0])},expected:409});
 const live=await request('/api/live?id='+room.id,{cookie:aCookie});check(live.headers.get('Content-Type')?.startsWith('text/event-stream'),'live event transport');const reader=live.body.getReader();const chunk=await reader.read();check(new TextDecoder().decode(chunk.value).includes('event: room'),'initial live state');await reader.cancel();
 await new Promise(resolve=>setTimeout(resolve,4200));
 for(const target of active.board.targets)await json('/api/game',{cookie:aCookie,method:'POST',body:{action:'claim',id:room.id,...solution(active.board,target)}});
 const result=await json('/api/game?action=room',{cookie:bCookie});check(result.phase==='finished'&&result.winner===a.profile.id,'two-player result persisted');
 check((await json('/api/game',{cookie:aCookie})).stats.wins===1,'a single win is recorded');
 const cloud=await json('/api/progress',{cookie:aCookie});await json('/api/progress',{cookie:aCookie,method:'PUT',body:{progress:{...cloud.progress,sound:true,tutorialDone:true}}});check((await json('/api/progress',{cookie:bCookie})).progress.sound===false,'progress stays private');
 const staleRead=await json('/api/progress?expectedOwnerId='+encodeURIComponent(a.profile.id),{cookie:bCookie,expected:409});check(staleRead.code==='PROGRESS_OWNER_CHANGED'&&!('progress' in staleRead),'a stale progress read cannot expose another authenticated account');
 await request('/api/progress?expectedOwnerId=',{cookie:bCookie,expected:409});await request('/api/progress?expectedOwnerId='+encodeURIComponent(a.profile.id),{expected:401});
 const staleWrite=await json('/api/progress',{cookie:bCookie,method:'PUT',expected:409,body:{expectedOwnerId:a.profile.id,progress:{...cloud.progress,sound:true,contrast:true}}});check(staleWrite.code==='PROGRESS_OWNER_CHANGED'&&!('progress' in staleWrite),'stale progress writes use an explicit owner-change code');
 await request('/api/progress',{cookie:bCookie,method:'PUT',expected:409,body:{expectedOwnerId:'',progress:{sound:true}}});
 const untouchedProgress=await json('/api/progress?expectedOwnerId='+encodeURIComponent(b.profile.id),{cookie:bCookie});check(untouchedProgress.progress.sound===false&&untouchedProgress.progress.contrast===false,'rejected old-owner snapshots leave the other player unchanged');
 const guardedProgress=await json('/api/progress?expectedOwnerId='+encodeURIComponent(a.profile.id),{cookie:aCookie});check(guardedProgress.progress.sound===true,'guarded reads for the same owner retain existing progress');
 const guardedWrite=await json('/api/progress',{cookie:aCookie,method:'PUT',body:{expectedOwnerId:a.profile.id,progress:guardedProgress.progress}});check(guardedWrite.progress.sound===true,'guarded writes remain compatible with existing merge behavior');

 const bonus=JOURNEY_BONUSES[0],bonusBoard=journeyBoard(bonus),bonusKey='route:'+bonus.id;
 await json('/api/progress',{cookie:aCookie,method:'PUT',body:{progress:{...cloud.progress,tutorialDone:true,saves:{[bonusKey]:{strokes:bonusBoard.placements.map(({id,a,b})=>({id,a,b})),elapsed:45,hints:2,complete:true,stars:99}},last:{themeId:bonus.themeId,level:0,journey:bonus.id}}}});
 const savedBonus=await json('/api/progress',{cookie:aCookie});check(savedBonus.progress.saves[bonusKey]?.complete===true&&savedBonus.progress.saves[bonusKey].stars===1,'bonus pieces persist using server-validated strokes and stars');check(savedBonus.progress.last.journey===bonus.id,'bonus destination survives cloud roundtrip');check(!(await json('/api/progress',{cookie:bCookie})).progress.saves[bonusKey],'bonus collection stays scoped to its owner');
 const atlasSaves={...savedBonus.progress.saves};for(const chapter of [ATLAS_JOURNEYS[0],ATLAS_JOURNEYS[2],ATLAS_JOURNEYS[5]]){const board=journeyBoard(chapter);atlasSaves['route:'+chapter.id]={strokes:board.placements,elapsed:30,hints:1,complete:false,stars:99};}
 await json('/api/progress',{cookie:aCookie,method:'PUT',body:{progress:{...savedBonus.progress,saves:atlasSaves,last:{themeId:ATLAS_JOURNEYS[2].themeId,level:0,journey:ATLAS_JOURNEYS[2].id}}}});
 const atlasSaved=await json('/api/progress',{cookie:aCookie});check([ATLAS_JOURNEYS[0],ATLAS_JOURNEYS[2],ATLAS_JOURNEYS[5]].every(j=>atlasSaved.progress.saves['route:'+j.id]?.complete&&atlasSaved.progress.saves['route:'+j.id]?.stars===2),'new atlas normal, clue and final chapters are validated and preserved by the Worker');
 check(atlasSaved.progress.last.journey===ATLAS_JOURNEYS[2].id,'the saved clue hunt remains the actual last destination');
 check(!(await json('/api/progress',{cookie:bCookie})).progress.saves['route:'+ATLAS_JOURNEYS[0].id],'atlas chapters remain private to the account');
 const sw=await (await request('/sw.js')).text();check(sw.includes('const BUILD_ASSETS=[')&&!sw.includes('const BUILD_ASSETS=[];'),'offline assets are built');
 for(const asset of ['/manifest.webmanifest','/icon-192.png','/icon-512.png'])await request(asset);
 const workshop=await (await request('/atolye')).text();check(workshop.includes('İÇERİK ATÖLYESİ'),'authoring workspace renders');
 const panel=await (await request('/yonetim')).text();check(panel.includes('YÖNETİM ATÖLYESİ')&&panel.includes('noindex'),'admin entry is rendered and excluded from indexing');check(sw.includes("pathname.startsWith('/yonetim')"),'service worker excludes the administration entry');
 const visitorSession=await json('/api/admin?action=session');check(visitorSession.signedIn===false&&visitorSession.authorized===false&&visitorSession.setupAvailable===true,'enrollment requires a signed-in native identity');
 await request('/api/admin?action=overview',{cookie:aCookie,expected:401});await request('/api/admin?action=overview',{nativeUser:'not-owner',expected:403});
 await request('/api/admin',{cookie:aCookie,method:'POST',body:{action:'claim',token:setupToken,role:'owner',userId:'native-owner'},expected:401});
 await request('/api/admin',{nativeUser:'native-owner',method:'POST',originHeader:'https://foreign.test',body:{action:'claim',token:setupToken},expected:403});
 await request('/api/admin',{nativeUser:'native-owner',method:'POST',body:{action:'claim',token:'bad'},expected:403});
 const owner={nativeUser:'native-owner'},ownerSession=await json('/api/admin',{...owner,method:'POST',body:{action:'claim',token:setupToken}});check(ownerSession.authorized===true,'only the correct native account and secret bind the owner');
 await request('/api/admin',{nativeUser:'someone-else',method:'POST',body:{action:'claim',token:setupToken},expected:409});
 for(let i=0;i<4;i++)await request('/api/admin',{nativeUser:'someone-else',method:'POST',body:{action:'claim',token:setupToken},expected:409});await request('/api/admin',{nativeUser:'someone-else',method:'POST',body:{action:'claim',token:setupToken},expected:429});
 const adminOverviewResponse=await request('/api/admin?action=overview',owner),adminOverview=await adminOverviewResponse.json();check(adminOverviewResponse.headers.get('Cache-Control')?.includes('no-store'),'private admin data is never cacheable');check(adminOverview.profiles===2&&adminOverview.finishedDuels===1&&adminOverview.duelPlayers===2,'overview reflects actual isolated game records');check(!JSON.stringify(adminOverview).includes(setupToken)&&!JSON.stringify(adminOverview).includes(setupHash),'admin overview never contains enrollment secrets');
 const preview=await json('/api/admin',{...owner,method:'POST',body:{action:'preview',spec:NEW_CHAPTER}});check(preview.checks.alternateLayouts===20&&preview.checks.diagonals===true,'admin preview validates twenty alternatives and both diagonal slopes');
 const creationId=crypto.randomUUID(),draft=await json('/api/admin',{...owner,method:'POST',body:{action:'save',spec:NEW_CHAPTER,creationId}}),duplicate=await json('/api/admin',{...owner,method:'POST',body:{action:'save',spec:NEW_CHAPTER,creationId}});check(draft.id===duplicate.id,'a retried draft request does not create a duplicate');check((await json('/api/chapters')).total===0,'draft is absent from the public catalogue');await request('/api/chapters?id='+draft.id,{expected:404});
 await request('/api/admin',{...owner,method:'POST',body:{action:'publish',id:draft.id,revision:draft.revision},expected:400});
 const published=await json('/api/admin',{...owner,method:'POST',body:{action:'publish',id:draft.id,revision:draft.revision,confirmation:draft.spec.title}});check((await json('/api/chapters')).chapters[0].id===draft.id,'a reviewed published chapter is publicly discoverable');const publicChapter=await json('/api/chapters?id='+draft.id);check(JSON.stringify(publicChapter.board)===JSON.stringify(preview.board),'the published board is the exact reviewed snapshot');check(!('revision' in publicChapter)&&!('actor_id' in publicChapter),'public chapter does not contain private management fields');
 for(const action of ['save','archive','restore'])await request('/api/admin',{nativeUser:'not-owner',method:'POST',body:{action,id:draft.id,spec:NEW_CHAPTER,revision:published.revision,confirmation:draft.spec.title,role:'owner'},expected:403});
 await request('/api/chapters',{method:'PUT',body:{id:draft.id,save:{}},expected:401});
 const chapterSave=await json('/api/chapters',{cookie:aCookie,method:'PUT',body:{id:draft.id,userId:b.profile.id,save:{strokes:publicChapter.board.placements,elapsed:30,hints:0,complete:true,stars:99}}});check(chapterSave.save.complete&&chapterSave.save.stars===3,'extra progress is validated against the published board');check((await json('/api/chapters?action=progress&id='+draft.id,{cookie:bCookie})).save.strokes.length===0,'extra progress is isolated even when a body spoofs another user');check((await json('/api/admin?action=overview',owner)).extraCompletions===2,'admin counts actual source and editor chapter completions');
 const archived=await json('/api/admin',{...owner,method:'POST',body:{action:'archive',id:draft.id,revision:published.revision,confirmation:draft.spec.title}});check((await json('/api/chapters')).total===0,'archived chapter is hidden from new discovery');check((await json('/api/chapters?id='+draft.id)).archived===true,'archived board remains available for saved players');check((await json('/api/chapters?action=progress&id='+draft.id,{cookie:aCookie})).save.complete,'archiving preserves completed player saves');
 const restored=await json('/api/admin',{...owner,method:'POST',body:{action:'restore',id:draft.id,revision:archived.revision,confirmation:draft.spec.title}});check(restored.contentHash===published.contentHash&&restored.publishedAt===published.publishedAt,'restoring retains original content and publication timestamp');check((await json('/api/admin?action=audit',owner)).rows.length===5,'only completed owner, create, publish, archive and restore actions are audited');
 const companionChapter=releasedChapter(companionSummary.id);await json('/api/chapters',{cookie:aCookie,method:'PUT',body:{id:companionChapter.id,save:{strokes:companionChapter.board.placements,elapsed:80,hints:3,complete:false,stars:99}}});
 const completePairCards=await json('/api/chapters?action=card-progress&ids='+sourcePair.chapters.map(c=>c.id).join(','),{cookie:aCookie}),completeStamp=releaseRunResult(sourcePair,sourceChapter,sourceSave.save,Object.fromEntries(completePairCards.chapters.map(c=>[c.id,c.progress])),'ready');check(completeStamp.stamp.earned&&completeStamp.next===undefined,'both real completions produce one dated stamp without a further target');
 await request('/api/session',{cookie:aCookie,method:'DELETE'});check((await json('/api/game',{cookie:aCookie})).authenticated===false,'guest logout revokes its token');
 // Deliberate isolated database failure verifies that the production route records a sanitized fault.
 await db.prepare('DROP TABLE ratings').run();await request('/api/game',{cookie:bCookie,expected:503});const fault=(await json('/api/admin?action=faults',owner)).rows[0];check(fault?.area==='game'&&fault.count===1&&fault.reviewed_count===0,'unexpected route failures create operational counters');check(!JSON.stringify(fault).includes(b.profile.id)&&!JSON.stringify(fault).includes('ratings'),'fault counters contain no identity or raw database error');await json('/api/admin',{...owner,method:'POST',body:{action:'reviewFault',day:fault.day,area:fault.area,code:fault.code}});check((await json('/api/admin?action=faults',owner)).rows[0].reviewed_count===1,'fault review is persisted');
 console.log(`${checks} production Worker HTTP checks passed with two independent players.`);
}finally{await mf.dispose();}
