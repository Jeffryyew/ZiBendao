"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/tools/ToolShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ForecastForm {
  productName: string;
  unitPrice: string;
  units: [string, string, string, string, string, string];
  growthRate: string;
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTHS_ZH = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"] as const;

function fmtRm(n: number): string {
  return "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function SalesForecastTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";

  const [form, setForm] = useState<ForecastForm>({
    productName: isEn ? "Product A" : "产品 A",
    unitPrice: "299",
    units: ["50", "60", "70", "80", "90", "100"],
    growthRate: "5",
  });

  const setField =
    (field: keyof Omit<ForecastForm, "units">) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const setUnit = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => {
      const units = [...p.units] as ForecastForm["units"];
      units[i] = e.target.value;
      return { ...p, units };
    });

  const data = useMemo(() => {
    const price = parseFloat(form.unitPrice) || 0;
    const growth = parseFloat(form.growthRate) || 0;
    const months = isEn ? MONTHS_EN : MONTHS_ZH;

    return Array.from({ length: 12 }, (_, i) => {
      let units: number;
      if (i < 6) {
        units = parseFloat(form.units[i]) || 0;
      } else {
        const base = parseFloat(form.units[5]) || 0;
        units = base * Math.pow(1 + growth / 100, i - 5);
      }
      const revenue = Math.round(units * price);
      return { month: months[i], units: Math.round(units), revenue };
    });
  }, [form, isEn]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const avgRevenue = totalRevenue / 12;
  const peakIdx = data.reduce((pi, d, i) => (d.revenue > data[pi].revenue ? i : pi), 0);
  const peakMonth = data[peakIdx];

  return (
    <ToolShell
      icon=""
      title={isEn ? "Sales Forecast" : "销售预测系统"}
      desc={isEn ? "12-month revenue projection with growth analysis" : "12个月收入预测，增长率分析与图表"}
      levelRequired={1}
      backHref="/dashboard/capital"
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

          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            {/* Product name */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                {isEn ? "Product / Service" : "产品 / 服务"}
              </label>
              <input
                type="text"
                value={form.productName}
                onChange={setField("productName")}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
              />
            </div>
            {/* Unit price */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                {isEn ? "Unit Price (RM)" : "单价 (RM)"}
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
                  value={form.unitPrice}
                  onChange={setField("unitPrice")}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none font-mono"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>
            </div>
            {/* Growth rate */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                {isEn ? "Monthly Growth Rate after M6 (%)" : "M6后月增长率 (%)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.growthRate}
                  onChange={setField("growthRate")}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none font-mono"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                  style={{ color: "#555550" }}
                >
                  %
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs mb-3" style={{ color: "#555550" }}>
            {isEn ? "Expected Monthly Units (Month 1–6)" : "月销售量预测 (1–6月)"}
          </p>
          <div className="grid grid-cols-6 gap-2">
            {form.units.map((u, i) => (
              <div key={i}>
                <label
                  className="block text-xs mb-1 text-center font-mono"
                  style={{ color: "#444440" }}
                >
                  M{i + 1}
                </label>
                <input
                  type="number"
                  value={u}
                  onChange={setUnit(i)}
                  className="w-full px-2 py-2 rounded-xl text-sm text-center outline-none font-mono"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: isEn ? "Total Annual Revenue" : "年度总收入", value: fmtRm(totalRevenue), accent: true },
            { label: isEn ? "Avg Monthly Revenue" : "月均收入", value: fmtRm(avgRevenue) },
            {
              label: isEn ? "Peak Month" : "最高月份",
              value: `M${peakIdx + 1} · ${fmtRm(peakMonth.revenue)}`,
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: m.accent ? "rgba(201,168,76,0.07)" : "#141414",
                border: `1px solid ${m.accent ? "rgba(201,168,76,0.25)" : "#1E1E1E"}`,
              }}
            >
              <div
                className="text-sm font-bold font-mono truncate"
                style={{ color: m.accent ? "#C9A84C" : "#F5F5F0" }}
              >
                {m.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "#555550" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "#F5F5F0" }}>
            {isEn ? "12-Month Revenue Forecast" : "12个月收入预测图"}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#555550" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${((v as number) / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: "#555550" }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
                formatter={(v) => [
                  typeof v === "number" ? fmtRm(v) : "N/A",
                  isEn ? "Revenue" : "收入",
                ]}
              />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1E1E1E" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: "#141414" }}>
                {[
                  isEn ? "Month" : "月份",
                  isEn ? "Units" : "销量",
                  isEn ? "Revenue (RM)" : "收入 (RM)",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right first:text-left font-mono"
                    style={{ color: "#555550" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#0D0D0D" : "#111111",
                    borderTop: "1px solid #1A1A1A",
                  }}
                >
                  <td className="px-4 py-2.5 font-mono" style={{ color: "#A0A09A" }}>
                    {d.month}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono" style={{ color: "#F5F5F0" }}>
                    {d.units.toLocaleString()}
                  </td>
                  <td
                    className="px-4 py-2.5 text-right font-mono font-semibold"
                    style={{ color: i === peakIdx ? "#C9A84C" : "#F5F5F0" }}
                  >
                    {fmtRm(d.revenue)}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "#1A1A1A", borderTop: "1px solid #2A2A2A" }}>
                <td className="px-4 py-2.5 font-semibold text-xs" style={{ color: "#A0A09A" }}>
                  {isEn ? "Total" : "合计"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold" style={{ color: "#F5F5F0" }}>
                  {data.reduce((s, d) => s + d.units, 0).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-bold" style={{ color: "#C9A84C" }}>
                  {fmtRm(totalRevenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ToolShell>
  );
}
