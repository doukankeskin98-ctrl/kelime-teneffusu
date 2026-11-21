import {sleep} from './cdp.mjs';
// Tahtayı DOM'dan okur, listedeki kelimeleri 8 yönde bulur ve dokunmatik kaydırmayla çizer
export const STATE=`(()=>{const cells=[...document.querySelectorAll('[data-cell]')].map(e=>{const [r,c]=e.dataset.cell.split(',').map(Number);const b=e.getBoundingClientRect();return {r,c,ch:e.innerText.trim(),x:b.left+b.width/2,y:b.top+b.height/2}});
 if(!cells.length)return null;const top=Math.min(...cells.map(c=>c.y));
 const words=[...document.querySelectorAll('.word-tag')].map(e=>({t:[...e.querySelectorAll('[data-target-letter]')].map(x=>x.textContent===' '||x.textContent===''?' ':(x.textContent.trim()||'✱')).join(''),al:e.getAttribute('aria-label')||'',found:!/aranıyor/.test(e.getAttribute('aria-label')||'')}));
 return {cells,words}})()`;
const D=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
export function locate(st,word){const g={};for(const c of st.cells)g[c.r+','+c.c]=c;const L=[...word];
 for(const c of st.cells)for(const [dr,dc] of D){let ok=true;for(let i=0;i<L.length;i++){const k=g[(c.r+dr*i)+','+(c.c+dc*i)];if(!k||!(L[i]===k.ch||/[✱*•·_]/u.test(L[i]))){ok=false;break;}}if(ok)return [c,g[(c.r+dr*(L.length-1))+','+(c.c+dc*(L.length-1))]];}return null;}
export async function drag(page,a,b,steps=10){
 const tp=(type,x,y)=>page.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
 await tp('touchStart',a.x,a.y);for(let i=1;i<=steps;i++){await sleep(16);await tp('touchMove',a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps);}await sleep(30);await tp('touchEnd');}
export async function solve(page,{shot,delay=700,limit=99}={}){const st=await page.eval(STATE);if(!st)return {err:'tahta yok'};
 const done=[];let n=0;for(const w of st.words.filter(w=>!w.found)){if(n>=limit)break;const j=w.t.replace(/ /g,'');let parts=locate(st,j)?[j]:w.t.includes(' ')?w.t.split(' '):null;if(!parts){for(let i=3;i<=j.length-3;i++)if(locate(st,j.slice(0,i))&&locate(st,j.slice(i))){parts=[j.slice(0,i),j.slice(i)];break;}}parts=parts||[j];for(const part of parts){const p=locate(st,part);if(!p){done.push({w:part,bulunamadi:true});continue;}await drag(page,p[0],p[1]);await sleep(delay);n++;done.push({w:part});if(shot)await shot(n);}}
 return {words:st.words.map(w=>w.t),done};}
// Bonus turu: hedef kelimenin tahtadaki bütün geçişlerini bulur ve çizer. Sayaç "x / y" okunur.
export const BONUS=`(()=>{const h=document.querySelector('[aria-label^="Hedef kelime:"]');if(!h)return null;const sp=[...document.querySelectorAll('span')].map(e=>e.textContent.trim()).find(t=>/^\\d+ \\/ \\d+$/.test(t));const [x,y]=(sp||'').split(' / ').map(Number);return {word:h.getAttribute('aria-label').replace(/^Hedef kelime:\\s*/,''),found:x,total:y}})()`;
export async function solveBonus(page,{delay=450}={}){const b=await page.eval(BONUS);if(!b)return {err:'bonus tahtası yok'};const st=await page.eval(STATE);if(!st)return {err:'tahta yok'};
 const g={};for(const c of st.cells)g[c.r+','+c.c]=c;const L=[...b.word],seen=new Set(),hits=[];
 for(const c of st.cells)for(const [dr,dc] of D){const cells=[];for(let i=0;i<L.length;i++){const k=g[(c.r+dr*i)+','+(c.c+dc*i)];if(!k||k.ch!==L[i]){cells.length=0;break;}cells.push(k.r+','+k.c);}if(!cells.length)continue;const key=[...cells].sort().join('|');if(seen.has(key))continue;seen.add(key);hits.push([c,g[cells.at(-1)]]);}
 for(const [a,z] of hits){await drag(page,a,z);await sleep(delay);}
 const after=await page.eval(BONUS);return {word:b.word,total:b.total,hits:hits.length,found:after?after.found:null};}
