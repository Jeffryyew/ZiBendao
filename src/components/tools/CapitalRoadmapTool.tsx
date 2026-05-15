"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface StageData {
  id: string;
  zh: { name: string; label: string };
  en: { name: string; label: string };
  funding: { zh: string; en: string };
  investors: { zh: string; en: string };
  documents: { zh: string[]; en: string[] };
  timeline: { zh: string; en: string };
  milestones: { zh: string[]; en: string[] };
}

const STAGES: StageData[] = [
  {
    id: "pre-seed",
    zh: { name: "Pre-Seed", label: "天使前" },
    en: { name: "Pre-Seed", label: "Pre-Seed" },
    funding: { zh: "RM 50K – 500K", en: "RM 50K – 500K" },
    investors: { zh: "创始人自筹、家人朋友、孵化器", en: "Founders, Friends & Family, Accelerators" },
    documents: {
      zh: ["商业计划书", "MVP 展示", "团队简介", "执行路线图"],
      en: ["Business Plan", "MVP Demo", "Team Profile", "Execution Roadmap"],
    },
    timeline: { zh: "3–6 个月", en: "3–6 months" },
    milestones: {
      zh: ["验证市场需求", "组建核心团队", "建立 MVP 原型", "获取首批种子用户", "完成企业注册"],
      en: ["Validate market demand", "Build core team", "Build MVP prototype", "Acquire first seed users", "Complete company registration"],
    },
  },
  {
    id: "seed",
    zh: { name: "Seed", label: "种子轮" },
    en: { name: "Seed", label: "Seed" },
    funding: { zh: "RM 500K – 2M", en: "RM 500K – 2M" },
    investors: { zh: "天使投资人、早期 VC、政府基金", en: "Angel Investors, Early-stage VC, Government Grants" },
    documents: {
      zh: ["融资路演材料", "财务模型", "股权结构表", "市场分析报告"],
      en: ["Pitch Deck", "Financial Model", "Cap Table", "Market Analysis"],
    },
    timeline: { zh: "6–12 个月", en: "6–12 months" },
    milestones: {
      zh: ["实现产品市场契合", "月收入达 RM 50K+", "用户留存率 >40%", "建立核心运营团队", "完成种子轮融资"],
      en: ["Achieve product-market fit", "MRR exceeds RM 50K", "User retention >40%", "Build core ops team", "Close seed round"],
    },
  },
  {
    id: "series-a",
    zh: { name: "Series A", label: "A 轮" },
    en: { name: "Series A", label: "Series A" },
    funding: { zh: "RM 5M – 20M", en: "RM 5M – 20M" },
    investors: { zh: "机构 VC、战略投资人", en: "Institutional VC, Strategic Investors" },
    documents: {
      zh: ["更新路演材料", "审计财务报表", "单位经济模型", "增长战略报告"],
      en: ["Updated Pitch Deck", "Audited Financials", "Unit Economics", "Growth Strategy"],
    },
    timeline: { zh: "12–18 个月", en: "12–18 months" },
    milestones: {
      zh: ["年收入达 RM 2M+", "清晰可扩展的业务模式", "客户获取成本可控", "建立销售与市场团队", "准备尽职调查材料"],
      en: ["ARR exceeds RM 2M", "Scalable business model", "Controlled CAC", "Build sales & marketing team", "Prepare DD materials"],
    },
  },
  {
    id: "series-b",
    zh: { name: "Series B", label: "B 轮" },
    en: { name: "Series B", label: "Series B" },
    funding: { zh: "RM 20M – 80M", en: "RM 20M – 80M" },
    investors: { zh: "大型 VC、PE 基金、战略合作方", en: "Large VC, PE Funds, Strategic Partners" },
    documents: {
      zh: ["详细尽职调查包", "5 年财务预测", "行业分析报告", "管理层介绍材料"],
      en: ["Full DD Package", "5-Year Forecast", "Industry Analysis", "Management Deck"],
    },
    timeline: { zh: "18–24 个月", en: "18–24 months" },
    milestones: {
      zh: ["年收入达 RM 15M+", "进入新市场或地区", "建立强大的管理团队", "正毛利率", "制定清晰退出策略"],
      en: ["ARR exceeds RM 15M", "Enter new markets", "Strong management team", "Positive gross margin", "Clear exit strategy"],
    },
  },
  {
    id: "growth",
    zh: { name: "Growth", label: "成长期" },
    en: { name: "Growth", label: "Growth" },
    funding: { zh: "RM 80M – 300M", en: "RM 80M – 300M" },
    investors: { zh: "PE、主权财富基金、战略并购方", en: "PE, Sovereign Wealth Funds, Strategic M&A" },
    documents: {
      zh: ["投资者关系材料", "企业治理文件", "ESG 报告", "审计报告（3 年）"],
      en: ["IR Materials", "Corporate Governance Docs", "ESG Report", "3-Year Audits"],
    },
    timeline: { zh: "2–4 年", en: "2–4 years" },
    milestones: {
      zh: ["年收入达 RM 100M+", "稳定正现金流", "多元化收入来源", "完善公司治理结构", "推进国际化战略"],
      en: ["ARR exceeds RM 100M", "Stable positive cash flow", "Diversified revenue", "Solid corporate governance", "International expansion"],
    },
  },
  {
    id: "ipo-ready",
    zh: { name: "IPO-Ready", label: "上市准备" },
    en: { name: "IPO-Ready", label: "IPO-Ready" },
    funding: { zh: "RM 300M+", en: "RM 300M+" },
    investors: { zh: "投资银行、机构投资者、公众市场", en: "Investment Banks, Institutions, Public Markets" },
    documents: {
      zh: ["招股书（Prospectus）", "合规与法律审查", "投资者路演材料", "内控与审计报告"],
      en: ["Prospectus", "Legal & Compliance Review", "Investor Roadshow Deck", "Internal Controls Report"],
    },
    timeline: { zh: "12–24 个月准备期", en: "12–24 months prep" },
    milestones: {
      zh: ["完成独立审计（3 年）", "建立合规 ESG 框架", "任命独立董事会", "完成证券监管申报", "完成路演并定价"],
      en: ["3-year independent audit", "ESG compliance framework", "Appoint independent board", "Complete SC/SEC filing", "Complete roadshow & pricing"],
    },
  },
];

