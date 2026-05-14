"use client";

import { useState, useTransition } from "react";
import { createLesson } from "@/app/actions/admin";

const LESSON_TYPES = [
  { value: "VIDEO", label: "视频" },
  { value: "READING", label: "阅读" },
  { value: "QUIZ", label: "测验" },
  { value: "EXERCISE", label: "练习" },
];

interface Props {
  moduleId: string;
  nextOrder: number;
}

export default function NewLessonForm({ moduleId, nextOrder }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("VIDEO");
  const [order, setOrder] = useState(nextOrder);
  const [points, setPoints] = useState(10);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const res = await createLesson(moduleId, title, type, order, points, content);
      if (res.error) { setError(res.error); return; }
      setTitle(""); setContent(""); setOrder((o) => o + 1);
    });
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>课节标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：什么是资本？"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          >
            {LESSON_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>积分</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min={1}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>内容（文字描述）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="课节内容说明或脚本…"
            className="w-full rounded-xl px-4 py-3 text-sm resize-y outline-none"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          />
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={pending || !title}
        className="px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity"
        style={{ backgroundColor: "#C9A84C", color: "#0D0D0D", opacity: pending || !title ? 0.5 : 1 }}
      >
        {pending ? "创建中…" : "添加课节"}
      </button>
    </div>
  );
}
