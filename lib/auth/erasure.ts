import {GameError,GameService,type Database,type Room} from '../game/server.ts';
import {digest} from '../game/security.ts';
export interface ErasureReceipt {user_id:string;provider_id:string|null;receipt_hash:string;provider_done:number;created:number}
export function anonymizeRoom(room:Room,owner:string,anonymous:string):Room {
 const copy=structuredClone(room);
 for(const p of copy.players)if(p.id===owner){p.id=anonymous;p.name='Silinen oyuncu';p.left=true;p.ready=false;p.rematch=false;p.strokes=[];p.seen=0;p.lastFind=0;}
 if(copy.winner===owner)copy.winner=anonymous;
 if(copy.ranks&&owner in copy.ranks){copy.ranks[anonymous]=copy.ranks[owner]!;delete copy.ranks[owner];}
 if(copy.lastResult){if(copy.lastResult.winner===owner)copy.lastResult.winner=anonymous;for(const p of copy.lastResult.players)if(p.id===owner){p.id=anonymous;p.name='Silinen oyuncu';p.left=true;p.ready=false;p.rematch=false;p.online=false;}}
 return copy;
}
export class ErasureService {
 constructor(private db:Database,private clock:()=>number=Date.now){}
 async receipt(secret:string){if(!/^[a-f0-9]{64}$/.test(secret))throw new GameError('Silme anahtarı geçerli değil.');return this.db.prepare('SELECT * FROM deleted_players WHERE receipt_hash=?').bind(await digest(secret)).first<ErasureReceipt>();}
 async erase(owner:string,provider:string|null,secret:string){
  const receipt=await this.receipt(secret);if(receipt){if(receipt.user_id!==owner)throw new GameError('Silme işlemi farklı bir profile ait.',409);return receipt;}
  if(await this.db.prepare('SELECT 1 FROM admin_owners WHERE user_id=?').bind(owner).first())throw new GameError('Bu profil oyun yönetimine bağlı. Önce yönetici sahipliği devredilmeli; oyun ve yönetim kayıtları silinmedi.',409);
  const hash=await digest(secret),anonymous='deleted:'+crypto.randomUUID(),game=new GameService(this.db,this.clock);
  for(let attempt=0;attempt<8;attempt++){
   const linked=await this.db.prepare('SELECT provider_id FROM accounts WHERE game_user_id=?').bind(owner).first<{provider_id:string}>();if((linked?.provider_id??null)!==provider)throw new GameError('Hesap bağlantın değişti. Silmeden önce bağlı hesabını yeniden doğrula.',409);
   const active=await this.db.prepare('SELECT m.room_id,r.data FROM members m JOIN rooms r ON r.id=m.room_id WHERE m.user_id=? AND m.active=1').bind(owner).all<{room_id:string;data:string}>();
   for(const m of active.results){try{await game.leave(owner,m.room_id,(JSON.parse(m.data) as Room).round);}catch(e){if(!(e instanceof GameError)||![403,404,409,410].includes(e.status))throw e;await this.db.prepare('UPDATE members SET active=0 WHERE user_id=? AND room_id=? AND EXISTS(SELECT 1 FROM rooms WHERE id=? AND expires<?)').bind(owner,m.room_id,m.room_id,this.clock()).run();}}
   const rows=(await this.db.prepare("SELECT id,data,revision FROM rooms WHERE EXISTS(SELECT 1 FROM json_tree(rooms.data) WHERE value=? OR key=?)").bind(owner,owner).all<{id:string;data:string;revision:number}>()).results;
   const snapshots=JSON.stringify(rows.map(({id,revision})=>({id,revision}))),guard='EXISTS(SELECT 1 FROM deleted_players WHERE user_id=? AND receipt_hash=?)';
   const statements=[this.db.prepare("INSERT INTO deleted_players(user_id,provider_id,receipt_hash,provider_done,created) SELECT ?,?,?,?,? WHERE ((? IS NULL AND NOT EXISTS(SELECT 1 FROM accounts WHERE game_user_id=?)) OR EXISTS(SELECT 1 FROM accounts WHERE game_user_id=? AND provider_id=?)) AND NOT EXISTS(SELECT 1 FROM members WHERE user_id=? AND active=1) AND NOT EXISTS(SELECT 1 FROM json_each(?) s LEFT JOIN rooms r ON r.id=json_extract(s.value,'$.id') WHERE r.id IS NULL OR r.revision<>json_extract(s.value,'$.revision')) AND NOT EXISTS(SELECT 1 FROM rooms r WHERE EXISTS(SELECT 1 FROM json_tree(r.data) WHERE value=? OR key=?) AND NOT EXISTS(SELECT 1 FROM json_each(?) s WHERE json_extract(s.value,'$.id')=r.id AND json_extract(s.value,'$.revision')=r.revision))").bind(owner,provider,hash,provider?0:1,this.clock(),provider,owner,owner,provider,owner,snapshots,owner,owner,snapshots)];
   for(const row of rows)statements.push(this.db.prepare('UPDATE rooms SET data=?,revision=revision+1 WHERE id=? AND revision=? AND '+guard).bind(JSON.stringify(anonymizeRoom(JSON.parse(row.data) as Room,owner,anonymous)),row.id,row.revision,owner,hash));
   statements.push(this.db.prepare('UPDATE results SET user_id=?,nickname=? WHERE user_id=? AND '+guard).bind(anonymous,'Silinen oyuncu',owner,owner,hash),this.db.prepare('UPDATE challenges SET creator_id=? WHERE creator_id=? AND '+guard).bind(anonymous,owner,owner,hash));
   for(const [table,column] of [['players','id'],['accounts','game_user_id'],['game_sessions','user_id'],['campaign_save_migrations','user_id'],['campaign_saves','user_id'],['chapter_saves','user_id'],['dailies','user_id'],['challenge_runs','user_id'],['friend_invites','user_id'],['ratings','user_id'],['arena_seen','user_id'],['members','user_id'],['player_restrictions','user_id']])statements.push(this.db.prepare(`DELETE FROM ${table} WHERE ${column}=? AND ${guard}`).bind(owner,owner,hash));
   for(const [table,other] of [['friendships','friend_id'],['player_blocks','blocked_id']])statements.push(this.db.prepare(`DELETE FROM ${table} WHERE (user_id=? OR ${other}=?) AND ${guard}`).bind(owner,owner,owner,hash));
   // The report decision remains for audit, but player identifiers and copied names are removed.
   statements.push(this.db.prepare("UPDATE player_reports SET reporter_id=CASE WHEN reporter_id=? THEN ? ELSE reporter_id END,target_id=CASE WHEN target_id=? THEN ? ELSE target_id END,name_snapshot=CASE WHEN target_id=? THEN 'Silinen oyuncu' ELSE name_snapshot END WHERE (reporter_id=? OR target_id=?) AND "+guard).bind(owner,anonymous,owner,anonymous,owner,owner,owner,owner,hash));
   const prefixes=['game:','live:','social:','progress:','chapter-save:','chapter-cards:','safety:'];
   for(const prefix of prefixes)statements.push(this.db.prepare('DELETE FROM rate_limits WHERE key=? AND '+guard).bind(prefix+owner,owner,hash));
   if(provider)statements.push(this.db.prepare('DELETE FROM rate_limits WHERE key=? AND '+guard).bind('account:'+provider,owner,hash));
   try{const result=await this.db.batch(statements);if(result[0]?.meta.changes)return (await this.receipt(secret))!;}catch(e){const completed=await this.receipt(secret);if(completed?.user_id===owner)return completed;throw e;}
  }
  throw new GameError('Devam eden bir oyun işlemi var. Hiçbir kayıt silinmedi; tekrar dene.',409);
 }
 async finish(secret:string){const receipt=await this.receipt(secret);if(!receipt)throw new GameError('Silme işlemi bulunamadı.',404);await this.db.prepare('UPDATE deleted_players SET provider_done=1 WHERE receipt_hash=?').bind(receipt.receipt_hash).run();}
}

