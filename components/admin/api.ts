'use client';
import {useCallback,useEffect,useState} from 'react';
export class AdminRequestError extends Error{constructor(message:string,public status:number){super(message);}}
async function result<T>(response:Response,privateAction:boolean):Promise<T>{
 const value=await response.json() as T&{error?:string};if(!response.ok){if(privateAction&&(response.status===401||response.status===403))window.dispatchEvent(new CustomEvent('kt-admin-denied',{detail:response.status}));throw new AdminRequestError(value.error??'Yönetim bağlantısı kurulamadı.',response.status);}return value;
}
export async function adminGet<T>(query:string,signal?:AbortSignal):Promise<T>{return result<T>(await fetch('/api/admin?'+query,{cache:'no-store',credentials:'same-origin',signal}),!query.startsWith('action=session'));}
export async function adminPost<T>(action:string,data:Record<string,unknown>={}):Promise<T>{return result<T>(await fetch('/api/admin',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data})}),action!=='claim');}
export function useAdminQuery<T>(query:string){
 const [data,setData]=useState<T|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 const reload=useCallback(()=>setRevision(v=>v+1),[]);
 useEffect(()=>{const c=new AbortController();setLoading(true);setError('');setData(null);void adminGet<T>(query,c.signal).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message??'Bağlantı kurulamadı.');}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return ()=>c.abort();},[query,revision]);
 return {data,loading,error,reload};
}
