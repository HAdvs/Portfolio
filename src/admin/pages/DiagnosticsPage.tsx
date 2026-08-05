import { motion } from "framer-motion";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  supabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET,
} from "../../lib/supabaseClient";
import { useAuth } from "../lib/auth";
import { PageHeader, Button, Badge, tk } from "../components/ui";

/* ════════════════════════════════════════════════════════════════════
   System Diagnostics — runs REAL probes against the live Supabase
   project: auth, every table, every projects column, Storage
   upload/read/delete, and RLS (admin vs anonymous). This is the
   practical verification the production checklist demands.
   ════════════════════════════════════════════════════════════════════ */

type Status = "pending" | "running" | "pass" | "fail" | "warn";
interface Check { id: string; group: string; label: string; status: Status; detail?: string }

const TABLES = [
  "profiles", "categories", "clients", "media_files", "projects", "services",
  "testimonials", "faq_items", "messages", "seo_configs", "site_settings",
  "content_blocks", "activity_logs",
];

const PROJECT_COLUMNS = [
  "id", "title_ar", "title_en", "slug", "type_ar", "type_en", "description_ar", "description_en",
  "category_id", "client_id", "year", "services", "technologies", "cover_url", "cover_media_id",
  "images", "video_url", "project_url", "colors", "featured", "visible", "status",
  "order_index", "views", "created_at", "updated_at",
];

const OTHER_TABLE_COLUMNS: Record<string, string[]> = {
  testimonials: ["name", "company", "avatar", "text_ar", "text_en", "rating", "visible", "order_index"],
  services: ["title_ar", "title_en", "desc_ar", "desc_en", "icon", "visible", "order_index"],
  messages: ["name", "email", "company", "service", "budget", "message", "status", "starred"],
  faq_items: ["question_ar", "answer_ar", "visible", "order_index"],
  content_blocks: ["block_key", "data_ar", "data_en"],
  activity_logs: ["user_id", "user_name", "action", "resource", "details"],
};

const GROUPS = ["التهيئة", "المصادقة والصلاحيات", "قاعدة البيانات — الجداول", "قاعدة البيانات — الأعمدة", "Storage", "RLS", "المزامنة"];

function buildChecks(): Check[] {
  return [
    { id: "cfg", group: "التهيئة", label: "متغيرات البيئة (URL + ANON KEY)", status: "pending" },
    { id: "auth-session", group: "المصادقة والصلاحيات", label: "جلسة تسجيل دخول نشطة", status: "pending" },
    { id: "auth-role", group: "المصادقة والصلاحيات", label: "دور المستخدم (role) من profiles", status: "pending" },
    ...TABLES.map((t) => ({ id: `tbl-${t}`, group: "قاعدة البيانات — الجداول", label: `جدول ${t}`, status: "pending" as Status })),
    { id: "cols", group: "قاعدة البيانات — الأعمدة", label: `projects: ${PROJECT_COLUMNS.length} عمودًا`, status: "pending" },
    ...Object.entries(OTHER_TABLE_COLUMNS).map(([t, cols]) => ({
      id: `cols-${t}`, group: "قاعدة البيانات — الأعمدة", label: `${t}: ${cols.length} أعمدة`, status: "pending" as Status,
    })),
    { id: "st-bucket", group: "Storage", label: `حاوية "${STORAGE_BUCKET}" قابلة للكتابة`, status: "pending" },
    { id: "st-read", group: "Storage", label: "قراءة عامة من الحاوية (Public Read)", status: "pending" },
    { id: "st-del", group: "Storage", label: "حذف ملف الفحص", status: "pending" },
    { id: "rls-anon-read", group: "RLS", label: "مستخدم مجهول يقرأ المحتوى المنشور", status: "pending" },
    { id: "rls-anon-write", group: "RLS", label: "مستخدم مجهول يُمنع من الكتابة", status: "pending" },
    { id: "rls-admin-write", group: "RLS", label: "المدير يكتب في activity_logs", status: "pending" },
    { id: "rt", group: "المزامنة", label: "قناة Realtime مفعّلة", status: "pending" },
  ];
}

