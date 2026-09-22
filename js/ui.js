window.GMP=window.GMP||{};
(()=>{
const G=window.GMP,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const E=G.escape,U=G.url;
const titles={dashboard:["مسارك اليوم","الرئيسية"],daily:["120 يوم","30 يوم"],grammar:["82 درساً","القواعد والحروف"],roadmap:["A1 → B2","المسار"],review:["Spaced Review","المراجعة"],practice:["المهارات","التطبيق"],stats:["Progress","الإحصائيات"]};
const toast=msg=>{const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(G.runtime.toastTimer);G.runtime.toastTimer=setTimeout(()=>el.classList.remove("show"),1900)};
G.ui={toast};
G.ui.speakGerman=text=>{
  if(!("speechSynthesis" in window)){toast("المتصفح ما كيدعمش النطق الصوتي");return}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text||""));u.lang="de-DE";u.rate=.82;u.pitch=1;
  const voices=speechSynthesis.getVoices(),de=voices.find(v=>v.lang?.toLowerCase().startsWith("de"));
  if(de)u.voice=de;speechSynthesis.speak(u);
};

G.ui.setView=view=>{
  if(!titles[view])view="dashboard";G.runtime.view=view;G.state.lastView=view;G.save();
  $$("[data-panel]").forEach(x=>x.classList.toggle("active",x.dataset.panel===view));
  $$("[data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  $("#topEyebrow").textContent=titles[view][0];$("#topTitle").textContent=titles[view][1];
  G.ui.renderView(view);window.scrollTo({top:0,behavior:"smooth"});
};

G.ui.renderDashboard=()=>{
  const level=G.currentLevel(),p=G.levelProgress(level),next=G.nextLesson(),due=G.dueReviews().length,avg=G.quizAvg(),plan=G.todayPlan(),coach=G.coach(),zero=G.zeroProgress(),zeroStep=G.zeroCurrentStep();
  $("#levelChip").textContent=level.id;$("#progressLevel").textContent=level.id;$("#progressPct").textContent=p.pct+"%";$("#progressRing").style.setProperty("--p",(p.pct*3.6)+"deg");
  const foundation=level.id==="A1"&&zero.total&&zero.pct<100;
  $("#heroTitle").textContent=foundation?("ابدأ من الصفر • الخطوة "+G.state.zeroPathCurrent):next?"كمّل "+level.id+" خطوة بخطوة.":"كملت مسار "+level.id+" الحالي.";
  $("#heroText").textContent=foundation?(zeroStep?.title+" — الموقع غادي يدوزك تلقائياً للخطوة اللي بعدها."):due?("عندك "+due+" مراجعات مستحقة، وبعدها الدرس التالي."):"المحرك رتب لك درساً وتطبيقاً حسب تقدمك.";
  $("#nextLessonMetric").textContent=next?("درس "+String(next.order).padStart(2,"0")):"مكتمل";$("#nextLessonName").textContent=next?next.title:"راجع الاختبارات";
  $("#dueMetric").textContent=due;$("#streakMetric").textContent=G.streak();$("#quizMetric").textContent=avg==null?"—":avg+"%";$("#reviewBadge").hidden=!due;$("#reviewBadge").textContent=due;
  $("#coachTitle").textContent=coach.title;$("#coachText").textContent=coach.text;
  const skill=$("#skillBars");skill.innerHTML=G.skillCoverage(level).map(x=>'<div class="skill-row"><div><span>'+E(x.skill)+'</span><b>'+x.pct+'%</b></div><div class="track"><i style="width:'+x.pct+'%"></i></div></div>').join("");
  $("#planMinutes").textContent=plan.minutes;
  $("#todayPlan").innerHTML=plan.tasks.length?plan.tasks.map((t,i)=>'<article class="task '+(t.type==="review"?"review":"")+'"><span class="task-num">'+(i+1)+'</span><div><strong>'+E(t.title)+'</strong><span>'+E(t.detail)+' • ≈ '+t.minutes+' د</span></div><button data-task="'+i+'">ابدأ</button></article>').join(""):'<div class="empty"><b>ما كاين حتى عنصر جديد</b>راجع المستوى أو اختبر نفسك.</div>';
  $$("#todayPlan [data-task]").forEach(btn=>btn.onclick=()=>G.ui.startTask(plan.tasks[Number(btn.dataset.task)]));
  const c=$("#continueLesson");
  c.innerHTML=next?'<div class="continue-box"><span>'+String(next.order).padStart(2,"0")+'</span><div><h4>'+E(next.title)+'</h4><p>'+E(next.skill)+" • "+E(next.provider)+" • ≈ "+(next.minutes||30)+' د</p></div><div class="buttons"><a href="'+U(next.url)+'" target="_blank" rel="noopener">فتح الفيديو</a><button data-done="'+E(next.id)+'">مكتمل</button></div></div>':'<div class="empty"><b>كل فيديوهات المستوى مكتملة</b>انتقل للاختبارات والموارد التطبيقية.</div>';
  const doneBtn=c.querySelector("[data-done]");if(doneBtn)doneBtn.onclick=()=>{G.toggleLesson(doneBtn.dataset.done);G.ui.renderAll();toast("تسجل إنجاز الدرس")};
};

G.ui.startTask=t=>{
  if(!t)return;
  if(t.type==="quiz"){G.ui.openQuiz(t.quizId);return}
  if(t.type==="review"){G.ui.setView("review");return}
  if(t.type==="zero"){G.runtime.zeroSelected=t.zeroIndex||G.state.zeroPathCurrent;G.ui.setView("grammar");return}
  if(t.type==="daily"){
    const levelId=G.state.profile.level;
    G.runtime.dailyLevel=levelId;
    G.selectDailyDay(levelId,t.dailyDay||G.nextDailyDay(levelId));
    G.ui.setView("daily");
    return;
  }
  if(t.url)window.open(U(t.url),"_blank","noopener");
  if(t.view&&t.view!=="dashboard")G.ui.setView(t.view);
};


const fmtNumber=n=>{
  if(!Number.isFinite(n))return null;
  return new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:1}).format(n);
};
const wordCount=text=>String(text||"").trim()?String(text).trim().split(/\s+/).filter(Boolean).length:0;

