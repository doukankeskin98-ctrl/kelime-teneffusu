import {digest} from '../game/security.ts';
import {GameError,GameService,type Database} from '../game/server.ts';
const COOKIE='__Host-kt-player';
const AGE=60*60*24*90;
export const sessionCookie=(token:string,maxAge=AGE)=>`${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`;
export function guestToken(request:Request){const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);return token&&/^[a-f0-9]{64}$/.test(token)?token:null;}
export async function guestMember(db:Database,request:Request,now=Date.now()){
 const token=guestToken(request);if(!token)return null;
 const row=await db.prepare('SELECT user_id FROM game_sessions WHERE token_hash=? AND expires>?').bind(await digest(token),now).first<{user_id:string}>();
 return row?{userId:row.user_id,email:'',username:'',kind:'guest' as const}:null;
}
export async function createGuest(db:Database,name:unknown,now=Date.now()){
 const nickname=typeof name==='string'?name.normalize('NFC').replace(/[^\p{L}\p{N} _.-]/gu,'').trim().slice(0,20):'';
 if(nickname.length<2)throw new GameError('Oyunda görünecek adın 2–20 karakter olsun.');
 const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join(''),userId='guest:'+crypto.randomUUID();
 await db.prepare('INSERT INTO game_sessions(token_hash,user_id,created,expires) VALUES(?,?,?,?)').bind(await digest(token),userId,now,now+AGE*1000).run();
 await new GameService(db).rename(userId,nickname);
 await db.prepare('DELETE FROM game_sessions WHERE token_hash IN (SELECT token_hash FROM game_sessions WHERE expires<? LIMIT 50)').bind(now).run();
 return {token,userId};
}
export async function deleteGuest(db:Database,request:Request){const token=guestToken(request);if(token)await db.prepare('DELETE FROM game_sessions WHERE token_hash=?').bind(await digest(token)).run();}
