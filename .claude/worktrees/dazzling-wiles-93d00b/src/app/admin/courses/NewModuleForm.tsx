"use client";

import { useState, useTransition } from "react";
import { createModule } from "@/app/actions/admin";

export default function NewModuleForm({ nextOrder }: { nextOrder: number }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [level, setLevel] = useState(1);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const res = await createModule(title, description, order, level);
      if (res.error) { setError(res.error); return; }
      setTitle(""); setDescription("");
    });
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>模块名称</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：资本市场基础"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>描述</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简短描述模块内容"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>排序</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            min={1}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>所需等级</label>
          <select
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          >
            <option value={1}>L1</option>
            <option value={2}>L2</option>
            <option value={3}>L3</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={pending || !title}
        className="px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity"
        style={{ backgroundColor: "#C9A84C", color: "#0D0D0D", opacity: pending || !title ? 0.5 : 1 }}
      >
        {pending ? "创建中…" : "创建模块"}
      </button>
    </div>
  );
}
