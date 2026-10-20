export const USERNAME_HELP='3–20 karakter; küçük harf, rakam ve alt çizgi.';
export function normalizeUsername(raw:unknown):string {
 if(typeof raw!=='string')return '';
 const name=raw.trim().toLowerCase();
 return /^[a-z][a-z0-9_]{2,19}$/.test(name)?name:'';
}
export function safeReturnTo(raw:unknown):string {
 if(typeof raw!=='string'||raw.length>600||!raw.startsWith('/')||raw.startsWith('//')||/[\\\r\n\0]/.test(raw))return '/';
 try{
  const url=new URL(raw,'https://game.invalid');
  if(url.origin!=='https://game.invalid'||url.pathname!=='/')return '/';
  const query=new URLSearchParams(),tab=url.searchParams.get('sekme'),room=url.searchParams.get('oda')?.toUpperCase();
  if(tab&&['arena','gunluk','profil','kesfet'].includes(tab))query.set('sekme',tab);
  if(room&&/^[A-HJ-NP-Z2-9]{8}$/.test(room)){query.set('oda',room);query.set('sekme','arena');}
  return '/'+(query.size?'?'+query.toString():'');
 }catch{return '/';}
}
export function emailContinueUrl(raw:unknown,origin:string):string {
 try{const url=new URL(typeof raw==='string'?raw:'/',origin);return url.origin===origin?safeReturnTo(url.pathname+url.search):'/';}catch{return '/';}
}
export const validPassword=(value:string)=>value.length>=10&&value.length<=128;
export function authMessage(error:unknown):string {
 const code=error&&typeof error==='object'&&'code' in error?String(error.code):'';
 const messages:Record<string,string>={
 'auth/invalid-credential':'E-posta veya şifre doğru değil.',
 'auth/wrong-password':'E-posta veya şifre doğru değil.',
 'auth/user-not-found':'E-posta veya şifre doğru değil.',
 'auth/email-already-in-use':'Bu e-posta ile giriş yapabilir veya şifreni yenileyebilirsin.',
 'auth/invalid-email':'Geçerli bir e-posta adresi yaz.',
 'auth/weak-password':'En az 10 karakterden oluşan daha güçlü bir şifre seç.',
 'auth/password-does-not-meet-requirements':'Şifren en az 10 karakter olmalı.',
 'auth/too-many-requests':'Kısa sürede çok fazla deneme yapıldı. Biraz sonra tekrar dene.',
 'auth/network-request-failed':'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.',
 'auth/expired-action-code':'Bu bağlantının süresi doldu. Yeni bir bağlantı iste.',
 'auth/invalid-action-code':'Bu bağlantı kullanılmış veya geçersiz. Yeni bir bağlantı iste.',
 'auth/user-disabled':'Bu hesaba şu an giriş yapılamıyor.',
 'auth/web-storage-unsupported':'Tarayıcında oturum kaydı kullanılamıyor. Gizlilik ayarlarını kontrol et.',
 };
 if(messages[code])return messages[code];
 return error instanceof Error&&!code?error.message:'İşlem tamamlanamadı. Lütfen tekrar dene.';
}
