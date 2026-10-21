import type {Puzzle} from '../game/engine.ts';
import {cleanSave,type SavedLevel} from '../game/progress.ts';
import {keepBestSave} from '../game/discovery.ts';

export function mergeChapterSave(a:SavedLevel|undefined,b:SavedLevel,board:Puzzle){
 const current=a?cleanSave(a,board):undefined,incoming=cleanSave(b,board);
 if(current?.complete||incoming.complete)return keepBestSave(current,incoming);
 return cleanSave({strokes:[...(current?.strokes??[]),...incoming.strokes.filter(s=>!current?.strokes.some(c=>c.id===s.id))],elapsed:Math.max(current?.elapsed??0,incoming.elapsed),hints:Math.max(current?.hints??0,incoming.hints),complete:false,stars:0},board);
}
/** A cloud response only acknowledges the words it actually contains. */
export function chapterSyncResult(current:SavedLevel|undefined,response:SavedLevel,board:Puzzle){
 const remote=cleanSave(response,board),save=mergeChapterSave(current,remote,board);
 return {save,pending:JSON.stringify(save)!==JSON.stringify(remote)};
}
