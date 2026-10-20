'use client';
import {useEffect,useState} from 'react';
import {getAuthClient} from '@/lib/auth/firebase-client';
export interface MemberSnapshot {uid:string;email:string;emailVerified:boolean;displayName:string}
export function useMembership(){
 const [state,setState]=useState<{user:MemberSnapshot|null;ready:boolean;error:string;revision:number}>({user:null,ready:false,error:'',revision:0});
 useEffect(()=>{
  let stopped=false,unsubscribe:(()=>void)|undefined;
  const change=(user:import('firebase/auth').User|null)=>{if(!stopped)setState(s=>({user:user?{uid:user.uid,email:user.email??'',emailVerified:user.emailVerified,displayName:user.displayName??''}:null,ready:true,error:'',revision:s.revision+1}));};
  const updated=()=>{void getAuthClient().then(c=>change(c.auth.currentUser)).catch(()=>{});};
  void getAuthClient().then(({auth,sdk})=>{if(stopped)return;unsubscribe=sdk.onIdTokenChanged(auth,change);}).catch(()=>{if(!stopped)setState(s=>({...s,ready:true,error:'Üyelik servisine şu an ulaşılamıyor.'}));});
  window.addEventListener('kt-auth-updated',updated);
  return ()=>{stopped=true;unsubscribe?.();window.removeEventListener('kt-auth-updated',updated);};
 },[]);
 return state;
}
