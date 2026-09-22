window.GMP=window.GMP||{};
(()=>{
const G=window.GMP,DAY=G.DAY;
const lvl=()=>G.currentLevel();
const lessonMap=()=>new Map(G.lessons().map(x=>[x.id,x]));
const moduleForLesson=id=>lvl().modules.find(m=>m.lessons.some(l=>l.id===id));
const rec=id=>G.state.reviewRecords[id]||null;

G.skillCoverage=(level=lvl())=>{
  const map={};
  const add=(skill,done,w=1)=>{if(!map[skill])map[skill]={skill,total:0,done:0};map[skill].total+=w;if(done)map[skill].done+=w};
  G.lessons(level).forEach(x=>add(x.skill,G.lessonDone(x.id),1));
  G.resources(level).forEach(x=>add(x.skill,G.resourceDone(x.id),.7));
  return Object.values(map).map(x=>({...x,pct:x.total?Math.round(x.done/x.total*100):0})).sort((a,b)=>a.pct-b.pct||b.total-a.total);
};

G.reviewIdForVocab=v=>"vocab::"+v.id;
G.reviewIdForMistake=(quizId,qid)=>"mistake::"+quizId+"::"+qid;
G.vocabById=id=>G.data.vocabulary.cards.find(x=>x.id===id)||null;

G.ensureVocabRecord=(vocab,initial=false)=>{
  const id=G.reviewIdForVocab(vocab);
  if(!G.state.reviewRecords[id]&&initial){
    G.state.reviewRecords[id]={id,type:"vocab",ref:vocab.id,level:vocab.level,dueAt:Date.now(),interval:0,reps:0,last:null};
    G.save();
  }
  return G.state.reviewRecords[id]||null;
};

G.addQuizMistake=(quizId,q)=>{
  const id=G.reviewIdForMistake(quizId,q.id);
  G.state.reviewRecords[id]={id,type:"mistake",quizId,questionId:q.id,level:q.level||G.state.profile.level,prompt:q.prompt,answer:q.options[q.answer],explain:q.explain||"",dueAt:Date.now(),interval:0,reps:0,last:null};
};

G.rateReview=(id,rating)=>{
  const r=G.state.reviewRecords[id];if(!r)return;
  const base={hard:1,good:3,easy:7}[rating]||3;
  let interval=base;
  if(r.reps>0){
    const factor={hard:1.35,good:2.1,easy:3.2}[rating]||2;
    interval=Math.max(base,Math.round((r.interval||base)*factor));
  }
  r.interval=Math.min(interval,90);r.reps=(r.reps||0)+1;r.last=Date.now();r.dueAt=Date.now()+r.interval*DAY;r.rating=rating;
  G.touch();G.save();
};

G.reviewCard=r=>{
  if(r.type==="vocab"){
    const v=G.vocabById(r.ref);
    if(!v)return null;
    return{id:r.id,type:"vocab",level:v.level,front:v.de,back:v.ar,example:v.example||"",tag:"مفردات"};
  }
  return{id:r.id,type:"mistake",level:r.level,front:r.prompt,back:r.answer,example:r.explain||"",tag:"خطأ اختبار"};
};

G.dueReviews=()=>{
  const now=Date.now(),current=G.state.profile.level;
  return Object.values(G.state.reviewRecords).filter(r=>r.level===current&&r.dueAt<=now).sort((a,b)=>a.dueAt-b.dueAt).map(G.reviewCard).filter(Boolean);
};

G.newVocab=(limit=5)=>{
  const current=G.state.profile.level;
  return G.data.vocabulary.cards.filter(v=>v.level===current&&!G.state.reviewRecords[G.reviewIdForVocab(v)]).slice(0,limit);
};

G.reviewQueue=()=>{
  const due=G.dueReviews();
  if(due.length)return due;
  const fresh=G.newVocab(5);
  fresh.forEach(v=>G.ensureVocabRecord(v,true));
  return fresh.map(v=>G.reviewCard(G.state.reviewRecords[G.reviewIdForVocab(v)])).filter(Boolean);
};

G.nextQuiz=()=>{
  const level=lvl();
  for(const m of level.modules){
    const p=G.moduleProgress(m),best=G.bestQuiz(m.quizId);
    if(p.done===p.total&&(best==null||best<70))return{module:m,quiz:G.data.quizzes.quizzes.find(q=>q.id===m.quizId)||null};
  }
  return null;
};

G.nextPractice=()=>{
  const weak=G.skillCoverage().map(x=>x.skill);
  return G.resources().filter(r=>!G.resourceDone(r.id)).sort((a,b)=>{
    const ai=weak.indexOf(a.skill),bi=weak.indexOf(b.skill);
    return (ai<0?99:ai)-(bi<0?99:bi);
  })[0]||null;
};

G.todayPlan=()=>{
  const target=Number(G.state.profile.minutes)||210,tasks=[];let used=0;
  const due=G.dueReviews();
  if(due.length){const n=Math.min(due.length,12),min=Math.min(25,8+n);tasks.push({type:"review",title:n+" مراجعات مستحقة",detail:"مفردات وأخطاء سابقة",minutes:min,view:"review"});used+=min}
  else if(G.newVocab(1).length){tasks.push({type:"review",title:"مفردات جديدة",detail:"ابدأ 5 بطاقات فقط",minutes:12,view:"review"});used+=12}
  const lesson=G.nextLesson();
  if(lesson){const min=lesson.minutes||30;tasks.push({type:"lesson",title:lesson.title,detail:lesson.skill+" • "+lesson.provider,minutes:min,url:lesson.url,lessonId:lesson.id,view:"roadmap"});used+=min}
  const quiz=G.nextQuiz();
  if(quiz&&quiz.quiz&&used+15<=target+15){tasks.push({type:"quiz",title:"اختبار: "+quiz.module.title,detail:"قصير • يصنع مراجعات من الأخطاء",minutes:15,quizId:quiz.quiz.id,view:"roadmap"});used+=15}
  const practice=G.nextPractice();
  if(practice&&used+25<=target+20){const min=practice.skill==="اختبار"?35:practice.skill==="الكتابة"?30:25;tasks.push({type:"practice",title:practice.title,detail:practice.skill+" • "+practice.provider,minutes:min,url:practice.url,resourceId:practice.id,view:"practice"});used+=min}
  const lessons=G.lessons().filter(x=>!G.lessonDone(x.id)&&(!lesson||x.id!==lesson.id));
  for(const l of lessons){if(tasks.length>=6)break;const min=l.minutes||30;if(used+min>target+15)break;tasks.push({type:"lesson",title:l.title,detail:l.skill+" • "+l.provider,minutes:min,url:l.url,lessonId:l.id,view:"roadmap"});used+=min}
  return{tasks,minutes:used,target};
};

G.coach=()=>{
  const p=G.levelProgress(),coverage=G.skillCoverage(),weak=coverage[0],avg=G.quizAvg(),due=G.dueReviews().length;
  if(p.lessonDone===0)return{title:"ابدأ بالدرس الأول",text:"ما عندناش بيانات كافية عليك بعد. كمّل أول درس ثم اختبر نفسك باش يبدأ التشخيص."};
  if(due>8)return{title:"المراجعة أولاً",text:"عندك "+due+" بطاقات مستحقة. راجعها قبل ما تزيد معلومات جديدة."};
  if(avg!=null&&avg<60)return{title:"الاختبارات كتكشف ثغرات",text:"متوسط اختباراتك "+avg+"%. خدم أخطاء الاختبارات في المراجعة قبل الاستمرار بسرعة."};
  if(weak&&weak.pct<45)return{title:"خاص توازن أكثر في "+weak.skill,text:"التغطية ديال هاد المهارة "+weak.pct+"%. هادي ماشي بالضرورة أضعف مهارة لغوياً، لكنها الأقل تدريباً داخل التطبيق."};
  if(p.pct>=85)return{title:"قريب تسالي "+G.state.profile.level,text:"كمّل الاختبارات والموارد التطبيقية. 100% هنا كتعني إكمال المسار، ماشي شهادة CEFR رسمية."};
  return{title:"المسار متوازن",text:"كمّل الدرس التالي وخلي المراجعات المستحقة أولوية يومية."};
};

G.stats=()=>{
  const allLevels=G.data.curriculum.levels.map(level=>({id:level.id,...G.levelProgress(level)}));
  const quizzes=G.state.quizResults;
  return{streak:G.streak(),quizAvg:G.quizAvg(),quizCount:quizzes.length,reviewCount:Object.keys(G.state.reviewRecords).length,due:G.dueReviews().length,levels:allLevels};
};
})();