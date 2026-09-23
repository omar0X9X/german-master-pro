window.GMP=window.GMP||{};
(()=>{
const G=window.GMP,KEY="gmp.state.v1",THEME="gmp.theme.v1",DAY=86400000;
const defaults={
  profile:{level:"A1",minutes:210,goal:"general",onboarded:false},
  completedLessons:{},completedResources:{},completedGrammar:{},grammarDrills:{},reviewRecords:{},quizResults:[],activity:[],
  lastView:"dashboard",practiceSkill:"الكل",
  dailyChecks:{},dailyWriting:{},dailySpeaking:{},dailySelected:{A1:1,A2:1,B1:1,B2:1},zeroPathDone:{},zeroPathCurrent:1,
  errorAttempts:[],errorNotebook:[],errorManual:[],
  notebookPages:{},cartoonProgress:{},cartoonNotes:{},
  missionChecks:{},missionSelected:{A1:1,A2:1,B1:1,B2:1},missionNotes:{},missionVideoHistory:{A1:[],A2:[],B1:[],B2:[]}
};
const merge=(a,b)=>{Object.keys(b||{}).forEach(k=>{if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])){a[k]=merge(a[k]&&typeof a[k]==="object"?a[k]:{},b[k])}else a[k]=b[k]});return a};
const load=()=>{try{return merge(JSON.parse(JSON.stringify(defaults)),JSON.parse(localStorage.getItem(KEY))||{})}catch{return JSON.parse(JSON.stringify(defaults))}};
G.DAY=DAY;G.state=load();G.data={curriculum:null,quizzes:null,vocabulary:null,daily:null,videos:null,grammar:null,zero:null,studyMethod:null,errorEngine:null,cartoons:null,mission:null};G.runtime={view:"dashboard",roadmapLevel:"A1",dailyLevel:null,grammarSection:"alphabet",grammarSearch:"",zeroSelected:null,notebookSource:"video",notebookMode:"daily",cartoonLevel:null,cartoonItemId:null,missionLevel:null,missionStageId:null,errorLevel:"A1",errorSkill:"all",errorExerciseId:null,errorTab:"train",errorReorder:[],toastTimer:null,mediaRecorder:null,mediaStream:null,mediaChunks:[],mediaUrl:null,speakingTimer:null,speakingStartedAt:null};
G.save=()=>localStorage.setItem(KEY,JSON.stringify(G.state));
G.reset=()=>{G.state=JSON.parse(JSON.stringify(defaults));G.save()};
G.dateKey=(d=new Date())=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
G.touch=()=>{const d=G.dateKey();if(!G.state.activity.includes(d))G.state.activity.push(d);G.state.activity=[...new Set(G.state.activity)].sort().slice(-500)};
G.streak=()=>{const set=new Set(G.state.activity);let d=new Date();if(!set.has(G.dateKey(d)))d.setDate(d.getDate()-1);let n=0;while(set.has(G.dateKey(d))){n++;d.setDate(d.getDate()-1)}return n};
G.level=id=>G.data.curriculum.levels.find(x=>x.id===id)||G.data.curriculum.levels[0];
G.currentLevel=()=>G.level(G.state.profile.level);
G.lessons=(level=G.currentLevel())=>level.modules.flatMap(m=>m.lessons.map(l=>({...l,moduleId:m.id,moduleTitle:m.title,quizId:m.quizId})));
G.resources=(level=G.currentLevel())=>level.resources||[];
G.lessonDone=id=>Boolean(G.state.completedLessons[id]);G.resourceDone=id=>Boolean(G.state.completedResources[id]);
G.grammarTopic=id=>G.data.grammar?.sections?.flatMap(s=>s.topics).find(x=>x.id===id)||null;
G.grammarDone=id=>Boolean(G.state.completedGrammar[id]);
G.toggleGrammar=id=>{if(G.grammarDone(id))delete G.state.completedGrammar[id];else{G.state.completedGrammar[id]=Date.now();G.touch()}G.save()};
G.saveGrammarDrill=(id,correct,choice)=>{G.state.grammarDrills[id]={correct:Boolean(correct),choice,at:Date.now()};if(correct&&!G.grammarDone(id))G.state.completedGrammar[id]=Date.now();G.touch();G.save()};
G.grammarProgress=(sectionId=null)=>{const sections=G.data.grammar?.sections||[];const topics=sectionId?(sections.find(s=>s.id===sectionId)?.topics||[]):sections.flatMap(s=>s.topics);const done=topics.filter(t=>G.grammarDone(t.id)).length;return{done,total:topics.length,pct:topics.length?Math.round(done/topics.length*100):0}};
G.toggleLesson=id=>{if(G.lessonDone(id))delete G.state.completedLessons[id];else{G.state.completedLessons[id]=Date.now();G.touch()}G.save()};
G.toggleResource=id=>{if(G.resourceDone(id))delete G.state.completedResources[id];else{G.state.completedResources[id]=Date.now();G.touch()}G.save()};
G.nextLesson=(level=G.currentLevel())=>G.lessons(level).find(l=>!G.lessonDone(l.id))||null;
G.bestQuiz=id=>{const s=G.state.quizResults.filter(x=>x.quizId===id).map(x=>x.score);return s.length?Math.max(...s):null};
G.quizAvg=()=>G.state.quizResults.length?Math.round(G.state.quizResults.reduce((a,b)=>a+b.score,0)/G.state.quizResults.length):null;
G.moduleProgress=m=>{const total=m.lessons.length,done=m.lessons.filter(l=>G.lessonDone(l.id)).length;return{total,done,pct:total?Math.round(done/total*100):0}};
G.levelProgress=(level=G.currentLevel())=>{const ls=G.lessons(level),rs=G.resources(level),ld=ls.filter(x=>G.lessonDone(x.id)).length,rd=rs.filter(x=>G.resourceDone(x.id)).length;const lp=ls.length?ld/ls.length:0,rp=rs.length?rd/rs.length:0;const qs=level.modules.map(m=>G.bestQuiz(m.quizId)).filter(v=>v!=null);const qp=level.modules.length?qs.reduce((s,v)=>s+v/100,0)/level.modules.length:0;return{pct:Math.round((lp*.65+rp*.2+qp*.15)*100),lessonDone:ld,lessonTotal:ls.length,practiceDone:rd,practiceTotal:rs.length}};

