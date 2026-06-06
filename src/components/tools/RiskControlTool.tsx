"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

type RiskCategory = "financial" | "fundraising";
type Likelihood = "low" | "medium" | "high";
type Impact = "low" | "medium" | "high";

interface Risk {
  id: string;
  category: RiskCategory;
  title: string;
  likelihood: Likelihood;
  impact: Impact;
  mitigation: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category: "financial" | "legal" | "governance" | "fundraising";
}

interface T13Form {
  risks: Risk[];
  checklist: ChecklistItem[];
}

const LIKELIHOOD_SCORE: Record<Likelihood, number> = { low: 1, medium: 2, high: 3 };
const IMPACT_SCORE: Record<Impact, number> = { low: 1, medium: 2, high: 3 };

const RISK_MATRIX_COLOR: Record<number, string> = {
  1: "#22C55E",  // score 1–2: green
  2: "#22C55E",
  3: "#F59E0B",  // 3–4: yellow
  4: "#F59E0B",
  5: "#EF4444",  // 5–6: red
  6: "#EF4444",
  7: "#EF4444",
  8: "#EF4444",
  9: "#EF4444",
};

function riskColor(l: Likelihood, i: Impact): string {
  const score = LIKELIHOOD_SCORE[l] * IMPACT_SCORE[i];
  return RISK_MATRIX_COLOR[score] ?? "#EF4444";
}

function riskScore(l: Likelihood, i: Impact): number {
  return LIKELIHOOD_SCORE[l] * IMPACT_SCORE[i];
}

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

const DEFAULT_PRE_DD_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "财务报表（3年）已整理并签署", done: false, category: "financial" },
  { id: "c2", label: "审计报告或管理账目已备妥", done: false, category: "financial" },
  { id: "c3", label: "纳税申报表（3年）已归档", done: false, category: "financial" },
  { id: "c4", label: "银行流水（12个月）可提供", done: false, category: "financial" },
  { id: "c5", label: "公司注册文件（M&A / Constitution）已更新", done: false, category: "legal" },
  { id: "c6", label: "股权结构表（Cap Table）已维护", done: false, category: "legal" },
  { id: "c7", label: "核心团队劳动合同已签署", done: false, category: "legal" },
  { id: "c8", label: "关键知识产权已注册或申请", done: false, category: "legal" },
  { id: "c9", label: "董事会成员结构清晰", done: false, category: "governance" },
  { id: "c10", label: "公司章程中有完整的反稀释条款", done: false, category: "governance" },
  { id: "c11", label: "历史融资轮次文件（SPA / SHA）已归档", done: false, category: "fundraising" },
  { id: "c12", label: "融资规划（用途 / 时间线）已准备", done: false, category: "fundraising" },
  { id: "c13", label: "Pitch Deck 最新版本已完成", done: false, category: "fundraising" },
  { id: "c14", label: "目标投资人名单已整理", done: false, category: "fundraising" },
];

const DEFAULT_RISKS: Risk[] = [
  { id: "r1", category: "financial", title: "现金流短缺导致运营中断", likelihood: "medium", impact: "high", mitigation: "维持 3 个月运营现金储备，监控月度现金状态" },
  { id: "r2", category: "financial", title: "收入未达预测目标", likelihood: "medium", impact: "medium", mitigation: "设立月度预测 vs 实际追踪机制，超过 20% 偏差时触发调整" },
  { id: "r3", category: "financial", title: "债务违约风险（DSCR 不足）", likelihood: "low", impact: "high", mitigation: "季度 DSCR 监控，提前 2 个季度谈判再融资条款" },
  { id: "r4", category: "fundraising", title: "关键融资轮次谈判失败", likelihood: "medium", impact: "high", mitigation: "同时推进至少 3 位投资人，降低单一依赖" },
  { id: "r5", category: "fundraising", title: "估值分歧导致融资受阻", likelihood: "medium", impact: "medium", mitigation: "提前准备第三方估值报告，设定合理估值区间" },
];

