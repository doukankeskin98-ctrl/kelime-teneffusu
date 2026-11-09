'use client';
import {useEffect,useState} from 'react';
import {Award,Check} from 'lucide-react';
import {istanbulDay} from '@/lib/game/engine';
import {weeklyStatus,weeklyDateLabel,WEEKLY_TARGET} from '@/lib/game/weekly-reward';
import type {Progress} from '@/lib/game/progress';
export function WeeklyKeepsakes({progress}:{progress:Progress}){
 const [day,setDay]=useState(istanbulDay),[all,setAll]=useState(false);
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>;const refresh=()=>{clearTimeout(timer);if(document.hidden)return;const today=istanbulDay();setDay(today);timer=setTimeout(refresh,Math.max(1000,Date.parse(today+'T21:00:00Z')-Date.now()+50));};refresh();document.addEventListener('visibilitychange',refresh);window.addEventListener('kt-app-resume',refresh);return ()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('kt-app-resume',refresh);};},[]);
 const state=weeklyStatus(progress.weekly,day),earned=[...(progress.weekly?.earned??[])].reverse();
 return <section className="weekly-keepsakes" aria-labelledby="weekly-title"><header><Award size={25} aria-hidden="true"/><div><h2 id="weekly-title">Haftalık hatıra</h2><p>{state.earned?'Bu haftanın hatırası senin.':`Bu hafta ${state.count}/${WEEKLY_TARGET} bölüm`}</p></div>{state.earned&&<Check aria-label="Kazanıldı"/>}</header>
  <p>Bu hafta Yolculuk’ta beş farklı bölüm tamamla. Tekrar oynadığın bölüm de haftada bir kez sayılır. Her gün gelmen gerekmez.</p>
  <div className="weekly-pips" role="progressbar" aria-label="Haftalık hatıra" aria-valuenow={state.count} aria-valuemin={0} aria-valuemax={WEEKLY_TARGET}>{Array.from({length:WEEKLY_TARGET},(_,i)=><i key={i} className={i<state.count?'earned':''}/>)}</div>
  <small>Hafta pazartesi, Türkiye saatiyle yenilenir. Kazandığın hatıralar kalır.</small>
  {!!earned.length&&<details><summary>Hatıraların · {earned.length}</summary><ul>{(all?earned:earned.slice(0,8)).map(week=><li key={week}><Award size={20} aria-hidden="true"/><span>{weeklyDateLabel(week)}<small>Haftanın hatırası · 5 farklı bölüm</small></span><Check size={17} aria-label="Kazanıldı"/></li>)}</ul>{earned.length>8&&!all&&<button className="text-button" onClick={()=>setAll(true)}>Tümünü göster</button>}</details>}
 </section>;
}