G.ui.renderDaily=()=>{
  const levels=G.data.daily.levels.map(x=>x.level);
  const selected=levels.includes(G.runtime.dailyLevel)?G.runtime.dailyLevel:G.state.profile.level;
  G.runtime.dailyLevel=selected;
  const program=G.dailyProgram(selected);
  if(!program)return;

  if(G.runtime.speakingTimer){clearInterval(G.runtime.speakingTimer);G.runtime.speakingTimer=null;G.runtime.speakingStartedAt=null}
  if(G.runtime.mediaRecorder?.state==="recording"){try{G.runtime.mediaRecorder.stop()}catch{}}
  if(G.runtime.mediaStream){G.runtime.mediaStream.getTracks().forEach(t=>t.stop());G.runtime.mediaStream=null}

  const dayNo=G.state.dailySelected[selected]||G.nextDailyDay(selected);
  const day=G.dailyDay(selected,dayNo);
  const progress=G.dailyDayProgress(selected,dayNo);
  const levelProgress=G.dailyLevelProgress(selected);

  $("#dailyLevelTabs").innerHTML=levels.map(id=>'<button class="'+(id===selected?"active":"")+'" data-daily-level="'+id+'">'+id+'</button>').join("");
  $$("#dailyLevelTabs [data-daily-level]").forEach(b=>b.onclick=()=>{
    G.runtime.dailyLevel=b.dataset.dailyLevel;
    if(!G.state.dailySelected[b.dataset.dailyLevel])G.selectDailyDay(b.dataset.dailyLevel,G.nextDailyDay(b.dataset.dailyLevel));
    G.ui.renderDaily();
  });

  $("#dailyLevelLabel").textContent=selected+" • اليوم "+day.day+" من 30";
  $("#dailyTheme").textContent=day.theme;
  $("#dailyObjective").textContent=day.objective;
  $("#dailyLevelPct").textContent=levelProgress.pct+"%";
  $(".daily-progress-ring").style.setProperty("--p",(levelProgress.pct*3.6)+"deg");
  $("#dailyDaysDone").textContent=levelProgress.done+"/"+levelProgress.total;

  $("#dailyDayGrid").innerHTML=program.days.map(d=>{
    const p=G.dailyDayProgress(selected,d.day);
    return '<button class="'+(d.day===day.day?"active ":"")+(p.complete?"done":"")+'" data-day="'+d.day+'" title="'+E(d.theme)+'">'+d.day+'</button>';
  }).join("");
  $$("#dailyDayGrid [data-day]").forEach(b=>b.onclick=()=>{G.selectDailyDay(selected,Number(b.dataset.day));G.ui.renderDaily();window.scrollTo({top:0,behavior:"smooth"})});

  const videos=day.videos.map(G.videoById).filter(Boolean);
  $("#dailyVideoTime").textContent=videos.reduce((n,v)=>n+(v.minutes||15),0)+" د";
  $("#dailyVideos").innerHTML=videos.map(v=>{
    const done=G.dailyVideoDone(selected,day.day,v.id),q=v.quality||{};
    const views=fmtNumber(q.views),likes=fmtNumber(q.likes),comments=fmtNumber(q.comments);
    const strong=(q.views>=200000)||(q.likes>=5000);
    const metrics=[views?views+" مشاهدة":null,likes?likes+" إعجاب":null,comments?comments+" تعليق":null,strong?"تفاعل قوي":null].filter(Boolean);
    return '<article class="daily-video '+(done?"done":"")+'"><div><h4>'+E(v.title)+'</h4><p>'+E(v.provider)+' • '+E(v.skill)+' • ≈ '+(v.minutes||15)+' د</p><div class="video-meta">'+metrics.map((x,i)=>'<span class="'+(i===metrics.length-1&&strong?"engagement":"")+'">'+E(x)+'</span>').join("")+(q.verifiedAt?'<span>بيانات '+E(q.verifiedAt)+'</span>':'')+'</div></div><div class="daily-video-actions"><a href="'+U(v.url)+'" target="_blank" rel="noopener">▶ شاهد</a><button data-daily-video="'+E(v.id)+'">'+(done?"✓ مكتمل":"تم")+'</button></div></article>';
  }).join("");
  $$("#dailyVideos [data-daily-video]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.dailyVideo,v=G.videoById(id),was=G.dailyVideoDone(selected,day.day,id);
    G.setDailyDone(selected,day.day,"video::"+id,!was);
    if(!was&&v?.core&&!G.lessonDone(id)){G.state.completedLessons[id]=Date.now();G.touch();G.save()}
    G.ui.renderAll();toast(!was?"تسجل فيديو اليوم":"تلغى إنجاز الفيديو");
  });

  const grammar=G.grammarTopic(day.grammarId);
  const grammarDone=G.dailyDone(selected,day.day,"grammar");
  if(grammar){
    $("#dailyGrammarContent").innerHTML='<div class="daily-rule"><span>'+E(grammar.level)+' • '+E(grammar.category==="pronunciation"||grammar.category==="alphabet"?"النطق والحروف":"القواعد")+'</span><h4>'+E(grammar.title)+'</h4><p>'+E(grammar.summary)+'</p><div class="daily-rule-actions"><button class="ghost" id="openDailyGrammar">فتح الشرح الكامل</button></div></div>';
    $("#openDailyGrammar").onclick=()=>{G.runtime.grammarSection=grammar.id.startsWith("alpha-")?"alphabet":grammar.level;G.runtime.grammarSearch=grammar.title;G.ui.setView("grammar")};
  }else $("#dailyGrammarContent").innerHTML='<div class="empty">ما كايناش قاعدة مرتبطة بهذا اليوم.</div>';
  $(".daily-grammar-card").classList.toggle("done",grammarDone);
  $("#dailyGrammarDone").textContent=grammarDone?"✓ القاعدة مكتملة":"علّم القاعدة مكتملة";
  $("#dailyGrammarDone").onclick=()=>{
    if(grammar&&!G.grammarDone(grammar.id))G.toggleGrammar(grammar.id);
    G.setDailyDone(selected,day.day,"grammar",!grammarDone);
    G.ui.renderAll();toast(!grammarDone?"تسجلت قاعدة اليوم":"تلغت علامة القاعدة");
  };

  const listenVideo=G.videoById(day.listening?.videoId||day.videos[0]);
  const listeningDone=G.dailyDone(selected,day.day,"listening");
  $("#dailyListeningSource").innerHTML=listenVideo?'<div class="listening-source-box"><div><b>'+E(listenVideo.title)+'</b><span>'+E(listenVideo.provider)+' • ≈ '+(day.listening?.targetMinutes||15)+' د تدريب</span></div><a href="'+U(listenVideo.url)+'" target="_blank" rel="noopener">فتح المقطع</a></div>':'';
  $("#dailyListeningSteps").innerHTML=(day.listening?.steps||[]).map(x=>"<li>"+E(x)+"</li>").join("");
  $(".daily-listening-card").classList.toggle("done",listeningDone);
  $("#dailyListeningDone").textContent=listeningDone?"✓ الاستماع مكتمل":"علّم الاستماع مكتمل";
  $("#dailyListeningDone").onclick=()=>{G.setDailyDone(selected,day.day,"listening",!listeningDone);G.ui.renderAll();toast(!listeningDone?"تسجل تدريب الاستماع":"تلغى الاستماع")};

  $("#dailyReadingTitle").textContent=day.reading.title;
  $("#dailyReadingText").textContent=day.reading.text;
  const checks=day.reading.checks||[];
  $("#dailyReadingQuestions").innerHTML=(checks.length?checks.map(x=>x.q):day.reading.questions).map(q=>"<li>"+E(q)+"</li>").join("");
  $("#dailyReadingAnswers").innerHTML=checks.map((x,i)=>'<article><b>'+(i+1)+'. '+E(x.q)+'</b><p>'+E(x.a)+'</p></article>').join("");
  $("#dailyReadingAnswers").hidden=true;
  $("#revealReadingAnswers").textContent="أظهر إجابات نموذجية";
  $("#revealReadingAnswers").onclick=()=>{
    const box=$("#dailyReadingAnswers"),show=box.hidden;box.hidden=!show;
    $("#revealReadingAnswers").textContent=show?"إخفاء الإجابات":"أظهر إجابات نموذجية";
  };
  const readingDone=G.dailyDone(selected,day.day,"reading");
  $("#dailyReadingDone").textContent=readingDone?"✓ القراءة مكتملة":"علّم القراءة مكتملة";
  $(".daily-reading-card").classList.toggle("done",readingDone);
  $("#dailyReadingDone").onclick=()=>{G.setDailyDone(selected,day.day,"reading",!readingDone);G.ui.renderAll();toast(!readingDone?"ممتاز، تسجلت القراءة":"تلغت القراءة")};

  $("#dailyWordTarget").textContent=day.writing.minWords;
  $("#dailyWritingPrompt").textContent=day.writing.prompt;
  $("#dailyWritingChecklist").innerHTML=day.writing.checklist.map(x=>"<li>"+E(x)+"</li>").join("");
  const area=$("#dailyWritingArea");
  area.value=G.getDailyWriting(selected,day.day);
  const updateWords=()=>{const n=wordCount(area.value);$("#dailyWordCount").textContent=n;$("#dailyWordCount").className=n>=day.writing.minWords?"good-score":""};
  updateWords();
  area.oninput=()=>{G.setDailyWriting(selected,day.day,area.value);updateWords()};
  const writingDone=G.dailyDone(selected,day.day,"writing");
  $("#dailyWritingDone").textContent=writingDone?"✓ الكتابة مكتملة":"علّم الكتابة مكتملة";
  $(".daily-writing-card").classList.toggle("done",writingDone);
  $("#dailyWritingDone").onclick=()=>{
    const n=wordCount(area.value);
    if(!writingDone&&n<day.writing.minWords){toast("باقي خاصك توصل على الأقل لـ "+day.writing.minWords+" كلمة");area.focus();return}
    G.setDailyDone(selected,day.day,"writing",!writingDone);G.ui.renderAll();toast(!writingDone?"تسجلت كتابة اليوم":"تلغت علامة الكتابة");
  };

  const sp=G.getDailySpeaking(selected,day.day),speakingDone=G.dailyDone(selected,day.day,"speaking");
  $("#dailySpeakingTarget").textContent=day.speaking?.targetSeconds||60;
  $("#dailySpeakingPrompt").textContent=day.speaking?.prompt||day.writing.prompt;
  $("#dailySpeakingChecklist").innerHTML=(day.speaking?.checklist||[]).map(x=>"<li>"+E(x)+"</li>").join("");
  const timerDisplay=$("#speakingTimerDisplay"),timerBtn=$("#speakingTimerButton");
  const setTimerDisplay=sec=>{const m=Math.floor(sec/60),ss=String(sec%60).padStart(2,"0");timerDisplay.textContent=String(m).padStart(2,"0")+":"+ss};
  setTimerDisplay(sp.seconds||0);
  timerBtn.textContent="ابدأ المؤقت";
  timerBtn.onclick=()=>{
    if(G.runtime.speakingTimer){
      clearInterval(G.runtime.speakingTimer);G.runtime.speakingTimer=null;
      const seconds=Math.max(sp.seconds||0,Math.round((Date.now()-G.runtime.speakingStartedAt)/1000));
      G.runtime.speakingStartedAt=null;G.setDailySpeaking(selected,day.day,{seconds});setTimerDisplay(seconds);timerBtn.textContent="ابدأ المؤقت";toast("تسجل وقت التحدث");
      return;
    }
    G.runtime.speakingStartedAt=Date.now();
    timerBtn.textContent="أوقف المؤقت";
    G.runtime.speakingTimer=setInterval(()=>setTimerDisplay(Math.round((Date.now()-G.runtime.speakingStartedAt)/1000)),1000);
  };

  const recordBtn=$("#recordSpeakingButton"),playback=$("#speakingPlayback");
  playback.hidden=true;playback.removeAttribute("src");
  recordBtn.textContent="🎙 تسجيل صوتي";
  recordBtn.disabled=!(navigator.mediaDevices&&window.MediaRecorder);
  recordBtn.onclick=async()=>{
    try{
      if(G.runtime.mediaRecorder?.state==="recording"){G.runtime.mediaRecorder.stop();recordBtn.textContent="🎙 تسجيل صوتي";return}
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      G.runtime.mediaStream=stream;G.runtime.mediaChunks=[];
      const rec=new MediaRecorder(stream);G.runtime.mediaRecorder=rec;
      rec.ondataavailable=e=>{if(e.data?.size)G.runtime.mediaChunks.push(e.data)};
      rec.onstop=()=>{
        const blob=new Blob(G.runtime.mediaChunks,{type:rec.mimeType||"audio/webm"});
        if(G.runtime.mediaUrl)URL.revokeObjectURL(G.runtime.mediaUrl);
        G.runtime.mediaUrl=URL.createObjectURL(blob);playback.src=G.runtime.mediaUrl;playback.hidden=false;
        stream.getTracks().forEach(t=>t.stop());G.runtime.mediaStream=null;
      };
      rec.start();recordBtn.textContent="■ أوقف التسجيل";toast("بدأ التسجيل المحلي");
    }catch(err){console.warn(err);toast("المتصفح ما عطاش صلاحية الميكروفون")}
  };

  $$(".speaking-rating [data-speaking-rating]").forEach(b=>{
    b.classList.toggle("active",b.dataset.speakingRating===sp.rating);
    b.onclick=()=>{G.setDailySpeaking(selected,day.day,{rating:b.dataset.speakingRating});G.ui.renderDaily();toast("تسجل تقييم التحدث")};
  });
  $(".daily-speaking-card").classList.toggle("done",speakingDone);
  $("#dailySpeakingDone").textContent=speakingDone?"✓ التحدث مكتمل":"علّم التحدث مكتمل";
  $("#dailySpeakingDone").onclick=()=>{
    const current=G.getDailySpeaking(selected,day.day);
    if(!speakingDone&&!current.rating){toast("قيّم كلامك أولاً: صعب / متوسط / مرتاح");return}
    G.setDailyDone(selected,day.day,"speaking",!speakingDone);G.ui.renderAll();toast(!speakingDone?"تسجل تدريب التحدث":"تلغى التحدث");
  };

  const ids=day.vocabIds||[];
  const dailyCards=ids.map(id=>G.data.vocabulary.cards.find(v=>v.id===id)).filter(Boolean);
  $("#dailyVocab").innerHTML=dailyCards.map(v=>'<article class="vocab-mini"><b>'+E(v.de)+'</b><span>'+E(v.ar)+'</span><small>'+E(v.example||"")+'</small></article>').join("");

  const rule=G.grammarTopic(day.grammarId);
  const notebookItems=[
    {n:"01",title:"رأس الصفحة",text:"Datum: "+new Date().toLocaleDateString("de-DE")+" • Tag "+day.day+" • Thema: "+day.theme},
    {n:"02",title:"قاعدة اليوم",text:(rule?rule.title+": "+rule.summary:"كتب القاعدة في سطر واحد")+" — زيد جوج أمثلة فقط."},
    {n:"03",title:"7 كلمات",text:"كتب الكلمات الألمانية أولاً. المعنى بالعربية صغير، ومن بعد مثال واحد لكل كلمة صعيبة فقط."},
    {n:"04",title:"3 جمل من راسك",text:"ما تنسخش أمثلة الموقع. استعمل قاعدة اليوم و3 من كلمات اليوم في جمل ديالك."},
    {n:"05",title:"خطأ اليوم",text:"خصص سطر: ✕ الجملة الغلط → ✓ التصحيح → السبب بكلمتين."},
    {n:"06",title:"مراجعة ذكية",text:"فأسفل الصفحة كتب مربعات: غداً D+1 □ • بعد 3 أيام D+3 □ • بعد 7 أيام D+7 □."}
  ];
  $("#dailyNotebookGuide").innerHTML=notebookItems.map(x=>'<article><span>'+x.n+'</span><div><b>'+E(x.title)+'</b><p>'+E(x.text)+'</p></div></article>').join("");
  $("#copyNotebookTemplate").onclick=async()=>{
    const vocabText=dailyCards.map(v=>v.de+" = "+v.ar).join("\n");
    const text="DEUTSCH • Tag "+day.day+"\nDatum: "+new Date().toLocaleDateString("de-DE")+"\nThema: "+day.theme+"\n\n1) REGEL\n"+(rule?rule.title+" — "+rule.summary:"")+"\nBeispiel 1: ______\nBeispiel 2: ______\n\n2) WÖRTER\n"+vocabText+"\n\n3) MEINE 3 SÄTZE\n1. ______\n2. ______\n3. ______\n\n4) FEHLER DES TAGES\n✕ ______\n✓ ______\nWarum? ______\n\n5) REVIEW\nD+1 □   D+3 □   D+7 □";
    try{await navigator.clipboard.writeText(text);toast("تنسخ قالب دفتر اليوم")}catch{toast("المتصفح منع النسخ التلقائي")}
  };

  $("#dailyDayStatus").textContent=progress.done+"/"+progress.total;
  $("#prevDailyDay").disabled=day.day<=1;
  $("#nextDailyDay").disabled=day.day>=30;
  $("#prevDailyDay").onclick=()=>{if(day.day>1){G.selectDailyDay(selected,day.day-1);G.ui.renderDaily();window.scrollTo({top:0,behavior:"smooth"})}};
  $("#nextDailyDay").onclick=()=>{if(day.day<30){G.selectDailyDay(selected,day.day+1);G.ui.renderDaily();window.scrollTo({top:0,behavior:"smooth"})}};
};



