'use client';
import {useEffect,useRef,useState} from 'react';
import {api} from './common';

export function DailyRankingJoin({ownerId,onNamed}:{ownerId:string;onNamed:(name:string,ownerId:string)=>void}){
 const [open,setOpen]=useState(false),[name,setName]=useState('Kelime avcısı'),[error,setError]=useState(''),[busy,setBusy]=useState(false),lock=useRef(false);
 const active=useRef(true),pending=useRef<AbortController|null>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;pending.current?.abort();};},[ownerId]);
 return <section className="daily-ranking-join">
  <p>Günlük sonucun kaydedildi. Sıralamada görünmek için bir oyuncu adı seçebilirsin.</p>
  {open?<form noValidate onSubmit={async event=>{
   event.preventDefault();if(lock.current)return;
   if(name.trim().length<2){setError('Oyuncu adın 2–20 karakter olsun.');return;}
   lock.current=true;setBusy(true);setError('');
   try{const controller=new AbortController();pending.current=controller;const profile=await api<{nickname:string}>('rename',{name,expectedOwnerId:ownerId},controller.signal);if(active.current&&!controller.signal.aborted)onNamed(profile.nickname,ownerId);}
   catch(e){if(active.current)setError(e instanceof Error?e.message:'Adın kaydedilemedi. Yeniden dene.');}
   finally{lock.current=false;if(active.current)setBusy(false);}
  }}><label htmlFor="daily-player-name">Oyuncu adın</label><input id="daily-player-name" autoComplete="nickname" minLength={2} maxLength={20} value={name} onChange={e=>setName(e.target.value)} aria-invalid={!!error} aria-describedby={error?'daily-name-error':undefined}/><button className="button secondary" disabled={busy}>{busy?'Kaydediliyor…':'Sıralamaya katıl'}</button>{error&&<p id="daily-name-error" role="alert">{error}</p>}</form>:<button className="button secondary" onClick={()=>setOpen(true)}>Sıralamaya katıl</button>}
 </section>;
}
