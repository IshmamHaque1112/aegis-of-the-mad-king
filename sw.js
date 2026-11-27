// Offline cache: the whole game is one HTML file plus icons.
const C='aegis-v2-1';const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg','./icons/icon-192.png','./icons/icon-512.png','./fonts/PirataOne-Regular.ttf','./fonts/PixelifySans.ttf','./fonts/AlegreyaSans-Regular.ttf','./fonts/AlegreyaSans-Medium.ttf','./fonts/AlegreyaSans-Bold.ttf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl))}return res}).catch(()=>caches.match('./index.html'))))});
