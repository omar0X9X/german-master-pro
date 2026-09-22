window.GMP=window.GMP||{};
document.addEventListener("DOMContentLoaded",async()=>{
const G=window.GMP,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
try{
  const [c,q,v,daily,videos]=await Promise.all(["./data/curriculum.json","./data/quizzes.json","./data/vocabulary.json","./data/daily-plan.json","./data/videos.json"].map(async url=>{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error(url+" "+r.status);return r.json()}));
  G.data.curriculum=c;G.data.quizzes=q;G.data.vocabulary=v;G.data.daily=daily;G.data.videos=videos;
}catch(err){
  console.error(err);document.querySelector("main").innerHTML='<section class="card"><h2>تعذر تحميل بيانات المشروع</h2><p class="muted">شغّل الموقع عبر خادم HTTP، وليس file://، ثم أعد المحاولة.</p></section>';return;
}

G.theme.init();G.runtime.roadmapLevel=G.state.profile.level;G.runtime.dailyLevel=G.state.profile.level;if(!G.state.dailySelected[G.state.profile.level])G.selectDailyDay(G.state.profile.level,G.nextDailyDay(G.state.profile.level));
const theme=()=>{G.theme.toggle();G.ui.renderAll()};
$("#themeToggle").onclick=theme;$("#quickTheme").onclick=theme;
$$("[data-view]").forEach(b=>b.onclick=()=>G.ui.setView(b.dataset.view));
$$("[data-go]").forEach(b=>b.onclick=e=>{e.preventDefault();G.ui.setView(b.dataset.go)});
$("#settingsButton").onclick=()=>openSettings();
$("#closeQuiz").onclick=()=>$("#quizDialog").close();
$("#startToday").onclick=()=>{const p=G.todayPlan();if(p.tasks[0])G.ui.startTask(p.tasks[0]);else G.ui.toast("خطة اليوم مكتملة")};

function openSettings(){
  $("#settingsLevel").value=G.state.profile.level;$("#settingsMinutes").value=String(G.state.profile.minutes);$("#settingsGoal").value=G.state.profile.goal;$("#settingsDialog").showModal();
}
$("#settingsForm").addEventListener("submit",e=>{
  e.preventDefault();G.state.profile.level=$("#settingsLevel").value;G.state.profile.minutes=Number($("#settingsMinutes").value);G.state.profile.goal=$("#settingsGoal").value;G.runtime.roadmapLevel=G.state.profile.level;G.runtime.dailyLevel=G.state.profile.level;if(!G.state.dailySelected[G.state.profile.level])G.selectDailyDay(G.state.profile.level,G.nextDailyDay(G.state.profile.level));G.state.practiceSkill="الكل";G.save();$("#settingsDialog").close();G.ui.renderAll();G.ui.toast("تحفظت الإعدادات");
});
$("#resetButton").onclick=()=>{
  if(!confirm("غادي تتمسح الدروس والمراجعات والاختبارات من هاد المتصفح. متأكد؟"))return;
  G.reset();G.runtime.roadmapLevel="A1";G.runtime.dailyLevel="A1";$("#settingsDialog").close();G.ui.renderAll();$("#setupDialog").showModal();
};
$("#setupForm").addEventListener("submit",e=>{
  e.preventDefault();G.state.profile={level:$("#setupLevel").value,minutes:Number($("#setupMinutes").value),goal:$("#setupGoal").value,onboarded:true};G.runtime.roadmapLevel=G.state.profile.level;G.runtime.dailyLevel=G.state.profile.level;G.selectDailyDay(G.state.profile.level,G.nextDailyDay(G.state.profile.level));G.save();$("#setupDialog").close();G.ui.renderAll();G.ui.toast("الخطة واجدة");
});

const view=G.state.lastView||"dashboard";G.ui.renderAll();G.ui.setView(view);
if(!G.state.profile.onboarded)$("#setupDialog").showModal();

if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(console.warn);
});