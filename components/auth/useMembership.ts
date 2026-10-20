'use client';
import {useEffect,useState} from 'react';
import {getAuthClient,publicAuthConfig} from '@/lib/auth/firebase-client';
export interface MemberSnapshot {uid:string;email:string;emailVerified:boolean;displayName:string}
export function useMembership(){
 const [state,setState]=useState<{user:MemberSnapshot|null;ready:boolean;available:boolean|null;error:string;revision:number}>({user:null,ready:false,available:null,error:'',revision:0});
 useEffect(()=>{
  let stopped=false,unsubscribe:(()=>void)|undefined;
  const change=(user:import('firebase/auth').User|null)=>{if(!stopped)setState(s=>({...s,user:user?{uid:user.uid,email:user.email??'',emailVerified:user.emailVerified,displayName:user.displayName??''}:null,ready:true,error:'',revision:s.revision+1}));};
  const updated=()=>{void publicAuthConfig().then(async config=>{if(config.available){const c=await getAuthClient();change(c.auth.currentUser);}else change(null);}).catch(()=>change(null));};
  void publicAuthConfig().then(async config=>{
   if(stopped)return;setState(s=>({...s,available:config.available}));
   if(!config.available){change(null);return;}
   const {auth,sdk}=await getAuthClient();if(!stopped)unsubscribe=sdk.onIdTokenChanged(auth,change);
  }).catch(()=>{if(!stopped)setState(s=>({...s,ready:true,error:'Bağlantını kontrol edip tekrar dene.',revision:s.revision+1}));});
  window.addEventListener('kt-auth-updated',updated);
  return ()=>{stopped=true;unsubscribe?.();window.removeEventListener('kt-auth-updated',updated);};
 },[]);
 return state;
}
