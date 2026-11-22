'use client';
import {WifiOff,CloudOff,RefreshCw} from 'lucide-react';
export function NetworkState({offline=false,compact=false,onRetry}:{offline?:boolean;compact?:boolean;onRetry:()=>void}){
 const Icon=offline?WifiOff:CloudOff;
 return <section className={'network-state'+(compact?' is-compact':'')} role="status"><Icon aria-hidden="true"/><div><h2>{offline?'İnternet bağlantın yok.':'Oyun sunucusuna şu an ulaşılamıyor.'}</h2><p>{compact?'Çevrimiçi Arena bilgilerin bağlantı kurulunca görünür.':'Bağlantını kontrol edip yeniden deneyebilirsin.'}</p><button className="button secondary" onClick={onRetry}><RefreshCw size={18}/>Yeniden dene</button></div></section>;
}