const DEFAULT_FORM: T13Form = {
  risks: DEFAULT_RISKS,
  checklist: DEFAULT_PRE_DD_CHECKLIST,
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "风险管理让融资更顺畅",
    body: "投资人在尽调时最怕两件事：财务风险和融资风险。这个工具帮你提前识别、评估和应对这两类核心风险，并提供 Pre-DD 准备清单。",
  },
  {
    title: "风险矩阵：概率 × 影响",
    body: "每个风险用「发生概率」（低/中/高）× 「影响程度」（低/中/高）定级。绿色 = 可接受，黄色 = 需要关注，红色 = 必须立即制定对策。",
  },
  {
    title: "系统自动生成财务风险信号",
    body: "系统读取 T01–T03 的数据，自动判断：现金流是否健康、DSCR 是否达标、营收是否达路线图目标，生成对应风险条目。",
  },
  {
    title: "Pre-DD 准备清单",
    body: "勾选你已完成的准备项目。当投资人要求启动 Due Diligence 时，你可以用这份清单快速评估自己的准备度。",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#141414", border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#1E1E1E"}` }}
    >
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#555550" }}>{children}</p>;
}

const LIKELIHOOD_OPTS: { value: Likelihood; label: string }[] = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

const IMPACT_OPTS: { value: Impact; label: string }[] = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

const CHECKLIST_CATEGORIES = [
  { key: "financial", label: "财务文件", color: "#C9A84C" },
  { key: "legal", label: "法律文件", color: "#4CAF50" },
  { key: "governance", label: "公司治理", color: "#6B9FD4" },
  { key: "fundraising", label: "融资准备", color: "#F59E0B" },
] as const;

// ── Main component ─────────────────────────────────────────────────────────

