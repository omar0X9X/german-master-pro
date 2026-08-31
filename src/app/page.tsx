import Link from "next/link";
const features=[
  ["🧠","تعلم تكيفي","خطة يومية تتغير حسب نقاط ضعفك وإتقانك."],
  ["🗣️","مدرس AI","شرح عربي ومحادثات ألمانية مع تصحيح فوري."],
  ["🧬","FSRS","مراجعات ذكية في الوقت الذي تكون فيه على وشك النسيان."],
  ["🎯","إتقان حقيقي","المحتوى لا يفتح لمجرد الضغط على التالي."],
];
export default function Landing(){return <main className="mx-auto max-w-6xl px-5 py-16">
  <section className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
    <div><div className="brand mb-4 text-sm font-black tracking-[.25em]">GERMANMASTER PRO</div><h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">الألمانية، لكن بخطة تعرف نقاط ضعفك.</h1><p className="muted mt-6 max-w-2xl text-lg leading-8">من A0 إلى B2 للناطقين بالعربية: مفردات، قواعد، قراءة، استماع، كتابة، محادثة، نطق، Shadowing وامتحانات — مرتبطة بمحرك إتقان واحد.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="rounded-xl bg-[var(--brand)] px-6 py-3 font-black text-black" href="/register">ابدأ اختبار المستوى</Link><Link className="rounded-xl border border-white/15 px-6 py-3 font-bold" href="/dashboard">استكشف لوحة التحكم</Link></div></div>
    <div className="glass rounded-[32px] p-6"><p className="muted text-sm">خطة اليوم</p><div className="mt-3 text-5xl font-black">180 <span className="text-lg font-medium">دقيقة</span></div><div className="mt-6 space-y-3">{[["FSRS",30],["أضعف مهارة",40],["استماع",25],["قراءة",20],["AI",15],["نطق",15],["قواعد",15],["كتابة",20]].map(([a,b])=><div key={String(a)} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"><span>{a}</span><b>{b}د</b></div>)}</div></div>
  </section>
  <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(([i,t,d])=><article key={t} className="glass rounded-2xl p-5"><div className="text-2xl">{i}</div><h2 className="mt-3 font-black">{t}</h2><p className="muted mt-2 text-sm leading-6">{d}</p></article>)}</section>
</main>}
