/**
 * Consolidated secondary admin pages:
 * Analytics, Services, Testimonials, FAQ, Categories, SEO, Backup, Content
 */
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAdminStore, useDashboardStats } from "../../store/useAdminStore";
import type { Category, FaqItem, SeoConfig, Service, Testimonial } from "../../types";
import {
  Badge, Button, ConfirmDialog, GlassCard, Input, Modal, PageHeader,
  StatCard, Tabs, Textarea, Toggle, tk, toast,
} from "../../components/ui";

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const stats = useDashboardStats();
  const { visitsByDay, topPages, deviceBreakdown, visitsByCountry } = stats.analytics;

  return (
    <div className="space-y-6">
      <PageHeader title="التحليلات" subtitle="أداء الموقع وسلوك الزوار" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="إجمالي الزوار"    value={stats.analytics.totalVisitors.toLocaleString("ar-SA")} color={tk.blue}   icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>} />
        <StatCard label="زوار فريدون"      value={stats.analytics.uniqueVisitors.toLocaleString("ar-SA")} color={tk.purple} icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>} />
        <StatCard label="مشاهدات الصفحات" value={stats.analytics.pageViews.toLocaleString("ar-SA")} color={tk.green}  icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>} />
        <StatCard label="معدل الارتداد"    value={`${stats.analytics.bounceRate}%`} color={tk.amber}  icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18M7 16l4-8 4 4 2-4" /></svg>} />
        <StatCard label="متوسط الجلسة"    value={stats.analytics.avgSession} color={tk.blue}   icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard padding="p-6">
          <p className="mb-4 text-[14px] font-black text-white">الزيارات اليومية</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={visitsByDay}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tk.blue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={tk.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill:tk.faint, fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:tk.faint, fontSize:10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background:"var(--adm-pop)", border:`1px solid ${tk.border}`, borderRadius:12, color:"var(--adm-text)", fontSize:12 }} cursor={{ stroke:tk.blue, strokeDasharray:"4 4" }} />
              <Area type="monotone" dataKey="visits" stroke={tk.blue} strokeWidth={2} fill="url(#ag)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard padding="p-6">
          <p className="mb-4 text-[14px] font-black text-white">أكثر الصفحات زيارة</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topPages} layout="vertical">
              <XAxis type="number" tick={{ fill:tk.faint, fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="page" type="category" tick={{ fill:tk.muted, fontSize:11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background:"var(--adm-pop)", border:`1px solid ${tk.border}`, borderRadius:12, color:"var(--adm-text)", fontSize:12 }} cursor={{ fill:"var(--adm-hover-bg)" }} />
              <Bar dataKey="views" fill={tk.blue} radius={[0,8,8,0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black text-white">حسب الدولة</p>
          {visitsByCountry.map((c) => (
            <div key={c.country} className="mb-3 flex items-center gap-3">
              <span className="text-xl leading-none">{c.flag}</span>
              <div className="flex-1">
                <div className="mb-1 flex justify-between">
                  <span className="text-[12.5px]" style={{ color: tk.text }}>{c.country}</span>
                  <span className="text-[11.5px]" style={{ color:tk.muted }}>{c.visits.toLocaleString()}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background:"rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width:`${(c.visits/6240)*100}%`, background:`linear-gradient(90deg,${tk.blue},${tk.purple})` }} />
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
        <GlassCard padding="p-5">
          <p className="mb-4 text-[14px] font-black text-white">نوع الجهاز</p>
          {deviceBreakdown.map((d, i) => (
            <div key={d.device} className="mb-3 flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl text-[10px] font-black text-white shrink-0"
                style={{ background:[tk.blue,tk.purple,tk.amber][i%3] }}>{d.device[0]}</div>
              <div className="flex-1">
                <div className="mb-1 flex justify-between">
                  <span className="text-[12.5px]" style={{ color: tk.text }}>{d.device}</span>
                  <span className="text-[11.5px] font-bold" style={{ color:tk.muted }}>{d.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background:"rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width:`${d.pct}%`, background:[tk.blue,tk.purple,tk.amber][i%3] }} />
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

// ─── SERVICES PAGE ────────────────────────────────────────────────────────────
function ServiceForm({ initial, onClose }: { initial?: Service; onClose: () => void }) {
  const { addService, updateService } = useAdminStore();
  const [form, setForm] = useState<Omit<Service,"id">>(initial ? { ...initial } : { title_ar:"", title_en:"", desc_ar:"", desc_en:"", icon:"", order_index:0, visible:true });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.title_ar.trim()) { toast("يرجى إدخال العنوان","error"); return; }
    if (initial) { updateService(initial.id, form); toast("تم تحديث الخدمة"); }
    else { addService(form); toast("تم إضافة الخدمة"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <Input label="العنوان (عربي)" value={form.title_ar} onChange={(e) => set("title_ar", e.target.value)} />
      <Input label="Title (English)" value={form.title_en} onChange={(e) => set("title_en", e.target.value)} />
      <Textarea label="الوصف (عربي)" rows={3} value={form.desc_ar} onChange={(e) => set("desc_ar", e.target.value)} />
      <Textarea label="Description (English)" rows={3} value={form.desc_en} onChange={(e) => set("desc_en", e.target.value)} />
      <Input label="الترتيب" type="number" value={String(form.order_index)} onChange={(e) => set("order_index", Number(e.target.value))} />
      <Toggle checked={form.visible} onChange={(v) => set("visible", v)} label="ظاهرة في الموقع" />
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">إلغاء</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "حفظ" : "إضافة"}</Button>
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
      <PageHeader title="إدارة الخدمات" subtitle={`${services.length} خدمة`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>إضافة خدمة</Button>}
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
              <Button size="xs" className="flex-1" onClick={() => { setEditing(s); setModal("edit"); }}>تعديل</Button>
              <Button size="xs" variant="danger" onClick={() => setConfirmId(s.id)}>حذف</Button>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"تعديل الخدمة":"خدمة جديدة"}>
        <ServiceForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteService(confirmId); toast("تم الحذف","error"); } }}
        title="حذف الخدمة" message="سيتم حذف الخدمة نهائياً." danger />
    </div>
  );
}

// ─── TESTIMONIALS PAGE ────────────────────────────────────────────────────────
function TestimonialForm({ initial, onClose }: { initial?: Testimonial; onClose: () => void }) {
  const { addTestimonial, updateTestimonial } = useAdminStore();
  const [form, setForm] = useState<Omit<Testimonial,"id"|"createdAt">>(initial
    ? { name:initial.name, company:initial.company, role:initial.role, avatar:initial.avatar, text_ar:initial.text_ar, text_en:initial.text_en, rating:initial.rating, visible:initial.visible, order_index:initial.order_index }
    : { name:"", company:"", role:"", avatar:"", text_ar:"", text_en:"", rating:5, visible:true, order_index:0 });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.name.trim()) { toast("يرجى إدخال الاسم","error"); return; }
    if (initial) { updateTestimonial(initial.id, form); toast("تم التحديث"); }
    else { addTestimonial(form); toast("تم الإضافة"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="الاسم" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Input label="الشركة" value={form.company} onChange={(e) => set("company", e.target.value)} />
        <Input label="المنصب" value={form.role} onChange={(e) => set("role", e.target.value)} />
        <Input label="التقييم (1-5)" type="number" value={String(form.rating)} onChange={(e) => set("rating", Math.min(5, Math.max(1, Number(e.target.value))))} />
      </div>
      <Input label="رابط الصورة الشخصية" value={form.avatar??""} onChange={(e) => set("avatar", e.target.value)} placeholder="https://…" />
      <Textarea label="الرأي (عربي)" rows={3} value={form.text_ar} onChange={(e) => set("text_ar", e.target.value)} />
      <Textarea label="Testimonial (English)" rows={3} value={form.text_en} onChange={(e) => set("text_en", e.target.value)} />
      <Toggle checked={form.visible} onChange={(v) => set("visible", v)} label="ظاهر في الموقع" />
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">إلغاء</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "حفظ" : "إضافة"}</Button>
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
      <PageHeader title="آراء العملاء" subtitle={`${testimonials.length} رأي`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>إضافة رأي</Button>}
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
              <Button size="xs" className="flex-1" onClick={() => { setEditing(t); setModal("edit"); }}>تعديل</Button>
              <Button size="xs" variant="danger" onClick={() => setConfirmId(t.id)}>حذف</Button>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"تعديل الرأي":"رأي جديد"}>
        <TestimonialForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteTestimonial(confirmId); toast("تم الحذف","error"); } }}
        title="حذف الرأي" message="سيتم حذف الرأي نهائياً." danger />
    </div>
  );
}

// ─── FAQ PAGE ─────────────────────────────────────────────────────────────────
function FaqForm({ initial, onClose }: { initial?: FaqItem; onClose: () => void }) {
  const { addFaq, updateFaq } = useAdminStore();
  const [form, setForm] = useState<Omit<FaqItem,"id">>(initial
    ? { question_ar:initial.question_ar, question_en:initial.question_en, answer_ar:initial.answer_ar, answer_en:initial.answer_en, order_index:initial.order_index, visible:initial.visible }
    : { question_ar:"", question_en:"", answer_ar:"", answer_en:"", order_index:0, visible:true });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.question_ar.trim()) { toast("يرجى إدخال السؤال","error"); return; }
    if (initial) { updateFaq(initial.id, form); toast("تم التحديث"); }
    else { addFaq(form); toast("تم الإضافة"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <Tabs tabs={[{id:"ar",label:"عربي"},{id:"en",label:"English"}]} active="ar" onChange={() => {}} />
      <Input label="السؤال (عربي)" value={form.question_ar} onChange={(e) => set("question_ar", e.target.value)} />
      <Textarea label="الجواب (عربي)" rows={3} value={form.answer_ar} onChange={(e) => set("answer_ar", e.target.value)} />
      <Input label="Question (English)" value={form.question_en} onChange={(e) => set("question_en", e.target.value)} />
      <Textarea label="Answer (English)" rows={3} value={form.answer_en} onChange={(e) => set("answer_en", e.target.value)} />
      <Toggle checked={form.visible} onChange={(v) => set("visible", v)} label="ظاهر في الموقع" />
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">إلغاء</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "حفظ" : "إضافة"}</Button>
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
      <PageHeader title="الأسئلة الشائعة" subtitle={`${faq.length} سؤال`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>إضافة سؤال</Button>}
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
                <Badge label={f.visible?"ظاهر":"مخفي"} variant={f.visible?"green":"gray"} />
                <Button size="xs" onClick={() => { setEditing(f); setModal("edit"); }}>تعديل</Button>
                <Button size="xs" variant="danger" onClick={() => setConfirmId(f.id)}>حذف</Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"تعديل السؤال":"سؤال جديد"}>
        <FaqForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteFaq(confirmId); toast("تم الحذف","error"); } }}
        title="حذف السؤال" message="سيتم حذف السؤال نهائياً." danger />
    </div>
  );
}

