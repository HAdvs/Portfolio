import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LOGO } from "../../lib/content";
import { useAuth } from "../lib/auth";
import { useResolvedAdminTheme } from "../lib/theme";
import { tk } from "../components/ui";

export default function AdminLogin() {
  const { signIn } = useAuth();
  const theme = useResolvedAdminTheme();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) {
      setErr("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true);
    setErr(null);
    const error = await signIn(user.trim(), pass.trim());
    if (error) setErr(error);
    setLoading(false);
  };

  return (
    <div
      className="admin-root relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      data-admin-theme={theme}
      dir="rtl"
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "var(--adm-page)" }} />
      <div
        className="absolute top-[-20vh] left-1/2 h-[70vw] w-[70vw] max-w-[800px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle, #0a84ff 0%, #1e3a8a 60%, transparent 100%)",
          opacity: theme === "dark" ? 0.4 : 0.22,
        }}
      />
      <div className="noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="absolute inset-[-12px] rounded-full blur-2xl opacity-60"
              style={{ background: "radial-gradient(circle, #0a84ff 0%, transparent 70%)" }}
            />
            <img
              src={LOGO}
              alt="YourMark"
              width={80}
              height={80}
              className="relative h-20 w-20 object-contain"
              style={{ filter: "drop-shadow(0 0 24px rgba(10,132,255,0.55))" }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: tk.text }}>
              لوحة التحكم
            </h1>
            <p className="mt-1 text-sm" style={{ color: tk.muted }}>
              Admin Dashboard · YourMark Studio
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-[32px] p-8"
          style={{
            background: tk.glass,
            border: `1px solid ${tk.border}`,
            backdropFilter: "blur(32px)",
            boxShadow: "var(--adm-card-shadow)",
          }}
        >
          <form onSubmit={submit} className="space-y-4" autoComplete="off">
            {/* Username */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: tk.muted }}>
                اسم المستخدم
              </label>
              <div className="relative">
                <span className="absolute start-4 top-1/2 -translate-y-1/2" style={{ color: tk.faint }}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => { setUser(e.target.value); setErr(null); }}
                  placeholder="البريد الإلكتروني أو اسم المستخدم"
                  dir="ltr"
                  autoComplete="username"
                  className="w-full rounded-2xl py-3.5 ps-10 pe-4 text-sm outline-none transition-all placeholder:opacity-30 focus:border-[var(--adm-border-focus)]"
                  style={{
                    background: tk.bg,
                    border: `1px solid ${tk.border}`,
                    color: tk.text,
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: tk.muted }}>
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute start-4 top-1/2 -translate-y-1/2" style={{ color: tk.faint }}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={(e) => { setPass(e.target.value); setErr(null); }}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  className="w-full rounded-2xl py-3.5 ps-10 pe-11 text-sm outline-none transition-all placeholder:opacity-30 focus:border-[var(--adm-border-focus)]"
                  style={{
                    background: tk.bg,
                    border: `1px solid ${tk.border}`,
                    color: tk.text,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-opacity hover:opacity-70"
                  style={{ color: tk.muted }}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {err && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl px-4 py-3 text-[13px] font-semibold"
                  style={{
                    background: "color-mix(in srgb, #ef4444 12%, transparent)",
                    color: "#ef4444",
                    border: "1px solid color-mix(in srgb, #ef4444 30%, transparent)",
                  }}
                >
                  {err}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.015] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0a84ff, #1e3a8a)", boxShadow: "0 10px 30px rgba(10,132,255,0.35)" }}
            >
              <span aria-hidden className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-0" />
              <span className="relative z-10">{loading ? "جارٍ التحقق…" : "تسجيل الدخول"}</span>
            </button>
          </form>


        </div>
      </motion.div>
    </div>
  );
}
