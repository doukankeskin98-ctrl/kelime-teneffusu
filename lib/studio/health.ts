import type {Database} from '../game/server.ts';
import {istanbulDay} from '../game/engine.ts';
export const HEALTH_AREAS=['game','social','progress','chapters','admin'] as const;
export type HealthArea=typeof HEALTH_AREAS[number];
/** Operational counters contain no request text, paths, identities, tokens or raw exception messages. */
export async function recordOperationalFault(db:Database|undefined,area:HealthArea,now=Date.now()){
 if(!db)return;
 try{await db.prepare("INSERT INTO operational_faults(day,area,code,count,reviewed_count,first_seen,last_seen,last_operation) VALUES(?,?,'unexpected_server_error',1,0,?,?,'') ON CONFLICT(day,area,code) DO UPDATE SET count=count+1,last_seen=excluded.last_seen").bind(istanbulDay(now),area,now,now).run();}catch{}
}
