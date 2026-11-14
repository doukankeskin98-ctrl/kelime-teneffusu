import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setEngagementAdapter,reminderStatus,setDailyReminder,dismissReminderOffer,requestGameReview,type ReminderState} from '../lib/platform/engagement.ts';
test('reminders are absent on web, inspection never asks for permission, and explicit actions reach native once',async()=>{
 setEngagementAdapter(null);assert.equal((await reminderStatus()).available,false);
 const actions:string[]=[];const state:ReminderState={available:true,enabled:false,permission:'unknown',offered:false};
 setEngagementAdapter({status:async()=>{actions.push('status');return state;},setReminder:async({enabled})=>{actions.push(String(enabled));return {...state,enabled};},dismissOffer:async()=>{actions.push('dismiss');},requestReview:async()=>{actions.push('review');}});
 try{await reminderStatus();assert.deepEqual(actions,['status']);assert.equal((await setDailyReminder(true)).enabled,true);await setDailyReminder(false);await dismissReminderOffer();await requestGameReview();assert.deepEqual(actions,['status','true','false','dismiss','review']);}finally{setEngagementAdapter(null);}
});
test('native status/review failure never breaks play, while an explicit save failure remains visible',async()=>{
 const fail=async():Promise<never>=>{throw Error('native unavailable');};setEngagementAdapter({status:fail,setReminder:fail,dismissOffer:fail,requestReview:fail});
 try{assert.equal((await reminderStatus()).available,false);await requestGameReview();await dismissReminderOffer();await assert.rejects(setDailyReminder(true));}finally{setEngagementAdapter(null);}
});
