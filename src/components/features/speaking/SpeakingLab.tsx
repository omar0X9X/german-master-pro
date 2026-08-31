"use client";
import { FormEvent, useState } from "react";

type Message={role:"user"|"assistant";content:string};
export function SpeakingLab(){
  const [messages,setMessages]=useState<Message[]>([{role:"assistant",content:"Guten Tag! Was möchten Sie bestellen?"}]);
  const [input,setInput]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();const text=input.trim();if(!text||busy)return;setInput("");setMessages(m=>[...m,{role:"user",content:text}]);setBusy(true);try{const res=await fetch("/api/ai/tutor",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:text,level:"A1",scenario:"ordering_food"})});const data=await res.json();setMessages(m=>[...m,{role:"assistant",content:data.response??data.error??"Versuch es noch einmal."}])}catch{setMessages(m=>[...m,{role:"assistant",content:"Mock: Sehr gut. Möchten Sie noch etwas?"}])}finally{setBusy(false)}}
  return <div className="mx-auto max-w-3xl"><div className="glass rounded-2xl p-4"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-black text-blue-600">ROLEPLAY · RESTAURANT</p><h2 className="font-black">تحدث ولا تنتظر الكمال</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">A1</span></div><div className="space-y-3">{messages.map((m,i)=><div key={i} className={`max-w-[85%] rounded-2xl p-3 ${m.role==="user"?"mr-auto bg-blue-600 text-white":"ml-auto bg-slate-100 text-slate-900"}`} dir={m.role==="user"?"ltr":"ltr"}>{m.content}</div>)}</div><form onSubmit={submit} className="mt-4 flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} className="min-w-0 flex-1 rounded-xl border bg-transparent px-4 py-3" placeholder="Ich möchte einen Kaffee..." dir="ltr"/><button disabled={busy} className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy?"...":"إرسال"}</button></form></div></div>
}
