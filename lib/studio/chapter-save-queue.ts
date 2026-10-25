import type {Puzzle} from '../game/engine.ts';
import type {SavedLevel} from '../game/progress.ts';
import {chapterSyncResult,mergeChapterSave} from './chapter-progress.ts';

export type ChapterSaveStatus='local'|'offline'|'syncing'|'saved'|'storage-error';
type Options={
 board:Puzzle;save:SavedLevel;pending:boolean;
 canSend:()=>boolean;
 send:(save:SavedLevel,signal:AbortSignal)=>Promise<SavedLevel>;
 persist:(save:SavedLevel)=>{save:SavedLevel;ok:boolean};
 onStatus:(status:ChapterSaveStatus)=>void;
 onConfirmed?:(save:SavedLevel)=>void;
};
export const CHAPTER_SAVE_TIMEOUT=8000;

/** One chapter/owner lifetime. Detaching the UI can drain its last snapshot;
 * replacing the lifetime cancels it. Requests must also assert the owner on the server. */
export class ChapterSaveQueue{
 private current:SavedLevel;
 private pending:boolean;
 private observer:Options['onStatus']|null;
 private confirmedObserver:Options['onConfirmed']|null;
 private accepting=true;
 private cancelled=false;
 private flight:AbortController|null=null;
 private storageOK=true;
 constructor(private options:Options){
  this.current=options.save;this.pending=options.pending;this.observer=options.onStatus;
  this.confirmedObserver=options.onConfirmed??null;
 }
 get save(){return this.current;}
 get acknowledged(){return !this.pending&&!this.flight&&!this.cancelled;}
 private report(status:ChapterSaveStatus){this.observer?.(this.storageOK?status:'storage-error');}
 private persist(save:SavedLevel){
  const result=this.options.persist(save);this.current=result.save;this.storageOK=result.ok;
 }
 update(save:SavedLevel){
  if(!this.accepting||this.cancelled)return;
  const before=JSON.stringify(this.current);
  this.persist(mergeChapterSave(this.current,save,this.options.board));
  if(JSON.stringify(this.current)!==before)this.pending=true;
  if(!this.storageOK)this.report('storage-error');
  else this.report(this.pending?(this.flight?'syncing':this.options.canSend()?'local':'offline'):'saved');
 }
 detach(){this.accepting=false;this.observer=null;this.confirmedObserver=null;void this.flush();}
 cancel(){this.cancelled=true;this.accepting=false;this.observer=null;this.confirmedObserver=null;this.flight?.abort();}
 async flush(){
  if(this.cancelled||this.flight||!this.pending||!this.options.canSend())return;
  const controller=new AbortController(),sent=this.current;
  this.flight=controller;this.report('syncing');
  let timeout:ReturnType<typeof setTimeout>|undefined,success=false;
  let onAbort=()=>{};
  const deadline=new Promise<never>((_resolve,reject)=>{
   onAbort=()=>reject(new Error('Chapter save cancelled or timed out'));
   controller.signal.addEventListener('abort',onAbort,{once:true});
   timeout=setTimeout(()=>controller.abort(),CHAPTER_SAVE_TIMEOUT);
  });
  try{
   // The deadline also bounds token acquisition and response-body parsing.
   const remote=await Promise.race([this.options.send(sent,controller.signal),deadline]);
   if(this.cancelled||controller.signal.aborted)return;
   this.persist(chapterSyncResult(this.current,remote,this.options.board).save);
   this.pending=chapterSyncResult(this.current,remote,this.options.board).pending;
   success=true;this.confirmedObserver?.(this.current);this.report(this.pending?'local':'saved');
  }catch{
   if(!this.cancelled)this.report('offline');
  }finally{
   clearTimeout(timeout);controller.signal.removeEventListener('abort',onAbort);
   if(this.flight===controller)this.flight=null;
   // Drain a newer snapshot, even after an in-app back action. A failed or
   // unacknowledged identical snapshot waits for the next normal retry event.
   if(success&&this.pending&&JSON.stringify(this.current)!==JSON.stringify(sent)&&!this.cancelled)
    void this.flush();
  }
 }
}
