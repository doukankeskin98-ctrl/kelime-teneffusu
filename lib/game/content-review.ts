import {normalize,splitWord} from './catalog.ts';
import {PLAYABLE_JOURNEYS} from './content.ts';
export interface DraftReview {errors:string[];warnings:string[];clues:Record<string,string>|undefined;longest:number}
/** Editorial diagnostics only. This cannot publish or mutate any existing chapter. */
export function reviewDraft(words:string[],size:number,definitions:string):DraftReview{
 const errors:string[]=[],warnings:string[]=[],normalized=words.map(normalize),longest=Math.max(0,...words.flatMap(w=>splitWord(w).map(x=>x.length)));
 if(new Set(normalized).size!==normalized.length)errors.push('Aynı kelime birden fazla yazılmış.');
 if(longest>size)errors.push(`${longest} harfli hedef bu tahtaya sığmıyor.`);
 const signature=[...normalized].sort().join('|'),duplicate=PLAYABLE_JOURNEYS.find(j=>j.words.map(normalize).sort().join('|')===signature);
 if(duplicate)errors.push(`Bu kelime kümesi mevcut: ${duplicate.title}. Yeni bir bölüm için hedefleri değiştir.`);
 if(size>9)warnings.push('Küçük telefonda sıkışabilir. Daha kısa hedeflerle 6–9 satırlı tahtayı dene.');
 if(words.length>7)warnings.push('Çok sayıda hedef taramayı zorlaştırabilir. Oynayarak kontrol et.');
 let clues:Record<string,string>|undefined;
 if(definitions.trim()){
  clues={};if(words.some(w=>splitWord(w).length>1))errors.push('Bilmeceli taslakta tek parçalı cevaplar kullan.');const allowed=new Map(words.map(w=>[normalize(w),w]));
  for(const line of definitions.split('\n').filter(s=>s.trim())){
   const at=line.indexOf('=');if(at<1){errors.push('Her tanımı KELİME = Tanım biçiminde yaz.');continue;}
   const key=normalize(line.slice(0,at).trim()),word=allowed.get(key),clue=line.slice(at+1).trim();
   if(!word){errors.push('Tanımın kelimesi hedef listesinde yok.');continue;}
   if(clues[key]){errors.push(`${word} için birden fazla tanım var.`);continue;}
   if(clue.length<8||clue.length>150){errors.push(`${word}: tanım 8–150 karakter olmalı.`);continue;}
   if(normalize(clue).includes(key))warnings.push(`${word}: tanım cevabı açık ediyor olabilir.`);
   clues[key]=clue;
  }
  if(words.some(word=>!clues?.[normalize(word)]))errors.push('Bilmeceli bölümde her hedefin bir tanımı olmalı.');
 }
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)],clues,longest};
}
