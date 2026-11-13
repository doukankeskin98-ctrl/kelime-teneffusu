import {it} from 'node:test';
import assert from 'node:assert/strict';
import {GameError} from '../lib/game/server.ts';
import {CloudProgress} from '../lib/game/cloud.ts';
import {emptyProgress,mergeProgress} from '../lib/game/progress.ts';
import {PROGRESS_MAX_BYTES} from '../lib/game/progress-limits.ts';
import {fixture} from './fixtures.ts';
const bytes=(v:unknown)=>Buffer.byteLength(JSON.stringify(v));
it('refuses a merged cloud save above its budget without changing either player or the previous revision',async()=>{
 const f=fixture(),a=emptyProgress(),b=emptyProgress();a.days=['2026-10-01'];b.days=['2026-10-02'];
 const limit=Math.max(bytes(a),bytes(b));assert(bytes(mergeProgress(a,b))>limit);
 const cloud=new CloudProgress(f.db,f.clock,limit);await cloud.save('a',a);await cloud.save('b',b);
 const before=f.sqlite.prepare('SELECT * FROM campaign_saves ORDER BY user_id').all();
 await assert.rejects(()=>cloud.save('a',b),(e:unknown)=>e instanceof GameError&&e.status===413);
 assert.deepEqual(f.sqlite.prepare('SELECT * FROM campaign_saves ORDER BY user_id').all(),before);
 assert.deepEqual((await cloud.read('a')).progress.days,a.days);f.sqlite.close();
});
it('never presents an oversized or corrupted stored cloud row as empty or overwrites it on a later write',async()=>{
 for(const data of [' '.repeat(PROGRESS_MAX_BYTES+1),'{broken',JSON.stringify({v:999})]){
  const f=fixture();f.sqlite.prepare('INSERT INTO campaign_saves VALUES(?,?,?,?)').run('owner',data,7,42);
  const cloud=new CloudProgress(f.db);await assert.rejects(()=>cloud.read('owner'),(e:unknown)=>e instanceof GameError&&e.status===503);
  await assert.rejects(()=>cloud.save('owner',emptyProgress()),(e:unknown)=>e instanceof GameError&&e.status===503);
  assert.equal(f.sqlite.prepare('SELECT data FROM campaign_saves').get()!['data'],data);f.sqlite.close();
 }
});
it('counts UTF-8 bytes on incoming saves and refuses any attempt to raise the production ceiling',async()=>{
 const f=fixture(),cloud=new CloudProgress(f.db,f.clock,PROGRESS_MAX_BYTES*2),raw={...emptyProgress(),ignored:'ş'.repeat(128000)};
 assert(JSON.stringify(raw).length<PROGRESS_MAX_BYTES);assert(bytes(raw)>PROGRESS_MAX_BYTES);
 await assert.rejects(()=>cloud.save('a',raw),(e:unknown)=>e instanceof GameError&&e.status===413);
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM campaign_saves').get()!['n'],0);f.sqlite.close();
});
