"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FormState {
  currentSavings: string;
  monthlyContribution: string;
  annualRate: string;
  years: string;
  targetWealth: string;
}

interface ChartPoint {
  year: number;
  投资增长: number;
  仅储蓄: number;
}

interface Results {
  finalBalance: number;
  totalContributions: number;
  investmentGains: number;
  monthlyNeeded: number | null;
  multiplier: number;
  chartData: ChartPoint[];
}

function fv(pv: number, pmt: number, r: number, n: number): number {
  if (r === 0) return pv + pmt * n;
  return pv * Math.pow(1 + r, n) + (pmt * (Math.pow(1 + r, n) - 1)) / r;
}

function fmt(n: number, decimals = 0): string {
  return "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const FIELD_CONFIG: Array<{ field: keyof FormState; label: string; prefix?: string; suffix?: string; placeholder: string }> = [
  { field: "currentSavings", label: "当前储蓄额", prefix: "RM", placeholder: "50,000" },
  { field: "monthlyContribution", label: "每月存款额", prefix: "RM", placeholder: "2,000" },
  { field: "annualRate", label: "年化收益率", suffix: "%", placeholder: "8" },
  { field: "years", label: "投资年限", suffix: "年", placeholder: "20" },
  { field: "targetWealth", label: "目标财富（可选）", prefix: "RM", placeholder: "1,000,000" },
];

