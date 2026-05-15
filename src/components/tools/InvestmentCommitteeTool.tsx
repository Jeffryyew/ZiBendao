"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import type { Locale } from "@/lib/i18n";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
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
  padding: "10px 12px",
};

const textareaSt: React.CSSProperties = {
  ...inputSt,
  resize: "none",
  fontFamily: "inherit",
};

type Recommendation = "Approve" | "Conditional" | "Reject";

interface Risk {
  desc: string;
  mitigation: string;
}

interface ICForm {
  companyName: string;
  industry: string;
  stage: string;
  ask: string;
  valuation: string;
  thesis: string;
  risks: Risk[];
  revenue: string;
  ebitda: string;
  projectedRevenue: string;
  teamAssessment: string;
  recommendation: Recommendation;
  conditions: string[];
}

interface Scores {
  team: number;
  market: number;
  product: number;
  traction: number;
  valuation: number;
}

function fmtRM(n: number) {
  if (!n) return "—";
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(1)}M`;
  return `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}

export default function InvestmentCommitteeTool({ locale }: { locale: Locale }) {
  const isEn = locale === "en";

  const [form, setForm] = useState<ICForm>({
    companyName: "",
    industry: "",
    stage: "Series A",
    ask: "",
    valuation: "",
    thesis: "",
    risks: [{ desc: "", mitigation: "" }],
    revenue: "",
    ebitda: "",
    projectedRevenue: "",
    teamAssessment: "",
    recommendation: "Approve",
    conditions: [""],
  });

  const [scores, setScores] = useState<Scores>({ team: 3, market: 3, product: 3, traction: 3, valuation: 3 });
  const [copied, setCopied] = useState(false);

  const set = (f: keyof ICForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const setRisk = (i: number, f: keyof Risk, v: string) =>
    setForm((p) => { const r = [...p.risks]; r[i] = { ...r[i], [f]: v }; return { ...p, risks: r }; });

  const addRisk = () => {
    if (form.risks.length < 5) setForm((p) => ({ ...p, risks: [...p.risks, { desc: "", mitigation: "" }] }));
  };

  const removeRisk = (i: number) =>
    setForm((p) => ({ ...p, risks: p.risks.filter((_, idx) => idx !== i) }));

  const setCondition = (i: number, v: string) =>
    setForm((p) => { const c = [...p.conditions]; c[i] = v; return { ...p, conditions: c }; });

  const addCondition = () => {
    if (form.conditions.length < 5) setForm((p) => ({ ...p, conditions: [...p.conditions, ""] }));
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const radarData = [
    { dim: isEn ? "Team" : "团队", score: scores.team },
    { dim: isEn ? "Market" : "市场", score: scores.market },
    { dim: isEn ? "Product" : "产品", score: scores.product },
    { dim: isEn ? "Traction" : "牵引力", score: scores.traction },
    { dim: isEn ? "Valuation" : "估值", score: scores.valuation },
  ];

  const memoText = `
INVESTMENT COMMITTEE MEMO
${isEn ? "Date" : "日期"}: ${new Date().toLocaleDateString()}


COMPANY: ${form.companyName || "—"}
INDUSTRY: ${form.industry || "—"}  |  STAGE: ${form.stage}
ASK: ${fmtRM(parseFloat(form.ask))}  |  VALUATION: ${fmtRM(parseFloat(form.valuation))}


INVESTMENT THESIS:
${form.thesis || "—"}

KEY RISKS:
${form.risks.filter((r) => r.desc).map((r, i) => `${i + 1}. ${r.desc}\n   Mitigation: ${r.mitigation}`).join("\n")}

FINANCIAL SUMMARY:
Revenue: ${fmtRM(parseFloat(form.revenue))}
EBITDA: ${fmtRM(parseFloat(form.ebitda))}
3Y Revenue Projection: ${fmtRM(parseFloat(form.projectedRevenue))}

TEAM ASSESSMENT:
${form.teamAssessment || "—"}

SCORING: ${totalScore}/25
Team: ${scores.team} | Market: ${scores.market} | Product: ${scores.product} | Traction: ${scores.traction} | Valuation: ${scores.valuation}

RECOMMENDATION: ${form.recommendation.toUpperCase()}
${form.recommendation === "Conditional" && form.conditions.filter(Boolean).length > 0 ? "CONDITIONS:\n" + form.conditions.filter(Boolean).map((c, i) => `${i + 1}. ${c}`).join("\n") : ""}
`.trim();

  const copyMemo = () => {
    navigator.clipboard.writeText(memoText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const recColor = form.recommendation === "Approve" ? "#10B981" : form.recommendation === "Reject" ? "#EF4444" : GOLD;

  return (
    <ToolShell
      icon=""
      title={isEn ? "Investment Committee" : "投资委员会"}
      desc={isEn ? "Build IC memos, score investments and structure governance decisions." : "构建IC备忘录、评分投资机会并建立治理决策框架。"}
      levelRequired={3}
      backHref="/dashboard/capital"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-4">
          {/* Basic info */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>COMPANY INFO / 公司信息</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { f: "companyName" as const, label: isEn ? "Company Name" : "公司名称", placeholder: isEn ? "ABC Sdn Bhd" : "ABC 私人有限公司" },
                { f: "industry" as const, label: isEn ? "Industry" : "行业", placeholder: isEn ? "FinTech" : "金融科技" },
                { f: "stage" as const, label: isEn ? "Stage" : "融资阶段", placeholder: "Series A" },
                { f: "ask" as const, label: isEn ? "Fundraising Ask (RM)" : "融资额 (RM)", placeholder: "5000000" },
                { f: "valuation" as const, label: isEn ? "Pre-Money Valuation (RM)" : "融资前估值 (RM)", placeholder: "20000000" },
              ].map(({ f, label, placeholder }) => (
                <div key={f}>
                  <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>{label}</label>
                  <input
                    type={f === "ask" || f === "valuation" ? "number" : "text"}
                    value={form[f] as string}
                    onChange={set(f)}
                    placeholder={placeholder}
                    style={inputSt}
                    onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Investment thesis */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>INVESTMENT THESIS / 投资逻辑</p>
            <textarea
              value={form.thesis}
              onChange={set("thesis")}
              rows={4}
              placeholder={isEn ? "Describe the key investment thesis and rationale..." : "描述核心投资逻辑与理由..."}
              style={textareaSt}
              onFocus={(e) => (e.target.style.borderColor = PURPLE)}
              onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
            />
          </div>

          {/* Key risks */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-mono" style={{ color: "#666660" }}>KEY RISKS / 关键风险</p>
              {form.risks.length < 5 && (
                <button onClick={addRisk} className="text-xs px-3 py-1 rounded-lg" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.25)" }}>
                  + {isEn ? "Add Risk" : "添加风险"}
                </button>
              )}
            </div>
            <div className="space-y-4">
              {form.risks.map((r, i) => (
                <div key={i} className="rounded-xl p-3" style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A" }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-mono" style={{ color: PURPLE }}>Risk {i + 1}</span>
                    {form.risks.length > 1 && (
                      <button onClick={() => removeRisk(i)} className="text-xs" style={{ color: "#444440" }}>×</button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={isEn ? "Risk description" : "风险描述"}
                    value={r.desc}
                    onChange={(e) => setRisk(i, "desc", e.target.value)}
                    style={{ ...inputSt, marginBottom: "8px" }}
                    onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                  <input
                    type="text"
                    placeholder={isEn ? "Mitigation strategy" : "缓解措施"}
                    value={r.mitigation}
                    onChange={(e) => setRisk(i, "mitigation", e.target.value)}
                    style={inputSt}
                    onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>FINANCIAL SUMMARY / 财务摘要</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { f: "revenue" as const, label: isEn ? "Revenue (CY)" : "当年营收" },
                { f: "ebitda" as const, label: "EBITDA" },
                { f: "projectedRevenue" as const, label: isEn ? "3Y Revenue Proj." : "3年营收预测" },
              ].map(({ f, label }) => (
                <div key={f}>
                  <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>{label}</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#555550" }}>RM</span>
                    <input
                      type="number"
                      value={form[f] as string}
                      onChange={set(f)}
                      style={{ ...inputSt, paddingLeft: "36px" }}
                      onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team + Recommendation */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>TEAM & RECOMMENDATION / 团队与建议</p>
            <textarea
              value={form.teamAssessment}
              onChange={set("teamAssessment")}
              rows={3}
              placeholder={isEn ? "Assess the founding team, key members, and track record..." : "评估创始团队、核心成员与过往成绩..."}
              style={{ ...textareaSt, marginBottom: "16px" }}
              onFocus={(e) => (e.target.style.borderColor = PURPLE)}
              onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
            />
            <div className="flex gap-3 mb-4">
              {(["Approve", "Conditional", "Reject"] as Recommendation[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setForm((p) => ({ ...p, recommendation: r }))}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: form.recommendation === r
                      ? r === "Approve" ? "rgba(16,185,129,0.2)" : r === "Reject" ? "rgba(239,68,68,0.2)" : "rgba(201,168,76,0.2)"
                      : "#0D0D0D",
                    border: `1px solid ${form.recommendation === r
                      ? r === "Approve" ? "#10B981" : r === "Reject" ? "#EF4444" : GOLD
                      : "#2A2A2A"}`,
                    color: form.recommendation === r
                      ? r === "Approve" ? "#10B981" : r === "Reject" ? "#EF4444" : GOLD
                      : "#555550",
                  }}
                >
                  {isEn ? r : r === "Approve" ? "批准" : r === "Reject" ? "拒绝" : "有条件批准"}
                </button>
              ))}
            </div>
            {form.recommendation === "Conditional" && (
              <div className="space-y-2">
                {form.conditions.map((c, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`${isEn ? "Condition" : "条件"} ${i + 1}`}
                    value={c}
                    onChange={(e) => setCondition(i, e.target.value)}
                    style={inputSt}
                    onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                ))}
                {form.conditions.length < 5 && (
                  <button onClick={addCondition} className="text-xs" style={{ color: PURPLE }}>
                    + {isEn ? "Add condition" : "添加条件"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Scoring + Preview */}
        <div className="lg:col-span-2 space-y-5">
          {/* Scoring matrix */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-mono" style={{ color: "#666660" }}>SCORING MATRIX / 评分矩阵</p>
              <div className="text-center">
                <span className="text-2xl font-bold font-mono" style={{ color: GOLD }}>{totalScore}</span>
                <span className="text-xs" style={{ color: "#555550" }}>/25</span>
              </div>
            </div>

            {/* Score sliders */}
            <div className="space-y-3 mb-5">
              {(Object.keys(scores) as (keyof Scores)[]).map((dim) => (
                <div key={dim}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#A0A09A" }}>
                      {isEn ? dim.charAt(0).toUpperCase() + dim.slice(1) : { team: "团队", market: "市场", product: "产品", traction: "牵引力", valuation: "估值" }[dim]}
                    </span>
                    <span className="font-mono" style={{ color: PURPLE }}>{scores[dim]}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scores[dim]}
                    onChange={(e) => setScores((p) => ({ ...p, [dim]: parseInt(e.target.value) }))}
                    className="w-full accent-purple-500"
                  />
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2A2A2A" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "#888880" }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9, fill: "#444440" }} />
                <Radar dataKey="score" stroke={PURPLE} fill={PURPLE} fillOpacity={0.2} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                  formatter={(v) => [typeof v === "number" ? `${v}/5` : "—", undefined]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Memo preview */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-mono" style={{ color: "#666660" }}>IC MEMO PREVIEW</p>
              <button
                onClick={copyMemo}
                className="text-xs px-3 py-1 rounded-lg transition-colors"
                style={{ backgroundColor: copied ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.12)", color: copied ? "#10B981" : "#A78BFA", border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(139,92,246,0.25)"}` }}
              >
                {copied ? " Copied!" : (isEn ? "Copy Memo" : "复制备忘录")}
              </button>
            </div>
            <div
              className="text-xs leading-relaxed space-y-2 font-mono overflow-y-auto"
              style={{ color: "#A0A09A", maxHeight: "320px" }}
            >
              <div style={{ color: "#F5F5F0", fontWeight: "bold" }}>
                {isEn ? "INVESTMENT COMMITTEE MEMO" : "投资委员会备忘录"}
              </div>
              <div style={{ borderTop: "1px solid #2A2A2A", paddingTop: "8px" }}>
                <span style={{ color: "#666660" }}>COMPANY: </span><span style={{ color: "#F5F5F0" }}>{form.companyName || "—"}</span>
              </div>
              <div>
                <span style={{ color: "#666660" }}>STAGE: </span><span>{form.stage}</span>
                <span style={{ color: "#666660" }}> | ASK: </span><span>{fmtRM(parseFloat(form.ask))}</span>
              </div>
              <div>
                <span style={{ color: "#666660" }}>VALUATION: </span><span>{fmtRM(parseFloat(form.valuation))}</span>
              </div>
              {form.thesis && (
                <div style={{ borderTop: "1px solid #1E1E1E", paddingTop: "8px" }}>
                  <div style={{ color: "#666660", marginBottom: "4px" }}>THESIS:</div>
                  <div style={{ color: "#A0A09A" }}>{form.thesis}</div>
                </div>
              )}
              <div style={{ borderTop: "1px solid #1E1E1E", paddingTop: "8px" }}>
                <span style={{ color: "#666660" }}>SCORE: </span>
                <span style={{ color: GOLD, fontWeight: "bold" }}>{totalScore}/25</span>
              </div>
              <div style={{ borderTop: "1px solid #1E1E1E", paddingTop: "8px" }}>
                <span style={{ color: "#666660" }}>RECOMMENDATION: </span>
                <span style={{ color: recColor, fontWeight: "bold" }}>{form.recommendation.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
