"use client";
import { useState } from "react";

const lesson = {
  title: "Mein Tag",
  level: "A1",
  de: ["Ich stehe um sieben Uhr auf. Danach frühstücke ich und trinke Kaffee.", "Um acht Uhr fahre ich mit dem Bus zur Arbeit. Am Abend koche ich, lese ein Buch und gehe um elf Uhr schlafen."],
  ar: ["أستيقظ في السابعة. بعد ذلك أتناول الفطور وأشرب القهوة.", "في الثامنة أذهب بالحافلة إلى العمل. في المساء أطبخ وأقرأ كتابًا وأنام في الحادية عشرة."],
  glossary: [["aufstehen","يستيقظ"],["frühstücken","يتناول الفطور"],["mit dem Bus fahren","يذهب بالحافلة"],["schlafen","ينام"]],
};
export function ReadingLab(){
  const [translation,setTranslation]=useState(false); const [answer,setAnswer]=useState<string>(); const correct=answer==="7";
  return <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
    <section className="glass rounded-2xl p-5 md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-xs font-black text-blue-600">{lesson.level} · LEICHTES LESEN</span><h2 className="mt-2 text-3xl font-black">{lesson.title}</h2></div><button onClick={()=>setTranslation(v=>!v)} className="rounded-xl border px-4 py-3 font-bold">{translation?"إخفاء العربية":"إظهار العربية"}</button></div>
    <div className="mt-6 space-y-5 text-lg leading-9" dir="ltr">{lesson.de.map((p,i)=><div key={p}><p>{p}</p>{translation&&<p className="mt-2 rounded-xl bg-blue-50 p-3 text-base leading-7 text-slate-700" dir="rtl">{lesson.ar[i]}</p>}</div>)}</div>
    <div className="mt-7 border-t pt-5"><p className="font-black">Wann steht die Person auf?</p><div className="mt-3 flex flex-wrap gap-2">{["6","7","8"].map(x=><button key={x} onClick={()=>setAnswer(x)} className={`rounded-xl border px-4 py-2 ${answer===x?"border-blue-600 bg-blue-50":""}`}>Um {x} Uhr</button>)}</div>{answer&&<p className={`mt-3 font-bold ${correct?"text-emerald-600":"text-red-600"}`}>{correct?"صحيح ✓":"ليس صحيحًا. ارجع إلى الجملة الأولى."}</p>}</div></section>
    <aside className="glass rounded-2xl p-5"><h3 className="font-black">Glossar</h3><div className="mt-4 divide-y">{lesson.glossary.map(([de,ar])=><div key={de} className="py-3"><p className="font-bold" dir="ltr">{de}</p><p className="muted text-sm">{ar}</p></div>)}</div></aside>
  </div>
}