export default function FinancialRoadmapTool() {
  const [form, setForm] = useState<FormState>({
    currentSavings: "50000",
    monthlyContribution: "2000",
    annualRate: "8",
    years: "20",
    targetWealth: "1000000",
  });
  const [results, setResults] = useState<Results | null>(null);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const calculate = () => {
    const pv = parseFloat(form.currentSavings) || 0;
    const pmt = parseFloat(form.monthlyContribution) || 0;
    const ar = parseFloat(form.annualRate) || 0;
    const years = parseInt(form.years) || 1;
    const target = parseFloat(form.targetWealth) || 0;

    const r = ar / 100 / 12;
    const n = years * 12;

    const finalBalance = fv(pv, pmt, r, n);
    const totalContributions = pv + pmt * n;
    const investmentGains = finalBalance - totalContributions;
    const multiplier = totalContributions > 0 ? finalBalance / totalContributions : 1;

    let monthlyNeeded: number | null = null;
    if (target > finalBalance && n > 0) {
      const fvOfPV = pv * Math.pow(1 + r, n);
      const annuityFactor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r;
      monthlyNeeded = (target - fvOfPV) / annuityFactor;
    }

    const chartData: ChartPoint[] = Array.from({ length: years + 1 }, (_, y) => ({
      year: y,
      投资增长: Math.round(fv(pv, pmt, r, y * 12)),
      仅储蓄: Math.round(pv + pmt * y * 12),
    }));

    setResults({ finalBalance, totalContributions, investmentGains, monthlyNeeded, multiplier, chartData });
    setTimeout(() => document.getElementById("fr-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const exportCSV = () => {
    if (!results) return;
    const rows: string[][] = [
      ["年份", "投资增长 (RM)", "仅储蓄 (RM)"],
      ...results.chartData.map((d) => [d.year.toString(), d.投资增长.toString(), d.仅储蓄.toString()]),
    ];
    const blob = new Blob(["﻿" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "金融路线图.csv" });
    a.click();
  };

  return (
    <ToolShell icon="" title="金融路线图方程式" desc="规划财务目标，预测未来财富增长轨迹。" levelRequired={1}>
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-5" style={{ color: "#68625C" }}>INPUT / 输入参数</p>
            <div className="space-y-4">
              {FIELD_CONFIG.map(({ field, label, prefix, suffix, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs mb-1.5" style={{ color: "#68625C" }}>{label}</label>
                  <div className="relative">
                    {prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#68625C" }}>
                        {prefix}
                      </span>
                    )}
                    <input
                      type="number"
                      value={form[field]}
                      onChange={set(field)}
                      placeholder={placeholder}
                      className="w-full py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #2A2A2A",
                        color: "#1C1814",
                        fontFamily: "var(--font-mono)",
                        paddingLeft: prefix ? "44px" : "12px",
                        paddingRight: suffix ? "40px" : "12px",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8D1C6")}
                    />
                    {suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#68625C" }}>
                        {suffix}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={calculate}
              className="w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-opacity"
              style={{ backgroundColor: "#C9A84C", color: "#FFFFFF" }}
            >
              开始计算 →
            </button>

            {/* Formula reference */}
            <div className="mt-5 pt-5 border-t" style={{ borderColor: "#E0D9CE" }}>
              <p className="text-xs mb-2" style={{ color: "#68625C" }}>公式</p>
              <div className="text-xs space-y-0.5 font-mono" style={{ color: "#68625C" }}>
                <p>FV = PV×(1+r)ⁿ + PMT×[(1+r)ⁿ-1]/r</p>
                <p className="mt-1">r = 年利率/12，n = 年数×12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5" id="fr-results">
          {results ? (
            <>
              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "期末财富预测", value: fmt(results.finalBalance), accent: true },
                  { label: "投资收益", value: fmt(results.investmentGains), positive: true },
                  { label: "总投入金额", value: fmt(results.totalContributions) },
                  { label: "财富倍数", value: `${results.multiplier.toFixed(2)}x` },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl p-4 text-center"
                    style={{
                      backgroundColor: m.accent ? "rgba(201,168,76,0.07)" : "#FFFFFF",
                      border: `1px solid ${m.accent ? "rgba(201,168,76,0.25)" : "#E0D9CE"}`,
                    }}
                  >
                    <div className="text-lg font-bold font-mono" style={{ color: m.accent ? "#C9A84C" : m.positive ? "#5EAB6A" : "#1C1814" }}>
                      {m.value}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#68625C" }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {results.monthlyNeeded !== null && results.monthlyNeeded > (parseFloat(form.monthlyContribution) || 0) && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                  <span className="text-xl"></span>
                  <p className="text-sm" style={{ color: "#68625C" }}>
                    达成目标财富需每月存款&nbsp;
                    <span className="font-semibold font-mono" style={{ color: "#C9A84C" }}>
                      {fmt(results.monthlyNeeded, 2)}
                    </span>
                  </p>
                </div>
              )}

              {/* Chart */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #1E1E1E" }}>
                <p className="text-sm font-semibold mb-4">财富增长曲线</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={results.chartData} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gInvest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gSave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#68625C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#68625C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0D9CE" vertical={false} />
                    <XAxis dataKey="year" tickFormatter={(v) => `${v}y`} tick={{ fontSize: 10, fill: "#68625C" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#68625C" }} axisLine={false} tickLine={false} width={38} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#EEE9E0", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                      formatter={(v) => [typeof v === "number" ? fmt(v) : "N/A", undefined]}
                      labelFormatter={(l) => `第 ${l} 年`}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#888880", paddingTop: "8px" }} />
                    <Area type="monotone" dataKey="投资增长" stroke="#C9A84C" strokeWidth={2} fill="url(#gInvest)" />
                    <Area type="monotone" dataKey="仅储蓄" stroke="#68625C" strokeWidth={1.5} fill="url(#gSave)" strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Export */}
              <div className="flex gap-3">
                <button onClick={exportCSV} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#EEE9E0", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}>
                  ↓ 导出 CSV
                </button>
                <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#EEE9E0", color: "#68625C", border: "1px solid #2A2A2A" }}>
                   打印 PDF
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: "1px dashed #222222" }}>
              <span className="text-4xl mb-3 opacity-30"></span>
              <p className="text-sm" style={{ color: "#68625C" }}>填写参数后点击「开始计算」</p>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
