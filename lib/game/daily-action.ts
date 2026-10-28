import {match,type Cell,type Stroke} from './engine.ts';
import type {DailyView} from './server.ts';
export type DailyReply=DailyView&{hintCell?:Cell|null};
export type DailyIntent={kind:'claim';stroke:Stroke;label:string}|{kind:'hint';requestId:string};
export type DailyActionPhase='idle'|'sending'|'checking'|'uncertain'|'account-changed'|'unavailable';
export interface DailyActionState {phase:DailyActionPhase;intent:DailyIntent|null;message?:string}
export class DailyRequestError extends Error {constructor(message:string,public status:number,public code?:string){super(message);}}
export const DAILY_REQUEST_TIMEOUT=8000;
interface Options {
 id:string;day:string;board:DailyView['board'];isCurrent:()=>boolean;
 request:(intent:DailyIntent|null,signal:AbortSignal)=>Promise<DailyReply>;
 receive:(reply:DailyReply)=>void;state:(state:DailyActionState)=>void;
 confirmed:(intent:DailyIntent,reply:DailyReply)=>void;
}
/** One owner and one existing daily attempt. An uncertain hint keeps its original key. */
export class DailyActionSession {
 private stopped=false;private halted=false;private running=false;private flight:AbortController|null=null;
 private pending:{intent:DailyIntent;rejected:boolean;uncertainMutation:boolean}|null=null;
 constructor(private options:Options){}
 private active(){return !this.stopped&&this.options.isCurrent();}
 private report(phase:DailyActionPhase,message?:string){if(this.active())this.options.state({phase,intent:this.pending?.intent??null,...(message?{message}:{})});}
 private async attempt(intent:DailyIntent|null){
  if(!this.active())return null;
  const controller=new AbortController();this.flight=controller;
  let timer:ReturnType<typeof setTimeout>|undefined,onAbort=()=>{};
  const deadline=new Promise<never>((_yes,no)=>{
   onAbort=()=>no(new Error('Sunucu onayı zamanında alınamadı.'));
   controller.signal.addEventListener('abort',onAbort,{once:true});timer=setTimeout(()=>controller.abort(),DAILY_REQUEST_TIMEOUT);
  });
  try{
   const reply=await Promise.race([this.options.request(intent,controller.signal),deadline]);
   if(controller.signal.aborted)throw new Error('Günlük isteği iptal edildi.');
   if(!this.active())return null;
   const validCell=(cell:unknown):cell is Cell=>Array.isArray(cell)&&cell.length===2&&cell.every(n=>Number.isInteger(n)&&n>=0&&n<this.options.board.size);
   const sameBoard=reply&&JSON.stringify([reply.board?.size,reply.board?.grid,reply.board?.targets])===JSON.stringify([this.options.board.size,this.options.board.grid,this.options.board.targets]);
   if(!reply||reply.id!==this.options.id||reply.day!==this.options.day||!sameBoard||!Array.isArray(reply.strokes)||reply.strokes.length>this.options.board.targets.length||!reply.strokes.every(s=>s&&typeof s.id==='string'&&match(this.options.board,s.a,s.b)?.id===s.id)||new Set(reply.strokes.map(s=>s.id)).size!==reply.strokes.length||!Number.isInteger(reply.hints)||reply.hints<0||reply.hints>3||!Number.isFinite(reply.serverNow)||!Number.isFinite(reply.starts)||reply.starts<0||!Number.isFinite(reply.duration)||reply.duration<0||!(reply.finished===null||typeof reply.finished==='number'&&Number.isFinite(reply.finished)&&reply.finished>=0)||(reply.finished!==null)!==(reply.strokes.length===this.options.board.targets.length)||(reply.hintCell!==undefined&&reply.hintCell!==null&&!validCell(reply.hintCell))||(intent?.kind==='hint'&&reply.finished===null&&!validCell(reply.hintCell)))throw new DailyRequestError('Beklenen günlük kaydı doğrulanamadı.',404);
   return reply;
  }finally{clearTimeout(timer);controller.signal.removeEventListener('abort',onAbort);if(this.flight===controller)this.flight=null;}
 }
 async act(intent:DailyIntent){
  if(!this.active()||this.halted||this.running||this.pending)return;
  this.pending={intent,rejected:false,uncertainMutation:false};await this.perform(false);
 }
 async retry(){if(!this.active()||this.halted||this.running||!this.pending)return;await this.perform(true);}
 private async perform(check:boolean){
  const pending=this.pending;if(!pending)return;const intent=pending.intent;this.running=true;let mutationAttempted=false;
  try{
   if(check){
    this.report('checking');const current=await this.attempt(null);if(!current||!this.active())return;
    this.options.receive(current);
    const found=intent.kind==='claim'&&current.strokes.some(s=>s.id===intent.stroke.id);
    if(pending.rejected||current.finished!==null||found){
     this.pending=null;this.report('idle');
     if(!pending.rejected&&found&&this.active())this.options.confirmed(intent,current);
     return;
    }
   }
   this.report('sending');mutationAttempted=true;const reply=await this.attempt(pending.intent);if(!reply||!this.active())return;
   if(intent.kind==='claim'&&!reply.strokes.some(s=>s.id===intent.stroke.id))throw new DailyRequestError('Kelime onayı doğrulanamadı.',503);
   this.options.receive(reply);this.pending=null;this.report('idle');if(this.active())this.options.confirmed(pending.intent,reply);
  }catch(e){
   if(!this.active())return;
   const error=e instanceof Error?e.message:'Günlük kaydına ulaşılamadı.';
   if(e instanceof DailyRequestError&&(e.code==='DAILY_OWNER_CHANGED'||e.status===401||e.status===403)){this.report('account-changed',error);this.halted=true;}
   else if(e instanceof DailyRequestError&&e.status===404){this.report('unavailable',error);this.halted=true;}
   else{
    // A retry's rejection cannot disprove a still-running, earlier mutation.
    if(mutationAttempted){const rejected=e instanceof DailyRequestError&&[400,409,429].includes(e.status);if(rejected&&!pending.uncertainMutation)pending.rejected=true;else if(!rejected)pending.uncertainMutation=true;}
    this.report('uncertain',error);
   }
  }finally{this.running=false;}
 }
 dispose(){this.stopped=true;this.flight?.abort();}
}
