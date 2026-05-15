"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface DDItem {
  id: string;
  zh: string;
  en: string;
}

interface DDCategory {
  id: string;
  icon: string;
  zh: string;
  en: string;
  items: DDItem[];
}

const DD_CATEGORIES: DDCategory[] = [
  {
    id: "legal",
    icon: "",
    zh: "法律文件",
    en: "Legal Documents",
    items: [
      { id: "aoa", zh: "公司章程（MOA/AOA）", en: "Memorandum & Articles of Association" },
      { id: "sha", zh: "股东协议（SHA）", en: "Shareholders Agreement (SHA)" },
      { id: "ip", zh: "知识产权归属证明", en: "IP Ownership Documentation" },
      { id: "licenses", zh: "营业执照及行业许可证", en: "Business Licenses & Industry Permits" },
      { id: "ssm", zh: "公司注册文件（SSM）", en: "Company Registration (SSM/ACRA)" },
    ],
  },
  {
    id: "financial",
    icon: "",
    zh: "财务记录",
    en: "Financial Records",
    items: [
      { id: "audited", zh: "已审计财务报表（3 年）", en: "Audited Financial Statements (3 Years)" },
      { id: "mgmt", zh: "管理账目（最近 12 个月）", en: "Management Accounts (Last 12 Months)" },
      { id: "tax", zh: "税务申报记录", en: "Tax Returns" },
      { id: "bank", zh: "银行对账单（6 个月）", en: "Bank Statements (6 Months)" },
      { id: "cashflow", zh: "现金流预测", en: "Cash Flow Projections" },
    ],
  },
  {
    id: "hr",
    icon: "",
    zh: "人力资源",
    en: "HR",
    items: [
      { id: "contracts", zh: "员工劳动合同", en: "Employment Contracts" },
      { id: "orgchart", zh: "组织架构图", en: "Organisation Chart" },
      { id: "keyperson", zh: "关键人员依赖分析", en: "Key Person Dependencies" },
      { id: "payroll", zh: "薪资记录", en: "Payroll Records" },
    ],
  },
  {
    id: "business",
    icon: "",
    zh: "商业模式",
    en: "Business Model",
    items: [
      { id: "revmodel", zh: "收入模式文件", en: "Revenue Model Documentation" },
      { id: "contracts_cust", zh: "客户合同（前 5 名）", en: "Key Customer Contracts (Top 5)" },
      { id: "churn", zh: "客户流失率数据", en: "Customer Churn Data" },
      { id: "uniteco", zh: "单位经济数据（CAC、LTV）", en: "Unit Economics (CAC, LTV)" },
      { id: "pipeline", zh: "销售管道报告", en: "Sales Pipeline Report" },
    ],
  },
  {
    id: "tech",
    icon: "",
    zh: "技术",
    en: "Technology",
    items: [
      { id: "codeown", zh: "代码库所有权证明", en: "Codebase Ownership Documentation" },
      { id: "techstack", zh: "技术架构文档", en: "Tech Stack Documentation" },
      { id: "security", zh: "安全审计报告", en: "Security Audit Report" },
      { id: "privacy", zh: "数据隐私政策（PDPA 合规）", en: "Data Privacy Policy (PDPA Compliance)" },
    ],
  },
  {
    id: "market",
    icon: "",
    zh: "市场",
    en: "Market",
    items: [
      { id: "research", zh: "市场研究报告", en: "Market Research Report" },
      { id: "competitive", zh: "竞争分析", en: "Competitive Analysis" },
      { id: "regulatory", zh: "监管合规评估", en: "Regulatory Compliance Assessment" },
      { id: "growth", zh: "增长策略文件", en: "Growth Strategy Document" },
    ],
  },
  {
    id: "ops",
    icon: "",
    zh: "运营",
    en: "Operations",
    items: [
      { id: "sops", zh: "标准操作程序（SOP）", en: "Standard Operating Procedures (SOPs)" },
      { id: "supplier", zh: "关键供应商合同", en: "Key Supplier Contracts" },
      { id: "inventory", zh: "库存管理记录", en: "Inventory Management Records" },
      { id: "insurance", zh: "保险单据", en: "Insurance Policies" },
    ],
  },
  {
    id: "management",
    icon: "",
    zh: "管理层",
    en: "Management",
    items: [
      { id: "founder_cvs", zh: "创始人简历", en: "Founder CVs / Bios" },
      { id: "board", zh: "董事会结构文件", en: "Board Structure Documentation" },
      { id: "advisory", zh: "顾问委员会名单", en: "Advisory Board List" },
      { id: "team_bios", zh: "核心管理层简历", en: "Core Management Team Bios" },
    ],
  },
];

