# German Master Pro 🇩🇪

مشروع شخصي عربي (RTL) لتعلّم الألمانية من **A1 إلى B2**. تمت إعادة بنائه من الصفر كـStatic Web App بدون Next.js وبدون Backend.

## الفكرة

المشروع ليس قائمة روابط. دورة الدراسة هي:

**شاهد → طبّق → اختبر → حوّل الأخطاء إلى مراجعات → راجع في الوقت المناسب → تابع**

## الموجود حالياً

- 4 مستويات: A1 / A2 / B1 / B2.
- 19 وحدة تعلم.
- 47 فيديو مرتب كدروس منفصلة.
- 36 مورداً للقراءة والكتابة والاستماع والاختبارات.
- 19 اختبار وحدة، بإجمالي 57 سؤالاً.
- 80 بطاقة مفردات، 20 لكل مستوى.
- Study Engine يبني خطة يومية حسب الوقت والتقدم.
- Spaced Review للمفردات وأخطاء الاختبارات.
- Streak وإحصائيات وتقدم حسب المستوى والمهارة.
- Onboarding لاختيار المستوى والوقت والهدف.
- Dark Mode.
- Responsive + Mobile bottom navigation.
- PWA / offline shell.
- البيانات محفوظة محلياً في localStorage.

## البنية

```text
/
├── index.html
├── manifest.webmanifest
├── sw.js
├── assets/
│   └── icon.svg
├── styles/
│   ├── base.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── store.js
│   ├── engine.js
│   ├── ui.js
│   └── app.js
├── data/
│   ├── curriculum.json
│   ├── quizzes.json
│   └── vocabulary.json
└── .github/workflows/
    ├── validate.yml
    └── pages.yml
```

## التشغيل محلياً

```bash
python -m http.server 8080
```

ثم افتح `http://localhost:8080/`.

> لا تفتح `index.html` عبر `file://` لأن ملفات JSON تُحمّل بـfetch.

## ملاحظة مهمة

نسبة التقدم داخل الموقع تقيس إنجاز المسار والاختبارات داخله؛ لا تساوي شهادة CEFR رسمية ولا تضمن الوصول إلى مستوى معين بدون ممارسة فعلية في الاستماع والكلام والقراءة والكتابة.
