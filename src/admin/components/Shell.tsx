import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LOGO } from "../../lib/content";
import { useAuth } from "../lib/auth";
import { useAdminStore } from "../store/useAdminStore";
import { useResolvedAdminTheme } from "../lib/theme";
import { tk, ToastContainer } from "./ui";
import { cn } from "../../utils/cn";
import { formatDistanceToNow } from "date-fns";

// ─── SVG icon components ─────────────────────────────────────────────────────
const HomeIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" /><path d="M9 21V12h6v9" /></svg>;
const AnalyticsIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 2-4" /></svg>;
const PulseIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
const ProjectsIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V6a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M14 4v5h5" /></svg>;
const ServicesIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" /></svg>;
const TestimonialsIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const FaqIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>;
const CategoriesIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const MediaIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>;
const MessagesIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const ContentIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" /><path d="M17.5 2.5a2.12 2.12 0 0 1 3 3L12 14l-4 1 1-4 8.5-8.5Z" /></svg>;
const SeoIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
const UsersIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const SettingsIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const BackupIco = () => <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const BellIco = () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const ExternalIco = () => <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
const LogoutIco = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const XSmIco = () => <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>;

// ─── Nav config ──────────────────────────────────────────────────────────────
type NavItem = { to: string; label: string; exact?: boolean; icon: ReactNode };
type NavSection = { label: string; items: NavItem[] };