G.zeroSteps=()=>G.data.zero?.steps||[];
G.zeroDone=id=>Boolean(G.state.zeroPathDone[id]);
G.zeroProgress=()=>{const steps=G.zeroSteps(),done=steps.filter(x=>G.zeroDone(x.id)).length;return{done,total:steps.length,pct:steps.length?Math.round(done/steps.length*100):0}};
G.zeroCurrentStep=()=>{const steps=G.zeroSteps();const n=Math.max(1,Math.min(steps.length,Number(G.state.zeroPathCurrent)||1));return steps[n-1]||steps[0]||null};
G.zeroCanOpen=index=>{const n=Number(index);return n<=Math.max(1,Number(G.state.zeroPathCurrent)||1)};
G.completeZeroStep=id=>{
  const steps=G.zeroSteps(),idx=steps.findIndex(x=>x.id===id);
  if(idx<0)return;
  G.state.zeroPathDone[id]=Date.now();G.touch();
  const next=Math.min(steps.length,idx+2);
  if(next>(Number(G.state.zeroPathCurrent)||1))G.state.zeroPathCurrent=next;
  G.save();
};
G.openZeroStep=index=>{if(G.zeroCanOpen(index)){G.state.zeroPathCurrent=Math.max(Number(G.state.zeroPathCurrent)||1,Number(index));G.runtime.zeroSelected=Number(index);G.save()}};
G.dailyProgram=(levelId=G.state.profile.level)=>G.data.daily?.levels?.find(x=>x.level===levelId)||null;
G.dailyDay=(levelId=G.state.profile.level,day=null)=>{
  const p=G.dailyProgram(levelId);if(!p)return null;
  const d=Number(day||G.state.dailySelected[levelId]||1);
  return p.days.find(x=>x.day===d)||p.days[0]||null;
};
G.videoById=id=>G.data.videos?.videos?.find(x=>x.id===id)||null;
G.dailyKey=(levelId,day,type)=>levelId+"::"+day+"::"+type;
G.dailyDone=(levelId,day,type)=>Boolean(G.state.dailyChecks[G.dailyKey(levelId,day,type)]);
G.setDailyDone=(levelId,day,type,value=true)=>{
  const k=G.dailyKey(levelId,day,type);
  if(value)G.state.dailyChecks[k]=Date.now();else delete G.state.dailyChecks[k];
  if(value)G.touch();G.save();
};
G.dailyVideoDone=(levelId,day,videoId)=>G.dailyDone(levelId,day,"video::"+videoId);
G.dailyDayProgress=(levelId=G.state.profile.level,day=null)=>{
  const d=G.dailyDay(levelId,day);if(!d)return{done:0,total:0,pct:0,complete:false};
  const items=[...d.videos.map(id=>"video::"+id),"grammar","listening","reading","writing","speaking"];
  const done=items.filter(type=>G.dailyDone(levelId,d.day,type)).length;
  return{done,total:items.length,pct:items.length?Math.round(done/items.length*100):0,complete:done===items.length};
};
G.dailyLevelProgress=(levelId=G.state.profile.level)=>{
  const p=G.dailyProgram(levelId);if(!p)return{done:0,total:0,pct:0};
  const done=p.days.filter(d=>G.dailyDayProgress(levelId,d.day).complete).length;
  return{done,total:p.days.length,pct:p.days.length?Math.round(done/p.days.length*100):0};
};
G.nextDailyDay=(levelId=G.state.profile.level)=>{
  const p=G.dailyProgram(levelId);if(!p)return 1;
  const next=p.days.find(d=>!G.dailyDayProgress(levelId,d.day).complete);
  return next?next.day:p.days.length;
};
G.selectDailyDay=(levelId,day)=>{G.state.dailySelected[levelId]=Math.max(1,Math.min(30,Number(day)||1));G.save()};
G.dailyWritingKey=(levelId,day)=>levelId+"::"+day;
G.getDailyWriting=(levelId,day)=>G.state.dailyWriting[G.dailyWritingKey(levelId,day)]||"";
G.setDailyWriting=(levelId,day,text)=>{G.state.dailyWriting[G.dailyWritingKey(levelId,day)]=String(text||"").slice(0,12000);G.save()};
G.dailySpeakingKey=(levelId,day)=>levelId+"::"+day;
G.getDailySpeaking=(levelId,day)=>G.state.dailySpeaking[G.dailySpeakingKey(levelId,day)]||{rating:null,seconds:0,note:""};
G.setDailySpeaking=(levelId,day,patch)=>{const k=G.dailySpeakingKey(levelId,day);G.state.dailySpeaking[k]={...G.getDailySpeaking(levelId,day),...(patch||{})};G.save()};
G.notebookKey=(level=G.state.profile.level,date=G.dateKey())=>level+"::"+date;
G.getNotebookPage=(level=G.state.profile.level,date=G.dateKey())=>G.state.notebookPages[G.notebookKey(level,date)]||{level,date,theme:"",rule:"",examples:["",""],words:Array(7).fill(""),sentences:["","",""],mistakeWrong:"",mistakeRight:"",mistakeWhy:"",recall:"",summary:"",review:{d1:false,d3:false,d7:false}};
G.saveNotebookPage=(level,date,page)=>{const k=G.notebookKey(level,date);G.state.notebookPages[k]={...G.getNotebookPage(level,date),...(page||{}),level,date,updatedAt:Date.now()};G.touch();G.save()};
G.cartoonLevelData=level=>G.data.cartoons?.levels?.find(x=>x.level===level)||null;
G.cartoonItem=id=>G.data.cartoons?.levels?.flatMap(x=>x.items).find(x=>x.id===id)||null;
G.cartoonDone=id=>Boolean(G.state.cartoonProgress[id]?.doneAt);
G.setCartoonDone=(id,done=true)=>{if(done)G.state.cartoonProgress[id]={...(G.state.cartoonProgress[id]||{}),doneAt:Date.now()};else delete G.state.cartoonProgress[id];if(done)G.touch();G.save()};
G.getCartoonNotes=id=>G.state.cartoonNotes[id]||{summary:"",words:"",sentences:"",reflection:""};
G.setCartoonNotes=(id,patch)=>{G.state.cartoonNotes[id]={...G.getCartoonNotes(id),...(patch||{}),updatedAt:Date.now()};G.save()};
G.cartoonProgressForLevel=level=>{const items=G.cartoonLevelData(level)?.items||[],done=items.filter(x=>G.cartoonDone(x.id)).length;return{done,total:items.length,pct:items.length?Math.round(done/items.length*100):0}};
G.missionKey=(level,day,stage)=>level+"::"+day+"::"+stage;
G.missionDone=(level,day,stage)=>Boolean(G.state.missionChecks[G.missionKey(level,day,stage)]);
G.setMissionDone=(level,day,stage,done=true)=>{
  const k=G.missionKey(level,day,stage);
  if(done)G.state.missionChecks[k]=Date.now();else delete G.state.missionChecks[k];
  if(done)G.touch();G.save();
};
G.getMissionNotes=(level,day)=>G.state.missionNotes[level+"::"+day]||{videoTitle:"",listeningVideoTitle:"",textRecall:"",dialogueNotes:"",cartoonTitle:"",cartoonSummary:"",production:"",reviewNote:""};
G.setMissionNotes=(level,day,patch)=>{const k=level+"::"+day;G.state.missionNotes[k]={...G.getMissionNotes(level,day),...(patch||{}),updatedAt:Date.now()};G.save()};
G.missionStages=()=>G.data.mission?.stages||[];
G.missionDayProgress=(level,day)=>{
  const stages=G.missionStages(),done=stages.filter(x=>G.missionDone(level,day,x.id)).length;
  return{done,total:stages.length,pct:stages.length?Math.round(done/stages.length*100):0,complete:stages.length>0&&done===stages.length};
};
G.missionLevelProgress=level=>{
  const days=G.dailyProgram(level)?.days||[],done=days.filter(x=>G.missionDayProgress(level,x.day).complete).length;
  return{done,total:days.length,pct:days.length?Math.round(done/days.length*100):0};
};



G.escape=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
G.url=v=>{try{const u=new URL(v);return["https:","http:"].includes(u.protocol)?u.href:"#"}catch{return"#"}};
G.theme={init(){const s=localStorage.getItem(THEME),d=matchMedia?.("(prefers-color-scheme: dark)").matches;this.set(s||(d?"dark":"light"))},set(t){document.documentElement.dataset.theme=t;localStorage.setItem(THEME,t)},toggle(){this.set(document.documentElement.dataset.theme==="dark"?"light":"dark")}};
})();