// ─── CATEGORIES PAGE ──────────────────────────────────────────────────────────
function CatForm({ initial, onClose }: { initial?: Category; onClose: () => void }) {
  const { addCategory, updateCategory } = useAdminStore();
  const [form, setForm] = useState<Omit<Category,"id">>(initial
    ? { slug:initial.slug, label_ar:initial.label_ar, label_en:initial.label_en, color:initial.color, order_index:initial.order_index }
    : { slug:"", label_ar:"", label_en:"", color:"#0a84ff", order_index:0 });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((p) => ({ ...p, [k]:v }));

  const handleSave = () => {
    if (!form.label_ar.trim()) { toast("يرجى إدخال الاسم","error"); return; }
    if (initial) { updateCategory(initial.id, form); toast("تم التحديث"); }
    else { addCategory(form); toast("تم الإضافة"); }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="الاسم (عربي)" value={form.label_ar} onChange={(e) => set("label_ar", e.target.value)} />
        <Input label="Name (English)" value={form.label_en} onChange={(e) => set("label_en", e.target.value)} />
      </div>
      <Input label="Slug" value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g,"-"))} hint="يستخدم في الفلترة — أحرف إنجليزية وشرطة فقط" />
      <div className="flex items-center gap-3">
        <Input label="اللون" type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="h-10 w-20" />
        <Input label="اللون (hex)" value={form.color} onChange={(e) => set("color", e.target.value)} className="flex-1" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">إلغاء</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "حفظ" : "إضافة"}</Button>
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
      <PageHeader title="التصنيفات" subtitle={`${categories.length} تصنيف`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>إضافة تصنيف</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <GlassCard key={c.id} padding="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full shrink-0" style={{ background:c.color, boxShadow:`0 0 12px ${c.color}55` }} />
                <div>
                  <p className="text-[13.5px] font-bold text-white">{c.label_ar}</p>
                  <p className="text-[11px]" style={{ color:tk.muted }}>{c.label_en} · /{c.slug}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button size="xs" onClick={() => { setEditing(c); setModal("edit"); }}>تعديل</Button>
                <Button size="xs" variant="danger" onClick={() => setConfirmId(c.id)}>حذف</Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"تعديل التصنيف":"تصنيف جديد"}>
        <CatForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteCategory(confirmId); toast("تم الحذف","error"); } }}
        title="حذف التصنيف" message="سيتم حذف التصنيف نهائياً." danger />
    </div>
  );
}

