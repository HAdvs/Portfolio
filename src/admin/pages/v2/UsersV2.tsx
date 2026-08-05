import { useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import type { AdminUser, UserRole } from "../../types";
import { ROLE_PERMISSIONS } from "../../types";
import { Badge, Button, ConfirmDialog, GlassCard, Input, Modal, PageHeader, Select, Toggle, tk, toast } from "../../components/ui";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "مدير عام",
  admin:       "مدير",
  editor:      "محرر",
  viewer:      "مشاهد",
};

const ROLE_COLORS: Record<UserRole, "blue"|"purple"|"green"|"gray"> = {
  super_admin: "purple",
  admin:       "blue",
  editor:      "green",
  viewer:      "gray",
};

type FormData = {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  twoFA: boolean;
};

const DEFAULT_FORM: FormData = { name:"", username:"", email:"", role:"editor", isActive:true, twoFA:false };

function UserForm({ initial, onClose }: { initial?: AdminUser; onClose: () => void }) {
  const { addUser, updateUser } = useAdminStore();
  const [form, setForm] = useState<FormData>(initial
    ? { name:initial.name, username:initial.username, email:initial.email, role:initial.role, isActive:initial.isActive, twoFA:initial.twoFA }
    : { ...DEFAULT_FORM });

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm((p) => ({ ...p, [k]:v }));

  const roleOpts: { value: UserRole; label: string }[] = [
    { value:"super_admin", label:"مدير عام" },
    { value:"admin",       label:"مدير" },
    { value:"editor",      label:"محرر" },
    { value:"viewer",      label:"مشاهد" },
  ];

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) { toast("يرجى تعبئة الحقول المطلوبة","error"); return; }
    if (initial) { updateUser(initial.id, form); toast("تم تحديث المستخدم"); }
    else { addUser({ ...form, avatar:undefined, lastLogin:undefined }); toast("تم إضافة المستخدم"); }
    onClose();
  };

  const perms = ROLE_PERMISSIONS[form.role];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="الاسم الكامل" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="اسمك الكامل" />
        <Input label="اسم المستخدم" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="username" />
      </div>
      <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" />
      <Select label="الدور" options={roleOpts} value={form.role} onChange={(e) => set("role", e.target.value as UserRole)} />

      {/* Permission preview */}
      <div>
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-widest" style={{ color:tk.muted }}>الصلاحيات الممنوحة</p>
        <div className="flex flex-wrap gap-1.5">
          {perms.map((p) => (
            <span key={p} className="rounded-lg px-2.5 py-1 text-[10.5px] font-medium" style={{ background:`${tk.blue}14`, color:tk.blue }}>{p}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor:tk.border }}>
        <Toggle checked={form.isActive} onChange={(v) => set("isActive", v)} label="الحساب نشط" />
        <Toggle checked={form.twoFA} onChange={(v) => set("twoFA", v)} label="تفعيل المصادقة الثنائية (2FA)" />
      </div>

      <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor:tk.border }}>
        <Button onClick={onClose} variant="ghost">إلغاء</Button>
        <Button onClick={handleSave} variant="primary">{initial ? "حفظ التعديلات" : "إضافة مستخدم"}</Button>
      </div>
    </div>
  );
}

export default function UsersV2() {
  const { users, deleteUser } = useAdminStore();
  const [modal, setModal] = useState<"new"|"edit"|false>(false);
  const [editing, setEditing] = useState<AdminUser|null>(null);
  const [confirmId, setConfirmId] = useState<string|null>(null);

  return (
    <div>
      <PageHeader title="إدارة المستخدمين" subtitle={`${users.length} مستخدم`}
        actions={<Button variant="primary" onClick={() => { setEditing(null); setModal("new"); }}
          icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}>مستخدم جديد</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <GlassCard key={u.id} hover padding="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[15px] font-black text-white"
                  style={{ background:"linear-gradient(135deg,#0a84ff,#1e3a8a)" }}>
                  {u.name[0]}
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-white">{u.name}</p>
                  <p className="text-[11.5px]" style={{ color:tk.muted }}>@{u.username}</p>
                </div>
              </div>
              <Badge label={ROLE_LABELS[u.role]} variant={ROLE_COLORS[u.role]} />
            </div>

            <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor:tk.border }}>
              <p className="flex items-center gap-2 text-[12px]" style={{ color:tk.muted }}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <span dir="ltr" className="latin">{u.email}</span>
              </p>
              <div className="flex items-center justify-between">
                <span className="rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
                  style={{ background: u.isActive ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", color: u.isActive ? tk.green : tk.muted }}>
                  {u.isActive ? "نشط" : "غير نشط"}
                </span>
                {u.twoFA && <span className="text-[10.5px] font-semibold" style={{ color:tk.amber }}>2FA مفعل</span>}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button size="xs" className="flex-1" onClick={() => { setEditing(u); setModal("edit"); }}>تعديل</Button>
              <Button size="xs" variant="danger" onClick={() => setConfirmId(u.id)}>حذف</Button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal open={modal!==false} onClose={() => setModal(false)} title={modal==="edit"?"تعديل المستخدم":"مستخدم جديد"}>
        <UserForm initial={modal==="edit"&&editing?editing:undefined} onClose={() => setModal(false)} />
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteUser(confirmId); toast("تم حذف المستخدم","error"); } }}
        title="حذف المستخدم" message="سيتم حذف الحساب نهائياً." danger />
    </div>
  );
}
