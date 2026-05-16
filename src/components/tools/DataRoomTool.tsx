"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface DocItem {
  id: string;
  zh: string;
  en: string;
}

interface Folder {
  id: string;
  icon: string;
  zh: string;
  en: string;
  docs: DocItem[];
}

const FOLDERS: Folder[] = [
  {
    id: "corporate",
    icon: "",
    zh: "企业文件",
    en: "Corporate Documents",
    docs: [
      { id: "corp-moa", zh: "公司章程（MOA/AOA）", en: "Memorandum & Articles of Association" },
      { id: "corp-biz", zh: "营业注册证", en: "Business Registration Certificate" },
      { id: "corp-board", zh: "董事会决议", en: "Board Resolutions" },
      { id: "corp-ssm", zh: "SSM 最新注册信息", en: "Latest SSM Filings" },
    ],
  },
  {
    id: "financial",
    icon: "",
    zh: "财务报表",
    en: "Financial Statements",
    docs: [
      { id: "fin-pl", zh: "损益表（近 3 年）", en: "Profit & Loss Statement (Last 3 Years)" },
      { id: "fin-bs", zh: "资产负债表（近 3 年）", en: "Balance Sheet (Last 3 Years)" },
      { id: "fin-cf", zh: "现金流量表（近 3 年）", en: "Cash Flow Statement (Last 3 Years)" },
      { id: "fin-proj", zh: "财务预测（3–5 年）", en: "Financial Projections (3–5 Years)" },
    ],
  },
  {
    id: "captable",
    icon: "",
    zh: "股权结构",
    en: "Cap Table",
    docs: [
      { id: "cap-reg", zh: "股东名册", en: "Shareholders Register" },
      { id: "cap-pool", zh: "期权池文件", en: "Option Pool Documentation" },
      { id: "cap-conv", zh: "可转换票据 / SAFE 协议", en: "Convertible Notes / SAFE Agreements" },
    ],
  },
  {
    id: "legal",
    icon: "",
    zh: "法律文件",
    en: "Legal",
    docs: [
      { id: "leg-patent", zh: "专利证书", en: "Patent Certificates" },
      { id: "leg-tm", zh: "商标注册", en: "Trademark Registrations" },
      { id: "leg-contracts", zh: "重大商业合同", en: "Material Commercial Contracts" },
      { id: "leg-ip", zh: "IP 转让协议", en: "IP Assignment Agreements" },
    ],
  },
  {
    id: "team",
    icon: "",
    zh: "团队",
    en: "Team",
    docs: [
      { id: "team-org", zh: "组织架构图", en: "Organisation Chart" },
      { id: "team-cvs", zh: "核心团队简历", en: "Key Team Member CVs" },
      { id: "team-emp", zh: "关键员工劳动合同", en: "Key Employment Agreements" },
      { id: "team-vest", zh: "创始人股权归属协议", en: "Founder Vesting Schedules" },
    ],
  },
  {
    id: "product",
    icon: "",
    zh: "产品",
    en: "Product",
    docs: [
      { id: "prod-deck", zh: "融资路演材料（Pitch Deck）", en: "Pitch Deck" },
      { id: "prod-demo", zh: "产品演示视频 / 链接", en: "Product Demo Video / Link" },
      { id: "prod-docs", zh: "技术架构文档", en: "Technical Architecture Docs" },
      { id: "prod-road", zh: "产品路线图", en: "Product Roadmap" },
    ],
  },
  {
    id: "market",
    icon: "",
    zh: "市场",
    en: "Market",
    docs: [
      { id: "mkt-research", zh: "市场研究报告", en: "Market Research Report" },
      { id: "mkt-comp", zh: "竞争分析报告", en: "Competitive Analysis" },
      { id: "mkt-cust", zh: "客户案例 / 推荐信", en: "Customer Case Studies / Testimonials" },
    ],
  },
];

