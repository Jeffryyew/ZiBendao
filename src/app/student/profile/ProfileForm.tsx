"use client";

import { useState } from "react";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  city: string;
  bio: string;
}

const LABELS: { key: keyof Omit<ProfileData, "email">; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "name",     label: "姓名",     placeholder: "您的全名" },
  { key: "phone",    label: "手机号码", placeholder: "+60 / +86 / +1" },
  { key: "company",  label: "公司名称", placeholder: "您的公司或企业" },
  { key: "position", label: "职位",     placeholder: "您目前的职位或头衔" },
  { key: "city",     label: "所在城市", placeholder: "如：吉隆坡、深圳、上海" },
  { key: "bio",      label: "个人简介", placeholder: "简短描述您的背景与目标（选填）", multiline: true },
];

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function set(key: keyof ProfileData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setErrorMsg("姓名不能为空");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    setSavedMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          company: form.company,
          position: form.position,
          city: form.city,
          bio: form.bio,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存失败");
      setForm((p) => ({ ...p, ...data }));
      setEditing(false);
      setSavedMsg("资料已保存");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(initial);
    setEditing(false);
    setErrorMsg("");
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "9px 13px",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: editing ? "#FFFFFF" : "#F7F4EF",
    border: `1px solid ${editing ? "#D4C9B8" : "#E0D9CE"}`,
    color: "#1C1814",
    resize: "vertical" as const,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    marginBottom: "5px",
    color: "#9A9490",
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: "#1C1814" }}>个人资料</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "#F0EBE1", color: "#68625C", border: "1px solid #E0D9CE" }}
          >
            编辑资料
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, #B8943A, #C9A84C)",
                color: "#1C1814",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        )}
      </div>

      {/* Email (read-only) */}
      <div>
        <label style={labelStyle}>邮箱地址</label>
        <div
          className="px-3 py-2.5 rounded-xl text-sm"
          style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#9A9490" }}
        >
          {form.email}
        </div>
      </div>

      {/* Editable fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        {LABELS.filter((f) => !f.multiline).map((f) => (
          <div key={f.key}>
            <label style={labelStyle}>{f.label}{f.key === "name" && <span style={{ color: "#C9A84C" }}> *</span>}</label>
            <input
              type="text"
              value={form[f.key]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              disabled={!editing}
              style={inputBase}
            />
          </div>
        ))}
      </div>

      {/* Bio */}
      {LABELS.filter((f) => f.multiline).map((f) => (
        <div key={f.key}>
          <label style={labelStyle}>{f.label}</label>
          <textarea
            rows={3}
            value={form[f.key]}
            onChange={set(f.key)}
            placeholder={f.placeholder}
            disabled={!editing}
            style={{ ...inputBase, fontFamily: "inherit" }}
          />
        </div>
      ))}

      {errorMsg && <p className="text-xs" style={{ color: "#EF4444" }}>{errorMsg}</p>}
      {savedMsg && <p className="text-xs" style={{ color: "#22C55E" }}>{savedMsg}</p>}
    </div>
  );
}
