export interface ReminderState {available:boolean;enabled:boolean;permission:'unknown'|'granted'|'denied';offered:boolean}
export interface EngagementAdapter {status:()=>Promise<ReminderState>;setReminder:(options:{enabled:boolean})=>Promise<ReminderState>;dismissOffer:()=>Promise<void>;requestReview:()=>Promise<unknown>}
let adapter:EngagementAdapter|null=null;
const unavailable:ReminderState={available:false,enabled:false,permission:'unknown',offered:true};
export function setEngagementAdapter(value:EngagementAdapter|null){adapter=value;}
export async function reminderStatus(){try{return await adapter?.status()??unavailable;}catch{return unavailable;}}
export async function setDailyReminder(enabled:boolean){if(!adapter)return unavailable;return adapter.setReminder({enabled});}
export async function dismissReminderOffer(){try{await adapter?.dismissOffer();}catch{/* No permission request is made here. */}}
export async function requestGameReview(){try{await adapter?.requestReview();}catch{/* Reviews never block the game. */}}