const NAV: NavSection[] = [
  { label: "عام", items: [
    { to:"/admin", label:"لوحة التحكم", exact:true, icon:<HomeIco/> },
    { to:"/admin/analytics", label:"التحليلات", icon:<AnalyticsIco/> },
    { to:"/admin/diagnostics", label:"فحص النظام", icon:<PulseIco/> },
  ]},
  { label: "المحتوى", items: [
    { to:"/admin/projects", label:"المشاريع", icon:<ProjectsIco/> },
    { to:"/admin/services", label:"الخدمات", icon:<ServicesIco/> },
    { to:"/admin/testimonials", label:"آراء العملاء", icon:<TestimonialsIco/> },
    { to:"/admin/faq", label:"الأسئلة", icon:<FaqIco/> },
    { to:"/admin/categories", label:"التصنيفات", icon:<CategoriesIco/> },
  ]},
  { label: "الوسائط", items: [
    { to:"/admin/media", label:"مكتبة الوسائط", icon:<MediaIco/> },
  ]},
  { label: "التواصل", items: [
    { to:"/admin/messages", label:"الرسائل", icon:<MessagesIco/> },
  ]},
  { label: "الإدارة", items: [
    { to:"/admin/content", label:"إدارة المحتوى", icon:<ContentIco/> },
    { to:"/admin/seo", label:"إدارة SEO", icon:<SeoIco/> },
    { to:"/admin/users", label:"المستخدمون", icon:<UsersIco/> },
    { to:"/admin/settings", label:"الإعدادات", icon:<SettingsIco/> },
    { to:"/admin/backup", label:"النسخ الاحتياطية", icon:<BackupIco/> },
  ]},
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { signOut, user } = useAuth();
  const unreadMessages = useAdminStore((s) => s.messages.filter((m) => m.status === "unread").length);
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate("/admin/login"); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type:"spring", stiffness:340, damping:32 }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-e"
      style={{ borderColor:tk.border, background:"var(--adm-sidebar)", backdropFilter:"blur(24px)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b px-4 py-4" style={{ borderColor:tk.border }}>
        <a href="/" target="_blank" rel="noopener noreferrer" title="عرض الموقع"
          className="shrink-0 rounded-xl p-1 transition-opacity hover:opacity-80">
          <img src={LOGO} alt="YourMark" width={36} height={36}
            className="h-9 w-9 object-contain"
            style={{ filter:"drop-shadow(0 0 10px rgba(10,132,255,0.5))" }} />
        </a>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} className="min-w-0">
              <p className="text-[13.5px] font-black leading-tight" style={{ color: tk.text }}>YourMark</p>
              <p className="text-[10px]" style={{ color:tk.faint }}>Admin Panel v2</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={onToggle}
          className="ms-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors hover:bg-[var(--adm-hover-bg)]"
          style={{ color:tk.muted }}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {NAV.map((section) => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <p className="mb-1 px-4 text-[9.5px] font-bold uppercase tracking-[0.22em]"
                style={{ color:tk.faint }}>{section.label}</p>
            )}
            {section.items.map((item) => {
              const badge = item.to === "/admin/messages" ? unreadMessages : 0;
              return (
                <NavLink key={item.to} to={item.to} end={item.exact}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => cn(
                    "group relative flex items-center gap-3 rounded-2xl mx-2 px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 mb-0.5",
                    !isActive && "hover:bg-[var(--adm-hover-bg)]",
                  )}
                  style={({ isActive }) => isActive
                    ? { background:"var(--adm-active-bg)", border:`1px solid ${tk.borderFocus}`, color:tk.blue }
                    : { color:tk.muted, border:"1px solid transparent" }
                  }
                >
                  {item.icon}
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex-1 truncate">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && badge > 0 && (
                    <span className="ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                      style={{ background:tk.red }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t p-3" style={{ borderColor:tk.border }}>
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-black text-white"
            style={{ background:"linear-gradient(135deg,#0a84ff,#1e3a8a)" }}>
            {(user?.email ?? "A")[0].toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold text-white">{user?.email ?? "Admin"}</p>
                <p className="text-[10px]" style={{ color:tk.faint }}>مدير النظام</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button onClick={handleSignOut} title="خروج"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors hover:bg-[var(--adm-hover-bg)]"
              style={{ color:tk.muted }}>
              <LogoutIco />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
// ─── Theme switcher (Light / Dark / System) ─────────────────────────────────
const SunIco = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const MoonIco = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>;
const MonitorIco = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;

function ThemeSwitcher() {
  const adminTheme = useAdminStore((s) => s.adminTheme);
  const setAdminTheme = useAdminStore((s) => s.setAdminTheme);
  const options: { id: "light" | "dark" | "system"; label: string; icon: ReactNode }[] = [
    { id: "light", label: "نهاري", icon: <SunIco /> },
    { id: "dark", label: "ليلي", icon: <MoonIco /> },
    { id: "system", label: "النظام", icon: <MonitorIco /> },
  ];
  return (
    <div className="flex items-center rounded-xl p-0.5" style={{ background: tk.bg, border: `1px solid ${tk.border}` }} role="group" aria-label="تبديل المظهر">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => setAdminTheme(o.id)}
          title={o.label}
          aria-pressed={adminTheme === o.id}
          className={cn("flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[11px] font-bold transition-all duration-200")}
          style={
            adminTheme === o.id
              ? { background: tk.glassStr, color: tk.blue, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }
              : { color: tk.muted }
          }
        >
          {o.icon}
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Topbar() {
  const { notifications, markAllNotificationsRead, clearNotification } = useAdminStore();
  const unread = notifications.filter((n) => !n.read).length;
  const [showNotif, setShowNotif] = useState(false);

  const notifColors: Record<string, string> = { info:tk.blue, success:tk.green, warning:tk.amber, error:tk.red };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-5"
      style={{ borderColor:tk.border, background:"var(--adm-topbar)", backdropFilter:"blur(20px)" }}>
      <a href="/" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[var(--adm-hover-bg)]"
        style={{ color:tk.muted }}>
        <ExternalIco /> عرض الموقع
      </a>

      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <div className="h-5 w-px hidden sm:block" style={{ background:tk.border }} />
        {/* Notifications Bell */}
        <div className="relative">
          <button onClick={() => setShowNotif((v) => !v)}
            className="relative grid h-9 w-9 place-items-center rounded-xl transition-colors hover:bg-[var(--adm-hover-bg)]"
            style={{ color:tk.muted }}>
            <BellIco />
            {unread > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ background:tk.red }}>
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity:0, y:8, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:6, scale:0.96 }}
                transition={{ duration:0.18 }}
                className="absolute end-0 top-12 z-50 w-80 overflow-hidden rounded-[20px]"
                style={{ background:"var(--adm-pop)", border:`1px solid ${tk.border}`, boxShadow:"var(--adm-pop-shadow)" }}>
                <div className="flex items-center justify-between border-b px-4 py-3.5" style={{ borderColor:tk.border }}>
                  <p className="text-[13.5px] font-black" style={{ color: tk.text }}>الإشعارات</p>
                  <button onClick={markAllNotificationsRead} className="text-[11px] font-bold transition-opacity hover:opacity-75" style={{ color:tk.blue }}>قراءة الكل</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-8 text-center text-[13px]" style={{ color:tk.muted }}>لا توجد إشعارات</p>
                  ) : notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-[var(--adm-hover-bg)]"
                      style={{ borderColor:tk.border, opacity: n.read ? 0.55 : 1 }}>
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background:notifColors[n.type] ?? tk.blue }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-bold" style={{ color: tk.text }}>{n.title}</p>
                        <p className="mt-0.5 text-[11.5px]" style={{ color:tk.muted }}>{n.message}</p>
                        <p className="mt-1 text-[10.5px]" style={{ color:tk.faint }}>
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix:true })}
                        </p>
                      </div>
                      <button onClick={() => clearNotification(n.id)}
                        className="shrink-0 rounded-lg p-1 transition-colors hover:bg-[var(--adm-hover-bg)]" style={{ color:tk.faint }}>
                        <XSmIco />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-5 w-px" style={{ background:tk.border }} />
        <p className="hidden text-[11.5px] sm:block" style={{ color:tk.muted }}>
          {new Date().toLocaleDateString("ar-SA", { weekday:"long", month:"long", day:"numeric" })}
        </p>
      </div>
    </header>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export default function Shell({ children }: { children: ReactNode }) {
  const { sidebarCollapsed, toggleSidebar } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useResolvedAdminTheme();

  return (
    <div className="admin-root flex h-screen overflow-hidden" data-admin-theme={theme} style={{ background:"var(--adm-page)", direction:"rtl" }}>
      {/* Desktop sidebar */}
      <div className="hidden h-full lg:flex lg:flex-col" style={{ width: sidebarCollapsed ? 64 : 240, flexShrink:0, transition:"width 0.35s ease" }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)" }} />
            <motion.div
              initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
              transition={{ type:"spring", stiffness:320, damping:30 }}
              className="fixed inset-y-0 end-0 z-50 lg:hidden" style={{ width:240 }}>
              <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b px-4 py-3 lg:hidden" style={{ borderColor:tk.border, background:"var(--adm-topbar)" }}>
          <button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--adm-hover-bg)]" style={{ color:tk.muted }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <img src={LOGO} alt="YourMark" className="h-8 w-8 object-contain" />
        </div>

        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] p-5 sm:p-7">
            <motion.div
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
