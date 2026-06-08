"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

interface DebtItem {
  id: string;
  name: string;
  principal: string;
  interestRate: string;
  annualPayment: string;
  type: "bank_loan" | "bond" | "shareholder_loan" | "other";
}

interface T11Form {
  // Equity
  paidUpCapital: string;
  retainedEarnings: string;
  // Debt items
  debts: DebtItem[];
  // WACC inputs
  costOfEquity: string;
  riskFreeRate: string;
  equityRiskPremium: string;
  beta: string;
  // Override tax rate (if not imported)
  taxRateOverride: string;
}

const DEBT_TYPES = [
  { value: "bank_loan", label: "银行贷款" },
  { value: "bond", label: "债券" },
  { value: "shareholder_loan", label: "股东贷款" },
  { value: "other", label: "其他" },
] as const;

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

const DEFAULT_FORM: T11Form = {
  paidUpCapital: "1000000",
  retainedEarnings: "500000",
  debts: [
    { id: uid(), name: "银行定期贷款", principal: "800000", interestRate: "5.5", annualPayment: "120000", type: "bank_loan" },
  ],
  costOfEquity: "",
  riskFreeRate: "3.5",
  equityRiskPremium: "6.0",
  beta: "1.0",
  taxRateOverride: "",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "资本结构决定企业融资成本",
    body: "债务 vs 股权的比例，直接影响 WACC（加权平均资本成本）。WACC 越低，企业估值越高。合理的资本结构是资本化的核心。",
  },
  {
    title: "第一步：录入股权部分",
    body: "填入实收资本和留存收益。系统将自动从资产负债表（T02）导入数据，你也可以手动调整。",
  },
  {
    title: "第二步：录入所有债务",
    body: "逐笔录入贷款：名称、本金、利率、年还款额。系统将计算加权平均债务成本（Kd）和债务覆盖率（DSCR）。",
  },
  {
    title: "第三步：WACC 计算",
    body: "系统用 CAPM 模型（风险无利率 + Beta × 股权风险溢价）计算股权成本（Ke），再加权计算 WACC。税盾效应已纳入计算。",
  },
  {
    title: "第四步：DSCR 债务覆盖率",
    body: "DSCR = EBIT ÷ 年还债总额。DSCR > 1.25 为健康，< 1.0 意味着无法覆盖债务，银行会视为高风险。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n) || n === 0) return "—";
  const abs = Math.abs(n);
  return sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string;
}) {
  if (percent < 0.08) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#2B2B2B" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#E8DFCF"}` }}
    >
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>{children}</p>;
}

