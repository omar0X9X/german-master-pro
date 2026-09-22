(function(){
"use strict";
const STORE={done:"learnGerman.done.v2",theme:"learnGerman.theme.v2",level:"learnGerman.level.v2"};
const state={data:null,level:localStorage.getItem(STORE.level)||"A1",filter:"الكل",done:new Set(JSON.parse(localStorage.getItem(STORE.done)||"[]"))};
const $=s=>document.querySelector(s);
const els={levels:[...document.querySelectorAll(".level-btn")],label:$("#levelLabel"),title:$("#levelTitle"),goal:$("#levelGoal"),count:$("#resourceCount"),catCount:$("#categoryCount"),roadmap:$("#roadmap"),filters:$("#filters"),resources:$("#resources"),pct:$("#progressPercent"),bar:$("#progressBar"),text:$("#progressText"),theme:$("#themeToggle"),reset:$("#resetProgress")};

function level(){return state.data.levels.find(x=>x.id===state.level)||state.data.levels[0]}
function save(){localStorage.setItem(STORE.done,JSON.stringify([...state.done]));localStorage.setItem(STORE.level,state.level)}
function key(r){return state.level+"::"+r.id}
function applyTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(STORE.theme,t);els.theme.textContent=t==="dark"?"☀":"☾";els.theme.setAttribute("aria-label",t==="dark"?"تفعيل الوضع الفاتح":"تفعيل الوضع الليلي")}
function initTheme(){const saved=localStorage.getItem(STORE.theme);const dark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;applyTheme(saved||(dark?"dark":"light"))}
function categories(){return ["الكل",...new Set(level().resources.map(r=>r.skill))]}

function renderLevel(){
 const d=level();
 els.levels.forEach(b=>b.classList.toggle("active",b.dataset.level===state.level));
 els.label.textContent=d.id+" • "+d.label;
 els.title.textContent=d.title;
 els.goal.textContent=d.goal;
 els.count.textContent=d.resources.length;
 els.catCount.textContent=new Set(d.resources.map(r=>r.skill)).size;
}

function renderRoadmap(){
 els.roadmap.innerHTML="";
 level().roadmap.forEach((step,i)=>{
  const card=document.createElement("article");card.className="step-card";
  card.innerHTML='<div class="step-no">'+(i+1)+'</div><h3>'+step.title+'</h3><p>'+step.text+'</p>';
  els.roadmap.appendChild(card);
 });
}

function renderFilters(){
 els.filters.innerHTML="";
 categories().forEach(c=>{
  const b=document.createElement("button");b.type="button";b.className="filter-btn"+(c===state.filter?" active":"");b.textContent=c;
  b.addEventListener("click",()=>{state.filter=c;renderFilters();renderResources()});els.filters.appendChild(b);
 });
}

function renderResources(){
 const list=level().resources.filter(r=>state.filter==="الكل"||r.skill===state.filter);
 els.resources.innerHTML="";
 if(!list.length){els.resources.innerHTML='<p class="empty">لا توجد موارد في هذا التصنيف.</p>';return}
 list.forEach(r=>{
  const done=state.done.has(key(r));
  const card=document.createElement("article");card.className="resource-card"+(done?" done":"");
  card.innerHTML=
   '<div class="resource-top"><div class="resource-provider"><span class="type-dot '+(r.type==="site"?"site":"")+'"></span><span class="provider-name">'+r.provider+'</span></div><span class="badge">'+r.skill+'</span></div>'+
   '<h3>'+r.title+'</h3><p>'+r.note+'</p>'+
   '<div class="resource-actions"><a class="open-link" href="'+r.url+'" target="_blank" rel="noopener noreferrer">'+(r.type==="youtube"?"فتح الفيديو":"فتح الموقع")+'</a><button type="button" class="done-btn">'+(done?"✓ مكتمل":"علّم كمكتمل")+'</button></div>';
  card.querySelector(".done-btn").addEventListener("click",()=>{const k=key(r);state.done.has(k)?state.done.delete(k):state.done.add(k);save();renderResources();renderProgress()});
  els.resources.appendChild(card);
 });
}

function renderProgress(){
 const all=state.data.levels.flatMap(l=>l.resources.map(r=>l.id+"::"+r.id));
 const done=all.filter(k=>state.done.has(k)).length;const pct=all.length?Math.round(done/all.length*100):0;
 els.pct.textContent=pct+"%";els.bar.style.width=pct+"%";els.text.textContent=done+" من "+all.length+" مورد مكتمل";
}

function renderAll(){renderLevel();renderRoadmap();renderFilters();renderResources();renderProgress()}

els.levels.forEach(b=>b.addEventListener("click",()=>{state.level=b.dataset.level;state.filter="الكل";save();renderAll()}));
els.theme.addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
els.reset.addEventListener("click",()=>{if(!confirm("مسح جميع علامات التقدم؟"))return;state.done.clear();save();renderAll()});
initTheme();

fetch("./data/curriculum.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(data=>{
 state.data=data;if(!data.levels.some(x=>x.id===state.level))state.level="A1";renderAll();
}).catch(err=>{console.error(err);els.resources.innerHTML='<p class="empty">تعذر تحميل ملف الموارد.</p>'});
})();