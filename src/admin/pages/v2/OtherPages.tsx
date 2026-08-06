/**
 * Consolidated secondary admin pages:
 * Analytics, Services, Testimonials, FAQ, Categories, SEO, Backup, Content
 */
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAdminStore, useDashboardStats } from "../../store/useAdminStore";
import { supabase } from "../../../lib/supabaseClient";
import type { Category, FaqItem, SeoConfig, Service, Testimonial } from "../../types";
import {
  Badge, Button, ConfirmDialog, GlassCard, Input, Modal, PageHeader,
  StatCard, Tabs, Textarea, Toggle, tk, toast,
} from "../../components/ui";

// â”€â”€â”€ ANALYTICS PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AnalyticsPage() {
  const stats = useDashboardStats();
  const {
    visitsByDay,
    topPages,
    deviceBreakdown,
    visitsByCountry,
    topBrowsers,
    topReferrers,
    topCities,
  } = stats.analytics;
  const [exporting, setExporting] = useState(false);

  const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("page_views")
        .select("visitor_id,session_id,path,title,country,city,device,browser,os,referrer,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast("No analytics data to export.", "info");
        return;
      }

      const rows = data.map((row: any) => [
        row.visitor_id,
        row.session_id,
        row.path,
        row.title,
        row.country,
        row.city,
        row.device,
        row.browser,
        row.os,
        row.referrer,
        row.created_at,
      ]);

      const csv = [
        ["Visitor ID","Session ID","Path","Title","Country","City","Device","Browser","OS","Referrer","Timestamp"].map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast("Analytics CSV exported successfully.", "success");
    } catch (error) {
      console.error("[Analytics Export]", error);
      toast("Failed to export analytics CSV.", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Realtime site performance and visitor trends"
        actions={
          <Button variant="primary" loading={exporting} onClick={exportCsv} icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /><path d="M7 11l5 5 5-5" /><path d="M12 4v12" /></svg>}>Export CSV</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Visitors" value={stats.analytics.totalVisitors.toLocaleString("en-US")} color={tk.blue} icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>} />
        <StatCard label="Unique Visitors" value={stats.analytics.uniqueVisitors.toLocaleString("en-US")} color={tk.purple} icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>} />
        <StatCard label="Page Views" value={stats.analytics.pageViews.toLocaleString("en-US")} color={tk.green} icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>} />
        <StatCard label="Bounce Rate" value={`${stats.analytics.bounceRate}%`} color={tk.amber} icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18M7 16l4-8 4 4 2-4" /></svg>} />
        <StatCard label="Avg. Session" value={stats.analytics.avgSession} color={tk.blue} icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>} />
        <StatCard label="Storage Used" value={`${(stats.storageUsed / (1024 ** 2)).toFixed(1)} MB`} sub={`${stats.totalMedia} media`} color={tk.purple} icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16v16H4z" /><path d="M8 10h8" /><path d="M8 14h4" /></svg>} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard padding="p-6">
          <p className="mb-4 text-[14px] font-black text-white">Daily Visits</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={visitsByDay}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tk.blue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={tk.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: tk.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tk.faint, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "var(--adm-pop)", border: `1px solid ${tk.border}`, borderRadius: 12, color: "var(--adm-text)", fontSize: 12 }} cursor={{ stroke: tk.blue, strokeDasharray: "4 4" }} />
              <Area type="monotone" dataKey="visits" stroke={tk.blue} strokeWidth={2} fill="url(#ag)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard padding="p-6">
          <p className="mb-4 text-[14px] font-black text-white">Top Pages</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topPages} layout="vertical">
              <XAxis type="number" tick={{ fill: tk.faint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="page" type="category" tick={{ fill: tk.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: "var(--adm-pop)", border: `1px solid ${tk.border}`, borderRadius: 12, color: "var(--adm-text)", fontSize: 12 }} cursor={{ fill: "var(--adm-hover-bg)" }} />
              <Bar dataKey="views" fill={tk.blue} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black text-white">Visitors by Country</p>
          {visitsByCountry.map((c) => (
            <div key={c.country} className="mb-3 flex items-center gap-3">
              <span className="text-xl leading-none">{c.flag}</span>
              <div className="flex-1">
                <div className="mb-1 flex justify-between">
                  <span className="text-[12.5px]" style={{ color: tk.text }}>{c.country}</span>
                  <span className="text-[11.5px]" style={{ color: tk.muted }}>{c.visits.toLocaleString()}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(c.visits / Math.max(visitsByCountry.length ? Math.max(...visitsByCountry.map((x) => x.visits)) : 1, 1)) * 100}%`, background: `linear-gradient(90deg,${tk.blue},${tk.purple})` }} />
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black text-white">Device Breakdown</p>
          {deviceBreakdown.map((d, i) => (
            <div key={d.device} className="mb-3 flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl text-[10px] font-black text-white shrink-0" style={{ background: [tk.blue, tk.purple, tk.amber][i % 3] }}>{d.device[0]}</div>
              <div className="flex-1">
                <div className="mb-1 flex justify-between">
                  <span className="text-[12.5px]" style={{ color: tk.text }}>{d.device}</span>
                  <span className="text-[11.5px] font-bold" style={{ color: tk.muted }}>{d.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: [tk.blue, tk.purple, tk.amber][i % 3] }} />
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black text-white">Top Browsers</p>
          <div className="space-y-3">
            {topBrowsers.map((browser) => (
              <div key={browser.browser} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px]" style={{ color: tk.text }}>{browser.browser}</span>
                  <span className="text-[11.5px] font-bold" style={{ color: tk.muted }}>{browser.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width: `${browser.pct}%`, background: `linear-gradient(90deg,${tk.blue},${tk.purple})` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black text-white">Top Cities</p>
          <div className="space-y-3">
            {topCities.map((city) => (
              <div key={city.city} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-white/4 transition-colors">
                <span className="text-[12.5px]" style={{ color: tk.text }}>{city.city}</span>
                <span className="text-[11.5px] font-bold" style={{ color: tk.muted }}>{city.visits.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black text-white">Top Referrers</p>
          <div className="space-y-3">
            {topReferrers.map((ref) => (
              <div key={ref.referrer} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-white/4 transition-colors">
                <span className="truncate text-[12.5px]" style={{ color: tk.text }}>{ref.referrer}</span>
                <span className="text-[11.5px] font-bold" style={{ color: tk.muted }}>{ref.visits.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}// â”€â”€â”€ SERVICES PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ServiceForm({ initial, onClose }: { initial?: Service; onClose: () => void }) {
  const { addService, updateService } = useAdminStore();
  const [form, setForm] = useState<Omit<Service,"id">>(initial ? { ...initial } : { title_ar:"", title_en:"", desc_ar:"", desc_en:"", icon:"", order_index:0, visible:true });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.title_ar.trim()) { toast("ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط¹ظ†ظˆط§ظ†","error"); return; }
    if (initial) { updateService(initial.id, form); toast("طھظ… طھط­ط¯ظٹط« ط§ظ„ط®ط¯ظ…ط©"); }
    else { addService(form); toast("طھظ… ط¥ط¶ط§ظپط© ط§ظ„ط®ط¯ظ…ط©"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <Input label="ط§ظ„ط¹ظ†ظˆط§ظ† (ط¹ط±ط¨ظٹ)" value={form.title_ar} onChange={(e) => set("title_ar", e.target.value)} />
      <Input label="Title (English)" value={form.title_en} onChange={(e) => set("title_en", e.target.value)} />
      <Textarea label="ط§ظ„ظˆطµظپ (ط¹ط±ط¨ظٹ)" rows={3} value={form.desc_ar} onChange={(e) => set("desc_ar", e.target.value)} />
      <Textarea label="Description (English)" rows={3} value={form.desc_en} onChange={(e) => set("desc_en", e.target.value)} />
      <Input label="ط§ظ„طھط±طھظٹط¨" type="number" value={String(form.order_index)} onChange={(e) => set("order_index", Number(e.target.value))} />
      <Toggle checked={form.visible} onChange={(v) => set("visible", v)} label="ط¸ط§ظ‡ط±ط© ظپظٹ ط§ظ„ظ…ظˆظ‚ط¹" />
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">ط¥ظ„ط؛ط§ط،</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "ط­ظپط¸" : "ط¥ط¶ط§ظپط©"}</Button>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const { services, deleteService, updateService } = useAdminStore();
  const [modal, setModal] = useState<"new"|"edit"|false>(false);
  const [editing, setEditing] = useState<Service|null>(null);
  const [confirmId, setConfirmId] = useState<string|null>(null);

  return (
    <div>
      <PageHeader title="ط¥ط¯ط§ط±ط© ط§ظ„ط®ط¯ظ…ط§طھ" subtitle={`${services.length} ط®ط¯ظ…ط©`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>ط¥ط¶ط§ظپط© ط®ط¯ظ…ط©</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <GlassCard key={s.id} padding="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-white">{s.title_ar}</p>
                <p className="mt-0.5 text-[12px]" style={{ color:tk.muted }}>{s.title_en}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color:tk.muted }}>{s.desc_ar}</p>
              </div>
              <Toggle checked={s.visible} onChange={(v) => updateService(s.id, { visible:v })} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="xs" className="flex-1" onClick={() => { setEditing(s); setModal("edit"); }}>طھط¹ط¯ظٹظ„</Button>
              <Button size="xs" variant="danger" onClick={() => setConfirmId(s.id)}>ط­ط°ظپ</Button>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"طھط¹ط¯ظٹظ„ ط§ظ„ط®ط¯ظ…ط©":"ط®ط¯ظ…ط© ط¬ط¯ظٹط¯ط©"}>
        <ServiceForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteService(confirmId); toast("طھظ… ط§ظ„ط­ط°ظپ","error"); } }}
        title="ط­ط°ظپ ط§ظ„ط®ط¯ظ…ط©" message="ط³ظٹطھظ… ط­ط°ظپ ط§ظ„ط®ط¯ظ…ط© ظ†ظ‡ط§ط¦ظٹط§ظ‹." danger />
    </div>
  );
}

// â”€â”€â”€ TESTIMONIALS PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TestimonialForm({ initial, onClose }: { initial?: Testimonial; onClose: () => void }) {
  const { addTestimonial, updateTestimonial } = useAdminStore();
  const [form, setForm] = useState<Omit<Testimonial,"id"|"createdAt">>(initial
    ? { name:initial.name, company:initial.company, role:initial.role, avatar:initial.avatar, text_ar:initial.text_ar, text_en:initial.text_en, rating:initial.rating, visible:initial.visible, order_index:initial.order_index }
    : { name:"", company:"", role:"", avatar:"", text_ar:"", text_en:"", rating:5, visible:true, order_index:0 });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.name.trim()) { toast("ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط§ط³ظ…","error"); return; }
    if (initial) { updateTestimonial(initial.id, form); toast("طھظ… ط§ظ„طھط­ط¯ظٹط«"); }
    else { addTestimonial(form); toast("طھظ… ط§ظ„ط¥ط¶ط§ظپط©"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="ط§ظ„ط§ط³ظ…" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Input label="ط§ظ„ط´ط±ظƒط©" value={form.company} onChange={(e) => set("company", e.target.value)} />
        <Input label="ط§ظ„ظ…ظ†طµط¨" value={form.role} onChange={(e) => set("role", e.target.value)} />
        <Input label="ط§ظ„طھظ‚ظٹظٹظ… (1-5)" type="number" value={String(form.rating)} onChange={(e) => set("rating", Math.min(5, Math.max(1, Number(e.target.value))))} />
      </div>
      <Input label="ط±ط§ط¨ط· ط§ظ„طµظˆط±ط© ط§ظ„ط´ط®طµظٹط©" value={form.avatar??""} onChange={(e) => set("avatar", e.target.value)} placeholder="https://â€¦" />
      <Textarea label="ط§ظ„ط±ط£ظٹ (ط¹ط±ط¨ظٹ)" rows={3} value={form.text_ar} onChange={(e) => set("text_ar", e.target.value)} />
      <Textarea label="Testimonial (English)" rows={3} value={form.text_en} onChange={(e) => set("text_en", e.target.value)} />
      <Toggle checked={form.visible} onChange={(v) => set("visible", v)} label="ط¸ط§ظ‡ط± ظپظٹ ط§ظ„ظ…ظˆظ‚ط¹" />
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">ط¥ظ„ط؛ط§ط،</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "ط­ظپط¸" : "ط¥ط¶ط§ظپط©"}</Button>
      </div>
    </div>
  );
}

export function TestimonialsPage() {
  const { testimonials, deleteTestimonial } = useAdminStore();
  const [modal, setModal] = useState<"new"|"edit"|false>(false);
  const [editing, setEditing] = useState<Testimonial|null>(null);
  const [confirmId, setConfirmId] = useState<string|null>(null);

  return (
    <div>
      <PageHeader title="ط¢ط±ط§ط، ط§ظ„ط¹ظ…ظ„ط§ط،" subtitle={`${testimonials.length} ط±ط£ظٹ`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>ط¥ط¶ط§ظپط© ط±ط£ظٹ</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <GlassCard key={t.id} padding="p-5">
            <div className="flex items-start gap-3">
              {t.avatar && <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover shrink-0" />}
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-white">{t.name}</p>
                <p className="text-[12px]" style={{ color:tk.muted }}>{t.company}</p>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({length:5}).map((_,i) => (
                    <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={i<t.rating?"#f59e0b":"none"} stroke="#f59e0b" strokeWidth="1.5"><path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8L12 3Z" /></svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color:tk.muted }}>"{t.text_ar}"</p>
            <div className="mt-4 flex gap-2">
              <Button size="xs" className="flex-1" onClick={() => { setEditing(t); setModal("edit"); }}>طھط¹ط¯ظٹظ„</Button>
              <Button size="xs" variant="danger" onClick={() => setConfirmId(t.id)}>ط­ط°ظپ</Button>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"طھط¹ط¯ظٹظ„ ط§ظ„ط±ط£ظٹ":"ط±ط£ظٹ ط¬ط¯ظٹط¯"}>
        <TestimonialForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteTestimonial(confirmId); toast("طھظ… ط§ظ„ط­ط°ظپ","error"); } }}
        title="ط­ط°ظپ ط§ظ„ط±ط£ظٹ" message="ط³ظٹطھظ… ط­ط°ظپ ط§ظ„ط±ط£ظٹ ظ†ظ‡ط§ط¦ظٹط§ظ‹." danger />
    </div>
  );
}

// â”€â”€â”€ FAQ PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FaqForm({ initial, onClose }: { initial?: FaqItem; onClose: () => void }) {
  const { addFaq, updateFaq } = useAdminStore();
  const [form, setForm] = useState<Omit<FaqItem,"id">>(initial
    ? { question_ar:initial.question_ar, question_en:initial.question_en, answer_ar:initial.answer_ar, answer_en:initial.answer_en, order_index:initial.order_index, visible:initial.visible }
    : { question_ar:"", question_en:"", answer_ar:"", answer_en:"", order_index:0, visible:true });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.question_ar.trim()) { toast("ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط³ط¤ط§ظ„","error"); return; }
    if (initial) { updateFaq(initial.id, form); toast("طھظ… ط§ظ„طھط­ط¯ظٹط«"); }
    else { addFaq(form); toast("طھظ… ط§ظ„ط¥ط¶ط§ظپط©"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <Tabs tabs={[{id:"ar",label:"ط¹ط±ط¨ظٹ"},{id:"en",label:"English"}]} active="ar" onChange={() => {}} />
      <Input label="ط§ظ„ط³ط¤ط§ظ„ (ط¹ط±ط¨ظٹ)" value={form.question_ar} onChange={(e) => set("question_ar", e.target.value)} />
      <Textarea label="ط§ظ„ط¬ظˆط§ط¨ (ط¹ط±ط¨ظٹ)" rows={3} value={form.answer_ar} onChange={(e) => set("answer_ar", e.target.value)} />
      <Input label="Question (English)" value={form.question_en} onChange={(e) => set("question_en", e.target.value)} />
      <Textarea label="Answer (English)" rows={3} value={form.answer_en} onChange={(e) => set("answer_en", e.target.value)} />
      <Toggle checked={form.visible} onChange={(v) => set("visible", v)} label="ط¸ط§ظ‡ط± ظپظٹ ط§ظ„ظ…ظˆظ‚ط¹" />
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">ط¥ظ„ط؛ط§ط،</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "ط­ظپط¸" : "ط¥ط¶ط§ظپط©"}</Button>
      </div>
    </div>
  );
}

export function FaqPage() {
  const { faq, deleteFaq } = useAdminStore();
  const [modal, setModal] = useState<"new"|"edit"|false>(false);
  const [editing, setEditing] = useState<FaqItem|null>(null);
  const [confirmId, setConfirmId] = useState<string|null>(null);

  return (
    <div>
      <PageHeader title="ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط´ط§ط¦ط¹ط©" subtitle={`${faq.length} ط³ط¤ط§ظ„`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>ط¥ط¶ط§ظپط© ط³ط¤ط§ظ„</Button>}
      />
      <div className="space-y-3">
        {faq.map((f) => (
          <GlassCard key={f.id} padding="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-white">{f.question_ar}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color:tk.muted }}>{f.answer_ar}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge label={f.visible?"ط¸ط§ظ‡ط±":"ظ…ط®ظپظٹ"} variant={f.visible?"green":"gray"} />
                <Button size="xs" onClick={() => { setEditing(f); setModal("edit"); }}>طھط¹ط¯ظٹظ„</Button>
                <Button size="xs" variant="danger" onClick={() => setConfirmId(f.id)}>ط­ط°ظپ</Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"طھط¹ط¯ظٹظ„ ط§ظ„ط³ط¤ط§ظ„":"ط³ط¤ط§ظ„ ط¬ط¯ظٹط¯"}>
        <FaqForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteFaq(confirmId); toast("طھظ… ط§ظ„ط­ط°ظپ","error"); } }}
        title="ط­ط°ظپ ط§ظ„ط³ط¤ط§ظ„" message="ط³ظٹطھظ… ط­ط°ظپ ط§ظ„ط³ط¤ط§ظ„ ظ†ظ‡ط§ط¦ظٹط§ظ‹." danger />
    </div>
  );
}

// â”€â”€â”€ CATEGORIES PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CatForm({ initial, onClose }: { initial?: Category; onClose: () => void }) {
  const { addCategory, updateCategory } = useAdminStore();
  const [form, setForm] = useState<Omit<Category,"id">>(initial
    ? { slug:initial.slug, label_ar:initial.label_ar, label_en:initial.label_en, color:initial.color, order_index:initial.order_index }
    : { slug:"", label_ar:"", label_en:"", color:"#0a84ff", order_index:0 });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.label_ar.trim()) { toast("ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط§ط³ظ…","error"); return; }
    if (initial) { updateCategory(initial.id, form); toast("طھظ… ط§ظ„طھط­ط¯ظٹط«"); }
    else { addCategory(form); toast("طھظ… ط§ظ„ط¥ط¶ط§ظپط©"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="ط§ظ„ط§ط³ظ… (ط¹ط±ط¨ظٹ)" value={form.label_ar} onChange={(e) => set("label_ar", e.target.value)} />
        <Input label="Name (English)" value={form.label_en} onChange={(e) => set("label_en", e.target.value)} />
      </div>
      <Input label="Slug" value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g,"-"))} hint="ظٹط³طھط®ط¯ظ… ظپظٹ ط§ظ„ظپظ„طھط±ط© â€” ط£ط­ط±ظپ ط¥ظ†ط¬ظ„ظٹط²ظٹط© ظˆط´ط±ط·ط© ظپظ‚ط·" />
      <div className="flex items-center gap-3">
        <Input label="ط§ظ„ظ„ظˆظ†" type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="h-10 w-20" />
        <Input label="ط§ظ„ظ„ظˆظ† (hex)" value={form.color} onChange={(e) => set("color", e.target.value)} className="flex-1" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">ط¥ظ„ط؛ط§ط،</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "ط­ظپط¸" : "ط¥ط¶ط§ظپط©"}</Button>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { categories, deleteCategory } = useAdminStore();
  const [modal, setModal] = useState<"new"|"edit"|false>(false);
  const [editing, setEditing] = useState<Category|null>(null);
  const [confirmId, setConfirmId] = useState<string|null>(null);

  return (
    <div>
      <PageHeader title="ط§ظ„طھطµظ†ظٹظپط§طھ" subtitle={`${categories.length} طھطµظ†ظٹظپ`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>ط¥ط¶ط§ظپط© طھطµظ†ظٹظپ</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <GlassCard key={c.id} padding="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full shrink-0" style={{ background:c.color, boxShadow:`0 0 12px ${c.color}55` }} />
                <div>
                  <p className="text-[13.5px] font-bold text-white">{c.label_ar}</p>
                  <p className="text-[11px]" style={{ color:tk.muted }}>{c.label_en} آ· /{c.slug}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button size="xs" onClick={() => { setEditing(c); setModal("edit"); }}>طھط¹ط¯ظٹظ„</Button>
                <Button size="xs" variant="danger" onClick={() => setConfirmId(c.id)}>ط­ط°ظپ</Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"طھط¹ط¯ظٹظ„ ط§ظ„طھطµظ†ظٹظپ":"طھطµظ†ظٹظپ ط¬ط¯ظٹط¯"}>
        <CatForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteCategory(confirmId); toast("طھظ… ط§ظ„ط­ط°ظپ","error"); } }}
        title="ط­ط°ظپ ط§ظ„طھطµظ†ظٹظپ" message="ط³ظٹطھظ… ط­ط°ظپ ط§ظ„طھطµظ†ظٹظپ ظ†ظ‡ط§ط¦ظٹط§ظ‹." danger />
    </div>
  );
}

// â”€â”€â”€ SEO PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function SeoPage() {
  const { seo, updateSeo } = useAdminStore();
  const [editing, setEditing] = useState<SeoConfig>(seo[0] ?? { id:"", page:"home", title_ar:"", title_en:"", description_ar:"", description_en:"", keywords:[], twitter_card:"summary_large_image", robots:"index, follow", updatedAt:"" });
  const [saved, setSaved] = useState(false);
  const pages = ["home","about","services","work","contact"];

  const set = <K extends keyof SeoConfig>(k: K, v: SeoConfig[K]) =>
    setEditing((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    updateSeo(editing.page, editing);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast("طھظ… ط­ظپط¸ ط¥ط¹ط¯ط§ط¯ط§طھ SEO");
  };

  return (
    <div>
      <PageHeader title="ط¥ط¯ط§ط±ط© SEO" subtitle="طھط­ط³ظٹظ† ظ…ط­ط±ظƒط§طھ ط§ظ„ط¨ط­ط« ظ„ط¬ظ…ظٹط¹ طµظپط­ط§طھ ط§ظ„ظ…ظˆظ‚ط¹"
        actions={<Button variant="primary" onClick={handleSave}>{saved?"âœ“ طھظ… ط§ظ„ط­ظپط¸":"ط­ظپط¸"}</Button>}
      />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="space-y-1">
          {pages.map((p) => (
            <button key={p} onClick={() => {
              const existing = seo.find((s) => s.page===p);
              if (existing) setEditing(existing);
              else setEditing({ id:"", page:p, title_ar:"", title_en:"", description_ar:"", description_en:"", keywords:[], twitter_card:"summary_large_image", robots:"index, follow", updatedAt:"" });
            }}
              className="w-full rounded-xl px-4 py-2.5 text-right text-[13px] font-semibold transition-all"
              style={editing.page===p ? { background:`${tk.blue}18`, color:tk.blue } : { color:tk.muted }}>
              /{p}
            </button>
          ))}
        </div>
        <GlassCard padding="p-6" className="space-y-4">
          <Input label="Meta Title (ط¹ط±ط¨ظٹ)" value={editing.title_ar} onChange={(e) => set("title_ar", e.target.value)} hint={`${editing.title_ar.length}/60 ط­ط±ظپ`} />
          <Input label="Meta Title (English)" value={editing.title_en} onChange={(e) => set("title_en", e.target.value)} hint={`${editing.title_en.length}/60 chars`} />
          <Textarea label="Meta Description (ط¹ط±ط¨ظٹ)" rows={3} value={editing.description_ar} onChange={(e) => set("description_ar", e.target.value)} />
          <Textarea label="Meta Description (English)" rows={3} value={editing.description_en} onChange={(e) => set("description_en", e.target.value)} />
          <Input label="Keywords (ظ…ظپطµظˆظ„ط© ط¨ظپط§طµظ„ط©)" value={editing.keywords.join(",")} onChange={(e) => set("keywords", e.target.value.split(",").map((k) => k.trim()))} />
          <Input label="OG Title" value={editing.og_title??""} onChange={(e) => set("og_title", e.target.value)} />
          <Input label="OG Image URL" value={editing.og_image??""} onChange={(e) => set("og_image", e.target.value)} placeholder="https://â€¦" />
          <Input label="Canonical URL" value={editing.canonical??""} onChange={(e) => set("canonical", e.target.value)} placeholder="https://yourmark.studio/â€¦" />
          <Input label="Robots" value={editing.robots} onChange={(e) => set("robots", e.target.value)} placeholder="index, follow" />
        </GlassCard>
      </div>
    </div>
  );
}

function fmtSize(b: number) { return b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`; }

export function BackupPage() {
  const { backups, createBackup, deleteBackup } = useAdminStore();
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string|null>(null);

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1500));
    createBackup(`ظ†ط³ط® ظٹط¯ظˆظٹ â€” ${new Date().toLocaleDateString("ar-SA")}`);
    setCreating(false);
    toast("طھظ… ط¥ظ†ط´ط§ط، ط§ظ„ظ†ط³ط®ط© ط§ظ„ط§ط­طھظٹط§ط·ظٹط© ط¨ظ†ط¬ط§ط­");
  };

  return (
    <div>
      <PageHeader title="ط§ظ„ظ†ط³ط® ط§ظ„ط§ط­طھظٹط§ط·ظٹط©" subtitle={`${backups.length} ظ†ط³ط®ط© ظ…ط­ظپظˆط¸ط©`}
        actions={<Button variant="primary" loading={creating} onClick={handleCreate}
          icon={!creating && <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}>
          {creating ? "ط¬ط§ط±ظچ ط§ظ„ط¥ظ†ط´ط§ط،â€¦" : "ط¥ظ†ط´ط§ط، ظ†ط³ط®ط©"}
        </Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { title:"ط¢ط®ط± ظ†ط³ط®ط©", value: backups[0] ? new Date(backups[0].createdAt).toLocaleDateString("ar-SA") : "â€”", color:tk.green },
          { title:"ط¹ط¯ط¯ ط§ظ„ظ†ط³ط®", value: backups.length, color:tk.blue },
          { title:"ط§ظ„ط­ط¬ظ… ط§ظ„ظƒظ„ظٹ", value: fmtSize(backups.reduce((a,b) => a+b.size,0)), color:tk.purple },
        ].map((s) => (
          <GlassCard key={s.title} padding="p-5">
            <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color:tk.muted }}>{s.title}</p>
            <p className="mt-2 text-[24px] font-black" style={{ color:s.color }}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-3">
        {backups.map((b) => (
          <GlassCard key={b.id} padding="p-4">
            <div className="flex items-center gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: b.type==="auto" ? `${tk.blue}18` : `${tk.purple}18`, color: b.type==="auto" ? tk.blue : tk.purple }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-white">{b.label}</p>
                <p className="text-[11.5px]" style={{ color:tk.muted }}>
                  {fmtSize(b.size)} آ· {new Date(b.createdAt).toLocaleString("ar-SA")}
                </p>
              </div>
              <Badge label={b.type==="auto"?"طھظ„ظ‚ط§ط¦ظٹ":"ظٹط¯ظˆظٹ"} variant={b.type==="auto"?"blue":"purple"} />
              <div className="flex gap-2">
                <Button size="xs">ط§ط³طھط¹ط§ط¯ط©</Button>
                <Button size="xs" variant="danger" onClick={() => setConfirmId(b.id)}>ط­ط°ظپ</Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteBackup(confirmId); toast("طھظ… ط­ط°ظپ ط§ظ„ظ†ط³ط®ط©","error"); } }}
        title="ط­ط°ظپ ط§ظ„ظ†ط³ط®ط© ط§ظ„ط§ط­طھظٹط§ط·ظٹط©" message="ظ„ط§ ظٹظ…ظƒظ† ط§ظ„طھط±ط§ط¬ط¹ ط¹ظ† ظ‡ط°ط§ ط§ظ„ط¥ط¬ط±ط§ط،." danger />
    </div>
  );
}

