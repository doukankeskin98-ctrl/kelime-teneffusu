import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {roomPuzzle,GameService,type Database,type Statement,type Room} from '../lib/game/server.ts';
import {makePuzzle} from '../lib/game/engine.ts';
export function fixture(initial=Date.parse('2026-10-21T09:00:00Z')){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 class Stmt implements Statement {
  constructor(private sql:string,private args:unknown[]=[]){}
  bind(...args:unknown[]){return new Stmt(this.sql,args);}
  async first<T>(){return (sqlite.prepare(this.sql).get(...this.args as SQLInputValue[])??null) as T|null;}
  async all<T>(){return {results:sqlite.prepare(this.sql).all(...this.args as SQLInputValue[]) as T[]};}
  sync(){return {meta:{changes:Number(sqlite.prepare(this.sql).run(...this.args as SQLInputValue[]).changes)}};}
  async run(){return this.sync();}
 }
 const db:Database={prepare:sql=>new Stmt(sql),batch:async statements=>{sqlite.exec('BEGIN');try{const results=statements.map(s=>(s as Stmt).sync());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 let now=initial;const clock=()=>now,game=new GameService(db,clock);
 return {db,sqlite,clock,game,advance:(ms:number)=>{now+=ms;},setTime:(ms:number)=>{now=ms;},room:(id:string)=>JSON.parse((sqlite.prepare('SELECT data FROM rooms WHERE id=?').get(id) as {data:string}).data) as Room,puzzle:(id:string)=>{const r=JSON.parse((sqlite.prepare('SELECT data FROM rooms WHERE id=?').get(id) as {data:string}).data) as Room;return roomPuzzle(r);}};
}