const zeroVideoCard=step=>{
  const v=G.videoById(step.videoId);if(!v)return '<div class="empty">الفيديو غير موجود في المكتبة.</div>';
  const q=v.quality||{},metrics=[q.views?fmtNumber(q.views)+" مشاهدة":null,q.likes?fmtNumber(q.likes)+" إعجاب":null].filter(Boolean);
  return '<div class="zero-video-card"><div><small>'+E(v.provider)+'</small><h3>'+E(v.title)+'</h3><p>'+E(step.body||"")+'</p><div class="video-meta">'+metrics.map(x=>'<span>'+E(x)+'</span>').join("")+'<span>مختار لأنه مناسب لهاد الخطوة</span></div></div><a href="'+U(v.url)+'" target="_blank" rel="noopener">▶ فتح الفيديو</a></div>';
};

G.ui.renderZeroPath=()=>{
  const data=G.data.zero;if(!data)return;
  const p=G.zeroProgress(),steps=data.steps,currentMax=Math.max(1,Number(G.state.zeroPathCurrent)||1);
  const selected=Math.max(1,Math.min(steps.length,Number(G.runtime.zeroSelected)||currentMax));
  G.runtime.zeroSelected=selected;
  const step=steps[selected-1];
  $("#zeroPrinciple").textContent=data.principle;
  $("#zeroProgressPct").textContent=p.pct+"%";
  $("#zeroProgressText").textContent=p.done+"/"+p.total+" خطوة";
  $("#zeroStepList").innerHTML=steps.map((x,i)=>{
    const n=i+1,done=G.zeroDone(x.id),locked=n>currentMax;
    return '<button class="zero-step '+(done?"done ":"")+(selected===n?"active ":"")+(locked?"locked":"")+'" data-zero-index="'+n+'" '+(locked?"disabled":"")+'><span>'+String(n).padStart(2,"0")+'</span><div><b>'+E(x.title)+'</b><small>'+E(x.goal||"")+'</small></div><em>'+(done?"✓":locked?"🔒":"→")+'</em></button>';
  }).join("");
  $("#zeroStepList [data-zero-index]").forEach(b=>b.onclick=()=>{G.runtime.zeroSelected=Number(b.dataset.zeroIndex);G.ui.renderZeroPath()});

  let body='';
  if(step.type==="orientation"){
    body='<div class="zero-explain"><p>'+E(step.body)+'</p><div class="zero-order"><span>1 الحروف</span><span>2 الأصوات</span><span>3 المقاطع</span><span>4 كلمات</span><span>5 قواعد بسيطة</span><span>6 استماع بطيء</span><span>7 قراءة</span></div></div>';
  }else if(step.type==="video"||step.type==="listen-read"){
    body=zeroVideoCard(step);
  }else if(step.type==="letters"||step.type==="letters-special"){
    const list=step.type==="letters-special"?data.letters.filter(x=>["Ä","Ö","Ü","ß"].includes(x.g)):data.letters.filter(x=>!["Ä","Ö","Ü","ß"].includes(x.g));
    body='<p class="zero-note">الكتابة بالعربية هنا غير تقريب للصوت. زر 🔊 هو المرجع الأفضل للكلمة.</p><div class="letter-grid">'+list.map(x=>'<article class="letter-card"><b>'+E(x.g)+'</b><span>اسم الحرف: '+E(x.name)+'</span><span>صوت شائع: <code>'+E(x.sound)+'</code></span><button data-speak="'+E(x.example)+'">🔊 '+E(x.example)+'</button><small>'+E(x.meaning)+'</small></article>').join("")+'</div>';
  }else if(step.type==="clusters"){
    body='<p class="zero-note">هاد التركيبات أهم من حفظ أسماء الحروف بوحدها. اسمع كلمة المثال ورددها.</p><div class="cluster-grid">'+data.clusters.map(x=>'<article class="cluster-card"><div><b>'+E(x.g)+'</b><code>'+E(x.ipa)+'</code></div><strong>'+E(x.cue)+'</strong><button data-speak="'+E(x.example)+'">🔊 '+E(x.example)+'</button><span>'+E(x.meaning)+'</span><small>'+E(x.note)+'</small></article>').join("")+'</div>';
  }else if(step.type==="words"){
    body='<div class="zero-word-grid">'+step.words.map(w=>'<button data-speak="'+E(w)+'">🔊 <b>'+E(w)+'</b></button>').join("")+'</div><p class="zero-note">قرا الكلمة بوحدك أولاً، من بعد اضغط الصوت وقارن.</p>';
  }else if(step.type==="grammar"){
    const list=(step.grammarIds||[]).map(G.grammarTopic).filter(Boolean);
    body='<div class="zero-mini-rules">'+list.map(t=>'<article><small>'+E(t.level)+'</small><h4>'+E(t.title)+'</h4><p>'+E(t.summary)+'</p><div class="grammar-examples">'+t.examples.map(x=>'<code>'+E(x)+'</code>').join("")+'</div></article>').join("")+'</div>';
  }else if(step.type==="sentences"){
    body='<div class="zero-sentence-list">'+step.sentences.map(x=>'<article><span lang="de">'+E(x)+'</span><button data-speak="'+E(x)+'">🔊</button></article>').join("")+'</div><p class="zero-note">قرا الجملة → سمعها → عاودها من غير ما تشوف.</p>';
  }else if(step.type==="reading"){
    body='<article class="reading-text" lang="de">'+E(step.text||"")+'</article><p class="zero-note">المرة الأولى بلا قاموس. من بعد فقط علّم الكلمات اللي منعتك من فهم المعنى العام.</p>';
  }else if(step.type==="notebook"){
    body='<div class="notebook-method"><article><b>① العنوان</b><span>Datum + Tag + Thema</span></article><article><b>② القاعدة</b><span>سطر واحد فقط + جوج أمثلة</span></article><article><b>③ 7 كلمات</b><span>الكلمة + المعنى + مثال واحد</span></article><article><b>④ إنتاجك</b><span>3 جمل من راسك</span></article><article><b>⑤ خطأ اليوم</b><span>الخطأ → التصحيح → علاش</span></article><article><b>⑥ المراجعة</b><span>D+1 / D+3 / D+7</span></article></div>';
  }else if(step.type==="checkpoint"){
    body='<form class="zero-checkpoint" id="zeroCheckpoint">'+(step.quiz||[]).map((q,qi)=>'<section><h4>'+(qi+1)+'. '+E(q.q)+'</h4><div>'+q.o.map((o,oi)=>'<label><input type="radio" name="zq'+qi+'" value="'+oi+'"> <span>'+E(o)+'</span></label>').join("")+'</div></section>').join("")+'<button class="primary" type="submit">صحّح الاختبار</button><p id="zeroCheckpointResult" class="muted"></p></form>';
  }else if(step.type==="unlock"){
    body='<div class="zero-unlock"><b>🎉 الأساس جاهز</b><p>'+E(step.body)+'</p><button class="primary" id="unlockA1Now">افتح اليوم 1 من A1</button></div>';
  }else body='<div class="zero-explain"><p>'+E(step.body||"")+'</p></div>';

  $("#zeroStepContent").innerHTML='<header class="zero-step-head"><div><small>الخطوة '+selected+' من '+steps.length+' • ≈ '+(step.minutes||15)+' د</small><h2>'+E(step.title)+'</h2><p>'+E(step.goal||"")+'</p></div><span class="zero-type">'+E(step.type)+'</span></header>'+body+'<footer class="zero-step-footer"><button class="ghost" id="zeroPrev" '+(selected<=1?"disabled":"")+'>→ السابق</button><button class="primary" id="zeroComplete">'+(G.zeroDone(step.id)?"✓ مكتملة — التالي":"كملت هاد الخطوة ←")+'</button></footer>';
  $("#zeroStepContent [data-speak]").forEach(b=>b.onclick=()=>G.ui.speakGerman(b.dataset.speak));
  const prev=$("#zeroPrev");if(prev)prev.onclick=()=>{if(selected>1){G.runtime.zeroSelected=selected-1;G.ui.renderZeroPath()}};
  const complete=$("#zeroComplete");
  if(complete)complete.onclick=()=>{
    if(step.type==="checkpoint"){
      const form=$("#zeroCheckpoint");if(form)form.requestSubmit();return;
    }
    G.completeZeroStep(step.id);G.runtime.zeroSelected=Math.min(steps.length,selected+1);G.ui.renderAll();toast("تفتحات الخطوة الجاية ✓");
  };
  const cp=$("#zeroCheckpoint");
  if(cp)cp.onsubmit=e=>{
    e.preventDefault();let good=0,answered=0;(step.quiz||[]).forEach((q,qi)=>{const el=cp.querySelector('input[name="zq'+qi+'"]:checked');if(el){answered++;if(Number(el.value)===q.a)good++}});
    if(answered!==(step.quiz||[]).length){toast("جاوب على الأسئلة كاملة");return}
    const score=Math.round(good/(step.quiz.length||1)*100),pass=score>=(step.passScore||80);
    $("#zeroCheckpointResult").textContent=score+"% — "+(pass?"ممتاز، تقدر تدوز للخطوة الجاية.":"رجع غير للنقاط اللي غلطتي فيها وحاول مرة أخرى.");
    if(pass){G.completeZeroStep(step.id);setTimeout(()=>{G.runtime.zeroSelected=Math.min(steps.length,selected+1);G.ui.renderAll()},500)}
  };
  const unlock=$("#unlockA1Now");if(unlock)unlock.onclick=()=>{G.completeZeroStep(step.id);G.state.dailySelected.A1=1;G.save();G.ui.setView("daily");toast("بدأنا A1 • اليوم 1")};
};