// ─── SEO PAGE ─────────────────────────────────────────────────────────────────
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
    toast("تم حفظ إعدادات SEO");
  };

  return (
    <div>
      <PageHeader title="إدارة SEO" subtitle="تحسين محركات البحث لجميع صفحات الموقع"
        actions={<Button variant="primary" onClick={handleSave}>{saved?"✓ تم الحفظ":"حفظ"}</Button>}
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
          <Input label="Meta Title (عربي)" value={editing.title_ar} onChange={(e) => set("title_ar", e.target.value)} hint={`${editing.title_ar.length}/60 حرف`} />
          <Input label="Meta Title (English)" value={editing.title_en} onChange={(e) => set("title_en", e.target.value)} hint={`${editing.title_en.length}/60 chars`} />
          <Textarea label="Meta Description (عربي)" rows={3} value={editing.description_ar} onChange={(e) => set("description_ar", e.target.value)} />
          <Textarea label="Meta Description (English)" rows={3} value={editing.description_en} onChange={(e) => set("description_en", e.target.value)} />
          <Input label="Keywords (مفصولة بفاصلة)" value={editing.keywords.join(",")} onChange={(e) => set("keywords", e.target.value.split(",").map((k) => k.trim()))} />
          <Input label="OG Title" value={editing.og_title??""} onChange={(e) => set("og_title", e.target.value)} />
          <Input label="OG Image URL" value={editing.og_image??""} onChange={(e) => set("og_image", e.target.value)} placeholder="https://…" />
          <Input label="Canonical URL" value={editing.canonical??""} onChange={(e) => set("canonical", e.target.value)} placeholder="https://yourmark.studio/…" />
          <Input label="Robots" value={editing.robots} onChange={(e) => set("robots", e.target.value)} placeholder="index, follow" />
        </GlassCard>
      </div>
    </div>
  );
}

