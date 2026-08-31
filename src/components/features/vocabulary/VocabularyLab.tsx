"use client";
import { useMemo, useState } from "react";

const words = [
  { id: 1, word: "der Alltag", ar: "الحياة اليومية", plural: "die Alltage", example: "Mein Alltag beginnt um sieben Uhr.", exampleAr: "يبدأ يومي في السابعة.", level: "A1", topic: "daily" },
  { id: 2, word: "die Erfahrung", ar: "التجربة / الخبرة", plural: "die Erfahrungen", example: "Das war eine gute Erfahrung.", exampleAr: "كانت تلك تجربة جيدة.", level: "A2", topic: "life" },
  { id: 3, word: "zuverlässig", ar: "موثوق", plural: "—", example: "Meine Kollegin ist sehr zuverlässig.", exampleAr: "زميلتي موثوقة جدًا.", level: "B1", topic: "work" },
  { id: 4, word: "die Voraussetzung", ar: "شرط مسبق", plural: "die Voraussetzungen", example: "Deutsch B2 ist eine wichtige Voraussetzung.", exampleAr: "الألمانية B2 شرط مهم.", level: "B2", topic: "study" },
];

export function VocabularyLab() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("ALL");
  const [revealed, setRevealed] = useState<number[]>([]);
  const filtered = useMemo(() => words.filter(w => (level === "ALL" || w.level === level) && `${w.word} ${w.ar} ${w.example}`.toLowerCase().includes(query.toLowerCase())), [query, level]);
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = "de-DE"; u.rate = .88; speechSynthesis.cancel(); speechSynthesis.speak(u);
  };
  return <div className="space-y-5">
    <div className="glass grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_180px]">
      <label className="text-sm font-bold">بحث<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="كلمة ألمانية أو عربية..." className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"/></label>
      <label className="text-sm font-bold">المستوى<select value={level} onChange={e=>setLevel(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3"><option value="ALL">الكل</option>{["A1","A2","B1","B2"].map(x=><option key={x}>{x}</option>)}</select></label>
    </div>
    <div className="grid gap-4 md:grid-cols-2">{filtered.map(w=>{const open=revealed.includes(w.id);return <article key={w.id} className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{w.level}</span><h2 className="mt-3 text-2xl font-black" dir="ltr">{w.word}</h2></div><button onClick={()=>speak(w.word)} className="rounded-xl border px-3 py-2" aria-label={`استمع إلى ${w.word}`}>🔊</button></div>
      <button onClick={()=>setRevealed(v=>open?v.filter(id=>id!==w.id):[...v,w.id])} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white">{open?"إخفاء المعنى":"اكشف المعنى"}</button>
      {open&&<div className="mt-4 space-y-2"><p className="text-lg font-bold">{w.ar}</p><p className="muted text-sm">الجمع: {w.plural}</p><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><p dir="ltr">{w.example}</p><p className="muted mt-1 text-sm">{w.exampleAr}</p></div></div>}
    </article>})}</div>
    {!filtered.length&&<p className="glass rounded-2xl p-5 text-center">لا توجد نتيجة مطابقة.</p>}
  </div>;
}