export default function RiskControlTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T13Form>("risk-control");
  const [form, setForm] = useState<T13Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);

  // ── Load saved ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (savedData && !loaded) {
      setForm({
        risks: savedData.risks ?? DEFAULT_RISKS,
        checklist: savedData.checklist ?? DEFAULT_PRE_DD_CHECKLIST,
      });
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // ── Load FinancialCore ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const mode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      let companyId = "no_company";
      if (mode === "single") {
        const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
        if (sc) companyId = `single_${JSON.parse(sc).id ?? "default"}`;
      } else if (mode === "group") {
        const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
        if (ac) companyId = `group_${JSON.parse(ac).id ?? "default"}`;
      }
      if (companyId !== "no_company") {
        fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`)
          .then((r) => r.json())
          .then((snap) => {
            if (snap?.data) setCoreData(snap.data);
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";
  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  // ── Auto-generated financial signals ─────────────────────────────────

  const autoSignals = useMemo(() => {
    const signals: Array<{ label: string; ok: boolean; value: string }> = [];
    if (!coreData) return signals;

    // Cash runway (from T03)
    if (coreData.yearEndCash !== undefined && coreData.monthlyFixedCosts) {
      const runway = coreData.yearEndCash / coreData.monthlyFixedCosts;
      signals.push({
        label: "现金跑道",
        ok: runway >= 3,
        value: runway >= 0 ? runway.toFixed(1) + " 个月" : "负现金",
      });
    }

    // D/E ratio (from T02)
    if (coreData.debtToEquity !== undefined) {
      signals.push({
        label: "负债权益比（D/E）",
        ok: coreData.debtToEquity < 2,
        value: coreData.debtToEquity.toFixed(2) + "x",
      });
    }

    // Revenue vs roadmap Year 1
    if (coreData.annualRevenue && coreData.roadmapYear1Revenue) {
      const pct = (coreData.annualRevenue / coreData.roadmapYear1Revenue) * 100;
      signals.push({
        label: "营收 vs 路线图 Year 1",
        ok: pct >= 80,
        value: pct.toFixed(0) + "% 达成",
      });
    }

    // PAT vs roadmap
    if (coreData.annualPAT && coreData.roadmapYear1PAT) {
      const pct = (coreData.annualPAT / coreData.roadmapYear1PAT) * 100;
      signals.push({
        label: "PAT vs 路线图 Year 1",
        ok: pct >= 80,
        value: pct.toFixed(0) + "% 达成",
      });
    }

    return signals;
  }, [coreData]);

  // ── Calculations ──────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const highRisks = form.risks.filter((r) => riskScore(r.likelihood, r.impact) >= 6).length;
    const mediumRisks = form.risks.filter((r) => { const s = riskScore(r.likelihood, r.impact); return s >= 3 && s < 6; }).length;
    const lowRisks = form.risks.filter((r) => riskScore(r.likelihood, r.impact) < 3).length;

    const checklistTotal = form.checklist.length;
    const checklistDone = form.checklist.filter((c) => c.done).length;
    const readinessPct = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

    // Risk distribution bar data
    const byCategory: Record<RiskCategory, { high: number; medium: number; low: number }> = {
      financial: { high: 0, medium: 0, low: 0 },
      fundraising: { high: 0, medium: 0, low: 0 },
    };
    for (const r of form.risks) {
      const s = riskScore(r.likelihood, r.impact);
      const level = s >= 6 ? "high" : s >= 3 ? "medium" : "low";
      byCategory[r.category][level]++;
    }

    return { highRisks, mediumRisks, lowRisks, checklistTotal, checklistDone, readinessPct, byCategory };
  }, [form]);

  // ── Risk CRUD ─────────────────────────────────────────────────────────

  function addRisk(category: RiskCategory) {
    setForm((p) => ({
      ...p,
      risks: [...p.risks, { id: uid(), category, title: "", likelihood: "medium", impact: "medium", mitigation: "" }],
    }));
  }

  function updateRisk(id: string, field: keyof Risk, value: string) {
    setForm((p) => ({
      ...p,
      risks: p.risks.map((r) => r.id === id ? { ...r, [field]: value } : r),
    }));
  }

  function removeRisk(id: string) {
    setForm((p) => ({ ...p, risks: p.risks.filter((r) => r.id !== id) }));
  }

  function toggleChecklist(id: string) {
    setForm((p) => ({
      ...p,
      checklist: p.checklist.map((c) => c.id === id ? { ...c, done: !c.done } : c),
    }));
  }

  // ── Save handler ──────────────────────────────────────────────────────

  async function handleSave() {
    await save(form);
  }

  const guide = <ToolGuide toolSlug="risk-control" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Risk Control" : "风险管控"}
      desc={locale === "en" ? "Financial and fundraising risk matrix with Pre-DD readiness checklist" : "财务与融资风险矩阵，含 Pre-DD 准备就绪清单"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Summary KPIs ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "高风险项", value: String(calc.highRisks), color: "#EF4444" },
            { label: "中风险项", value: String(calc.mediumRisks), color: "#F59E0B" },
            { label: "低风险项", value: String(calc.lowRisks), color: "#22C55E" },
            { label: "Pre-DD 就绪率", value: calc.readinessPct.toFixed(0) + "%", color: calc.readinessPct >= 80 ? "#22C55E" : calc.readinessPct >= 50 ? "#F59E0B" : "#EF4444" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="flex flex-col items-center px-4 py-4 rounded-2xl"
              style={{ backgroundColor: "#141414", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <span className="text-xs mb-1.5" style={{ color: "#555550" }}>{label}</span>
              <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Auto financial signals ────────────────────────────────────── */}
        {autoSignals.length > 0 && (
          <Card>
            <SLabel>系统自动财务风险信号（来自 T01–T06）</SLabel>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {autoSignals.map(({ label, ok, value }) => (
                <div
                  key={label}
                  className="flex flex-col px-3 py-3 rounded-xl"
                  style={{
                    backgroundColor: ok ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                    border: `1px solid ${ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  }}
                >
                  <span className="text-xs mb-1" style={{ color: "#888880" }}>{label}</span>
                  <span className="text-base font-bold font-mono" style={{ color: ok ? "#22C55E" : "#EF4444" }}>{value}</span>
                  <span className="text-xs mt-0.5" style={{ color: ok ? "#22C55E" : "#EF4444" }}>
                    {ok ? "正常" : "需关注"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Risk cards ───────────────────────────────────────────────── */}
        {(["financial", "fundraising"] as RiskCategory[]).map((cat) => {
          const catRisks = form.risks.filter((r) => r.category === cat);
          const catLabel = cat === "financial" ? "财务风险" : "融资风险";
          const catColor = cat === "financial" ? "#C9A84C" : "#4CAF50";
          return (
            <Card key={cat}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
                  <SLabel>{catLabel}</SLabel>
                </div>
                <button
                  onClick={() => addRisk(cat)}
                  className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}
                >
                  + 添加风险
                </button>
              </div>

              <div className="space-y-2">
                {catRisks.map((r) => {
                  const color = riskColor(r.likelihood, r.impact);
                  const score = riskScore(r.likelihood, r.impact);
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl p-3"
                      style={{ backgroundColor: "#0D0D0D", border: `1px solid ${color}22` }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {/* Score badge */}
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono"
                          style={{ backgroundColor: color + "22", color, border: `1px solid ${color}44` }}
                        >
                          {score}
                        </div>
                        {/* Title */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={r.title}
                            onChange={(e) => updateRisk(r.id, "title", e.target.value)}
                            placeholder="风险描述"
                            className="w-full bg-transparent text-xs outline-none"
                            style={{ color: "#F5F5F0", borderBottom: "1px solid #2A2A2A", paddingBottom: 4 }}
                          />
                        </div>
                        {/* Remove */}
                        <button
                          onClick={() => removeRisk(r.id)}
                          className="flex-shrink-0 text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
                          style={{ color: "#555550" }}
                        >
                          x
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div>
                          <p className="text-xs mb-1" style={{ color: "#555550" }}>发生概率</p>
                          <select
                            value={r.likelihood}
                            onChange={(e) => updateRisk(r.id, "likelihood", e.target.value)}
                            className="w-full px-2 py-1 rounded text-xs outline-none cursor-pointer"
                            style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#A0A09A" }}
                          >
                            {LIKELIHOOD_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <p className="text-xs mb-1" style={{ color: "#555550" }}>影响程度</p>
                          <select
                            value={r.impact}
                            onChange={(e) => updateRisk(r.id, "impact", e.target.value)}
                            className="w-full px-2 py-1 rounded text-xs outline-none cursor-pointer"
                            style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#A0A09A" }}
                          >
                            {IMPACT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <span className="text-xs font-semibold" style={{ color }}>
                            {score <= 2 ? "低风险" : score <= 4 ? "中风险" : "高风险"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs mb-1" style={{ color: "#555550" }}>应对措施</p>
                        <textarea
                          value={r.mitigation}
                          onChange={(e) => updateRisk(r.id, "mitigation", e.target.value)}
                          rows={2}
                          placeholder="填入应对或缓解措施"
                          className="w-full px-2 py-1.5 rounded-lg text-xs outline-none resize-none"
                          style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888880" }}
                          onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                          onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                        />
                      </div>
                    </div>
                  );
                })}
                {catRisks.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "#333330" }}>暂无{catLabel}，点击「+ 添加风险」</p>
                )}
              </div>
            </Card>
          );
        })}

        {/* ── Pre-DD Checklist ──────────────────────────────────────────── */}
        <Card>
          <SLabel>Pre-DD 准备清单（尽调就绪度）</SLabel>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: "#888880" }}>整体就绪率</span>
              <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>
                {calc.checklistDone} / {calc.checklistTotal} 项已完成
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${calc.readinessPct}%`,
                  backgroundColor: calc.readinessPct >= 80 ? "#22C55E" : calc.readinessPct >= 50 ? "#F59E0B" : "#C9A84C",
                }}
              />
            </div>
          </div>

          {/* Checklist by category */}
          {CHECKLIST_CATEGORIES.map(({ key, label, color }) => {
            const items = form.checklist.filter((c) => c.category === key);
            const done = items.filter((c) => c.done).length;
            return (
              <div key={key} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                  <span className="text-xs ml-auto" style={{ color: "#555550" }}>{done}/{items.length}</span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                      style={{
                        backgroundColor: item.done ? "rgba(34,197,94,0.04)" : "#0D0D0D",
                        border: `1px solid ${item.done ? "rgba(34,197,94,0.15)" : "#1E1E1E"}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: item.done ? "#22C55E" : "transparent",
                          border: `1.5px solid ${item.done ? "#22C55E" : "#555550"}`,
                        }}
                        onClick={() => toggleChecklist(item.id)}
                      >
                        {item.done && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: item.done ? "#555550" : "#C0C0BA", textDecoration: item.done ? "line-through" : "none" }}
                        onClick={() => toggleChecklist(item.id)}
                      >
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </Card>

        {/* ── Save button ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          {lastSaved && (
            <p className="text-xs" style={{ color: "#555550" }}>
              上次保存：{new Date(lastSaved).toLocaleString("zh-CN")}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "#C9A84C", color: "#0A0A0A" }}
          >
            {saving ? "保存中..." : "保存风险管控"}
          </button>
        </div>

      </div>
    </ToolShell>
  );
}
