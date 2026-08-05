import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { MediaFile } from "../types";
import { useAdminStore } from "../store/useAdminStore";
import { tk } from "../components/ui";
import { cn } from "../../utils/cn";

const FOLDERS = ["all", "general", "projects", "logos", "covers", "backups"] as const;
type Folder = (typeof FOLDERS)[number];

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      title="نسخ الرابط"
      className="rounded-lg p-1.5 transition-colors hover:bg-[var(--adm-hover-bg)]"
      style={{ color: copied ? tk.green : tk.muted }}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m20 6-11 11-5-5" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      )}
    </button>
  );
}

/* ── Dropzone uploader → Supabase Storage ── */
function UploadZone({ folder }: { folder: Folder }) {
  const uploadFiles = useAdminStore((s) => s.uploadFiles);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      setUploading(true);
      await uploadFiles(accepted, folder === "all" ? "general" : folder);
      setUploading(false);
    },
    [uploadFiles, folder],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [], "video/*": [] },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed px-6 py-8 text-center transition-all duration-300",
        isDragActive && "scale-[1.01]",
      )}
      style={{
        borderColor: isDragActive ? tk.borderFocus : tk.border,
        background: isDragActive ? "color-mix(in srgb, #0a84ff 8%, transparent)" : tk.bg,
      }}
    >
      <input {...getInputProps()} />
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke={tk.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="text-[13px] font-bold" style={{ color: tk.text }}>
        {uploading ? "جارٍ الرفع إلى التخزين السحابي…" : isDragActive ? "أفلت الملفات هنا" : "اسحب الملفات أو انقر للرفع"}
      </p>
      <p className="text-[11px]" style={{ color: tk.faint }}>
        تُرفَع مباشرة إلى Supabase Storage ويُحفظ الرابط في قاعدة البيانات
      </p>
    </div>
  );
}

export default function Media() {
  const media = useAdminStore((s) => s.media);
  const deleteMedia = useAdminStore((s) => s.deleteMedia);
  const [folder, setFolder] = useState<Folder>("all");
  const [query, setQuery] = useState("");

  const shown = media
    .filter((m) => folder === "all" || m.folder === folder)
    .filter((m) => !query || m.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-black" style={{ color: tk.text }}>مكتبة الوسائط</h1>
          <p className="mt-1 text-[12.5px]" style={{ color: tk.muted }}>{media.length} ملف في التخزين السحابي</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث بالاسم…"
          className="w-56 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[var(--adm-border-focus)]"
          style={{ background: tk.bg, border: `1px solid ${tk.border}`, color: tk.text }}
        />
      </div>

      <UploadZone folder={folder} />

      {/* Folder filter */}
      <div className="flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className="rounded-full px-4 py-1.5 text-[12px] font-bold transition-all"
            style={
              folder === f
                ? { background: "linear-gradient(135deg,#0a84ff,#1e3a8a)", color: "#fff" }
                : { background: tk.bg, color: tk.muted, border: `1px solid ${tk.border}` }
            }
          >
            {f === "all" ? "الكل" : f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <p className="py-14 text-center text-[13px]" style={{ color: tk.muted }}>لا توجد ملفات في هذا المجلد</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence>
            {shown.map((m: MediaFile) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group overflow-hidden rounded-[18px]"
                style={{ background: tk.glass, border: `1px solid ${tk.border}` }}
              >
                <div className="relative aspect-square overflow-hidden" style={{ background: tk.bg }}>
                  {m.type === "image" || m.type === "svg" ? (
                    <img src={m.url} alt={m.alt ?? m.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2" style={{ color: tk.muted }}>
                      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" /><path d="M14 2v6h6" /></svg>
                      <span className="text-[10px] font-bold uppercase">{m.type}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <CopyBtn text={m.url} />
                    <button
                      onClick={() => deleteMedia(m.id)}
                      title="حذف"
                      className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                      style={{ color: tk.red }}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                    </button>
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <p className="truncate text-[11.5px] font-bold" style={{ color: tk.text }}>{m.name}</p>
                  <p className="latin mt-0.5 text-[10px]" style={{ color: tk.faint }}>{formatBytes(m.size)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
