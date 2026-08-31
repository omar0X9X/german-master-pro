import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
export default function Page(){return <section className="glass w-full rounded-3xl p-7" dir="rtl"><p className="brand text-sm font-bold">A0 → B2</p><h1 className="mt-2 text-3xl font-black">أنشئ حسابك</h1><p className="muted mt-2">اختر الهدف الآن، ثم يبدأ اختبار تحديد المستوى ومسار التعلم التكيفي.</p><RegisterForm/><Link className="mt-5 block text-sm underline" href="/login">لديك حساب بالفعل</Link></section>}
