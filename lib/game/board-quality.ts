import {DIRECTIONS, exactLine, hash, match, random, type Cell, type Placement, type Puzzle, type Stroke} from './engine.ts';

/** A versioned presentation generator. The historical save/competition generator is immutable. */
export const BOARD_QUALITY_VERSION = 'quality-1';
export const BLOCKED_SEQUENCES = ['SİK', 'PİÇ', 'GÖT', 'AMK', 'OROSPU', 'YARRAK', 'SİKTİR', 'PEZEVENK'] as const;
// These reviewed dictionary words contain an otherwise blocked substring.
const LITERAL_EXCEPTIONS = new Set(['BİSİKLET', 'BİSİKLETÇİ', 'KLASİK', 'KLASİKLER', 'SİKKE', 'ÇİPURA', 'TOKMAK']);

/**
 * `quality-1` remains frozen for existing daily generation and this release's
 * Arena/Sprint inputs. Arena and challenge runs persist their complete boards;
 * new catalogue challenges may use the wider presentation layouts without
 * changing an already-issued challenge. Daily changes need a date boundary.
 */
export interface QualityRules {version:string; blocked:readonly string[]; exceptions:ReadonlySet<string>}
export const SHARED_RULES:QualityRules = {version:BOARD_QUALITY_VERSION, blocked:BLOCKED_SEQUENCES, exceptions:LITERAL_EXCEPTIONS};
/** Wider list for prepared presentation layouts, also copied into new catalogue challenges. Not a moderation guarantee. */
export const PRESENTATION_BLOCKED = [...BLOCKED_SEQUENCES,
  'AMCIK', 'AMINA', 'AMINI', 'ANANI', 'YARAK', 'TAŞAK', 'İBNE', 'PUŞT', 'KAHPE', 'GAVAT', 'KALTAK', 'SÜRTÜK', 'FAHİŞE',
  'DALYARAK', 'YAVŞAK', 'BOK', 'SIÇ', 'SIK', 'ÇÜK', 'DÖL', 'SEKS', 'PORNO', 'MEME', 'KAKA', 'ÇİŞ', 'PİPİ', 'OSUR',
  'SALAK', 'APTAL', 'ŞEREFSİZ', 'PİSLİK', 'KERHANE', 'DOMAL', 'SAKSO', 'NAZİ', 'HİTLER', 'ZENCİ', 'EROİN', 'KOKAİN',
  'ESRAR', 'TECAVÜZ', 'İNTİHAR'] as const;
// Reviewed targets that legitimately contain a wider-list sequence: seksek (the game) and geçiş.
export const PRESENTATION_RULES:QualityRules = {version:'quality-2', blocked:PRESENTATION_BLOCKED,
  exceptions:new Set([...LITERAL_EXCEPTIONS, 'SEKSEK', 'GEÇİŞ'])};
// Hand-tuned Turkish-friendly filler, not a claim of measured corpus frequencies.
const FILLER = [...'AAAAAAEEEEEEİİİİIIIIIINNNNRRRRLLLLKKKKDDTTSSMMUUYYBBÇÇOOÖÖÜÜŞŞGGCCPHVZFĞJ'];
export interface BoardPolicy {size?:number; directions?:'straight'|'forward'|'all'; reverseLimit?:number; bothDiagonals?:boolean; diagonalRequired?:boolean}
export interface BoardIssue {kind:'blocked'|'duplicate'; text:string; a:Cell; b:Cell}
const segment = (a:Cell,b:Cell) => [a.join(','),b.join(',')].sort().join(':');
const isReverse = (p:Pick<Placement,'a'|'b'>) => p.b[0]<p.a[0] || (p.b[0]===p.a[0] && p.b[1]<p.a[1]);

export function wordSegments(grid:string[][], text:string):Array<{a:Cell;b:Cell}> {
  const found = new Map<string,{a:Cell;b:Cell}>(), size=grid.length;
  for(let r=0;r<size;r++) for(let c=0;c<size;c++) for(const [dr,dc] of DIRECTIONS) {
    const a:Cell=[r,c], b:Cell=[r+dr*(text.length-1),c+dc*(text.length-1)];
    if(b[0]<0||b[1]<0||b[0]>=size||b[1]>=size) continue;
    if([...text].every((ch,i)=>grid[r+dr*i]![c+dc*i]===ch)) found.set(segment(a,b),{a,b});
  }
  return [...found.values()];
}

function permittedLiteral(text:string,a:Cell,b:Cell,placements:Placement[],size:number,rules:QualityRules) {
  const cells=exactLine(a,b,size)!;
  return placements.some(p=>rules.exceptions.has(p.text)&&(p.text.includes(text)||[...p.text].reverse().join('').includes(text))&&
    cells.every(([r,c])=>exactLine(p.a,p.b,size)!.some(x=>x[0]===r&&x[1]===c)));
}

