"use client";

import { useState, useTransition } from "react";
import {
  createTool,
  toggleToolActive,
  seedDefaultTools,
  grantToolAccess,
  revokeToolAccess,
} from "@/app/actions/admin";

interface ToolRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  requiredLevel: number;
  isActive: boolean;
}

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  toolAccess: { toolId: string }[];
}

interface Props {
  tools: ToolRecord[];
  clients: ClientRecord[];
}

const TOOL_ICONS: Record<string, string> = {
  "financial-roadmap": "FV",
  "pricing-system": "QT",
  "market-cap": "PE",
  "pat-kpi": "KPI",
};

export default function ToolsPanel({ tools, clients }: Props) {
  const [tab, setTab] = useState<"catalog" | "access">("catalog");
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [level, setLevel] = useState(1);
  const [formError, setFormError] = useState("");

  const [pending, startTransition] = useTransition();

  function handleCreate() {
    setFormError("");
    startTransition(async () => {
      const res = await createTool(name, slug, desc, level);
      if (res.error) { setFormError(res.error); return; }
      setName(""); setSlug(""); setDesc("");
    });
  }

  function handleSeed() {
    startTransition(async () => { await seedDefaultTools(); });
  }

  function toggleAccess(clientId: string, toolId: string, has: boolean) {
    startTransition(async () => {
      await (has ? revokeToolAccess(clientId, toolId) : grantToolAccess(clientId, toolId));
    });
  }

  const selectedTool = tools.find((t) => t.id === selectedToolId) ?? tools[0];

  return (
    <div style={{ opacity: pending ? 0.7 : 1 }}>
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: "#111111" }}>
        {[
          { key: "catalog", label: "工具目录" },
          { key: "access", label: "客户权限" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "catalog" | "access")}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === t.key ? "#1A1A1A" : "transparent",
              color: tab === t.key ? "#F5F5F0" : "#666660",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Catalog tab ─── */}
      {tab === "catalog" && (
        <div className="space-y-6">
          {/* Seed button */}
          {tools.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center space-y-4"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <p className="text-sm" style={{ color: "#666660" }}>工具目录为空，点击初始化4个默认工具。</p>
              <button
                onClick={handleSeed}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
              >
                初始化默认工具
              </button>
            </div>
          )}

          {tools.length > 0 && (
            <div className="space-y-2">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
                >
                  <span className="text-2xl flex-shrink-0">{TOOL_ICONS[tool.slug] ?? "🔧"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{tool.name}</span>
                      <span className="text-xs font-mono" style={{ color: "#555550" }}>{tool.slug}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
                      >
                        L{tool.requiredLevel}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#666660" }}>{tool.description}</p>
                  </div>
                  <button
                    onClick={() => startTransition(async () => { await toggleToolActive(tool.id, !tool.isActive); })}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: tool.isActive ? "rgba(76,175,130,0.15)" : "rgba(239,68,68,0.1)",
                      color: tool.isActive ? "#4CAF82" : "#EF4444",
                    }}
                  >
                    {tool.isActive ? "启用" : "停用"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Create tool form */}
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "#F5F5F0" }}>添加工具</h2>
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "工具名称", value: name, onChange: setName, placeholder: "金融路线图方程式" },
                  { label: "标识 (slug)", value: slug, onChange: setSlug, placeholder: "financial-roadmap" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>{f.label}</label>
                    <input
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>描述</label>
                  <input
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="工具简介"
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
              {formError && <p className="text-sm" style={{ color: "#EF4444" }}>{formError}</p>}
              <button
                onClick={handleCreate}
                disabled={pending || !name || !slug}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity"
                style={{ backgroundColor: "#C9A84C", color: "#0D0D0D", opacity: pending || !name || !slug ? 0.5 : 1 }}
              >
                {pending ? "创建中…" : "创建工具"}
              </button>
            </div>
          </div>

          {tools.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleSeed}
                className="text-xs underline"
                style={{ color: "#444440" }}
              >
                重新同步默认工具
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Access tab ─── */}
      {tab === "access" && (
        <div className="space-y-6">
          {tools.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <p className="text-sm" style={{ color: "#666660" }}>请先在「工具目录」中添加工具。</p>
            </div>
          ) : clients.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <p className="text-sm" style={{ color: "#666660" }}>暂无咨询客户，请先在用户管理中创建。</p>
            </div>
          ) : (
            <>
              {/* Tool selector */}
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedToolId(tool.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: selectedTool?.id === tool.id ? "#1A1A1A" : "transparent",
                      border: `1px solid ${selectedTool?.id === tool.id ? "#C9A84C" : "#1A1A1A"}`,
                      color: selectedTool?.id === tool.id ? "#C9A84C" : "#666660",
                    }}
                  >
                    <span>{TOOL_ICONS[tool.slug] ?? "🔧"}</span>
                    {tool.name}
                  </button>
                ))}
              </div>

              {/* Client list for selected tool */}
              {selectedTool && (
                <div>
                  <p className="text-sm mb-4" style={{ color: "#A0A09A" }}>
                    <span style={{ color: "#C9A84C" }}>{selectedTool.name}</span> — 选择哪些客户可以使用此工具
                  </p>
                  <div className="space-y-2">
                    {clients.map((client) => {
                      const hasAccess = client.toolAccess.some((a) => a.toolId === selectedTool.id);
                      return (
                        <div
                          key={client.id}
                          className="flex items-center justify-between rounded-xl px-5 py-3.5"
                          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
                        >
                          <div>
                            <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{client.name}</div>
                            <div className="text-xs mt-0.5" style={{ color: "#555550" }}>{client.email}</div>
                          </div>
                          <button
                            onClick={() => toggleAccess(client.id, selectedTool.id, hasAccess)}
                            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: hasAccess ? "rgba(201,168,76,0.15)" : "#1A1A1A",
                              border: `1px solid ${hasAccess ? "#C9A84C" : "#2A2A2A"}`,
                              color: hasAccess ? "#C9A84C" : "#666660",
                            }}
                          >
                            {hasAccess ? "✓ 已授权" : "+ 授权"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
