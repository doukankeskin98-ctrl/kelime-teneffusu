import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {generateKeyPair,exportJWK,createLocalJWKSet,SignJWT} from 'jose';
import {normalizeUsername,safeReturnTo,emailContinueUrl,validPassword} from '../lib/auth/shared.ts';
import {verifyMemberToken,IdentityError,type Principal} from '../lib/auth/verify.ts';
import {Accounts} from '../lib/auth/accounts.ts';
import type {Database,Statement} from '../lib/game/server.ts';

describe('membership input and invitation safety',()=>{
 it('normalizes usernames and rejects ambiguous or oversized handles',()=>{
  assert.equal(normalizeUsername('  Dogukan_98  '),'dogukan_98');
  for(const input of ['',null,'ab','123name','a b','a'.repeat(21),'ınek','a<script>','../name'])assert.equal(normalizeUsername(input),'');
  assert(validPassword('a-long-password'));assert(!validPassword('short'));assert(!validPassword('x'.repeat(129)));
 });
 it('preserves an invited room while rejecting open redirects and unrelated parameters',()=>{
  assert.equal(safeReturnTo('/?oda=ABCDEFGH&sekme=profil&token=do-not-copy'),'/?sekme=arena&oda=ABCDEFGH');
  assert.equal(safeReturnTo('/?sekme=gunluk'),'/?sekme=gunluk');
  for(const target of ['https://evil.example','//evil.example','/\\evil.example','/uye?token=secret','/%2f%2fevil.example','/\n'])assert.equal(safeReturnTo(target),'/');
  assert.equal(emailContinueUrl('https://evil.example/?oda=ABCDEFGH','https://game.example'),'/');
  assert.equal(emailContinueUrl('https://game.example/?oda=ABCDEFGH','https://game.example'),'/?oda=ABCDEFGH&sekme=arena');
 });
});

