import type {Database} from './server.ts';
/** This small filter only rejects explicit terms; reports and human review remain necessary. */
export function acceptablePlayerName(value:string){const text=value.normalize('NFKC').toLocaleLowerCase('tr-TR').replace(/[0134]/g,c=>({'0':'o','1':'i','3':'e','4':'a'}[c]!));return !/(?:^|[^\p{L}])(?:orospu|piç|siktir|fuck|nigger)(?:$|[^\p{L}])/u.test(text);}
export async function blockedPair(db:Database,a:string,b:string){return !!await db.prepare('SELECT 1 FROM player_blocks WHERE (user_id=? AND blocked_id=?) OR (user_id=? AND blocked_id=?) LIMIT 1').bind(a,b,b,a).first();}
export async function blockedRoom(db:Database,ids:string[]){if(ids.length<2)return false;return !!await db.prepare("SELECT 1 FROM player_blocks WHERE user_id IN (SELECT value FROM json_each(?)) AND blocked_id IN (SELECT value FROM json_each(?)) LIMIT 1").bind(JSON.stringify(ids),JSON.stringify(ids)).first();}
export const safetyFailure=(e:unknown)=>String(e).includes('PLAYER_BLOCKED')?'Bu oyuncuyla aynı oyuna katılamazsın.':String(e).includes('PLAYER_ERASED')?'Bu oyuncu profili silindi. Yeni bir profille devam et.':null;
