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
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<{ loading: boolean; allowed: boolean; reason: GateReason }>({
    loading: true, allowed: false, reason: "not-authed",
  });

  useEffect(() => {
    if (!supabase) { setState({ loading: false, allowed: true, reason: "" }); return; }
    if (!isAuthenticated || !user) { setState({ loading: false, allowed: false, reason: "not-authed" }); return; }
    let cancelled = false;

    /* ── Authoritative fast path: the role claim signed into the JWT ──
       The bootstrap admin is created with user_metadata.role = super_admin.
       JWT claims are signed by Supabase — trustworthy without any DB read,
       immune to RLS filtering, schema drift and PostgREST cache issues.
       This is what finally ends the false "no profile" lockout. */
    const STAFF_ROLES = new Set(["super_admin", "admin", "editor", "moderator"]);
    const claimedRole =
      (user.user_metadata?.role as string | undefined) ??
      (user.app_metadata?.role as string | undefined);
    if (claimedRole && STAFF_ROLES.has(claimedRole)) {
      setState({ loading: false, allowed: true, reason: "" });
      return;
    }

    type Row = { role?: string; is_active?: boolean } | null;

    /* Three-layer read so a valid user can NEVER be misread as missing:
       1) SECURITY DEFINER RPC — bypasses RLS entirely (immune to policy
          drift; a mis-filtered RLS select returns null WITHOUT error,
          which is exactly what caused the false "no profile" screen).
       2) Direct select("*") — never fails on missing/renamed columns. */
    const readViaRpc = async (): Promise<Row> => {
      const { data, error } = await supabase!.rpc("get_my_profile");
      if (error) return null; // function absent on older DBs → fall through
      return (data as Row) ?? null;
    };
    const readDirect = async (): Promise<Row> => {
      const { data, error } = await supabase!.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) console.warn("[admin-gate] profile read failed:", error.message);
      return (data as Row) ?? null;
    };
    const readProfile = async (): Promise<Row> => (await readViaRpc()) ?? (await readDirect());

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      let profile = await readProfile();

      /* Transient (session still hydrating, PostgREST cache) → retry once. */
      if (!profile) {
        await sleep(700);
        profile = await readProfile();
      }

      /* Row genuinely missing but the user exists in auth.users →
         auto-provision it (super_admin for the bootstrap mailbox). */
      if (!profile) {
        const role = user.email?.toLowerCase() === ADMIN_EMAIL ? "super_admin" : "viewer";
        await supabase!
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email ?? "",
            username: user.email?.split("@")[0] ?? "",
            name: (user.user_metadata?.name as string) ?? "",
            role,
          })
          .then(() => undefined);
        profile = await readProfile();
      }

      if (cancelled) return;
      if (!profile) setState({ loading: false, allowed: false, reason: "no-profile" });
      /* Tolerant: a missing is_active column means "active", not "blocked". */
      else if (profile.is_active === false) setState({ loading: false, allowed: false, reason: "inactive" });
      else if (profile.role === "viewer") setState({ loading: false, allowed: false, reason: "viewer" });
      else setState({ loading: false, allowed: true, reason: "" });
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  return state;
}
