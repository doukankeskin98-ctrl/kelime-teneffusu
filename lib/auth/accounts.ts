import {acceptablePlayerName} from '../game/player-safety.ts';
import type {Database} from '../game/server.ts';
import {normalizeUsername} from './shared.ts';
import {IdentityError,type Principal} from './verify.ts';
export interface GuestAttachment{userId:string;tokenHash:string;now:number}
export interface MemberAccount{provider_id:string;game_user_id:string;username:string}
export class Accounts {
 constructor(private db:Database){}
 async find(principal:Principal):Promise<MemberAccount|null>{
  if(!principal.verified)throw new IdentityError('Devam etmek için e-postanı doğrula.',403);
  return this.db.prepare('SELECT provider_id,game_user_id,username FROM accounts WHERE provider_id=?').bind(principal.providerId).first<MemberAccount>();
 }
 async claim(principal:Principal,raw:unknown,legacy?:{userId:string;email:string}|null,guest?:GuestAttachment):Promise<MemberAccount>{
  if(!principal.verified)throw new IdentityError('Devam etmek için e-postanı doğrula.',403);
  const existing=await this.find(principal);if(existing){if(guest&&existing.game_user_id!==guest.userId)throw new IdentityError('Bu hesap başka bir oyuncu profiline bağlı. İki profilin kayıtları ayrı korunuyor.',409);return existing;}
  const username=normalizeUsername(raw);if(!acceptablePlayerName(username))throw new IdentityError('Başka bir kullanıcı adı seç.',400);if(!username)throw new IdentityError('Kullanıcı adın 3–20 karakter olmalı; küçük harf, rakam ve alt çizgi kullan.',400);
  // Link an old game only when both independently authenticated identities prove the same email.
  const legacyId=legacy&&legacy.email.trim().toLowerCase()===principal.email.trim().toLowerCase()?legacy.userId:null;
  if(guest&&legacyId&&guest.userId!==legacyId)throw new IdentityError('İki farklı profil bulundu. Bağlamak istediğin profille yeniden giriş yap.',409);
  const gameId=guest?.userId??legacyId??'firebase:'+principal.providerId;
  try{await this.db.batch([
   guest?this.db.prepare('INSERT INTO accounts(provider_id,game_user_id,username,created) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM game_sessions WHERE token_hash=? AND user_id=? AND expires>?)').bind(principal.providerId,gameId,username,Date.now(),guest.tokenHash,guest.userId,guest.now):this.db.prepare('INSERT INTO accounts(provider_id,game_user_id,username,created) VALUES(?,?,?,?)').bind(principal.providerId,gameId,username,Date.now()),
   this.db.prepare('INSERT OR IGNORE INTO players(id,nickname,created) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM accounts WHERE provider_id=? AND game_user_id=?)').bind(gameId,username,Date.now(),principal.providerId,gameId),
   ...(guest?[this.db.prepare('DELETE FROM game_sessions WHERE user_id=? AND EXISTS(SELECT 1 FROM accounts WHERE provider_id=? AND game_user_id=?)').bind(gameId,principal.providerId,gameId)]:[])
  ]);}catch{
   const after=await this.find(principal);if(after){if(guest&&after.game_user_id!==guest.userId)throw new IdentityError('Bu hesap başka bir oyuncu profiline bağlı. Kayıtların ayrı korunuyor.',409);return after;}
   const taken=await this.db.prepare('SELECT username FROM accounts WHERE username=?').bind(username).first();
   throw new IdentityError(taken?'Bu kullanıcı adı alınmış. Başka bir ad seç.':'Hesap bağlanamadı. Tekrar dene.',taken?409:503);
  }
  const saved=await this.find(principal);if(!saved)throw new IdentityError('Hesap kaydedilemedi.',503);return saved;
 }
}
