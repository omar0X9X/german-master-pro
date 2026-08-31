# GermanMaster Pro 🇩🇪🇲🇦
منصة مفتوحة المصدر لتعلم الألمانية للناطقين بالعربية من A0 إلى B2. ليست مكتبة دروس فقط: المحرك يقرر ماذا تدرس اليوم بناءً على أضعف مهارة، بطاقات FSRS المستحقة، أخطائك، والإتقان.

## ما يعمل الآن
- Dashboard تكيفي وخطة افتراضية 180 دقيقة.
- مختبرات تفاعلية للمفردات، القراءة، الاستماع، القواعد، الكتابة، المحادثة، النطق، Shadowing، Flashcards والاختبارات.
- FSRS scheduler داخلي مع Again/Hard/Good/Easy.
- Mastery + unlock rules (70% للفتح، 80% للإتقان).
- AI Manager: Mock بدون مفاتيح + OpenAI/Anthropic/Gemini/Ollama adapters.
- تسجيل/دخول عبر Supabase عند ضبطه مع Mock Mode للتجربة المحلية.
- Supabase schema موسع إلى 42 جدولًا مع RLS وفهارس.
- Mistake Bank، Preferences وNotifications APIs مع Mock fallback.
- PWA: manifest + service worker + offline fallback.
- Zod validation + shared API rate limiting.
- Vitest + content validation + GitHub Actions + security audit.
- Next.js 16.3.3 Active LTS بسبب متطلبات الأمان الحالية.

## التشغيل السريع
```bash
npm install
cp .env.example .env.local
npm run dev
```
افتح `http://localhost:3000`. لا تحتاج أي API key لأن `AI_PROVIDER=mock` هو الوضع الافتراضي.

## Supabase
أنشئ مشروع Supabase ثم نفّذ:
1. `src/lib/supabase/schema.sql`
2. `src/lib/supabase/migrations/004_platform_expansion.sql`

ثم أضف `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY` إلى `.env.local`.

## AI providers
غيّر `AI_PROVIDER` إلى `openai`, `anthropic`, `gemini`, أو `ollama` وأضف المفتاح الموافق. في غياب المفاتيح استخدم `mock`.

## الجودة
```bash
npm run typecheck
npm test
npm run validate:content
npm run build
```

## حالة المشروع
هذا المستودع ينفذ المنصة تدريجيًا وفق Epic #1. لا نحسب placeholder أو ملفًا فارغًا كميزة مكتملة. أهداف المحتوى الضخمة (5000+ كلمة، 300+ قاعدة، 100+ نص، 200+ استماع) تبقى milestones منفصلة حتى يتم إدخالها والتحقق منها فعليًا.

## ملاحظة الفيديوهات
المواصفات أعطت عناوين ومددًا بلا روابط أصلية؛ لذلك لا تُخترع روابط. تُضاف الروابط فقط بعد التحقق من المصدر.
