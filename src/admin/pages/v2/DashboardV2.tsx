import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAdminStore, useDashboardStats } from "../../store/useAdminStore";
import { GlassCard, StatCard, Badge, tk } from "../../components/ui";
import { formatDistanceToNow } from "date-fns";

const FMT = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background:tk.green }} />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background:tk.green }} />
      </span>
      <span className="text-[11px] font-semibold" style={{ color:tk.green }}>مباشر</span>
    </div>
  );
}

const DEVICE_COLORS = [tk.blue, tk.purple, tk.amber];

export default function DashboardV2() {
  const stats = useDashboardStats();
  const settings = useAdminStore((s) => s.settings);
  const projects = useAdminStore((s) => s.projects);

  const storageGB = (stats.storageUsed / (1024 ** 3)).toFixed(3);
  const storageMax = 5;
  const storagePct = Math.min((parseFloat(storageGB) / storageMax) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-black tracking-tight" style={{ color: tk.text }}>لوحة التحكم</h1>
          <p className="mt-1 text-[13px]" style={{ color:tk.muted }}>مرحباً بك في لوحة تحكم {settings?.site_name ?? "YourMark"}</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator />
          <Badge label="الإصدار 2.0" variant="blue" />
        </div>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="المشاريع المنشورة" value={stats.publishedProjects} trend={12} trendLabel="هذا الشهر"
          color={tk.blue} sub={`من ${stats.totalProjects} إجمالاً`}
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20V6a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /></svg>} />
        <StatCard label="الرسائل الجديدة" value={stats.unreadMessages} trend={-4} trendLabel="منذ أمس"
          color={tk.amber} sub={`من ${stats.totalMessages} إجمالاً`}
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>} />
        <StatCard label="زوار اليوم" value={stats.analytics.totalVisitors.toLocaleString("ar-SA")} trend={8} trendLabel="مقارنة بالأمس"
          color={tk.green}
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>} />
        <StatCard label="ملفات الوسائط" value={stats.totalMedia} sub={`${FMT(stats.storageUsed)} مستخدم`}
          color={tk.purple}
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>} />
      </div>

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Visits chart */}
        <GlassCard padding="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-black" style={{ color: tk.text }}>الزيارات (١٤ يوم)</p>
              <p className="mt-0.5 text-[12px]" style={{ color:tk.muted }}>{stats.analytics.pageViews.toLocaleString("ar-SA")} مشاهدة إجمالاً</p>
            </div>
            <Badge label={`معدل ارتداد ${stats.analytics.bounceRate}%`} variant="amber" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stats.analytics.visitsByDay}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tk.blue} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={tk.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill:tk.faint, fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:tk.faint, fontSize:10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background:"var(--adm-pop)", border:`1px solid ${tk.border}`, borderRadius:12, color:"var(--adm-text)", fontSize:12 }}
                cursor={{ stroke:tk.blue, strokeWidth:1, strokeDasharray:"4 4" }}
              />
              <Area type="monotone" dataKey="visits" stroke={tk.blue} strokeWidth={2} fill="url(#grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Device breakdown */}
        <GlassCard padding="p-6">
          <p className="mb-5 text-[14px] font-black" style={{ color: tk.text }}>الأجهزة</p>
          <div className="flex items-center gap-5">
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie data={stats.analytics.deviceBreakdown} dataKey="pct" innerRadius={32} outerRadius={50} strokeWidth={0}>
                  {stats.analytics.deviceBreakdown.map((_, i) => (
                    <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1">
              {stats.analytics.deviceBreakdown.map((d, i) => (
                <div key={d.device} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background:DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
                    <span className="text-[12.5px]" style={{ color:tk.text }}>{d.device}</span>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color:tk.muted }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage bar */}
          <div className="mt-6 border-t pt-5" style={{ borderColor:tk.border }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12.5px] font-bold" style={{ color: tk.text }}>التخزين</p>
              <p className="text-[11.5px]" style={{ color:tk.muted }}>{storageGB} GB / {storageMax} GB</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background:"rgba(255,255,255,0.08)" }}>
              <motion.div
                initial={{ width:0 }} animate={{ width:`${storagePct}%` }}
                transition={{ duration:1.2, ease:[0.22,1,0.36,1] }}
                className="h-full rounded-full"
                style={{ background:storagePct > 80 ? `linear-gradient(90deg,${tk.amber},${tk.red})` : `linear-gradient(90deg,${tk.blue},${tk.purple})` }}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Bottom row */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr]">
        {/* Top pages */}
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black" style={{ color: tk.text }}>أكثر الصفحات زيارة</p>
          <div className="space-y-2">
            {stats.analytics.topPages.map((p, i) => (
              <div key={p.page} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/4 transition-colors">
                <span className="latin grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-black text-white"
                  style={{ background:`${tk.blue}22`, color:tk.blue }}>
                  {i+1}
                </span>
                <span className="latin flex-1 truncate text-[12.5px]" dir="ltr" style={{ color:tk.text }}>{p.page}</span>
                <span className="text-[11.5px] font-bold" style={{ color:tk.muted }}>{p.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Countries */}
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black" style={{ color: tk.text }}>الزيارات حسب الدولة</p>
          <div className="space-y-2.5">
            {stats.analytics.visitsByCountry.map((c) => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-xl leading-none">{c.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12.5px]" style={{ color:tk.text }}>{c.country}</span>
                    <span className="text-[11.5px]" style={{ color:tk.muted }}>{c.visits.toLocaleString()}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full" style={{ background:"rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full" style={{ width:`${(c.visits/6240)*100}%`, background:`linear-gradient(90deg,${tk.blue},${tk.purple})` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent activity */}
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black" style={{ color: tk.text }}>آخر النشاطات</p>
          <div className="space-y-3">
            {stats.recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl text-[11px] font-black text-white"
                  style={{ background:`${tk.blue}22`, color:tk.blue }}>
                  {a.userName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold leading-tight" style={{ color: tk.text }}>{a.action}</p>
                  <p className="text-[10.5px]" style={{ color:tk.faint }}>{formatDistanceToNow(new Date(a.createdAt), { addSuffix:true })}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Featured projects quick view */}
      <GlassCard padding="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[14px] font-black" style={{ color: tk.text }}>المشاريع المميزة</p>
          <a href="/admin/projects" className="text-[12px] font-semibold hover:text-white transition-colors" style={{ color:tk.blue }}>عرض الكل</a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.filter((p) => p.featured).slice(0,3).map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/4"
              style={{ border:`1px solid ${tk.border}` }}>
              <img src={p.cover_url} alt={p.title_ar} className="h-12 w-12 shrink-0 rounded-xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src="https://via.placeholder.com/48"; }} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold" style={{ color: tk.text }}>{p.title_ar}</p>
                <p className="text-[11px]" style={{ color:tk.muted }}>{p.year} · {p.views.toLocaleString()} مشاهدة</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