G.ui.renderGrammar=()=>{
  G.ui.renderZeroPath();
  const sections=G.data.grammar?.sections||[];
  const current=sections.find(x=>x.id===G.runtime.grammarSection)||sections[0];
  if(!current)return;
  const overall=G.grammarProgress();
  $("#grammarOverallPct").textContent=overall.pct+"%";
  $("#grammarOverallDone").textContent=overall.done+"/"+overall.total+" قاعدة";
  $("#grammarTabs").innerHTML=sections.map(sec=>'<button class="'+(sec.id===current.id?"active":"")+'" data-grammar-tab="'+E(sec.id)+'">'+E(sec.label)+' <small>'+sec.topics.length+'</small></button>').join("");
  $("#grammarTabs [data-grammar-tab]").forEach(b=>b.onclick=()=>{G.runtime.grammarSection=b.dataset.grammarTab;G.runtime.grammarSearch="";G.ui.renderGrammar()});

  const input=$("#grammarSearch");
  if(document.activeElement!==input)input.value=G.runtime.grammarSearch||"";
  input.oninput=()=>{G.runtime.grammarSearch=input.value;G.ui.renderGrammarTopics()};

  const progress=G.grammarProgress(current.id);
  $("#grammarSectionIntro").innerHTML='<div><small>'+E(current.label)+'</small><h3>'+E(current.description)+'</h3></div><div class="grammar-section-progress"><b>'+progress.pct+'%</b><span>'+progress.done+'/'+progress.total+' مكتمل</span></div>';
  G.ui.renderGrammarTopics();
};

