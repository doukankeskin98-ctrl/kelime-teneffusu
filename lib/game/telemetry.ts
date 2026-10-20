'use client';
import {istanbulDay} from './engine.ts';
export const METRIC_EVENTS=['first_word','level_start','level_complete','selection_miss','challenge_start','challenge_complete','invite_share','arena_start','arena_complete','auth_complete','input_feedback','frame_sample','client_error','app_open','cohort_start','retention_day1','retention_day7'] as const;
export type MetricEvent=typeof METRIC_EVENTS[number];
let consent=false;
const DAY=86400000;
export function metricsConsent(value:boolean){consent=value;}
export function track(event:MetricEvent,value?:number){
 if(!consent||typeof navigator==='undefined'||!navigator.onLine)return;
 const bucket=value===undefined?'count':event==='first_word'?(value<15000?'under15s':value<30000?'under30s':value<60000?'under60s':'over60s'):event==='level_complete'||event==='challenge_complete'?(value<60000?'under60s':value<120000?'under120s':'over120s'):(value<17?'under17':value<34?'under34':value<50?'under50':value<100?'under100':value<250?'under250':value<1000?'under1000':'over1000');
 void fetch('/api/metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,bucket}),keepalive:true}).catch(()=>{});
}

export function recordVisit(){
 if(!consent)return;
 try{
  const today=istanbulDay();
  const raw=localStorage.getItem('kt-measurement-days'),state=raw?JSON.parse(raw) as {first:string;last:string;day1?:boolean;day7?:boolean}:null;
  if(!state||!/^\d{4}-\d{2}-\d{2}$/.test(state.first)){localStorage.setItem('kt-measurement-days',JSON.stringify({first:today,last:today}));track('cohort_start');track('app_open');return;}
  if(state.last===today)return;
  const days=Math.round((Date.parse(today+'T12:00:00Z')-Date.parse(state.first+'T12:00:00Z'))/DAY);
  if(days===1&&!state.day1){track('retention_day1');state.day1=true;}
  if(days===7&&!state.day7){track('retention_day7');state.day7=true;}
  state.last=today;localStorage.setItem('kt-measurement-days',JSON.stringify(state));track('app_open');
 }catch{}
}
