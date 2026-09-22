window.GMP=window.GMP||{};
(()=>{
const G=window.GMP;
const LEVELS=["A1","A2","B1","B2"];

G.errorUnlockStatus=(level="A1")=>{
  const zero=G.zeroProgress();
  const a1=G.grammarProgress("A1");
  const globalUnlocked=zero.total>0&&zero.pct===100&&a1.total>0&&a1.pct===100;
  const gp=G.grammarProgress(level);
  const levelUnlocked=level==="A1"?globalUnlocked:(globalUnlocked&&gp.total>0&&gp.pct===100);
  return{
    globalUnlocked,levelUnlocked,zero,a1,grammar:gp,
    reason:!globalUnlocked?"كمّل مسار الحروف من الصفر وقواعد A1 أولاً.":(!levelUnlocked?"كمّل قواعد "+level+" باش يتحل تدريب الأخطاء ديالو.":"مفتوح")
  };
};

G.errorSkills=(level="A1")=>G.data.errorEngine?.levels?.find(x=>x.level===level)?.skills||[];
G.errorExercises=(level="A1",skill="all")=>{
  const all=G.data.errorEngine?.exercises?.filter(x=>x.level===level)||[];
  return skill==="all"?all:all.filter(x=>x.skill===skill);
};
G.errorExercise=id=>G.data.errorEngine?.exercises?.find(x=>x.id===id)||null;

const norm=s=>String(s||"")
  .normalize("NFC")
  .toLocaleLowerCase("de-DE")
  .replace(/[„“"!?.,;:()[\]{}]/g," ")
  .replace(/\s+/g," ")
  .trim();

G.checkErrorAnswer=(exercise,userAnswer)=>{
  const expected=Array.isArray(exercise.answers)?exercise.answers:[exercise.answer];
  const u=norm(userAnswer);
  return expected.some(a=>norm(a)===u);
};

G.errorAttemptStats=exerciseId=>{
  const list=G.state.errorAttempts.filter(x=>x.exerciseId===exerciseId);
  const correct=list.filter(x=>x.correct).length;
  return{attempts:list.length,correct,last:list.length?list[list.length-1].at:0,accuracy:list.length?Math.round(correct/list.length*100):0};
};

G.errorSkillStats=(level,skill)=>{
  const bank=G.errorExercises(level,skill);
  const attempts=G.state.errorAttempts.filter(x=>x.level===level&&x.skill===skill);
  const bankIds=new Set(bank.map(x=>x.id));
  const unique=new Set(attempts.filter(x=>bankIds.has(x.exerciseId)).map(x=>x.exerciseId)).size;
  const correct=attempts.filter(x=>x.correct).length;
  const accuracy=attempts.length?correct/attempts.length:0;
  const coverage=bank.length?unique/bank.length:0;
  const mastery=attempts.length?Math.round((accuracy*.6+coverage*.4)*100):0;
  const open=G.state.errorNotebook.filter(x=>x.level===level&&x.skill===skill&&!x.resolved).length;
  return{level,skill,attempts:attempts.length,correct,accuracy:Math.round(accuracy*100),coverage:Math.round(coverage*100),mastery,open,totalExercises:bank.length,unique};
};

G.errorLevelStats=(level="A1")=>{
  const skills=G.errorSkills(level).map(s=>({...s,...G.errorSkillStats(level,s.id)}));
  const mastery=skills.length?Math.round(skills.reduce((n,s)=>n+s.mastery,0)/skills.length):0;
  const attempts=skills.reduce((n,s)=>n+s.attempts,0);
  const open=G.state.errorNotebook.filter(x=>x.level===level&&!x.resolved).length;
  return{level,mastery,attempts,open,skills};
};

G.errorWeakSkills=(level="A1")=>G.errorLevelStats(level).skills.slice().sort((a,b)=>a.mastery-b.mastery||a.attempts-b.attempts);

G.errorRecommended=(level="A1",skill="all")=>{
  if(!G.errorUnlockStatus(level).levelUnlocked)return null;
  let target=skill;
  if(target==="all")target=G.errorWeakSkills(level)[0]?.id||G.errorSkills(level)[0]?.id;
  const list=G.errorExercises(level,target);
  if(!list.length)return null;
  return list.slice().sort((a,b)=>{
    const sa=G.errorAttemptStats(a.id),sb=G.errorAttemptStats(b.id);
    const aScore=(sa.accuracy>=80?100:0)+sa.attempts*8+(sa.last?Math.min(20,(Date.now()-sa.last)/86400000):0);
    const bScore=(sb.accuracy>=80?100:0)+sb.attempts*8+(sb.last?Math.min(20,(Date.now()-sb.last)/86400000):0);
    return aScore-bScore;
  })[0]||list[0];
};

const notebookId=(source,ref)=>source+"::"+ref;
G.recordErrorAttempt=(exercise,userAnswer,correct,source="engine")=>{
  const item={
    exerciseId:exercise.id,level:exercise.level,skill:exercise.skill,type:exercise.type,
    prompt:exercise.prompt,userAnswer:String(userAnswer||""),answer:exercise.answer,
    correct:Boolean(correct),source,at:Date.now()
  };
  G.state.errorAttempts.push(item);
  G.state.errorAttempts=G.state.errorAttempts.slice(-2500);
  const id=notebookId(source,exercise.id);
  let note=G.state.errorNotebook.find(x=>x.id===id);
  if(!correct){
    if(!note){
      note={id,source,ref:exercise.id,level:exercise.level,skill:exercise.skill,prompt:exercise.prompt,
        userAnswer:String(userAnswer||""),answer:exercise.answer,explain:exercise.explain||"",
        wrongCount:0,correctStreak:0,resolved:false,createdAt:Date.now(),lastAt:Date.now()};
      G.state.errorNotebook.push(note);
    }
    note.wrongCount=(note.wrongCount||0)+1;note.correctStreak=0;note.resolved=false;
    note.userAnswer=String(userAnswer||"");note.answer=exercise.answer;note.lastAt=Date.now();
  }else if(note&&!note.resolved){
    note.correctStreak=(note.correctStreak||0)+1;note.lastAt=Date.now();
    if(note.correctStreak>=2){note.resolved=true;note.resolvedAt=Date.now()}
  }
  G.touch();G.save();
  return item;
};

const classify=(level,text)=>{
  const t=String(text||"").toLowerCase();
  const tests={
    A1:[
      ["cases",/akkusativ|nominativ|\bden\b|\beinen\b|مفعول|فاعل/],
      ["negation",/kein|keine|nicht|negat/],
      ["possessive",/mein|dein|sein|ihr|unser|euer|possess/],
      ["modal",/modal|kann|muss|will|darf|soll|aufstehen|trenn/],
      ["wordorder",/wortstellung|reihenfolge|position|frage|verb.*zwe|ترتيب|سؤال/],
      ["verbs",/sein|haben|präsens|konjug|\bbin\b|\bbist\b|\bist\b/],
      ["artikel",/artikel|der|die|das|ein|eine|gender|جنس/],
      ["spelling",/schreib|laut|aussprache|buchstab|إملاء|نطق/]
    ],
    A2:[
      ["dativ",/dativ|\bdem\b|\bder\b.*frau|mir|dir|helfen|gefallen/],
      ["wechsel",/wechsel|wohin|\bwo\b|in die|in der|auf dem|auf den/],
      ["perfekt",/perfekt|partizip|gefahren|gelernt|worden/],
      ["nebensatz",/weil|dass|wenn|obwohl|nebensatz/],
      ["adjective",/adjektiv|roten|gute|schönen|endung/],
      ["comparison",/kompar|superl|größer|besser|am besten/],
      ["reflexive",/reflex|mich|dich|sich|interess|warten auf|denken an/],
      ["timeprep",/seit|vor|in .*tag|für|ab|bis|zeit/]
    ],
    B1:[
      ["relative",/relativ|der ich|den ich|mit der|denen/],
      ["passive",/passiv|wird|worden|gebaut/],
      ["k2",/konjunktiv ii|würde|hätte|wäre|könnte/],
      ["genitive",/genitiv|wegen|trotz|des .*s/],
      ["connectors",/obwohl|trotzdem|damit|konnektor/],
      ["infinitive",/um.*zu|ohne.*zu|statt.*zu|infinitiv/],
      ["pronadv",/worauf|daran|damit|pronominal/],
      ["ndecl",/n-dekl|studenten|tekamolo|mittelfeld/]
    ],
    B2:[
      ["k1",/konjunktiv i|\bsei\b|\bhabe\b|\bkönne\b/],
      ["passive2",/zustandspassiv|lässt sich|zu beachten|passiv/],
      ["nominal",/nominal|entscheidung|analyse|prüfung der/],
      ["participle",/partizip|steigenden|getroffene|veröffentlichten/],
      ["connectors2",/je .* desto|indem|sodass|sofern/],
      ["collocation",/nomen-verb|entscheidung treffen|maßnahmen ergreifen|einfluss nehmen/],
      ["reported",/soll .* sein|muss .* sein|will .* gesehen|bericht/],
      ["style",/stil|präzis|formell|nachvollziehbar|umformul/]
    ]
  };
  return (tests[level]||[]).find(([,re])=>re.test(t))?.[0]||"general";
};

G.captureQuizAnswer=(quizId,quiz,q,userAnswer,correct)=>{
  const module=G.data.curriculum?.levels?.flatMap(l=>l.modules).find(m=>m.quizId===quizId);
  const skill=classify(quiz.level,(module?.title||"")+" "+q.prompt+" "+(q.explain||""));
  const synthetic={
    id:"quiz-"+quizId+"-"+q.id,level:quiz.level,skill,type:"quiz",prompt:q.prompt,
    answer:q.options[q.answer],explain:q.explain||""
  };
  G.recordErrorAttempt(synthetic,userAnswer,correct,"quiz");
};

G.addManualError=(level,skill,wrong,correct,note="")=>{
  const id="manual-"+Date.now()+"-"+Math.random().toString(36).slice(2,7);
  const item={id,source:"manual",ref:id,level,skill,prompt:"خطأ يدوي",userAnswer:String(wrong||""),
    answer:String(correct||""),explain:String(note||""),wrongCount:1,correctStreak:0,resolved:false,
    createdAt:Date.now(),lastAt:Date.now()};
  G.state.errorManual.push({id,level,skill,wrong:String(wrong||""),correct:String(correct||""),note:String(note||""),at:Date.now()});
  G.state.errorNotebook.push(item);G.touch();G.save();return item;
};

G.toggleErrorResolved=id=>{
  const x=G.state.errorNotebook.find(n=>n.id===id);if(!x)return;
  x.resolved=!x.resolved;x.lastAt=Date.now();if(x.resolved)x.resolvedAt=Date.now();
  G.save();
};

G.errorNotebookList=(level=null,openOnly=false)=>G.state.errorNotebook
  .filter(x=>(!level||x.level===level)&&(!openOnly||!x.resolved))
  .sort((a,b)=>(a.resolved-b.resolved)||(b.lastAt-a.lastAt));

})();
