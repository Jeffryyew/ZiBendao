"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import type { Locale } from "@/lib/i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PURPLE = "#8B5CF6";
const GOLD = "#C9A84C";

const inputSt: React.CSSProperties = {
  backgroundColor: "#0D0D0D",
  border: "1px solid #2A2A2A",
  color: "#F5F5F0",
  borderRadius: "10px",
  fontSize: "13px",
  fontFamily: "var(--font-mono)",
  outline: "none",
  width: "100%",
  padding: "8px 10px",
};

const CATEGORIES = ["Financial", "Operational", "Legal", "Market", "Reputational", "Technology"] as const;
type RiskCategory = (typeof CATEGORIES)[number];
type RiskStatus = "Active" | "Mitigated" | "Monitoring";

interface RiskItem {
  id: string;
  name: string;
  category: RiskCategory;
  likelihood: number;
  impact: number;
  mitigation: string;
  owner: string;
  status: RiskStatus;
}

let _rid = 1;
const uid = () => String(_rid++);

function riskColor(score: number) {
  if (score >= 15) return "#EF4444";
  if (score >= 7) return "#F59E0B";
  return "#10B981";
}

function riskLabel(score: number) {
  if (score >= 15) return "High";
  if (score >= 7) return "Medium";
  return "Low";
}

const CAT_COLORS: Record<RiskCategory, string> = {
  Financial: GOLD,
  Operational: "#3B82F6",
  Legal: "#EF4444",
  Market: "#8B5CF6",
  Reputational: "#F59E0B",
  Technology: "#10B981",
};

const CAT_ZH: Record<RiskCategory, string> = {
  Financial: "财务",
  Operational: "运营",
  Legal: "法律",
  Market: "市场",
  Reputational: "声誉",
  Technology: "技术",
};

const DEFAULT_APPETITE = "Our organization maintains a low risk appetite for financial and legal risks, and moderate appetite for operational and market risks. Technology risks are monitored continuously with established controls.";
const DEFAULT_APPETITE_ZH = "我们对财务和法律风险保持低风险偏好，对运营和市场风险保持中等偏好。技术风险通过持续监控和既定控制措施加以管理。";