function CircleProgress({ pct, size = 130 }: { pct: number; size?: number }) {
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

export default function DataRoomTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(FOLDERS.map((f) => [f.id, false]))
  );
  const [toast, setToast] = useState(false);

  const toggleDoc = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const toggleFolder = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const totalDocs = FOLDERS.reduce((s, f) => s + f.docs.length, 0);
  const checkedDocs = Object.values(checked).filter(Boolean).length;
  const overallPct = Math.round((checkedDocs / totalDocs) * 100);
  const scoreColor = overallPct >= 70 ? "#5EAB6A" : overallPct >= 40 ? "#C9A84C" : "#E05A5A";

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <ToolShell
      icon=""
      title={isEn ? "Data Room" : "数据室"}
      desc={isEn ? "Organise and track your investor-ready document repository." : "整理并追踪投资人就绪的数据室文件。"}
      levelRequired={2}
      backHref="/student/dashboard"
    >
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: "#1A1A1A", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          {isEn ? "Share link coming soon / 即将推出" : "分享链接功能即将推出"}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl p-6 text-center sticky top-24" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-5" style={{ color: "#666660" }}>
              {isEn ? "DATA ROOM READINESS" : "数据室准备度"}
            </p>
            <div className="flex justify-center mb-4">
              <CircleProgress pct={overallPct} size={130} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: scoreColor }}>
              {overallPct >= 70
                ? (isEn ? "Investor Ready" : "已具备投资条件")
                : overallPct >= 40
                ? (isEn ? "In Progress" : "准备中")
                : (isEn ? "Needs Work" : "需要完善")}
            </p>
            <p className="text-xs mb-5" style={{ color: "#555550" }}>
              {checkedDocs} / {totalDocs} {isEn ? "documents uploaded" : "份文件已上传"}
            </p>

            {/* Folder mini progress */}
            <div className="space-y-2 text-left">
              {FOLDERS.map((folder) => {
                const folderChecked = folder.docs.filter((d) => checked[d.id]).length;
                const folderPct = Math.round((folderChecked / folder.docs.length) * 100);
                const barColor = folderPct >= 75 ? "#5EAB6A" : folderPct >= 40 ? "#C9A84C" : "#E05A5A";
                return (
                  <div key={folder.id}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs truncate pr-1" style={{ color: "#666660" }}>
                        {isEn ? folder.en : folder.zh}
                      </span>
                      <span className="text-xs font-mono flex-shrink-0" style={{ color: barColor }}>{folderPct}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${folderPct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={showToast}
              className="w-full mt-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
            >
               {isEn ? "Share Data Room" : "分享数据室"}
            </button>
          </div>
        </div>

        {/* Folder Explorer */}
        <div className="lg:col-span-2 space-y-2">
          {FOLDERS.map((folder) => {
            const folderChecked = folder.docs.filter((d) => checked[d.id]).length;
            const folderPct = Math.round((folderChecked / folder.docs.length) * 100);
            const isOpen = expanded[folder.id];
            const completeBadgeColor = folderChecked === folder.docs.length ? "#5EAB6A" : "#3B82F6";
            const completeBadgeBg = folderChecked === folder.docs.length ? "rgba(94,171,106,0.1)" : "rgba(59,130,246,0.1)";
            const completeBadgeBorder = folderChecked === folder.docs.length ? "rgba(94,171,106,0.25)" : "rgba(59,130,246,0.2)";

            return (
              <div key={folder.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #1E1E1E" }}>
                {/* Folder Header */}
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                  style={{ backgroundColor: isOpen ? "#181818" : "#141414" }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "16px" }}>
                      {isOpen ? "" : ""}
                    </span>
                    <div>
                      <span className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>
                        {isEn ? folder.en : folder.zh}
                      </span>
                      <span className="text-xs ml-2" style={{ color: "#555550" }}>
                        {folder.docs.length} {isEn ? "files" : "个文件"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{ backgroundColor: completeBadgeBg, color: completeBadgeColor, border: `1px solid ${completeBadgeBorder}` }}
                    >
                      {folderPct}%
                    </span>
                    <span style={{ color: "#444440", fontSize: "11px" }}>{isOpen ? "" : ""}</span>
                  </div>
                </button>

                {/* Docs */}
                {isOpen && (
                  <div className="px-4 pb-3 space-y-2" style={{ backgroundColor: "#0F0F0F", borderTop: "1px solid #1A1A1A" }}>
                    <div className="pt-2" />
                    {folder.docs.map((doc) => {
                      const done = !!checked[doc.id];
                      return (
                        <button
                          key={doc.id}
                          onClick={() => toggleDoc(doc.id)}
                          className="w-full flex items-center gap-3 text-left py-1"
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
                          <span className="text-xs" style={{ color: "#888888" }}></span>
                          <span
                            className="text-sm flex-1 transition-all"
                            style={{
                              color: done ? "#444440" : "#A0A09A",
                              textDecoration: done ? "line-through" : "none",
                            }}
                          >
                            {isEn ? doc.en : doc.zh}
                          </span>
                          <span
                            className="text-xs flex-shrink-0"
                            style={{ color: done ? "#5EAB6A" : "#333330" }}
                          >
                            {done ? (isEn ? "Uploaded" : "已上传") : (isEn ? "Missing" : "未上传")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Tip */}
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <span className="text-lg flex-shrink-0"></span>
            <p className="text-xs leading-relaxed" style={{ color: "#666660" }}>
              {isEn
                ? "Check documents as you upload them to your secure storage. Aim for 70%+ readiness before sharing with investors."
                : "上传文件后勾选对应项目。建议在分享给投资人前达到 70% 以上准备度。"}
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
