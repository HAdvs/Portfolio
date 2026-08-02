import { Component, type ErrorInfo, type ReactNode } from "react";
import { LOGO } from "../lib/content";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Root-level safety net.
 *
 * Any render/effect exception anywhere in the tree (admin, public site,
 * providers) lands here instead of leaving an empty #root and a white page.
 * The fallback is a branded recovery screen with reload + home actions.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the real stack in the console for debugging
    console.error("[YourMark] Render error caught by ErrorBoundary:", error, info.componentStack);
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  private reload = () => {
    try {
      // Corrupted persisted state is the most common culprit — clear CMS
      // caches before reloading so the app rehydrates from defaults.
      localStorage.removeItem("ym-admin-store-v2");
      localStorage.removeItem("ym-cms-content");
      localStorage.removeItem("ym-cms-v2");
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden px-6"
        style={{ background: "var(--page, #050505)", fontFamily: "'IBM Plex Sans Arabic','Inter',system-ui,sans-serif" }}
      >
        {/* Ambient brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(10,132,255,.28), transparent 65%)" }}
        />

        <div
          className="relative w-full max-w-md rounded-[28px] p-8 text-center"
          style={{
            background: "color-mix(in srgb, var(--surface, #18181b) 80%, transparent)",
            border: "1px solid color-mix(in srgb, var(--primary, #0a84ff) 20%, transparent)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 40px 120px -30px rgba(0,0,0,.6)",
          }}
        >
          <img src={LOGO} alt="" width={64} height={64} className="mx-auto h-16 w-16 object-contain" />

          <h1 className="mt-5 text-[20px] font-black" style={{ color: "var(--txt, #fff)" }}>
            حدث خطأ غير متوقع
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--txt-muted, #98a2b8)" }}>
            تعذّر عرض هذه الصفحة. يمكنك إعادة المحاولة، أو مسح البيانات المحفوظة
            محليًا والعودة إلى الصفحة الرئيسية.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={this.reset}
              className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, var(--primary, #0a84ff), var(--secondary, #1e3a8a))" }}
            >
              إعادة المحاولة
            </button>
            <button
              onClick={this.reload}
              className="w-full rounded-2xl py-3.5 text-[14px] font-bold transition-colors"
              style={{
                color: "var(--txt, #fff)",
                border: "1px solid color-mix(in srgb, var(--primary, #0a84ff) 30%, transparent)",
                background: "color-mix(in srgb, var(--surface, #18181b) 60%, transparent)",
              }}
            >
              مسح البيانات المحلية والعودة للرئيسية
            </button>
          </div>

          {this.state.error?.message && (
            <details className="mt-5 text-start">
              <summary
                className="cursor-pointer text-[11px] font-semibold"
                style={{ color: "var(--txt-muted, #98a2b8)" }}
              >
                تفاصيل الخطأ (للمطوّرين)
              </summary>
              <pre
                dir="ltr"
                className="latin mt-2 max-h-32 overflow-auto rounded-xl p-3 text-[10.5px] leading-relaxed"
                style={{ background: "rgba(0,0,0,.35)", color: "#f87171" }}
              >
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
