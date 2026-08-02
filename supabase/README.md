# دليل تشغيل قاعدة البيانات — YourMark CMS

> مسارَان مدعومان: **(أ)** تنفيذ `schema.sql` على قاعدة جديدة/مطابقة — وهو الموصى به،
> أو **(ب)** الاعتماد على تكيف الكود مع قاعدة أقدم للأعمدة الاختيارية.

---

## المسار ٠ — إعادة البناء من الصفر (تدميري)

إذا كانت قاعدة البيانات الحالية قديمة/متضاربة وتريد بداية نظيفة **100%**:

1. SQL Editor ← نفّذ `supabase/migrations/0000_clean_slate.sql`
   - يحذف: كل السياسات (RLS + Storage)، الاشتراكات في Realtime، الـ Triggers،
     الـ Functions، وجميع الجداول الـ 13 (CASCADE)، ويفرّغ حاوية `media`.
   - ⚠️ يحذف جميع بيانات CMS — استخدمه فقط عند الرغبة ببداية جديدة.
2. نفّذ بالترتيب: `0001_tables` ← `0002_rls` ← `0003_storage_realtime_seed` ← `0004_convergence`.
3. النتيجة: قاعدة بيانات مطابقة للكود تمامًا، بحساب مدير `haitham.advs@gmail.com` (super_admin).

---

## المسار أ — التنفيذ الكامل (موصى به)

### على قاعدة بيانات **جديدة**
1. أنشئ مشروعًا جديدًا في [supabase.com](https://supabase.com).
2. افتح **SQL Editor** ← الصق محتوى `schema.sql` كاملًا ← **Run**.
   - يُنشئ 13 جدولًا + FKs + Indexes + Triggers.
   - يُنشئ حاوية `media` وسياساتها.
   - يبني سياسات RLS كاملة.
   - ينشئ حساب المدير: `haitham.advs@gmail.com` / `h.advs`.
   - يُعيد تحميل PostgREST schema cache تلقائيًا (`pg_notify`).
3. من Vercel: اضبط `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` ← **Redeploy**.
4. افتح `/admin/diagnostics` ← «تشغيل الفحص الكامل» ← كل البنود يجب أن تكون ✅.

### على قاعدة بيانات **موجودة** (ترقية)
- نفّذ نفس `schema.sql` كاملًا — **آمن تمامًا**:
  - `CREATE TABLE IF NOT EXISTS` لا يمس الجداول الموجودة.
  - `ensure_column()` يضيف فقط الأعمدة الناقصة ويحافظ على البيانات.
  - كل سياسة `drop policy if exists` ثم `create` — لا أخطاء تكرار.
  - بيانات `category`/`client` النصية القديمة تُرحَّل تلقائيًا إلى FKs.

---

## المسار ب — التكيف مع Schema أقدم

إذا تعذّر تعديل قاعدة البيانات الآن، فإن طبقة `db.ts` تتكيف تلقائيًا:

- عند Insert/Update في `projects`: إذا رفضت قاعدة البيانات عمودًا **اختياريًا**
  (`colors`, `technologies`, `services`, `images`, `video_url`, `project_url`,
  `cover_media_id`, …) يُحذف العمود من الحمولة وتُعاد المحاولة (حتى 6 مرات).
- **لا يُحذف أي عمود** عند خطأ `schema cache` (يحتاج إعادة تحميل PostgREST،
  لا فقدان بيانات) — وتظهر رسالة توجّهك لتنفيذ `schema.sql`.
- الأعمدة **الأساسية** والقيود (Unique/FK) ترمي الخطأ طبيعيًا لتراه بوضوح.

> المسار ب حل انتقالي — المسار أ هو الحالة الإنتاجية المستهدفة.

---

## استكشاف الأخطاء

| الرسالة | السبب | الحل |
|---|---|---|
| `… in the schema cache` | PostgREST لم يحدّث ذاكرته بعد ALTER | أعد تنفيذ `schema.sql` (ينفّذ `pg_notify` تلقائيًا) |
| `حاوية media غير موجودة` | سكربت سابق توقف قبل إنشاء الحاوية | أعد تنفيذ `schema.sql` كاملًا — أصبح idempotent |
| `permission denied / RLS` | المستخدم بلا دور موظف | `update profiles set role='super_admin' where email='…'` |
| `Invalid login credentials` | المستخدم غير موجود | تحقق من قسم 11 في `schema.sql` أو أنشئه من Auth Dashboard |

## التحقق بعد التشغيل
`/admin/diagnostics` يفحص حيًا: 13 جدولًا · 26 عمودًا في projects ·
Storage (رفع/قراءة/حذف) · RLS (مجهول مقابل مدير) · Realtime — مع تقرير قابل للنسخ.