// â”€â”€â”€ CONTENT PAGE â€” Hero / About / CTA text + Clients (all DB-backed) â”€â”€â”€â”€â”€â”€â”€â”€
const BLOCK_FIELDS: Record<string, { key: string; label: string; area?: boolean }[]> = {
  hero: [
    { key: "badge", label: "ط´ط±ظٹط· ط§ظ„طھطµظ†ظٹظپ (Badge)" },
    { key: "title1", label: "ط§ظ„ط¹ظ†ظˆط§ظ† â€” ط§ظ„ط³ط·ط± ط§ظ„ط£ظˆظ„" },
    { key: "title2", label: "ط§ظ„ط¹ظ†ظˆط§ظ† â€” ط§ظ„ط³ط·ط± ط§ظ„ط«ط§ظ†ظٹ (ظ…ظ…ظٹظ‘ط²)" },
    { key: "desc", label: "ط§ظ„ظˆطµظپ", area: true },
    { key: "cta1", label: "ط²ط± ط§ظ„ط¥ط¬ط±ط§ط، ط§ظ„ط£ط³ط§ط³ظٹ" },
    { key: "cta2", label: "ط²ط± ط§ظ„ط¥ط¬ط±ط§ط، ط§ظ„ط«ط§ظ†ظˆظٹ" },
  ],
  about: [
    { key: "kicker", label: "ط§ظ„ط¹ظ†ظˆط§ظ† ط§ظ„طµط؛ظٹط± (Kicker)" },
    { key: "title", label: "ط§ظ„ط¹ظ†ظˆط§ظ† ط§ظ„ط±ط¦ظٹط³ظٹ" },
    { key: "p1", label: "ط§ظ„ظپظ‚ط±ط© ط§ظ„ط£ظˆظ„ظ‰", area: true },
    { key: "p2", label: "ط§ظ„ظپظ‚ط±ط© ط§ظ„ط«ط§ظ†ظٹط©", area: true },
  ],
  cta: [
    { key: "title", label: "ط§ظ„ط¹ظ†ظˆط§ظ†" },
    { key: "sub", label: "ط§ظ„ظˆطµظپ", area: true },
    { key: "btn", label: "ظ†طµ ط§ظ„ط²ط±" },
  ],
};