G.ui.renderGrammarTopics=()=>{
  const sections=G.data.grammar?.sections||[];
  const current=sections.find(x=>x.id===G.runtime.grammarSection)||sections[0];
  if(!current)return;
  const q=(G.runtime.grammarSearch||"").trim().toLowerCase();
  let list=current.topics;
  if(q){
    const all=sections.flatMap(s=>s.topics);
    list=all.filter(t=>[t.title,t.summary,t.explanation,t.level,t.category,...(t.examples||[])].join(" ").toLowerCase().includes(q));
  }
  $("#grammarTopics").innerHTML=list.length?list.map((t,i)=>{
    const done=G.grammarDone(t.id),drill=G.state.grammarDrills[t.id];
    return '<article class="grammar-topic '+(done?"done":"")+'" data-grammar-topic="'+E(t.id)+'">'+
      '<div class="grammar-topic-head"><span class="grammar-index">'+String(i+1).padStart(2,"0")+'</span><div><div class="tags"><span>'+E(t.level)+'</span><span>'+E(t.category==="alphabet"?"حروف":t.category==="pronunciation"?"نطق":"قواعد")+'</span></div><h3>'+E(t.title)+'</h3><p>'+E(t.summary)+'</p></div><div class="grammar-topic-actions"><button class="ghost" data-expand-grammar="'+E(t.id)+'">شرح</button><button class="done-btn '+(done?"done":"")+'" data-complete-grammar="'+E(t.id)+'">'+(done?"✓ مكتمل":"مكتمل")+'</button></div></div>'+
      '<div class="grammar-detail" id="grammar-detail-'+E(t.id)+'" hidden>'+
        '<section><small>كيف تستعملها؟</small><p>'+E(t.explanation)+'</p></section>'+
        '<section><small>أمثلة</small><div class="grammar-examples">'+(t.examples||[]).map(x=>'<code>'+E(x)+'</code>').join("")+'</div></section>'+
        '<section class="grammar-warning"><small>خطأ شائع / ملاحظة</small><p>'+E(t.mistake)+'</p></section>'+
        '<section class="grammar-drill"><small>تمرين سريع</small><h4>'+E(t.drill.prompt)+'</h4><div class="grammar-options">'+t.drill.options.map((o,oi)=>'<button data-grammar-answer="'+oi+'" data-grammar-id="'+E(t.id)+'" class="'+(drill&&drill.choice===oi?(drill.correct?"correct":"wrong"):"")+'">'+E(o)+'</button>').join("")+'</div><p class="grammar-feedback">'+(drill?(drill.correct?"✓ جواب صحيح":"✕ حاول مرة أخرى"):"اختر جواباً.")+'</p></section>'+
      '</div>'+
    '</article>';
  }).join(""):'<div class="empty"><b>ما لقيناش هاد الموضوع</b>جرّب كلمة أخرى مثل Dativ أو Perfekt أو weil.</div>';

  $("#grammarTopics [data-expand-grammar]").forEach(b=>b.onclick=()=>{
    const detail=$("#grammar-detail-"+CSS.escape(b.dataset.expandGrammar));
    if(detail){detail.hidden=!detail.hidden;b.textContent=detail.hidden?"شرح":"إغلاق"}
  });
  $("#grammarTopics [data-complete-grammar]").forEach(b=>b.onclick=()=>{G.toggleGrammar(b.dataset.completeGrammar);G.ui.renderGrammar();toast(G.grammarDone(b.dataset.completeGrammar)?"تسجلت القاعدة":"تلغى الإنجاز")});
  $("#grammarTopics [data-grammar-answer]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.grammarId,t=G.grammarTopic(id),choice=Number(b.dataset.grammarAnswer);
    if(!t)return;
    G.saveGrammarDrill(id,choice===t.drill.answer,choice);
    G.ui.renderGrammarTopics();
    toast(choice===t.drill.answer?"جواب صحيح ✓":"الجواب ماشي صحيح، راجع الشرح");
  });
};

