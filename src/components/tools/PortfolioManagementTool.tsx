"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/tools/ToolShell";
import type { Locale } from "@/lib/i18n";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const PURPLE = "#8B5CF6";
const GOLD = "#C9A84C";
const PIE_COLORS = [PURPLE, GOLD, "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];

const inputSt: React.CSSProperties = {
  backgroundColor: "#0D0D0D",
  border: "1px solid #2A2A2A",
  color: "#F5F5F0",
  borderRadius: "10px",
  fontSize: "13px",
  fontFamily: "var(--font-mono)",
  outline: "none",
  width: "100%",
  padding: "8px 10px",
};

const STAGES = ["Seed", "Series A", "Series B", "Growth"] as const;
type Stage = (typeof STAGES)[number];
type InvStatus = "Active" | "Exited" | "Written Off";

interface Investment {
  id: string;
  company: string;
  industry: string;
  stage: Stage;
  invested: number;
  dateInvested: string;
  currentValuation: number;
  status: InvStatus;
}

let _iid = 1;
const uid = () => String(_iid++);

function fmtRM(n: number) {
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `RM ${(n / 1e3).toFixed(0)}K`;
  return `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}

function moic(invested: number, val: number) {
  return invested > 0 ? val / invested : 0;
}

function approxIrr(invested: number, val: number, dateStr: string): number | null {
  if (!dateStr || !invested || !val) return null;
  const years = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (years <= 0) return null;
  return (Math.pow(val / invested, 1 / years) - 1) * 100;
}

const SAMPLE_INVESTMENTS: Investment[] = [
  { id: uid(), company: "TechVenture A", industry: "Technology", stage: "Seed", invested: 500000, dateInvested: "2022-01-15", currentValuation: 1500000, status: "Active" },
  { id: uid(), company: "HealthBridge", industry: "Healthcare", stage: "Series A", invested: 2000000, dateInvested: "2021-06-01", currentValuation: 5000000, status: "Active" },
  { id: uid(), company: "EduMax", industry: "Education", stage: "Seed", invested: 300000, dateInvested: "2023-03-10", currentValuation: 600000, status: "Active" },
  { id: uid(), company: "GreenLogistics", industry: "Logistics", stage: "Series B", invested: 5000000, dateInvested: "2020-09-20", currentValuation: 12000000, status: "Exited" },
];

export default function PortfolioManagementTool({ locale }: { locale: Locale }) {
  const isEn = locale === "en";

  const [investments, setInvestments] = useState<Investment[]>(SAMPLE_INVESTMENTS);
  const [showForm, setShowForm] = useState(false);
  const [newInv, setNewInv] = useState({
    company: "",
    industry: "",
    stage: "Seed" as Stage,
    invested: "",
    dateInvested: "",
    currentValuation: "",
    status: "Active" as InvStatus,
  });

  const setNi = (f: keyof typeof newInv) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewInv((p) => ({ ...p, [f]: e.target.value }));

  const addInvestment = () => {
    if (!newInv.company || !newInv.invested || !newInv.currentValuation) return;
    setInvestments((p) => [...p, {
      id: uid(),
      company: newInv.company,
      industry: newInv.industry,
      stage: newInv.stage,
      invested: parseFloat(newInv.invested) || 0,
      dateInvested: newInv.dateInvested,
      currentValuation: parseFloat(newInv.currentValuation) || 0,
      status: newInv.status,
    }]);
    setNewInv({ company: "", industry: "", stage: "Seed", invested: "", dateInvested: "", currentValuation: "", status: "Active" });
    setShowForm(false);
  };

  const removeInvestment = (id: string) => setInvestments((p) => p.filter((i) => i.id !== id));

  const active = investments.filter((i) => i.status !== "Written Off");

  const metrics = useMemo(() => {
    const totalInvested = active.reduce((s, i) => s + i.invested, 0);
    const totalCurrentValue = active.reduce((s, i) => s + i.currentValuation, 0);
    const overallMoic = moic(totalInvested, totalCurrentValue);

    const withMoic = active.map((i) => ({ ...i, moic: moic(i.invested, i.currentValuation) }));
    const best = withMoic.length > 0 ? withMoic.reduce((a, b) => a.moic > b.moic ? a : b) : null;
    const worst = withMoic.length > 0 ? withMoic.reduce((a, b) => a.moic < b.moic ? a : b) : null;

    // Industry distribution
    const industryMap: Record<string, number> = {};
    active.forEach((i) => { industryMap[i.industry] = (industryMap[i.industry] || 0) + i.invested; });
    const industryPie = Object.entries(industryMap).map(([name, value]) => ({ name, value }));

    // Stage distribution
    const stageMap: Record<string, number> = {};
    active.forEach((i) => { stageMap[i.stage] = (stageMap[i.stage] || 0) + 1; });

    // Vintage year
    const vintageMap: Record<string, { invested: number; value: number; count: number }> = {};
    active.forEach((i) => {
      if (i.dateInvested) {
        const yr = new Date(i.dateInvested).getFullYear().toString();
        if (!vintageMap[yr]) vintageMap[yr] = { invested: 0, value: 0, count: 0 };
        vintageMap[yr].invested += i.invested;
        vintageMap[yr].value += i.currentValuation;
        vintageMap[yr].count += 1;
      }
    });
    const vintageData = Object.entries(vintageMap).sort(([a], [b]) => a.localeCompare(b)).map(([yr, d]) => ({
      year: yr, invested: d.invested, value: d.value, count: d.count,
    }));

    return { totalInvested, totalCurrentValue, overallMoic, best, worst, industryPie, stageMap, vintageData };
  }, [active]);

  const barData = active.map((i) => ({
    name: i.company.length > 10 ? i.company.slice(0, 10) + "…" : i.company,
    invested: i.invested,
    value: i.currentValuation,
  }));

  const selectSt: React.CSSProperties = { ...inputSt, cursor: "pointer" };

  const statusColor = (s: InvStatus) =>
    s === "Active" ? "#10B981" : s === "Exited" ? GOLD : "#EF4444";

  return (
    <ToolShell
      icon=""
      title={isEn ? "Portfolio Management" : "投资组合管理"}
      desc={isEn ? "Track your investment portfolio, calculate MOIC and analyze distribution." : "追踪投资组合，计算MOIC、IRR与行业分布分析。"}
      levelRequired={3}
      backHref="/dashboard/capital"
    >
      <div className="space-y-6">
        {/* Metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isEn ? "Total Invested" : "总投资额", value: fmtRM(metrics.totalInvested), color: GOLD },
            { label: isEn ? "Portfolio Value" : "当前价值", value: fmtRM(metrics.totalCurrentValue), color: PURPLE },
            { label: "Overall MOIC", value: `${metrics.overallMoic.toFixed(2)}×`, color: metrics.overallMoic >= 2 ? "#10B981" : metrics.overallMoic >= 1 ? GOLD : "#EF4444" },
            { label: isEn ? "Companies" : "投资公司数", value: investments.length.toString(), color: "#A0A09A" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <div className="text-2xl font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs mt-1" style={{ color: "#555550" }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Best/Worst */}
        {(metrics.best || metrics.worst) && (
          <div className="grid sm:grid-cols-2 gap-3">
            {metrics.best && (
              <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="text-xl"></span>
                <div>
                  <p className="text-xs" style={{ color: "#10B981" }}>{isEn ? "Best Performer" : "最佳表现"}</p>
                  <p className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>{metrics.best.company}</p>
                  <p className="text-xs font-mono" style={{ color: "#10B981" }}>{metrics.best.moic.toFixed(2)}× MOIC</p>
                </div>
              </div>
            )}
            {metrics.worst && (
              <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span className="text-xl"></span>
                <div>
                  <p className="text-xs" style={{ color: "#EF4444" }}>{isEn ? "Needs Attention" : "需关注"}</p>
                  <p className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>{metrics.worst.company}</p>
                  <p className="text-xs font-mono" style={{ color: "#EF4444" }}>{metrics.worst.moic.toFixed(2)}× MOIC</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add investment + table */}
        <div className="flex justify-between items-center">
          <p className="text-xs font-mono" style={{ color: "#666660" }}>{isEn ? "PORTFOLIO COMPANIES" : "投资组合企业"}</p>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: showForm ? "#1A1A1A" : PURPLE, color: showForm ? "#666660" : "#fff", border: `1px solid ${showForm ? "#2A2A2A" : PURPLE}` }}
          >
            {showForm ? (isEn ? "Cancel" : "取消") : `+ ${isEn ? "Add Investment" : "添加投资"}`}
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: `1px solid rgba(139,92,246,0.3)` }}>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { f: "company" as const, label: isEn ? "Company Name" : "公司名称", type: "text", placeholder: "ABC Sdn Bhd" },
                { f: "industry" as const, label: isEn ? "Industry" : "行业", type: "text", placeholder: isEn ? "Technology" : "科技" },
                { f: "invested" as const, label: isEn ? "Amount Invested (RM)" : "投资金额 (RM)", type: "number", placeholder: "500000" },
                { f: "currentValuation" as const, label: isEn ? "Current Valuation (RM)" : "当前估值 (RM)", type: "number", placeholder: "1500000" },
                { f: "dateInvested" as const, label: isEn ? "Date Invested" : "投资日期", type: "date", placeholder: "" },
              ].map(({ f, label, type, placeholder }) => (
                <div key={f}>
                  <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{label}</label>
                  <input type={type} value={newInv[f] as string} onChange={setNi(f)} placeholder={placeholder} style={inputSt} onFocus={(e) => (e.target.style.borderColor = PURPLE)} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                </div>
              ))}
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Stage" : "阶段"}</label>
                <select value={newInv.stage} onChange={setNi("stage")} style={selectSt}>
                  {STAGES.map((s) => <option key={s} value={s} style={{ backgroundColor: "#1A1A1A" }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Status" : "状态"}</label>
                <select value={newInv.status} onChange={setNi("status")} style={selectSt}>
                  {(["Active", "Exited", "Written Off"] as InvStatus[]).map((s) => <option key={s} value={s} style={{ backgroundColor: "#1A1A1A" }}>{s}</option>)}
                </select>
              </div>
            </div>
            <button onClick={addInvestment} className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: PURPLE, color: "#fff" }}>
              {isEn ? "Add to Portfolio" : "添加至投资组合"}
            </button>
          </div>
        )}

        {/* Investment table */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {[isEn ? "Company" : "公司", isEn ? "Industry" : "行业", isEn ? "Stage" : "阶段", isEn ? "Invested" : "投资额", isEn ? "Value" : "估值", "MOIC", isEn ? "IRR" : "IRR", isEn ? "Status" : "状态", ""].map((h) => (
                    <th key={h} className="text-left pb-2 pr-3 font-mono" style={{ color: "#555550" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const m = moic(inv.invested, inv.currentValuation);
                  const irr = approxIrr(inv.invested, inv.currentValuation, inv.dateInvested);
                  const moicColor = m >= 2 ? "#10B981" : m >= 1 ? GOLD : "#EF4444";
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #1A1A1A" }}>
                      <td className="py-2 pr-3 font-semibold" style={{ color: "#F5F5F0" }}>{inv.company}</td>
                      <td className="py-2 pr-3" style={{ color: "#A0A09A" }}>{inv.industry}</td>
                      <td className="py-2 pr-3">
                        <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#A78BFA" }}>{inv.stage}</span>
                      </td>
                      <td className="py-2 pr-3 font-mono" style={{ color: GOLD }}>{fmtRM(inv.invested)}</td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "#F5F5F0" }}>{fmtRM(inv.currentValuation)}</td>
                      <td className="py-2 pr-3 font-mono font-bold" style={{ color: moicColor }}>{m.toFixed(2)}×</td>
                      <td className="py-2 pr-3 font-mono" style={{ color: irr !== null ? (irr >= 20 ? "#10B981" : GOLD) : "#555550" }}>
                        {irr !== null ? `${irr.toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-2 pr-3">
                        <span style={{ color: statusColor(inv.status), fontSize: "11px" }}>{inv.status}</span>
                      </td>
                      <td className="py-2">
                        <button onClick={() => removeInvestment(inv.id)} className="text-xs" style={{ color: "#3A3A3A" }}>×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Industry pie */}
          {metrics.industryPie.length > 0 && (
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "BY INDUSTRY" : "行业分布"}</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={metrics.industryPie} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {metrics.industryPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                    formatter={(v) => [typeof v === "number" ? fmtRM(v) : "—", undefined]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Invested vs Value bar */}
          {barData.length > 0 && (
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "INVESTED VS VALUE" : "投资额 vs 估值"}</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#666660" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 9, fill: "#555550" }} axisLine={false} tickLine={false} width={38} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                    formatter={(v) => [typeof v === "number" ? fmtRM(v) : "—", undefined]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "#888880" }} />
                  <Bar dataKey="invested" fill={`${GOLD}80`} name={isEn ? "Invested" : "投资额"} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="value" fill={PURPLE} name={isEn ? "Current Value" : "当前估值"} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stage distribution + Vintage */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "STAGE DISTRIBUTION" : "阶段分布"}</p>
            <div className="space-y-2">
              {STAGES.map((stage) => {
                const count = investments.filter((i) => i.stage === stage).length;
                const pct = investments.length > 0 ? (count / investments.length) * 100 : 0;
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "#A0A09A" }}>{stage}</span>
                      <span className="font-mono" style={{ color: PURPLE }}>{count} {isEn ? "co." : "家"}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1E1E" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PURPLE }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "VINTAGE YEAR ANALYSIS" : "年份分析"}</p>
            {metrics.vintageData.length > 0 ? (
              <div className="space-y-3">
                {metrics.vintageData.map((v) => (
                  <div key={v.year} className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid #1A1A1A" }}>
                    <span className="text-xs font-mono" style={{ color: "#A0A09A" }}>{v.year}</span>
                    <div className="text-right">
                      <div className="text-xs font-mono" style={{ color: GOLD }}>{fmtRM(v.invested)} {isEn ? "invested" : "投入"}</div>
                      <div className="text-xs font-mono" style={{ color: PURPLE }}>{fmtRM(v.value)} {isEn ? "value" : "估值"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-6" style={{ color: "#444440" }}>{isEn ? "Add investment dates to see vintage analysis" : "添加投资日期以查看年份分析"}</p>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
