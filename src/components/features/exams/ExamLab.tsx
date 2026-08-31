"use client";
import { useEffect, useMemo, useState } from "react";

type Answer=Record<number,string>;
const questions=[
 {id:1,section:"Lesen",prompt:"Anna arbeitet von Montag bis Freitag. Am Samstag besucht sie ihre Familie. Wann besucht Anna ihre Familie?",options:["Montag","Freitag","Samstag"],correct:"Samstag"},
 {id:2,section:"Hören",prompt:"Du hörst: 'Der Zug nach Köln fährt heute von Gleis vier.' Von welchem Gleis fährt der Zug?",options:["2","4","6"],correct:"4"},
 {id:3,section:"Grammatik",prompt:"Ich ___ seit zwei Jahren in Berlin.",options:["wohne","wohnt","wohnst"],correct:"wohne"},
];
export function ExamLab(){
 const[seconds,setSeconds]=useState(10*60);const[answers,setAnswers]=useState<Answer>({});const[submitted,setSubmitted]=useState(false);
 useEffect(()=>{if(submitted||seconds<=0)return;const id=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>clearInterval(id)},[submitted,seconds]);
 useEffect(()=>{if(seconds===0)setSubmitted(true)},[seconds]);
 const score=useMemo(()=>Math.round(questions.filter(q=>answers[q.id]===q.correct).length/questions.length*100),[answers]);
 const time=`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
 return <div className="mx-auto max-w-4xl space-y-5"><div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5"><div><p className="text-xs font-black text-blue-600">GOETHE STYLE · ORIGINAL PRACTICE</p><h2 className="text-2xl font-black">A1 Mini-Prüfung</h2></div><div className="text-left"><p className="muted text-xs">الوقت المتبقي</p><p className="font-mono text-2xl font-black">{time}</p></div></div>{questions.map((q,i)=><section key={q.id} className="glass rounded-2xl p-5"><div className="flex gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black dark:bg-slate-800">{q.section}</span><span className="muted text-xs">{i+1}/{questions.length}</span></div><p className="mt-4 text-lg leading-8" dir="ltr">{q.prompt}</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{q.options.map(o=><button disabled={submitted} key={o} onClick={()=>setAnswers(a=>({...a,[q.id]:o}))} className={`rounded-xl border px-4 py-3 ${answers[q.id]===o?"border-blue-600 bg-blue-50":""}`}>{o}</button>)}</div>{submitted&&<p className={`mt-3 text-sm font-bold ${answers[q.id]===q.correct?"text-emerald-600":"text-red-600"}`}>{answers[q.id]===q.correct?"صحيح ✓":`الإجابة الصحيحة: ${q.correct}`}</p>}</section>)}{submitted?<div className="glass rounded-2xl p-6 text-center"><p className="muted text-sm">النتيجة</p><p className="mt-2 text-5xl font-black text-blue-600">{score}%</p><p className="mt-2 font-bold">{score>=60?"ناجح في هذه المحاكاة المصغرة":"تحتاج مراجعة إضافية قبل المحاكاة الكاملة"}</p><button onClick={()=>{setAnswers({});setSeconds(600);setSubmitted(false)}} className="mt-4 rounded-xl border px-5 py-3 font-bold">إعادة المحاولة</button></div>:<button onClick={()=>setSubmitted(true)} disabled={Object.keys(answers).length===0} className="w-full rounded-xl bg-blue-600 px-5 py-4 font-black text-white disabled:opacity-40">إنهاء الاختبار</button>}</div>
}
