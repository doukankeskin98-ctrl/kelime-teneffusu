/** Small, local API fallbacks used by the existing client. No network polyfill bundle. */
export function installBrowserCompat(root:Pick<typeof globalThis,'Array'|'Promise'|'crypto'>){
 if(!root.Array.prototype.at)Object.defineProperty(root.Array.prototype,'at',{configurable:true,writable:true,value:function(this:unknown[],index:number){
  if(this==null)throw new TypeError('Array.at receiver is null');
  const list=Object(this),length=Math.min(Math.max(Math.floor(Number(list.length)||0),0),Number.MAX_SAFE_INTEGER),integer=Math.trunc(Number(index)||0),position=integer<0?length+integer:integer;
  return position<0||position>=length?undefined:list[position];
 }});
 if(!root.Promise.allSettled)Object.defineProperty(root.Promise,'allSettled',{configurable:true,writable:true,value:function(this:PromiseConstructor,values:Iterable<unknown>){
  const C=this;return C.all(Array.from(values,value=>C.resolve(value).then(value=>({status:'fulfilled',value}),reason=>({status:'rejected',reason}))));
 }});
 if(root.crypto?.getRandomValues&&!root.crypto.randomUUID)Object.defineProperty(root.crypto,'randomUUID',{configurable:true,value:()=>{
  const bytes=root.crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]!&15)|64;bytes[8]=(bytes[8]!&63)|128;
  const hex=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
 }});
}
if(typeof window!=='undefined')installBrowserCompat(window);
