# GermanMaster Pro 🇩🇪🇲🇦
منصة مفتوحة المصدر لتعلم الألمانية للناطقين بالعربية من A0 إلى B2. ليست مكتبة دروس فقط: المحرك يقرر ماذا تدرس اليوم بناءً على أضعف مهارة، بطاقات FSRS المستحقة، أخطائك، والإتقان.

## ما يعمل الآن
- Dashboard تكيفي وخطة افتراضية 180 دقيقة.
- مفردات بسياق عربي/ألماني، قراءة A1/A2/B1، استماع باستخدام SpeechSynthesis في المتصفح.
- FSRS 4.5 scheduler داخلي مع Again/Hard/Good/Easy.
- Mastery + unlock rules (70% للفتح، 80% للإتقان).
- AI Manager: Mock بدون مفاتيح + OpenAI/Anthropic/Gemini/Ollama adapters.
- AI Tutor وGrammar Check API.
- Web Speech pronunciation demo + custom transcript scorer + Praat-compatible acoustic adapter boundary.
- Supabase schema مع RLS وعزل كامل لبيانات المستخدمين.
- Vitest, Playwright, content validation, Docker, GitHub Actions.

## التشغيل السريع
```bash
npm install
cp .env.example .env.local
npm run dev
```
افتح `http://localhost:3000`. لا تحتاج أي API key لأن `AI_PROVIDER=mock` هو الوضع الافتراضي.

## Supabase
أنشئ مشروع Supabase ثم نفّذ `src/lib/supabase/schema.sql`. أضف `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY` إلى `.env.local`.

## AI providers
غيّر `AI_PROVIDER` إلى `openai`, `anthropic`, `gemini`, أو `ollama` وأضف المفتاح الموافق. في غياب المفاتيح استخدم `mock`.

## جودة المحتوى
```bash
npm run validate:content
npm test
npm run test:e2e
```

## ملاحظة الفيديوهات
المواصفات أعطت عناوين ومددًا بلا روابط أصلية؛ لذلك تم تنظيمها في الكتالوج مع `url: null` بدل اختراع روابط غير موثوقة. عند إضافة الروابط الحقيقية يختبرها content validation لاحقًا.
