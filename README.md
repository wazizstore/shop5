# سوق ديالي — منصة متاجر مجانية

منصة كيقدر فيها بزاف ديال البائعين يتسجلو، يصايبو متجر ديالهم، يزيدو منتجات، ويستافدو من تتبع Facebook Pixel وتسجيل الطلبات فـ Google Sheet — الكل مجاني.

## الملفات
- `index.html` — صفحة الترحيب والتسجيل/الدخول
- `dashboard.html` — لوحة تحكم البائع (معلومات المتجر، المنتجات، Pixel، Sheet)
- `store.html` — صفحة المتجر اللي كيشوفها الزبناء
- `style.css` — التصميم المشترك
- `firebase-config.js` — خاصك تعمر فيه المعلومات ديال Firebase (خطوة 1)
- `apps-script.gs` — كود كتنسخو فـ Google Sheet (خطوة 2)

---

## خطوة 1 — صايب مشروع Firebase (مجاني، بلا بطاقة بنكية)

1. سير لـ https://console.firebase.google.com وسجل بحساب Google ديالك.
2. دوس "Add project" → عطيه سمية (مثلا `souq-diali`) → كمل الخطوات.
3. من القائمة اليسرى، دوس **Build → Authentication** → دوس "Get started" → فـ "Sign-in method" فعل **Email/Password**.
4. من القائمة اليسرى، دوس **Build → Firestore Database** → "Create database" → اختار "Start in **test mode**" (غادي نبدلو هاد الشي فخطوة 4 لأمان أحسن).
5. دوس على أيقونة الترس (⚙) فوق → **Project settings** → تحت "Your apps" دوس على أيقونة `</>` (Web) → عطيه سمية → دوس "Register app".
6. غادي يبان ليك `firebaseConfig` object — نسخ هاد المعلومات (apiKey, authDomain, projectId...) ولصقها فـ `firebase-config.js` بدل القيم اللي مكتوبين "PASTE_...".

## خطوة 2 — صايب Google Sheet للطلبات (لكل بائع Sheet خاص بيه)

كل بائع خاصو يدير هاد الخطوات باش الطلبات ديالو يجيو لـ Sheet خاص بيه:

1. سير لـ https://sheets.google.com وصايب ورقة جديدة، سميها مثلا "الطلبات".
2. من القائمة فوق: **Extensions → Apps Script**.
3. امسح الكود اللي كاين، ولصق بلاصتو المحتوى ديال `apps-script.gs`.
4. دوس "Save"، من بعد دوس **Deploy → New deployment**.
5. دوس على أيقونة الترس جنب "Select type" → اختار **Web app**.
6. فـ "Who has access" اختار **Anyone** (باش يقدر الموقع يبعت ليه الطلبات).
7. دوس "Deploy"، غادي يطلب منك تسمح بالصلاحيات (Authorize) — سمح.
8. غادي يعطيك رابط بحال: `https://script.google.com/macros/s/XXXXXXX/exec` — هادا هو الرابط اللي خاص البائع يلصقو فـ لوحة التحكم ديالو، فـ "Pixel و Sheet" → "رابط Google Apps Script".

**ملاحظة:** كل بائع خاصو يصايب Google Sheet خاص بيه ويدير هاد الخطوات، باش الطلبات ديالو يجيو ليه هو وحدو.

## خطوة 3 — حط الملفات فـ GitHub وفعل GitHub Pages (استضافة مجانية)

1. صايب حساب GitHub إلا ماعندكش (https://github.com).
2. صايب repository جديد (مثلا `souq-diali`).
3. زيد فيه جميع الملفات اللي جاوك (`index.html`, `dashboard.html`, `store.html`, `style.css`, `firebase-config.js`).
4. سير لـ **Settings → Pages** فـ repository ديالك.
5. تحت "Source" اختار "Deploy from a branch" → اختار `main` وفولدر `/root` → Save.
6. من بعد شي دقيقتين، غادي يعطيك رابط بحال:
   `https://username.github.io/souq-diali/`

هادشي هو الموقع ديالك اللي تقدر تشاركو مع البائعين.

## خطوة 4 — أمان (مهم بزاف قبل ما تفتح الموقع للعموم)

فـ Firestore، بدل القواعد (Rules) باش:
- غير اليوزر اللي داخل (authenticated) يقدر يبدل المتجر ديالو هو وحدو
- الكل يقدر يقرا المتاجر والمنتجات (باش يبانو للزبناء)

سير لـ **Firestore Database → Rules** ولصق هادشي:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stores/{storeId} {
      allow read: if true;
      allow write: if request.auth != null &&
        (resource == null || resource.data.ownerUid == request.auth.uid);

      match /products/{productId} {
        allow read: if true;
        allow write: if request.auth != null &&
          get(/databases/$(database)/documents/stores/$(storeId)).data.ownerUid == request.auth.uid;
      }
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

دوس "Publish".

---

## كيفاش كيخدم الموقع (ملخص)

1. البائع كيسجل فـ `index.html` (Firebase Auth)
2. كيصايب معلومات المتجر ديالو فـ `dashboard.html` (اسم، رابط/slug، وصف)
3. كيزيد المنتجات (عنوان، صورة، وصف، ثمن)
4. كيربط Facebook Pixel ID و رابط Google Sheet ديالو
5. كيشارك الرابط: `store.html?store=SLUG-DIALO` مع الزبناء
6. الزبون كيزور المتجر، كيزيد منتجات للسلة، كيعمر معلوماتو، وكيأكد الطلب
7. الطلب كيتسجل مباشرة فـ Google Sheet ديال البائع + Pixel كيتبع الحدث

## حدود يخصك تعرفهم
- الصور خاصها تكون روابط (URL) — الأسهل: رفع الصورة لـ https://imgur.com وأخذ الرابط.
- Firestore عندو حد مجاني سخي بزاف (50 ألف قراءة/يوم) — كافي لبداية ديال أي مشروع.
- إلا بغيتي رفع الصور مباشرة (بلا روابط خارجية)، تقدر تزيد Firebase Storage (فيه حد مجاني ديالو حتى هو).
