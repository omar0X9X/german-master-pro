window.GMP=window.GMP||{};
(()=>{
const G=window.GMP,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const E=G.escape,U=G.url;
const titles={dashboard:["مسارك اليوم","الرئيسية"],roadmap:["A1 → B2","المسار"],review:["Spaced Review","المراجعة"],practice:["المهارات","التطبيق"],stats:["Progress","الإحصائيات"]};
const toast=msg=>{const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(G.runtime.toastTimer);G.runtime.toastTimer=setTimeout(()=>el.classList.remove("show"),1900)};
G.ui={toast};

G.ui.setView=view=>{
  if(!titles[view])view="dashboard";G.runtime.view=view;G.state.lastView=view;G.save();
  $$("[data-panel]").forEach(x=>x.classList.toggle("active",x.dataset.panel===view));
  $$("[data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  $("#topEyebrow").textContent=titles[view][0];$("#topTitle").textContent=titles[view][1];
  G.ui.renderView(view);window.scrollTo({top:0,behavior:"smooth"});
};

G.ui.renderDashboard=()=>{
  const level=G.currentLevel(),p=G.levelProgress(level),next=G.nextLesson(),due=G.dueReviews().length,avg=G.quizAvg(),plan=G.todayPlan(),coach=G.coach();
  $("#levelChip").textContent=level.id;$("#progressLevel").textContent=level.id;$("#progressPct").textContent=p.pct+"%";$("#progressRing").style.setProperty("--p",(p.pct*3.6)+"deg");
  $("#heroTitle").textContent=next?"كمّل "+level.id+" خطوة بخطوة.":"كملت مسار "+level.id+" الحالي.";
  $("#heroText").textContent=due?("عندك "+due+" مراجعات مستحقة، وبعدها الدرس التالي."):"المحرك رتب لك درساً وتطبيقاً حسب تقدمك.";
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
  if(!t)return;if(t.type==="quiz"){G.ui.openQuiz(t.quizId);return}
  if(t.type==="review"){G.ui.setView("review");return}
  if(t.url)window.open(U(t.url),"_blank","noopener");
  if(t.view&&t.view!=="dashboard")G.ui.setView(t.view);
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
  $("#statsGrid").innerHTML='<article><small>إنجاز '+E(G.state.profile.level)+'</small><b>'+current.pct+'%</b><span>دروس + تطبيق + اختبارات</span></article><article><small>Streak</small><b>'+s.streak+'</b><span>أيام</span></article><article><small>متوسط الاختبارات</small><b>'+(s.quizAvg==null?"—":s.quizAvg+"%")+'</b><span>'+s.quizCount+' محاولة</span></article><article><small>بطاقات مراجعة</small><b>'+s.reviewCount+'</b><span>'+s.due+' مستحقة</span></article>';
  $("#levelStats").innerHTML=s.levels.map(x=>'<div class="level-stat"><b>'+x.id+'</b><div class="track"><i style="width:'+x.pct+'%"></i></div><span>'+x.pct+'%</span></div>').join("");
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

G.ui.renderView=v=>({dashboard:G.ui.renderDashboard,roadmap:G.ui.renderRoadmap,review:G.ui.renderReview,practice:G.ui.renderPractice,stats:G.ui.renderStats}[v]||(()=>{}))();
G.ui.renderAll=()=>{G.ui.renderDashboard();G.ui.renderRoadmap();G.ui.renderReview();G.ui.renderPractice();G.ui.renderStats();$("#levelChip").textContent=G.state.profile.level};
})();