export default function CapitalRoadmapTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const [activeStage, setActiveStage] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const stage = STAGES[activeStage];
  const milestones = isEn ? stage.milestones.en : stage.milestones.zh;
  const checkedCount = milestones.filter((_, i) => checked[`${activeStage}-${i}`]).length;

  const toggleCheck = (key: string) => setChecked((p) => ({ ...p, [key]: !p[key] }));

  return (
    <ToolShell
      icon=""
      title={isEn ? "Capital Roadmap" : "资本路线图"}
      desc={isEn ? "Navigate your company's capital journey from Pre-Seed to IPO-Ready." : "规划企业从天使前到上市准备的完整资本旅程。"}
      levelRequired={2}
      backHref="/dashboard/capital"
    >
      {/* Horizontal Stepper */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex items-center min-w-max">
          {STAGES.map((s, i) => {
            const isActive = i === activeStage;
            const isCompleted = i < activeStage;
            const label = isEn ? s.en.label : s.zh.label;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => setActiveStage(i)}
                  className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                    border: isActive ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                    style={{
                      backgroundColor: isCompleted ? "rgba(94,171,106,0.15)" : isActive ? "rgba(59,130,246,0.15)" : "#1A1A1A",
                      color: isCompleted ? "#5EAB6A" : isActive ? "#3B82F6" : "#555550",
                      border: `1px solid ${isCompleted ? "rgba(94,171,106,0.35)" : isActive ? "rgba(59,130,246,0.35)" : "#2A2A2A"}`,
                    }}
                  >
                    {isCompleted ? "" : i + 1}
                  </div>
                  <span
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: isActive ? "#3B82F6" : isCompleted ? "#5EAB6A" : "#555550" }}
                  >
                    {label}
                  </span>
                </button>
                {i < STAGES.length - 1 && (
                  <div
                    className="w-8 h-px flex-shrink-0"
                    style={{ backgroundColor: i < activeStage ? "rgba(94,171,106,0.35)" : "#222222" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary Banner */}
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-4"
        style={{ backgroundColor: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
      >
        <span className="text-2xl flex-shrink-0"></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "#3B82F6" }}>
            {isEn
              ? `Stage ${activeStage + 1} of 6 — ${STAGES[activeStage].en.name}`
              : `第 ${activeStage + 1} / 6 阶段 — ${STAGES[activeStage].zh.name}`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#A0A09A" }}>
            {checkedCount === milestones.length
              ? (isEn ? "All milestones complete — ready to advance! " : "所有里程碑已完成，准备晋级！")
              : isEn
              ? `${checkedCount} / ${milestones.length} milestones completed. Complete ${milestones.length - checkedCount} more to advance.`
              : `已完成 ${checkedCount} / ${milestones.length} 个里程碑。还需完成 ${milestones.length - checkedCount} 个方可晋级。`}
          </p>
        </div>
        <div className="text-xl font-bold font-mono flex-shrink-0" style={{ color: "#C9A84C" }}>
          {Math.round((checkedCount / milestones.length) * 100)}%
        </div>
      </div>

      {/* Stage Detail */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: Milestones + Funding */}
        <div className="space-y-4">
          <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
              {isEn ? "MILESTONES CHECKLIST" : "里程碑清单"}
            </p>
            <div className="space-y-3">
              {milestones.map((m, i) => {
                const key = `${activeStage}-${i}`;
                const done = !!checked[key];
                return (
                  <button key={i} onClick={() => toggleCheck(key)} className="w-full flex items-center gap-3 text-left group">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs transition-all"
                      style={{
                        backgroundColor: done ? "rgba(59,130,246,0.2)" : "#1A1A1A",
                        border: `1px solid ${done ? "rgba(59,130,246,0.4)" : "#2A2A2A"}`,
                        color: done ? "#3B82F6" : "transparent",
                      }}
                    >
                      {done ? "" : ""}
                    </div>
                    <span
                      className="text-sm transition-all"
                      style={{
                        color: done ? "#444440" : "#A0A09A",
                        textDecoration: done ? "line-through" : "none",
                      }}
                    >
                      {m}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Funding Range */}
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <span className="text-xs" style={{ color: "#666660" }}>{isEn ? "Typical Funding Range" : "典型融资规模"}</span>
            <span className="text-base font-bold font-mono" style={{ color: "#C9A84C" }}>
              {isEn ? stage.funding.en : stage.funding.zh}
            </span>
          </div>

          {/* Timeline */}
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <span className="text-xs" style={{ color: "#666660" }}>{isEn ? "Estimated Timeline" : "预计时间"}</span>
            <span className="text-sm font-medium" style={{ color: "#3B82F6" }}>
               {isEn ? stage.timeline.en : stage.timeline.zh}
            </span>
          </div>
        </div>

        {/* Right: Investors + Documents + Nav */}
        <div className="space-y-4">
          {/* Investors */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs mb-2" style={{ color: "#666660" }}>{isEn ? "Typical Investors" : "典型投资方"}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>
              {isEn ? stage.investors.en : stage.investors.zh}
            </p>
          </div>

          {/* Key Documents */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs mb-3" style={{ color: "#666660" }}>{isEn ? "Key Documents Needed" : "关键文件"}</p>
            <div className="space-y-2">
              {(isEn ? stage.documents.en : stage.documents.zh).map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "#A0A09A" }}>
                  <span style={{ color: "#3B82F6" }}></span>
                  {doc}
                </div>
              ))}
            </div>
          </div>

          {/* Stage Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveStage((p) => Math.max(0, p - 1))}
              disabled={activeStage === 0}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-30"
              style={{ backgroundColor: "#1A1A1A", color: "#A0A09A", border: "1px solid #2A2A2A" }}
            >
              ← {isEn ? "Previous" : "上一阶段"}
            </button>
            <button
              onClick={() => setActiveStage((p) => Math.min(5, p + 1))}
              disabled={activeStage === 5}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-30"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              {isEn ? "Next" : "下一阶段"} →
            </button>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
