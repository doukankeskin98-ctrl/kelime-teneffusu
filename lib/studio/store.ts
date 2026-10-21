import {type Database,type Statement} from '../game/server.ts';
import {digest} from '../game/security.ts';
import {cleanSave,type SavedLevel} from '../game/progress.ts';
import {keepBestSave} from '../game/discovery.ts';
import {istanbulDay,type Puzzle} from '../game/engine.ts';
import {THEMES} from '../game/catalog.ts';
import {ALL_JOURNEYS,MYSTERIES} from '../game/content.ts';
import {checkChapter,validChapterId,StudioError,type AdminChapter,type ChapterSpec,type PublishedChapter,type PlayableChapter} from './content.ts';
import {HEALTH_AREAS} from './health.ts';
import {releasedChapter,reservedReleaseId,releaseCatalogue} from './releases.ts';

interface ChapterRow {id:string;status:AdminChapter['status'];spec:string;board:string;content_hash:string;revision:number;created:number;updated:number;published:number|null;starts?:number;completions?:number}
export interface AdminSetup {hash?:string;expiresAt?:string}
export interface AdminSession {signedIn:boolean;authorized:boolean;setupAvailable:boolean;email:string}
export interface AdminOverview {now:number;profiles:number;newProfiles:number;finishedDuels:number;duelPlayers:number;finishedDailies:number;extraCompletions:number;published:number;drafts:number;archived:number;unreviewedFaults:number;fixedLevels:number;trend:{day:string;duels:number;dailies:number;extras:number}[]}
export interface OperationalFault {day:string;area:string;code:string;count:number;reviewed_count:number;first_seen:number;last_seen:number}
export interface AuditEntry {id:string;actor_id:string;action:string;entity_id:string;summary:string;created:number}
export function nativeAdminIdentity(request:Request):string|null{
 const id=request.headers.get('oai-authenticated-user-id');return id&&id.length<=256&&id===id.trim()&&!/[\u0000-\u001f\u007f]/u.test(id)?id:null;
}
const rowPublic=(r:ChapterRow):PublishedChapter=>({id:r.id,spec:JSON.parse(r.spec) as ChapterSpec,contentHash:r.content_hash,publishedAt:r.published??0});
const rowPlayable=(r:ChapterRow):PlayableChapter=>({...rowPublic(r),board:JSON.parse(r.board) as Puzzle,archived:r.status==='archived'});
const rowAdmin=(r:ChapterRow):AdminChapter=>({...rowPlayable(r),status:r.status,revision:r.revision,created:r.created,updated:r.updated,starts:r.starts??0,completions:r.completions??0});
const searchText=(s:ChapterSpec)=>(s.title+' '+s.themeId+' '+s.words.join(' ')).toLocaleLowerCase('tr-TR');
function revision(value:unknown){if(typeof value!=='number'||!Number.isInteger(value)||value<1)throw new StudioError('Bölüm sürümü doğrulanamadı. Sayfayı yenile.');return value;}
function offsetValue(raw:unknown){return typeof raw==='number'&&Number.isInteger(raw)&&raw>=0&&raw<=20000?raw:0;}
function firstDay(now:number,length:number){const day=new Date(istanbulDay(now)+'T12:00:00Z');day.setUTCDate(day.getUTCDate()-length+1);return day.toISOString().slice(0,10);}

