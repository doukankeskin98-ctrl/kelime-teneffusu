import {writeFileSync} from 'node:fs';
import {MAIN_JOURNEY} from '../lib/game/main-journey.ts';
import {journeyBoard} from '../lib/game/content.ts';
import {presentationBoard} from '../lib/game/journey-presentation.ts';
import {exactLine,type Puzzle} from '../lib/game/engine.ts';
import {CONTENT_REVISION_TWO,COMPACT_PROGRESS_WRITES} from '../lib/game/progress-rollout.ts';
import {revisionCatalogueQuality} from './content-quality-model.ts';

const directions=[['right',0,1],['down',1,0],['downRight',1,1],['downLeft',1,-1],
 ['left',0,-1],['up',-1,0],['upLeft',-1,-1],['upRight',-1,1]] as const;
type Direction=typeof directions[number][0];

/** Measure the prepared display, without regenerating layouts or changing saves. */
function measure(board:Puzzle){
 const counts=Object.fromEntries(directions.map(([name])=>[name,0])) as Record<Direction,number>;
 const owners=new Map<string,string[]>(),pairs=new Set<string>();
 for(const placement of board.placements){
  const dr=Math.sign(placement.b[0]-placement.a[0]),dc=Math.sign(placement.b[1]-placement.a[1]);
  const direction=directions.find(([,r,c])=>r===dr&&c===dc),cells=exactLine(placement.a,placement.b,board.size);
  if(!direction||!cells)throw new Error('Invalid placement: '+placement.id);
  counts[direction[0]]++;
  for(const cell of cells){
   const key=cell.join(','),ids=owners.get(key)??[];
   for(const id of ids)pairs.add(JSON.stringify([id,placement.id].sort()));
   ids.push(placement.id);owners.set(key,ids);
  }
 }
 const axes={horizontal:counts.right+counts.left,vertical:counts.down+counts.up,
  diagonal:counts.downRight+counts.downLeft+counts.upLeft+counts.upRight};
 return {targets:board.placements.length,directions:counts,axes,
  representedDirections:Object.values(counts).filter(n=>n>0).length,
  representedAxes:Object.values(axes).filter(n=>n>0).length,
  reverse:counts.left+counts.up+counts.upLeft+counts.upRight,
  sharedCells:[...owners.values()].filter(ids=>ids.length>1).length,
  intersectingPairs:pairs.size};
}

type Row=ReturnType<typeof measure>&{id:string;number:number;title:string;revision:1|2};
function summarize(rows:Row[]){
 const counts=Object.fromEntries(directions.map(([name])=>[name,rows.reduce((sum,row)=>sum+row.directions[name],0)]));
 return {chapters:rows.length,targets:rows.reduce((sum,row)=>sum+row.targets,0),directions:counts,
  singleAxisBoards:rows.filter(row=>row.representedAxes===1).length,
  boardsWithDiagonal:rows.filter(row=>row.axes.diagonal>0).length,
  boardsWithSharedCells:rows.filter(row=>row.sharedCells>0).length,
  sharedCells:rows.reduce((sum,row)=>sum+row.sharedCells,0),
  intersectingPairs:rows.reduce((sum,row)=>sum+row.intersectingPairs,0)};
}

const published:Row[]=MAIN_JOURNEY.map(({chapter,number})=>({id:chapter.id,number,title:chapter.title,revision:1,
 ...measure(presentationBoard(journeyBoard(chapter),'route:'+chapter.id))}));
const candidates:Row[]=revisionCatalogueQuality().map(({id,chapter,board})=>({id,
 number:MAIN_JOURNEY.find(row=>row.chapter.id===id)!.number,title:chapter.title,revision:2,...measure(board)}));
const report={schemaVersion:1,scope:'prepared-main-journey-displays-and-revision-two-candidates',
 definitions:{directions:'Direction from the first target letter to its last, before optional player rotation.',
  reverse:'Upward paths, plus horizontal paths read leftward; matches the existing quality model.',
  sharedCells:'Distinct board cells occupied by at least two target placements.',
  intersectingPairs:'Distinct target pairs sharing at least one board cell; crossings between cells are excluded.',
  acceptance:'Descriptive audit only; no universal direction or intersection quota and no player difficulty claim.'},
 rollout:{contentRevisionTwo:CONTENT_REVISION_TWO,compactProgressWrites:COMPACT_PROGRESS_WRITES},
 summary:{published:summarize(published),openingSix:summarize(published.slice(0,6)),candidates:summarize(candidates)},
 published,candidates};
const args=process.argv.slice(2);
if(args.length&&!(args.length===2&&args[0]==='--out'&&args[1]))throw new Error('Usage: audit-board-directions.ts [--out report.json]');
const json=JSON.stringify(report,null,2)+'\n';
if(args[1]){writeFileSync(args[1],json);console.log(JSON.stringify({output:args[1],summary:report.summary},null,2));}
else process.stdout.write(json);
