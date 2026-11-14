import {it} from 'node:test';
import assert from 'node:assert/strict';
import {invitationRoute,attachIncomingLinks} from '../lib/platform/incoming-links.ts';
import {GAME_ORIGIN} from '../lib/platform/runtime.ts';
const room=GAME_ORIGIN+'/?oda=ABCDEFGH',friend=GAME_ORIGIN+'/?arkadas=ABCDEFGH23';
it('only trusted single invitations become local routes',()=>{
 assert.equal(invitationRoute(room),'/?sekme=arena&oda=ABCDEFGH');
 assert.equal(invitationRoute(friend),'/?sekme=arena&arkadas=ABCDEFGH23');
 for(const url of [room.replace('https:','http:'),room.replace('.site','.site.evil.test'),GAME_ORIGIN+'/api/?oda=ABCDEFGH',room+'&oda=BCDEFGHJ',room+'&meydan=ABCDEFGH23',room.replace('ABCDEFGH','INVALID'),room.replace('https://','https://name@'),'javascript:alert(1)'])assert.equal(invitationRoute(url),null,url);
 assert.equal(invitationRoute(room+'&redirect=https://evil.test'),'/?sekme=arena&oda=ABCDEFGH');
});
it('retained event beats cold URL; future identical invitations remain usable; disposal stops callbacks',async()=>{
 const visits:string[]=[];let callback=(url:string)=>{void url;},removed=false;
 const close=await attachIncomingLinks({listen:async fn=>{callback=fn;fn(friend);return{remove:async()=>{removed=true;}};},launch:async()=>({url:room})},route=>visits.push(route));
 assert.deepEqual(visits,['/?sekme=arena&arkadas=ABCDEFGH23']);
 callback(friend);assert.equal(visits.length,2);close();callback(room);assert.equal(visits.length,2);assert(removed);
});
it('cold invitation works with no event; launch failure leaves the warm listener alive',async()=>{
 let visit='',callback=(url:string)=>{void url;};
 await attachIncomingLinks({listen:async fn=>{callback=fn;return{remove:async()=>{}};},launch:async()=>({url:room})},route=>{visit=route;});
 assert.equal(visit,'/?sekme=arena&oda=ABCDEFGH');
 await attachIncomingLinks({listen:async fn=>{callback=fn;return{remove:async()=>{}};},launch:async()=>{throw Error('unavailable');}},route=>{visit=route;});
 callback(friend);assert.equal(visit,'/?sekme=arena&arkadas=ABCDEFGH23');
});
