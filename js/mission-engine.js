window.GMP=window.GMP||{};
(()=>{
const G=window.GMP;

G.missionUnlockStatus=(level="A1")=>{
  const zero=G.zeroProgress(),a1=G.grammarProgress("A1"),gp=G.grammarProgress(level);
  const globalUnlocked=zero.total>0&&zero.pct===100&&a1.total>0&&a1.pct===100;
  const levelUnlocked=level==="A1"?globalUnlocked:(globalUnlocked&&gp.total>0&&gp.pct===100);
  return{
    globalUnlocked,levelUnlocked,zero,a1,grammar:gp,
    reason:!globalUnlocked?"كمّل مسار الحروف من الصفر وقواعد A1 أولاً.":(!levelUnlocked?"كمّل قواعد "+level+" باش يتحل طريق هاد المستوى.":"مفتوح")
  };
};

G.missionDayUnlocked=(level,day)=>{
  if(!G.missionUnlockStatus(level).levelUnlocked)return false;
  const d=Number(day);
  if(d<=1)return true;
  return G.missionDayProgress(level,d-1).complete;
};

G.missionNextDay=(level=G.state.profile.level)=>{
  const days=G.dailyProgram(level)?.days||[];
  for(const d of days){
    if(!G.missionDayProgress(level,d.day).complete)return d.day;
  }
  return days.length||30;
};

G.missionStageUnlocked=(level,day,stageId)=>{
  if(!G.missionDayUnlocked(level,day))return false;
  const stages=G.missionStages(),idx=stages.findIndex(x=>x.id===stageId);
  if(idx<=0)return idx===0;
  return stages.slice(0,idx).every(x=>G.missionDone(level,day,x.id));
};

G.missionCurrentStage=(level,day)=>{
  const stages=G.missionStages();
  return stages.find(x=>!G.missionDone(level,day,x.id))||stages[stages.length-1]||null;
};

G.missionVideo=(level,day)=>{
  const days=G.dailyProgram(level)?.days||[],used=new Set();
  for(const d of days){
    if(d.day>day)break;
    const candidates=(d.videos||[]).map(G.videoById).filter(Boolean);
    const direct=candidates.find(v=>!used.has(v.id));
    if(direct){
      used.add(direct.id);
      if(d.day===day)return{mode:"direct",id:direct.id,title:direct.title,provider:direct.provider,url:direct.url,minutes:direct.minutes||20,skill:direct.skill,why:"مختار لأنه مربوط مباشرة بموضوع اليوم وما استعملناهش في يوم سابق من نفس المسار."};
    }
    if(d.day===day){
      const p=G.data.mission?.videoPlaylists?.[level];
      if(!p)return null;
      return{mode:"playlist",id:"playlist-"+level+"-"+day,title:"الفيديو الجديد رقم "+day+" من Playlist "+level,provider:p.provider,url:p.url,minutes:20,skill:"استماع/فهم",position:day,why:"الفيديوهات المخصصة لهذا اليوم تكررت سابقاً، لذلك ننتقل تلقائياً إلى عنصر جديد من Playlist الرسمية للمستوى."};
    }
  }
  return null;
};

G.missionListeningVideo=(level,day)=>{
  const days=G.dailyProgram(level)?.days||[],used=new Set();
  const main=G.missionVideo(level,day);
  for(const d of days){
    if(d.day>day)break;
    const id=d.listening?.videoId,v=id?G.videoById(id):null;
    if(v&&v.id!==main?.id&&!used.has(v.id)){
      used.add(v.id);
      if(d.day===day)return{mode:"direct",id:v.id,title:v.title,provider:v.provider,url:v.url,minutes:Math.min(20,v.minutes||15),why:"هذا فيديو الاستماع المرتبط باليوم ولم يُستخدم قبل ذلك كاستماع في المسار."};
    }
    if(d.day===day){
      const p=G.data.mission?.videoPlaylists?.[level];if(!p)return null;
      const position=30+Number(day);
      return{mode:"playlist",id:"listen-playlist-"+level+"-"+day,title:"فيديو الاستماع الجديد رقم "+position+" من Playlist "+level,provider:p.provider,url:p.url,minutes:15,position,why:"مصدر الاستماع المخصص تكرر أو يساوي فيديو الدرس؛ لذلك نختار عنصراً آخر جديداً من Playlist الرسمية."};
    }
  }
  return null;
};

G.missionCartoon=(level,day)=>{
  const feeds=G.data.mission?.cartoonFeeds?.[level]||[];
  let n=Number(day);
  for(const feed of feeds){
    if(n<=feed.slots)return{...feed,slot:n,key:feed.id+"::"+n};
    n-=feed.slots;
  }
  return feeds.length?{...feeds[feeds.length-1],slot:n,key:feeds[feeds.length-1].id+"::"+n}:null;
};

G.missionDialogue=(level,day)=>{
  const d=G.dailyDay(level,day);if(!d)return[];
  const questions=G.data.mission?.dialoguePrompts?.[level]||[];
  const sentences=String(d.reading?.text||"")
    .split(/(?<=[.!?])\s+/)
    .map(x=>x.trim())
    .filter(Boolean);
  const answers=[
    sentences[0]||"Heute lerne ich Deutsch.",
    sentences[1]||sentences[0]||"Das Thema ist wichtig für mich.",
    sentences[2]||sentences[1]||"Danach übe ich weiter."
  ];
  const lines=[];
  for(let i=0;i<3;i++){
    lines.push({speaker:"A",text:questions[i]||"Was meinst du?"});
    lines.push({speaker:"B",text:answers[i]});
  }
  return lines;
};

G.missionDayData=(level,day)=>{
  const daily=G.dailyDay(level,day);if(!daily)return null;
  return{
    level,day,daily,
    video:G.missionVideo(level,day),
    listeningVideo:G.missionListeningVideo(level,day),
    dialogue:G.missionDialogue(level,day),
    cartoon:G.missionCartoon(level,day),
    notes:G.getMissionNotes(level,day),
    progress:G.missionDayProgress(level,day),
    stage:G.missionCurrentStage(level,day)
  };
};

G.completeMissionStage=(level,day,stageId)=>{
  if(!G.missionStageUnlocked(level,day,stageId))return false;
  G.setMissionDone(level,day,stageId,true);
  const p=G.missionDayProgress(level,day);
  if(p.complete){
    G.state.missionSelected[level]=Math.min(30,Number(day)+1);
    G.touch();G.save();
  }
  return true;
};

G.uncompleteMissionStage=(level,day,stageId)=>{
  const stages=G.missionStages(),idx=stages.findIndex(x=>x.id===stageId);
  stages.slice(idx).forEach(s=>G.setMissionDone(level,day,s.id,false));
};

})();
