const CACHE="gmp-shell-v8";
const ASSETS=["./","./index.html","./styles/base.css","./styles/components.css","./styles/responsive.css","./js/store.js","./js/engine.js","./js/error-engine.js","./js/mission-engine.js","./js/ui.js","./js/app.js","./data/curriculum.json","./data/quizzes.json","./data/vocabulary.json","./data/daily-plan.json","./data/videos.json","./data/grammar.json","./data/zero-path.json","./data/study-method.json","./data/error-engine.json","./data/cartoons.json","./data/daily-mission.json","./manifest.webmanifest","./assets/icon.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r}).catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html"))));
});