import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useAdminStore } from "../../store/useAdminStore";
import { dbMedia } from "../../../lib/cms/db";
import type { Project, ProjectStatus } from "../../types";
import {
  Badge, Button, ConfirmDialog, EmptyState, GlassCard,
  Input, Modal, PageHeader, Pagination, SearchInput, Select,
  Tabs, Textarea, Toggle, tk, toast,
} from "../../components/ui";

const PER_PAGE = 9;

type StatusBadge = { label: string; variant: "green" | "blue" | "gray" };
const STATUS_MAP: Record<ProjectStatus, StatusBadge> = {
  published: { label:"منشور", variant:"green" },
  draft:     { label:"مسودة",  variant:"blue" },
  archived:  { label:"مؤرشف", variant:"gray" },
};

// ─── Image Drop Zone ──────────────────────────────────────────────────────────
/** Translate a Storage/DB failure into a readable Arabic message */
function uploadError(e: unknown): string {
  const raw = (e as { message?: string; error?: string; statusCode?: string }) ?? {};
  const msg = (raw.message || raw.error || "").toLowerCase();
  if (msg.includes("bucket") && msg.includes("not found")) return "حاوية التخزين media غير موجودة — نفّذ schema.sql";
  if (msg.includes("row-level") || msg.includes("permission") || msg.includes("security")) return "لا تملك صلاحية الرفع إلى Storage (تحقق من سياسات Bucket)";
  if (msg.includes("payload") || msg.includes("exceeded") || msg.includes("too large")) return "حجم الملف يتجاوز الحد المسموح";
  if (msg.includes("fetch") || msg.includes("network")) return "تعذّر الاتصال بخادم التخزين";
  return raw.message || raw.error || "فشل رفع الملف";
}

function ImageDropZone({ onUpload }: { onUpload: (urls: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] }, maxFiles: 10,
    onDrop: async (files) => {
      setBusy(true);
      const urls: string[] = [];
      let failed = 0;
      for (let i = 0; i < files.length; i++) {
        try {
          // Upload straight to Supabase Storage — DB is the source of truth
          const { url } = await dbMedia.upload(files[i], "projects");
          urls.push(url);
        } catch (e) {
          failed++;
          console.error("[upload]", e);
          toast(`فشل رفع: ${files[i].name}`, "error", uploadError(e));
        }
        setProgress(Math.round(((i+1)/files.length)*100));
      }
      if (urls.length > 0) {
        onUpload(urls);
        if (failed === 0) toast(`تم رفع ${urls.length} صورة إلى التخزين السحابي`);
      }
      setBusy(false); setProgress(0);
    },
  });

  return (
    <div {...getRootProps()} className="cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all"
      style={{ borderColor: isDragActive ? tk.blue : tk.border, background: isDragActive ? `${tk.blue}0d` : tk.bg }}>
      <input {...getInputProps()} />
      {busy ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-1.5 w-40 overflow-hidden rounded-full" style={{ background:"var(--adm-border)" }}>
            <div className="h-full rounded-full transition-all" style={{ width:`${progress}%`, background:`linear-gradient(90deg,${tk.blue},${tk.purple})` }} />
          </div>
          <p className="text-[13px]" style={{ color:tk.muted }}>رفع… {progress}%</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" style={{ color:tk.faint }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-[13px]" style={{ color:tk.muted }}>اسحب صوراً هنا أو انقر</p>
          <p className="text-[11px]" style={{ color:tk.faint }}>PNG · JPG · WebP — حتى 10 صور</p>
        </div>
      )}
    </div>
  );
}

