"use client";

import { useState, useTransition } from "react";
import {
  createOfflineStudentAccount,
  deleteOfflineStudentAccount,
  confirmOfflineBadge,
} from "@/app/actions/admin";

const COURSE_LABEL: Record<string, string> = {
  CAPITAL_MAP:  "资本通  (Stage 1)",
  CAPITAL_CODE: "启动资本 (Stage 2)",
  CAPITAL_DAO:  "资本道  (Stage 3)",
};

const ROLE_BADGE: Record<string, string> = {
  ZIBENTONG_GRAD: "ZBT",
  QIDONG_GRAD:    "QD",
  ZIBENDAO_GRAD:  "ZBD",
};

interface LinkedUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface Account {
  id: string;
  accountNo: string;
  phone: string;
  holderName: string;
  course: string;
  linkedUserId: string | null;
  linkedUser: LinkedUser | null;
  createdAt: Date;
}

const COURSES = ["CAPITAL_MAP", "CAPITAL_CODE", "CAPITAL_DAO"] as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "10px",
  fontSize: "13px",
  outline: "none",
  backgroundColor: "#1A1A1A",
  border: "1px solid #2A2A28",
  color: "#F5F5F0",
};

export default function StudentAccountsClient({ accounts }: { accounts: Account[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ accountNo: "", phone: "", holderName: "", course: "CAPITAL_MAP" });
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setFormError("");
    startTransition(async () => {
      const res = await createOfflineStudentAccount(form.accountNo, form.phone, form.holderName, form.course);
      if (res.error) { setFormError(res.error); return; }
      setShowForm(false);
      setForm({ accountNo: "", phone: "", holderName: "", course: "CAPITAL_MAP" });
    });
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
        >
          + 新增学员账号
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: "#111111", border: "1px solid #2A2A28" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>新增线下学员账号</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "#A0A09A" }}>学员账号 *</label>
              <input style={inputStyle} placeholder="如：ZBT-2024-001" value={form.accountNo} onChange={(e) => setForm((f) => ({ ...f, accountNo: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "#A0A09A" }}>手机号码 *</label>
              <input style={inputStyle} placeholder="+601X-XXXXXXX" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "#A0A09A" }}>学员姓名 *</label>
              <input style={inputStyle} placeholder="学员全名" value={form.holderName} onChange={(e) => setForm((f) => ({ ...f, holderName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "#A0A09A" }}>线下课程 *</label>
              <select style={{ ...inputStyle }} value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
                {COURSES.map((c) => <option key={c} value={c}>{COURSE_LABEL[c]}</option>)}
              </select>
            </div>
          </div>
          {formError && <p className="text-xs" style={{ color: "#EF4444" }}>{formError}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: "#1A1A1A", color: "#A0A09A", border: "1px solid #2A2A28" }}>
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={isPending || !form.accountNo || !form.phone || !form.holderName}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
            >
              {isPending ? "创建中…" : "确认创建"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #2A2A28" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#111111", borderBottom: "1px solid #2A2A28" }}>
              {["学员账号", "姓名", "课程", "绑定用户", "状态", "操作"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#A0A09A" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "#555550", backgroundColor: "#0D0D0D" }}>
                  尚无学员账号，点击上方新增
                </td>
              </tr>
            ) : accounts.map((acc) => (
              <AccountRow key={acc.id} account={acc} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountRow({ account }: { account: Account }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isLinked = !!account.linkedUser;
  const badgeConfirmed = isLinked && Object.keys(ROLE_BADGE).includes(account.linkedUser!.role);

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      const res = await confirmOfflineBadge(account.id);
      if (res.error) setError(res.error);
    });
  }

  function handleDelete() {
    if (!confirm(`确认删除学员账号 ${account.accountNo}？此操作不可撤销。`)) return;
    setError("");
    startTransition(async () => {
      const res = await deleteOfflineStudentAccount(account.id);
      if (res.error) setError(res.error);
    });
  }

  return (
    <tr style={{ backgroundColor: "#0D0D0D", borderBottom: "1px solid #1A1A1A" }}>
      <td className="px-4 py-3">
        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#1A1A1A", color: "#C9A84C" }}>
          {account.accountNo}
        </span>
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: "#F5F5F0" }}>{account.holderName}</td>
      <td className="px-4 py-3 text-xs" style={{ color: "#A0A09A" }}>{COURSE_LABEL[account.course]}</td>
      <td className="px-4 py-3">
        {account.linkedUser ? (
          <div>
            <div className="text-xs font-medium" style={{ color: "#F5F5F0" }}>{account.linkedUser.name ?? "—"}</div>
            <div className="text-xs" style={{ color: "#666660" }}>{account.linkedUser.email}</div>
          </div>
        ) : (
          <span className="text-xs" style={{ color: "#444440" }}>未绑定</span>
        )}
      </td>
      <td className="px-4 py-3">
        {badgeConfirmed ? (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            {ROLE_BADGE[account.linkedUser!.role]} 已确认
          </span>
        ) : isLinked ? (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(107,155,210,0.12)", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.25)" }}
          >
            已绑定 · 待确认
          </span>
        ) : (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(154,148,144,0.1)", color: "#666660", border: "1px solid #2A2A28" }}
          >
            待绑定
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5">
          {isLinked && !badgeConfirmed && (
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-40 transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
            >
              {isPending ? "确认中…" : "确认徽章"}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-3 py-1 rounded-lg text-xs disabled:opacity-40"
            style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            删除
          </button>
          {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
        </div>
      </td>
    </tr>
  );
}
