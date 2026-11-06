import {GameError,GameService,type Database,type Room} from './server.ts';
import {blockedPair} from './player-safety.ts';
export const REPORT_REASONS={name:'Uygunsuz oyuncu adı',behavior:'Rahatsız edici davranış',cheating:'Hile şüphesi'} as const;
export class SafetyService {
 constructor(private db:Database,private clock:()=>number=Date.now){}
 private async target(owner:string,id:unknown){if(typeof id!=='string'||id===owner||id.length>256||!await this.db.prepare('SELECT 1 FROM players WHERE id=?').bind(id).first())throw new GameError('Oyuncu bulunamadı.',404);return id;}
 async report(owner:string,id:unknown,reason:unknown){const target=await this.target(owner,id);if(typeof reason!=='string'||!(reason in REPORT_REASONS))throw new GameError('Bir bildirim nedeni seç.');
  const existing=await this.db.prepare("SELECT id FROM player_reports WHERE reporter_id=? AND target_id=? AND reason=? AND status='open'").bind(owner,target,reason).first();if(existing)return {ok:true};
  await this.db.prepare("INSERT OR IGNORE INTO player_reports(id,reporter_id,target_id,reason,name_snapshot,created) SELECT ?,?,?,?,nickname,? FROM players WHERE id=?").bind(crypto.randomUUID(),owner,target,reason,this.clock(),target).run();return {ok:true};
 }
 async block(owner:string,id:unknown){const target=await this.target(owner,id);
  if(await blockedPair(this.db,owner,target)&&await this.db.prepare('SELECT 1 FROM player_blocks WHERE user_id=? AND blocked_id=?').bind(owner,target).first())return {ok:true};
  const count=await this.db.prepare('SELECT COUNT(*) AS n FROM player_blocks WHERE user_id=?').bind(owner).first<{n:number}>();if((count?.n??0)>=200)throw new GameError('Engelleme listesi dolu. Ayarlardan listeni düzenleyebilirsin.',409);
  // A final SQL condition closes the gap between leave and block. Retry a new shared room.
  for(let attempt=0;attempt<8;attempt++){
   const active=await this.db.prepare('SELECT r.id,r.data FROM rooms r JOIN members m ON m.room_id=r.id WHERE m.user_id=? AND m.active=1').bind(owner).first<{id:string;data:string}>();
   if(active){const room=JSON.parse(active.data) as Room;if(room.players.some(p=>p.id===target&&!p.left))await new GameService(this.db,this.clock).leave(owner,room.id,room.round);}
   const result=await this.db.batch([this.db.prepare("INSERT OR IGNORE INTO player_blocks(user_id,blocked_id,created) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM rooms r JOIN members m ON m.room_id=r.id WHERE m.user_id=? AND m.active=1 AND EXISTS(SELECT 1 FROM json_each(r.data,'$.players') p WHERE json_extract(p.value,'$.id')=? AND COALESCE(json_extract(p.value,'$.left'),0)=0))").bind(owner,target,this.clock(),owner,target),this.db.prepare('DELETE FROM friendships WHERE ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)) AND EXISTS(SELECT 1 FROM player_blocks WHERE user_id=? AND blocked_id=?)').bind(owner,target,target,owner,owner,target)]);
   if(result[0]?.meta.changes||await this.db.prepare('SELECT 1 FROM player_blocks WHERE user_id=? AND blocked_id=?').bind(owner,target).first())return {ok:true};
  }
  throw new GameError('Oda değişti. Engelleme tamamlanmadı; tekrar dene.',409);
 }

 async unblock(owner:string,id:unknown){if(typeof id!=='string')throw new GameError('Oyuncu seç.');await this.db.prepare('DELETE FROM player_blocks WHERE user_id=? AND blocked_id=?').bind(owner,id).run();return {ok:true};}
 async blocks(owner:string){return {players:(await this.db.prepare('SELECT b.blocked_id AS id,p.nickname FROM player_blocks b JOIN players p ON p.id=b.blocked_id WHERE b.user_id=? ORDER BY b.created DESC LIMIT 200').bind(owner).all<{id:string;nickname:string}>()).results};}
 async queue(){return {restricted:(await this.db.prepare('SELECT r.user_id AS id,p.nickname FROM player_restrictions r JOIN players p ON p.id=r.user_id WHERE name_locked=1 LIMIT 200').all()).results,reports:(await this.db.prepare("SELECT id,reason,name_snapshot,status,created FROM player_reports WHERE status='open' ORDER BY created LIMIT 100").all()).results};}
 async releaseName(admin:string,id:unknown){if(typeof id!=='string'||id.length>256)throw new GameError('Oyuncu seç.');await this.db.batch([this.db.prepare("INSERT INTO admin_audit(id,actor_id,action,entity_id,summary,created) SELECT ?,?,'player_name_released',?,'Oyuncunun ad değiştirme kısıtlaması kaldırıldı.',? WHERE EXISTS(SELECT 1 FROM player_restrictions WHERE user_id=?)").bind(crypto.randomUUID(),admin,id,this.clock(),id),this.db.prepare('DELETE FROM player_restrictions WHERE user_id=?').bind(id)]);return {ok:true};}
 async review(admin:string,id:unknown,action:unknown){if(typeof id!=='string'||!['dismiss','resetName'].includes(String(action)))throw new GameError('İşlem geçerli değil.');
  const report=await this.db.prepare("SELECT target_id FROM player_reports WHERE id=? AND status='open'").bind(id).first<{target_id:string}>();if(!report)return {ok:true};
  const operation=crypto.randomUUID(),guard="EXISTS(SELECT 1 FROM player_reports WHERE id=? AND review_operation=?)";
  const statements=[this.db.prepare("UPDATE player_reports SET status=?,reviewed=?,reviewer_id=?,review_operation=? WHERE id=? AND status='open'").bind(action==='resetName'?'name_reset':'dismissed',this.clock(),admin,operation,id)];
  if(action==='resetName'){
   statements.push(this.db.prepare('INSERT OR REPLACE INTO player_restrictions(user_id,name_locked,created) SELECT id,1,? FROM players WHERE id=? AND '+guard).bind(this.clock(),report.target_id,id,operation));
   statements.push(this.db.prepare("UPDATE players SET nickname='Oyuncu' WHERE id=? AND "+guard).bind(report.target_id,id,operation),this.db.prepare("UPDATE results SET nickname='Oyuncu' WHERE user_id=? AND "+guard).bind(report.target_id,id,operation),this.db.prepare("UPDATE dailies SET nickname='Oyuncu' WHERE user_id=? AND "+guard).bind(report.target_id,id,operation));
  }
  statements.push(this.db.prepare('INSERT INTO admin_audit(id,actor_id,action,entity_id,summary,created) SELECT ?,?,?,?,?,? WHERE '+guard).bind(operation,admin,'player_report_reviewed',id,action==='resetName'?'Oyuncu adı kaldırıldı; yeni ad inceleme sonrasında açılabilir.':'Oyuncu bildirimi incelendi; işlem gerekmedi.',this.clock(),id,operation));

  await this.db.batch(statements);return {ok:true};
 }
}
