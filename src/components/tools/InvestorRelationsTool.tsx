"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface UpdateFields {
  month: string;
  highlights: string;
  revenue: string;
  users: string;
  burnRate: string;
  challenges: string;
  solutions: string;
  nextGoals: string;
  ask: string;
}

interface KPIMetric {
  label: string;
  labelZh: string;
  value: string;
  prev: string;
  unit: string;
  higher: boolean;
}

type InvestorType = "Angel" | "VC" | "Family Office" | "Strategic";

interface InvestorEntry {
  id: number;
  name: string;
  type: InvestorType;
  pct: string;
  contact: string;
  lastUpdate: string;
}

let nextInvId = 3;

const DEFAULT_UPDATE: UpdateFields = {
  month: "",
  highlights: "",
  revenue: "",
  users: "",
  burnRate: "",
  challenges: "",
  solutions: "",
  nextGoals: "",
  ask: "",
};

const DEFAULT_KPIS: KPIMetric[] = [
  { label: "Revenue MoM Growth", labelZh: "月收入增长", value: "", prev: "", unit: "%", higher: true },
  { label: "User Growth", labelZh: "用户增长", value: "", prev: "", unit: "%", higher: true },
  { label: "Burn Rate", labelZh: "资金消耗率", value: "", prev: "", unit: "RM/mo", higher: false },
  { label: "Runway", labelZh: "资金跑道", value: "", prev: "", unit: "months", higher: true },
  { label: "Gross Margin", labelZh: "毛利率", value: "", prev: "", unit: "%", higher: true },
  { label: "NPS Score", labelZh: "净推荐值", value: "", prev: "", unit: "", higher: true },
];