export function boardIssues(board:Puzzle,rules:QualityRules=SHARED_RULES):BoardIssue[] {
  const issues:BoardIssue[]=[];
  for(const text of rules.blocked) for(const hit of wordSegments(board.grid,text))
    if(!permittedLiteral(text,hit.a,hit.b,board.placements,board.size,rules)) issues.push({kind:'blocked',text,...hit});
  for(const text of new Set(board.targets.map(t=>t.text))) {
    const intended=board.placements.filter(p=>p.text===text);
    for(const hit of wordSegments(board.grid,text))
      if(!intended.some(p=>segment(hit.a,hit.b)===segment(p.a,p.b))) issues.push({kind:'duplicate',text,...hit});
  }
  return issues;
}

/** Check only lines that include the newly filled cell; no full-grid scan per letter. */
function validFiller(board:Puzzle,r:number,c:number,rules:QualityRules):boolean {
  const forbidden = new Set<string>(rules.blocked);
  const targets = new Map(board.targets.map(t=>[t.text,t]));
  const lengths = new Set([...forbidden,...targets.keys()].map(t=>t.length));
  for(const length of lengths) for(const [dr,dc] of DIRECTIONS) for(let offset=0;offset<length;offset++) {
    const a:Cell=[r-dr*offset,c-dc*offset], b:Cell=[a[0]+dr*(length-1),a[1]+dc*(length-1)];
    if(a[0]<0||a[1]<0||b[0]<0||b[1]<0||a[0]>=board.size||a[1]>=board.size||b[0]>=board.size||b[1]>=board.size) continue;
    let text='';
    for(let i=0;i<length;i++) text+=board.grid[a[0]+dr*i]![a[1]+dc*i];
    if(text.length!==length) continue;
    if(forbidden.has(text)&&!permittedLiteral(text,a,b,board.placements,board.size,rules)) return false;
    const target=targets.get(text);
    if(target&&!board.placements.some(p=>p.text===text&&segment(a,b)===segment(p.a,p.b))) return false;
  }
  return true;
}

export function qualityPuzzle(source:Puzzle, seed:number, policy:BoardPolicy={}, rules:QualityRules=SHARED_RULES):Puzzle {
  const targets=source.targets.map(t=>({...t}));
  // Name the word for the content author instead of failing after every attempt.
  // The frozen shared rules keep their original failure path.
  if(rules!==SHARED_RULES) for(const t of targets) {
    const reversed=[...t.text].reverse().join('');
    const hit=rules.blocked.find(text=>t.text.includes(text)||reversed.includes(text));
    if(hit&&!rules.exceptions.has(t.text)) throw new Error(`"${t.text}" hedefi "${hit}" dizisini içeriyor. Kelimeyi gözden geçir; uygunsa istisna listesine ekle.`);
  }
  const minimum=Math.max(6,policy.size??source.size,...targets.map(t=>t.text.length));
  const maximum=policy.size===undefined?Math.max(minimum,source.size):minimum;
  const forward:DIRECTIONS_TYPE=[[0,1],[1,0],[1,1],[1,-1]];
  const directions=policy.directions==='straight'?forward.slice(0,2):policy.directions==='forward'?forward:DIRECTIONS;
  const ordered=[...targets].sort((a,b)=>b.text.length-a.text.length);
  const diagonalIds=policy.bothDiagonals?[...targets].sort((a,b)=>a.text.length-b.text.length).slice(0,2).map(t=>t.id):[];
  for(let size=minimum;size<=maximum;size++) for(let attempt=0;attempt<400;attempt++) {
    const rand=random(seed+hash(rules.version)+attempt*104729);
    const board:Puzzle={version:2,size,grid:Array.from({length:size},()=>Array<string>(size).fill('')),targets,placements:[]};
    for(const target of ordered) {
      const repeated=targets.filter(t=>t.text===target.text).length>1;
      const occupied=new Set(board.placements.filter(p=>p.text===target.text).map(p=>segment(p.a,p.b)));
      const existing=wordSegments(board.grid,target.text).filter(p=>!occupied.has(segment(p.a,p.b)));
      if(!repeated&&existing.length>1) break;
      const choices:Array<{a:Cell;b:Cell}>=[];
      for(const [dr,dc] of directions) for(let r=0;r<size;r++) for(let c=0;c<size;c++) {
        const a:Cell=[r,c], b:Cell=[r+dr*(target.text.length-1),c+dc*(target.text.length-1)];
        if(b[0]<0||b[1]<0||b[0]>=size||b[1]>=size) continue;
        if(policy.diagonalRequired&&target.id===ordered[0]!.id&&dr*dc===0) continue;
        if(occupied.has(segment(a,b))) continue;
        if(diagonalIds[0]===target.id&&dr*dc!==1) continue;
        if(diagonalIds[1]===target.id&&dr*dc!==-1) continue;
        if(isReverse({a,b})&&board.placements.filter(isReverse).length>=(policy.reverseLimit??targets.length)) continue;
        if(existing.length&&!repeated&&segment(a,b)!==segment(existing[0]!.a,existing[0]!.b)) continue;
        if([...target.text].every((ch,i)=>!board.grid[r+dr*i]![c+dc*i]||board.grid[r+dr*i]![c+dc*i]===ch)) choices.push({a,b});
      }
      if(!choices.length) break;
      const choice=choices[Math.floor(rand()*choices.length)]!;
      const cells=exactLine(choice.a,choice.b,size)!;
      cells.forEach(([r,c],i)=>{board.grid[r]![c]=target.text[i]!;});
      board.placements.push({...target,...choice});
    }
    if(board.placements.length!==targets.length||boardIssues(board,rules).length) continue;
    let failed=false;
    for(let r=0;r<size&&!failed;r++) for(let c=0;c<size;c++) if(!board.grid[r]![c]) {
      const first=FILLER[Math.floor(rand()*FILLER.length)]!;
      const alternatives=[first,...[...new Set(FILLER)].sort((a,b)=>hash(seed+':'+attempt+':'+r+':'+c+':'+a)-hash(seed+':'+attempt+':'+r+':'+c+':'+b))];
      let placed=false;
      for(const letter of alternatives) {board.grid[r]![c]=letter;if(validFiller(board,r,c,rules)){placed=true;break;}}
      if(!placed){failed=true;break;}
    }
    if(!failed&&!boardIssues(board,rules).length) return board;
  }
  throw new Error('Güvenli tahta yerleşimi hazırlanamadı.');
}
type DIRECTIONS_TYPE=Cell[];