export class ChapterStore {
 constructor(protected db:Database,protected clock:()=>number=Date.now){}
 protected q(sql:string,...args:unknown[]){return this.db.prepare(sql).bind(...args);}
 protected async row(id:unknown){if(!validChapterId(id))throw new StudioError('Bölüm bulunamadı.',404);const row=await this.q('SELECT * FROM studio_chapters WHERE id=?',id).first<ChapterRow>();if(!row)throw new StudioError('Bölüm bulunamadı.',404);return row;}
 async catalogue(offset=0){const start=offsetValue(offset),limit=24,rows=await this.q("SELECT id,spec,content_hash,published,status FROM studio_chapters WHERE status='published' ORDER BY published DESC,id DESC LIMIT ? OFFSET ?",limit+1,start).all<ChapterRow>();const total=await this.q("SELECT COUNT(*) AS count FROM studio_chapters WHERE status='published'").first<{count:number}>();return {chapters:rows.results.slice(0,limit).map(rowPublic),nextOffset:rows.results.length>limit?start+limit:null,total:total?.count??0};}
 async playable(id:unknown){const released=releasedChapter(id,this.clock());if(released)return released;const row=await this.row(id);if(row.published===null||row.status==='draft')throw new StudioError('Bölüm bulunamadı.',404);return rowPlayable(row);}
 async progress(userId:string,id:unknown){const chapter=await this.playable(id),row=await this.q('SELECT data,revision FROM chapter_saves WHERE user_id=? AND chapter_id=?',userId,chapter.id).first<{data:string;revision:number}>();return {save:cleanSave(row?JSON.parse(row.data) as SavedLevel:undefined,chapter.board),revision:row?.revision??0};}
 async saveProgress(userId:string,id:unknown,raw:unknown){
  const chapter=await this.playable(id),incoming=cleanSave(raw as SavedLevel,chapter.board);
  for(let attempt=0;attempt<6;attempt++){
   const row=await this.q('SELECT data,revision,completed_at FROM chapter_saves WHERE user_id=? AND chapter_id=?',userId,chapter.id).first<{data:string;revision:number;completed_at:number|null}>();
   const current=row?cleanSave(JSON.parse(row.data) as SavedLevel,chapter.board):undefined;
   const save=current?.complete||incoming.complete?keepBestSave(current,incoming):cleanSave({strokes:[...(current?.strokes??[]),...incoming.strokes.filter(s=>!current?.strokes.some(c=>c.id===s.id))],elapsed:Math.max(current?.elapsed??0,incoming.elapsed),hints:Math.max(current?.hints??0,incoming.hints),complete:false,stars:0},chapter.board);
   const now=this.clock(),completedAt=row?.completed_at??(save.complete?now:null);
   const result=row?await this.q('UPDATE chapter_saves SET data=?,revision=revision+1,complete=?,updated=?,completed_at=? WHERE user_id=? AND chapter_id=? AND revision=?',JSON.stringify(save),save.complete?1:0,now,completedAt,userId,chapter.id,row.revision).run():await this.q('INSERT OR IGNORE INTO chapter_saves(user_id,chapter_id,data,revision,complete,created,updated,completed_at) VALUES(?,?,?,1,?,?,?,?)',userId,chapter.id,JSON.stringify(save),save.complete?1:0,now,now,completedAt).run();
   if(result.meta.changes)return {save,revision:(row?.revision??0)+1};
  }
  throw new StudioError('Başka bir cihazdaki ilerlemen eşitleniyor. Yeniden dene.',409);
 }
}

