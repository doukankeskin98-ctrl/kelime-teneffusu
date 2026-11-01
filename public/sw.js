const CACHE='kelime-studio-v3-20261021';
const BUILD_ASSETS=[];
const SHELL=['/','/favicon.svg','/icon-192.png','/icon-512.png','/manifest.webmanifest',...BUILD_ASSETS];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('kelime-studio-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='ACTIVATE')self.skipWaiting();});
// Cache storage is an optional optimization after installation. A quota/privacy
// failure must never turn a successful network response into a failed page.
async function openCache(){try{return await caches.open(CACHE);}catch{return null;}}
async function cachedResponse(cache,request){try{return cache?await cache.match(request):undefined;}catch{return undefined;}}
async function remember(cache,request,response){try{if(cache)await cache.put(request,response.clone());}catch{}}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // API, identity, email action links and private responses are never cached.
 if(url.pathname.startsWith('/api/')||url.pathname==='/uye'||url.pathname.startsWith('/yonetim')||url.pathname.includes('signin')||url.pathname.includes('signout')||url.pathname.includes('callback'))return;
 if(request.mode==='navigate'&&url.pathname==='/'){
  event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok&&(response.headers.get('Content-Type')||'').includes('text/html'))await remember(await openCache(),'/',response);return response;}catch{const cached=await cachedResponse(await openCache(),'/');return cached||new Response('Teneffüsüne hazırlanmak için önce bir kez internete bağlan.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());return;
 }
 const asset=/\.(?:js|css|woff2|png|svg)$/.test(url.pathname)&&(url.pathname.startsWith('/assets/')||url.pathname.startsWith('/_next/')||SHELL.includes(url.pathname));
 if(asset)event.respondWith((async()=>{const cache=await openCache(),cached=await cachedResponse(cache,request);if(cached)return cached;const response=await fetch(request);if(response.ok&&cache){await remember(cache,request,response);try{const keys=await cache.keys();if(keys.length>180){const removable=keys.find(k=>!SHELL.includes(new URL(k.url).pathname));if(removable)await cache.delete(removable);}}catch{}}return response;})());
});
