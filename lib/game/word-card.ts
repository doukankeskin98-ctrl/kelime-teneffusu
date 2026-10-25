import type {Target} from './engine.ts';
/** Clue mode must not leak the answer through its accessible label. */
export function wordCardCopy(target:Pick<Target,'text'|'label'>,done:boolean,clues?:Record<string,string>){
 const clue=clues?.[target.text];
 return {text:clue&&!done?clue:target.label,detail:clue&&!done?`${target.text.length} harf`:undefined,isClue:!!clue&&!done};
}
