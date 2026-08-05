import { AnimatePresence, motion } from "framer-motion";
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  useState,
} from "react";
import { cn } from "../../../utils/cn";

// ─── Theme tokens ──────────────────────────────────────────────────────────
// Semantic tokens resolve through CSS custom properties so the whole admin
// flips between Apple Liquid Glass light (default) and dark via
// [data-admin-theme] on the .admin-root container. Brand accents are fixed.
export const tk = {
  bg:       "var(--adm-bg)",
  bgHover:  "var(--adm-bg-hover)",
  border:   "var(--adm-border)",
  borderFocus: "var(--adm-border-focus)",
  glass:    "var(--adm-glass)",
  glassStr: "var(--adm-glass-strong)",
  text:     "var(--adm-text)",
  muted:    "var(--adm-muted)",
  faint:    "var(--adm-faint)",
  blue:     "#0a84ff",
  navy:     "#1e3a8a",
  green:    "#22c55e",
  red:      "#ef4444",
  amber:    "#f59e0b",
  purple:   "#8b5cf6",
};

// ─── Glass Card ────────────────────────────────────────────────────────────
export function GlassCard({
  children,
  className,
  hover = false,
  padding = "p-6",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -3, scale: 1.008 } : undefined}
      transition={{ duration: 0.25 }}
      className={cn("rounded-[22px] backdrop-blur-xl", padding, className)}
      style={{
        background: tk.glass,
        border: `1px solid ${tk.border}`,
        boxShadow: "var(--adm-card-shadow)",
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  icon,
  color,
  trend,
  trendLabel,
  sub,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: number;
  trendLabel?: string;
  sub?: string;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <GlassCard hover padding="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: tk.muted }}>{label}</p>
          <p className="mt-2 text-[28px] font-black leading-none tracking-tight" style={{ color: tk.text }}>{value}</p>
          {sub && <p className="mt-1.5 text-[12px]" style={{ color: tk.faint }}>{sub}</p>}
          {trend !== undefined && (
            <div className="mt-2.5 flex items-center gap-1">
              <span className="text-[11px] font-bold" style={{ color: isPositive ? tk.green : tk.red }}>
                {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-[11px]" style={{ color: tk.faint }}>{trendLabel}</span>}
            </div>
          )}
        </div>
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          style={{ background: `${color}18`, color, boxShadow: `0 0 20px ${color}25` }}
        >
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Button ─────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize    = "xs" | "sm" | "md" | "lg";

const btnBase = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none";

const btnVariant: Record<BtnVariant, string> = {
  primary:   "text-white shadow-lg",
  secondary: "",
  ghost:     "hover:bg-[var(--adm-hover-bg)]",
  danger:    "hover:bg-red-500/10",
  success:   "hover:bg-green-500/10",
};

const btnSize: Record<BtnSize, string> = {
  xs: "px-3 py-1.5 text-[11px] rounded-lg gap-1.5",
  sm: "px-3.5 py-2 text-[12.5px] rounded-xl",
  md: "px-4 py-2.5 text-[13px] rounded-xl",
  lg: "px-6 py-3.5 text-[14px] rounded-2xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, icon, iconRight, children, className, style, ...rest }, ref) => {
    const isPrimary = variant === "primary";
    return (
      <button
        ref={ref}
        className={cn(btnBase, btnVariant[variant], btnSize[size], className)}
        style={isPrimary
          ? { background: `linear-gradient(135deg, ${tk.blue}, ${tk.navy})`, ...style }
          : variant === "secondary"
            ? { background: tk.bgHover, border: `1px solid ${tk.border}`, color: tk.text, ...style }
            : variant === "danger"
              ? { color: tk.red, ...style }
              : variant === "success"
                ? { color: tk.green, ...style }
                : { color: tk.muted, ...style }
        }
        disabled={loading}
        {...rest}
      >
        {loading ? <Spinner size={14} /> : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

// ─── Input ──────────────────────────────────────────────────────────────────
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, ...rest }, ref) => (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-[11.5px] font-semibold uppercase tracking-widest" style={{ color: tk.muted }}>{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute start-3.5 top-1/2 -translate-y-1/2 opacity-40">{prefix}</span>}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl py-3 text-[13.5px] outline-none transition-all placeholder:opacity-40",
            prefix ? "ps-10 pe-4" : "px-4",
            suffix ? "pe-10" : "",
            className
          )}
          style={{
            background: tk.bg,
            border: `1px solid ${error ? tk.red + "66" : tk.border}`,
            color: tk.text,
            caretColor: tk.blue,
          }}
          {...rest}
        />
        {suffix && <span className="absolute end-3.5 top-1/2 -translate-y-1/2 opacity-50">{suffix}</span>}
      </div>
      {error && <p className="text-[11.5px] font-medium" style={{ color: tk.red }}>{error}</p>}
      {hint && !error && <p className="text-[11px]" style={{ color: tk.faint }}>{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Textarea ───────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...rest }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-[11.5px] font-semibold uppercase tracking-widest" style={{ color: tk.muted }}>{label}</label>}
      <textarea
        ref={ref}
        className={cn("w-full resize-none rounded-xl px-4 py-3 text-[13.5px] outline-none transition-all leading-relaxed placeholder:opacity-40", className)}
        style={{ background: tk.bg, border: `1px solid ${error ? tk.red + "66" : tk.border}`, color: tk.text, caretColor: tk.blue }}
        {...rest}
      />
      {error && <p className="text-[11.5px]" style={{ color: tk.red }}>{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

// ─── Select ─────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...rest }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-[11.5px] font-semibold uppercase tracking-widest" style={{ color: tk.muted }}>{label}</label>}
      <select
        ref={ref}
        className={cn("w-full rounded-xl px-4 py-3 text-[13.5px] outline-none transition-all appearance-none cursor-pointer", className)}
        style={{ background: tk.bg, border: `1px solid ${error ? tk.red + "66" : tk.border}`, color: tk.text }}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "var(--adm-pop)", color: "var(--adm-text)" }}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-[11.5px]" style={{ color: tk.red }}>{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// ─── Toggle ─────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 rounded-full transition-colors duration-300"
        style={{ background: checked ? tk.blue : "var(--adm-border)" }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
          style={{ [checked ? "insetInlineStart" : "insetInlineStart"]: checked ? "22px" : "2px" }}
          animate={{ x: checked ? 22 : 2 }}
          initial={false}
        />
      </button>
      {label && <span className="text-[13px]" style={{ color: tk.text }}>{label}</span>}
    </label>
  );
}

// ─── Badge ──────────────────────────────────────────────────────────────────
type BadgeVariant = "blue" | "green" | "red" | "amber" | "purple" | "gray";

const badgeColors: Record<BadgeVariant, { bg: string; text: string }> = {
  blue:   { bg: "rgba(10,132,255,0.15)",  text: "#60a5fa" },
  green:  { bg: "rgba(34,197,94,0.12)",   text: "#86efac" },
  red:    { bg: "rgba(239,68,68,0.12)",   text: "#fca5a5" },
  amber:  { bg: "rgba(245,158,11,0.12)",  text: "#fde68a" },
  purple: { bg: "rgba(139,92,246,0.12)",  text: "#c4b5fd" },
  gray:   { bg: "rgba(255,255,255,0.07)", text: tk.muted },
};

export function Badge({ label, variant = "gray", dot = false }: { label: string; variant?: BadgeVariant; dot?: boolean }) {
  const c = badgeColors[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.text, boxShadow: `0 0 6px ${c.text}` }} />}
      {label}
    </span>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = tk.blue }: { size?: number; color?: string }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="28" strokeDashoffset="8" opacity="0.25" />
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="6" strokeDashoffset="0" />
    </motion.svg>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ title, desc, icon, action }: { title: string; desc?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl" style={{ background: tk.bg, color: tk.muted }}>
          {icon}
        </div>
      )}
      <p className="text-[15px] font-bold" style={{ color: tk.text }}>{title}</p>
      {desc && <p className="mt-1.5 max-w-xs text-[13px]" style={{ color: tk.muted }}>{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ background: tk.bg }}
    >
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
          style={{ background: "linear-gradient(90deg, transparent, var(--adm-bg-hover), transparent)" }}
        />
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const maxW = { sm:"max-w-sm", md:"max-w-xl", lg:"max-w-2xl", xl:"max-w-4xl" }[size];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.93, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn("relative w-full overflow-hidden rounded-[28px]", maxW)}
            style={{
              background: "var(--adm-pop)",
              border: `1px solid ${tk.border}`,
              boxShadow: "var(--adm-pop-shadow)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {title && (
              <div className="flex items-center justify-between gap-4 border-b px-7 py-5 shrink-0"
                style={{ borderColor: tk.border }}>
                <h2 className="text-[16px] font-black" style={{ color: tk.text }}>{title}</h2>
                <button onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-xl transition-colors hover:bg-[var(--adm-hover-bg)]"
                  style={{ color: tk.muted }}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="overflow-y-auto flex-1 p-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all"
          style={{ color: active === t.id ? tk.blue : tk.muted }}
        >
          {active === t.id && (
            <motion.span
              layoutId="tab-bg"
              className="absolute inset-0 rounded-xl"
              style={{ background: `${tk.blue}18` }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          {t.icon && <span className="relative">{t.icon}</span>}
          <span className="relative">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "تأكيد",
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: danger ? "rgba(239,68,68,0.12)" : "rgba(10,132,255,0.12)" }}>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none"
            stroke={danger ? tk.red : tk.blue} strokeWidth="1.8" strokeLinecap="round">
            {danger
              ? <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01" />
              : <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>
            }
          </svg>
        </div>
        <h3 className="text-[16px] font-black" style={{ color: tk.text }}>{title}</h3>
        <p className="mt-2 text-[13px]" style={{ color: tk.muted }}>{message}</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={onClose} className="flex-1">إلغاء</Button>
          <Button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1"
            style={danger ? { background: "rgba(239,68,68,0.65)", color: "white" } : undefined}
            variant={danger ? "ghost" : "primary"}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = "بحث…" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg viewBox="0 0 24 24" className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        style={{ color: tk.faint }}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl py-2.5 ps-10 pe-4 text-[13px] outline-none placeholder:opacity-40"
        style={{ background: tk.bg, border: `1px solid ${tk.border}`, color: tk.text }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-0.5 hover:bg-white/8"
          style={{ color: tk.muted }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Toast — professional notification system ────────────────────────────────
export type ToastType = "success" | "error" | "warning" | "info";
interface ToastItem { id: number; msg: string; type: ToastType; detail?: string; duration: number }

let _toastFn: ((msg: string, type?: ToastType, detail?: string) => void) | null = null;
let _toastCount = 0;

const TOAST_META: Record<ToastType, { color: string; label: string; icon: ReactNode }> = {
  success: { color: tk.green, label: "تم", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg> },
  error:   { color: tk.red,   label: "خطأ", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg> },
  warning: { color: tk.amber, label: "تنبيه", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4M12 17h.01" /></svg> },
  info:    { color: tk.blue,  label: "معلومة", icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" /></svg> },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  _toastFn = (msg, type = "success", detail) => {
    const id = ++_toastCount;
    const duration = type === "error" ? 8000 : type === "warning" ? 6000 : 3800;
    setToasts((prev) => [...prev.slice(-4), { id, msg, type, detail, duration }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), duration);
  };

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="fixed bottom-6 start-6 z-[999] flex w-[min(92vw,380px)] flex-col gap-2.5 pointer-events-none" style={{ direction: "rtl" }}>
      <AnimatePresence>
        {toasts.map((t) => {
          const meta = TOAST_META[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl"
              style={{ background: "var(--adm-pop)", border: `1px solid ${meta.color}44`, boxShadow: "var(--adm-pop-shadow)", backdropFilter: "blur(24px)" }}
            >
              <div className="flex items-start gap-3 px-4 py-3.5">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl" style={{ background: `${meta.color}1c`, color: meta.color }}>
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-snug" style={{ color: "var(--adm-text)" }}>{t.msg}</p>
                  {t.detail && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[11px] font-semibold" style={{ color: meta.color }}>عرض التفاصيل</summary>
                      <pre dir="ltr" className="mt-1.5 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg p-2 text-[10.5px] leading-relaxed"
                        style={{ background: "var(--adm-bg)", color: "var(--adm-muted)" }}>
                        {t.detail}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {t.detail && (
                    <button
                      onClick={() => { navigator.clipboard?.writeText(`${t.msg}\n${t.detail}`).catch(() => undefined); }}
                      title="نسخ"
                      className="grid h-7 w-7 place-items-center rounded-lg transition-colors hover:bg-[var(--adm-hover-bg)]"
                      style={{ color: "var(--adm-muted)" }}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(t.id)}
                    title="إغلاق"
                    className="grid h-7 w-7 place-items-center rounded-lg transition-colors hover:bg-[var(--adm-hover-bg)]"
                    style={{ color: "var(--adm-muted)" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              {/* auto-close progress */}
              <motion.div
                className="absolute bottom-0 start-0 h-0.5"
                style={{ background: meta.color }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: t.duration / 1000, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export const toast = (msg: string, type: ToastType = "success", detail?: string) => {
  if (_toastFn) _toastFn(msg, type, detail);
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, total, perPage, onChange }: {
  page: number; total: number; perPage: number; onChange: (p: number) => void;
}) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <Button size="xs" onClick={() => onChange(page-1)} disabled={page<=1} variant="ghost">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 rotate-180" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
      </Button>
      {Array.from({length:pages},(_,i)=>i+1).filter(p=>p===1||p===pages||Math.abs(p-page)<=1).map((p,i,arr)=>(
        <>
          {i>0&&arr[i-1]!==p-1&&<span key={`dot-${p}`} style={{color:tk.faint}} className="text-xs px-1">…</span>}
          <button key={p} onClick={()=>onChange(p)}
            className="h-8 w-8 rounded-xl text-[12px] font-bold transition-colors"
            style={p===page?{background:tk.blue,color:"white"}:{color:tk.muted}}>
            {p}
          </button>
        </>
      ))}
      <Button size="xs" onClick={() => onChange(page+1)} disabled={page>=pages} variant="ghost">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
      </Button>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function PageHeader({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-black tracking-tight" style={{ color: tk.text }}>{title}</h1>
        {subtitle && <p className="mt-1 text-[13px]" style={{ color: tk.muted }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