const PROJECT='word-test-project';
const NOW=Date.parse('2026-10-20T12:00:00Z'),SECONDS=Math.floor(NOW/1000);
async function signing(){
 const keys=await generateKeyPair('RS256',{extractable:true}),jwk=await exportJWK(keys.publicKey);
 const resolver=createLocalJWKSet({keys:[{...jwk,kid:'test-key',alg:'RS256',use:'sig'}]});
 const token=async(options:{aud?:string;sub?:string;authTime?:number;expires?:number}={})=>new SignJWT({auth_time:options.authTime??SECONDS-60,email:'player@example.test',email_verified:true}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setSubject(options.sub??'u1').setIssuedAt(SECONDS-10).setIssuer('https://securetoken.google.com/'+PROJECT).setAudience(options.aud??PROJECT).setExpirationTime(options.expires??SECONDS+3600).sign(keys.privateKey);
 return {resolver,token};
}
const userResponse=(fields:Record<string,unknown>={})=>new Response(JSON.stringify({users:[{localId:'u1',email:'player@example.test',emailVerified:true,validSince:String(SECONDS-120),...fields}]}),{headers:{'Content-Type':'application/json'}});

describe('Firebase verification fails closed',()=>{
 it('requires a real RS256 signature and the correct audience before consulting the account service',async()=>{
  const s=await signing();let calls=0;
  const fetcher:typeof fetch=async()=>{calls++;return userResponse();};
  const valid=await s.token(),config={projectId:PROJECT,apiKey:'public-test-key'};
  const result=await verifyMemberToken(valid,config,{keys:s.resolver,fetcher,now:NOW,cache:false});
  assert.equal(result.uid,'u1');assert.equal(result.providerId,PROJECT+':u1');assert(result.verified);
  await assert.rejects(()=>verifyMemberToken(tamperSignature(valid),config,{keys:s.resolver,fetcher,now:NOW,cache:false}));
  await assert.rejects(()=>s.token({aud:'another-project'}).then(token=>verifyMemberToken(token,config,{keys:s.resolver,fetcher,now:NOW,cache:false})));
  await assert.rejects(()=>s.token({expires:SECONDS-60}).then(token=>verifyMemberToken(token,config,{keys:s.resolver,fetcher,now:NOW,cache:false})));
  assert.equal(calls,1);
 });
 it('checks disabled accounts, revoked sessions and provider identity instead of trusting decoded JSON',async()=>{
  const s=await signing(),token=await s.token(),config={projectId:PROJECT,apiKey:'public-test-key'};
  for(const fields of [{disabled:true},{validSince:String(SECONDS+1)},{localId:'different-user'}]){
   await assert.rejects(()=>verifyMemberToken(token,config,{keys:s.resolver,fetcher:async()=>userResponse(fields),now:NOW,cache:false}),e=>e instanceof IdentityError&&e.status===401);
  }
  const unverified=await verifyMemberToken(token,config,{keys:s.resolver,fetcher:async()=>userResponse({emailVerified:false}),now:NOW,cache:false});
  assert.equal(unverified.verified,false);
 });
 it('reports provider outages without authenticating or exposing provider details',async()=>{
  const s=await signing(),token=await s.token();
  await assert.rejects(()=>verifyMemberToken(token,{projectId:PROJECT,apiKey:'public-test-key'},{keys:s.resolver,fetcher:async()=>{throw new Error('internal');},now:NOW,cache:false}),e=>e instanceof IdentityError&&e.status===503&&!e.message.includes('internal'));
 });
});
function tamperSignature(token:string){const parts=token.split('.');const signature=parts[2]!;parts[2]=(signature[0]==='A'?'B':'A')+signature.slice(1);return parts.join('.');}

function accountDb(){
 const db=new DatabaseSync(':memory:'),folder=new URL('../drizzle/',import.meta.url);
 for(const filename of readdirSync(folder).filter(p=>p.endsWith('.sql')).sort())db.exec(readFileSync(new URL(filename,folder),'utf8'));
 class Query implements Statement{
  constructor(private sql:string,private values:unknown[]=[]){}
  bind(...values:unknown[]){return new Query(this.sql,values);}
  async first<T>(){return (db.prepare(this.sql).get(...this.values as SQLInputValue[])??null) as T|null;}
  async all<T>(){return {results:db.prepare(this.sql).all(...this.values as SQLInputValue[]) as T[]};}
  sync(){return {meta:{changes:Number(db.prepare(this.sql).run(...this.values as SQLInputValue[]).changes)}};}
  async run(){return this.sync();}
 }
 const adapter:Database={prepare:sql=>new Query(sql),batch:async statements=>{db.exec('BEGIN');try{const values=statements.map(s=>(s as Query).sync());db.exec('COMMIT');return values;}catch(e){db.exec('ROLLBACK');throw e;}}};
 return {db,accounts:new Accounts(adapter)};
}
const principal=(uid:string,verified=true):Principal=>({uid,providerId:PROJECT+':'+uid,email:uid+'@example.test',verified});

describe('account ownership and unique usernames',()=>{
 it('allows only verified owners and serializes competing username claims',async()=>{
  const s=accountDb();await assert.rejects(()=>s.accounts.claim(principal('u1',false),'player_one'),e=>e instanceof IdentityError&&e.status===403);
  const results=await Promise.allSettled([s.accounts.claim(principal('u1'),'player_one'),s.accounts.claim(principal('u2'),'PLAYER_ONE')]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
  assert.equal((s.db.prepare('SELECT COUNT(*) AS n FROM accounts').get() as {n:number}).n,1);
  const existing=await s.accounts.find(principal('u1'));if(existing)assert.equal((await s.accounts.claim(principal('u1'),'changed_name')).username,'player_one');
 });
 it('keeps legacy match results only when both authenticated emails match',async()=>{
  const s=accountDb();s.db.prepare('INSERT INTO players(id,nickname,created) VALUES(?,?,?)').run('legacy-id','Eski Ad',1);
  s.db.prepare('INSERT INTO results(room_id,user_id,nickname,score,win,created) VALUES(?,?,?,?,?,?)').run('old-room','legacy-id','Eski Ad',800,1,1);
  const linked=await s.accounts.claim(principal('u1'),'player_one',{userId:'legacy-id',email:'u1@example.test'});
  assert.equal(linked.game_user_id,'legacy-id');
  assert.equal((s.db.prepare('SELECT nickname FROM players WHERE id=?').get('legacy-id') as {nickname:string}).nickname,'Eski Ad');
  assert.equal((s.db.prepare('SELECT SUM(win) AS wins FROM results WHERE user_id=?').get(linked.game_user_id) as {wins:number}).wins,1);
  const separate=await s.accounts.claim(principal('u2'),'player_two',{userId:'legacy-id',email:'another@example.test'});
  assert.notEqual(separate.game_user_id,'legacy-id');
 });
});
