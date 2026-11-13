import assert from 'node:assert/strict';
import {it} from 'node:test';
import {targetSafetyIssues,proseSafetyIssues} from '../lib/game/content-safety.ts';
import {reviewDraft} from '../lib/game/content-review.ts';
import {checkNewChapter,checkChapter,NEW_CHAPTER} from '../lib/studio/content.ts';
import {dailyBoard,dailyBoardV1,STRICT_DAILY_FROM} from '../lib/game/daily-board.ts';
import {boardIssues,PRESENTATION_RULES} from '../lib/game/board-quality.ts';
import {freshArenaPuzzle,type WordHistory} from '../lib/game/arena-fresh.ts';
import {ARENA_LIBRARY} from '../lib/game/arena-library.ts';
it('blocks inappropriate draft targets and definitions without rejecting reviewed Turkish words or ordinary prose',()=>{
 for(const word of ['APTAL','BOK','AMK','KMA','PİÇ'])assert(targetSafetyIssues(word).length,word);
 for(const word of ['BİSİKLET','KAKAO','MAKAK','BOKS','KISAYOL','GEÇİŞ'])assert.deepEqual(targetSafetyIssues(word),[],word);
 assert.deepEqual(proseSafetyIssues('Sık kullanılan, sıkı örülmüş bir kumaş.'),[]);
 assert(proseSafetyIssues('Bu aptalca bir sözcük.').length);
 assert(reviewDraft(['APTAL','KALEM','DEFTER'],6,'').errors.length);
 assert.throws(()=>checkNewChapter({...NEW_CHAPTER,words:['APTAL','KALEM','DEFTER']}));
 // Published specs can still be read; only new writes use the stronger editorial gate.
 assert.doesNotThrow(()=>checkChapter(NEW_CHAPTER));
});
it('keeps every already issuable daily unchanged and switches only at the dated policy boundary',()=>{
 for(const day of ['2026-01-01','2026-11-13','2026-11-14'])assert.deepEqual(dailyBoard(day),dailyBoardV1(day),day);
 assert.deepEqual(boardIssues(dailyBoard(STRICT_DAILY_FROM),PRESENTATION_RULES),[]);
});
it('wide new Arena policy can place the entire dictionary without relaxing the safety rules',()=>{
 const placed=new Set<string>(),history:WordHistory[]=[];let ordinal=0;
 while(placed.size<ARENA_LIBRARY.length){
  assert(ordinal<500,'bounded coverage');const candidate=freshArenaPuzzle(ordinal++,{group:true,safety:'wide-v1',history});if(!candidate)continue;
  assert.deepEqual(boardIssues(candidate.board,PRESENTATION_RULES),[]);
  for(const word of candidate.words){placed.add(word);const seen=history.find(x=>x.word===word);if(seen){seen.uses++;seen.lastSeen=ordinal;}else history.push({word,uses:1,lastSeen:ordinal,recent:0});}
 }
 assert.equal(placed.size,ARENA_LIBRARY.length);
});