export function ContentPageV1() {
  const blocks = useAdminStore((s) => s.blocks);
  const updateBlock = useAdminStore((s) => s.updateBlock);
  const clients = useAdminStore((s) => s.clients);
  const addClient = useAdminStore((s) => s.addClient);
  const updateClient = useAdminStore((s) => s.updateClient);
  const deleteClient = useAdminStore((s) => s.deleteClient);

  const [tab, setTab] = useState("hero");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [saved, setSaved] = useState(false);

  const fields = BLOCK_FIELDS[tab] ?? [];
  const block = blocks.find((b) => b.block_key === tab);
  const data = ((lang === "ar" ? block?.data_ar : block?.data_en) ?? {}) as Record<string, string>;

  const saveField = (key: string, value: string) => {
    updateBlock(tab, lang, { [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط­طھظˆظ‰ ط§ظ„ظ†طµظٹ"
        subtitle="ظ†طµظˆطµ Hero ظˆAbout ظˆCTA ظˆط§ظ„ط¹ظ…ظ„ط§ط، â€” طھظڈط­ظپط¸ ظپظٹ ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ظˆطھط¸ظ‡ط± ظپظˆط±ظ‹ط§ ط¹ظ„ظ‰ ط§ظ„ظ…ظˆظ‚ط¹"
        actions={saved ? <Badge variant="green" label="âœ“ طھظ… ط§ظ„ط­ظپط¸" /> : undefined}
      />

      <Tabs
        tabs={[
          { id: "hero", label: "Hero" }, { id: "about", label: "ظ…ظ† ظ†ط­ظ†" },
          { id: "cta", label: "CTA" }, { id: "clients", label: "ط§ظ„ط¹ظ…ظ„ط§ط،" },
        ]}
        active={tab} onChange={setTab}
      />

      {tab !== "clients" ? (
        <GlassCard padding="p-6" className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: tk.muted }}>ظ„ط؛ط© ط§ظ„طھط­ط±ظٹط±</p>
            <div className="flex rounded-xl p-0.5" style={{ background: tk.bg, border: `1px solid ${tk.border}` }}>
              {(["ar", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className="rounded-[9px] px-4 py-1.5 text-[12px] font-bold transition-all"
                  style={lang === l ? { background: tk.glassStr, color: tk.blue } : { color: tk.muted }}>
                  {l === "ar" ? "ط§ظ„ط¹ط±ط¨ظٹط©" : "English"}
                </button>
              ))}
            </div>
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-[11.5px] font-bold" style={{ color: tk.muted }}>{f.label}</label>
              {f.area ? (
                <Textarea value={data[f.key] ?? ""} onChange={(e) => saveField(f.key, e.target.value)} rows={3} />
              ) : (
                <Input value={data[f.key] ?? ""} onChange={(e) => saveField(f.key, e.target.value)} />
              )}
            </div>
          ))}
        </GlassCard>
      ) : (
        <ClientsEditor clients={clients} addClient={addClient} updateClient={updateClient} deleteClient={deleteClient} />
      )}
    </div>
  );
}