/** Only the authenticated studio owner can resolve provider failures in the admin route. */
export async function pendingErasures(db:Database){return {requests:(await db.prepare('SELECT receipt_hash,provider_id,created FROM deleted_players WHERE provider_id IS NOT NULL AND provider_done=0 ORDER BY created LIMIT 100').all()).results};}
export async function confirmProviderErasure(db:Database,admin:string,receiptHash:unknown,confirmation:unknown){
 if(typeof receiptHash!=='string'||!/^[a-f0-9]{64}$/.test(receiptHash)||confirmation!=='PROVIDER_DELETION_VERIFIED')throw new GameError('Sağlayıcı konsolundaki hesap silmesini doğrulamalısın.');
 // No client receipt is exposed in the queue. Manual closure is auditable and must follow provider-console verification.
 const operation=crypto.randomUUID();await db.batch([
  db.prepare("INSERT INTO admin_audit(id,actor_id,action,entity_id,summary,created) SELECT ?,?,'provider_erasure_confirmed',?,'Sağlayıcı konsolunda hesabın silindiği yönetici tarafından doğrulandı.',? WHERE EXISTS(SELECT 1 FROM deleted_players WHERE receipt_hash=? AND provider_done=0)").bind(operation,admin,receiptHash,Date.now(),receiptHash),
  db.prepare('UPDATE deleted_players SET provider_done=1 WHERE receipt_hash=? AND EXISTS(SELECT 1 FROM admin_audit WHERE id=?)').bind(receiptHash,operation)
 ]);return {ok:true};
}