function CircleProgress({ pct, size = 120 }: { pct: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#5EAB6A" : pct >= 40 ? "#C9A84C" : "#E05A5A";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E1E1E" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
      <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill={color} fontSize={size * 0.18} fontWeight="bold" fontFamily="var(--font-mono)">
        {pct}%
      </text>
    </svg>
  );
}

export default function DueDiligenceTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(DD_CATEGORIES.map((c) => [c.id, true]))
  );
  const [toast, setToast] = useState(false);

  const toggleItem = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const toggleCategory = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const totalItems = DD_CATEGORIES.reduce((s, c) => s + c.items.length, 0);
  const checkedItems = Object.values(checked).filter(Boolean).length;
  const overallPct = Math.round((checkedItems / totalItems) * 100);
  const scoreColor = overallPct >= 70 ? "#5EAB6A" : overallPct >= 40 ? "#C9A84C" : "#E05A5A";

  const showExportToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <ToolShell
      icon=""
      title={isEn ? "Due Diligence" : "尽职调查"}
      desc={isEn ? "Track your DD readiness across 8 key categories." : "追踪 8 大类尽职调查准备度，评估投资人就绪程度。"}
      levelRequired={2}
      backHref="/tools"
    >
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: "#1A1A1A", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          {isEn ? "Export feature coming soon / 即将推出" : "导出功能即将推出"}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl p-6 text-center sticky top-24" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-5" style={{ color: "#666660" }}>
              {isEn ? "DD READINESS SCORE" : "尽调准备度评分"}
            </p>
            <div className="flex justify-center mb-4">
              <CircleProgress pct={overallPct} size={130} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: scoreColor }}>
              {overallPct >= 70
                ? (isEn ? "Investment Ready" : "具备投资条件")
                : overallPct >= 40
                ? (isEn ? "In Progress" : "准备中")
                : (isEn ? "Early Stage" : "初期阶段")}
            </p>
            <p className="text-xs mb-5" style={{ color: "#555550" }}>
              {checkedItems} / {totalItems} {isEn ? "items complete" : "项已完成"}
            </p>

            {/* Per-category mini scores */}
            <div className="space-y-2 text-left">
              {DD_CATEGORIES.map((cat) => {
                const catChecked = cat.items.filter((item) => checked[item.id]).length;
                const catPct = Math.round((catChecked / cat.items.length) * 100);
                const barColor = catPct >= 70 ? "#5EAB6A" : catPct >= 40 ? "#C9A84C" : "#E05A5A";
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs" style={{ color: "#666660" }}>
                        {cat.icon} {isEn ? cat.en : cat.zh}
                      </span>
                      <span className="text-xs font-mono" style={{ color: barColor }}>{catPct}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${catPct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={showExportToast}
              className="w-full mt-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#1A1A1A", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              {isEn ? "Export Checklist" : "导出清单"}
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2 space-y-3">
          {DD_CATEGORIES.map((cat) => {
            const catChecked = cat.items.filter((item) => checked[item.id]).length;
            const isOpen = expanded[cat.id];
            return (
              <div key={cat.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #1E1E1E" }}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  style={{ backgroundColor: "#141414" }}
                >
                  <div className="flex items-center gap-3">
                    <span>{cat.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>
                      {isEn ? cat.en : cat.zh}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{
                        backgroundColor: catChecked === cat.items.length ? "rgba(94,171,106,0.12)" : "rgba(59,130,246,0.1)",
                        color: catChecked === cat.items.length ? "#5EAB6A" : "#3B82F6",
                        border: `1px solid ${catChecked === cat.items.length ? "rgba(94,171,106,0.25)" : "rgba(59,130,246,0.2)"}`,
                      }}
                    >
                      {catChecked} / {cat.items.length}
                    </span>
                    <span style={{ color: "#555550", fontSize: "12px" }}>{isOpen ? "" : ""}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3 space-y-2.5" style={{ backgroundColor: "#111111" }}>
                    <div className="pt-2" />
                    {cat.items.map((item) => {
                      const done = !!checked[item.id];
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className="w-full flex items-center gap-3 text-left"
                        >
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
                            {isEn ? item.en : item.zh}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ToolShell>
  );
}
