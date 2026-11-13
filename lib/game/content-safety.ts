import {normalize} from './catalog.ts';
import {PRESENTATION_RULES} from './board-quality.ts';

/** Local editorial guard, not a substitute for human review or player reports. */
export function targetSafetyIssues(value:string):string[]{
 return [...new Set(value.split(/[\s-]+/).flatMap(part=>{
  const word=normalize(part),reverse=[...word].reverse().join('');
  if(PRESENTATION_RULES.exceptions.has(word))return [];
  return PRESENTATION_RULES.blocked.filter(term=>word.includes(term)||reverse.includes(term));
 }))];
}
/** Short roots are exact-token only: ordinary prose must not fail on substrings. */
export function proseSafetyIssues(value:string):string[]{
 const tokens=value.normalize('NFC').toLocaleUpperCase('tr-TR').split(/[^A-ZÇĞİÖŞÜ]+/).filter(Boolean);
 return [...new Set(tokens.filter(token=>PRESENTATION_RULES.blocked.some(term=>term!=='SIK'&&(token===term||(term.length>=5&&token.startsWith(term))))))];
}
