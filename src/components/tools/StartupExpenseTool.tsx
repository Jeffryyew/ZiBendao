"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface ExpenseRow {
  id: string;
  label: { zh: string; en: string };
  amount: string;
  type: "monthly" | "one-time";
}

const DEFAULT_ROWS: ExpenseRow[] = [
  { id: "rent",          label: { zh: "租金",         en: "Rent" },                  amount: "3000",  type: "monthly"  },
  { id: "renovation",   label: { zh: "装修",         en: "Renovation" },            amount: "20000", type: "one-time" },
  { id: "equipment",    label: { zh: "设备",         en: "Equipment" },             amount: "15000", type: "one-time" },
  { id: "payroll",      label: { zh: "人力 (首3个月)", en: "Payroll (first 3 mo.)" }, amount: "8000",  type: "monthly"  },
  { id: "working-cap",  label: { zh: "营运资金",      en: "Working Capital" },       amount: "10000", type: "one-time" },
  { id: "other",        label: { zh: "其他",         en: "Other" },                 amount: "2000",  type: "one-time" },
];

function fmt(n: number): string {
  return "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function StartupExpenseTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const [rows, setRows] = useState<ExpenseRow[]>(DEFAULT_ROWS);
  const [initialCapital, setInitialCapital] = useState("100000");

  const updateRow = (id: string, field: "amount" | "type", value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const oneTimeCosts = rows
    .filter((r) => r.type === "one-time")
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const monthlyBurnRate = rows
    .filter((r) => r.type === "monthly")
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  // Total startup cost = one-time + first 3 months of recurring
  const totalStartupCost = oneTimeCosts + monthlyBurnRate * 3;
  const capital = parseFloat(initialCapital) || 0;
  const runway = monthlyBurnRate > 0 ? capital / monthlyBurnRate : 0;

  const runwayColor =
    runway === 0 ? "#666660" : runway < 3 ? "#EF4444" : runway < 6 ? "#EAB308" : "#22C55E";
  const runwayBorder =
    runway === 0
      ? "#1E1E1E"
      : runway < 3
      ? "rgba(220,38,38,0.2)"
      : runway < 6
      ? "rgba(234,179,8,0.2)"
      : "rgba(34,197,94,0.2)";
  const runwayBg =
    runway === 0
      ? "#141414"
      : runway < 3
      ? "rgba(220,38,38,0.05)"
      : runway < 6
      ? "rgba(234,179,8,0.05)"
      : "rgba(34,197,94,0.05)";

  return (
    <ToolShell
      icon=""
      title={isEn ? "Startup Expense Planner" : "创业费用规划"}
      desc={isEn ? "Calculate startup costs, monthly burn rate & runway" : "计算创业启动成本、月燃烧率与资金跑道"}
      levelRequired={1}
      backHref="/tools"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input table */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
              {isEn ? "EXPENSE CATEGORIES" : "费用类别"}
            </p>

            <div className="grid grid-cols-12 gap-2 mb-2 px-1 text-xs" style={{ color: "#555550" }}>
              <div className="col-span-4">{isEn ? "Category" : "类别"}</div>
              <div className="col-span-4 text-right">{isEn ? "Amount (RM)" : "金额 (RM)"}</div>
              <div className="col-span-4 text-center">{isEn ? "Type" : "类型"}</div>
            </div>

            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4 text-sm" style={{ color: "#A0A09A" }}>
                    {isEn ? row.label.en : row.label.zh}
                  </div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                      className="w-full px-3 py-2 text-right text-sm rounded-xl outline-none font-mono"
                      style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>

                  <div className="col-span-4 flex gap-1 justify-center">
                    {(["monthly", "one-time"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => updateRow(row.id, "type", t)}
                        className="flex-1 text-xs py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor:
                            row.type === t ? "rgba(201,168,76,0.15)" : "#0D0D0D",
                          color: row.type === t ? "#C9A84C" : "#555550",
                          border: `1px solid ${row.type === t ? "rgba(201,168,76,0.3)" : "#2A2A2A"}`,
                        }}
                      >
                        {t === "monthly"
                          ? isEn ? "Monthly" : "月"
                          : isEn ? "One-off" : "一次"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Initial capital */}
            <div className="mt-5 pt-5" style={{ borderTop: "1px solid #1E1E1E" }}>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                {isEn ? "Available Initial Capital (RM)" : "可用启动资金 (RM)"}
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                  style={{ color: "#555550" }}
                >
                  RM
                </span>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 rounded-xl text-sm outline-none font-mono"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <p className="text-xs font-mono mb-5" style={{ color: "#666660" }}>
              {isEn ? "SUMMARY" : "汇总"}
            </p>
            <div className="space-y-5">
              {[
                { label: isEn ? "One-Time Costs" : "一次性成本", value: fmt(oneTimeCosts), accent: false },
                { label: isEn ? "Monthly Burn Rate" : "每月燃烧率", value: fmt(monthlyBurnRate), accent: false },
                {
                  label: isEn ? "Total Startup Cost (3 mo.)" : "总启动成本 (前3个月)",
                  value: fmt(totalStartupCost),
                  accent: true,
                },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-xs mb-1" style={{ color: "#555550" }}>
                    {m.label}
                  </div>
                  <div
                    className="text-xl font-bold font-mono"
                    style={{ color: m.accent ? "#C9A84C" : "#F5F5F0" }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Runway card */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: runwayBg, border: `1px solid ${runwayBorder}` }}
          >
            <p className="text-xs font-mono mb-2" style={{ color: "#666660" }}>
              {isEn ? "RUNWAY" : "资金跑道"}
            </p>
            <div className="text-4xl font-bold font-mono mb-1" style={{ color: runwayColor }}>
              {monthlyBurnRate > 0 ? runway.toFixed(1) : "—"}
            </div>
            <div className="text-xs" style={{ color: "#555550" }}>
              {isEn ? "months of runway" : "个月资金跑道"}
            </div>
            {runway > 0 && runway < 6 && (
              <p className="mt-3 text-xs" style={{ color: "#A0A09A" }}>
                {isEn
                  ? " Consider raising more capital or cutting costs."
                  : " 建议增加资金或降低运营成本。"}
              </p>
            )}
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A" }}
          >
            <p className="text-xs font-mono mb-1" style={{ color: "#333330" }}>
              {isEn ? "Formula" : "公式"}
            </p>
            <p className="text-xs font-mono" style={{ color: "#444440" }}>
              Runway = Capital ÷ Monthly Burn
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
