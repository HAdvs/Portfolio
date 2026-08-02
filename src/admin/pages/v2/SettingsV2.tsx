import { useEffect, useState } from "react";
import { useAdminStore, DEFAULT_SETTINGS } from "../../store/useAdminStore";
import type { SiteSettings } from "../../types";
import { Button, GlassCard, Input, PageHeader, Tabs, Toggle, toast } from "../../components/ui";

export default function SettingsV2() {
  const storeSettings = useAdminStore((s) => s.settings);
  const updateSettings = useAdminStore((s) => s.updateSettings);
  const [form, setForm] = useState<SiteSettings>({ ...(storeSettings ?? DEFAULT_SETTINGS) });
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);

  /* Re-sync when the DB copy arrives / changes (realtime) */
  useEffect(() => {
    if (storeSettings) setForm(storeSettings);
  }, [storeSettings]);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast("تم حفظ الإعدادات بنجاح");
  };

  const TABS = [
    { id:"general", label:"عام" },
    { id:"appearance", label:"المظهر" },
    { id:"contact", label:"التواصل" },
    { id:"social", label:"التواصل الاجتماعي" },
    { id:"analytics", label:"التحليلات" },
    { id:"advanced", label:"متقدم" },
  ];

  const inputStyle: React.CSSProperties = {};

  return (
    <div>
      <PageHeader title="إعدادات الموقع" subtitle="إدارة هوية وإعدادات YourMark Studio"
        actions={<Button variant="primary" onClick={handleSave}>{saved ? "✓ تم الحفظ" : "حفظ الإعدادات"}</Button>}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-5 max-w-2xl">
        {tab === "general" && (
          <GlassCard padding="p-6" className="space-y-5">
            <Input label="اسم الموقع" value={form.site_name} onChange={(e) => set("site_name", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="الشعار / Tagline (عربي)" value={form.tagline_ar} onChange={(e) => set("tagline_ar", e.target.value)} />
              <Input label="Tagline (English)" value={form.tagline_en} onChange={(e) => set("tagline_en", e.target.value)} />
            </div>
            <div>
              <Input label="رابط الشعار (Logo URL)" value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://…" />
              {form.logo_url && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={form.logo_url} alt="logo" className="h-14 w-14 rounded-2xl object-contain" style={{ background:"rgba(255,255,255,0.06)" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
                  <p className="text-[12px]" style={{ color:tk.muted }}>معاينة الشعار</p>
                </div>
              )}
            </div>
            <Input label="Favicon URL" value={form.favicon_url} onChange={(e) => set("favicon_url", e.target.value)} placeholder="https://…" />
            <Input label="Open Graph Image" value={form.og_image} onChange={(e) => set("og_image", e.target.value)} placeholder="https://…" />
            <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor:tk.border }}>
              <Toggle checked={form.maintenance_mode} onChange={(v) => set("maintenance_mode", v)} label="وضع الصيانة (Maintenance Mode)" />
            </div>
          </GlassCard>
        )}

        {tab === "appearance" && (
          <GlassCard padding="p-6" className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-[11.5px] font-bold uppercase tracking-widest" style={{ color:tk.muted }}>اللون الرئيسي</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)}
                    className="h-11 w-11 cursor-pointer rounded-xl border-0 bg-transparent" />
                  <Input value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11.5px] font-bold uppercase tracking-widest" style={{ color:tk.muted }}>اللون الثانوي</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)}
                    className="h-11 w-11 cursor-pointer rounded-xl border-0 bg-transparent" />
                  <Input value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11.5px] font-bold uppercase tracking-widest" style={{ color:tk.muted }}>اللون المميز</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)}
                    className="h-11 w-11 cursor-pointer rounded-xl border-0 bg-transparent" />
                  <Input value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="خط العربية" value={form.font_ar} onChange={(e) => set("font_ar", e.target.value)} placeholder="IBM Plex Sans Arabic" />
              <Input label="Latin Font" value={form.font_en} onChange={(e) => set("font_en", e.target.value)} placeholder="Inter" />
            </div>
            <div>
              <p className="mb-2 text-[11.5px] font-bold uppercase tracking-widest" style={{ color:tk.muted }}>معاينة الألوان</p>
              <div className="flex gap-3">
                <div className="h-12 flex-1 rounded-xl" style={{ background:`linear-gradient(135deg,${form.primary_color},${form.secondary_color})` }} />
                <div className="h-12 w-12 rounded-xl" style={{ background:form.accent_color }} />
              </div>
            </div>
          </GlassCard>
        )}

        {tab === "contact" && (
          <GlassCard padding="p-6" className="space-y-5">
            <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@yourmark.studio" />
            <Input label="رقم الهاتف" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+966 53 959 5432" />
            <Input label="واتساب (الرقم فقط)" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="966539595432" hint="بدون + أو مسافات — يُستخدم في رابط wa.me" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="الموقع (عربي)" value={form.location_ar} onChange={(e) => set("location_ar", e.target.value)} />
              <Input label="Location (English)" value={form.location_en} onChange={(e) => set("location_en", e.target.value)} />
            </div>
          </GlassCard>
        )}

        {tab === "social" && (
          <GlassCard padding="p-6" className="space-y-5">
            {([
              { k:"social_instagram", label:"Instagram" },
              { k:"social_behance",   label:"Behance" },
              { k:"social_linkedin",  label:"LinkedIn" },
              { k:"social_x",        label:"X (Twitter)" },
              { k:"social_youtube",  label:"YouTube" },
              { k:"social_dribbble", label:"Dribbble" },
            ] as const).map(({ k, label }) => (
              <Input key={k} label={label} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder="https://…" />
            ))}
          </GlassCard>
        )}

        {tab === "analytics" && (
          <GlassCard padding="p-6" className="space-y-5">
            <Input label="Google Analytics ID" value={form.ga_id} onChange={(e) => set("ga_id", e.target.value)} placeholder="G-XXXXXXXXXX" hint="مثال: G-ABC12345" />
            <Input label="Google Tag Manager ID" value={form.gtm_id} onChange={(e) => set("gtm_id", e.target.value)} placeholder="GTM-XXXXXXX" />
            <Input label="Hotjar Site ID" value={form.hotjar_id} onChange={(e) => set("hotjar_id", e.target.value)} placeholder="1234567" />
            <div className="rounded-2xl p-4 text-[13px]" style={{ background:`${tk.blue}0e`, color:tk.blue, border:`1px solid ${tk.blue}22` }}>
              <p>يتم تطبيق هذه الإعدادات عند الحفظ. تأكد من دقة المعرّفات قبل النشر.</p>
            </div>
          </GlassCard>
        )}

        {tab === "advanced" && (
          <GlassCard padding="p-6" className="space-y-5">
            <Input label="المنطقة الزمنية" value={form.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="Asia/Riyadh" />
            <div>
              <p className="mb-2 text-[11.5px] font-bold uppercase tracking-widest" style={{ color:tk.muted }}>اللغة الافتراضية</p>
              <div className="flex gap-3">
                {(["ar","en"] as const).map((l) => (
                  <button key={l} onClick={() => set("default_lang", l)}
                    className="flex-1 rounded-2xl py-3.5 text-[13px] font-bold transition-all"
                    style={form.default_lang===l ? { background:`linear-gradient(135deg,${tk.blue},${tk.navy})`, color:"white" } : { background:tk.bg, color:tk.muted, border:`1px solid ${tk.border}` }}>
                    {l === "ar" ? "🇸🇦 العربية" : "🇬🇧 English"}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

// Small constant to avoid type error
const tk = {
  bg: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  muted: "rgba(255,255,255,0.42)",
  blue: "#0a84ff",
  navy: "#1e3a8a",
};
