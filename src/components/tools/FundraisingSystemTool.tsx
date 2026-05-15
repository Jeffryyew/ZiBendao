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
  Cell,
} from "recharts";

interface CalcForm {
  targetRaise: string;
  preMoneyVal: string;
  shares: string;
  founderShares: string;
}

interface CalcResults {
  postMoney: number;
  equityPct: number;
  pricePerShare: number | null;
  founderBefore: number | null;
  founderAfter: number | null;
  newSharesIssued: number | null;
}

type InvestorStage = "Prospect" | "Contacted" | "Meeting" | "Term Sheet" | "Closed";
type InvestorType = "Angel" | "VC" | "Family Office" | "Corporate";

interface Investor {
  id: number;
  name: string;
  type: InvestorType;
  stage: InvestorStage;
  amount: string;
  notes: string;
}

const STAGE_COLORS: Record<InvestorStage, { bg: string; text: string; border: string }> = {
  Prospect:    { bg: "rgba(85,85,80,0.2)",   text: "#888880", border: "#2A2A2A" },
  Contacted:   { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
  Meeting:     { bg: "rgba(201,168,76,0.12)", text: "#C9A84C", border: "rgba(201,168,76,0.3)" },
  "Term Sheet":{ bg: "rgba(168,92,197,0.12)", text: "#A85CC5", border: "rgba(168,92,197,0.3)" },
  Closed:      { bg: "rgba(94,171,106,0.12)", text: "#5EAB6A", border: "rgba(94,171,106,0.3)" },
};

const PIPELINE_ORDER: InvestorStage[] = ["Prospect", "Contacted", "Meeting", "Term Sheet", "Closed"];

function fmtRM(n: number): string {
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `RM ${(n / 1e3).toFixed(1)}K`;
  return `RM ${n.toFixed(0)}`;
}

let nextId = 4;

export default function FundraisingSystemTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";

  const [form, setForm] = useState<CalcForm>({
    targetRaise: "2000000",
    preMoneyVal: "8000000",
    shares: "1000000",
    founderShares: "800000",
  });
  const [results, setResults] = useState<CalcResults | null>(null);

  const [investors, setInvestors] = useState<Investor[]>([
    { id: 1, name: "Alpha Ventures", type: "VC",           stage: "Meeting",    amount: "500000",  notes: "Follow-up Q3" },
    { id: 2, name: "Tan Wei Liang",  type: "Angel",        stage: "Contacted",  amount: "200000",  notes: "Intro call done" },
    { id: 3, name: "Nexus Corp",     type: "Corporate",    stage: "Prospect",   amount: "1000000", notes: "" },
  ]);
  const [addForm, setAddForm] = useState({ name: "", type: "Angel" as InvestorType, stage: "Prospect" as InvestorStage, amount: "", notes: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const set = (f: keyof CalcForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const calculate = () => {
    const raise = parseFloat(form.targetRaise) || 0;
    const pre = parseFloat(form.preMoneyVal) || 0;
    const shares = parseFloat(form.shares) || 0;
    const founderShares = parseFloat(form.founderShares) || 0;

    if (pre <= 0 || raise <= 0) return;

    const postMoney = pre + raise;
    const equityPct = (raise / postMoney) * 100;
    const pricePerShare = shares > 0 ? pre / shares : null;
    const founderBefore = shares > 0 ? (founderShares / shares) * 100 : null;
    const newSharesIssued = pricePerShare && pricePerShare > 0 ? raise / pricePerShare : null;
    const founderAfter = newSharesIssued && shares > 0
      ? (founderShares / (shares + newSharesIssued)) * 100
      : null;

    setResults({ postMoney, equityPct, pricePerShare, founderBefore, founderAfter, newSharesIssued });
  };

  const addInvestor = () => {
    if (!addForm.name.trim()) return;
    setInvestors((p) => [...p, { ...addForm, id: nextId++ }]);
    setAddForm({ name: "", type: "Angel", stage: "Prospect", amount: "", notes: "" });
    setShowAddForm(false);
  };

  const removeInvestor = (id: number) => setInvestors((p) => p.filter((inv) => inv.id !== id));

  const updateStage = (id: number, stage: InvestorStage) =>
    setInvestors((p) => p.map((inv) => (inv.id === id ? { ...inv, stage } : inv)));

  const totalTargeted = investors.reduce((s, inv) => s + (parseFloat(inv.amount) || 0), 0);
  const totalClosed   = investors.filter((inv) => inv.stage === "Closed").reduce((s, inv) => s + (parseFloat(inv.amount) || 0), 0);
  const pipelinePct   = totalTargeted > 0 ? Math.round((totalClosed / totalTargeted) * 100) : 0;

  const chartData = PIPELINE_ORDER.map((stage) => ({
    stage,
    count: investors.filter((inv) => inv.stage === stage).length,
    value: investors.filter((inv) => inv.stage === stage).reduce((s, inv) => s + (parseFloat(inv.amount) || 0), 0),
  }));

  const inputStyle = {
    backgroundColor: "#0D0D0D",
    border: "1px solid #2A2A2A",
    color: "#F5F5F0",
    borderRadius: "10px",
    fontSize: "13px",
    fontFamily: "var(--font-mono)",
    outline: "none",
  } as const;

  return (
    <ToolShell
      icon=""
      title={isEn ? "Fundraising System" : "融资系统"}
      desc={isEn ? "Calculate your raise terms and track your investor pipeline." : "计算融资条款，追踪投资人管道进展。"}
      levelRequired={2}
      backHref="/tools"
    >
      {/*  Section 1: Calculator  */}
      <div className="mb-8">
        <p className="text-xs font-mono mb-4" style={{ color: "#3B82F6" }}>
          {isEn ? "01 / FUNDRAISING CALCULATOR" : "01 / 融资计算器"}
        </p>
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Inputs */}
          <div className="lg:col-span-2">
            <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <div className="space-y-4">
                {[
                  { field: "targetRaise",  label: isEn ? "Target Raise (RM)" : "目标融资额 (RM)", prefix: "RM" },
                  { field: "preMoneyVal",  label: isEn ? "Pre-money Valuation (RM)" : "融资前估值 (RM)", prefix: "RM" },
                  { field: "shares",       label: isEn ? "Total Shares (pre-round)" : "现有总股数（轮前）", suffix: isEn ? "shares" : "股" },
                  { field: "founderShares",label: isEn ? "Founder Shares" : "创始人持股数", suffix: isEn ? "shares" : "股" },
                ].map(({ field, label, prefix, suffix }) => (
                  <div key={field}>
                    <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>{label}</label>
                    <div className="relative">
                      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#555550" }}>{prefix}</span>}
                      <input
                        type="number"
                        value={form[field as keyof CalcForm]}
                        onChange={set(field as keyof CalcForm)}
                        className="w-full py-2.5"
                        style={{ ...inputStyle, paddingLeft: prefix ? "44px" : "12px", paddingRight: suffix ? "56px" : "12px" }}
                        onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                        onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                      />
                      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#555550" }}>{suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={calculate}
                className="w-full mt-5 py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#3B82F6", color: "#fff" }}
              >
                {isEn ? "Calculate →" : "开始计算 →"}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: isEn ? "Post-money Valuation" : "融资后估值", value: fmtRM(results.postMoney), accent: true },
                    { label: isEn ? "Equity Given Away" : "出让股权比例", value: `${results.equityPct.toFixed(2)}%`, accent: false },
                    { label: isEn ? "Price Per Share" : "每股价格", value: results.pricePerShare ? `RM ${results.pricePerShare.toFixed(4)}` : "N/A", accent: false },
                    { label: isEn ? "New Shares Issued" : "新增股数", value: results.newSharesIssued ? Math.round(results.newSharesIssued).toLocaleString() : "N/A", accent: false },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl p-4 text-center"
                      style={{
                        backgroundColor: m.accent ? "rgba(59,130,246,0.07)" : "#141414",
                        border: `1px solid ${m.accent ? "rgba(59,130,246,0.25)" : "#1E1E1E"}`,
                      }}
                    >
                      <div className="text-lg font-bold font-mono" style={{ color: m.accent ? "#3B82F6" : "#F5F5F0" }}>
                        {m.value}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "#555550" }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Dilution Table */}
                {results.founderBefore !== null && results.founderAfter !== null && (
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1E1E1E" }}>
                    <div className="px-4 py-2.5" style={{ backgroundColor: "#1A1A1A" }}>
                      <span className="text-xs font-mono" style={{ color: "#666660" }}>
                        {isEn ? "DILUTION TABLE" : "稀释对照表"}
                      </span>
                    </div>
                    <div className="divide-y divide-[#1E1E1E]">
                      {[
                        { label: isEn ? "Founder (Before Round)" : "创始人（融资前）", value: `${results.founderBefore.toFixed(2)}%`, color: "#A0A09A" },
                        { label: isEn ? "Founder (After Round)" : "创始人（融资后）", value: `${results.founderAfter.toFixed(2)}%`, color: "#C9A84C" },
                        { label: isEn ? "New Investor Stake" : "新投资人股权", value: `${results.equityPct.toFixed(2)}%`, color: "#3B82F6" },
                        { label: isEn ? "Dilution" : "稀释幅度", value: `${(results.founderBefore - results.founderAfter).toFixed(2)}%`, color: "#E05A5A" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: "#141414" }}>
                          <span className="text-xs" style={{ color: "#A0A09A" }}>{row.label}</span>
                          <span className="text-sm font-bold font-mono" style={{ color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-48 rounded-xl" style={{ backgroundColor: "#111111", border: "1px dashed #222222" }}>
                <span className="text-3xl mb-2 opacity-30"></span>
                <p className="text-sm" style={{ color: "#444440" }}>
                  {isEn ? "Fill inputs and click Calculate" : "填写参数后点击「开始计算」"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/*  Section 2: Investor Pipeline  */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono" style={{ color: "#3B82F6" }}>
            {isEn ? "02 / INVESTOR PIPELINE" : "02 / 投资人管道"}
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            + {isEn ? "Add Investor" : "添加投资人"}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: isEn ? "Total Targeted" : "总目标金额", value: fmtRM(totalTargeted), color: "#A0A09A" },
            { label: isEn ? "Total Secured" : "已确认金额", value: fmtRM(totalClosed), color: "#5EAB6A" },
            { label: isEn ? "Pipeline %" : "管道完成率", value: `${pipelinePct}%`, color: "#C9A84C" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "#555550" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="rounded-xl p-4 mb-4 space-y-3" style={{ backgroundColor: "#141414", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Name" : "名称"}</label>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                  placeholder={isEn ? "Investor / Fund name" : "投资人 / 基金名称"}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Amount (RM)" : "金额 (RM)"}</label>
                <input
                  type="number"
                  value={addForm.amount}
                  onChange={(e) => setAddForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                  placeholder="500000"
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Type" : "类型"}</label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value as InvestorType }))}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                >
                  {(["Angel", "VC", "Family Office", "Corporate"] as InvestorType[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Stage" : "阶段"}</label>
                <select
                  value={addForm.stage}
                  onChange={(e) => setAddForm((p) => ({ ...p, stage: e.target.value as InvestorStage }))}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                >
                  {PIPELINE_ORDER.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Notes" : "备注"}</label>
              <input
                value={addForm.notes}
                onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg"
                style={inputStyle}
                placeholder={isEn ? "Optional notes..." : "可选备注..."}
                onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addInvestor} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#3B82F6", color: "#fff" }}>
                {isEn ? "Add" : "添加"}
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", color: "#666660", border: "1px solid #2A2A2A" }}>
                {isEn ? "Cancel" : "取消"}
              </button>
            </div>
          </div>
        )}

        {/* Investor Table */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid #1E1E1E" }}>
          <div className="px-4 py-2.5 grid grid-cols-12 gap-2" style={{ backgroundColor: "#1A1A1A" }}>
            {[isEn ? "Name" : "名称", isEn ? "Type" : "类型", isEn ? "Stage" : "阶段", isEn ? "Amount" : "金额", isEn ? "Notes" : "备注", ""].map((h, i) => (
              <span key={i} className={`text-xs font-mono col-span-${[3, 2, 2, 2, 2, 1][i]}`} style={{ color: "#666660" }}>{h}</span>
            ))}
          </div>
          {investors.length === 0 ? (
            <div className="py-8 text-center" style={{ backgroundColor: "#111111" }}>
              <p className="text-sm" style={{ color: "#444440" }}>{isEn ? "No investors yet" : "尚无投资人"}</p>
            </div>
          ) : (
            investors.map((inv) => {
              const sc = STAGE_COLORS[inv.stage];
              const nextStageIdx = PIPELINE_ORDER.indexOf(inv.stage) + 1;
              const nextStage = nextStageIdx < PIPELINE_ORDER.length ? PIPELINE_ORDER[nextStageIdx] : null;
              return (
                <div
                  key={inv.id}
                  className="px-4 py-3 grid grid-cols-12 gap-2 items-center"
                  style={{ backgroundColor: "#141414", borderTop: "1px solid #1A1A1A" }}
                >
                  <span className="text-sm col-span-3 truncate" style={{ color: "#F5F5F0" }}>{inv.name}</span>
                  <span className="text-xs col-span-2" style={{ color: "#888880" }}>{inv.type}</span>
                  <span className="col-span-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                      {inv.stage}
                    </span>
                  </span>
                  <span className="text-xs font-mono col-span-2" style={{ color: "#C9A84C" }}>
                    {inv.amount ? fmtRM(parseFloat(inv.amount)) : "–"}
                  </span>
                  <span className="text-xs col-span-2 truncate" style={{ color: "#555550" }}>{inv.notes || "–"}</span>
                  <div className="col-span-1 flex gap-1 justify-end">
                    {nextStage && (
                      <button
                        onClick={() => updateStage(inv.id, nextStage)}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                        title={`Move to ${nextStage}`}
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => removeInvestor(inv.id)}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(224,90,90,0.1)", color: "#E05A5A" }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pipeline Chart */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
          <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
            {isEn ? "PIPELINE BY STAGE (RM)" : "各阶段金额分布 (RM)"}
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "#555550" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#666660" }} axisLine={false} tickLine={false} width={75} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                formatter={(v) => [fmtRM(v as number), isEn ? "Value" : "金额"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.stage === "Closed" ? "#5EAB6A" : entry.stage === "Term Sheet" ? "#C9A84C" : "#3B82F6"} opacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ToolShell>
  );
}
