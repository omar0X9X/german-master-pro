import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
export default function Page(){return <section className="glass w-full rounded-3xl p-7" dir="rtl"><p className="brand text-sm font-bold">Willkommen zurück</p><h1 className="mt-2 text-3xl font-black">تسجيل الدخول</h1><p className="muted mt-2">يعمل مع Supabase عند ضبط المفاتيح، أو كجلسة تجريبية في Mock Mode.</p><LoginForm/><Link className="mt-5 block text-sm underline" href="/register">ليس لديك حساب؟ ابدأ الآن</Link></section>}