function NumInput({
  label, value, onChange, prefix, suffix,
}: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) {
  return (
    <div className="py-1" style={{ borderBottom: "1px solid #E8DFCF" }}>
      <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
      <div className="relative">
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
          style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B", paddingLeft: prefix ? "2rem" : "0.5rem", paddingRight: suffix ? "2rem" : "0.5rem" }}
          onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
          onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CapitalStructureTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T11Form>("capital-structure");
  const [form, setForm] = useState<T11Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);

  // ── Load saved ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (savedData && !loaded) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // ── Auto-save (1.5s debounce) ─────────────────────────────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);


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
            if (snap?.data) {
              const d: FinancialCore = snap.data;
              setCoreData(d);
              // Pre-fill equity from T02 balance sheet data
              setForm((p) => ({
                ...p,
                paidUpCapital: d.totalEquity ? String(Math.round(d.totalEquity * 0.6)) : p.paidUpCapital,
                retainedEarnings: d.totalEquity ? String(Math.round(d.totalEquity * 0.4)) : p.retainedEarnings,
                taxRateOverride: d.taxRate ? String(d.taxRate) : p.taxRateOverride,
                debts: d.totalLoans && p.debts.length === 1
                  ? [{ ...p.debts[0], principal: String(Math.round(d.totalLoans)) }]
                  : p.debts,
              }));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";
  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  // ── Calculations ──────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const equity = pf(form.paidUpCapital) + pf(form.retainedEarnings);
    const totalDebt = form.debts.reduce((s, d) => s + pf(d.principal), 0);
    const totalCapital = equity + totalDebt;
    const equityWeight = totalCapital > 0 ? equity / totalCapital : 0.5;
    const debtWeight = totalCapital > 0 ? totalDebt / totalCapital : 0.5;
    const deRatio = equity > 0 ? totalDebt / equity : 0;

    // Tax rate: from T01 (coreData), override field, or default 24%
    const taxRate = pf(form.taxRateOverride) || coreData?.taxRate || 24;

    // Cost of debt (weighted average)
    const weightedDebtCost = totalDebt > 0
      ? form.debts.reduce((s, d) => s + pf(d.principal) * pf(d.interestRate), 0) / totalDebt
      : 0;
    const kdAfterTax = weightedDebtCost * (1 - taxRate / 100);

    // Cost of equity: CAPM or manual
    const rf = pf(form.riskFreeRate);
    const erp = pf(form.equityRiskPremium);
    const beta = pf(form.beta);
    const keCAP = rf + beta * erp;
    const ke = pf(form.costOfEquity) || keCAP;

    // WACC
    const wacc = equityWeight * ke + debtWeight * kdAfterTax;

    // DSCR
    const ebit = coreData?.ebit ?? 0;
    const totalAnnualPayment = form.debts.reduce((s, d) => s + pf(d.annualPayment), 0);
    const dscr = totalAnnualPayment > 0 ? ebit / totalAnnualPayment : null;

    // Pie chart data
    const pieData = [
      { name: "股权", value: equity, fill: "#C9A84C" },
      { name: "债务", value: totalDebt, fill: "#4CAF50" },
    ].filter((d) => d.value > 0);

    // WACC breakdown bar
    const waccBreakdown = [
      { name: "股权成本 Ke", value: parseFloat(ke.toFixed(2)) },
      { name: "债务成本 Kd", value: parseFloat(kdAfterTax.toFixed(2)) },
      { name: "WACC", value: parseFloat(wacc.toFixed(2)) },
    ];

    return {
      equity, totalDebt, totalCapital, equityWeight, debtWeight, deRatio,
      taxRate, weightedDebtCost, kdAfterTax, ke, keCAP, wacc,
      ebit, totalAnnualPayment, dscr,
      pieData, waccBreakdown,
    };
  }, [form, coreData]);

  // ── Standalone toolData localStorage auto-save ──
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    if (!calc || calc.wacc === 0) return;
    const timer = setTimeout(() => {
      console.log(`[T09] auto-save to toolData | cid=${cid}`);
      saveToolData({
        companyId: cid,
        toolId: "T09",
        calculatedOutput: {
          wacc: calc.wacc,
          dscr: calc.dscr,
          debtToEquity: calc.deRatio,
          ke: calc.ke,
          kdAfterTax: calc.kdAfterTax,
        },
        currency: sym,
      });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc, sym]);

  // ── Debt CRUD ─────────────────────────────────────────────────────────

  function addDebt() {
    setForm((p) => ({
      ...p,
      debts: [...p.debts, { id: uid(), name: "", principal: "", interestRate: "", annualPayment: "", type: "bank_loan" }],
    }));
  }

  function updateDebt(id: string, field: keyof DebtItem, value: string) {
    setForm((p) => ({
      ...p,
      debts: p.debts.map((d) => d.id === id ? { ...d, [field]: value } : d),
    }));
  }

  function removeDebt(id: string) {
    setForm((p) => ({ ...p, debts: p.debts.filter((d) => d.id !== id) }));
  }

  // ── Save handler ──────────────────────────────────────────────────────

  async function handleSave() {
    await save(form);
    // Save to unified toolData localStorage
    try {
      const companyId = getCompanyId();
      saveToolData({
        companyId,
        toolId: "T09",
        calculatedOutput: {
          wacc: calc.wacc,
          dscr: calc.dscr,
          debtToEquity: calc.deRatio,
          ke: calc.ke,
          kdAfterTax: calc.kdAfterTax,
        },
        currency: sym,
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="capital-structure" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Capital Structure" : "资本结构"}
      desc={locale === "en" ? "Debt vs equity mix, WACC calculation, and DSCR analysis" : "债务与股权比例、WACC 加权资本成本与偿债覆盖率分析"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">


        {/* ── Equity inputs ────────────────────────────────────────────── */}
        <Card>
          <SLabel>股权部分</SLabel>
          {coreData?.totalEquity && (
            <div
              className="mb-3 flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <span className="text-xs" style={{ color: "#7A7A7A" }}>
                T02 总权益：{fmt(coreData.totalEquity, sym)}
              </span>
              <button
                onClick={() => setForm((p) => ({
                  ...p,
                  paidUpCapital: String(Math.round((coreData.totalEquity ?? 0) * 0.6)),
                  retainedEarnings: String(Math.round((coreData.totalEquity ?? 0) * 0.4)),
                }))}
                className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
              >
                导入（自动拆分 60/40）
              </button>
            </div>
          )}
          <NumInput
            label="实收资本"
            value={form.paidUpCapital}
            onChange={(v) => setForm((p) => ({ ...p, paidUpCapital: v }))}
            prefix={sym}
          />
          <NumInput
            label="留存收益"
            value={form.retainedEarnings}
            onChange={(v) => setForm((p) => ({ ...p, retainedEarnings: v }))}
            prefix={sym}
          />
          <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "1px solid #E8DFCF" }}>
            <span className="text-xs" style={{ color: "#7A7A7A" }}>总股权</span>
            <span className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(calc.equity, sym)}</span>
          </div>
        </Card>

        {/* ── Debt items ───────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel>债务部分</SLabel>
            <button
              onClick={addDebt}
              className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3B82F6" }}
            >
              + 添加债务
            </button>
          </div>

          {form.debts.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: "#7A7A7A" }}>暂无债务项目</p>
          )}

          <div className="space-y-4">
            {form.debts.map((debt, idx) => (
              <div key={debt.id} className="rounded-xl p-4" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono" style={{ color: "#7A7A7A" }}>债务 {idx + 1}</span>
                  <button
                    onClick={() => { if (window.confirm("确认删除？")) removeDebt(debt.id); }}
                    className="text-xs px-2 py-0.5 rounded transition-opacity hover:opacity-70"
                    style={{ color: "#EF4444", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    删除
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>债务名称</p>
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                      placeholder="如：银行定期贷款"
                      className="w-full py-1.5 px-3 rounded-lg text-xs outline-none"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                      onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                      onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                    />
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>类型</p>
                    <select
                      value={debt.type}
                      onChange={(e) => updateDebt(debt.id, "type", e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg text-xs outline-none"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                    >
                      {DEBT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>本金 ({sym})</p>
                    <input
                      type="number"
                      value={debt.principal}
                      onChange={(e) => updateDebt(debt.id, "principal", e.target.value)}
                      placeholder="0"
                      className="w-full py-1.5 px-2 rounded-lg text-xs text-right outline-none font-mono"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                      onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                      onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                    />
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>利率 (%)</p>
                    <input
                      type="number"
                      value={debt.interestRate}
                      onChange={(e) => updateDebt(debt.id, "interestRate", e.target.value)}
                      placeholder="0"
                      className="w-full py-1.5 px-2 rounded-lg text-xs text-right outline-none font-mono"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                      onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                      onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                    />
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>年还款 ({sym})</p>
                    <input
                      type="number"
                      value={debt.annualPayment}
                      onChange={(e) => updateDebt(debt.id, "annualPayment", e.target.value)}
                      placeholder="0"
                      className="w-full py-1.5 px-2 rounded-lg text-xs text-right outline-none font-mono"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                      onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                      onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {calc.totalDebt > 0 && (
            <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "1px solid #E8DFCF" }}>
              <span className="text-xs" style={{ color: "#7A7A7A" }}>总债务</span>
              <span className="text-sm font-bold font-mono" style={{ color: "#4CAF50" }}>{fmt(calc.totalDebt, sym)}</span>
            </div>
          )}
        </Card>

        {/* ── WACC inputs ─────────────────────────────────────────────── */}
        <Card>
          <SLabel>WACC 参数（CAPM 模型）</SLabel>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <NumInput
              label="无风险利率 Rf"
              value={form.riskFreeRate}
              onChange={(v) => setForm((p) => ({ ...p, riskFreeRate: v }))}
              suffix="%"
            />
            <NumInput
              label="股权风险溢价 ERP"
              value={form.equityRiskPremium}
              onChange={(v) => setForm((p) => ({ ...p, equityRiskPremium: v }))}
              suffix="%"
            />
            <NumInput
              label="Beta 系数"
              value={form.beta}
              onChange={(v) => setForm((p) => ({ ...p, beta: v }))}
            />
            <NumInput
              label="股权成本 Ke（手动覆盖）"
              value={form.costOfEquity}
              onChange={(v) => setForm((p) => ({ ...p, costOfEquity: v }))}
              suffix="%"
            />
          </div>
          <div
            className="flex items-center justify-between px-3 py-2 rounded-lg mt-2"
            style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
          >
            <span className="text-xs" style={{ color: "#7A7A7A" }}>
              CAPM 计算 Ke = {form.riskFreeRate || "3.5"}% + {form.beta || "1.0"} x {form.equityRiskPremium || "6.0"}%
            </span>
            <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>{calc.keCAP.toFixed(2)}%</span>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid #E8DFCF" }}>
            <NumInput
              label="税率覆盖（不填则用 T01 税率或默认 24%）"
              value={form.taxRateOverride}
              onChange={(v) => setForm((p) => ({ ...p, taxRateOverride: v }))}
              suffix="%"
            />
            <p className="text-xs mt-2" style={{ color: "#7A7A7A" }}>
              当前使用税率：{calc.taxRate}%
              {coreData?.taxRate && !form.taxRateOverride ? "（来自 T01）" : form.taxRateOverride ? "（手动覆盖）" : "（默认）"}
            </p>
          </div>
        </Card>

        {/* ── Results ─────────────────────────────────────────────────── */}
        <Card accent>
          <SLabel>资本结构分析结果</SLabel>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "WACC", value: calc.wacc.toFixed(2) + "%", sub: "加权平均资本成本", color: "#C9A84C" },
              { label: "D/E 比", value: calc.deRatio.toFixed(2) + "x", sub: "债务/股权", color: calc.deRatio > 2 ? "#EF4444" : calc.deRatio > 1 ? "#F59E0B" : "#22C55E" },
              {
                label: "DSCR",
                value: calc.dscr !== null ? calc.dscr.toFixed(2) + "x" : "—",
                sub: calc.dscr === null ? "需录入 EBIT" : calc.dscr >= 1.25 ? "健康" : calc.dscr >= 1.0 ? "偏低" : "不足",
                color: calc.dscr === null ? "#9A9490" : calc.dscr >= 1.25 ? "#22C55E" : calc.dscr >= 1.0 ? "#F59E0B" : "#EF4444",
              },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
                <p className="text-xl font-bold font-mono" style={{ color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "总资本", value: fmt(calc.totalCapital, sym), color: "#2B2B2B" },
              { label: "债务成本 Kd（税后）", value: calc.kdAfterTax.toFixed(2) + "%", color: "#4CAF50" },
              { label: "股权占比", value: (calc.equityWeight * 100).toFixed(1) + "%", color: "#C9A84C" },
              { label: "债务占比", value: (calc.debtWeight * 100).toFixed(1) + "%", color: "#4CAF50" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
                <span className="text-sm font-mono font-semibold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {calc.pieData.length > 0 && (
            <div className="mb-5">
              <p className="text-xs mb-3" style={{ color: "#7A7A7A" }}>资本结构分布</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={calc.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {calc.pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: 8 }}
                    formatter={(v: number) => [fmt(v, sym), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5">
                {calc.pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-xs" style={{ color: "#7A7A7A" }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs mb-3" style={{ color: "#7A7A7A" }}>WACC 成本分解 (%)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={calc.waccBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCF" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#7A7A7A", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => v + "%"}
                  tick={{ fill: "#7A7A7A", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: 8 }}
                  formatter={(v: number) => [v.toFixed(2) + "%", ""]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
                  {calc.waccBreakdown.map((_, i) => (
                    <Cell key={i} fill={i === 2 ? "#C9A84C" : i === 0 ? "#8B5CF6" : "#4CAF50"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {coreData?.ebit !== undefined && calc.dscr !== null && (
            <div className="mt-4 px-4 py-3 rounded-xl" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
              <p className="text-xs mb-2" style={{ color: "#7A7A7A" }}>DSCR 计算明细</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs" style={{ color: "#7A7A7A" }}>EBIT（来自 T01）</p>
                  <p className="text-sm font-mono font-semibold" style={{ color: "#2B2B2B" }}>{fmt(calc.ebit, sym)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#7A7A7A" }}>÷ 年还债总额</p>
                  <p className="text-sm font-mono font-semibold" style={{ color: "#2B2B2B" }}>{fmt(calc.totalAnnualPayment, sym)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#7A7A7A" }}>= DSCR</p>
                  <p className="text-sm font-mono font-semibold" style={{ color: calc.dscr >= 1.25 ? "#22C55E" : calc.dscr >= 1.0 ? "#F59E0B" : "#EF4444" }}>
                    {calc.dscr.toFixed(2)}x
                  </p>
                </div>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: "#7A7A7A" }}>
                {calc.dscr >= 1.25 ? "偿债能力健康，银行融资风险低" : calc.dscr >= 1.0 ? "勉强覆盖债务，建议优化资本结构" : "无法覆盖债务，高风险状态，需立即重组"}
              </p>
            </div>
          )}
        </Card>

        {/* ── Save button ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: "#9A9490" }}>
            {saving ? "正在保存..." : lastSaved ? `已自动保存 ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
        </div>

      </div>
    </ToolShell>
  );
}