export default function DiagnosticsPage() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<Check[]>(buildChecks());
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState("");

  const set = (id: string, patch: Partial<Check>) =>
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const run = async () => {
    setRunning(true);
    const fresh = buildChecks().map((c) => ({ ...c, status: "running" as Status }));
    setChecks(fresh);

    /* 1) Config */
    set("cfg", isSupabaseConfigured
      ? { status: "pass", detail: SUPABASE_URL }
      : { status: "fail", detail: "أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY ثم أعد النشر" });
    if (!isSupabaseConfigured || !supabase) { finish(); return; }
    const sb = supabase; // local const → stable TS narrowing inside callbacks

    /* 2) Auth */
    const { data: sess } = await sb.auth.getSession();
    set("auth-session", sess.session
      ? { status: "pass", detail: sess.session.user.email ?? "" }
      : { status: "fail", detail: "سجّل الدخول أولًا" });

    if (user) {
      const { data: prof, error: pe } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
      set("auth-role", !pe && prof
        ? { status: prof.role === "viewer" ? "warn" : "pass", detail: `role: ${prof.role}` }
        : { status: "warn", detail: pe?.message ?? "لا يوجد صف profile — أنشئ المستخدم عبر schema.sql" });
    } else {
      set("auth-role", { status: "warn", detail: "بدون جلسة" });
    }

    /* 3) Tables */
    for (const t of TABLES) {
      const { error } = await sb.from(t).select("id").limit(1);
      const msg = error?.message ?? "";
      set(`tbl-${t}`, msg.includes("does not exist")
        ? { status: "fail", detail: "الجدول غير موجود — نفّذ schema.sql" }
        : error ? { status: "warn", detail: msg } : { status: "pass" });
    }

    /* 4) Columns — request every canonical column of every table at once */
    const { error: colErr } = await sb.from("projects").select(PROJECT_COLUMNS.join(",")).limit(1);
    if (!colErr) {
      set("cols", { status: "pass", detail: "كل الأعمدة موجودة" });
    } else {
      const m = /column "?([\w_]+)"?/i.exec(colErr.message);
      set("cols", { status: "fail", detail: `عمود مفقود: ${m?.[1] ?? ""} — نفّذ schema.sql` });
    }

    for (const [t, cols] of Object.entries(OTHER_TABLE_COLUMNS)) {
      const { error: e2 } = await sb.from(t).select(cols.join(",")).limit(1);
      if (!e2) {
        set(`cols-${t}`, { status: "pass" });
      } else {
        const m2 = /column "?([\w_]+)"?/i.exec(e2.message);
        set(`cols-${t}`, { status: "fail", detail: `عمود مفقود: ${m2?.[1] ?? ""} — نفّذ schema.sql` });
      }
    }

    /* 5) Storage: upload → public read → delete */
    const probePath = `diagnostics/probe-${Date.now()}.json`;
    const probeFile = new File([JSON.stringify({ probe: true, at: new Date().toISOString() })], "probe.json", { type: "application/json" });
    const { error: upErr } = await sb.storage.from(STORAGE_BUCKET).upload(probePath, probeFile, { upsert: true, contentType: "application/json" });
    if (upErr) {
      set("st-bucket", { status: "fail", detail: upErr.message });
      set("st-read", { status: "warn", detail: "تُخطي — فشل الرفع" });
      set("st-del", { status: "warn", detail: "تُخطي" });
    } else {
      set("st-bucket", { status: "pass", detail: probePath });
      const { data: pub } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(probePath);
      try {
        const res = await fetch(pub.publicUrl, { cache: "no-store" });
        set("st-read", res.ok ? { status: "pass", detail: "القراءة العامة تعمل" } : { status: "fail", detail: `HTTP ${res.status} — سياسة القراءة العامة ناقصة` });
      } catch {
        set("st-read", { status: "fail", detail: "تعذّر الوصول العام للحاوية" });
      }
      const { error: delErr } = await sb.storage.from(STORAGE_BUCKET).remove([probePath]);
      set("st-del", delErr ? { status: "fail", detail: delErr.message } : { status: "pass" });
    }

    /* 6) RLS — anonymous client (no session) */
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { error: anonRead } = await anon.from("projects").select("id").limit(1);
    set("rls-anon-read", !anonRead
      ? { status: "pass", detail: "القراءة العامة للمحتوى المنشور مسموحة" }
      : { status: "fail", detail: anonRead.message });

    const { error: anonWrite } = await anon.from("projects").insert({ id: "rls-probe", title_ar: "x" });
    set("rls-anon-write", anonWrite
      ? { status: "pass", detail: "الكتابة المجهولة مرفوضة كما هو متوقع" }
      : { status: "fail", detail: "خطر: مستخدم مجهول استطاع الكتابة! راجع سياسات RLS" });

    const { error: adminWrite } = await sb.from("activity_logs").insert({
      user_id: user?.id ?? "", user_name: "diagnostics", action: "فحص النظام", resource: "diagnostics", details: "RLS admin write probe",
    });
    set("rls-admin-write", !adminWrite ? { status: "pass" } : { status: "fail", detail: adminWrite.message });

    /* 7) Realtime */
    await new Promise<void>((resolve) => {
      const ch = sb.channel(`diag-${Date.now()}`).on("postgres_changes", { event: "*", schema: "public" }, () => undefined);
      ch.subscribe((status) => {
        set("rt", status === "SUBSCRIBED"
          ? { status: "pass", detail: "القناة مفتوحة — المزامنة اللحظية جاهزة" }
          : status === "CHANNEL_ERROR" || status === "TIMED_OUT"
            ? { status: "fail", detail: String(status) } : { status: "running" });
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          sb.removeChannel(ch);
          resolve();
        }
      });
      setTimeout(() => { sb.removeChannel(ch); resolve(); }, 6000);
    });

    finish();
  };

  const finish = () => {
    setRunning(false);
    setChecks((prev) => {
      const text = prev.map((c) => `${c.status === "pass" ? "✅" : c.status === "fail" ? "❌" : c.status === "warn" ? "⚠️" : "⏳"} [${c.group}] ${c.label}${c.detail ? ` — ${c.detail}` : ""}`).join("\n");
      setReport(text);
      return prev.map((c) => (c.status === "running" ? { ...c, status: "warn", detail: "لم يكتمل" } : c));
    });
  };

  const counts = {
    pass: checks.filter((c) => c.status === "pass").length,
    fail: checks.filter((c) => c.status === "fail").length,
    warn: checks.filter((c) => c.status === "warn").length,
  };

  const dot: Record<Status, string> = { pending: tk.faint, running: tk.blue, pass: tk.green, fail: tk.red, warn: tk.amber };

  return (
    <div className="space-y-6">
      <PageHeader
        title="فحص النظام"
        subtitle="اختبارات حقيقية ضد Supabase الحي: الجداول، الأعمدة، Storage، RLS، والمزامنة"
        actions={
          <div className="flex items-center gap-2.5">
            {counts.pass > 0 && <Badge variant="green" label={`${counts.pass} ناجح`} dot />}
            {counts.warn > 0 && <Badge variant="amber" label={`${counts.warn} تحذير`} dot />}
            {counts.fail > 0 && <Badge variant="red" label={`${counts.fail} فاشل`} dot />}
            <Button variant="primary" onClick={run} loading={running} disabled={!isSupabaseConfigured}>
              {running ? "جارٍ الفحص…" : "تشغيل الفحص الكامل"}
            </Button>
          </div>
        }
      />

      {!isSupabaseConfigured && (
        <div className="rounded-2xl p-5 text-[13px] font-semibold" style={{ background: "color-mix(in srgb,#ef4444 10%, transparent)", color: tk.red, border: `1px solid ${tk.red}44` }}>
          متغيرات البيئة غير مضبوطة — أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY ثم أعد النشر لتشغيل الفحص.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {GROUPS.map((g) => {
          const items = checks.filter((c) => c.group === g);
          if (items.length === 0) return null;
          return (
            <motion.div key={g} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="rounded-[22px] p-5" style={{ background: tk.glass, border: `1px solid ${tk.border}` }}>
              <p className="mb-3 text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: tk.muted }}>{g}</p>
              <div className="space-y-2">
                {items.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full transition-colors"
                      style={{ background: dot[c.status], boxShadow: c.status === "pass" || c.status === "fail" ? `0 0 8px ${dot[c.status]}` : undefined }} />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold leading-snug" style={{ color: tk.text }}>{c.label}</p>
                      {c.detail && <p dir="ltr" className="mt-0.5 truncate text-[10.5px]" style={{ color: tk.faint }}>{c.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {report && (
        <div className="rounded-[22px] p-5" style={{ background: tk.glass, border: `1px solid ${tk.border}` }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: tk.muted }}>تقرير الفحص</p>
            <Button size="sm" onClick={() => navigator.clipboard?.writeText(report).catch(() => undefined)}>نسخ التقرير</Button>
          </div>
          <pre dir="ltr" className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl p-4 text-[11px] leading-relaxed"
            style={{ background: "var(--adm-bg)", color: tk.text }}>{report}</pre>
        </div>
      )}
    </div>
  );
}
