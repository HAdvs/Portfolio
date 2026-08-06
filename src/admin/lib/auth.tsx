import type { Session, User } from "@supabase/supabase-js";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import type { UserRole } from "../types";

/* ════════════════════════════════════════════════════════════════════
   Authentication — Supabase Auth only.

   • Sessions + refresh tokens are managed by the Supabase SDK
     (persisted securely, auto-refreshed, JWT-based).
   • No localStorage credentials, no mock logins, no client hashing.
   • Roles are read from the `profiles` table after sign-in.
   • When Supabase is not configured, the admin area shows a setup
     screen instead of pretending to authenticate.
   ════════════════════════════════════════════════════════════════════ */

type AuthCtx = {
  configured: boolean;
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

/* The single bootstrapped super-admin mailbox (created by supabase/schema.sql) */
const ADMIN_EMAIL = "haitham.advs@gmail.com";

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  /* Restore session on mount + live auth state */
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let sub: { unsubscribe: () => void } | undefined;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess) setRole(null);
    });
    sub = data.subscription;

    return () => sub?.unsubscribe();
  }, []);

  /* Load the user's role from profiles whenever they sign in */
  useEffect(() => {
    if (!supabase || !user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setRole((data?.role as UserRole) ?? "viewer");
      });
    supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id)
      .then(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user]);

  const signIn = useCallback(async (emailOrUser: string, password: string): Promise<string | null> => {
    if (!supabase) return "قاعدة البيانات غير مهيأة — أضف متغيرات بيئة Supabase أولًا";

    /* Accept bare admin usernames by mapping them to the real admin mailbox
       that schema.sql bootstraps. Anything else must be a full email. */
    const raw = emailOrUser.trim().toLowerCase();
    const ADMIN_ALIASES = ["h.advs", "haitham.advs", "admin"];
    if (!raw.includes("@") && !ADMIN_ALIASES.includes(raw)) {
      return "أدخل البريد الإلكتروني الكامل أو اسم المدير";
    }
    const identifier = raw.includes("@") ? raw : ADMIN_EMAIL;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login") || msg.includes("invalid credentials"))
          return "بيانات الدخول غير صحيحة";
        if (msg.includes("email not confirmed"))
          return "البريد غير مؤكَّد — فعّل خيار Auto-Confirm في إعدادات Auth";
        if (msg.includes("rate limit")) return "محاولات كثيرة — انتظر قليلًا ثم أعد المحاولة";
        return error.message;
      }
      return null;
    } catch {
      return "تعذّر الاتصال بخادم المصادقة";
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      configured: isSupabaseConfigured,
      user, session, role, loading,
      isAuthenticated: !!user,
      signIn, signOut,
    }),
    [user, session, role, loading, signIn, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

/* ── Profile-based admin gate ────────────────────────────────────────
   Blocks the dashboard unless the signed-in user has an active profile
   with a staff role. Reasons are surfaced verbatim on the denial screen. */
export type GateReason = "" | "not-authed" | "no-profile" | "inactive" | "viewer";

export function useAdminGate(): { loading: boolean; allowed: boolean; reason: GateReason } {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [state, setState] = useState<{ loading: boolean; allowed: boolean; reason: GateReason }>({
    loading: true,
    allowed: false,
    reason: "not-authed",
  });

  useEffect(() => {
    let cancelled = false;

    // 1) لا تقم بأي فحص قبل اكتمال مصادقة AuthProvider
    if (authLoading) {
      setState({ loading: true, allowed: false, reason: "not-authed" });
      return;
    }

    // 2) إذا لا يوجد user => deny
    if (!isAuthenticated || !user) {
      setState({ loading: false, allowed: false, reason: "not-authed" });
      return;
    }

    // 3) user جاهز: الآن نعتبرها عملية تحميل للـ gate
    setState({ loading: true, allowed: false, reason: "" });

    supabase
      .from("profiles")
      .select("role,is_active")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;

        // ✅ التعامل الصحيح مع الأخطاء
        if (error) {
          const code = (error as any)?.code;
          const message = error.message?.toLowerCase?.() ?? "";

          // ✅ فقط PGRST116 / No rows => no-profile
          const isNoRow =
            code === "PGRST116" ||
            message.includes("no rows") ||
            message.includes("0 rows");

          if (isNoRow) {
            setState({ loading: false, allowed: false, reason: "no-profile" });
            return;
          }

          // ✅ أي خطأ آخر لا تعتبره "no-profile"
          setState({ loading: false, allowed: false, reason: "not-authed" });
          return;
        }

        // إذا data null بدون error => اعتبرها no-profile (هذه حالة "لا صف")
        if (!data) {
          setState({ loading: false, allowed: false, reason: "no-profile" });
          return;
        }

        // 4) قواعد الدخول
        if (!data.is_active) {
          setState({ loading: false, allowed: false, reason: "inactive" });
          return;
        }

        if (data.role === "viewer") {
          setState({ loading: false, allowed: false, reason: "viewer" });
          return;
        }

        // staff/super_admin/أي دور غير viewer
        setState({ loading: false, allowed: true, reason: "" });
      })
      .catch(() => {
        if (cancelled) return;
        // ✅ لا تعتبر كـ no-profile في حالة استثناء غير متوقع
        setState({ loading: false, allowed: false, reason: "not-authed" });
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user]);

  return state;
}
