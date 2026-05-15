"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface FormState {
  revenue: string;
  cogs: string;
  opex: string;
  otherExpenses: string;
  taxRate: string;
  equity: string;
  totalAssets: string;
  // KPI targets
  targetRevenue: string;
  targetNetMargin: string;
}

interface Results {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  opex: number;
  ebit: number;
  ebitMargin: number;
  otherExpenses: number;
  ebt: number;
  taxAmt: number;
  pat: number;
  netMargin: number;
  roe: number | null;
  roa: number | null;
  // KPI vs target
  revenueGap: number | null;
  marginGap: number | null;
}

function fmtMYR(n: number): string {
  if (Math.abs(n) >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`;
  return `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function marginRating(pct: number): string {
  if (pct >= 20) return "#5EAB6A";
  if (pct >= 10) return "#C9A84C";
  return "#E05A5A";
}

export default function PatKpiTool() {
  const [form, setForm] = useState<FormState>({
    revenue: "5000000",
    cogs: "3000000",
    opex: "800000",
    otherExpenses: "0",
    taxRate: "24",
    equity: "2000000",
    totalAssets: "8000000",
    targetRevenue: "",
    targetNetMargin: "",
  });
  const [results, setResults] = useState<Results | null>(null);

  const set = (f: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const calculate = () => {
    const revenue = parseFloat(form.revenue) || 0;
    const cogs = parseFloat(form.cogs) || 0;
    const opex = parseFloat(form.opex) || 0;
    const other = parseFloat(form.otherExpenses) || 0;
    const taxRate = parseFloat(form.taxRate) || 0;
    const equity = parseFloat(form.equity) || 0;
    const assets = parseFloat(form.totalAssets) || 0;
    const targetRev = parseFloat(form.targetRevenue) || 0;
    const targetMargin = parseFloat(form.targetNetMargin) || 0;

    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const ebit = grossProfit - opex;
    const ebitMargin = revenue > 0 ? (ebit / revenue) * 100 : 0;
    const ebt = ebit - other;
    const taxAmt = ebt > 0 ? ebt * (taxRate / 100) : 0;
    const pat = ebt - taxAmt;
    const netMargin = revenue > 0 ? (pat / revenue) * 100 : 0;
    const roe = equity > 0 ? (pat / equity) * 100 : null;
    const roa = assets > 0 ? (pat / assets) * 100 : null;

    const revenueGap = targetRev > 0 ? ((revenue - targetRev) / targetRev) * 100 : null;
    const marginGap = targetMargin > 0 ? netMargin - targetMargin : null;

    setResults({ revenue, cogs, grossProfit, grossMargin, opex, ebit, ebitMargin, otherExpenses: other, ebt, taxAmt, pat, netMargin, roe, roa, revenueGap, marginGap });
    setTimeout(() => document.getElementById("pk-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const waterfallData = results
    ? [
        { name: "营收", value: results.revenue, fill: "#C9A84C" },
        { name: "毛利润", value: results.grossProfit, fill: "#A88B3C" },
        { name: "EBIT", value: results.ebit, fill: results.ebit >= 0 ? "#8B7355" : "#E05A5A" },
        { name: "PAT", value: results.pat, fill: results.pat >= 0 ? "#5EAB6A" : "#E05A5A" },
      ]
    : [];

  const inputStyle = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #2A2A2A",
    color: "#1C1814",
    borderRadius: "10px",
    fontSize: "13px",
    fontFamily: "var(--font-mono)",
    outline: "none",
  } as const;

  const InputRow = ({ field, label, prefix = "RM" }: { field: keyof FormState; label: string; prefix?: string }) => (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#68625C" }}>{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#68625C" }}>{prefix}</span>}
        <input
          type="number"
          value={form[field]}
          onChange={set(field)}
          className="w-full py-2.5"
          style={{ ...inputStyle, paddingLeft: "44px" }}
          onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
          onBlur={(e) => (e.target.style.borderColor = "#D8D1C6")}
        />
      </div>
    </div>
  );

  const exportCSV = () => {
    if (!results) return;
    const rows = [
      ["PAT & KPI 分析报告"],
      [],
      ["损益表", "金额 (RM)", "利润率"],
      ["营收", results.revenue.toString(), "100%"],
      ["销货成本 COGS", results.cogs.toString(), fmtPct((results.cogs / results.revenue) * 100)],
      ["毛利润", results.grossProfit.toString(), fmtPct(results.grossMargin)],
      ["运营费用", results.opex.toString(), fmtPct((results.opex / results.revenue) * 100)],
      ["EBIT", results.ebit.toString(), fmtPct(results.ebitMargin)],
      ["税款 (PAT前)", results.taxAmt.toString(), ""],
      ["PAT 税后净利润", results.pat.toString(), fmtPct(results.netMargin)],
      [],
      ["关键指标"],
      ["净利率", fmtPct(results.netMargin)],
      ...(results.roe !== null ? [["ROE", fmtPct(results.roe)]] : []),
      ...(results.roa !== null ? [["ROA", fmtPct(results.roa)]] : []),
    ];
    const blob = new Blob(["﻿" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "PAT_KPI分析.csv" }).click();
  };

  return (
    <ToolShell icon="📈" title="PAT & KPI 计算器" desc="税后净利润与关键绩效指标综合分析，可视化利润分解。" levelRequired={3}>
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* P&L Inputs */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-5" style={{ color: "#68625C" }}>P&L / 损益数据</p>
            <div className="space-y-4">
              <InputRow field="revenue" label="年营收 Revenue" />
              <InputRow field="cogs" label="销货成本 COGS" />
              <InputRow field="opex" label="运营费用 OPEX" />
              <InputRow field="otherExpenses" label="其他支出（利息等）" />
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#68625C" }}>企业所得税率</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.taxRate}
                    onChange={set("taxRate")}
                    className="w-full py-2.5"
                    style={{ ...inputStyle, paddingLeft: "12px", paddingRight: "40px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8D1C6")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#68625C" }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Sheet inputs */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#68625C" }}>BALANCE SHEET / 资产负债（可选）</p>
            <div className="space-y-4">
              <InputRow field="equity" label="股东权益 Equity" />
              <InputRow field="totalAssets" label="总资产 Total Assets" />
            </div>
          </div>

          {/* KPI Targets */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#68625C" }}>KPI TARGETS / 目标（可选）</p>
            <div className="space-y-4">
              <InputRow field="targetRevenue" label="目标营收 (RM)" />
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#68625C" }}>目标净利率 (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.targetNetMargin}
                    onChange={set("targetNetMargin")}
                    className="w-full py-2.5"
                    style={{ ...inputStyle, paddingLeft: "12px", paddingRight: "40px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8D1C6")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#68625C" }}>%</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#C9A84C", color: "#FFFFFF" }}
          >
            开始计算 →
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5" id="pk-results">
          {results ? (
            <>
              {/* P&L Statement */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
                <p className="text-sm font-semibold mb-4">损益表</p>
                <div className="space-y-2">
                  {[
                    { label: "营收 Revenue", value: results.revenue, pct: 100, indent: 0 },
                    { label: "(-) 销货成本 COGS", value: -results.cogs, pct: -(results.cogs / results.revenue) * 100, indent: 1 },
                    { label: "= 毛利润 Gross Profit", value: results.grossProfit, pct: results.grossMargin, indent: 0, bold: true, highlight: true },
                    { label: "(-) 运营费用 OPEX", value: -results.opex, pct: -(results.opex / results.revenue) * 100, indent: 1 },
                    { label: "= 息税前利润 EBIT", value: results.ebit, pct: results.ebitMargin, indent: 0, bold: true },
                    ...(results.otherExpenses > 0 ? [{ label: "(-) 其他支出", value: -results.otherExpenses, pct: -(results.otherExpenses / results.revenue) * 100, indent: 1 }] : []),
                    { label: "= 税前利润 EBT", value: results.ebt, pct: (results.ebt / results.revenue) * 100, indent: 0, bold: true },
                    { label: `(-) 所得税 (${form.taxRate}%)`, value: -results.taxAmt, pct: -(results.taxAmt / results.revenue) * 100, indent: 1 },
                    { label: "= PAT 税后净利润", value: results.pat, pct: results.netMargin, indent: 0, bold: true, gold: true },
                  ].map(({ label, value, pct, indent, bold, highlight, gold }, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between py-1.5 text-sm ${bold ? "font-semibold" : ""}`}
                      style={{
                        paddingLeft: indent ? "16px" : "0",
                        borderBottom: bold ? "1px solid #222222" : "none",
                        color: gold ? "#C9A84C" : highlight ? "#1C1814" : indent ? "#68625C" : "#1C1814",
                        backgroundColor: gold ? "rgba(201,168,76,0.04)" : "transparent",
                        borderRadius: gold ? "8px" : "0",
                        padding: gold ? "8px 12px" : undefined,
                        marginTop: gold ? "4px" : undefined,
                      }}
                    >
                      <span>{label}</span>
                      <div className="text-right">
                        <span className="font-mono">{fmtMYR(value)}</span>
                        <span className="ml-2 text-xs font-mono" style={{ color: "#68625C", minWidth: "50px", display: "inline-block", textAlign: "right" }}>
                          {fmtPct(Math.abs(pct))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "净利率", value: fmtPct(results.netMargin), color: marginRating(results.netMargin) },
                  { label: "毛利率", value: fmtPct(results.grossMargin), color: marginRating(results.grossMargin) },
                  { label: "ROE", value: results.roe !== null ? fmtPct(results.roe) : "N/A", color: results.roe !== null ? marginRating(results.roe) : "#68625C" },
                  { label: "ROA", value: results.roa !== null ? fmtPct(results.roa) : "N/A", color: results.roa !== null ? marginRating(results.roa) : "#68625C" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
                    <div className="text-xl font-bold font-mono" style={{ color }}>{value}</div>
                    <div className="text-xs mt-1" style={{ color: "#68625C" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* KPI vs Target */}
              {(results.revenueGap !== null || results.marginGap !== null) && (
                <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
                  <p className="text-sm font-semibold mb-3">KPI 目标达成情况</p>
                  <div className="space-y-3">
                    {results.revenueGap !== null && (
                      <KpiBar
                        label="营收目标达成"
                        actual={results.revenue}
                        target={parseFloat(form.targetRevenue)}
                        gap={results.revenueGap}
                        formatFn={fmtMYR}
                      />
                    )}
                    {results.marginGap !== null && (
                      <KpiBar
                        label="净利率目标达成"
                        actual={results.netMargin}
                        target={parseFloat(form.targetNetMargin)}
                        gap={results.marginGap}
                        formatFn={(v) => fmtPct(v)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Profit breakdown chart */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
                <p className="text-sm font-semibold mb-4">利润层级瀑布图</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={waterfallData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0D9CE" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#68625C" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 10, fill: "#68625C" }} axisLine={false} tickLine={false} width={42} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#EEE9E0", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                      formatter={(v) => [typeof v === "number" ? fmtMYR(v) : "N/A", undefined]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(v) => typeof v === "number" ? fmtMYR(v) : ""}
                        style={{ fontSize: "10px", fill: "#68625C" }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Export */}
              <div className="flex gap-3">
                <button onClick={exportCSV} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#EEE9E0", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}>
                  ↓ 导出 CSV
                </button>
                <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#EEE9E0", color: "#68625C", border: "1px solid #2A2A2A" }}>
                  🖨 打印 PDF
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: "1px dashed #222222" }}>
              <span className="text-4xl mb-3 opacity-30">📈</span>
              <p className="text-sm" style={{ color: "#68625C" }}>填写损益数据后点击「开始计算」</p>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}

function KpiBar({ label, actual, target, gap, formatFn }: { label: string; actual: number; target: number; gap: number; formatFn: (v: number) => string }) {
  const achieved = gap >= 0;
  const pct = Math.min(Math.abs(actual / target) * 100, 120);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "#68625C" }}>{label}</span>
        <span className="font-mono" style={{ color: achieved ? "#5EAB6A" : "#E05A5A" }}>
          {achieved ? "+" : ""}{gap.toFixed(1)}% vs 目标
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#E0D9CE" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: achieved ? "#5EAB6A" : "#E05A5A" }}
          />
        </div>
        <div className="text-xs font-mono w-28 text-right" style={{ color: "#68625C" }}>
          {formatFn(actual)} / {formatFn(target)}
        </div>
      </div>
    </div>
  );
}
