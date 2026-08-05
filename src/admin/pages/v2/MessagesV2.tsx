import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import type { Message, MessageStatus } from "../../types";
import { Badge, Button, ConfirmDialog, GlassCard, Modal, PageHeader, SearchInput, tk, toast } from "../../components/ui";
import { formatDistanceToNow } from "date-fns";

type StatusV = { label: string; variant: "blue" | "green" | "amber" | "gray" };
const STATUS_MAP: Record<MessageStatus, StatusV> = {
  unread:   { label:"جديد",    variant:"blue" },
  read:     { label:"مقروء",   variant:"gray" },
  replied:  { label:"رُدّ عليه", variant:"green" },
  archived: { label:"مؤرشف",  variant:"amber" },
};

function MessageDetail({ msg, onClose }: { msg: Message; onClose: () => void }) {
  const { updateMessageStatus, deleteMessage } = useAdminStore();
  const [confirmDel, setConfirmDel] = useState(false);

  const openWA = () => {
    const text = `مرحباً ${msg.name}،\n\nشكراً لتواصلك مع YourMark Studio.\n\n`;
    window.open(`https://wa.me/${msg.phone?.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(text)}`, "_blank");
    updateMessageStatus(msg.id, "replied");
  };

  return (
    <div className="space-y-5">
      {/* Sender info */}
      <GlassCard padding="p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label:"الاسم", value:msg.name },
            { label:"البريد", value:msg.email },
            { label:"الجوال", value:msg.phone ?? "—" },
            { label:"الشركة", value:msg.company ?? "—" },
            { label:"الخدمة", value:msg.service ?? "—" },
            { label:"الميزانية", value:msg.budget ?? "—" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[10.5px] uppercase tracking-widest" style={{ color:tk.faint }}>{f.label}</p>
              <p className="mt-1 text-[13.5px] font-semibold text-white">{f.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Message body */}
      <GlassCard padding="p-5">
        <p className="mb-2 text-[11px] uppercase tracking-widest" style={{ color:tk.faint }}>الرسالة</p>
        <p className="text-[14px] leading-[2] text-white">{msg.message}</p>
        <p className="mt-3 text-[11px]" style={{ color:tk.faint }}>
          {new Date(msg.createdAt).toLocaleString("ar-SA")}
        </p>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {msg.phone && (
          <Button variant="success" onClick={openWA}
            icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.8 4.9-1.3A9.9 9.9 0 1 0 12.04 2Zm5.8 14c-.25.7-1.45 1.35-2 1.4-.53.05-1.02.24-3.44-.72-2.9-1.14-4.73-4.1-4.87-4.3-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.26-.29.57-.36.76-.36l.55.01c.17.01.42-.07.65.5.24.58.81 2 .88 2.14.07.15.12.32.02.5-.1.2-.15.32-.29.49l-.44.5c-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.3 1.43.3.14.47.12.64-.07.17-.2.74-.86.94-1.16.19-.29.39-.24.65-.14.26.09 1.67.79 1.96.93.29.15.48.22.55.34.07.12.07.7-.18 1.4Z" /></svg>}>
            رد عبر واتساب
          </Button>
        )}
        <a href={`mailto:${msg.email}?subject=رد على رسالتك`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-[var(--adm-hover-bg)]" style={{ color: tk.text }}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          رد بالبريد
        </a>
        <Button onClick={() => { updateMessageStatus(msg.id, "archived"); onClose(); toast("تم الأرشفة"); }}>أرشفة</Button>
        <Button variant="danger" onClick={() => setConfirmDel(true)}>حذف</Button>
      </div>

      <ConfirmDialog open={confirmDel} onClose={() => setConfirmDel(false)}
        onConfirm={() => { deleteMessage(msg.id); onClose(); toast("تم حذف الرسالة","error"); }}
        title="حذف الرسالة" message="سيتم حذف الرسالة نهائياً." danger />
    </div>
  );
}

export default function MessagesV2() {
  const { messages, updateMessageStatus, toggleStarMessage, bulkDeleteMessages } = useAdminStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all"|MessageStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Message|null>(null);

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      (!q || m.name.includes(search) || m.email.toLowerCase().includes(q) || m.message.includes(search)) &&
      (statusFilter === "all" || m.status === statusFilter)
    );
  });

  const unread = messages.filter((m) => m.status === "unread").length;

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleView = (m: Message) => {
    setViewing(m);
    if (m.status === "unread") updateMessageStatus(m.id, "read");
  };

  return (
    <div>
      <PageHeader
        title="الرسائل"
        subtitle={`${messages.length} رسالة · ${unread} غير مقروءة`}
      />

      {/* Filters */}
      <GlassCard padding="p-4" className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64"><SearchInput value={search} onChange={setSearch} placeholder="بحث…" /></div>
          {(["all","unread","read","replied","archived"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all"
              style={statusFilter===s ? { background:`${tk.blue}22`, color:tk.blue } : { color:tk.muted }}>
              {s==="all"?"الكل": STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Bulk bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background:`${tk.blue}12`, border:`1px solid ${tk.blue}30` }}>
            <span className="text-[13px] font-bold text-white">{selected.size} محدد</span>
            <Button size="sm" variant="danger" onClick={() => { bulkDeleteMessages([...selected]); setSelected(new Set()); toast("تم الحذف","error"); }}>حذف</Button>
            <button onClick={() => setSelected(new Set())} className="ms-auto text-[12px] hover:opacity-70" style={{ color:tk.muted }}>إلغاء</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <GlassCard>
            <div className="py-12 text-center" style={{ color:tk.muted }}>لا توجد رسائل</div>
          </GlassCard>
        ) : filtered.map((m) => (
          <motion.div key={m.id} layout
            className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors hover:bg-white/4 cursor-pointer"
            style={{ background: m.status==="unread" ? "rgba(10,132,255,0.07)" : tk.bg, border:`1px solid ${m.status==="unread" ? "rgba(10,132,255,0.25)" : tk.border}` }}
            onClick={() => handleView(m)}>
            <input type="checkbox" checked={selected.has(m.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(m.id); }}
              className="rounded accent-blue-500 cursor-pointer shrink-0" onClick={(e) => e.stopPropagation()} />

            {/* Star */}
            <button onClick={(e) => { e.stopPropagation(); toggleStarMessage(m.id); }}
              className="shrink-0 transition-colors" style={{ color: m.starred ? tk.amber : tk.faint }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill={m.starred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8L12 3Z" />
              </svg>
            </button>

            <div className="min-w-0 flex-1 grid grid-cols-[auto_1fr_auto] items-center gap-4">
              <div>
                <p className="text-[13.5px] font-bold text-white leading-tight">{m.name}</p>
                <p className="text-[11.5px]" style={{ color:tk.muted }}>{m.company ?? m.email}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px]" style={{ color: m.status==="unread" ? tk.text : tk.muted }}>{m.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge label={STATUS_MAP[m.status].label} variant={STATUS_MAP[m.status].variant} dot />
                <p className="text-[10.5px]" style={{ color:tk.faint }}>
                  {formatDistanceToNow(new Date(m.createdAt), { addSuffix:true })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={`رسالة من ${viewing?.name ?? ""}`} size="lg">
        {viewing && <MessageDetail msg={viewing} onClose={() => setViewing(null)} />}
      </Modal>
    </div>
  );
}
