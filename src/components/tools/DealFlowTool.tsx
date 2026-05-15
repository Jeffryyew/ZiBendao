"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DealStage = "Sourcing" | "Screening" | "Due Diligence" | "Negotiation" | "Closed Won" | "Closed Lost";

const STAGES: DealStage[] = ["Sourcing", "Screening", "Due Diligence", "Negotiation", "Closed Won", "Closed Lost"];

const STAGE_COLORS: Record<DealStage, { bg: string; text: string; border: string }> = {
  Sourcing:      { bg: "rgba(85,85,80,0.2)",    text: "#888880", border: "#2A2A2A" },
  Screening:     { bg: "rgba(59,130,246,0.12)",  text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
  "Due Diligence": { bg: "rgba(201,168,76,0.12)", text: "#C9A84C", border: "rgba(201,168,76,0.3)" },
  Negotiation:   { bg: "rgba(168,92,197,0.12)",  text: "#A85CC5", border: "rgba(168,92,197,0.3)" },
  "Closed Won":  { bg: "rgba(94,171,106,0.12)",  text: "#5EAB6A", border: "rgba(94,171,106,0.3)" },
  "Closed Lost": { bg: "rgba(224,90,90,0.12)",   text: "#E05A5A", border: "rgba(224,90,90,0.3)" },
};

interface Deal {
  id: number;
  company: string;
  industry: string;
  size: string;
  stage: DealStage;
  lastActivity: string;
  addedMonth: string;
}

const INITIAL_DEALS: Deal[] = [
  { id: 1, company: "TechVenture Sdn Bhd", industry: "SaaS",    size: "2000000",  stage: "Due Diligence", lastActivity: "2025-05-10", addedMonth: "2025-03" },
  { id: 2, company: "GreenEnergy Co",      industry: "CleanTech",size: "5000000",  stage: "Screening",     lastActivity: "2025-05-08", addedMonth: "2025-04" },
  { id: 3, company: "HealthBridge MY",     industry: "HealthTech",size: "1500000", stage: "Negotiation",   lastActivity: "2025-05-12", addedMonth: "2025-04" },
  { id: 4, company: "RetailX Platform",    industry: "E-Commerce",size: "800000",  stage: "Closed Won",    lastActivity: "2025-04-20", addedMonth: "2025-02" },
  { id: 5, company: "FinServe Analytics",  industry: "FinTech",   size: "3000000", stage: "Sourcing",      lastActivity: "2025-05-05", addedMonth: "2025-05" },
];

let nextDealId = 6;

function fmtRM(n: number): string {
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `RM ${(n / 1e3).toFixed(0)}K`;
  return `RM ${n}`;
}

export default function DealFlowTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [showForm, setShowForm] = useState(false);
  const [newDeal, setNewDeal] = useState<Omit<Deal, "id">>({
    company: "", industry: "", size: "", stage: "Sourcing",
    lastActivity: new Date().toISOString().slice(0, 10),
    addedMonth: new Date().toISOString().slice(0, 7),
  });

  const addDeal = () => {
    if (!newDeal.company.trim()) return;
    setDeals((p) => [...p, { ...newDeal, id: nextDealId++ }]);
    setNewDeal({ company: "", industry: "", size: "", stage: "Sourcing", lastActivity: new Date().toISOString().slice(0, 10), addedMonth: new Date().toISOString().slice(0, 7) });
    setShowForm(false);
  };

  const removeDeal = (id: number) => setDeals((p) => p.filter((d) => d.id !== id));

  const advanceDeal = (id: number) => {
    setDeals((p) =>
      p.map((d) => {
        if (d.id !== id) return d;
        const idx = STAGES.indexOf(d.stage);
        const next = idx < STAGES.length - 1 ? STAGES[idx + 1] : d.stage;
        return { ...d, stage: next };
      })
    );
  };

  // Summary stats
  const totalDeals = deals.length;
  const totalValue = deals.reduce((s, d) => s + (parseFloat(d.size) || 0), 0);
  const avgSize = totalDeals > 0 ? totalValue / totalDeals : 0;
  const wonDeals = deals.filter((d) => d.stage === "Closed Won").length;
  const closedDeals = deals.filter((d) => d.stage === "Closed Won" || d.stage === "Closed Lost").length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  // Chart: deals by addedMonth
  const monthCounts: Record<string, number> = {};
  deals.forEach((d) => {
    monthCounts[d.addedMonth] = (monthCounts[d.addedMonth] || 0) + 1;
  });
  const chartData = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const inputStyle = {
    backgroundColor: "#0D0D0D",
    border: "1px solid #2A2A2A",
    color: "#F5F5F0",
    borderRadius: "10px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  } as const;

  const STAGE_LABELS: Record<DealStage, { zh: string; en: string }> = {
    Sourcing:        { zh: "寻源", en: "Sourcing" },
    Screening:       { zh: "筛选", en: "Screening" },
    "Due Diligence": { zh: "尽调", en: "Due Diligence" },
    Negotiation:     { zh: "谈判", en: "Negotiation" },
    "Closed Won":    { zh: "成交", en: "Closed Won" },
    "Closed Lost":   { zh: "失败", en: "Closed Lost" },
  };

  return (
    <ToolShell
      icon=""
      title={isEn ? "Deal Flow" : "交易流"}
      desc={isEn ? "Track and manage investment opportunities across your pipeline." : "追踪和管理多个投资机会的完整流程。"}
      levelRequired={2}
      backHref="/tools"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: isEn ? "Total Deals" : "总交易数", value: totalDeals.toString(), color: "#A0A09A" },
          { label: isEn ? "Pipeline Value" : "管道总额", value: fmtRM(totalValue), color: "#C9A84C" },
          { label: isEn ? "Avg Deal Size" : "平均规模", value: fmtRM(avgSize), color: "#3B82F6" },
          { label: isEn ? "Win Rate" : "成交率", value: `${winRate}%`, color: "#5EAB6A" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#555550" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Deal */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-mono" style={{ color: "#3B82F6" }}>
          {isEn ? "DEAL PIPELINE" : "交易管道"}
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          + {isEn ? "Add Deal" : "添加交易"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-4 mb-4 space-y-3" style={{ backgroundColor: "#141414", border: "1px solid rgba(59,130,246,0.2)" }}>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: "company",      label: isEn ? "Company" : "公司",     placeholder: isEn ? "Company name" : "公司名称",     type: "text" },
              { key: "industry",     label: isEn ? "Industry" : "行业",    placeholder: isEn ? "e.g. SaaS, FinTech" : "如 SaaS、金融科技", type: "text" },
              { key: "size",         label: isEn ? "Deal Size (RM)" : "交易规模 (RM)", placeholder: "1000000", type: "number" },
              { key: "lastActivity", label: isEn ? "Last Activity" : "最近活动", placeholder: "", type: "date" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{label}</label>
                <input
                  type={type}
                  value={(newDeal as Record<string, string>)[key]}
                  onChange={(e) => setNewDeal((p) => ({ ...p, [key]: e.target.value }))}
                  style={inputStyle}
                  className="px-3 py-2"
                  placeholder={placeholder}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Stage" : "阶段"}</label>
              <select
                value={newDeal.stage}
                onChange={(e) => setNewDeal((p) => ({ ...p, stage: e.target.value as DealStage }))}
                style={inputStyle}
                className="px-3 py-2"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{isEn ? s : STAGE_LABELS[s].zh}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addDeal} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#3B82F6", color: "#fff" }}>
              {isEn ? "Add" : "添加"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", color: "#666660", border: "1px solid #2A2A2A" }}>
              {isEn ? "Cancel" : "取消"}
            </button>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="overflow-x-auto pb-2 mb-6">
        <div className="flex gap-3 min-w-max">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const sc = STAGE_COLORS[stage];
            const label = isEn ? stage : STAGE_LABELS[stage].zh;
            return (
              <div key={stage} className="w-52 flex-shrink-0">
                {/* Column Header */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-t-xl mb-1"
                  style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}` }}
                >
                  <span className="text-xs font-semibold" style={{ color: sc.text }}>{label}</span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.3)", color: sc.text }}>
                    {stageDeals.length}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="space-y-2">
                  {stageDeals.map((deal) => {
                    const nextIdx = STAGES.indexOf(deal.stage) + 1;
                    const canAdvance = nextIdx < STAGES.length;
                    return (
                      <div
                        key={deal.id}
                        className="rounded-xl p-3"
                        style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
                      >
                        <p className="text-xs font-semibold leading-snug mb-1.5" style={{ color: "#F5F5F0" }}>
                          {deal.company}
                        </p>
                        <p className="text-xs mb-1" style={{ color: "#3B82F6" }}>{deal.industry}</p>
                        <p className="text-xs font-mono mb-2" style={{ color: "#C9A84C" }}>
                          {deal.size ? fmtRM(parseFloat(deal.size)) : "–"}
                        </p>
                        <p className="text-xs mb-2" style={{ color: "#555550" }}>
                          {isEn ? "Last:" : "最近："} {deal.lastActivity}
                        </p>
                        <div className="flex gap-1">
                          {canAdvance && (
                            <button
                              onClick={() => advanceDeal(deal.id)}
                              className="flex-1 text-xs py-1 rounded-lg"
                              style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
                            >
                              → {isEn ? "Advance" : "推进"}
                            </button>
                          )}
                          <button
                            onClick={() => removeDeal(deal.id)}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ backgroundColor: "rgba(224,90,90,0.08)", color: "#E05A5A" }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <div className="rounded-xl py-4 text-center" style={{ border: "1px dashed #1E1E1E" }}>
                      <p className="text-xs" style={{ color: "#333330" }}>{isEn ? "Empty" : "暂无"}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deal Timeline Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
          <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
            {isEn ? "DEALS ADDED BY MONTH" : "按月添加交易数"}
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#555550" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#555550" }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                formatter={(v) => [v, isEn ? "Deals" : "交易数"]}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ToolShell>
  );
}
