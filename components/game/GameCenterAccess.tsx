'use client';
import {useEffect,useState} from 'react';
import {Gamepad2} from 'lucide-react';
import {gameCenterStatus,openGameCenter} from '@/lib/platform/game-center';
export function GameCenterAccess(){
 const [configured,setConfigured]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{let active=true;void gameCenterStatus().then(state=>{if(active)setConfigured(state.configured);});return ()=>{active=false;};},[]);
 if(!configured)return null;
 return <div><button className="button secondary full" disabled={busy} onClick={async()=>{setBusy(true);setMessage('');const result=await openGameCenter();setBusy(false);if(!['opened','authenticated','cancelled'].includes(result.status))setMessage(result.status==='signedOut'?'iPhone ayarlarından Game Center hesabını açabilirsin.':'Game Center şu anda açılamadı. Oyuna devam edebilirsin.');}}><Gamepad2 size={20}/>Game Center</button>{message&&<p className="muted" role="status">{message}</p>}</div>;
}
