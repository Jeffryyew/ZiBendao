"use client";

import { useState, useMemo, useEffect } from "react";
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
import { useToolSnapshot } from "@/lib/useToolSnapshot";
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
  if (abs >= 1_000_000) return sym + " " + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sym + " " + (abs / 1_000).toFixed(0) + "K";
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
    <text x={x} y={y} fill="#F5F5F0" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

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

function NumInput({
  label, value, onChange, prefix, suffix,
}: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) {
  return (
    <div className="py-1" style={{ borderBottom: "1px solid #1A1A1A" }}>
      <p className="text-xs mb-1" style={{ color: "#888880" }}>{label}</p>
      <div className="relative">
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
          style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0", paddingLeft: prefix ? "2rem" : "0.5rem", paddingRight: suffix ? "2rem" : "0.5rem" }}
          onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
          onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>{suffix}</span>}
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

        {/* ── Equity inputs ──────────────────────────────────────────────