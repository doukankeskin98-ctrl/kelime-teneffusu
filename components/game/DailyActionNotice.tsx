'use client';
import {LoaderCircle,RefreshCw} from 'lucide-react';
import type {DailyActionState} from '@/lib/game/daily-action';
export function DailyActionNotice({state,onRetry,onBack}:{state:DailyActionState;onRetry:()=>void;onBack:()=>void}){
 if(state.phase==='idle')return null;
 const waiting=state.phase==='sending'||state.phase==='checking';
 const title=state.phase==='checking'?'Günlük kaydın kontrol ediliyor':state.phase==='sending'?(state.intent?.kind==='hint'?'İpucun hazırlanıyor':'Kelimen doğrulanıyor'):state.phase==='account-changed'?'Günlük oyunun hesabı değişti':state.phase==='unavailable'?'Günlük kaydı açılamadı':'Günlük kaydını kontrol edelim';
 return <div className={'daily-action-notice'+(waiting?' is-waiting':'')} role="status">
  <strong>{waiting&&<LoaderCircle size={17} className="spin" aria-hidden="true"/>}{title}</strong>
  <p>{waiting?'Sunucu yanıtını beklerken süre devam eder.':state.phase==='account-changed'?'Günlük sayfasına dönerek güncel profilinle açabilirsin.':state.phase==='unavailable'?'Günlük sayfasına dönerek yeniden açabilirsin.':(state.message?state.message+' ':'')+'İşlem sunucuya ulaşmış olabilir. Bekleyen işlemi kontrol ederek devam edebilirsin. Süre işlemeye devam ediyor.'}</p>
  {!waiting&&<div className="daily-action-buttons">{state.phase==='uncertain'&&<button type="button" className="button primary" onClick={onRetry}><RefreshCw size={16} aria-hidden="true"/>Kontrol et ve sürdür</button>}<button type="button" className="text-button" onClick={onBack}>Günlük sayfasına dön</button></div>}
 </div>;
}
