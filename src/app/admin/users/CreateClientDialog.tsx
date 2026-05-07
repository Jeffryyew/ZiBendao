"use client";

import { useState, useTransition } from "react";
import { createClientUser } from "@/app/actions/admin";

export default function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
    setName(""); setEmail(""); setPassword(""); setError("");
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const res = await createClientUser(name, email, password);
      if (res.error) { setError(res.error); return; }
      handleClose();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
        style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
      >
        + 创建客户账户
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.8)" }} onClick={handleClose} />
          <div
            className="relative w-full max-w-md rounded-2xl p-7 space-y-5 z-10"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "#F5F5F0" }}>创建咨询客户账户</h2>
              <button onClick={handleClose} className="text-sm" style={{ color: "#666660" }}>✕</button>
            </div>

            {[
              { label: "姓名", value: name, onChange: setName, type: "text", placeholder: "客户姓名" },
              { label: "邮箱", value: email, onChange: setEmail, type: "email", placeholder: "client@example.com" },
              { label: "初始密码", value: password, onChange: setPassword, type: "password", placeholder: "至少8位" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                />
              </div>
            ))}

            {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={pending}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity"
                style={{ backgroundColor: "#C9A84C", color: "#0D0D0D", opacity: pending ? 0.6 : 1 }}
              >
                {pending ? "创建中…" : "创建账户"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
