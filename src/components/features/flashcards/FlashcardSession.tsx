"use client";
import { useState } from "react";
import { createNewCard, reviewCard } from "@/lib/engine/fsrs-scheduler";
import type { Rating } from "@/types";

const cards=[
  {front:"der Termin",back:"الموعد",example:"Ich habe morgen einen Termin."},
  {front:"sich erinnern an",back:"يتذكر",example:"Ich erinnere mich an Berlin."},
  {front:"die Möglichkeit",back:"الإمكانية",example:"Das ist eine gute Möglichkeit."},
];
export function FlashcardSession(){
  const [index,setIndex]=useState(0); const [show,setShow]=useState(false); const [memory,setMemory]=useState(()=>cards.map(()=>createNewCard())); const [done,setDone]=useState(0);
  const card=cards[index];
  function rate(rating:Rating){setMemory(m=>m.map((x,i)=>i===index?reviewCard(x,rating):x));setDone(d=>d+1);setShow(false);setIndex(i=>(i+1)%cards.length)}
  const current=memory[index];
  return <div className="mx-auto max-w-2xl space-y-4">
    <div className="flex items-center justify-between text-sm"><span>{done} مراجعة في هذه الجلسة</span><span className="muted">الحالة: {current.state} · الثبات {current.stability.toFixed(2)}</span></div>
    <section className="glass flex min-h-80 flex-col items-center justify-center rounded-3xl p-8 text-center"><p className="text-xs font-black text-blue-600">FSRS CARD {index+1}/{cards.length}</p><h2 className="mt-5 text-4xl font-black" dir="ltr">{card.front}</h2>{show?<div className="mt-6"><p className="text-2xl font-bold">{card.back}</p><p className="muted mt-4 text-lg" dir="ltr">{card.example}</p></div>:<button onClick={()=>setShow(true)} className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-black text-white">إظهار الإجابة</button>}</section>
    {show&&<div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><button onClick={()=>rate(1)} className="rounded-xl bg-red-50 px-3 py-3 font-bold text-red-700">Again</button><button onClick={()=>rate(2)} className="rounded-xl bg-amber-50 px-3 py-3 font-bold text-amber-700">Hard</button><button onClick={()=>rate(3)} className="rounded-xl bg-emerald-50 px-3 py-3 font-bold text-emerald-700">Good</button><button onClick={()=>rate(4)} className="rounded-xl bg-blue-50 px-3 py-3 font-bold text-blue-700">Easy</button></div>}
  </div>
}
