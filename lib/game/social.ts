import {THEMES} from './catalog.ts';
import {hash,makePuzzle,match,type Cell,type Puzzle,type Stroke} from './engine.ts';
import {GameError,GameService,publicBoard,type Database} from './server.ts';
import {randomCode} from './security.ts';

interface ChallengeRow {id:string;code:string;creator_id:string;theme_id:string;level:number;seed:number;created:number;expires:number}
interface Run {starts:number;strokes:Stroke[];timeline:number[];finished:number|null;duration:number}
interface RunRow {id:string;data:string;revision:number}
export interface ChallengeView {
 id:string;code:string;themeId:string;creator:boolean;serverNow:number;starts:number;finished:number|null;duration:number;
 strokes:Stroke[];board:Omit<Puzzle,'placements'>;expires:number;
 ghost:{nickname:string;timeline:number[];duration:number}|null;
 results:{nickname:string;duration:number}[];
}
export interface SocialOverview {
 friends:{id:string;nickname:string;rating:number}[];
 weekly:{nickname:string;played:number;wins:number;score:number;you:boolean}[];
 history:{roomId:string;nickname:string;score:number;win:number;created:number;opponent:string|null;opponentScore:number|null;opponentWin:number|null}[];
 challenges:{code:string;themeId:string;finished:boolean;duration:number;created:number}[];
 rating:{value:number;played:number};
}
export class SocialService {
 constructor(private db:Database,private clock:()=>number=Date.now){}
 private q(sql:string,...args:unknown[]){return this.db.prepare(sql).bind(...args);}
 private async challenge(code:string){if(!/^[A-HJ-NP-Z2-9]{10}$/.test(code))throw new GameError('Meydan okuma kodu geçerli değil.');const row=await this.q('SELECT * FROM challenges WHERE code=?',code).first<ChallengeRow>();if(!row)throw new GameError('Bu meydan okuma bulunamadı.',404);return row;}
 async preview(code:string){const c=await this.challenge(code);if(c.expires<this.clock())throw new GameError('Bu davetin süresi doldu.',410);const creator=await this.q('SELECT nickname FROM players WHERE id=?',c.creator_id).first<{nickname:string}>();const finished=await this.q('SELECT finished FROM challenge_runs WHERE challenge_id=? AND user_id=?',c.id,c.creator_id).first<{finished:number}>();return {code:c.code,themeId:c.theme_id,nickname:creator?.nickname??'Bir kelime avcısı',ready:finished?.finished===1};}
 async create(userId:string,themeId:unknown){
  if(typeof themeId!=='string'||!THEMES.some(t=>t.id===themeId))throw new GameError('Bir tema seç.');
  await new GameService(this.db,this.clock).profile(userId);
  const recent=await this.q('SELECT COUNT(*) AS n FROM challenges WHERE creator_id=? AND created>?',userId,this.clock()-86400000).first<{n:number}>();
  if((recent?.n??0)>=20)throw new GameError('Bugün için yeterince meydan okuma hazırladın. Yarın yine bekleriz.',429);
  const code=randomCode(),id=crypto.randomUUID();
  await this.q('INSERT INTO challenges(id,code,creator_id,theme_id,level,seed,created,expires) VALUES(?,?,?,?,?,?,?,?)',id,code,userId,themeId,2,hash(crypto.randomUUID()),this.clock(),this.clock()+30*86400000).run();
  return this.start(userId,code);
 }
 async start(userId:string,code:string){
  const c=await this.challenge(code);if(c.expires<this.clock())throw new GameError('Bu davetin süresi doldu.',410);
  await new GameService(this.db,this.clock).profile(userId);
  const id=crypto.randomUUID(),run:Run={starts:this.clock(),strokes:[],timeline:[],finished:null,duration:0};
  await this.q('INSERT OR IGNORE INTO challenge_runs(id,challenge_id,user_id,data,created) VALUES(?,?,?,?,?)',id,c.id,userId,JSON.stringify(run),this.clock()).run();
  return this.state(userId,code);
 }
 async state(userId:string,code:string):Promise<ChallengeView>{
  const c=await this.challenge(code),row=await this.q('SELECT id,data,revision FROM challenge_runs WHERE challenge_id=? AND user_id=?',c.id,userId).first<RunRow>();
  if(!row)throw new GameError('Meydan okumayı önce başlat.',409);
  const run=JSON.parse(row.data) as Run;
  const ghostRow=await this.q('SELECT r.data,p.nickname FROM challenge_runs r JOIN players p ON p.id=r.user_id WHERE r.challenge_id=? AND r.finished=1 AND r.user_id<>? ORDER BY CASE WHEN r.user_id=? THEN 0 ELSE 1 END,r.duration LIMIT 1',c.id,userId,c.creator_id).first<{data:string;nickname:string}>();
  const ghost=ghostRow?JSON.parse(ghostRow.data) as Run:null;
  const results=(await this.q('SELECT p.nickname,r.duration FROM challenge_runs r JOIN players p ON p.id=r.user_id WHERE r.challenge_id=? AND r.finished=1 ORDER BY r.duration,r.created LIMIT 10',c.id).all<{nickname:string;duration:number}>()).results;
  return {id:row.id,code:c.code,themeId:c.theme_id,creator:c.creator_id===userId,serverNow:this.clock(),starts:run.starts,finished:run.finished,duration:run.duration,strokes:run.strokes,board:publicBoard(makePuzzle(c.theme_id,c.level,c.seed)),expires:c.expires,ghost:ghost&&ghostRow?{nickname:ghostRow.nickname,timeline:ghost.timeline,duration:ghost.duration}:null,results};
 }
 async claim(userId:string,code:string,a:unknown,b:unknown){
  const c=await this.challenge(code);if(c.expires<this.clock())throw new GameError('Bu meydan okumanın süresi doldu.',410);
  const board=makePuzzle(c.theme_id,c.level,c.seed),target=match(board,a,b);if(!target)throw new GameError('Bu seçim listedeki bir kelimeyi oluşturmuyor.');
  for(let attempt=0;attempt<8;attempt++){
   const row=await this.q('SELECT id,data,revision FROM challenge_runs WHERE challenge_id=? AND user_id=?',c.id,userId).first<RunRow>();if(!row)throw new GameError('Önce meydan okumayı başlat.',409);
   const run=JSON.parse(row.data) as Run;
   if(run.finished!==null||run.strokes.some(s=>s.id===target.id))return this.state(userId,code);
   run.strokes.push({id:target.id,a:a as Cell,b:b as Cell});run.timeline.push(Math.max(0,this.clock()-run.starts));
   if(run.strokes.length===board.targets.length){run.finished=this.clock();run.duration=Math.max(1,run.finished-run.starts);}
   const result=await this.q('UPDATE challenge_runs SET data=?,revision=revision+1,finished=?,duration=? WHERE id=? AND revision=?',JSON.stringify(run),run.finished!==null?1:0,run.duration,row.id,row.revision).run();
   if(result.meta.changes)return this.state(userId,code);
  }
  throw new GameError('Seçimin eşitleniyor. Yeniden dene.',409);
 }
 async invite(userId:string){
  await new GameService(this.db,this.clock).profile(userId);
  const existing=await this.q('SELECT code FROM friend_invites WHERE user_id=? AND expires>? ORDER BY created DESC LIMIT 1',userId,this.clock()).first<{code:string}>();if(existing)return existing;
  const code=randomCode();await this.q('INSERT INTO friend_invites(code,user_id,created,expires) VALUES(?,?,?,?)',code,userId,this.clock(),this.clock()+7*86400000).run();return {code};
 }
 async invitation(code:string){if(!/^[A-HJ-NP-Z2-9]{10}$/.test(code))throw new GameError('Arkadaş kodu geçerli değil.');const row=await this.q('SELECT i.user_id,p.nickname FROM friend_invites i JOIN players p ON p.id=i.user_id WHERE i.code=? AND i.expires>?',code,this.clock()).first<{user_id:string;nickname:string}>();if(!row)throw new GameError('Bu arkadaş daveti bulunamadı veya süresi doldu.',404);return row;}
 async accept(userId:string,code:string){
  const invite=await this.invitation(code);if(invite.user_id===userId)throw new GameError('Bu senin arkadaş davetin. Bağlantıyı arkadaşına gönder.');
  await new GameService(this.db,this.clock).profile(userId);
  for(const id of [userId,invite.user_id]){const count=await this.q('SELECT COUNT(*) AS n FROM friendships WHERE user_id=?',id).first<{n:number}>();if((count?.n??0)>=200)throw new GameError('Arkadaş listesinde yer kalmadı.');}
  await this.db.batch([
   this.q('INSERT OR IGNORE INTO friendships(user_id,friend_id,created) VALUES(?,?,?)',userId,invite.user_id,this.clock()),
   this.q('INSERT OR IGNORE INTO friendships(user_id,friend_id,created) VALUES(?,?,?)',invite.user_id,userId,this.clock()),
  ]);return {ok:true,nickname:invite.nickname};
 }
 async remove(userId:string,friendId:string){await this.db.batch([this.q('DELETE FROM friendships WHERE user_id=? AND friend_id=?',userId,friendId),this.q('DELETE FROM friendships WHERE user_id=? AND friend_id=?',friendId,userId)]);return {ok:true};}
 async overview(userId:string):Promise<SocialOverview>{
  const game=new GameService(this.db,this.clock);await game.profile(userId);
  const friends=(await this.q('SELECT p.id,p.nickname,COALESCE(e.value,1000) AS rating FROM friendships f JOIN players p ON p.id=f.friend_id LEFT JOIN ratings e ON e.user_id=p.id WHERE f.user_id=? ORDER BY p.nickname LIMIT 200',userId).all<{id:string;nickname:string;rating:number}>()).results;
  // Monday 00:00 in Istanbul, independent of the worker region.
  const local=new Date(this.clock()+3*3600000),weekday=(local.getUTCDay()+6)%7;
  const week=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()-weekday)-3*3600000;
  const weekly=(await this.q('SELECT p.id,p.nickname,COUNT(r.room_id) AS played,COALESCE(SUM(r.win),0) AS wins,COALESCE(SUM(r.score),0) AS score FROM players p LEFT JOIN results r ON r.user_id=p.id AND r.created>=? WHERE p.id=? OR p.id IN (SELECT friend_id FROM friendships WHERE user_id=?) GROUP BY p.id ORDER BY wins DESC,score DESC LIMIT 30',week,userId,userId).all<{id:string;nickname:string;played:number;wins:number;score:number}>()).results.map(({id,...p})=>({...p,you:id===userId}));
  const history=(await this.q('SELECT r.room_id AS roomId,r.nickname,r.score,r.win,r.created,o.nickname AS opponent,o.score AS opponentScore,o.win AS opponentWin FROM results r LEFT JOIN results o ON o.room_id=r.room_id AND o.user_id<>r.user_id WHERE r.user_id=? ORDER BY r.created DESC LIMIT 20',userId).all<SocialOverview['history'][number]>()).results;
  const challenges=(await this.q('SELECT c.code,c.theme_id AS themeId,r.finished,r.duration,r.created FROM challenge_runs r JOIN challenges c ON c.id=r.challenge_id WHERE r.user_id=? AND c.expires>? ORDER BY r.created DESC LIMIT 20',userId,this.clock()).all<{code:string;themeId:string;finished:number;duration:number;created:number}>()).results.map(c=>({...c,finished:c.finished===1}));
  return {friends,weekly,history,challenges,rating:await game.rating(userId)};
 }
}
