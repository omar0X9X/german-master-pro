# German Path — Static A1 → B2

نسخة Static مستقلة داخل مشروع `german-master-pro`، بدون React أو Next.js أو Backend.

## هيكل الملفات

```text
static-site/
├── index.html
├── styles.css
├── app.js
├── README.md
└── data/
    └── curriculum.json

.github/workflows/
└── pages-static.yml
```

## المزايا

- واجهة عربية RTL.
- Responsive للموبايل والتابلت والديسكتوب.
- A1 / A2 / B1 / B2 في 24 أسبوعاً.
- 6 أيام دراسة لكل أسبوع.
- روابط YouTube مرتبة حسب المستوى والمهارة.
- حفظ التقدم محلياً عبر `localStorage`.
- Dark Mode محفوظ محلياً.
- SVG icons مدمجة داخل HTML.
- لا يوجد Backend ولا مفاتيح API ولا مكتبات JavaScript خارجية.

## تعديل المحتوى

كل المحتوى التعليمي موجود في:

`static-site/data/curriculum.json`

يمكن إضافة أسبوع، تغيير هدف، تعديل مهام اليوم أو استبدال روابط الفيديو بدون لمس منطق JavaScript.

## تشغيل محلي

لا تفتح `index.html` مباشرة عبر `file://` لأن المتصفح قد يمنع تحميل JSON.

من جذر المستودع:

```bash
python -m http.server 8080
```

ثم افتح:

`http://localhost:8080/static-site/`

## GitHub Pages

الـ workflow الموجود في `.github/workflows/pages-static.yml` يرفع مجلد `static-site` إلى GitHub Pages بعد كل Push إلى `main` يمس ملفات النسخة Static.

إذا كانت Pages غير مفعلة للمستودع، اختر في GitHub:
Settings → Pages → Source → GitHub Actions.

## ملاحظة تعليمية

الخطة مكثفة. الوصول الفعلي إلى B2 خلال 24 أسبوعاً ليس ضماناً؛ يعتمد على عدد الساعات الفعلية، الاستمرارية، جودة الممارسة، والتعرض للغة خارج الموقع.
