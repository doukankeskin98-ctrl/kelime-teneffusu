import { dailySpec, goldenId, hash, istanbulDay, makePuzzle, match, pointsFor, type Cell, type Puzzle, type Stroke } from './engine.ts';
import { THEMES } from './catalog.ts';
import {ARENA_POOL_SIZE,arenaPuzzle,arenaWordKey,arenaGridKey} from './arena-content.ts';

export interface Statement { bind(...values: unknown[]): Statement; first<T=Record<string,unknown>>(): Promise<T|null>; all<T=Record<string,unknown>>(): Promise<{results:T[]}>; run():Promise<{meta:{changes:number}}> }
export interface Database {prepare(sql:string):Statement;batch(statements:Statement[]):Promise<{meta:{changes:number}}[]>}
export class GameError extends Error {constructor(message:string,public status=400,public code?:string){super(message);}}
export interface DuelPlayer { id:string; name:string; ready:boolean; strokes:Stroke[]; score:number; seen:number; lastFind:number; rematch:boolean;left?:boolean }
export interface Room {id:string;code:string;kind:'quick'|'friend';phase:'waiting'|'ready'|'active'|'finished'|'cancelled';themeId:string;level:number;seed:number;starts:number|null;ends:number|null;winner:string|null;reason:string;players:DuelPlayer[];round:number;queuedAt?:number;mode?:'group';protocol?:2;puzzle?:Puzzle;contentOrdinal?:number;writeToken?:string;ranks?:Record<string,number>;lastResult?:ArenaResult}
interface RoomRow {id:string;data:string;revision:number;expires:number}
interface Daily {id:string;day:string;starts:number;strokes:Stroke[];hints:number;finished:number|null;duration:number}
interface DailyRow {id:string;data:string;revision:number}
export interface ArenaParticipant {id:string;name:string;ready:boolean;count:number;score:number;online:boolean;rematch:boolean;left:boolean;rank:number}
export interface ArenaResult {round:number;winner:string|null;reason:string;players:ArenaParticipant[]}
export interface RoomView {lastResult?:ArenaResult;mode?:'group'|'duel';hostId?:string;players?:ArenaParticipant[];contentOrdinal?:number;revision:number;id:string;code:string;kind:string;phase:Room['phase'];themeId:string;starts:number|null;ends:number|null;winner:string|null;reason:string;round:number;serverNow:number;board:Omit<Puzzle,'placements'>|null;golden:string|null;you:{id:string;name:string;ready:boolean;strokes:Stroke[];score:number;rematch:boolean};opponent:{name:string;ready:boolean;count:number;score:number;online:boolean;rematch:boolean}|null}
export interface DailyView extends Daily {serverNow:number;board:Omit<Puzzle,'placements'>}
export const publicBoard=({placements:_placements,...board}:Puzzle)=>board;
const clampName=(name:unknown)=>typeof name==='string'?name.normalize('NFC').replace(/[^\p{L}\p{N} _.-]/gu,'').trim().slice(0,20):'';
const player=(id:string,name:string,now:number):DuelPlayer=>({id,name,ready:false,strokes:[],score:0,seen:now,lastFind:0,rematch:false});
const code=()=>[...crypto.getRandomValues(new Uint8Array(8))].map(n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('');
const puzzleCache=new Map<string,Puzzle>();
export const roomPuzzle=(room:Room)=>{if(room.puzzle)return room.puzzle;const key=`${room.themeId}:${room.level}:${room.seed}`;let puzzle=puzzleCache.get(key);if(!puzzle){puzzle=makePuzzle(room.themeId,room.level,room.seed);if(puzzleCache.size>=32)puzzleCache.delete(puzzleCache.keys().next().value!);puzzleCache.set(key,puzzle);}return puzzle;};
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
 private async save(row:RoomRow,room:Room,allocation?:{from:number;next:number},actor?:string){
   const now=this.clock(),resultAt=room.ends!==null?Math.min(now,room.ends):now;const next=row.revision+1,token=crypto.randomUUID();room.writeToken=token;
   if(room.phase==='finished'&&!room.ranks)room.ranks=this.ranks(room);
   const lease=actor?" AND expires>=? AND EXISTS(SELECT 1 FROM members WHERE room_id=rooms.id AND user_id=? AND active=1)":'',leaseArgs=actor?[now,actor]:[];
   const guard="EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND json_extract(data,'$.writeToken')=?)";
   const statements:Statement[]=[];
   if(allocation)statements.push(this.q("UPDATE arena_pool SET next=?,claim=? WHERE id='arena-v1' AND next=? AND EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=?"+lease+")",allocation.next,token,allocation.from,room.id,row.revision,...leaseArgs));
   const updateIndex=statements.length;statements.push(this.q('UPDATE rooms SET data=?,phase=?,revision=?,updated=?,expires=CASE WHEN expires>=? THEN MAX(expires,?) ELSE expires END WHERE id=? AND revision=?'+lease,JSON.stringify(room),room.phase,next,now,now,now+30*60000,room.id,row.revision,...leaseArgs));
   if(allocation){
    // A failed allocator CAS must not publish a board. The batch rolls back on a receipt conflict.
    statements[updateIndex]=this.q("UPDATE rooms SET data=?,phase=?,revision=?,updated=?,expires=CASE WHEN expires>=? THEN MAX(expires,?) ELSE expires END WHERE id=? AND revision=? AND EXISTS(SELECT 1 FROM arena_pool WHERE id='arena-v1' AND claim=?)"+lease,JSON.stringify(room),room.phase,next,now,now,now+30*60000,room.id,row.revision,token,...leaseArgs);
    const board=roomPuzzle(room);for(const p of room.players)statements.push(this.q('INSERT INTO arena_seen(user_id,words_key,grid_key,room_id,round,created) SELECT ?,?,?,?,?,? WHERE '+guard,p.id,arenaWordKey(board),arenaGridKey(board),room.id,room.round,now,room.id,next,token));
   }
   for(const p of room.players.filter(p=>p.left))statements.push(this.q('UPDATE members SET active=0 WHERE room_id=? AND user_id=? AND '+guard,room.id,p.id,room.id,next,token));
   if(room.phase==='finished')for(const p of room.players)statements.push(this.q("INSERT OR IGNORE INTO results(room_id,user_id,nickname,score,win,created) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='finished' AND json_extract(data,'$.writeToken')=?)",room.id+':'+room.round,p.id,p.name,p.score,room.winner===p.id?1:0,resultAt,room.id,next,token));
   if(room.phase==='finished'&&room.kind==='quick'&&room.players.length===2){
    const [a,b]=room.players as [DuelPlayer,DuelPlayer],ra=await this.rating(a.id),rb=await this.rating(b.id),result=room.winner===null?0.5:room.winner===a.id?1:0;
    const delta=eloChange(ra.value,rb.value,result),event=room.id+':'+room.round;
    for(const [p,value] of [[a,Math.max(100,ra.value+delta)],[b,Math.max(100,rb.value-delta)]] as [DuelPlayer,number][]){
     statements.push(this.q('INSERT OR IGNORE INTO ratings(user_id,value,played,updated) VALUES(?,1000,0,?)',p.id,now));
     statements.push(this.q("UPDATE ratings SET value=?,played=played+1,updated=? WHERE user_id=? AND NOT EXISTS(SELECT 1 FROM rating_events WHERE room_id=?) AND EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='finished' AND json_extract(data,'$.writeToken')=?)",value,now,p.id,event,room.id,next,token));
    }
    statements.push(this.q("INSERT OR IGNORE INTO rating_events(room_id,created) SELECT ?,? WHERE EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND phase='finished' AND json_extract(data,'$.writeToken')=?)",event,now,room.id,next,token));
   }
   const result=await this.db.batch(statements);return result[updateIndex]?.meta.changes===1;
 }
 private settle(room:Room,now:number){if(room.phase==='active'&&room.ends!==null&&now>=room.ends){room.phase='finished';room.reason='Süre doldu';const eligible=room.players.filter(p=>!p.left).sort((a,b)=>b.score-a.score);room.winner=eligible.length&&(!eligible[1]||eligible[0]!.score>eligible[1].score)?eligible[0]!.id:null;}}
 private ranks(room:Room){
   const better=(a:DuelPlayer,b:DuelPlayer)=>Number(!!a.left)-Number(!!b.left)||Number(b.id===room.winner)-Number(a.id===room.winner)||b.score-a.score;
   return Object.fromEntries(room.players.map(p=>[p.id,1+room.players.filter(x=>better(x,p)<0).length]));
 }
 private view(room:Room,userId:string,revision=0):RoomView {
   const you=room.players.find(p=>p.id===userId);if(!you)throw new GameError('Bu odada değilsin.',403);
   const other=room.players.find(p=>p.id!==userId);const now=this.clock();
   const puzzle=room.phase==='active'||room.phase==='finished'?roomPuzzle(room):null;
   const ranks=room.ranks??this.ranks(room),sorted=[...room.players].sort((a,b)=>ranks[a.id]!-ranks[b.id]!||a.id.localeCompare(b.id));
   const participants=sorted.map(p=>({id:p.id,name:p.name,ready:p.ready,count:p.strokes.length,score:p.score,online:!p.left&&now-p.seen<15000,rematch:p.rematch,left:!!p.left,rank:ranks[p.id]!}));
   return {lastResult:room.lastResult,revision,id:room.id,code:room.code,kind:room.kind,mode:room.mode??'duel',hostId:room.players.find(p=>!p.left)?.id,players:participants,contentOrdinal:room.contentOrdinal,phase:room.phase,themeId:room.themeId,starts:room.starts,ends:room.ends,winner:room.winner,reason:room.reason,round:room.round,serverNow:now,board:puzzle?publicBoard(puzzle):null,golden:puzzle&&room.starts!==null?goldenId(puzzle.targets,room.starts,now):null,you:{id:you.id,name:you.name,ready:you.ready,strokes:you.strokes,score:you.score,rematch:you.rematch},opponent:other?{name:other.name,ready:other.ready,count:other.strokes.length,score:other.score,online:!other.left&&now-other.seen<15000,rematch:other.rematch}:null};
 }
 private fence(room:Room,expectedRound?:unknown){if(expectedRound===undefined&&!room.mode&&!room.protocol)return;if(!Number.isSafeInteger(expectedRound)||expectedRound!==room.round)throw new GameError('Maç değişti. Güncel odayı yeniden kontrol et.',409,'ARENA_ROUND_CHANGED');}
 private async allocate(room:Room){
   await this.q("INSERT OR IGNORE INTO arena_pool(id,next,claim) VALUES('arena-v1',0,'')").run();
   const cursor=await this.q("SELECT next FROM arena_pool WHERE id='arena-v1'").first<{next:number}>();const from=cursor!.next;
   for(let ordinal=from;ordinal<Math.min(from+128,ARENA_POOL_SIZE);ordinal++){
    const candidate=arenaPuzzle(ordinal);if(!candidate)continue;
    const seen=await this.q('SELECT 1 AS seen FROM arena_seen WHERE user_id IN (SELECT value FROM json_each(?)) AND (words_key=? OR grid_key=?) LIMIT 1',JSON.stringify(room.players.filter(p=>!p.left).map(p=>p.id)),candidate.wordsKey,candidate.gridKey).first();
    if(seen)continue;
    room.puzzle=candidate.board;room.themeId=candidate.themeId;room.seed=candidate.seed;room.contentOrdinal=ordinal;return {from,next:ordinal+1};
   }
   // A bounded scan must make progress even when every candidate is invalid or previously seen.
   const next=Math.min(from+128,ARENA_POOL_SIZE);
   await this.q("UPDATE arena_pool SET next=? WHERE id='arena-v1' AND next=?",next,from).run();
   if(next>=ARENA_POOL_SIZE)throw new GameError('Benzersiz Arena havuzu tükendi. Önceki bölüm yeniden açılmadı; yeni içerik hazırlanması gerekiyor.',409,'ARENA_CONTENT_UNAVAILABLE');
   throw new GameError('Yeni içerik seçimi tamamlanamadı. Eski bölüm açılmadı; biraz sonra yeniden dene.',503,'ARENA_CONTENT_UNAVAILABLE');
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
   return this.mutate(userId,row.id,(_room,p)=>{p.seen=this.clock();},true,false);
 }
 async watch(userId:string,id:string){const row=await this.row(id),room=this.parse(row);if(!room.players.some(p=>p.id===userId))throw new GameError('Bu odada değilsin.',403);if(room.phase==='active'&&room.ends!==null&&this.clock()>=room.ends)return {revision:row.revision+1,view:await this.mutate(userId,id,()=>{},false,false)};return {revision:row.revision,view:this.view(room,userId,row.revision)};}
 private async mutate(userId:string,id:string,fn:(room:Room,you:DuelPlayer)=>void,heartbeat=false,requireActive=true):Promise<RoomView>{
   for(let tries=0;tries<64;tries++){
     const row=await this.row(id),room=this.parse(row);const you=room.players.find(p=>p.id===userId);if(!you)throw new GameError('Bu odada değilsin.',403);
     const originalPhase=room.phase;const now=this.clock();this.settle(room,now);
     // Commit the terminal result before a next/leave request can change its phase.
     if(originalPhase==='active'&&room.phase==='finished'){if(await this.save(row,room))continue;else continue;}
     if(requireActive&&(row.expires<now||!(await this.q('SELECT 1 AS active FROM members WHERE room_id=? AND user_id=? AND active=1',id,userId).first())))throw new GameError('Bu odanın etkin katılımı sona erdi. Yeni bir oda açabilirsin.',409,'ARENA_MEMBERSHIP_EXPIRED');
     if(!requireActive&&row.expires<now&&room.phase==='finished')return this.view(room,userId,row.revision);
     if(row.expires<now&&room.phase!=='finished'){room.phase='cancelled';room.reason='Odanın süresi doldu';}
     const before=JSON.stringify(room);fn(room,you);
     if(JSON.stringify(room)===row.data)return this.view(room,userId,row.revision);
     // Heartbeats write only every five seconds; countdown and results remain authoritative.
     if(heartbeat&&now-JSON.parse(row.data).players.find((p:DuelPlayer)=>p.id===userId).seen<5000&&before===row.data)return this.view(room,userId,row.revision);
     const allocation=originalPhase!=='active'&&room.phase==='active'?await this.allocate(room):undefined;
     if(await this.save(row,room,allocation,requireActive?userId:undefined))return this.view(room,userId,row.revision+1);
   }
   throw new GameError('Oda güncelleniyor. Tekrar dene.',409);
 }
 private async joinRow(userId:string,initial:RoomRow){
   const name=(await this.profile(userId)).nickname;
   for(let tries=0;tries<64;tries++){
    const row=tries?await this.row(initial.id):initial,room=this.parse(row);
    if(room.players.some(p=>p.id===userId&&!p.left))return this.view(room,userId,row.revision);
    if(!(room.phase==='waiting'||room.mode==='group'&&room.phase==='ready')||(!room.mode&&room.players.length!==1)||row.expires<this.clock())throw new GameError('Maç başladı veya oda kapandı. Sonraki maçın lobisinde katılabilirsin.',409);
    room.players=room.players.filter(p=>p.id!==userId&&!p.left);room.players.push(player(userId,name,this.clock()));room.phase='ready';
    // Reserve headroom for every player's six strokes and the SSE envelope, not an arbitrary seat count.
    if(new TextEncoder().encode(JSON.stringify(room)).length+room.players.length*1200>60000)throw new GameError('Oda bu sunucunun güvenli veri kapasitesine ulaştı. Yeni bir özel oda açabilirsin.',409,'ARENA_ROOM_CAPACITY');
    const rev=row.revision+1,token=crypto.randomUUID();room.writeToken=token;
    try{
     const r=await this.db.batch([
      this.q("UPDATE rooms SET data=?,phase='ready',revision=?,updated=? WHERE id=? AND revision=? AND expires>?",JSON.stringify(room),rev,this.clock(),room.id,row.revision,this.clock()),
      this.q("INSERT INTO members(room_id,user_id,active) SELECT ?,?,1 WHERE EXISTS(SELECT 1 FROM rooms WHERE id=? AND revision=? AND json_extract(data,'$.writeToken')=?) ON CONFLICT(room_id,user_id) DO UPDATE SET active=1",room.id,userId,room.id,rev,token)
     ]);
     if(r[0]?.meta.changes===1)return this.view(room,userId,rev);
    }catch(e){const active=await this.active(userId);if(active)return this.state(userId,active.id);throw new GameError('Odaya katılınamadı. Yeniden dene.',409);}
   }
   throw new GameError('Katılım yoğun. Odayı yeniden kontrol et.',409);
 }
 async enter(userId:string,kind:'quick'|'friend',joinCode?:string,group=false){
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
   const room:Room={protocol:2,...(kind==='friend'&&group?{mode:'group' as const}:{}),id,code:code(),kind,phase:'waiting',themeId,level:2,seed:hash(crypto.randomUUID()),starts:null,ends:null,winner:null,reason:'',players:[player(userId,(await this.profile(userId)).nickname,now)],round:1,queuedAt:now};
   try{await this.db.batch([
     this.q('INSERT INTO rooms(id,code,kind,phase,data,revision,expires,updated) VALUES(?,?,?,?,?,0,?,?)',id,room.code,kind,room.phase,JSON.stringify(room),now+30*60000,now),
     this.q('INSERT INTO members(room_id,user_id,active) VALUES(?,?,1)',id,userId)
   ]);}catch{const existing=await this.active(userId);if(existing)return this.state(userId,existing.id);throw new GameError('Oda hazırlanamadı.',503);}
   return kind==='quick'?this.state(userId,id):this.view(room,userId);
 }
 async ready(userId:string,id:string,expectedRound?:unknown){return this.mutate(userId,id,(room,p)=>{
   this.fence(room,expectedRound);if(p.left)throw new GameError('Bu maçtan ayrıldın.',409);
   if(room.phase==='active'&&p.ready)return;
   if(room.phase!=='ready')throw new GameError('Başka bir oyuncu bekleniyor.',409);p.ready=true;p.seen=this.clock();
   if(!room.mode&&room.players.length===2&&room.players.every(x=>x.ready)){room.phase='active';room.starts=this.clock()+4000;room.ends=room.starts+120000;}
 });}
 async start(userId:string,id:string,expectedRound:unknown){return this.mutate(userId,id,(room,p)=>{
   this.fence(room,expectedRound);if(p.left||room.players.find(x=>!x.left)?.id!==userId)throw new GameError('Maçı oda sahibi başlatabilir.',403);
   if(room.phase==='active')return;
   if(room.mode!=='group'||room.phase!=='ready'||room.players.filter(p=>!p.left).length<2||!room.players.every(p=>p.left||p.ready))throw new GameError('Başlamak için en az iki oyuncu ve herkesin hazır olması gerekir.',409);
   room.players=room.players.filter(p=>!p.left);room.phase='active';room.starts=this.clock()+4000;room.ends=room.starts+120000;
 });}
 async claim(userId:string,id:string,a:unknown,b:unknown,expectedRound?:unknown){return this.mutate(userId,id,(room,p)=>{
   this.fence(room,expectedRound);const now=this.clock();if(p.left||room.phase!=='active'||room.starts===null||room.ends===null||now<room.starts||now>=room.ends)throw new GameError('Bu maçta seçim süresi açık değil.',409);
   const board=roomPuzzle(room);const target=match(board,a,b);if(!target)throw new GameError('Bu seçim listedeki bir kelimeyi oluşturmuyor.');
   if(p.strokes.some(s=>s.id===target.id))return;
   p.strokes.push({id:target.id,a:a as Cell,b:b as Cell});p.score+=pointsFor(target,goldenId(board.targets,room.starts,now)===target.id);p.seen=now;p.lastFind=now;
   if(p.strokes.length===board.targets.length){room.phase='finished';room.winner=p.id;room.reason='Tüm kelimeler bulundu';room.ends=now;}
 });}
 async leave(userId:string,id:string,expectedRound?:unknown){
   await this.mutate(userId,id,(room,p)=>{this.fence(room,expectedRound);if(p.left)return;p.left=true;
    if(room.phase==='active'){const remaining=room.players.filter(x=>!x.left);if(!room.mode||remaining.length<=1){room.phase='finished';room.winner=remaining[0]?.id??null;room.reason='Diğer oyuncular ayrıldı';room.ends=this.clock();}}
    else if(room.phase==='waiting'||room.phase==='ready'){const remaining=room.players.filter(x=>!x.left);if(!room.mode||!remaining.length){room.phase='cancelled';room.reason='Oyuncular ayrıldı';}else room.phase=remaining.length>1?'ready':'waiting';}
   },false,false);return {ok:true};
 }
 /** New clients transition once per completed round. The same room/code survives. */
 async nextGame(userId:string,id:string,expectedRound:unknown){
   return this.mutate(userId,id,(room,p)=>{
    if(!Number.isSafeInteger(expectedRound)||Number(expectedRound)<1)throw new GameError('Maç numarası gerekli.',400);
    if(p.left)throw new GameError('Bu odadan ayrıldın.',409);
    if(room.round>Number(expectedRound))return;
    this.fence(room,expectedRound);if(room.phase!=='finished')throw new GameError('Maç henüz bitmedi.',409);
    room.lastResult={round:room.round,winner:room.winner,reason:room.reason,players:this.view(room,userId).players!};
    room.protocol=2;room.round++;room.starts=null;room.ends=null;room.winner=null;room.reason='';delete room.puzzle;delete room.contentOrdinal;delete room.ranks;
    room.players=room.players.filter(x=>!x.left).map(x=>player(x.id,x.name,this.clock()));room.phase=room.players.length>1?'ready':'waiting';
   });
 }
 async rematch(userId:string,id:string,expectedRound?:unknown){
   const active=await this.q('SELECT COUNT(*) AS count FROM members WHERE room_id=? AND active=1',id).first<{count:number}>();
   if(active?.count!==2)throw new GameError('Rakibin odadan ayrıldı. Yeni bir düello başlatabilirsin.',409);
   return this.mutate(userId,id,(room,p)=>{
    this.fence(room,expectedRound);if(room.players.some(x=>x.left))throw new GameError('Bir oyuncu odadan ayrıldı. Yeni bir oda açabilirsin.',409);if(room.mode)throw new GameError('Güncel Yeni oyun oyna eylemini kullan.',409);
    if(room.phase!=='finished')throw new GameError('Düello henüz bitmedi.',409);p.rematch=true;p.seen=this.clock();
    if(room.players.every(x=>x.rematch)){room.lastResult={round:room.round,winner:room.winner,reason:room.reason,players:this.view(room,userId).players!};room.protocol=2;room.round++;room.seed=hash(crypto.randomUUID());room.starts=null;room.ends=null;room.winner=null;room.reason='';room.phase='ready';delete room.puzzle;delete room.contentOrdinal;delete room.ranks;room.players=room.players.map(x=>player(x.id,x.name,this.clock()));}
   });
 }
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
     if(this.clock()-d.starts>86400000){
       // Fence out a pre-expiry writer before declaring its unknown operation closed.
       const fenced=await this.q('UPDATE dailies SET revision=revision+1 WHERE id=? AND revision=?',id,row.revision).run();
       if(fenced.meta.changes)throw new GameError('Bu günlük oyunun süresi doldu. Yeni güne geçebilirsin.',409,'DAILY_EXPIRED');
       continue;
     }
     const spec=dailySpec(d.day),board=makePuzzle(spec.themeId,spec.level,spec.seed);let hintCell:Cell|null=null;
     if(hint){if(d.hints>=3)throw new GameError('Üç ipucunu da kullandın.',400,'DAILY_HINT_LIMIT');const remaining=board.placements.find(t=>!d.strokes.some(s=>s.id===t.id));if(remaining){d.hints++;hintCell=remaining.a;if(typeof requestId==='string')d.hintReceipts=[...(d.hintReceipts??[]),{id:requestId,cell:hintCell}].slice(-3);}}
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