// ─── BACKUP PAGE ──────────────────────────────────────────────────────────────
function fmtSize(b: number) { return b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`; }

export function BackupPage() {
  const { backups, createBackup, deleteBackup } = useAdminStore();
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string|null>(null);

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1500));
    createBackup(`نسخ يدوي — ${new Date().toLocaleDateString("ar-SA")}`);
    setCreating(false);
    toast("تم إنشاء النسخة الاحتياطية بنجاح");
  };

  return (
    <div>
      <PageHeader title="النسخ الاحتياطية" subtitle={`${backups.length} نسخة محفوظة`}
        actions={<Button variant="primary" loading={creating} onClick={handleCreate}
          icon={!creating && <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}>
          {creating ? "جارٍ الإنشاء…" : "إنشاء نسخة"}
        </Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { title:"آخر نسخة", value: backups[0] ? new Date(backups[0].createdAt).toLocaleDateString("ar-SA") : "—", color:tk.green },
          { title:"عدد النسخ", value: backups.length, color:tk.blue },
          { title:"الحجم الكلي", value: fmtSize(backups.reduce((a,b) => a+b.size,0)), color:tk.purple },
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
                  {fmtSize(b.size)} · {new Date(b.createdAt).toLocaleString("ar-SA")}
                </p>
              </div>
              <Badge label={b.type==="auto"?"تلقائي":"يدوي"} variant={b.type==="auto"?"blue":"purple"} />
              <div className="flex gap-2">
                <Button size="xs">استعادة</Button>
                <Button size="xs" variant="danger" onClick={() => setConfirmId(b.id)}>حذف</Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteBackup(confirmId); toast("تم حذف النسخة","error"); } }}
        title="حذف النسخة الاحتياطية" message="لا يمكن التراجع عن هذا الإجراء." danger />
    </div>
  );
}

// ─── CONTENT PAGE — Hero / About / CTA text + Clients (all DB-backed) ────────
const BLOCK_FIELDS: Record<string, { key: string; label: string; area?: boolean }[]> = {
  hero: [
    { key: "badge", label: "شريط التصنيف (Badge)" },
    { key: "title1", label: "العنوان — السطر الأول" },
    { key: "title2", label: "العنوان — السطر الثاني (مميّز)" },
    { key: "desc", label: "الوصف", area: true },
    { key: "cta1", label: "زر الإجراء الأساسي" },
    { key: "cta2", label: "زر الإجراء الثانوي" },
  ],
  about: [
    { key: "kicker", label: "العنوان الصغير (Kicker)" },
    { key: "title", label: "العنوان الرئيسي" },
    { key: "p1", label: "الفقرة الأولى", area: true },
    { key: "p2", label: "الفقرة الثانية", area: true },
  ],
  cta: [
    { key: "title", label: "العنوان" },
    { key: "sub", label: "الوصف", area: true },
    { key: "btn", label: "نص الزر" },
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
        title="إدارة المحتوى النصي"
        subtitle="نصوص Hero وAbout وCTA والعملاء — تُحفظ في قاعدة البيانات وتظهر فورًا على الموقع"
        actions={saved ? <Badge variant="green" label="✓ تم الحفظ" /> : undefined}
      />

      <Tabs
        tabs={[
          { id: "hero", label: "Hero" }, { id: "about", label: "من نحن" },
          { id: "cta", label: "CTA" }, { id: "clients", label: "العملاء" },
        ]}
        active={tab} onChange={setTab}
      />

      {tab !== "clients" ? (
        <GlassCard padding="p-6" className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: tk.muted }}>لغة التحرير</p>
            <div className="flex rounded-xl p-0.5" style={{ background: tk.bg, border: `1px solid ${tk.border}` }}>
              {(["ar", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className="rounded-[9px] px-4 py-1.5 text-[12px] font-bold transition-all"
                  style={lang === l ? { background: tk.glassStr, color: tk.blue } : { color: tk.muted }}>
                  {l === "ar" ? "العربية" : "English"}
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
    toast("تمت إضافة العميل");
  };

  return (
    <div className="max-w-2xl space-y-4">
      <GlassCard padding="p-5" className="space-y-3">
        <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: tk.muted }}>إضافة عميل جديد</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="الاسم (عربي)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          <Input placeholder="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>
        <Input placeholder="رابط الشعار (اختياري)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        <Button variant="primary" onClick={add}>+ إضافة</Button>
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
              <Input value={cl.name_ar} onChange={(e) => updateClient(cl.id, { name_ar: e.target.value })} placeholder="عربي" />
            </div>
            <div className="flex-1">
              <Input value={cl.name_en} onChange={(e) => updateClient(cl.id, { name_en: e.target.value })} placeholder="English" />
            </div>
            <button onClick={() => { deleteClient(cl.id); toast("تم الحذف", "error"); }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors hover:bg-[var(--adm-hover-bg)]" style={{ color: tk.red }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
            </button>
          </GlassCard>
        ))}
        {clients.length === 0 && <p className="py-8 text-center text-[12.5px]" style={{ color: tk.muted }}>لا يوجد عملاء بعد</p>}
      </div>
    </div>
  );
}