export class AdminStore extends ChapterStore {
 constructor(db:Database,private setup:AdminSetup={},clock:()=>number=Date.now){super(db,clock);}
 private async owner(){return this.q("SELECT user_id FROM admin_owners WHERE slot='owner'").first<{user_id:string}>();}
 private setupValid(){return !!this.setup.hash&&/^[a-f0-9]{64}$/.test(this.setup.hash)&&Number.isFinite(Number(this.setup.expiresAt))&&Number(this.setup.expiresAt)>this.clock();}
 async session(userId:string|null,email=''):Promise<AdminSession>{const owner=await this.owner();return {signedIn:!!userId,authorized:!!userId&&owner?.user_id===userId,setupAvailable:!owner&&this.setupValid(),email:userId?email:''};}
 async authorize(userId:string|null):Promise<string>{if(!userId)throw new StudioError('Yönetim için ChatGPT hesabınla giriş yap.',401);if((await this.owner())?.user_id!==userId)throw new StudioError('Bu hesabın yönetim yetkisi yok.',403);return userId;}
 async claim(userId:string|null,token:unknown){
  if(!userId)throw new StudioError('Önce ChatGPT hesabınla giriş yap.',401);
  const owner=await this.owner();if(owner){if(owner.user_id===userId)return this.session(userId);throw new StudioError('Yönetici hesabı zaten bağlanmış.',409);}
  if(!this.setupValid()||typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||await digest('kelime-admin-setup-v1:'+token)!==this.setup.hash)throw new StudioError('Kurulum bağlantısı geçersiz veya süresi dolmuş.',403);
  const op=crypto.randomUUID(),now=this.clock();
  const result=await this.db.batch([
   this.q("INSERT OR IGNORE INTO admin_owners(slot,user_id,created,claim_operation) VALUES('owner',?,?,?)",userId,now,op),
   this.q("INSERT INTO admin_audit(id,actor_id,action,entity_id,summary,created) SELECT ?,?,'owner_claimed','owner',?,? WHERE EXISTS(SELECT 1 FROM admin_owners WHERE slot='owner' AND claim_operation=?)",op,userId,'Yönetici hesabı tek kullanımlık bağlantıyla bağlandı.',now,op),
  ]);
  if(!result[0]?.meta.changes)throw new StudioError('Yönetici başka bir oturumda bağlandı. Sayfayı yenile.',409);
  return this.session(userId);
 }
 private auditChapter(actor:string,action:string,id:string,summary:string,op:string):Statement{return this.q('INSERT INTO admin_audit(id,actor_id,action,entity_id,summary,created) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM studio_chapters WHERE id=? AND last_operation=?)',op,actor,action,id,summary,this.clock(),id,op);}
 async preview(actor:string|null,raw:unknown){await this.authorize(actor);const checked=checkChapter(raw);return {...checked,contentHash:await digest(JSON.stringify(checked.spec))};}
 async chapters(actor:string|null,filter='all',query='',offset=0){
  await this.authorize(actor);const state=['draft','published','archived'].includes(filter)?filter:'all',start=offsetValue(offset),needle=query.slice(0,60).normalize('NFC').toLocaleLowerCase('tr-TR').replace(/[\\%_]/g,'\\$&'),params=[state,state,'%'+needle+'%'];
  const where="(?='all' OR c.status=?) AND c.search_text LIKE ? ESCAPE '\\'";
  const rows=await this.q(`SELECT c.*,(SELECT COUNT(*) FROM chapter_saves s WHERE s.chapter_id=c.id AND json_array_length(json_extract(s.data,'$.strokes'))>0) AS starts,(SELECT COUNT(*) FROM chapter_saves s WHERE s.chapter_id=c.id AND s.complete=1) AS completions FROM studio_chapters c WHERE ${where} ORDER BY c.updated DESC,c.id DESC LIMIT 25 OFFSET ?`,...params,start).all<ChapterRow>();
  const count=await this.q(`SELECT COUNT(*) AS count FROM studio_chapters c WHERE ${where}`,...params).first<{count:number}>();
  return {chapters:rows.results.map(r=>{const {board:_board,...item}=rowAdmin(r);return item;}),total:count?.count??0,nextOffset:start+25<(count?.count??0)?start+25:null};
 }
 async chapter(actor:string|null,id:unknown){await this.authorize(actor);return rowAdmin(await this.row(id));}
 async saveDraft(actor:string|null,raw:unknown,id?:unknown,expected?:unknown,creationId?:unknown){
  if(reservedReleaseId(id)||reservedReleaseId(creationId)){await this.authorize(actor);throw new StudioError('Kaynakta yayımlanan bu bölüm değişmez. Yeni bir taslak kimliği kullan.',409);}
  const userId=await this.authorize(actor),checked=checkChapter(raw),spec=JSON.stringify(checked.spec),board=JSON.stringify(checked.board),contentHash=await digest(spec),now=this.clock(),op=crypto.randomUUID();
  if(id!==undefined){const old=await this.row(id);revision(expected);if(old.status!=='draft'||old.published!==null)throw new StudioError('Yayımlanan tahtalar değişmez. Yeni bir taslak olarak kopyalayabilirsin.',409);
   const result=await this.db.batch([this.q("UPDATE studio_chapters SET spec=?,board=?,content_hash=?,search_text=?,revision=revision+1,updated=?,last_operation=? WHERE id=? AND revision=? AND status='draft' AND published IS NULL",spec,board,contentHash,searchText(checked.spec),now,op,old.id,expected),this.auditChapter(userId,'draft_saved',old.id,checked.spec.title+' taslağı kaydedildi.',op)]);
   if(!result[0]?.meta.changes)throw new StudioError('Taslak başka bir sekmede değişti. Son sürümü yeniden aç.',409);return rowAdmin(await this.row(old.id));
  }
  if(creationId!==undefined&&!validChapterId(creationId))throw new StudioError('Taslak kimliği doğrulanamadı. Sayfayı yenile.');
  const chapterId=creationId as string|undefined??crypto.randomUUID(),result=await this.db.batch([this.q("INSERT OR IGNORE INTO studio_chapters(id,status,spec,board,content_hash,search_text,revision,created,updated,published,last_operation) VALUES(?,'draft',?,?,?,?,1,?,?,NULL,?)",chapterId,spec,board,contentHash,searchText(checked.spec),now,now,op),this.auditChapter(userId,'draft_created',chapterId,checked.spec.title+' taslağı oluşturuldu.',op)]);
  const created=await this.row(chapterId);if(!result[0]?.meta.changes&&(created.status!=='draft'||created.content_hash!==contentHash))throw new StudioError('Bu taslak başka bir istekle kaydedildi. Bölüm rafından son sürümü aç.',409);return rowAdmin(created);
 }
 async transition(actor:string|null,id:unknown,action:unknown,expected:unknown,confirmation:unknown){
  const userId=await this.authorize(actor),old=await this.row(id),spec=JSON.parse(old.spec) as ChapterSpec;revision(expected);
  if(confirmation!==spec.title)throw new StudioError('İşlemi onaylamak için bölüm adını aynen yaz.');
  const next=action==='publish'&&old.status==='draft'&&old.published===null?'published':action==='archive'&&old.status==='published'?'archived':action==='restore'&&old.status==='archived'?'published':null;
  if(!next)throw new StudioError('Bölümün durumu değişti. Son sürümü yeniden aç.',409);
  if(action==='publish'){const checked=checkChapter(spec);if(JSON.stringify(checked.board)!==old.board||await digest(JSON.stringify(checked.spec))!==old.content_hash)throw new StudioError('Kayıtlı tahta doğrulanamadı. Taslağı yeniden kaydet.',409);}
  const now=this.clock(),op=crypto.randomUUID(),message=spec.title+(action==='publish'?' oyuna yayımlandı.':action==='archive'?' yeni keşiflerden arşive taşındı.':' yeniden görünür yapıldı.');
  const result=await this.db.batch([this.q('UPDATE studio_chapters SET status=?,revision=revision+1,updated=?,published=COALESCE(published,?),last_operation=? WHERE id=? AND revision=? AND status=?',next,now,now,op,old.id,expected,old.status),this.auditChapter(userId,String(action),old.id,message,op)]);
  if(!result[0]?.meta.changes)throw new StudioError('Bölüm başka bir sekmede değişti. Son sürümü yeniden aç.',409);return rowAdmin(await this.row(old.id));
 }
 private async count(sql:string,...args:unknown[]){return (await this.q(sql,...args).first<{count:number}>())?.count??0;}
 async overview(actor:string|null):Promise<AdminOverview>{
  await this.authorize(actor);const now=this.clock(),since=now-86400000,start=firstDay(now,7);
  const [profiles,newProfiles,finishedDuels,duelPlayers,finishedDailies,extraCompletions,published,drafts,archived,unreviewedFaults,duelTrend,dailyTrend,extraTrend]=await Promise.all([
   this.count('SELECT COUNT(*) count FROM players'),this.count('SELECT COUNT(*) count FROM players WHERE created>=?',since),this.count('SELECT COUNT(DISTINCT room_id) count FROM results WHERE created>=?',since),this.count('SELECT COUNT(DISTINCT user_id) count FROM results WHERE created>=?',since),this.count('SELECT COUNT(*) count FROM dailies WHERE completed=1 AND day=?',istanbulDay(now)),this.count('SELECT COUNT(*) count FROM chapter_saves WHERE complete=1'),this.count("SELECT COUNT(*) count FROM studio_chapters WHERE status='published'"),this.count("SELECT COUNT(*) count FROM studio_chapters WHERE status='draft'"),this.count("SELECT COUNT(*) count FROM studio_chapters WHERE status='archived'"),this.count('SELECT COALESCE(SUM(MAX(0,count-reviewed_count)),0) count FROM operational_faults WHERE day>=?',start),
   this.q("SELECT strftime('%Y-%m-%d',created/1000,'unixepoch','+3 hours') day,COUNT(DISTINCT room_id) count FROM results WHERE created>=? GROUP BY day",Date.parse(start+'T00:00:00+03:00')).all<{day:string;count:number}>(),this.q('SELECT day,COUNT(*) count FROM dailies WHERE completed=1 AND day>=? GROUP BY day',start).all<{day:string;count:number}>(),this.q("SELECT strftime('%Y-%m-%d',completed_at/1000,'unixepoch','+3 hours') day,COUNT(*) count FROM chapter_saves WHERE completed_at>=? GROUP BY day",Date.parse(start+'T00:00:00+03:00')).all<{day:string;count:number}>(),
  ]);
  const trend=Array.from({length:7},(_,i)=>{const d=new Date(start+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);const day=d.toISOString().slice(0,10);return {day,duels:duelTrend.results.find(r=>r.day===day)?.count??0,dailies:dailyTrend.results.find(r=>r.day===day)?.count??0,extras:extraTrend.results.find(r=>r.day===day)?.count??0};});
  return {now,profiles,newProfiles,finishedDuels,duelPlayers,finishedDailies,extraCompletions,published,drafts,archived,unreviewedFaults,fixedLevels:THEMES.length*6+ALL_JOURNEYS.length+MYSTERIES.length+releaseCatalogue(0,now).total,trend};
 }
 async metrics(actor:string|null,days=7){await this.authorize(actor);const length=days===30?30:7;return {days:length,from:firstDay(this.clock(),length),to:istanbulDay(this.clock()),rows:(await this.q('SELECT day,event,bucket,count FROM metrics WHERE day>=? AND day<=? ORDER BY day,event,bucket',firstDay(this.clock(),length),istanbulDay(this.clock())).all<{day:string;event:string;bucket:string;count:number}>()).results};}
 async faults(actor:string|null){await this.authorize(actor);return {rows:(await this.q('SELECT day,area,code,count,reviewed_count,first_seen,last_seen FROM operational_faults WHERE day>=? ORDER BY last_seen DESC LIMIT 100',firstDay(this.clock(),30)).all<OperationalFault>()).results};}
 async reviewFault(actor:string|null,day:unknown,area:unknown,code:unknown){
  const userId=await this.authorize(actor);if(typeof day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(day)||typeof area!=='string'||!HEALTH_AREAS.includes(area as typeof HEALTH_AREAS[number])||code!=='unexpected_server_error')throw new StudioError('Hata kaydı bulunamadı.',404);
  const op=crypto.randomUUID(),entity=day+':'+area,result=await this.db.batch([this.q('UPDATE operational_faults SET reviewed_count=count,last_operation=? WHERE day=? AND area=? AND code=? AND reviewed_count<count',op,day,area,code),this.q('INSERT INTO admin_audit(id,actor_id,action,entity_id,summary,created) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM operational_faults WHERE day=? AND area=? AND code=? AND last_operation=?)',op,userId,'fault_reviewed',entity,area+' hata sayımları incelendi.',this.clock(),day,area,code,op)]);
  if(!result[0]?.meta.changes)throw new StudioError('Bu kayıt zaten incelenmiş veya bulunamadı.',409);return {ok:true};
 }
 async audit(actor:string|null){await this.authorize(actor);return {rows:(await this.q('SELECT id,actor_id,action,entity_id,summary,created FROM admin_audit ORDER BY created DESC,id DESC LIMIT 50').all<AuditEntry>()).results};}
}
