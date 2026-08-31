"use client";
import { useMemo, useState } from "react";

const sentences=[
  "Guten Morgen! Wie geht es dir heute?",
  "Ich fahre jeden Morgen mit dem Bus zur Arbeit.",
  "Am Wochenende treffe ich meine Freunde in der Stadt.",
];
export function ShadowingLab(){
  const[index,setIndex]=useState(0);const[speed,setSpeed]=useState(.85);const[attempts,setAttempts]=useState<number[]>(()=>sentences.map(()=>0));const current=sentences[index];
  const progress=useMemo(()=>Math.round(attempts.filter(x=>x>=2).length/sentences.length*100),[attempts]);
  function play(){if(!("speechSynthesis" in window))return;const u=new SpeechSynthesisUtterance(current);u.lang="de-DE";u.rate=speed;speechSynthesis.cancel();speechSynthesis.speak(u)}
  function completedAttempt(){setAttempts(a=>a.map((x,i)=>i===index?x+1:x));if(attempts[index]>=1)setIndex(i=>(i+1)%sentences.length)}
  return <div className="mx-auto max-w-3xl space-y-5"><div className="glass rounded-2xl p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black text-blue-600">SHADOWING · A1</p><h2 className="mt-2 text-2xl font-black">اسمع ← ردد ← أعد</h2></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{progress}%</span></div><div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-900"><p className="text-2xl leading-10" dir="ltr">{current}</p><p className="muted mt-2 text-sm">المحاولة {attempts[index]+1} · الجملة {index+1}/{sentences.length}</p></div><div className="mt-5 flex flex-wrap gap-3"><button onClick={play} className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white">▶ استمع</button><label className="rounded-xl border px-3 py-2 text-sm font-bold">السرعة <select value={speed} onChange={e=>setSpeed(Number(e.target.value))} className="bg-transparent"><option value={.7}>0.7×</option><option value={.85}>0.85×</option><option value={1}>1×</option></select></label><button onClick={completedAttempt} className="rounded-xl border px-5 py-3 font-black">رددتها ✓</button></div></div><div className="grid gap-3 sm:grid-cols-3">{sentences.map((s,i)=><button key={s} onClick={()=>setIndex(i)} className={`rounded-xl border p-3 text-start ${i===index?"border-blue-600 bg-blue-50":""}`}><span className="text-xs font-black">{i+1}</span><p className="mt-1 text-sm" dir="ltr">{s}</p><p className="muted mt-1 text-xs">{attempts[i]} محاولات</p></button>)}</div></div>
}