// ─── Cover uploader — single file, instant preview, real errors ──────────────
function CoverUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] }, maxFiles: 1,
    onDrop: async (files) => {
      if (!files.length) return;
      setBusy(true); setPct(30);
      try {
        const { url } = await dbMedia.upload(files[0], "covers");
        setPct(100);
        onChange(url);
        toast("تم رفع صورة الغلاف");
      } catch (e) {
        console.error("[cover]", e);
        toast("فشل رفع صورة الغلاف", "error", uploadError(e));
      }
      setBusy(false); setPct(0);
    },
  });

  return (
    <div>
      <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-widest" style={{ color: tk.muted }}>صورة الغلاف</p>
      {value ? (
        <div className="group relative overflow-hidden rounded-2xl" style={{ border: `1px solid ${tk.border}` }}>
          <img src={value} alt="cover" className="h-44 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" {...getRootProps({ onClick: (e) => e.stopPropagation() })}
              className="rounded-xl px-4 py-2 text-[12px] font-bold text-white" style={{ background: tk.blue }}>
              <input {...getInputProps()} /> استبدال
            </button>
            <button type="button" onClick={() => onChange("")}
              className="rounded-xl px-4 py-2 text-[12px] font-bold" style={{ background: "rgba(239,68,68,0.85)", color: "white" }}>
              إزالة
            </button>
          </div>
        </div>
      ) : (
        <div {...getRootProps()} className="cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all"
          style={{ borderColor: isDragActive ? tk.blue : tk.border, background: isDragActive ? `${tk.blue}0d` : tk.bg }}>
          <input {...getInputProps()} />
          {busy ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-1.5 w-36 overflow-hidden rounded-full" style={{ background: "var(--adm-border)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${tk.blue},${tk.purple})` }} />
              </div>
              <p className="text-[12px]" style={{ color: tk.muted }}>جارٍ رفع الغلاف…</p>
            </div>
          ) : (
            <p className="text-[12.5px]" style={{ color: tk.muted }}>اسحب صورة الغلاف هنا أو انقر للاختيار</p>
          )}
        </div>
      )}
      <div className="mt-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="…أو الصق رابط صورة مباشرة" />
      </div>
    </div>
  );
}

// ─── Project Form ──────────────────────────────────────────────────────────────
const DEFAULT: Omit<Project, "id"|"createdAt"|"updatedAt"|"views"> = {
  title_ar:"", title_en:"", slug:"", type_ar:"", type_en:"",
  description_ar:"", description_en:"", client:"", year:String(new Date().getFullYear()),
  category:"identity", services:[], technologies:[], cover_url:"", images:[],
  video_url:"", project_url:"", colors:["#0a84ff"], featured:false,
  visible:true, status:"draft", order_index:0,
};

function ProjectForm({ initial, onClose }: { initial?: Partial<Project>; onClose: () => void }) {
  const { addProject, updateProject, categories } = useAdminStore();
  const [tab, setTab] = useState("ar");
  const [form, setForm] = useState<typeof DEFAULT>({ ...DEFAULT, ...initial });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof DEFAULT>(k: K, v: typeof DEFAULT[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (saving) return; // prevent double submit
    if (!form.title_ar.trim()) { toast("يرجى إدخال عنوان المشروع", "error"); return; }
    setSaving(true);
    const slug = form.slug || form.title_en.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `project-${Date.now()}`;
    try {
      if (initial?.id) {
        updateProject(initial.id, { ...form, slug });
        toast("تم حفظ التعديلات — تتم المزامنة مع قاعدة البيانات", "success");
      } else {
        addProject({ ...form, slug });
        toast("تمت إضافة المشروع — تتم المزامنة مع قاعدة البيانات", "success");
      }
      onClose();
    } catch (e) {
      // real Supabase errors surface via the store's fail() → toast with details
      toast("تعذّر حفظ المشروع", "error", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const catOpts = [{ value:"", label:"اختر التصنيف" }, ...categories.map((c) => ({ value:c.slug, label:c.label_ar }))];
  const statusOpts: { value: ProjectStatus; label: string }[] = [
    { value:"draft", label:"مسودة" },
    { value:"published", label:"منشور" },
    { value:"archived", label:"مؤرشف" },
  ];

  return (
    <div>
      <Tabs
        tabs={[
          { id:"ar", label:"عربي" },
          { id:"en", label:"English" },
          { id:"media", label:"الصور" },
          { id:"meta", label:"البيانات" },
          { id:"seo", label:"SEO" },
        ]}
        active={tab} onChange={setTab}
      />

      <div className="mt-5 space-y-4">
        {tab === "ar" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="العنوان *" value={form.title_ar} onChange={(e) => set("title_ar", e.target.value)} placeholder="اسم المشروع" />
            <Input label="نوع المشروع" value={form.type_ar} onChange={(e) => set("type_ar", e.target.value)} placeholder="هوية بصرية متكاملة" />
            <div className="sm:col-span-2">
              <Textarea label="الوصف" rows={4} value={form.description_ar} onChange={(e) => set("description_ar", e.target.value)} placeholder="وصف المشروع…" />
            </div>
          </div>
        )}

        {tab === "en" && (
          <div dir="ltr" className="grid gap-4 sm:grid-cols-2">
            <Input label="Title" value={form.title_en} onChange={(e) => set("title_en", e.target.value)} placeholder="Project name" />
            <Input label="Project type" value={form.type_en} onChange={(e) => set("type_en", e.target.value)} placeholder="Full brand identity" />
            <div className="sm:col-span-2">
              <Textarea label="Description" rows={4} value={form.description_en} onChange={(e) => set("description_en", e.target.value)} placeholder="Project description…" />
            </div>
          </div>
        )}

        {tab === "media" && (
          <div className="space-y-4">
            <CoverUploader value={form.cover_url} onChange={(url) => set("cover_url", url)} />
            <div>
              <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-widest" style={{ color:tk.muted }}>معرض الصور (متعدد)</p>
              <ImageDropZone onUpload={(urls) => set("images", [...form.images, ...urls])} />
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                      className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Input label="رابط الفيديو (اختياري)" value={form.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)} placeholder="https://youtube.com/…" />
            <div>
              <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-widest" style={{ color:tk.muted }}>ألوان المشروع</p>
              <div className="flex flex-wrap gap-2">
                {form.colors.map((c, i) => (
                  <button key={i} onClick={() => set("colors", form.colors.filter((_, j) => j !== i))}
                    className="h-7 w-7 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                    style={{ background:c }} title={`حذف ${c}`} />
                ))}
                <input type="color" defaultValue="#0a84ff"
                  onChange={(e) => { if (!form.colors.includes(e.target.value)) set("colors", [...form.colors, e.target.value]); }}
                  className="h-7 w-7 cursor-pointer rounded-full border-0" />
              </div>
            </div>
          </div>
        )}

        {tab === "meta" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="التصنيف" options={catOpts.map(o => ({ value: o.value, label: o.label }))} value={form.category}
                onChange={(e) => set("category", e.target.value)} />
              <Input label="السنة" value={form.year} onChange={(e) => set("year", e.target.value)} />
            </div>
            <Input label="اسم العميل" value={form.client} onChange={(e) => set("client", e.target.value)} />
            <Input label="رابط المشروع" value={form.project_url ?? ""} onChange={(e) => set("project_url", e.target.value)} placeholder="https://…" />
            <Input label="الخدمات (مفصولة بفاصلة)" value={form.services.join(",")}
              onChange={(e) => set("services", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            <Input label="التقنيات (مفصولة بفاصلة)" value={form.technologies.join(",")}
              onChange={(e) => set("technologies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            <Input label="الترتيب" type="number" value={String(form.order_index)}
              onChange={(e) => set("order_index", Number(e.target.value))} />
            <Select label="الحالة" options={statusOpts} value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)} />
            <div className="flex flex-col gap-3">
              <Toggle checked={form.visible} onChange={(v) => set("visible", v)} label="ظاهر في الموقع" />
              <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="مشروع مميز (featured)" />
            </div>
          </div>
        )}

        {tab === "seo" && (
          <div className="space-y-4">
            <p className="text-[12px] rounded-xl px-4 py-3" style={{ background:`${tk.blue}10`, color:tk.blue }}>
              SEO لهذا المشروع يُدار من صفحة إدارة SEO باستخدام الـ slug.
            </p>
            <Input label="Slug (رابط دائم)" value={form.slug || form.title_en.toLowerCase().replace(/\s+/g,"-")}
              onChange={(e) => set("slug", e.target.value)} hint="يستخدم في رابط الصفحة: /work/[slug]" />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t pt-5" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">إلغاء</Button>
        <Button onClick={handleSave} variant="primary" loading={saving}>
          {initial?.id ? "حفظ التعديلات" : "إضافة المشروع"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Projects Page ────────────────────────────────────────────────────────
export default function ProjectsV2() {
  const { projects, deleteProject, bulkDeleteProjects, bulkUpdateStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<"new"|"edit"|false>(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmId, setConfirmId] = useState<string|null>(null);
  const [page, setPage] = useState(1);
  const categories = useAdminStore((s) => s.categories);

  const filtered = useMemo(() =>
    projects.filter((p) => {
      const q = search.toLowerCase();
      return (
        (!q || p.title_ar.includes(search) || p.title_en.toLowerCase().includes(q) || p.client.includes(search)) &&
        (catFilter === "all" || p.category === catFilter) &&
        (statusFilter === "all" || p.status === statusFilter)
      );
    }), [projects, search, catFilter, statusFilter]);

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const allSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.id));

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(paginated.map((p) => p.id)));

  const catTabs = [{ id:"all", label:"الكل" }, ...categories.map((c) => ({ id:c.slug, label:c.label_ar }))];

  return (
    <div>
      <PageHeader
        title="إدارة المشاريع"
        subtitle={`${projects.length} مشروع إجمالاً · ${projects.filter((p) => p.status==="published").length} منشور`}
        actions={
          <Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
            icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>
            مشروع جديد
          </Button>
        }
      />

      {/* Filters */}
      <GlassCard padding="p-4" className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم أو العميل…" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {catTabs.map((c) => (
              <button key={c.id} onClick={() => { setCatFilter(c.id); setPage(1); }}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all"
                style={catFilter===c.id ? { background:`${tk.blue}22`, color:tk.blue } : { color:tk.muted }}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["all","draft","published","archived"] as const).map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all"
                style={statusFilter===s ? { background:`${tk.blue}22`, color:tk.blue } : { color:tk.muted }}>
                {s === "all" ? "الكل" : STATUS_MAP[s].label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background:`${tk.blue}12`, border:`1px solid ${tk.blue}30` }}>
            <span className="text-[13px] font-bold text-white">{selected.size} محدد</span>
            <Button size="sm" onClick={() => { bulkUpdateStatus([...selected], "published"); setSelected(new Set()); toast("تم النشر"); }}
              variant="success" icon={<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m20 6-11 11-5-5" /></svg>}>
              نشر
            </Button>
            <Button size="sm" onClick={() => { bulkUpdateStatus([...selected], "draft"); setSelected(new Set()); toast("تم التحويل لمسودة"); }}>
              مسودة
            </Button>
            <Button size="sm" variant="danger" onClick={() => { bulkDeleteProjects([...selected]); setSelected(new Set()); toast("تم الحذف", "error"); }}
              icon={<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>}>
              حذف
            </Button>
            <button onClick={() => setSelected(new Set())} className="ms-auto text-[12px] hover:opacity-70 transition-opacity" style={{ color:tk.muted }}>إلغاء التحديد</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <GlassCard padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:`1px solid ${tk.border}` }}>
                <th className="p-4 text-right">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="rounded accent-blue-500 cursor-pointer" />
                </th>
                {["المشروع","التصنيف","العميل","السنة","الحالة","المشاهدات","الإجراءات"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-start text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ color:tk.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center">
                  <EmptyState title="لا توجد مشاريع" desc="جرّب تعديل معايير البحث"
                    icon={<svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 20V6a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /></svg>} />
                </td></tr>
              ) : paginated.map((p) => (
                <motion.tr key={p.id} layout
                  className="border-b transition-colors hover:bg-white/3"
                  style={{ borderColor:tk.border }}>
                  <td className="p-4">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                      className="rounded accent-blue-500 cursor-pointer" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.cover_url || "https://via.placeholder.com/44"} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src="https://via.placeholder.com/44"; }} />
                      <div className="min-w-0">
                        <p className="max-w-[180px] truncate text-[13.5px] font-bold text-white">{p.title_ar}</p>
                        <p className="text-[11.5px]" style={{ color:tk.muted }}>{p.type_ar}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge label={p.category} variant="blue" />
                  </td>
                  <td className="px-4 py-3.5 text-[13px]" style={{ color:tk.text }}>{p.client || "—"}</td>
                  <td className="px-4 py-3.5 text-[13px] latin" style={{ color:tk.text }}>{p.year}</td>
                  <td className="px-4 py-3.5">
                    <Badge label={STATUS_MAP[p.status].label} variant={STATUS_MAP[p.status].variant} dot />
                  </td>
                  <td className="px-4 py-3.5 text-[13px] latin" style={{ color:tk.muted }}>
                    {p.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button size="xs" variant="ghost" onClick={() => { setEditing(p); setModal("edit"); }}
                        icon={<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" /><path d="M17.5 2.5a2.12 2.12 0 0 1 3 3L12 14l-4 1 1-4 8.5-8.5Z" /></svg>}>
                      </Button>
                      <Button size="xs" variant="danger" onClick={() => setConfirmId(p.id)}
                        icon={<svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>}>
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </GlassCard>

      {/* Modals */}
      <Modal open={modal !== false} onClose={() => setModal(false)} size="lg"
        title={modal === "edit" ? "تعديل المشروع" : "مشروع جديد"}>
        <ProjectForm initial={modal === "edit" && editing ? editing : undefined} onClose={() => setModal(false)} />
      </Modal>

      <ConfirmDialog
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteProject(confirmId); toast("تم حذف المشروع", "error"); setConfirmId(null); } }}
        title="حذف المشروع" message="سيتم حذف المشروع نهائياً. هذا الإجراء لا يمكن التراجع عنه."
        confirmLabel="حذف" danger
      />
    </div>
  );
}