/**
 * Clears wider-list hits by changing only filler letters. Every target keeps its
 * cells, so a half-played board looks the same apart from the replaced letters.
 * Returns null when a hit lies wholly on target letters and needs a new layout.
 */
export function repairFiller(board:Puzzle, seed:number, rules:QualityRules):Puzzle|null {
  const next:Puzzle={...board,grid:board.grid.map(row=>[...row])};
  const onTarget=new Set(board.placements.flatMap(p=>exactLine(p.a,p.b,board.size)!.map(cell=>cell.join(','))));
  const letters=[...new Set(FILLER)];
  for(let pass=0;pass<6;pass++) {
    const issues=boardIssues(next,rules);
    if(!issues.length) return next;
    for(const issue of issues) {
      const cells=exactLine(issue.a,issue.b,board.size)!;
      const read=cells.map(([r,c])=>next.grid[r]![c]).join('');
      if(read!==issue.text&&[...read].reverse().join('')!==issue.text) continue; // an earlier replacement already cleared it
      const free=cells.filter(cell=>!onTarget.has(cell.join(',')))
        .sort((x,y)=>hash(`${seed}:repair:${pass}:${x.join(',')}`)-hash(`${seed}:repair:${pass}:${y.join(',')}`));
      let placed=false;
      for(const [r,c] of free) {
        const before=next.grid[r]![c]!;
        const order=[...letters].sort((x,y)=>hash(`${seed}:repair:${r}:${c}:${x}`)-hash(`${seed}:repair:${r}:${c}:${y}`));
        for(const letter of order) {
          if(letter===before) continue;
          next.grid[r]![c]=letter;
          if(validFiller(next,r,c,rules)){placed=true;break;}
        }
        if(placed) break;
        next.grid[r]![c]=before;
      }
      if(!placed) return null;
    }
  }
  return boardIssues(next,rules).length?null:next;
}

/** Old valid alternate/reversed strokes remain untouched in persisted state. */
export function presentationStrokes(source:Puzzle,display:Puzzle,strokes:Stroke[]):Stroke[] {
  if(source===display) return strokes;
  return strokes.flatMap(s=>{
    if(match(source,s.a,s.b)?.id!==s.id) return [];
    if(match(display,s.a,s.b)?.id===s.id) return [s];
    const p=display.placements.find(p=>p.id===s.id);
    return p?[{id:s.id,a:p.a,b:p.b}]:[];
  });
}

const safeCache=new Map<string,Puzzle>();
/** Only new non-persisted boards or new server snapshots use this path. */
export function safeSnapshot(source:Puzzle,seed:number,policy:BoardPolicy={}):Puzzle {
  const key=JSON.stringify([source.grid,source.targets,seed,policy]);
  const cached=safeCache.get(key);if(cached)return cached;
  const board=qualityPuzzle(source,seed,policy);
  if(safeCache.size>=32)safeCache.delete(safeCache.keys().next().value!);
  safeCache.set(key,board);return board;
}
export function canonicalStroke(source:Puzzle,display:Puzzle,a:Cell,b:Cell):Stroke|null {
  const target=match(display,a,b);if(!target) return null;
  if(source===display) return {id:target.id,a,b};
  const p=source.placements.find(p=>p.id===target.id&&p.text===target.text);
  return p?{id:p.id,a:p.a,b:p.b}:null;
}
