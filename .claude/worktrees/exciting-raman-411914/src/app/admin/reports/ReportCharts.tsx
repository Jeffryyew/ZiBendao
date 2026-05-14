"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MonthlyPoint {
  month: string;
  users: number;
  revenue: number;
}

interface PiePoint {
  label: string;
  value: number;
  color?: string;
}

const GOLD = "#C9A84C";
const GREEN = "#4CAF82";
const MUTED = "#1A1A1A";
const BORDER = "#2A2A2A";
const AXIS_COLOR = "#555550";
const TOOLTIP_BG = "#111111";

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#111111", border: `1px solid ${BORDER}` }}>
      <h3 className="text-sm font-semibold mb-6" style={{ color: "#F5F5F0" }}>{title}</h3>
      {children}
    </div>
  );
}

function GoldTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: TOOLTIP_BG, border: `1px solid ${BORDER}` }}>
      <p className="mb-1" style={{ color: "#A0A09A" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: GOLD }}>
          {p.name === "revenue" ? `MYR ${p.value.toFixed(0)}` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function ReportCharts({
  monthlyData,
  docData,
  roleData,
}: {
  monthlyData: MonthlyPoint[];
  docData: PiePoint[];
  roleData: PiePoint[];
}) {
  return (
    <div className="space-y-6">
      {/* User growth + Revenue side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="新增用户（过去6个月）">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
              <XAxis dataKey="month" tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<GoldTooltip />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke={GOLD}
                strokeWidth={2}
                dot={{ fill: GOLD, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="月度收入 MYR（过去6个月）">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
              <XAxis dataKey="month" tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GoldTooltip />} />
              <Bar dataKey="revenue" fill={GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Document status + Role distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="合约状态分布">
          <div className="space-y-3">
            {docData.map((d) => {
              const total = docData.reduce((s, i) => s + i.value, 0);
              const pct = total ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={d.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: "#A0A09A" }}>{d.label}</span>
                    <span style={{ color: "#F5F5F0" }}>{d.value} <span style={{ color: "#555550" }}>({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: d.color ?? GOLD }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="用户角色分布">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={roleData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke={MUTED} horizontal={false} />
              <XAxis type="number" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: TOOLTIP_BG, border: `1px solid ${BORDER}` }}>
                      <span style={{ color: GOLD }}>{payload[0].value} 人</span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {roleData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? GOLD : GREEN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
