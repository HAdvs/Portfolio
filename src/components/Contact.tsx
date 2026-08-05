import { motion } from "framer-motion";
import { useState } from "react";
import { useSite } from "../lib/site";
import { dbMessages } from "../lib/cms/db";
import { isSupabaseConfigured } from "../lib/supabase";
import { cn } from "../utils/cn";
import { Magnetic, Reveal, SectionHead } from "./ui";

type Form = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  details: string;
  budget: string;
};

const EMPTY: Form = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  details: "",
  budget: "",
};

const fieldCls =
  "w-full rounded-2xl px-4 py-3.5 text-[14px] outline-none transition-all duration-300 placeholder:opacity-45 focus:ring-2";

export default function Contact() {
  const { t, lang, settings } = useSite();
  const [form, setForm] = useState<Form>(EMPTY);
  const [err, setErr] = useState(false);
  const [sending, setSending] = useState(false);

  const isAr = lang === "ar";
  const emailAddr = settings.email || t.contact.info[1]?.v || "hello@yourmark.studio";

  /* Contact details resolved live from CMS settings */
  const infoItems = t.contact.info.map((row, i) => {
    if (i === 0) return { ...row, v: settings.phone || row.v };
    if (i === 1) return { ...row, v: emailAddr };
    if (i === 2)
      return { ...row, v: (isAr ? settings.location_ar : settings.location_en) || row.v };
    return row;
  });

  /* Build a direct mailto link pre-filled with the current form data */
  const mailtoHref = (() => {
    const L = t.contact.fields;
    const subject = isAr
      ? `طلب مشروع جديد${form.company ? ` — ${form.company}` : form.name ? ` — ${form.name}` : ""}`
      : `New project request${form.company ? ` — ${form.company}` : form.name ? ` — ${form.name}` : ""}`;
    const body = [
      `${L.name}: ${form.name || "—"}`,
      `${L.company}: ${form.company || "—"}`,
      `${L.email}: ${form.email || "—"}`,
      `${L.phone}: ${form.phone || "—"}`,
      `${L.service}: ${form.service || "—"}`,
      `${L.budget}: ${form.budget || "—"}`,
      "",
      `${L.details}:`,
      form.details || "—",
    ].join("\n");
    return `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErr(false);
  };

  const buildMessage = () => {
    const L = t.contact.fields;
    const rows = [
      `*${t.contact.msgTitle}*`,
      "",
      `*${L.name}:* ${form.name || "—"}`,
      `*${L.company}:* ${form.company || "—"}`,
      `*${L.email}:* ${form.email || "—"}`,
      `*${L.phone}:* ${form.phone || "—"}`,
      `*${L.service}:* ${form.service || "—"}`,
      `*${L.budget}:* ${form.budget || "—"}`,
      "",
      `*${L.details}:*`,
      form.details || "—",
      "",
      lang === "ar" ? "— أُرسلت من الموقع" : "— Sent from the website",
    ];
    return rows.join("\n");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.service.trim()) {
      setErr(true);
      return;
    }
    setSending(true);

    /* Persist the lead in PostgreSQL so it appears in the admin inbox.
       RLS allows anonymous inserts on `messages`. */
    if (isSupabaseConfigured) {
      dbMessages
        .submit({
          name: form.name, email: form.email, phone: form.phone || undefined,
          company: form.company || undefined, service: form.service,
          budget: form.budget || undefined, message: form.details || buildMessage(),
        })
        .catch((err) => console.warn("[contact] db save failed", err));
    }

    window.open(mailtoHref, "_blank", "noopener,noreferrer");
    setTimeout(() => setSending(false), 1400);
  };

  const inputStyle = {
    background: "color-mix(in srgb, var(--surface) 60%, transparent)",
    border: "1px solid var(--line)",
    color: "var(--txt)",
    "--tw-ring-color": "color-mix(in srgb, var(--primary) 45%, transparent)",
  } as React.CSSProperties;

  const services = t.services.items.map((s) => s.t);

  return (
    <section id="contact" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead kicker={t.contact.kicker} title={t.contact.title} sub={t.contact.sub} />

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Info panel */}
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-[34px] p-8 glass shadow-lux">
              <div
                aria-hidden
                className="anim-glow absolute -bottom-24 -start-20 h-64 w-64 rounded-full blur-[90px]"
                style={{ background: "color-mix(in srgb,var(--primary) 38%, transparent)" }}
              />
              <div className="relative space-y-6">
                {infoItems.map((c, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[13px] font-black text-white"
                      style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
                    >
                      <span className="latin">{i + 1}</span>
                    </span>
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-widest txt-muted">
                        {c.t}
                      </div>
                      <div className="mt-1 text-[15px] font-bold" dir={i < 2 ? "ltr" : undefined}>
                        {c.v}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={mailtoHref}
                className="group relative mt-9 flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-[14px] font-bold text-white shadow-lux transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-white/15 transition-transform duration-700 group-hover:translate-x-0"
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="relative h-5 w-5">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="relative">
                  {isAr ? "إرسال عبر البريد الإلكتروني" : "Send via Email"}
                  <span className="latin mx-1.5 opacity-70">·</span>
                </span>
              </a>

              <p className="relative mt-4 text-center text-[12px] leading-relaxed txt-muted">
                {t.contact.note}
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.12}>
            <form
              onSubmit={submit}
              className="rounded-[34px] p-7 glass shadow-lux sm:p-9"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[12.5px] font-semibold txt-muted">
                    {t.contact.fields.name} <span style={{ color: "var(--primary)" }}>*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={set("name")}
                    placeholder={t.contact.placeholders.name}
                    className={fieldCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[12.5px] font-semibold txt-muted">
                    {t.contact.fields.company}
                  </label>
                  <input
                    value={form.company}
                    onChange={set("company")}
                    placeholder={t.contact.placeholders.company}
                    className={fieldCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[12.5px] font-semibold txt-muted">
                    {t.contact.fields.email}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={set("email")}
                    placeholder={t.contact.placeholders.email}
                    className={cn(fieldCls, "latin")}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[12.5px] font-semibold txt-muted">
                    {t.contact.fields.phone}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder={t.contact.placeholders.phone}
                    className={cn(fieldCls, "latin")}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[12.5px] font-semibold txt-muted">
                    {t.contact.fields.service} <span style={{ color: "var(--primary)" }}>*</span>
                  </label>
                  <select
                    value={form.service}
                    onChange={set("service")}
                    className={cn(fieldCls, "appearance-none")}
                    style={inputStyle}
                  >
                    <option value="">—</option>
                    {services.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[12.5px] font-semibold txt-muted">
                    {t.contact.fields.budget}
                  </label>
                  <select
                    value={form.budget}
                    onChange={set("budget")}
                    className={cn(fieldCls, "appearance-none")}
                    style={inputStyle}
                  >
                    <option value="">—</option>
                    {t.contact.budgets.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-[12.5px] font-semibold txt-muted">
                    {t.contact.fields.details}
                  </label>
                  <textarea
                    rows={5}
                    value={form.details}
                    onChange={set("details")}
                    placeholder={t.contact.placeholders.details}
                    className={cn(fieldCls, "resize-none leading-relaxed")}
                    style={inputStyle}
                  />
                </div>
              </div>

              {err && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl px-4 py-3 text-[13px] font-semibold"
                  style={{
                    background: "color-mix(in srgb, #ef4444 12%, transparent)",
                    color: "#ef4444",
                  }}
                >
                  {t.contact.required}
                </motion.p>
              )}

              <div className="mt-7">
                <Magnetic strength={0.22} className="w-full">
                  <button
                    type="submit"
                    disabled={sending}
                    className="group relative w-full overflow-hidden rounded-2xl py-4.5 text-[15px] font-bold text-white shadow-lux disabled:opacity-70"
                    style={{
                      padding: "17px 0",
                      background: "linear-gradient(135deg,var(--primary),var(--secondary))",
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-0"
                    />
                    <span className="relative z-10 inline-flex items-center gap-2.5">
                      {sending ? t.contact.sending : t.contact.submit}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.8 4.9-1.3A9.9 9.9 0 1 0 12.04 2Zm5.8 14c-.25.7-1.45 1.35-2 1.4-.53.05-1.02.24-3.44-.72-2.9-1.14-4.73-4.1-4.87-4.3-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.26-.29.57-.36.76-.36l.55.01c.17.01.42-.07.65.5.24.58.81 2 .88 2.14.07.15.12.32.02.5-.1.2-.15.32-.29.49l-.44.5c-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.3 1.43.3.14.47.12.64-.07.17-.2.74-.86.94-1.16.19-.29.39-.24.65-.14.26.09 1.67.79 1.96.93.29.15.48.22.55.34.07.12.07.7-.18 1.4Z" />
                      </svg>
                    </span>
                  </button>
                </Magnetic>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
