# تقرير إكمال العمل — YourMark Production CMS

> وثيقة مرجعية دائمة: ما تم اكتشافه، سبب كل مشكلة، كيف أُصلحت من الجذر، وكيف تتحقق عمليًا.

---

## 1. ملخص تنفيذي

تم تحويل المشروع من نموذج يعتمد على Local Storage وبيانات تجريبية إلى **CMS إنتاجي كامل** تعمل فيه قاعدة بيانات Supabase PostgreSQL كمصدر وحيد للحقيقة، مع:

- طبقة Repository مركزية تترجم بين نموذج التطبيق والـ Schema العلاقاتي.
- هجرة تقارب (Convergence Migration) تجعل الكود وقاعدة البيانات غير قابلين للانحراف.
- مصادقة Supabase Auth (JWT + Refresh Tokens) مع أدوار وصلاحيات.
- Storage منظم + سياسات RLS وStorage كاملة.
- مزامنة لحظية (Realtime) بين لوحة التحكم والموقع وجميع الأجهزة.
- أداة فحص حيّة (`/admin/diagnostics`) تنفّذ كل الاختبارات الإلزامية ضد البيئة الحية.

---

## 2. المعمارية النهائية

```
React UI (موقع عام + لوحة تحكم)
        │  app model: slugs / names / URLs
        ▼
Zustand Store (useAdminStore) — ذاكرة عمل متفائلة + write-through
        │
        ▼
Repository (src/lib/cms/db.ts) — حدّ الترجمة الوحيد: slug→category_id, name→client_id
        │
        ▼
Supabase Client (supabaseClient.ts) — Auth + PostgREST + Storage + Realtime
        │
        ├── PostgreSQL (schema.sql v3 — علاقاتي، FKs، Indexes، Triggers)
        └── Storage bucket "media" (مجلدات: covers/projects/gallery/avatars/backups)
```

**قاعدة صارمة**: لا تلمس الواجهة أو الـ Store جداول Supabase مباشرة — كل الاستعلامات تمر عبر `db.ts` (مؤكد بفحص grep).

---

## 3. سجل المشاكل → الأسباب الجذرية → الإصلاحات

| # | المشكلة الظاهرة | السبب الجذري | الإصلاح | الملف |
|---|---|---|---|---|
| 1 | `Could not find the 'category'/'client'/'colors' column` | قاعدة حية مبنية على Schema قديم + غياب طبقة ترجمة | هجرة `ensure_column()` لكل الأعمدة + Repository يرسل FKs فقط | `schema.sql`, `db.ts` |
| 2 | انهيار CRUD بالكامل | الواجهة ترسل نموذج التطبيق مباشرة للـ DB | `mapProject()` يقرأ من JOINs؛ `projectCore()` بأعمدة DB فقط | `db.ts` |
| 3 | رسائل `[object Object]` | أخطاء Supabase كائنات وليست `Error` | `errors.ts` يستخرج `.message/.code` ويترجم عربيًا | `errors.ts`, `store` |
| 4 | تصادم عند إضافة مشاريع | `slug` UNIQUE مع `""` مكرر | `slug \|\| null` | `db.ts` |
| 5 | مسح الـ slug عند تعديل جزئي | `update` يحوّل undefined→null | دلالات PATCH: إرسال الحقول المُقدَّمة فقط | `db.ts` |
| 6 | فشل رفع الصور غامضًا | سياسات/حاوية غير مضمونة + رسائل خام | تدفق كامل Storage→row→id + رسائل مترجمة | `db.ts`, `ProjectsV2` |
| 7 | بيانات تظهر في جهاز واحد فقط | Local Storage كمصدر | Realtime `postgres_changes` + React Query invalidation | `CmsProvider` |
| 8 | مصادقة محلية وهمية | تخزين اعتمادات بالمتصفح | Supabase Auth فقط + bootstrap admin عبر SQL | `auth.tsx`, `schema.sql` |
| 9 | `[object Object]` في الثيم النهاري | `text-white` ثابت على بطاقات فاتحة | متغيرات `--adm-*` + قاعدة scoped | `ui/index.tsx`, `index.css` |
| 10 | كود ميت | بقايا مخزن محذوف | إزالة `SERVICE_ICONS`, `PROJECT_META` | `content.ts` |
| 11 | `Could not find the 'colors' column … in the schema cache` | PostgREST يخزّن الـ Schema مؤقتًا ولا يرى الأعمدة المضافة بـ ALTER حتى يُعاد تحميله | `pg_notify('pgrst','reload schema')` في نهاية الـ migration + رسالة توجّه للحل | `schema.sql`, `errors.ts` |
| 12 | `حاوية media غير موجودة` رغم تنفيذ الـ schema | سياسات `create policy` غير idempotent — إعادة التشغيل ترمي "policy already exists" فتوقف السكربت **قبل** قسم إنشاء الحاوية | `drop policy if exists` قبل كل سياسة + لفّ إنشاء الحاوية بـ DO block آمن | `schema.sql` |
| 13 | `Could not find avatar/company/details/description_ar/images…` | هجرة التقارب كانت تغطي `projects` فقط — بقية الجداول (testimonials/services/messages/…) على Schema قديم ناقص | **تقارب شامل**: `ensure_column()` لكل عمود في **كل** الجداول الـ 13 | `schema.sql` |
| 14 | `invalid input syntax for uuid` | معرّفات مولّدة بصيغة `Date.now()-…` نصية تُدخل في أعمدة `uuid` | توحيد جميع المعرّفات على `crypto.randomUUID()` في الـ Store والـ Repository — صالحة لعمودي `uuid` و`text` | `useAdminStore.ts`, `db.ts` |
| 15 | حلول مؤقتة متراكمة (adaptive column stripping) | ترقيعات تخفي الانحراف بدل إصلاحه | إزالتها بالكامل — الـ Migration الشامل هو العقد الوحيد بين الكود والـ DB | `db.ts` |

