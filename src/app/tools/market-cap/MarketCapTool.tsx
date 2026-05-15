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
  ReferenceLine,
} from "recharts";

interface FormState {
  sharePrice: string;
  sharesOut: string;
  eps: string;
  bookValuePerShare: string;
  revenue: string;
  netProfit: string;
  industry: string;
}

interface Results {
  marketCap: number;
  pe: number | null;
  pb: number | null;
  ps: number | null;
  roe: number | null;
  evRatio: number | null;
}

const INDUSTRY_PE: Record<string, { pe: number; pb: number; ps: number; label: string }> = {
  tech: { pe: 28, pb: 4.5, ps: 5.2, label: "科技行业" },
  finance: { pe: 12, pb: 1.2, ps: 2.8, label: "金融行业" },
  consumer: { pe: 22, pb: 3.8, ps: 1.5, label: "消费行业" },
  property: { pe: 15, pb: 0.9, ps: 1.8, label: "房产行业" },
  utilities: { pe: 18, pb: 1.6, ps: 2.0, label: "公用事业" },
};

function safeDiv(a: number, b: number): number | null {
  return b !== 0 ? a / b : null;
}

function fmtNum(n: number | null, decimals = 2): string {
  if (n === null) return "N/A";
  return n.toFixed(decimals);
}

function fmtMYR(n: number): string {
  if (n >= 1e9) return `RM ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`;
  return `RM ${n.toFixed(2)}`;
}

function ratingColor(metric: string, value: number | null): string {
  if (value === null) return "#68625C";
  if (metric === "pe") {
    if (value < 10) return "#5EAB6A";
    if (value < 25) return "#C9A84C";
    return "#E05A5A";
  }
  if (metric === "pb") {
    if (value < 1) return "#5EAB6A";
    if (value < 3) return "#C9A84C";
    return "#E05A5A";
  }
  return "#C9A84C";
}