export default function RiskControlTool({ locale }: { locale: Locale }) {
  const isEn = locale === "en";

  const [risks, setRisks] = useState<RiskItem[]>([
    {
      id: uid(),
      name: isEn ? "Currency Exchange Risk" : "汇率风险",
      category: "Financial",
      likelihood: 3,
      impact: 4,
      mitigation: isEn ? "Hedge with forward contracts" : "使用远期合约对冲",
      owner: "CFO",
      status: "Active",
    },
    {
      id: uid(),
      name: isEn ? "Key Person Dependency" : "关键人员依赖",
      category: "Operational",
      likelihood: 2,
      impact: 5,
      mitigation: isEn ? "Succession planning and knowledge transfer" : "继任规划与知识传承",
      owner: "HR Director",
      status: "Monitoring",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newRisk, setNewRisk] = useState({
    name: "",
    category: "Financial" as RiskCategory,
    likelihood: 3,
    impact: 3,
    mitigation: "",
    owner: "",
    status: "Active" as RiskStatus,
  });

  const [appetite, setAppetite] = useState(isEn ? DEFAULT_APPETITE : DEFAULT_APPETITE_ZH);

  const setNr = (f: keyof typeof newRisk) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setNewRisk((p) => ({ ...p, [f]: e.target.value }));

  const addRisk = () => {
    if (!newRisk.name) return;
    setRisks((p) => [...p, { id: uid(), ...newRisk }]);
    setNewRisk({ name: "", category: "Financial", likelihood: 3, impact: 3, mitigation: "", owner: "", status: "Active" });
    setShowForm(false);
  };

  const removeRisk = (id: string) => setRisks((p) => p.filter((r) => r.id !== id));

  const updateStatus = (id: string, status: RiskStatus) =>
    setRisks((p) => p.map((r) => r.id === id ? { ...r, status } : r));

  // Summary stats
  const avgScore = risks.length > 0 ? risks.reduce((s, r) => s + r.likelihood * r.impact, 0) / risks.length : 0;
  const highest = risks.length > 0 ? risks.reduce((a, b) => a.likelihood * a.impact > b.likelihood * b.impact ? a : b) : null;

  // Category bar chart data
  const catData = CATEGORIES.map((c) => {
    const catRisks = risks.filter((r) => r.category === c);
    const avg = catRisks.length > 0 ? catRisks.reduce((s, r) => s + r.likelihood * r.impact, 0) / catRisks.length : 0;
    return { name: isEn ? c : CAT_ZH[c], avg: parseFloat(avg.toFixed(1)), count: catRisks.length, color: CAT_COLORS[c] };
  }).filter((d) => d.count > 0);

  const selectSt: React.CSSProperties = { ...inputSt, cursor: "pointer" };

  return (
    <ToolShell
      icon=""
      title={isEn ? "Risk Control System" : "风控系统"}
      desc={isEn ? "Enterprise risk register, 5×5 matrix, and category heat map." : "企业风险登记册、5×5风险矩阵与分类热力图。"}
      levelRequired={3}
      backHref="/tools"
    >
      <div className="space-y-6">
        {/* Summary + Add button row */}
        <div className="flex flex-wrap gap-4 items-start">
          <div className="flex gap-3 flex-wrap flex-1">
            {[
              { label: isEn ? "Total Risks" : "风险总数", value: risks.length.toString(), color: PURPLE },
              { label: isEn ? "Avg Score" : "平均分", value: avgScore.toFixed(1), color: GOLD },
              { label: isEn ? "High Risks" : "高风险", value: risks.filter((r) => r.likelihood * r.impact >= 15).length.toString(), color: "#EF4444" },
              { label: isEn ? "Active" : "活跃", value: risks.filter((r) => r.status === "Active").length.toString(), color: "#F59E0B" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E", minWidth: "80px" }}>
                <div className="text-xl font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "#555550" }}>{m.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: showForm ? "#1A1A1A" : PURPLE, color: showForm ? "#666660" : "#fff", border: `1px solid ${showForm ? "#2A2A2A" : PURPLE}` }}
          >
            {showForm ? (isEn ? "Cancel" : "取消") : `+ ${isEn ? "Add Risk" : "添加风险"}`}
          </button>
        </div>

        {/* Add risk form */}
        {showForm && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: `1px solid rgba(139,92,246,0.3)` }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "NEW RISK" : "新风险"}</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Risk Name" : "风险名称"}</label>
                <input type="text" value={newRisk.name} onChange={setNr("name")} placeholder={isEn ? "Describe the risk..." : "描述风险..."} style={inputSt} onFocus={(e) => (e.target.style.borderColor = PURPLE)} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Category" : "类别"}</label>
                <select value={newRisk.category} onChange={setNr("category")} style={selectSt}>
                  {CATEGORIES.map((c) => <option key={c} value={c} style={{ backgroundColor: "#1A1A1A" }}>{isEn ? c : CAT_ZH[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Status" : "状态"}</label>
                <select value={newRisk.status} onChange={setNr("status")} style={selectSt}>
                  {(["Active", "Mitigated", "Monitoring"] as RiskStatus[]).map((s) => <option key={s} value={s} style={{ backgroundColor: "#1A1A1A" }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? `Likelihood: ${newRisk.likelihood}/5` : `可能性: ${newRisk.likelihood}/5`}</label>
                <input type="range" min={1} max={5} value={newRisk.likelihood} onChange={(e) => setNewRisk((p) => ({ ...p, likelihood: parseInt(e.target.value) }))} className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? `Impact: ${newRisk.impact}/5` : `影响: ${newRisk.impact}/5`}</label>
                <input type="range" min={1} max={5} value={newRisk.impact} onChange={(e) => setNewRisk((p) => ({ ...p, impact: parseInt(e.target.value) }))} className="w-full accent-purple-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Mitigation Strategy" : "缓解措施"}</label>
                <input type="text" value={newRisk.mitigation} onChange={setNr("mitigation")} placeholder={isEn ? "How will you mitigate this risk?" : "如何缓解此风险？"} style={inputSt} onFocus={(e) => (e.target.style.borderColor = PURPLE)} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Owner" : "负责人"}</label>
                <input type="text" value={newRisk.owner} onChange={setNr("owner")} placeholder={isEn ? "Risk owner" : "风险负责人"} style={inputSt} onFocus={(e) => (e.target.style.borderColor = PURPLE)} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
              </div>
              <div className="flex items-end">
                <div className="rounded-xl px-4 py-2 w-full text-center" style={{ backgroundColor: `${riskColor(newRisk.likelihood * newRisk.impact)}20`, border: `1px solid ${riskColor(newRisk.likelihood * newRisk.impact)}50` }}>
                  <span className="text-lg font-bold font-mono" style={{ color: riskColor(newRisk.likelihood * newRisk.impact) }}>{newRisk.likelihood * newRisk.impact}</span>
                  <span className="text-xs ml-1" style={{ color: "#666660" }}>({riskLabel(newRisk.likelihood * newRisk.impact)})</span>
                </div>
              </div>
            </div>
            <button onClick={addRisk} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: PURPLE, color: "#fff" }}>
              {isEn ? "Add to Register" : "添加到登记册"}
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Risk Register */}
          <div className="lg:col-span-3 space-y-5">
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>RISK REGISTER / 风险登记册</p>
              {risks.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "#444440" }}>{isEn ? "No risks added yet" : "暂无风险"}</p>
              ) : (
                <div className="space-y-3">
                  {risks.sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact).map((r) => {
                    const score = r.likelihood * r.impact;
                    const col = riskColor(score);
                    return (
                      <div key={r.id} className="rounded-xl p-4" style={{ backgroundColor: "#0D0D0D", border: `1px solid ${col}30` }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>{r.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${CAT_COLORS[r.category]}15`, color: CAT_COLORS[r.category], border: `1px solid ${CAT_COLORS[r.category]}30` }}>
                              {isEn ? r.category : CAT_ZH[r.category]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-lg font-bold font-mono" style={{ color: col }}>{score}</span>
                            <button onClick={() => removeRisk(r.id)} className="text-xs" style={{ color: "#3A3A3A" }}>×</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <span style={{ color: "#666660" }}>L:{r.likelihood}/5 × I:{r.impact}/5</span>
                          <span style={{ color: "#666660" }}>{isEn ? "Owner" : "负责人"}: {r.owner || "—"}</span>
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value as RiskStatus)}
                            className="rounded px-1"
                            style={{ backgroundColor: "#1A1A1A", color: r.status === "Mitigated" ? "#10B981" : r.status === "Monitoring" ? GOLD : "#EF4444", border: "1px solid #2A2A2A", fontSize: "11px" }}
                          >
                            {(["Active", "Mitigated", "Monitoring"] as RiskStatus[]).map((s) => <option key={s} value={s} style={{ backgroundColor: "#1A1A1A" }}>{s}</option>)}
                          </select>
                        </div>
                        {r.mitigation && (
                          <p className="text-xs" style={{ color: "#666660" }}>
                            <span style={{ color: "#444440" }}>{isEn ? "Mitigation: " : "缓解: "}</span>{r.mitigation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Highest risk callout */}
            {highest && (
              <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span className="text-lg"></span>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#EF4444" }}>{isEn ? "Highest Risk" : "最高风险"}</p>
                  <p className="text-sm" style={{ color: "#A0A09A" }}>{highest.name} — {isEn ? "Score" : "得分"} {highest.likelihood * highest.impact}/25</p>
                </div>
              </div>
            )}

            {/* Risk appetite */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-3" style={{ color: "#666660" }}>RISK APPETITE / 风险偏好声明</p>
              <textarea
                value={appetite}
                onChange={(e) => setAppetite(e.target.value)}
                rows={4}
                style={{ ...inputSt, resize: "none", fontFamily: "inherit", fontSize: "12px" }}
                onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
              />
            </div>
          </div>

          {/* 5×5 Matrix + Heat bar */}
          <div className="lg:col-span-2 space-y-5">
            {/* 5×5 Risk Matrix */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>5×5 RISK MATRIX / 风险矩阵</p>

              <div className="relative">
                {/* Y axis label */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs" style={{ color: "#555550", transformOrigin: "center" }}>
                  {isEn ? "Impact →" : "影响 →"}
                </div>

                <div className="ml-4">
                  <div
                    className="grid gap-0.5"
                    style={{ gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(5, 1fr)" }}
                  >
                    {[5, 4, 3, 2, 1].map((impact) =>
                      [1, 2, 3, 4, 5].map((likelihood) => {
                        const score = likelihood * impact;
                        const cellColor = score >= 15 ? "rgba(239,68,68,0.25)" : score >= 7 ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.15)";
                        const cellBorder = score >= 15 ? "rgba(239,68,68,0.3)" : score >= 7 ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.2)";
                        const risksHere = risks.filter((r) => r.likelihood === likelihood && r.impact === impact);
                        return (
                          <div
                            key={`${impact}-${likelihood}`}
                            className="aspect-square rounded-sm flex items-center justify-center relative"
                            style={{ backgroundColor: cellColor, border: `1px solid ${cellBorder}`, minHeight: "36px" }}
                            title={`L${likelihood} × I${impact} = ${score}`}
                          >
                            <span className="text-xs font-mono" style={{ color: riskColor(score), opacity: 0.5 }}>{score}</span>
                            {risksHere.length > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                  className="w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{ backgroundColor: riskColor(score), color: "#fff", fontSize: "9px" }}
                                  title={risksHere.map((r) => r.name).join(", ")}
                                >
                                  {risksHere.length}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    {[1, 2, 3, 4, 5].map((l) => <span key={l} className="text-xs text-center flex-1" style={{ color: "#444440" }}>{l}</span>)}
                  </div>
                  <div className="text-center text-xs mt-0.5" style={{ color: "#555550" }}>{isEn ? "Likelihood →" : "可能性 →"}</div>
                </div>
              </div>

              <div className="flex gap-3 mt-3 text-xs">
                {[{ label: isEn ? "Low" : "低", color: "#10B981" }, { label: isEn ? "Medium" : "中", color: "#F59E0B" }, { label: isEn ? "High" : "高", color: "#EF4444" }].map((m) => (
                  <div key={m.label} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `${m.color}40` }} />
                    <span style={{ color: "#666660" }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Heat bar by category */}
            {catData.length > 0 && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
                <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "RISK BY CATEGORY" : "分类风险热图"}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" horizontal={false} />
                    <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 10, fill: "#555550" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#A0A09A" }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                      formatter={(v) => [typeof v === "number" ? `${v} avg score` : "—", undefined]}
                    />
                    <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                      {catData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
