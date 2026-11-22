// On-disk schema shared by the generator and the independent catalogue checks.
export type WordPath = [string, number, number, number, number];
export interface Layout {
 n:number; id:string; world:number; pos:number; tier:string; band:string; clue:boolean;
 words:string[]; clues?:Record<string,string>; hiddenIds:string[]; hiddenWords:string[];
 grid:string[]; placements:WordPath[]; R:number; C:number; hidden:number;
 diag:number; rev:number; crossings:number; dirs:number; filled:number; score:number;
 letters:number; long:number; attempt:number; adaylar?:number; uyari?:string;
}