export default function MarketCapTool() {
  const [form, setForm] = useState<FormState>({
    sharePrice: "2.50",
    sharesOut: "500",
    eps: "0.18",
    bookValuePerShare: "1.80",
    revenue: "450",
    netProfit: "90",
    industry: "finance",
  });
  const [results, setResults] = useState<Results | null>(null);

  const set = (f: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const calculate = () => {
    const price = parseFloat(form.sharePrice) || 0;
    const shares = parseFloat(form.sharesOut) || 0; // millions
    const eps = parseFloat(form.eps) || 0;
    const bvps = parseFloat(form.bookValuePerShare) || 0;
    const revenue = parseFloat(form.revenue) || 0; // millions
    const netProfit = parseFloat(form.netProfit) || 0; // millions

    const marketCap = price * shares * 1_000_000;
    const revenueMYR = revenue * 1_000_000;

    const pe = safeDiv(price, eps);
    const pb = safeDiv(price, bvps);
    const ps = revenueMYR > 0 ? marketCap / revenueMYR : null;
    const roe = bvps > 0 && netProfit > 0 ? (netProfit / (bvps * shares)) * 100 : null;
    const evRatio = netProfit > 0 ? marketCap / (netProfit * 1_000_000) : null;

    setResults({ marketCap, pe, pb, ps, roe, evRatio });
    setTimeout(() => document.getElementById("mc-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const industryRef = INDUSTRY_PE[form.industry];

  const chartData = results
    ? [
        { name: "市盈率 PE", 公司: results.pe ?? 0, 行业均值: industryRef.pe },
        { name: "市净率 PB", 公司: results.pb ?? 0, 行业均值: industryRef.pb },
        { name: "市销率 PS", 公司: results.ps ?? 0, 行业均值: industryRef.ps },
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

  return (
    <ToolShell icon="📊" title="市值/市盈率计算器" desc="企业估值分析：市值、PE、PB、PS 多维度对比行业均值。" levelRequired={2}>
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-5" style={{ color: "#68625C" }}>INPUT / 输入参数</p>

            <div className="space-y-4">
              {[
                { field: "sharePrice", label: "每股股价 (RM)", prefix: "RM" },
                { field: "sharesOut", label: "流通股数（百万股）", suffix: "M" },
                { field: "eps", label: "每股盈利 EPS (RM)", prefix: "RM" },
                { field: "bookValuePerShare", label: "每股净资产 BVPS (RM)", prefix: "RM" },
                { field: "revenue", label: "年营收（百万 RM）", suffix: "M" },
                { field: "netProfit", label: "净利润（百万 RM）", suffix: "M" },
              ].map(({ field, label, prefix, suffix }) => (
                <div key={field}>
                  <label className="block text-xs mb-1.5" style={{ color: "#68625C" }}>{label}</label>
                  <div className="relative">
                    {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#68625C" }}>{prefix}</span>}
                    <input
                      type="number"
                      value={form[field as keyof FormState]}
                      onChange={set(field as keyof FormState)}
                      className="w-full py-2.5"
                      style={{ ...inputStyle, paddingLeft: prefix ? "44px" : "12px", paddingRight: suffix ? "40px" : "12px" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8D1C6")}
                    />
                    {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#68625C" }}>{suffix}</span>}
                  </div>
                </div>
              ))}

              {/* Industry selector */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#68625C" }}>对比行业</label>
                <select
                  value={form.industry}
                  onChange={set("industry")}
                  className="w-full px-3 py-2.5"
                  style={inputStyle}
                >
                  {Object.entries(INDUSTRY_PE).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#FFFFFF" }}
            >
              开始计算 →
            </button>
          </div>

          {/* Reference table */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1A1A1A" }}>
            <p className="text-xs font-mono mb-3" style={{ color: "#68625C" }}>估值参考指标</p>
            <div className="space-y-2 text-xs">
              {[
                { label: "市盈率 PE", low: "<10 低估", mid: "10-25 合理", high: ">25 偏高" },
                { label: "市净率 PB", low: "<1 低于账面", mid: "1-3 合理", high: ">3 溢价" },
              ].map(({ label, low, mid, high }) => (
                <div key={label}>
                  <span style={{ color: "#68625C" }}>{label}</span>
                  <div className="flex gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(94,171,106,0.15)", color: "#5EAB6A" }}>{low}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>{mid}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(224,90,90,0.15)", color: "#E05A5A" }}>{high}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5" id="mc-results">
          {results ? (
            <>
              {/* Market cap highlight */}
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: "linear-gradient(135deg, #1A1A1A, #1E1A0A)", border: "1px solid rgba(201,168,76,0.3)" }}
              >
                <p className="text-xs mb-1" style={{ color: "#68625C" }}>总市值</p>
                <p className="text-3xl font-bold font-mono" style={{ color: "#C9A84C" }}>{fmtMYR(results.marketCap)}</p>
                <p className="text-xs mt-1" style={{ color: "#68625C" }}>{industryRef.label} 基准对比</p>
              </div>

              {/* Valuation metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "市盈率 PE", value: results.pe, refVal: industryRef.pe, metric: "pe" },
                  { label: "市净率 PB", value: results.pb, refVal: industryRef.pb, metric: "pb" },
                  { label: "市销率 PS", value: results.ps, refVal: industryRef.ps, metric: "ps" },
                  { label: "净资产收益 ROE", value: results.roe, refVal: null, metric: "roe", unit: "%" },
                ].map(({ label, value, refVal, metric, unit }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
                    <div className="text-xl font-bold font-mono" style={{ color: ratingColor(metric, value) }}>
                      {fmtNum(value)}{unit || "x"}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#68625C" }}>{label}</div>
                    {refVal !== null && (
                      <div className="text-xs mt-0.5" style={{ color: "#3A3A38" }}>
                        行业 {refVal.toFixed(1)}x
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Comparison chart */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
                <p className="text-sm font-semibold mb-4">估值指标对比 vs {industryRef.label}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barCategoryGap="30%" barGap={4} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0D9CE" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#68625C" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#68625C" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#EEE9E0", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                      formatter={(v) => [typeof v === "number" ? `${v.toFixed(2)}x` : "N/A", undefined]}
                    />
                    <Bar dataKey="公司" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry["公司"] > entry["行业均值"] ? "#C9A84C" : "#5EAB6A"} />
                      ))}
                    </Bar>
                    <Bar dataKey="行业均值" fill="#D8D1C6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-center mt-2" style={{ color: "#68625C" }}>
                  金色 = 高于行业均值（可能偏贵）· 绿色 = 低于行业均值（可能低估）
                </p>
              </div>

              {/* Export */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const rows = [
                      ["指标", "公司数值", `${industryRef.label}均值`],
                      ["总市值 (RM)", fmtMYR(results.marketCap), "-"],
                      ["市盈率 PE", fmtNum(results.pe), industryRef.pe.toString()],
                      ["市净率 PB", fmtNum(results.pb), industryRef.pb.toString()],
                      ["市销率 PS", fmtNum(results.ps), industryRef.ps.toString()],
                      ["ROE (%)", fmtNum(results.roe), "-"],
                    ];
                    const blob = new Blob(["﻿" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
                    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "市值分析.csv" }).click();
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#EEE9E0", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
                >
                  ↓ 导出 CSV
                </button>
                <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#EEE9E0", color: "#68625C", border: "1px solid #2A2A2A" }}>
                  🖨 打印 PDF
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: "1px dashed #222222" }}>
              <span className="text-4xl mb-3 opacity-30">📊</span>
              <p className="text-sm" style={{ color: "#68625C" }}>填写参数后点击「开始计算」</p>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
