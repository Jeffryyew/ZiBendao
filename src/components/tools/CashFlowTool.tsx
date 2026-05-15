"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface CashFlowForm {
  openingBalance: string;
  monthlyRevenue: string;
  fixedCosts: string;
  variableCostPct: string;
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTHS_ZH = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"] as const;

function fmtNum(n: number): string {
  return n.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function CashFlowTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";

  const [form, setForm] = useState<CashFlowForm>({
    openingBalance: "50000",
    monthlyRevenue: "30000",
    fixedCosts: "15000",
    variableCostPct: "20",
  });

  const set =
    (field: keyof CashFlowForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const rows = useMemo(() => {
    const revenue = parseFloat(form.monthlyRevenue) || 0;
    const fixed = parseFloat(form.fixedCosts) || 0;
    const varPct = parseFloat(form.variableCostPct) || 0;
    let balance = parseFloat(form.openingBalance) || 0;
    const months = isEn ? MONTHS_EN : MONTHS_ZH;

    return Array.from({ length: 12 }, (_, i) => {
      const opening = balance;
      const variableCost = revenue * (varPct / 100);
      const net = revenue - fixed - variableCost;
      const closing = opening + net;
      balance = closing;
      return { month: months[i], revenue, fixed, variableCost, net, closing };
    });
  }, [form, isEn]);

  const minRow = rows.reduce((p, c) => (c.closing < p.closing ? c : p));
  const maxRow = rows.reduce((p, c) => (c.closing > p.closing ? c : p));
  const endBalance = rows[rows.length - 1].closing;

  const FIELDS = [
    {
      field: "openingBalance" as const,
      label: isEn ? "Opening Balance (RM)" : "期初余额 (RM)",
      prefix: "RM",
      suffix: "",
    },
    {
      field: "monthlyRevenue" as const,
      label: isEn ? "Monthly Revenue (RM)" : "月收入 (RM)",
      prefix: "RM",
      suffix: "",
    },
    {
      field: "fixedCosts" as const,
      label: isEn ? "Monthly Fixed Costs (RM)" : "月固定成本 (RM)",
      prefix: "RM",
      suffix: "",
    },
    {
      field: "variableCostPct" as const,
      label: isEn ? "Variable Costs (% of Revenue)" : "变动成本占收入比率",
      prefix: "",
      suffix: "%",
    },
  ];

  return (
    <ToolShell
      icon=""
      title={isEn ? "Cash Flow Analysis" : "现金流分析"}
      desc={isEn ? "12-month cash flow projection and balance tracking" : "12个月现金流预测，余额追踪"}
      levelRequired={1}
      backHref="/tools"
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
        >
          <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
            INPUT / 输入参数
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FIELDS.map(({ field, label, prefix, suffix }) => (
              <div key={field}>
                <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                  {label}
                </label>
                <div className="relative">
                  {prefix && (
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                      style={{ color: "#555550" }}
                    >
                      {prefix}
                    </span>
                  )}
                  <input
                    type="number"
                    value={form[field]}
                    onChange={set(field)}
                    className="w-full py-2.5 rounded-xl text-sm outline-none font-mono"
                    style={{
                      backgroundColor: "#0D0D0D",
                      border: "1px solid #2A2A2A",
                      color: "#F5F5F0",
                      paddingLeft: prefix ? "44px" : "12px",
                      paddingRight: suffix ? "32px" : "12px",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                  {suffix && (
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                      style={{ color: "#555550" }}
                    >
                      {suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: isEn ? "Min Balance Month" : "最低余额月",
              value: `${minRow.month} · RM ${fmtNum(minRow.closing)}`,
              neg: minRow.closing < 0,
              accent: false,
            },
            {
              label: isEn ? "Max Balance Month" : "最高余额月",
              value: `${maxRow.month} · RM ${fmtNum(maxRow.closing)}`,
              neg: false,
              accent: false,
            },
            {
              label: isEn ? "Year-End Balance" : "年末余额",
              value: `RM ${fmtNum(endBalance)}`,
              neg: endBalance < 0,
              accent: endBalance >= 0,
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: "#141414",
                border: `1px solid ${
                  m.accent
                    ? "rgba(201,168,76,0.25)"
                    : m.neg
                    ? "rgba(220,38,38,0.2)"
                    : "#1E1E1E"
                }`,
              }}
            >
              <div
                className="text-sm font-bold font-mono"
                style={{
                  color: m.accent ? "#C9A84C" : m.neg ? "#EF4444" : "#F5F5F0",
                }}
              >
                {m.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "#555550" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-x-auto" style={{ border: "1px solid #1E1E1E" }}>
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: "#141414" }}>
                {[
                  isEn ? "Month" : "月份",
                  isEn ? "Revenue" : "收入",
                  isEn ? "Fixed Costs" : "固定成本",
                  isEn ? "Variable Costs" : "变动成本",
                  isEn ? "Net Cash Flow" : "净现金流",
                  isEn ? "Closing Balance" : "期末余额",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-right first:text-left font-mono"
                    style={{ color: "#555550" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#0D0D0D" : "#111111",
                    borderTop: "1px solid #1A1A1A",
                  }}
                >
                  <td className="px-3 py-2.5 font-mono" style={{ color: "#A0A09A" }}>
                    {r.month}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono" style={{ color: "#F5F5F0" }}>
                    {fmtNum(r.revenue)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono" style={{ color: "#F5F5F0" }}>
                    {fmtNum(r.fixed)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono" style={{ color: "#F5F5F0" }}>
                    {fmtNum(r.variableCost)}
                  </td>
                  <td
                    className="px-3 py-2.5 text-right font-mono"
                    style={{ color: r.net >= 0 ? "#22C55E" : "#EF4444" }}
                  >
                    {r.net >= 0 ? "+" : ""}
                    {fmtNum(r.net)}
                  </td>
                  <td
                    className="px-3 py-2.5 text-right font-mono font-semibold"
                    style={{ color: r.closing >= 0 ? "#22C55E" : "#EF4444" }}
                  >
                    {fmtNum(r.closing)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolShell>
  );
}
