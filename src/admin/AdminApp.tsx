import { motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LOGO } from "../lib/content";
import { useAuth, useAdminGate, type GateReason } from "./lib/auth";
import Shell from "./components/Shell";
import AdminLogin from "./pages/Login";
import { useResolvedAdminTheme } from "./lib/theme";
import { tk } from "./components/ui";

// Admin pages
import DashboardV2 from "./pages/v2/DashboardV2";
import ProjectsV2 from "./pages/v2/ProjectsV2";
import MessagesV2 from "./pages/v2/MessagesV2";
import UsersV2 from "./pages/v2/UsersV2";
import SettingsV2 from "./pages/v2/SettingsV2";
import Media from "./pages/Media";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import {
  AnalyticsPage, ServicesPage, TestimonialsPage, FaqPage,
  CategoriesPage, SeoPage, BackupPage, ContentPageV1,
} from "./pages/v2/OtherPages";

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingScreen() {
  const theme = useResolvedAdminTheme();
  return (
    <div className="admin-root flex min-h-screen flex-col items-center justify-center gap-5" data-admin-theme={theme} style={{ background: "var(--adm-page)" }}>
      <div className="relative">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="h-14 w-14 rounded-full border-2 border-transparent" style={{ borderTopColor: "#0a84ff" }} />
        <img src={LOGO} alt="" aria-hidden width={36} height={36} className="absolute inset-0 m-auto h-9 w-9 object-contain opacity-70" />
      </div>
      <p className="text-[13px] font-medium" style={{ color: "var(--adm-muted)" }}>جارٍ الاتصال بقاعدة البيانات…</p>
    </div>
  );
}

// ─── Setup screen (Supabase not configured) ──────────────────────────────────
function SetupScreen() {
  const theme = useResolvedAdminTheme();
  return (
    <div className="admin-root flex min-h-screen items-center justify-center px-4" data-admin-theme={theme} dir="rtl" style={{ background: "var(--adm-page)" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-[28px] p-8" style={{ background: tk.glass, border: `1px solid ${tk.border}`, backdropFilter: "blur(28px)", boxShadow: "var(--adm-card-shadow)" }}>
        <div className="mb-6 flex items-center gap-3">
          <img src={LOGO} alt="" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-black" style={{ color: tk.text }}>ربط قاعدة البيانات مطلوب</h1>
            <p className="text-[12px]" style={{ color: tk.muted }}>لوحة التحكم تعمل بالكامل على Supabase PostgreSQL</p>
          </div>
        </div>
        <ol className="space-y-3 text-[13px] leading-relaxed" style={{ color: tk.text }}>
          {[
            "أنشئ مشروعًا على supabase.com ثم نفّذ ملف supabase/schema.sql في SQL Editor.",
            "أنشئ مستخدم مدير من Authentication → Users (بريد + كلمة مرور).",
            "أضف متغيرَي البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY إلى Vercel.",
            "أعد النشر — ستعمل المصادقة والمزامنة اللحظية والتخزين السحابي تلقائيًا.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black text-white" style={{ background: "linear-gradient(135deg,#0a84ff,#1e3a8a)" }}>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <a href="/" className="mt-6 inline-block text-[12.5px] font-bold hover:opacity-70" style={{ color: tk.blue }}>← العودة إلى الموقع</a>
      </motion.div>
    </div>
  );
}

// ─── Access denied (authenticated but not staff) ─────────────────────────────
const DENIAL_COPY: Record<Exclude<GateReason, "">, { title: string; desc: string }> = {
  "not-authed": { title: "تسجيل الدخول مطلوب", desc: "سجّل الدخول للوصول إلى لوحة التحكم." },
  "no-profile": { title: "لا يوجد ملف شخصي", desc: "حسابك غير مرتبط بملف إداري. نفّذ supabase/migrations/0001 لإنشاء الـ Profile تلقائيًا عند التسجيل." },
  inactive: { title: "الحساب معطّل", desc: "هذا الحساب غير نشط. تواصل مع مدير النظام لتفعيله." },
  viewer: { title: "صلاحية عرض فقط", desc: "دور viewer لا يخوّل الوصول إلى لوحة التحكم." },
};

function AccessDenied({ reason }: { reason: Exclude<GateReason, ""> }) {
  const { signOut } = useAuth();
  const theme = useResolvedAdminTheme();
  const copy = DENIAL_COPY[reason];
  return (
    <div className="admin-root flex min-h-screen items-center justify-center px-4" data-admin-theme={theme} dir="rtl" style={{ background: "var(--adm-page)" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[28px] p-8 text-center" style={{ background: tk.glass, border: `1px solid ${tk.border}`, backdropFilter: "blur(28px)", boxShadow: "var(--adm-card-shadow)" }}>
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "color-mix(in srgb,#ef4444 12%, transparent)", color: "#ef4444" }}>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>
        <h1 className="text-lg font-black" style={{ color: tk.text }}>{copy.title}</h1>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: tk.muted }}>{copy.desc}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => signOut()} className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg,#0a84ff,#1e3a8a)" }}>تسجيل الخروج</button>
          <a href="/" className="rounded-xl px-5 py-2.5 text-[13px] font-bold" style={{ color: tk.muted, border: `1px solid ${tk.border}` }}>الموقع</a>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Guards ───────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, configured } = useAuth();
  const gate = useAdminGate();
  if (!configured) return <SetupScreen />;
  if (loading || gate.loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!gate.allowed) return <AccessDenied reason={gate.reason === "" ? "no-profile" : gate.reason} />;
  return <Shell>{children}</Shell>;
}

function LoginGate() {
  const { isAuthenticated, loading, configured } = useAuth();
  if (!configured) return <SetupScreen />;
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return <AdminLogin />;
}

// ─── Router ───────────────────────────────────────────────────────────────────
export default function AdminApp() {
  /* Hidden CMS must never be indexed */
  useEffect(() => {
    let el = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prev = el?.getAttribute("content") ?? null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "robots");
      document.head.appendChild(el);
    }
    el.setAttribute("content", "noindex, nofollow, noarchive, nosnippet");
    return () => {
      el?.setAttribute("content", prev ?? "index, follow");
    };
  }, []);

  return (
    <Routes>
      <Route path="login" element={<LoginGate />} />

      <Route path="" element={<ProtectedRoute><DashboardV2 /></ProtectedRoute>} />
      <Route path="analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="projects" element={<ProtectedRoute><ProjectsV2 /></ProtectedRoute>} />
      <Route path="services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
      <Route path="testimonials" element={<ProtectedRoute><TestimonialsPage /></ProtectedRoute>} />
      <Route path="faq" element={<ProtectedRoute><FaqPage /></ProtectedRoute>} />
      <Route path="categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
      <Route path="messages" element={<ProtectedRoute><MessagesV2 /></ProtectedRoute>} />
      <Route path="content" element={<ProtectedRoute><ContentPageV1 /></ProtectedRoute>} />
      <Route path="seo" element={<ProtectedRoute><SeoPage /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute><UsersV2 /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><SettingsV2 /></ProtectedRoute>} />
      <Route path="backup" element={<ProtectedRoute><BackupPage /></ProtectedRoute>} />
      <Route path="diagnostics" element={<ProtectedRoute><DiagnosticsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
