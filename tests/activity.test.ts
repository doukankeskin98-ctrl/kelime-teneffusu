import {it} from 'node:test';
import assert from 'node:assert/strict';
import {observeGameActivity} from '../lib/platform/activity.ts';
it('joins native activity and document visibility, resumes once, and releases listeners',()=>{
 const doc=Object.assign(new EventTarget(),{hidden:false}),win=new EventTarget(),seen:boolean[]=[];let active=true;
 const stop=observeGameActivity(doc,win,()=>active,v=>seen.push(v));
 active=false;doc.dispatchEvent(new Event('visibilitychange'));win.dispatchEvent(new Event('kt-app-resume'));
 doc.hidden=true;active=true;win.dispatchEvent(new Event('kt-app-resume'));assert.deepEqual(seen,[true,false]);
 doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));win.dispatchEvent(new Event('pageshow'));assert.deepEqual(seen,[true,false,true]);
 win.dispatchEvent(new Event('pagehide'));win.dispatchEvent(new Event('pageshow'));assert.deepEqual(seen,[true,false,true,false,true]);
 stop();doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(seen.length,5);
});