export default function InvestorRelationsTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const [activeTab, setActiveTab] = useState<"update" | "kpi" | "registry">("update");

  const [fields, setFields] = useState<UpdateFields>(DEFAULT_UPDATE);
  const [kpis, setKpis] = useState<KPIMetric[]>(DEFAULT_KPIS);
  const [copied, setCopied] = useState(false);

  const [investors, setInvestors] = useState<InvestorEntry[]>([
    { id: 1, name: "Nexus Capital", type: "VC", pct: "15", contact: "lim@nexus.vc", lastUpdate: "2025-04-01" },
    { id: 2, name: "Tan Wei Liang", type: "Angel", pct: "5", contact: "twl@gmail.com", lastUpdate: "2025-03-15" },
  ]);
  const [invForm, setInvForm] = useState({ name: "", type: "Angel" as InvestorType, pct: "", contact: "", lastUpdate: "" });
  const [showInvForm, setShowInvForm] = useState(false);

  const setField = (f: keyof UpdateFields) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    setFields((p) => ({ ...p, [f]: e.target.value }));

  const setKpi = (i: number, key: "value" | "prev") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setKpis((p) => p.map((k, idx) => (idx === i ? { ...k, [key]: e.target.value } : k)));

  const addInvestor = () => {
    if (!invForm.name.trim()) return;
    setInvestors((p) => [...p, { ...invForm, id: nextInvId++ }]);
    setInvForm({ name: "", type: "Angel", pct: "", contact: "", lastUpdate: "" });
    setShowInvForm(false);
  };

  const previewText = `
${isEn ? "INVESTOR UPDATE" : "投资人月报"} — ${fields.month || (isEn ? "Month Year" : "年月")}

${isEn ? " Business Highlights" : " 业务亮点"}
${fields.highlights || (isEn ? "(Enter highlights...)" : "（请填写亮点...）")}

${isEn ? " Key Metrics" : " 关键指标"}
• ${isEn ? "Revenue:" : "收入："} ${fields.revenue || "–"}
• ${isEn ? "Users:" : "用户："} ${fields.users || "–"}
• ${isEn ? "Burn Rate:" : "资金消耗："} ${fields.burnRate || "–"}

${isEn ? " Challenges & How We're Addressing Them" : " 挑战与应对"}
${fields.challenges || (isEn ? "(Enter challenges...)" : "（请填写挑战...）")}
${isEn ? "→ How:" : "→ 解决方案："} ${fields.solutions || "–"}

${isEn ? " Next Month Goals" : " 下月目标"}
${fields.nextGoals || (isEn ? "(Enter goals...)" : "（请填写目标...）")}

${fields.ask ? `${isEn ? " Ask / Request" : " 请求"}
${fields.ask}` : ""}

—
${isEn ? "Sent with ZiBenDao Capital OS" : "由资本道资本操作系统发送"}
`.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inputStyle = {
    backgroundColor: "#0D0D0D",
    border: "1px solid #2A2A2A",
    color: "#F5F5F0",
    borderRadius: "10px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  } as const;

  const tabs = [
    { id: "update" as const, label: isEn ? "Update Template" : "月报模板" },
    { id: "kpi" as const, label: isEn ? "KPI Dashboard" : "KPI 仪表盘" },
    { id: "registry" as const, label: isEn ? "Investor Registry" : "投资人名册" },
  ];

  return (
    <ToolShell
      icon=""
      title={isEn ? "Investor Relations" : "投资关系"}
      desc={isEn ? "Build investor updates, track KPIs, and manage your investor registry." : "撰写投资人月报，追踪 KPI，管理投资人名册。"}
      levelRequired={2}
      backHref="/dashboard/capital"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? "rgba(59,130,246,0.12)" : "#141414",
              color: activeTab === tab.id ? "#3B82F6" : "#666660",
              border: `1px solid ${activeTab === tab.id ? "rgba(59,130,246,0.3)" : "#1E1E1E"}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/*  Tab 1: Update Template  */}
      {activeTab === "update" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Form */}
          <div className="space-y-4">
            <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
                {isEn ? "FILL IN YOUR UPDATE" : "填写月报内容"}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Month / Period" : "月份 / 周期"}</label>
                  <input value={fields.month} onChange={setField("month")} className="px-3 py-2" style={inputStyle} placeholder={isEn ? "e.g. May 2025" : "如 2025年5月"} onFocus={(e) => (e.target.style.borderColor = "#3B82F6")} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Business Highlights" : "业务亮点"}</label>
                  <textarea value={fields.highlights} onChange={setField("highlights")} rows={2} className="px-3 py-2 resize-none" style={inputStyle} placeholder={isEn ? "Key wins this month..." : "本月关键成果..."} onFocus={(e) => (e.target.style.borderColor = "#3B82F6")} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { field: "revenue" as const, label: isEn ? "Revenue" : "收入", placeholder: "RM 120K" },
                    { field: "users" as const, label: isEn ? "Users" : "用户", placeholder: "2,400" },
                    { field: "burnRate" as const, label: isEn ? "Burn Rate" : "消耗率", placeholder: "RM 80K/mo" },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field}>
                      <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{label}</label>
                      <input value={fields[field]} onChange={setField(field)} className="px-3 py-2" style={inputStyle} placeholder={placeholder} onFocus={(e) => (e.target.style.borderColor = "#3B82F6")} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Challenges" : "挑战"}</label>
                  <textarea value={fields.challenges} onChange={setField("challenges")} rows={2} className="px-3 py-2 resize-none" style={inputStyle} placeholder={isEn ? "Key challenges faced..." : "面临的主要挑战..."} onFocus={(e) => (e.target.style.borderColor = "#3B82F6")} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "How You're Addressing Them" : "应对方案"}</label>
                  <textarea value={fields.solutions} onChange={setField("solutions")} rows={2} className="px-3 py-2 resize-none" style={inputStyle} placeholder={isEn ? "Actions taken / planned..." : "已采取或计划的行动..."} onFocus={(e) => (e.target.style.borderColor = "#3B82F6")} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Next Month Goals" : "下月目标"}</label>
                  <textarea value={fields.nextGoals} onChange={setField("nextGoals")} rows={2} className="px-3 py-2 resize-none" style={inputStyle} placeholder={isEn ? "Goals for next month..." : "下月计划目标..."} onFocus={(e) => (e.target.style.borderColor = "#3B82F6")} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Ask (if any)" : "请求（如有）"}</label>
                  <input value={fields.ask} onChange={setField("ask")} className="px-3 py-2" style={inputStyle} placeholder={isEn ? "Intro request, advice needed..." : "需要介绍、建议..."} onFocus={(e) => (e.target.style.borderColor = "#3B82F6")} onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")} />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="rounded-xl overflow-hidden h-full flex flex-col" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                <span className="text-xs font-mono" style={{ color: "#666660" }}>{isEn ? "PREVIEW" : "预览"}</span>
                <button
                  onClick={copyToClipboard}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: copied ? "rgba(94,171,106,0.1)" : "rgba(59,130,246,0.1)",
                    color: copied ? "#5EAB6A" : "#3B82F6",
                    border: `1px solid ${copied ? "rgba(94,171,106,0.25)" : "rgba(59,130,246,0.25)"}`,
                  }}
                >
                  {copied ? (isEn ? " Copied!" : " 已复制！") : (isEn ? "Copy to Clipboard" : "复制到剪贴板")}
                </button>
              </div>
              <pre className="flex-1 p-4 text-xs leading-relaxed overflow-auto whitespace-pre-wrap" style={{ color: "#A0A09A", fontFamily: "var(--font-mono)" }}>
                {previewText}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/*  Tab 2: KPI Dashboard  */}
      {activeTab === "kpi" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi, i) => {
              const curr = parseFloat(kpi.value);
              const prev = parseFloat(kpi.prev);
              const hasTrend = !isNaN(curr) && !isNaN(prev) && prev !== 0;
              const delta = hasTrend ? curr - prev : 0;
              const pct = hasTrend ? ((delta / Math.abs(prev)) * 100).toFixed(1) : null;
              const isUp = delta > 0;
              const isGood = kpi.higher ? isUp : !isUp;
              const trendColor = hasTrend ? (isGood ? "#5EAB6A" : "#E05A5A") : "#555550";

              return (
                <div key={i} className="rounded-xl p-4" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs" style={{ color: "#666660" }}>{isEn ? kpi.label : kpi.labelZh}</p>
                    {hasTrend && (
                      <span className="text-xs font-mono" style={{ color: trendColor }}>
                        {isUp ? "↑" : "↓"} {Math.abs(parseFloat(pct!))}%
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-mono mb-3" style={{ color: "#C9A84C" }}>
                    {kpi.value || "–"}{kpi.unit && kpi.value ? <span className="text-xs font-normal ml-1" style={{ color: "#555550" }}>{kpi.unit}</span> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#444440" }}>{isEn ? "Current" : "当前"}</label>
                      <input
                        type="number"
                        value={kpi.value}
                        onChange={setKpi(i, "value")}
                        className="w-full px-2 py-1.5 text-xs rounded-lg"
                        style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0", outline: "none" }}
                        onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                        onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "#444440" }}>{isEn ? "Previous" : "上期"}</label>
                      <input
                        type="number"
                        value={kpi.prev}
                        onChange={setKpi(i, "prev")}
                        className="w-full px-2 py-1.5 text-xs rounded-lg"
                        style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0", outline: "none" }}
                        onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                        onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center" style={{ color: "#444440" }}>
            {isEn ? "Enter current and previous values to see trend arrows." : "输入当前和上期数值以显示趋势箭头。"}
          </p>
        </div>
      )}

      {/*  Tab 3: Investor Registry  */}
      {activeTab === "registry" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowInvForm(!showInvForm)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              + {isEn ? "Add Investor" : "添加投资人"}
            </button>
          </div>

          {showInvForm && (
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#141414", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: "name", label: isEn ? "Name" : "名称", placeholder: isEn ? "Investor name" : "投资人名称", type: "text" },
                  { key: "pct", label: isEn ? "% Held" : "持股比例", placeholder: "10", type: "number" },
                  { key: "contact", label: isEn ? "Contact" : "联系方式", placeholder: "email@example.com", type: "text" },
                  { key: "lastUpdate", label: isEn ? "Last Update" : "最后更新", placeholder: "2025-05-01", type: "date" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{label}</label>
                    <input
                      type={type}
                      value={(invForm as Record<string, string>)[key]}
                      onChange={(e) => setInvForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg"
                      style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0", outline: "none", borderRadius: "10px" }}
                      placeholder={placeholder}
                      onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A0A09A" }}>{isEn ? "Type" : "类型"}</label>
                <select
                  value={invForm.type}
                  onChange={(e) => setInvForm((p) => ({ ...p, type: e.target.value as InvestorType }))}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0", outline: "none", borderRadius: "10px" }}
                >
                  {(["Angel", "VC", "Family Office", "Strategic"] as InvestorType[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addInvestor} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#3B82F6", color: "#fff" }}>
                  {isEn ? "Add" : "添加"}
                </button>
                <button onClick={() => setShowInvForm(false)} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1A1A1A", color: "#666660", border: "1px solid #2A2A2A" }}>
                  {isEn ? "Cancel" : "取消"}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1E1E1E" }}>
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5" style={{ backgroundColor: "#1A1A1A" }}>
              {[isEn ? "Name" : "名称", isEn ? "Type" : "类型", isEn ? "% Held" : "持股", isEn ? "Contact" : "联系", isEn ? "Last Update" : "最后更新", ""].map((h, i) => (
                <span key={i} className={`text-xs font-mono col-span-${[3, 2, 1, 3, 2, 1][i]}`} style={{ color: "#666660" }}>{h}</span>
              ))}
            </div>
            {investors.map((inv) => (
              <div key={inv.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center" style={{ backgroundColor: "#141414", borderTop: "1px solid #1A1A1A" }}>
                <span className="text-sm col-span-3 truncate" style={{ color: "#F5F5F0" }}>{inv.name}</span>
                <span className="text-xs col-span-2" style={{ color: "#888880" }}>{inv.type}</span>
                <span className="text-xs font-mono col-span-1" style={{ color: "#C9A84C" }}>{inv.pct ? `${inv.pct}%` : "–"}</span>
                <span className="text-xs col-span-3 truncate" style={{ color: "#555550" }}>{inv.contact || "–"}</span>
                <span className="text-xs col-span-2" style={{ color: "#555550" }}>{inv.lastUpdate || "–"}</span>
                <button
                  onClick={() => setInvestors((p) => p.filter((i) => i.id !== inv.id))}
                  className="col-span-1 text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "rgba(224,90,90,0.1)", color: "#E05A5A" }}
                >
                  ×
                </button>
              </div>
            ))}
            {investors.length === 0 && (
              <div className="py-8 text-center" style={{ backgroundColor: "#111111" }}>
                <p className="text-sm" style={{ color: "#444440" }}>{isEn ? "No investors yet" : "尚无投资人"}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