G.ui.renderRoadmap=()=>{
  const levels=G.data.curriculum.levels,selected=G.level(G.runtime.roadmapLevel||G.state.profile.level);G.runtime.roadmapLevel=selected.id;
  $("#levelTabs").innerHTML=levels.map(l=>'<button class="'+(l.id===selected.id?"active":"")+'" data-level-tab="'+l.id+'">'+l.id+'</button>').join("");
  $$("#levelTabs [data-level-tab]").forEach(b=>b.onclick=()=>{G.runtime.roadmapLevel=b.dataset.levelTab;G.ui.renderRoadmap()});
  const lp=G.levelProgress(selected),quizScores=selected.modules.map(m=>G.bestQuiz(m.quizId)).filter(v=>v!=null);
  $("#levelOverview").innerHTML='<div><small>'+E(selected.label)+'</small><h3>'+E(selected.title)+'</h3><p>'+E(selected.goal)+'</p></div><div class="overview-stats"><div><b>'+lp.lessonDone+'/'+lp.lessonTotal+'</b><small>دروس</small></div><div><b>'+lp.practiceDone+'/'+lp.practiceTotal+'</b><small>تطبيق</small></div><div><b>'+lp.pct+'%</b><small>التقدم</small></div></div>';
  const next=selected.id===G.state.profile.level?G.nextLesson(selected):null;
  $("#moduleList").innerHTML=selected.modules.map((m,mi)=>{
    const mp=G.moduleProgress(m),best=G.bestQuiz(m.quizId),quiz=G.data.quizzes.quizzes.find(q=>q.id===m.quizId);
    return '<section class="module"><header><div><small>'+E(m.kicker)+'</small><h3>'+(mi+1)+'. '+E(m.title)+'</h3></div><div class="module-meta"><span class="chip">'+mp.done+'/'+mp.total+' دروس</span><span class="chip">الاختبار '+(best==null?"—":best+"%")+'</span>'+(quiz?'<button class="link-btn" data-quiz="'+E(m.quizId)+'">اختبر الوحدة</button>':'')+'</div></header>'+m.lessons.map(l=>'<article class="lesson '+(G.lessonDone(l.id)?"done ":"")+(next&&next.id===l.id?"current":"")+'"><span class="lesson-index">'+String(l.order).padStart(2,"0")+'</span><div><h4>'+E(l.title)+'</h4><p>'+E(l.note)+'</p><div class="tags"><span>'+E(l.skill)+'</span><span>'+E(l.provider)+'</span><span>≈ '+(l.minutes||30)+' د</span></div></div><div class="lesson-actions"><a href="'+U(l.url)+'" target="_blank" rel="noopener">فيديو</a><button class="done-btn '+(G.lessonDone(l.id)?"done":"")+'" data-lesson="'+E(l.id)+'">'+(G.lessonDone(l.id)?"✓ مكتمل":"مكتمل")+'</button></div></article>').join("")+'</section>';
  }).join("");
  $$("#moduleList [data-lesson]").forEach(b=>b.onclick=()=>{G.toggleLesson(b.dataset.lesson);G.ui.renderAll();toast(G.lessonDone(b.dataset.lesson)?"تسجل الدرس":"تلغى الإنجاز")});
  $$("#moduleList [data-quiz]").forEach(b=>b.onclick=()=>G.ui.openQuiz(b.dataset.quiz));
};

