# تعلّم الألمانية 🇩🇪

مشروع Static عربي (RTL) لتنظيم رحلة تعلم الألمانية من A1 إلى B2 حسب **المهارة والمصدر**، وليس مجرد قائمة دروس.

## فكرة المشروع

كل مستوى يحتوي على مسار واضح:

1. **القواعد والمفردات** — المصدر الأساسي: Deutsch mit Ahmad Yaghi.
2. **النطق** — المصدر الأساسي: Easy German.
3. **الاستماع** — DW Deutsch lernen / Easy German / Natürlich German / Slow German حسب المستوى.
4. **القراءة** — German.net وLingua بنصوص مصنفة A1/A2/B1/B2.
5. **الكتابة** — LangCorrect وVHS-Lernportal وDeutschAkademie وGoethe بحسب المستوى.
6. **الاختبار** — مواد Goethe الرسمية/التفاعلية لقياس الجاهزية للانتقال.

## المزايا

- A1 / A2 / B1 / B2.
- عشرات الموارد المرتبة حسب المهارة.
- روابط فيديوهات محددة وروابط مواقع تعليمية متخصصة.
- فلترة حسب: قواعد، مفردات، نطق، استماع، قراءة، كتابة، اختبار.
- حفظ التقدم عبر localStorage.
- Dark Mode.
- Responsive للموبايل والتابلت والديسكتوب.
- Vanilla HTML/CSS/JavaScript فقط.
- ملف JSON واحد سهل تعديل الموارد من خلاله.

## الملفات

```text
static-site/
├── index.html
├── styles.css
├── app.js
├── README.md
└── data/
    └── curriculum.json
```

## إضافة مورد جديد

أضف عنصراً داخل `resources` للمستوى المطلوب في:

`static-site/data/curriculum.json`

البنية:

```json
{
  "id": "unique-id",
  "skill": "الاستماع",
  "type": "youtube",
  "provider": "اسم القناة",
  "title": "عنوان المورد",
  "note": "متى ولماذا تستخدمه",
  "url": "https://..."
}
```

## التشغيل المحلي

```bash
python -m http.server 8080
```

ثم افتح:

`http://localhost:8080/static-site/`

> ملاحظة: بعض الموارد المجانية قد تحتوي على ميزات إضافية مدفوعة، لذلك وصفنا المورد حسب ما يمكن التحقق منه حالياً ولم نفترض أن كل ميزة مجانية.
