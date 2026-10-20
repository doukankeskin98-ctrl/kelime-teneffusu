import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {Miniflare,Log,LogLevel}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler/package.json')]}));
const root=path.resolve('dist/server');
async function files(directory){const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const full=path.join(directory,entry.name);if(entry.isDirectory())result.push(...await files(full));else if(entry.name.endsWith('.js'))result.push(full);}return result;}
const modules=(await files(root)).sort((a,b)=>Number(b===path.join(root,'index.js'))-Number(a===path.join(root,'index.js'))).map(file=>({type:'ESModule',path:file}));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'integration'},assets:{directory:path.resolve('dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},log:new Log(LogLevel.ERROR)});
let checks=0;
const check=(condition,label)=>{assert(condition,label);checks++;};
const origin='https://game.test';
async function request(url,{cookie,method='GET',body,expected=200,originHeader=origin}={}){
 const headers={};if(cookie)headers.Cookie=cookie;if(method!=='GET'){headers.Origin=originHeader;headers['Content-Type']='application/json';}
 const response=await mf.dispatchFetch(origin+url,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
 assert.equal(response.status,expected,`${method} ${url}: ${response.status}`);checks++;return response;
}
async function json(url,options){return (await request(url,options)).json();}
function solution(board,target){for(let r=0;r<board.size;r++)for(let c=0;c<board.size;c++)for(const [dr,dc] of [[1,0],[0,1],[1,1],[1,-1],[-1,0],[0,-1],[-1,-1],[-1,1]]){const cells=[...target.text].map((_,i)=>[r+dr*i,c+dc*i]);if(cells.every(([y,x])=>y>=0&&x>=0&&y<board.size&&x<board.size)&&cells.map(([y,x])=>board.grid[y][x]).join('')===target.text)return {a:cells[0],b:cells.at(-1)};}throw new Error('Target not found');}
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await readdir('drizzle')).filter(x=>x.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(sql).run();
 const home=await (await request('/')).text();check(home.includes('Kelime Teneffüsü')&&home.includes('Merakına'),'public page renders');
 check((await json('/api/auth/config')).available===false,'email availability is honest without configuration');
 await request('/api/game',{method:'POST',body:{action:'enter'},expected:401});
 await request('/api/session',{method:'POST',body:{name:'Alice'},originHeader:'https://foreign.test',expected:403});
 const aResponse=await request('/api/session',{method:'POST',body:{name:'Alice'}}),bResponse=await request('/api/session',{method:'POST',body:{name:'Bob'}});
 const aCookie=aResponse.headers.get('Set-Cookie'),bCookie=bResponse.headers.get('Set-Cookie');check(aCookie?.includes('HttpOnly')&&bCookie?.includes('Secure'),'protected guest cookies');
 const a=await json('/api/game',{cookie:aCookie}),b=await json('/api/game',{cookie:bCookie});check(a.profile.id!==b.profile.id,'independent identities');check(a.profile.nickname==='Alice'&&b.profile.nickname==='Bob','chosen display names');
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
 const sw=await (await request('/sw.js')).text();check(sw.includes('const BUILD_ASSETS=[')&&!sw.includes('const BUILD_ASSETS=[];'),'offline assets are built');
 for(const asset of ['/manifest.webmanifest','/icon-192.png','/icon-512.png'])await request(asset);
 const workshop=await (await request('/atolye')).text();check(workshop.includes('İÇERİK ATÖLYESİ'),'authoring workspace renders');
 await request('/api/session',{cookie:aCookie,method:'DELETE'});check((await json('/api/game',{cookie:aCookie})).authenticated===false,'guest logout revokes its token');
 console.log(`${checks} production Worker HTTP checks passed with two independent players.`);
}finally{await mf.dispose();}
