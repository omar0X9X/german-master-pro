"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm(){
  const router=useRouter();
  const [email,setEmail]=useState("");const[password,setPassword]=useState("");const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const res=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});const data=await res.json();if(!res.ok){setMessage(data.error??"تعذر تسجيل الدخول");return}setMessage(data.mode==="mock"?"تم فتح جلسة تجريبية. سيتم نقلك للوحة التحكم.":"تم تسجيل الدخول بنجاح.");setTimeout(()=>router.push("/dashboard"),350)}catch{setMessage("تعذر الاتصال بالخادم.")}finally{setBusy(false)}}
  return <form onSubmit={submit} className="mt-6 grid gap-4"><label className="font-bold">البريد<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" className="mt-1 w-full rounded-xl border bg-transparent p-3" required/></label><label className="font-bold">كلمة المرور<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" minLength={8} className="mt-1 w-full rounded-xl border bg-transparent p-3" required/></label><button disabled={busy} className="rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50">{busy?"جارٍ الدخول...":"دخول"}</button>{message&&<p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-900" aria-live="polite">{message}</p>}</form>
}
