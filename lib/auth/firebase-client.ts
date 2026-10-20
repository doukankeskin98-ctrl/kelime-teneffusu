'use client';
import type {Auth,User} from 'firebase/auth';
import {safeReturnTo} from './shared.ts';
interface PublicConfig {apiKey:string;authDomain:string;projectId:string;appId:string}
type Client={auth:Auth;sdk:typeof import('firebase/auth')};
let pending:Promise<Client>|null=null;
let active:Client|null=null;
export function getAuthClient():Promise<Client>{
 if(pending)return pending;
 pending=(async()=>{
  const response=await fetch('/api/auth/config',{cache:'no-store'});
  if(!response.ok)throw new Error('Üyelik servisine şu an ulaşılamıyor. Biraz sonra tekrar dene.');
  const config=await response.json() as PublicConfig;
  if(!config.apiKey||!config.projectId||!config.authDomain||!config.appId)throw new Error('Üyelik servisi henüz hazır değil.');
  const [appSdk,sdk]=await Promise.all([import('firebase/app'),import('firebase/auth')]);
  const app=appSdk.getApps().find(a=>a.name==='kelime-membership')??appSdk.initializeApp(config,'kelime-membership');
  const auth=sdk.getAuth(app);auth.languageCode='tr';
  await auth.authStateReady();
  active={auth,sdk};return active;
 })().catch(error=>{pending=null;throw error;});
 return pending;
}
export async function bearerHeaders(force=false):Promise<Record<string,string>>{
 const user=active?.auth.currentUser;
 return user?{Authorization:'Bearer '+await user.getIdToken(force)}:{};
}
export async function memberFetch(path:string,init:RequestInit={}):Promise<Response>{
 if(!path.startsWith('/api/'))throw new Error('Geçersiz istek adresi');
 const headers=new Headers(init.headers);for(const [k,v] of Object.entries(await bearerHeaders()))headers.set(k,v);
 let response=await fetch(path,{...init,headers,cache:'no-store'});
 if(response.status===401&&active?.auth.currentUser){
  const fresh=await bearerHeaders(true);for(const [k,v] of Object.entries(fresh))headers.set(k,v);
  response=await fetch(path,{...init,headers,cache:'no-store'});
 }
 return response;
}
export function continueSettings(returnTo:string){return {url:location.origin+safeReturnTo(returnTo),handleCodeInApp:false};}
export async function signIn(email:string,password:string,remember:boolean){
 const {auth,sdk}=await getAuthClient();await sdk.setPersistence(auth,remember?sdk.browserLocalPersistence:sdk.browserSessionPersistence);
 return sdk.signInWithEmailAndPassword(auth,email.trim(),password);
}
export async function register(email:string,password:string,username:string,returnTo:string){
 const {auth,sdk}=await getAuthClient();await sdk.setPersistence(auth,sdk.browserLocalPersistence);
 const result=await sdk.createUserWithEmailAndPassword(auth,email.trim(),password);
 await sdk.updateProfile(result.user,{displayName:username});
 // The display name is only an onboarding suggestion; server uniqueness is authoritative.
 try{await sdk.sendEmailVerification(result.user,continueSettings(returnTo));}
 catch(error){window.dispatchEvent(new Event('kt-auth-updated'));throw error;}
 window.dispatchEvent(new Event('kt-auth-updated'));return result;
}
export async function sendVerification(returnTo:string){const {auth,sdk}=await getAuthClient();if(!auth.currentUser)throw new Error('Önce giriş yap.');await sdk.sendEmailVerification(auth.currentUser,continueSettings(returnTo));}
export async function reloadMember():Promise<User|null>{const {auth,sdk}=await getAuthClient();if(auth.currentUser){await sdk.reload(auth.currentUser);await auth.currentUser.getIdToken(true);}window.dispatchEvent(new Event('kt-auth-updated'));return auth.currentUser;}
export async function resetEmail(email:string,returnTo:string){
 const {auth,sdk}=await getAuthClient();
 try{await sdk.sendPasswordResetEmail(auth,email.trim(),continueSettings(returnTo));}
 catch(error){if(!(error&&typeof error==='object'&&'code' in error&&error.code==='auth/user-not-found'))throw error;}
}
export async function signOutMember(){const {auth,sdk}=await getAuthClient();await sdk.signOut(auth);window.dispatchEvent(new Event('kt-auth-updated'));}