G.ui.renderReview=()=>{
  const due=G.dueReviews(),fresh=G.newVocab().length,all=Object.keys(G.state.reviewRecords).length;
  $("#reviewSummary").innerHTML='<article><small>مستحقة الآن</small><b>'+due.length+'</b></article><article><small>بطاقات محفوظة</small><b>'+all+'</b></article><article><small>مفردات جديدة متاحة</small><b>'+fresh+'</b></article>';
  const q=G.reviewQueue(),box=$("#reviewWorkspace");
  if(!q.length){box.innerHTML='<div class="empty"><b>كلشي مراجع دابا</b>رجع من بعد أو كمّل درساً واختباراً جديداً.</div>';return}
  const card=q[0];box.innerHTML='<div class="flashcard"><span>'+E(card.level)+" • "+E(card.tag)+'</span><h3>'+E(card.front)+'</h3><button class="ghost" id="revealReview">أظهر الجواب</button><div id="reviewAnswer" hidden><div class="answer"><b>'+E(card.back)+'</b>'+(card.example?'<p>'+E(card.example)+'</p>':'')+'</div><div class="ratings"><button class="hard" data-rate="hard">صعب • غداً</button><button class="good" data-rate="good">متوسط</button><button class="easy" data-rate="easy">سهل</button></div></div><p class="muted">'+q.length+' بطاقة في الطابور</p></div>';
  $("#revealReview").onclick=()=>{$("#reviewAnswer").hidden=false;$("#revealReview").hidden=true};
  $$("#reviewAnswer [data-rate]").forEach(b=>b.onclick=()=>{G.rateReview(card.id,b.dataset.rate);G.ui.renderAll();toast("تبرمجت المراجعة الجاية")});
};

