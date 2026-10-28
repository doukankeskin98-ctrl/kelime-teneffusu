import { dailySpec, goldenId, hash, istanbulDay, makePuzzle, match, pointsFor, type Cell, type Puzzle, type Stroke } from './engine.ts';
import { THEMES } from './catalog.ts';

export interface Statement { bind(...values: unknown[]): Statement; first<T=Record<string,unknown>>(): Promise<T|null>; all<T=Record<string,unknown>>(): Promise<{results:T[]}>; run():Promise<{meta:{changes:number}}> }
export interface Database {prepare(sql:string):Statement;batch(statements:Statement[]):Promise<{meta:{changes:number}}[]>}
export class GameError extends Error {constructor(message:string,public status=400){super(message);}}
export interface DuelPlayer { id:string; name:string; ready:boolean; strokes:Stroke[]; score:number; seen:number; lastFind:number; rematch:boolean }
export interface Room {id:string;code:string;kind:'quick'|'friend';phase:'waiting'|'ready'|'active'|'finished'|'cancelled';themeId:string;level:number;seed:number;starts:number|null;ends:number|null;winner:string|null;reason:string;players:DuelPlayer[];round:number;queuedAt?:number}
interface RoomRow {id:string;data:string;revision:number;expires:number}
interface Daily {id:string;day:string;starts:number;strokes:Stroke[];hints:number;finished:number|null;duration:number}
interface DailyRow {id:string;data:string;revision:number}
export interface RoomView {revision:number;id:string;code:string;kind:string;phase:Room['phase'];themeId:string;starts:number|null;ends:number|null;winner:string|null;reason:string;round:number;serverNow:number;board:Omit<Puzzle,'placements'>|null;golden:string|null;you:{id:string;name:string;ready:boolean;strokes:Stroke[];score:number;rematch:boolean};opponent:{name:string;ready:boolean;count:number;score:number;online:boolean;rematch:boolean}|null}
export interface DailyView extends Daily {serverNow:number;board:Omit<Puzzle,'placements'>}
export const publicBoard=({placements:_placements,...board}:Puzzle)=>board;
const clampName=(name:unknown)=>typeof name==='string'?name.normalize('NFC').replace(/[^\p{L}\p{N} _.-]/gu,'').trim().slice(0,20):'';
const player=(id:string,name:string,now:number):DuelPlayer=>({id,name,ready:false,strokes:[],score:0,seen:now,lastFind:0,rematch:false});
const code=()=>[...crypto.getRandomValues(new Uint8Array(8))].map(n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');
const puzzleCache=new Map<string,Puzzle>();
const roomPuzzle=(room:Room)=>{const key=`${room.themeId}:${room.level}:${room.seed}`;let puzzle=puzzleCache.get(key);if(!puzzle){puzzle=makePuzzle(room.themeId,room.level,room.seed);if(puzzleCache.size>=32)puzzleCache.delete(puzzleCache.keys().next().value!);puzzleCache.set(key,puzzle);}return puzzle;};
export function eloChange(a:number,b:number,result:0|0.5|1){return Math.round(32*(result-1/(1+10**((b-a)/400))));}
export class GameService {
 constructor(private db:Database,private clock:()=>number=Date.now){}
 private q(sql:string,...values:unknown[]){return this.db.prepare(sql).bind(...values);}
 async profile(userId:string){
   await this.q('INSERT OR IGNORE INTO players(id,nickname,created) VALUES(?,?,?)',userId,'Kelimeci '+hash(userId).toString(36).slice(0,4).toUpperCase(),this.clock()).run();
   const p=await this.q('SELECT id,nickname FROM players WHERE id=?',userId).first<{id:string;nickname:string}>();
   if(!p)throw new GameError('Profil hazırlanamadı',503);return p;
 }
 async rename(userId:string,name:unknown){const nickname=clampName(name);if(nickname.length<2)throw new GameError('Takma ad en az 2 karakter olsun.');await this.profile(userId);await this.q('UPDATE players SET nickname=? WHERE id=?',nickname,userId).run();return this.profile(userId);}
 private async row(id:string){const row=await this.q('SELECT id,data,revision,expires FROM rooms WHERE id=?',id).first<RoomRow>();if(!row)throw new GameError('Oda bulunamadı.',404);return row;}
 private parse(row:RoomRow){return JSON.parse(row.data) as Room;}
 private async active(userId:string){
   // Expired leases are released without exposing other players' information.
   await this.q('UPDATE members SET active=0 WHERE user_id=? AND active=1 AND room_id IN (SELECT id FROM rooms WHERE expires<?)',userId,this.clock()).run();
   const found=await this.q('SELECT r.id,r.data,r.revision,r.expires FROM rooms r JOIN members m ON m.room_id=r.id WHERE m.user_id=? AND m.active=1',userId).first<RoomRow>();return found;
 }
 private async save(row:RoomRow,room:Room){
   const now=this.clock(),resultAt=room.ends!==null?Math.min(now,room.ends):now;const next=row.revision+1;
   const statements=[this.q('UPDATE rooms SET data=?,phase=?,revision=?,updated=?,expires=MAX(expires,?) WHERE id=? AND revision=?',JSON.stringify(room),room.phase,next,now,now+30*60000,room.id,row.revision)];
   if(room.phase==='finished')for(const p of room.players)statements.push(this.q("INSERT OR IGNORE INTO results(room_id,user_id,nickname,score,win,created) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='finished')",room.id+':'+room.round,p.id,p.name,p.score,room.winner===p.id?1:0,resultAt,room.id,next));
   if(room.phase==='finished'&&room.kind==='quick'&&room.players.length===2){
    const [a,b]=room.players as [DuelPlayer,DuelPlayer],ra=await this.rating(a.id),rb=await this.rating(b.id),result=room.winner===null?0.5:room.winner===a.id?1:0;
    const delta=eloChange(ra.value,rb.value,result),event=room.id+':'+room.round;
    for(const [p,value] of [[a,Math.max(100,ra.value+delta)],[b,Math.max(100,rb.value-delta)]] as [DuelPlayer,number][]){
     statements.push(this.q('INSERT OR IGNORE INTO ratings(user_id,value,played,updated) VALUES(?,1000,0,?)',p.id,now));
     statements.push(this.q("UPDATE ratings SET value=?,played=played+1,updated=? WHERE user_id=? AND NOT EXISTS(SELECT 1 FROM rating_events WHERE room_id=?) AND EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='finished')",value,now,p.id,event,room.id,next));
    }
    statements.push(this.q("INSERT OR IGNORE INTO rating_events(room_id,created) SELECT ?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='finished')",event,now,room.id,next));
   }
   const result=await this.db.batch(statements);return result[0]?.meta.changes===1;
 }
 private settle(room:Room,now:number){if(room.phase==='active'&&room.ends!==null&&now>=room.ends){room.phase='finished';room.reason='Süre doldu';const [a,b]=room.players;if(a&&b)room.winner=a.score===b.score?null:(a.score>b.score?a.id:b.id);}}
 private view(room:Room,userId:string,revision=0):RoomView {
   const you=room.players.find(p=>p.id===userId);if(!you)throw new GameError('Bu odada değilsin.',403);
   const other=room.players.find(p=>p.id!==userId);const now=this.clock();
   const puzzle=room.phase==='active'||room.phase==='finished'?roomPuzzle(room):null;
   return {revision,id:room.id,code:room.code,kind:room.kind,phase:room.phase,themeId:room.themeId,starts:room.starts,ends:room.ends,winner:room.winner,reason:room.reason,round:room.round,serverNow:now,board:puzzle?publicBoard(puzzle):null,golden:puzzle&&room.starts!==null?goldenId(puzzle.targets,room.starts,now):null,you:{id:you.id,name:you.name,ready:you.ready,strokes:you.strokes,score:you.score,rematch:you.rematch},opponent:other?{name:other.name,ready:other.ready,count:other.strokes.length,score:other.score,online:now-other.seen<15000,rematch:other.rematch}:null};
 }
 private async pairWaiting(row:RoomRow):Promise<string>{
   const current=this.parse(row);if(current.kind!=='quick'||current.phase!=='waiting')return row.id;
   const rating=await this.rating(current.players[0]!.id);
   // Adjacent queue positions form disjoint pairs. A burst of clients must not all claim one oldest room.
   const candidates=(await this.q("SELECT r.id,r.data,r.revision,r.expires FROM rooms r LEFT JOIN ratings e ON e.user_id=json_extract(r.data,'$.players[0].id') WHERE r.kind='quick' AND r.phase='waiting' AND r.expires>? AND r.updated>? AND (ABS(COALESCE(e.value,1000)-?)<=200+MAX(0,?-MIN(COALESCE(json_extract(r.data,'$.queuedAt'),r.updated),?))/50 OR MIN(COALESCE(json_extract(r.data,'$.queuedAt'),r.updated),?)<?) ORDER BY r.id LIMIT 64",this.clock(),this.clock()-15000,rating.value,this.clock(),current.queuedAt??this.clock(),current.queuedAt??this.clock(),this.clock()-60000).all<RoomRow>()).results;
   const position=candidates.findIndex(candidate=>candidate.id===row.id);
   const other=position>=0?candidates[position%2===0?position+1:position-1]:candidates[hash(row.id)%Math.max(1,candidates.length)];
   if(!other||other.id===row.id)return row.id;
   const [host,guest]=[row,other].sort((a,b)=>a.id.localeCompare(b.id));
   if(!host||!guest)return row.id;
   const joined=this.parse(host),retired=this.parse(guest),guestPlayer=retired.players[0];if(!guestPlayer)return row.id;
   joined.players.push({...guestPlayer,seen:this.clock()});joined.phase='ready';retired.phase='cancelled';retired.reason='Oyuncular eşleştirildi';
   await this.db.batch([
     this.q("UPDATE rooms SET data=?,phase='ready',revision=revision+1,updated=? WHERE id=? AND revision=? AND phase='waiting' AND EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='waiting')",JSON.stringify(joined),this.clock(),host.id,host.revision,guest.id,guest.revision),
     this.q("UPDATE rooms SET data=?,phase='cancelled',revision=revision+1 WHERE id=? AND revision=? AND phase='waiting' AND EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND json_extract(data,'$.players[1].id')=?)",JSON.stringify(retired),guest.id,guest.revision,host.id,host.revision+1,guestPlayer.id),
     this.q("UPDATE members SET room_id=? WHERE room_id=? AND active=1 AND EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='cancelled')",host.id,guest.id,guest.id,guest.revision+1)
   ]);
   const active=await this.active(current.players[0]!.id);return active?.id??row.id;
 }
 async state(userId:string,id?:string):Promise<RoomView|null> {
   const active=await this.active(userId);
   let row=active??(id?await this.row(id):null);if(!row)return null;
   if(!this.parse(row).players.some(p=>p.id===userId))throw new GameError('Bu odada değilsin.',403);
   const paired=await this.pairWaiting(row);if(paired!==row.id)row=await this.row(paired);
   return this.mutate(userId,row.id,(_room,p)=>{p.seen=this.clock();},true);
 }
 async watch(userId:string,id:string){const row=await this.row(id),room=this.parse(row);if(!room.players.some(p=>p.id===userId))throw new GameError('Bu odada değilsin.',403);if(room.phase==='active'&&room.ends!==null&&this.clock()>=room.ends)return {revision:row.revision+1,view:await this.mutate(userId,id,()=>{})};return {revision:row.revision,view:this.view(room,userId,row.revision)};}
 private async mutate(userId:string,id:string,fn:(room:Room,you:DuelPlayer)=>void,heartbeat=false):Promise<RoomView>{
   for(let tries=0;tries<8;tries++){
     const row=await this.row(id),room=this.parse(row);const you=room.players.find(p=>p.id===userId);if(!you)throw new GameError('Bu odada değilsin.',403);
     const now=this.clock();this.settle(room,now);
     if(row.expires<now&&room.phase!=='finished'){room.phase='cancelled';room.reason='Odanın süresi doldu';}
     const before=JSON.stringify(room);fn(room,you);
     // Heartbeats write only every five seconds; countdown and results remain authoritative.
     if(heartbeat&&now-JSON.parse(row.data).players.find((p:DuelPlayer)=>p.id===userId).seen<5000&&before===row.data)return this.view(room,userId,row.revision);
     if(await this.save(row,room))return this.view(room,userId,row.revision+1);
   }
   throw new GameError('Oda güncelleniyor. Tekrar dene.',409);
 }
 private async joinRow(userId:string,row:RoomRow){
   const name=(await this.profile(userId)).nickname;const room=this.parse(row);
   if(room.players.some(p=>p.id===userId))return this.view(room,userId,row.revision);
   if(room.phase!=='waiting'||room.players.length!==1||row.expires<this.clock())throw new GameError('Bu oda dolu veya süresi dolmuş.',409);
   room.players.push(player(userId,name,this.clock()));room.phase='ready';
   const rev=row.revision+1;
   try{
     const r=await this.db.batch([
       this.q("UPDATE rooms SET data=?,phase='ready',revision=?,updated=? WHERE id=? AND revision=? AND phase='waiting' AND expires>?",JSON.stringify(room),rev,this.clock(),room.id,row.revision,this.clock()),
       this.q("INSERT INTO members(room_id,user_id,active) SELECT ?,?,1 WHERE EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND json_extract(data,'$.players[1].id')=?)",room.id,userId,room.id,rev,userId)
     ]);
     if(r[0]?.meta.changes!==1)throw new GameError('Başka bir oyuncu önce katıldı.',409);
   }catch(e){if(e instanceof GameError)throw e;const active=await this.active(userId);if(active)return this.state(userId,active.id);throw new GameError('Odaya katılınamadı. Yeniden dene.',409);}
   return this.view(room,userId,row.revision+1);
 }
 async enter(userId:string,kind:'quick'|'friend',joinCode?:string){
   const active=await this.active(userId);if(active)return this.state(userId,active.id);
   if(joinCode){const row=await this.q("SELECT id,data,revision,expires FROM rooms WHERE code=? AND kind='friend'",joinCode.trim().toUpperCase()).first<RoomRow>();if(!row)throw new GameError('Bu kodla bir oda bulunamadı.',404);return this.joinRow(userId,row);}
   if(kind==='quick'){
     const rating=await this.rating(userId);
     for(let attempt=0;attempt<3;attempt++){
       const row=await this.q("SELECT r.id,r.data,r.revision,r.expires FROM rooms r LEFT JOIN ratings e ON e.user_id=json_extract(r.data,'$.players[0].id') WHERE r.kind='quick' AND r.phase='waiting' AND r.expires>? AND r.updated>? AND (ABS(COALESCE(e.value,1000)-?)<=200+MAX(0,?-COALESCE(json_extract(r.data,'$.queuedAt'),r.updated))/50 OR COALESCE(json_extract(r.data,'$.queuedAt'),r.updated)<?) ORDER BY r.updated LIMIT 1",this.clock(),this.clock()-15000,rating.value,this.clock(),this.clock()-60000).first<RoomRow>();if(!row)break;
       try{return await this.joinRow(userId,row);}catch(e){if(!(e instanceof GameError)||e.status!==409)throw e;}
     }
   }
   const now=this.clock();const id=crypto.randomUUID();const themeId=THEMES[hash(id)%THEMES.length]!.id;
   const room:Room={id,code:code(),kind,phase:'waiting',themeId,level:2,seed:hash(crypto.randomUUID()),starts:null,ends:null,winner:null,reason:'',players:[player(userId,(await this.profile(userId)).nickname,now)],round:1,queuedAt:now};
   try{await this.db.batch([
     this.q('INSERT INTO rooms(id,code,kind,phase,data,revision,expires,updated) VALUES(?,?,?,?,?,0,?,?)',id,room.code,kind,room.phase,JSON.stringify(room),now+30*60000,now),
     this.q('INSERT INTO members(room_id,user_id,active) VALUES(?,?,1)',id,userId)
   ]);}catch{const existing=await this.active(userId);if(existing)return this.state(userId,existing.id);throw new GameError('Oda hazırlanamadı.',503);}
   return kind==='quick'?this.state(userId,id):this.view(room,userId);
 }
 async ready(userId:string,id:string){return this.mutate(userId,id,(room,p)=>{
   if(room.phase==='active'&&p.ready)return;
   if(room.phase!=='ready')throw new GameError('İkinci oyuncu bekleniyor.',409);p.ready=true;p.seen=this.clock();
   if(room.players.length===2&&room.players.every(x=>x.ready)){room.phase='active';room.starts=this.clock()+4000;room.ends=room.starts+120000;}
 });}
 async claim(userId:string,id:string,a:unknown,b:unknown){return this.mutate(userId,id,(room,p)=>{
   const now=this.clock();if(room.phase!=='active'||room.starts===null||room.ends===null||now<room.starts||now>=room.ends)throw new GameError('Bu düelloda seçim süresi açık değil.',409);
   const board=makePuzzle(room.themeId,room.level,room.seed);const target=match(board,a,b);if(!target)throw new GameError('Bu seçim listedeki bir kelimeyi oluşturmuyor.');
   if(p.strokes.some(s=>s.id===target.id))return;
   p.strokes.push({id:target.id,a:a as Cell,b:b as Cell});p.score+=pointsFor(target,goldenId(board.targets,room.starts,now)===target.id);p.seen=now;p.lastFind=now;
   if(p.strokes.length===board.targets.length){room.phase='finished';room.winner=p.id;room.reason='Tüm kelimeler bulundu';room.ends=now;}
 });}
 async leave(userId:string,id:string){
   await this.mutate(userId,id,(room,p)=>{if(room.phase==='active'){room.phase='finished';room.winner=room.players.find(x=>x.id!==p.id)?.id??null;room.reason='Rakip ayrıldı';room.ends=this.clock();}else if(room.phase==='waiting'||room.phase==='ready'){room.phase='cancelled';room.reason='Oyuncu ayrıldı';}});
   await this.q('UPDATE members SET active=0 WHERE user_id=? AND room_id=?',userId,id).run();return {ok:true};
 }
 async rematch(userId:string,id:string){
   const active=await this.q('SELECT COUNT(*) AS count FROM members WHERE room_id=? AND active=1',id).first<{count:number}>();
   if(active?.count!==2)throw new GameError('Rakibin odadan ayrıldı. Yeni bir düello başlatabilirsin.',409);
   return this.mutate(userId,id,(room,p)=>{
   if(room.phase!=='finished')throw new GameError('Düello henüz bitmedi.',409);p.rematch=true;p.seen=this.clock();
   if(room.players.every(x=>x.rematch)){
     room.round++;room.seed=hash(crypto.randomUUID());room.starts=null;room.ends=null;room.winner=null;room.reason='';room.phase='ready';
     room.players=room.players.map(x=>player(x.id,x.name,this.clock()));
   }
 });}
 private dailyView(d:Daily&{hintReceipts?:{id:string;cell:Cell}[]}){const {hintReceipts:_receipts,...view}=d,spec=dailySpec(d.day);return {...view,serverNow:this.clock(),board:publicBoard(makePuzzle(spec.themeId,spec.level,spec.seed))};}
 async dailyState(userId:string,id:string){
   const row=await this.q('SELECT data FROM dailies WHERE id=? AND user_id=?',id,userId).first<{data:string}>();
   if(!row)throw new GameError('Günlük oyun bulunamadı.',404);
   return this.dailyView(JSON.parse(row.data));
 }
 async daily(userId:string){
   const day=istanbulDay(this.clock()),now=this.clock(),p=await this.profile(userId);const id=crypto.randomUUID();
   const data:Daily={id,day,starts:now,strokes:[],hints:0,finished:null,duration:0};
   await this.q('INSERT OR IGNORE INTO dailies(id,user_id,nickname,day,data,created) VALUES(?,?,?,?,?,?)',id,userId,p.nickname,day,JSON.stringify(data),now).run();
   const row=await this.q('SELECT id,data,revision FROM dailies WHERE user_id=? AND day=?',userId,day).first<DailyRow>();if(!row)throw new GameError('Günlük hazırlanamadı.',503);return this.dailyView(JSON.parse(row.data));
 }
 async dailyClaim(userId:string,id:string,a:unknown,b:unknown,hint=false,requestId?:unknown){
   if(hint&&requestId!==undefined&&(typeof requestId!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)))throw new GameError('İpucu işlemi doğrulanamadı.');
   for(let tries=0;tries<8;tries++){
     const row=await this.q('SELECT id,data,revision FROM dailies WHERE id=? AND user_id=?',id,userId).first<DailyRow>();if(!row)throw new GameError('Günlük oyun bulunamadı.',404);
     const d=JSON.parse(row.data) as Daily&{hintReceipts?:{id:string;cell:Cell}[]};
     const receipt=hint&&typeof requestId==='string'?d.hintReceipts?.find(r=>r.id===requestId):undefined;
     if(receipt)return {...this.dailyView(d),hintCell:receipt.cell};
     if(d.finished!==null)return this.dailyView(d);
     if(this.clock()-d.starts>86400000)throw new GameError('Bu günlük oyunun süresi doldu. Yeni güne geçebilirsin.',409);
     const spec=dailySpec(d.day),board=makePuzzle(spec.themeId,spec.level,spec.seed);let hintCell:Cell|null=null;
     if(hint){if(d.hints>=3)throw new GameError('Üç ipucunu da kullandın.');const remaining=board.placements.find(t=>!d.strokes.some(s=>s.id===t.id));if(remaining){d.hints++;hintCell=remaining.a;if(typeof requestId==='string')d.hintReceipts=[...(d.hintReceipts??[]),{id:requestId,cell:hintCell}].slice(-3);}}
     else{const target=match(board,a,b);if(!target)throw new GameError('Bu seçim listedeki bir kelimeyi oluşturmuyor.');if(!d.strokes.some(s=>s.id===target.id))d.strokes.push({id:target.id,a:a as Cell,b:b as Cell});}
     if(d.strokes.length===board.targets.length){d.finished=this.clock();d.duration=Math.max(1,d.finished-d.starts)+d.hints*15000;}
     const r=await this.q('UPDATE dailies SET data=?,revision=revision+1,completed=?,duration=? WHERE id=? AND revision=?',JSON.stringify(d),d.finished!==null?1:0,d.duration,id,row.revision).run();
     if(r.meta.changes)return {...this.dailyView(d),hintCell};
   }
   throw new GameError('Günlük oyun güncelleniyor.',409);
 }
 async rankings(){
   const day=istanbulDay(this.clock());
   const daily=(await this.q('SELECT nickname,duration FROM dailies WHERE day=? AND completed=1 ORDER BY duration,created LIMIT 20',day).all<{nickname:string;duration:number}>()).results;
   const arena=(await this.q('SELECT p.nickname,e.played,e.value AS rating,COALESCE((SELECT SUM(r.win) FROM results r JOIN rating_events re ON re.room_id=r.room_id WHERE r.user_id=p.id),0) AS wins,COALESCE((SELECT SUM(r.score) FROM results r JOIN rating_events re ON re.room_id=r.room_id WHERE r.user_id=p.id),0) AS score FROM ratings e JOIN players p ON p.id=e.user_id WHERE e.played>0 ORDER BY e.value DESC,e.played DESC LIMIT 20').all<{nickname:string;played:number;wins:number;score:number;rating:number}>()).results;
   return {day,daily,arena};
 }
 async stats(userId:string){return this.q('SELECT COUNT(*) AS played,COALESCE(SUM(win),0) AS wins,COALESCE(SUM(score),0) AS score FROM results WHERE user_id=?',userId).first<{played:number;wins:number;score:number}>();}
 async rating(userId:string){return await this.q('SELECT value,played FROM ratings WHERE user_id=?',userId).first<{value:number;played:number}>()??{value:1000,played:0};}
}
