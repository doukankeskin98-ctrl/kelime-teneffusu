import type {Database} from '../game/server.ts';
import {normalizeUsername} from './shared.ts';
import {IdentityError,type Principal} from './verify.ts';
export interface MemberAccount{provider_id:string;game_user_id:string;username:string}
export class Accounts {
 constructor(private db:Database){}
 async find(principal:Principal):Promise<MemberAccount|null>{
  if(!principal.verified)throw new IdentityError('Devam etmek için e-postanı doğrula.',403);
  return this.db.prepare('SELECT provider_id,game_user_id,username FROM accounts WHERE provider_id=?').bind(principal.providerId).first<MemberAccount>();
 }
 async claim(principal:Principal,raw:unknown,legacy?:{userId:string;email:string}|null):Promise<MemberAccount>{
  if(!principal.verified)throw new IdentityError('Devam etmek için e-postanı doğrula.',403);
  const existing=await this.find(principal);if(existing)return existing;
  const username=normalizeUsername(raw);if(!username)throw new IdentityError('Kullanıcı adın 3–20 karakter olmalı; küçük harf, rakam ve alt çizgi kullan.',400);
  // Link an old game only when both independently authenticated identities prove the same email.
  const gameId=legacy&&legacy.email.trim().toLowerCase()===principal.email.trim().toLowerCase()?legacy.userId:'firebase:'+principal.providerId;
  try{await this.db.batch([
   this.db.prepare('INSERT INTO accounts(provider_id,game_user_id,username,created) VALUES(?,?,?,?)').bind(principal.providerId,gameId,username,Date.now()),
   this.db.prepare('INSERT OR IGNORE INTO players(id,nickname,created) VALUES(?,?,?)').bind(gameId,username,Date.now())
  ]);}catch{
   const after=await this.find(principal);if(after)return after;
   const taken=await this.db.prepare('SELECT username FROM accounts WHERE username=?').bind(username).first();
   throw new IdentityError(taken?'Bu kullanıcı adı alınmış. Başka bir ad seç.':'Hesap bağlanamadı. Tekrar dene.',taken?409:503);
  }
  const saved=await this.find(principal);if(!saved)throw new IdentityError('Hesap kaydedilemedi.',503);return saved;
 }
}