function ClientsEditor({
  clients, addClient, updateClient, deleteClient,
}: {
  clients: import("../../types").Client[];
  addClient: (c: Omit<import("../../types").Client, "id">) => void;
  updateClient: (id: string, c: Partial<import("../../types").Client>) => void;
  deleteClient: (id: string) => void;
}) {
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const add = () => {
    if (!nameAr.trim() && !nameEn.trim()) return;
    addClient({ name_ar: nameAr, name_en: nameEn || nameAr, logo_url: logoUrl, order_index: clients.length, visible: true });
    setNameAr(""); setNameEn(""); setLogoUrl("");
    toast("طھظ…طھ ط¥ط¶ط§ظپط© ط§ظ„ط¹ظ…ظٹظ„");
  };

  return (
    <div className="max-w-2xl space-y-4">
      <GlassCard padding="p-5" className="space-y-3">
        <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: tk.muted }}>ط¥ط¶ط§ظپط© ط¹ظ…ظٹظ„ ط¬ط¯ظٹط¯</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="ط§ظ„ط§ط³ظ… (ط¹ط±ط¨ظٹ)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          <Input placeholder="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>
        <Input placeholder="ط±ط§ط¨ط· ط§ظ„ط´ط¹ط§ط± (ط§ط®طھظٹط§ط±ظٹ)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        <Button variant="primary" onClick={add}>+ ط¥ط¶ط§ظپط©</Button>
      </GlassCard>

      <div className="space-y-2">
        {clients.map((cl) => (
          <GlassCard key={cl.id} padding="p-4" className="flex items-center gap-3">
            {cl.logo_url ? (
              <img src={cl.logo_url} alt="" className="h-9 w-9 rounded-xl object-contain" style={{ background: tk.bg }} />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-xl text-[13px] font-black text-white" style={{ background: "linear-gradient(135deg,#0a84ff,#1e3a8a)" }}>
                {(cl.name_ar || cl.name_en).charAt(0)}
              </span>
            )}
            <div className="flex-1">
              <Input value={cl.name_ar} onChange={(e) => updateClient(cl.id, { name_ar: e.target.value })} placeholder="ط¹ط±ط¨ظٹ" />
            </div>
            <div className="flex-1">
              <Input value={cl.name_en} onChange={(e) => updateClient(cl.id, { name_en: e.target.value })} placeholder="English" />
            </div>
            <button onClick={() => { deleteClient(cl.id); toast("طھظ… ط§ظ„ط­ط°ظپ", "error"); }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors hover:bg-[var(--adm-hover-bg)]" style={{ color: tk.red }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
            </button>
          </GlassCard>
        ))}
        {clients.length === 0 && <p className="py-8 text-center text-[12.5px]" style={{ color: tk.muted }}>ظ„ط§ ظٹظˆط¬ط¯ ط¹ظ…ظ„ط§ط، ط¨ط¹ط¯</p>}
      </div>
    </div>
  );
}

