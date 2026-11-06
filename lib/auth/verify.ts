import {createRemoteJWKSet,jwtVerify,type JWTVerifyGetKey,type JWTPayload} from 'jose';
export class IdentityError extends Error {
 status:number;constructor(message:string,status=401){super(message);this.status=status;}
}
export interface FirebaseConfig{projectId:string;apiKey:string}
export interface Principal {providerId:string;uid:string;email:string;verified:boolean}
const googleKeys=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),{timeoutDuration:5000,cacheMaxAge:600000,cooldownDuration:30000});
const cache=new Map<string,{until:number;user:Principal}>();
export async function verifyMemberToken(token:string,config:FirebaseConfig,options:{keys?:JWTVerifyGetKey;fetcher?:typeof fetch;now?:number;cache?:boolean}={}):Promise<Principal>{
 const now=options.now??Date.now(),seconds=Math.floor(now/1000);
 if(!config.projectId||!config.apiKey)throw new IdentityError('Üyelik servisi hazırlanıyor.',503);
 let payload:JWTPayload;
 try{({payload}=await jwtVerify(token,options.keys??googleKeys,{issuer:'https://securetoken.google.com/'+config.projectId,audience:config.projectId,algorithms:['RS256'],requiredClaims:['exp','iat','sub','auth_time'],currentDate:new Date(now),clockTolerance:5}));}
 catch{throw new IdentityError('Oturumun doğrulanamadı. Yeniden giriş yap.');}
 if(typeof payload.sub!=='string'||!payload.sub||payload.sub.length>128||typeof payload.iat!=='number'||payload.iat>seconds+5||typeof payload['auth_time']!=='number'||payload['auth_time']>seconds+5)throw new IdentityError('Oturumun doğrulanamadı.');
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const hit=cache.get(digest);if(options.cache!==false&&hit&&hit.until>now)return hit.user;
 let response:Response;
 try{response=await (options.fetcher??fetch)('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+encodeURIComponent(config.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),cache:'no-store',signal:AbortSignal.timeout(5000)});}
 catch{throw new IdentityError('Üyelik servisine ulaşılamıyor. Biraz sonra tekrar dene.',503);}
 if(!response.ok)throw new IdentityError(response.status>=500?'Üyelik servisine ulaşılamıyor.':'Oturumun sona ermiş. Yeniden giriş yap.',response.status>=500?503:401);
 const data=await response.json() as {users?:{localId?:string;email?:string;emailVerified?:boolean;disabled?:boolean;validSince?:string}[]};
 const user=data.users?.[0];
 const validSince=Number(user?.validSince??0);
 if(!user||user.localId!==payload.sub||user.disabled||typeof user.email!=='string'||!user.email||!Number.isFinite(validSince)||payload['auth_time']<validSince)throw new IdentityError('Oturumun sona ermiş. Yeniden giriş yap.');
 const result={providerId:config.projectId+':'+user.localId,uid:user.localId,email:user.email,verified:user.emailVerified===true};
 if(options.cache!==false){if(cache.size>=512)cache.delete(cache.keys().next().value!);cache.set(digest,{until:Math.min(now+30000,(payload.exp??seconds)*1000),user:result});}
 return result;
}

/** Destructive requests require a recent real login, not merely a refreshed token. */
export async function verifyRecentMemberToken(token:string,config:FirebaseConfig){
 const principal=await verifyMemberToken(token,config,{cache:false});
 const {payload}=await jwtVerify(token,googleKeys,{issuer:'https://securetoken.google.com/'+config.projectId,audience:config.projectId,algorithms:['RS256'],requiredClaims:['auth_time']});
 if(typeof payload['auth_time']!=='number'||Date.now()/1000-payload['auth_time']>300)throw new IdentityError('Hesabını silmek için şifrenle yeniden doğrula.',401);
 return principal;
}
export async function deleteProviderAccount(token:string,config:FirebaseConfig,providerId:string){
 let subject:string|undefined;
 try{const {payload}=await jwtVerify(token,googleKeys,{issuer:'https://securetoken.google.com/'+config.projectId,audience:config.projectId,algorithms:['RS256'],requiredClaims:['sub','exp']});subject=payload.sub;}catch{throw new IdentityError('Hesap kapanışını tamamlamak için yeniden giriş yap.',401);}
 if(config.projectId+':'+subject!==providerId)throw new IdentityError('Silme işlemi farklı bir hesaba ait.',403);
 let response:Response;try{response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:delete?key='+encodeURIComponent(config.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),cache:'no-store',signal:AbortSignal.timeout(5000)});}catch{throw new IdentityError('Oyun verilerin silindi. Üyelik servisi yanıt vermedi; hesap kapanışını tekrar dene.',503);}
 const data=await response.json() as {error?:{message?:string}};
 if(!response.ok&&data.error?.message!=='USER_NOT_FOUND')throw new IdentityError('Oyun verilerin silindi. Hesap kapanışı tamamlanamadı; yeniden doğrulayıp tekrar dene.',response.status>=500?503:401);
}
