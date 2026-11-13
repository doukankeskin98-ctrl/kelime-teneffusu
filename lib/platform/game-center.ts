export interface GameCenterState {configured:boolean;authenticated:boolean;status:string}
export interface GameCenterAdapter {status:()=>Promise<GameCenterState>;authenticate:(options?:{interactive:boolean})=>Promise<GameCenterState>;openDashboard:()=>Promise<GameCenterState>}
const unavailable:GameCenterState={configured:false,authenticated:false,status:'notConfigured'};
let adapter:GameCenterAdapter|null=null;
/** Native-only installation. No Apple identifier is persisted or sent to Arena. */
export function setGameCenterAdapter(next:GameCenterAdapter|null){adapter=next;}
export async function gameCenterStatus(){try{return await adapter?.status()??unavailable;}catch{return unavailable;}}
export async function openGameCenter(){
 if(!adapter)return unavailable;
 try{const state=await adapter.status();if(!state.configured)return state;if(!state.authenticated)return await adapter.authenticate({interactive:true});return await adapter.openDashboard();}
 catch{return {...unavailable,status:'unavailable'};}
}