G.ui.renderPractice=()=>{
  const level=G.currentLevel(),skills=["الكل",...new Set(G.resources(level).map(r=>r.skill))],filter=G.state.practiceSkill||"الكل";
  $("#practiceFilters").innerHTML=skills.map(s=>'<button class="'+(s===filter?"active":"")+'" data-skill="'+E(s)+'">'+E(s)+'</button>').join("");
  $$("#practiceFilters [data-skill]").forEach(b=>b.onclick=()=>{G.state.practiceSkill=b.dataset.skill;G.save();G.ui.renderPractice()});
  const list=G.resources(level).filter(r=>filter==="الكل"||r.skill===filter);
  $("#practiceGrid").innerHTML=list.length?list.map(r=>'<article class="resource '+(G.resourceDone(r.id)?"done":"")+'"><div class="top"><span>'+E(r.provider)+'</span><span>'+E(r.skill)+'</span></div><h3>'+E(r.title)+'</h3><p>'+E(r.note)+'</p><div class="buttons"><a href="'+U(r.url)+'" target="_blank" rel="noopener">فتح المصدر</a><button data-resource="'+E(r.id)+'">'+(G.resourceDone(r.id)?"✓ مكتمل":"مكتمل")+'</button></div></article>').join(""):'<div class="empty">ما كايناش موارد فهاد التصنيف.</div>';
  $$("#practiceGrid [data-resource]").forEach(b=>b.onclick=()=>{G.toggleResource(b.dataset.resource);G.ui.renderAll();toast("تحدث تقدم التطبيق")});
};

G.ui.renderStats=()=>{
  const s=G.stats(),current=G.levelProgress();
  const gp=G.grammarProgress();
  $("#statsGrid").innerHTML='<article><small>إنجاز '+E(G.state.profile.level)+'</small><b>'+current.pct+'%</b><span>دروس + تطبيق + اختبارات</span></article><article><small>القواعد والحروف</small><b>'+gp.pct+'%</b><span>'+gp.done+'/'+gp.total+' قاعدة</span></article><article><small>Streak</small><b>'+s.streak+'</b><span>أيام</span></article><article><small>متوسط الاختبارات</small><b>'+(s.quizAvg==null?"—":s.quizAvg+"%")+'</b><span>'+s.quizCount+' محاولة</span></article>';
  $("#levelStats").innerHTML=s.levels.map(x=>'<div class="level-stat"><b>'+x.id+'</b><div><div class="track"><i style="width:'+x.pct+'%"></i></div><small class="muted">30 يوم: '+x.daily.done+'/'+x.daily.total+'</small></div><span>'+x.pct+'%</span></div>').join("");
  const hist=[...G.state.quizResults].reverse().slice(0,12);
  $("#quizHistory").innerHTML=hist.length?hist.map(x=>'<div class="history"><div><b>'+E(x.title||x.quizId)+'</b><small>'+new Date(x.at).toLocaleDateString("ar-MA")+'</small></div><b class="'+(x.score>=80?"good-score":x.score>=60?"mid-score":"low-score")+'">'+x.score+'%</b></div>').join(""):'<div class="empty">ما درتي حتى اختبار بعد.</div>';
};

G.ui.openQuiz=id=>{
  const quiz=G.data.quizzes.quizzes.find(q=>q.id===id);if(!quiz){toast("الاختبار غير متوفر");return}
  $("#quizTitle").textContent=quiz.title;const body=$("#quizBody");
  body.innerHTML='<form id="activeQuiz">'+quiz.questions.map((q,qi)=>'<section class="question"><h4>'+(qi+1)+'. '+E(q.prompt)+'</h4><div class="options">'+q.options.map((o,oi)=>'<label class="option"><input type="radio" name="'+E(q.id)+'" value="'+oi+'"> <span>'+E(o)+'</span></label>').join("")+'</div></section>').join("")+'<div class="quiz-submit"><button class="primary" type="submit">صحّح الاختبار</button></div></form>';
  $("#activeQuiz").onsubmit=e=>{e.preventDefault();let correct=0,answered=0;const wrong=[];quiz.questions.forEach(q=>{const el=body.querySelector('input[name="'+CSS.escape(q.id)+'"]:checked');if(el){answered++;if(Number(el.value)===q.answer)correct++;else wrong.push(q)}});if(answered<quiz.questions.length){toast("جاوب على جميع الأسئلة");return}const score=Math.round(correct/quiz.questions.length*100);wrong.forEach(q=>G.addQuizMistake(id,{...q,level:quiz.level}));G.state.quizResults.push({quizId:id,title:quiz.title,score,correct,total:quiz.questions.length,at:Date.now()});G.touch();G.save();body.innerHTML='<div class="quiz-result"><small>'+E(quiz.level)+'</small><b class="'+(score>=80?"good-score":score>=60?"mid-score":"low-score")+'">'+score+'%</b><p>'+correct+' من '+quiz.questions.length+' صحيحة. '+(wrong.length?wrong.length+" أخطاء دخلات للمراجعة الذكية.":"ممتاز، ما كاين حتى خطأ يدخل للمراجعة.")+'</p><button class="primary" id="finishQuiz">إغلاق</button></div>';$("#finishQuiz").onclick=()=>{$("#quizDialog").close();G.ui.renderAll()};G.ui.renderDashboard();G.ui.renderStats()};
  $("#quizDialog").showModal();
};

G.ui.renderView=v=>({dashboard:G.ui.renderDashboard,daily:G.ui.renderDaily,grammar:G.ui.renderGrammar,roadmap:G.ui.renderRoadmap,review:G.ui.renderReview,practice:G.ui.renderPractice,stats:G.ui.renderStats}[v]||(()=>{}))();
G.ui.renderAll=()=>{G.ui.renderDashboard();G.ui.renderDaily();G.ui.renderGrammar();G.ui.renderRoadmap();G.ui.renderReview();G.ui.renderPractice();G.ui.renderStats();$("#levelChip").textContent=G.state.profile.level};
})();