---

## 4. تغييرات قاعدة البيانات (`supabase/schema.sql`)

- **13 جدولًا** علاقاتيًا: `profiles, categories, clients, media_files, projects, services, testimonials, faq_items, messages, seo_configs, site_settings, content_blocks, activity_logs`.
- **Foreign Keys**: `projects.category_id → categories`, `client_id → clients`, `cover_media_id → media_files` (ON DELETE SET NULL).
- **Indexes** على `category_id, client_id, status, order_index, folder, created_at`.
- **Triggers**: `handle_new_user` (إنشاء profile عند التسجيل)، `touch_updated_at`.
- **هجرة التقارب**: دالة `ensure_column(tbl, col, type)` تُستدعى لكل عمود قانوني — تعمل على قاعدة فارغة (no-op) وقديمة (إضافة + ترحيل بيانات) دون فقدان.
- **بذور**: تصنيفات، إعدادات، SEO، كتل نصية، ومستخدم مدير `haitham.advs@gmail.com` بكلمة مرور `h.advs` (bcrypt عبر `crypt/gen_salt`).

---

## 5. سياسات RLS

- قراءة عامة للمحتوى المنشور فقط (`visible and status='published'`).
- إدراج مجهول لجدول `messages` فقط (نموذج التواصل).
- كتابة كاملة عبر `is_staff()` للأدوار: `super_admin, admin, editor, moderator`.
- المستخدم يحدّث ملفه الشخصي فقط (`id = auth.uid()`).

## 6. سياسات Storage (حاوية `media`)

- `pub read storage` — قراءة عامة.
- `staff ins/upd/del storage` — للموظفين المصادَقين فقط.
- قرار معماري: حاوية واحدة + مجلدات بدل 8 حاويات — نمط Supabase الموصى به (سياسات أقل، صيانة أبسط).

---

## 7. بوابات الجودة وأوامر التشغيل

| البوابة | الأمر | الحالة |
|---|---|---|
| TypeScript (strict, noUnusedLocals) | `npx tsc --noEmit` | ✅ نظيف |
| ESLint (flat config) | `npx eslint .` | ✅ مُهيأ — قواعد صحة مفعّلة، ضجيج أسلوبي مطفأ |
| Production Build | `npm run build` | ✅ 1,466 وحدة |

قواعد ESLint المفروضة: `no-explicit-any: error`، `no-unused-vars: error` (مع استثناء `_`)، `eqeqeq`، `prefer-const`، `rules-of-hooks: error`، `exhaustive-deps: warn`.

---

## 8. التحقق العملي (بعد النشر)

1. نفّذ `supabase/schema.sql` كاملًا في SQL Editor.
2. أضف `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` في Vercel ← Redeploy.
3. سجّل الدخول بـ `haitham.advs@gmail.com` / `h.advs`.
4. افتح **فحص النظام** (`/admin/diagnostics`) ← «تشغيل الفحص الكامل»:
   - 13 فحص جدول + فحص 26 عمودًا + Storage (رفع/قراءة/حذف) + RLS (مجهول vs مدير) + Realtime.
   - أي بند ❌ يظهر معه السبب وخطوة الإصلاح داخل التقرير القابل للنسخ.
5. اختبر CRUD: أنشئ/عدّل/احذف مشروعًا، ارفع غلافًا ومعرضًا — ثم افتح الموقع من جهاز آخر (مزامنة لحظية).

---

## 9. قائمة الملفات الأساسية

| الملف | الدور |
|---|---|
| `src/lib/supabaseClient.ts` | العميل + فحص التهيئة + `STORAGE_BUCKET` |
| `src/lib/cms/db.ts` | Repository: mappers, FK resolvers, CRUD, media flow, backup |
| `src/lib/cms/errors.ts` | ترجمة أخطاء Supabase → عربي |
| `src/lib/cms/CmsProvider.tsx` | React Query hydration + Realtime sync |
| `src/admin/store/useAdminStore.ts` | Store متفائل + write-through + إشعارات |
| `src/admin/lib/auth.tsx` | Supabase Auth + أدوار + حماية مسارات |
| `src/admin/pages/DiagnosticsPage.tsx` | 22 فحصًا حيًا ضد البيئة |
| `src/admin/pages/v2/*` | صفحات الإدارة (مشاريع، وسائط، SEO…) |
| `supabase/schema.sql` | Schema + Migrations + RLS + Storage + Seeds |
| `eslint.config.js` | بوابات ESLint |

---

## 10. خطوات النشر على Vercel

1. ارفع المستودع ← استيراد في Vercel (Framework: Vite).
2. Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Build: `npm run build` · Output: `dist`.
4. `vercel.json` موجود: SPA rewrites + ترويسات أمان (`nosniff`, `DENY`, `Referrer-Policy`).
5. بعد النشر: نفّذ الـ schema ← فحص النظام ← جاهز للإنتاج.
