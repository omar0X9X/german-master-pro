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

G.missionVideoPair=(level,targetDay)=>{
  const days=G.dailyProgram(level)?.days||[],used=new Set(),playlist=G.data.mission?.videoPlaylists?.[level];
  let result={main:null,listening:null};
  for(const d of days){
    if(d.day>targetDay)break;
    const mainCandidates=(d.videos||[]).map(G.videoById).filter(Boolean);
    const mainDirect=mainCandidates.find(v=>!used.has("video::"+v.id));
    let main;
    if(mainDirect){
      used.add("video::"+mainDirect.id);
      main={mode:"direct",id:mainDirect.id,title:mainDirect.title,provider:mainDirect.provider,url:mainDirect.url,minutes:mainDirect.minutes||20,skill:mainDirect.skill,why:"مختار لأنه مربوط مباشرة بموضوع اليوم وما استعملناهش قبل كدرس أو استماع في هاد المسار."};
    }else if(playlist){
      const position=d.day;
      used.add("playlist::"+position);
      main={mode:"playlist",id:"playlist-"+level+"-"+position,title:"الفيديو الجديد رقم "+position+" من Playlist "+level,provider:playlist.provider,url:playlist.url,minutes:20,skill:"استماع/فهم",position,why:"الفيديوهات المخصصة تكررت؛ لذلك ننتقل لعنصر جديد من Playlist الرسمية للمستوى."};
    }

    const listenId=d.listening?.videoId,listenDirect=listenId?G.videoById(listenId):null;
    let listening;
    if(listenDirect&&!used.has("video::"+listenDirect.id)){
      used.add("video::"+listenDirect.id);
      listening={mode:"direct",id:listenDirect.id,title:listenDirect.title,provider:listenDirect.provider,url:listenDirect.url,minutes:Math.min(20,listenDirect.minutes||15),why:"فيديو استماع مرتبط باليوم ولم يُستعمل قبل كدرس أو استماع."};
    }else if(playlist){
      const position=30+d.day;
      used.add("playlist::"+position);
      listening={mode:"playlist",id:"listen-playlist-"+level+"-"+position,title:"فيديو الاستماع الجديد رقم "+position+" من Playlist "+level,provider:playlist.provider,url:playlist.url,minutes:15,position,why:"مصدر الاستماع المخصص سبق استعماله؛ لذلك نأخذ عنصراً آخر جديداً من جزء مختلف من Playlist الرسمية."};
    }

    if(d.day===targetDay){result={main,listening};break}
  }
  return result;
};

G.missionVideo=(level,day)=>G.missionVideoPair(level,day).main;
G.missionListeningVideo=(level,day)=>G.missionVideoPair(level,day).listening;

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
