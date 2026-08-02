/* ════════════════════════════════════════════════════════════════════
   Supabase error translation — never show [object Object] again.

   PostgrestError / StorageError / AuthError are plain objects with
   `.message`, `.code`, `.hint` — String() on them yields "[object Object]".
   This helper extracts the real message and maps common failures to
   clear Arabic explanations.
   ════════════════════════════════════════════════════════════════════ */

export function extractMessage(e: unknown): string {
  if (e === null || e === undefined) return "خطأ غير معروف";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  const obj = e as { message?: string; error?: string; msg?: string; statusText?: string };
  return obj.message || obj.error || obj.msg || obj.statusText || JSON.stringify(e);
}

/** Map a Supabase failure to a human-readable Arabic message. */
export function friendlyError(e: unknown, action: string): string {
  const raw = extractMessage(e).toLowerCase();
  const code = ((e as { code?: string })?.code ?? "").toLowerCase();

  // Permissions / RLS
  if (code === "42501" || raw.includes("row-level security") || raw.includes("permission denied") || raw.includes("violates row-level"))
    return `${action}: لا تملك صلاحية تنفيذ هذه العملية (تحقق من صلاحيات RLS)`;

  // Missing table / column / stale PostgREST schema cache
  if (raw.includes("schema cache"))
    return `${action}: العمود موجود لكن PostgREST لم يحدّث ذاكرته — نفّذ schema.sql مجددًا (يُعيد تحميل الـ cache تلقائيًا)`;
  if (raw.includes("does not exist") && (raw.includes("relation") || raw.includes("table")))
    return `${action}: الجدول غير موجود في قاعدة البيانات — نفّذ ملف supabase/schema.sql`;
  if (raw.includes("column") && raw.includes("does not exist"))
    return `${action}: عمود غير موجود في الجدول — نفّذ schema.sql (هجرة التقارب تضيفه تلقائيًا)`;

  // Unique / duplicate
  if (code === "23505" || raw.includes("duplicate key") || raw.includes("unique"))
    return `${action}: السجل موجود مسبقًا (تكرار في قيمة فريدة)`;

  // Not null
  if (code === "23502" || raw.includes("null value"))
    return `${action}: حقل مطلوب فارغ — أكمل البيانات الأساسية`;

  // Foreign key
  if (code === "23503" || raw.includes("foreign key"))
    return `${action}: مرجع غير صالح (سجل مرتبط غير موجود)`;

  // Storage
  if (raw.includes("bucket") && raw.includes("not found"))
    return `${action}: حاوية التخزين "media" غير موجودة — أنشئها من Storage في لوحة Supabase`;
  if (raw.includes("object") && (raw.includes("already exists") || raw.includes("duplicate")))
    return `${action}: الملف موجود مسبقًا في التخزين`;
  if (raw.includes("payload") && raw.includes("too large"))
    return `${action}: حجم الملف يتجاوز الحد المسموح`;

  // Auth
  if (raw.includes("invalid login") || raw.includes("invalid credentials"))
    return "بيانات الدخول غير صحيحة";
  if (raw.includes("jwt") || raw.includes("token"))
    return `${action}: انتهت الجلسة — سجّل الدخول مجددًا`;

  // Network
  if (raw.includes("fetch") || raw.includes("network") || raw.includes("failed to fetch"))
    return `${action}: تعذّر الاتصال بالخادم — تحقق من الإنترنت`;

  // Fallback: the real Supabase message, not [object Object]
  return `${action}: ${extractMessage(e)}`;
}
