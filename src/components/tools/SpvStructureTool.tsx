"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import type { Locale } from "@/lib/i18n";

const PURPLE = "#8B5CF6";
const GOLD = "#C9A84C";

const inputSt: React.CSSProperties = {
  backgroundColor: "#0D0D0D",
  border: "1px solid #2A2A2A",
  color: "#F5F5F0",
  borderRadius: "10px",
  fontSize: "13px",
  fontFamily: "var(--font-mono)",
  outline: "none",
  width: "100%",
  padding: "10px 12px",
};

const SPV_TYPES = ["Property", "Technology", "General Investment", "Joint Venture"] as const;
type SpvType = (typeof SPV_TYPES)[number];

interface SpvForm {
  spvName: string;
  spvType: SpvType;
  purpose: string;
  targetRaise: string;
  minInvestment: string;
  mgmtFee: string;
  carryPct: string;
  projectedReturn: string;
  timeline: string;
}

interface SpvResults {
  maxInvestors: number;
  exitValue: number;
  totalGain: number;
  carryAmount: number;
  mgmtFeeTotal: number;
  netReturnToInvestors: number;
  netRoi: number;
}

function fmtRM(n: number) {
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`;
  return `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}

const DOC_CHECKLIST = [
  { zh: "信托契约", en: "Trust Deed" },
  { zh: "投资协议", en: "Investment Agreement" },
  { zh: "私募备忘录 (PPM)", en: "Private Placement Memorandum (PPM)" },
  { zh: "监管申报文件", en: "Regulatory Filing (SC/SSM)" },
  { zh: "股东名册", en: "Shareholder Register" },
];

const NEXT_STEPS = [
  { zh: "委托律师起草SPV架构与相关法律文件", en: "Engage a lawyer to draft SPV structure and legal documents" },
  { zh: "向SSM注册特殊目的公司", en: "Register the SPV entity with SSM (Companies Commission)" },
  { zh: "准备Private Placement Memorandum（PPM）", en: "Prepare the Private Placement Memorandum (PPM)" },
  { zh: "向证券委员会（SC）申请豁免或批准", en: "Apply to the Securities Commission (SC) for exemption or approval" },
  { zh: "开设SPV专属银行账户并启动认购流程", en: "Open dedicated bank account and launch investor subscription process" },
];

export default function SpvStructureTool({ locale }: { locale: Locale }) {
  const isEn = locale === "en";
  const [form, setForm] = useState<SpvForm>({
    spvName: "",
    spvType: "General Investment",
    purpose: "",
    targetRaise: "5000000",
    minInvestment: "100000",
    mgmtFee: "2",
    carryPct: "20",
    projectedReturn: "25",
    timeline: "3",
  });
  const [results, setResults] = useState<SpvResults | null>(null);

  const set = (f: keyof SpvForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const calculate = () => {
    const target = parseFloat(form.targetRaise) || 0;
    const minInv = parseFloat(form.minInvestment) || 1;
    const mgmt = parseFloat(form.mgmtFee) || 0;
    const carry = parseFloat(form.carryPct) || 0;
    const ret = parseFloat(form.projectedReturn) || 0;
    const yrs = parseFloat(form.timeline) || 1;

    const maxInvestors = Math.floor(target / minInv);
    const exitValue = target * Math.pow(1 + ret / 100, yrs);
    const totalGain = exitValue - target;
    const carryAmount = totalGain * (carry / 100);
    const mgmtFeeTotal = target * (mgmt / 100) * yrs;
    const netReturnToInvestors = totalGain - carryAmount - mgmtFeeTotal;
    const netRoi = target > 0 ? (netReturnToInvestors / target) * 100 : 0;

    setResults({ maxInvestors, exitValue, totalGain, carryAmount, mgmtFeeTotal, netReturnToInvestors, netRoi });
    setTimeout(() => document.getElementById("spv-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const purpleBadge: React.CSSProperties = {
    backgroundColor: "rgba(139,92,246,0.15)",
    color: "#A78BFA",
    border: "1px solid rgba(139,92,246,0.25)",
  };

  return (
    <ToolShell
      icon=""
      title={isEn ? "SPV Structure Designer" : "SPV架构设计器"}
      desc={isEn ? "Design special purpose vehicle structures and calculate investor returns." : "设计特殊目的载体架构，计算投资人回报与所需文件。"}
      levelRequired={3}
      backHref="/dashboard/capital"
    >
      {/* SPV Overview card */}
      <div className="mb-6 rounded-2xl p-5" style={{ backgroundColor: "#141414", border: `1px solid rgba(139,92,246,0.2)` }}>
        <p className="text-xs font-mono mb-2" style={purpleBadge as React.CSSProperties}>
          <span className="px-2 py-0.5 rounded-full" style={purpleBadge}>
            {isEn ? "WHAT IS AN SPV?" : "什么是 SPV？"}
          </span>
        </p>
        <p className="text-sm leading-relaxed mt-3" style={{ color: "#A0A09A" }}>
          {isEn
            ? "A Special Purpose Vehicle (SPV) is a separate legal entity created for a specific investment or asset. It ring-fences risk, enables pooled investment from multiple investors, and provides a clear structure for returns distribution and governance."
            : "特殊目的载体（SPV）是为特定投资或资产创建的独立法律实体。它隔离风险，允许多名投资者共同出资，并为回报分配和治理提供清晰的结构框架。"}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-5" style={{ color: "#666660" }}>SPV BUILDER / 架构设计</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                  {isEn ? "SPV Name" : "SPV名称"}
                </label>
                <input
                  type="text"
                  value={form.spvName}
                  onChange={set("spvName")}
                  placeholder={isEn ? "e.g. Acme Capital SPV 1" : "例：Acme Capital SPV 1"}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                  {isEn ? "SPV Type" : "SPV类型"}
                </label>
                <select
                  value={form.spvType}
                  onChange={set("spvType")}
                  style={{ ...inputSt, cursor: "pointer" }}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                >
                  {SPV_TYPES.map((t) => (
                    <option key={t} value={t} style={{ backgroundColor: "#1A1A1A" }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                  {isEn ? "Purpose / Asset Description" : "目的/资产描述"}
                </label>
                <textarea
                  value={form.purpose}
                  onChange={set("purpose")}
                  rows={2}
                  placeholder={isEn ? "Describe the investment target or asset..." : "描述投资标的或资产..."}
                  style={{ ...inputSt, resize: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>

              {[
                { field: "targetRaise" as const, label: isEn ? "Target Raise (RM)" : "目标融资额 (RM)", prefix: "RM" },
                { field: "minInvestment" as const, label: isEn ? "Min Investment / Investor (RM)" : "每位投资人最低投资额 (RM)", prefix: "RM" },
              ].map(({ field, label, prefix }) => (
                <div key={field}>
                  <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#555550" }}>{prefix}</span>
                    <input
                      type="number"
                      value={form[field]}
                      onChange={set(field)}
                      style={{ ...inputSt, paddingLeft: "44px" }}
                      onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: "mgmtFee" as const, label: isEn ? "Mgmt Fee %" : "管理费 %", suffix: "%" },
                  { field: "carryPct" as const, label: isEn ? "Carried Interest %" : "附带权益 %", suffix: "%" },
                  { field: "projectedReturn" as const, label: isEn ? "Projected Annual Return %" : "预期年化收益 %", suffix: "%" },
                  { field: "timeline" as const, label: isEn ? "Timeline (years)" : "投资年限（年）", suffix: isEn ? "yr" : "年" },
                ].map(({ field, label, suffix }) => (
                  <div key={field}>
                    <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>{label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form[field]}
                        onChange={set(field)}
                        style={{ ...inputSt, paddingRight: "32px" }}
                        onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                        onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#555550" }}>{suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full mt-6 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: PURPLE, color: "#fff" }}
            >
              {isEn ? "Calculate SPV Returns →" : "计算 SPV 回报 →"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5" id="spv-results">
          {results ? (
            <>
              {/* Output summary */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
                <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>OUTPUT SUMMARY / 架构摘要</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: isEn ? "Max Investors" : "最大投资人数", value: results.maxInvestors.toLocaleString(), accent: false },
                    { label: isEn ? "Exit Value" : "退出价值", value: fmtRM(results.exitValue), accent: true },
                    { label: isEn ? "Carry (GP Share)" : "附带权益（GP份额）", value: fmtRM(results.carryAmount), accent: false },
                    { label: isEn ? "Mgmt Fees (total)" : "管理费（合计）", value: fmtRM(results.mgmtFeeTotal), accent: false },
                    { label: isEn ? "Net Return to Investors" : "投资人净回报", value: fmtRM(results.netReturnToInvestors), accent: true },
                    { label: isEn ? "Net ROI" : "净投资回报率", value: `${results.netRoi.toFixed(1)}%`, accent: false },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: m.accent ? "rgba(139,92,246,0.07)" : "#0D0D0D",
                        border: `1px solid ${m.accent ? "rgba(139,92,246,0.2)" : "#2A2A2A"}`,
                      }}
                    >
                      <div className="text-xs mb-1" style={{ color: "#666660" }}>{m.label}</div>
                      <div className="text-lg font-bold font-mono" style={{ color: m.accent ? PURPLE : GOLD }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structure Diagram */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
                <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>STRUCTURE DIAGRAM / 架构图</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {[
                    { label: isEn ? "Investors" : "投资人", sub: `≤ ${results.maxInvestors} ${isEn ? "parties" : "方"}`, color: "#3B82F6" },
                    { arrow: true },
                    { label: form.spvName || (isEn ? "SPV Entity" : "SPV实体"), sub: form.spvType, color: PURPLE },
                    { arrow: true },
                    { label: isEn ? "Asset / Target Co." : "资产/目标公司", sub: form.purpose || (isEn ? "Investment Target" : "投资标的"), color: GOLD },
                  ].map((item, i) =>
                    "arrow" in item ? (
                      <div key={i} className="text-xl font-bold" style={{ color: "#3A3A3A" }}>→</div>
                    ) : (
                      <div
                        key={i}
                        className="rounded-xl p-3 text-center min-w-[100px] flex-shrink-0"
                        style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}40` }}
                      >
                        <div className="text-xs font-semibold mb-0.5" style={{ color: item.color }}>{item.label}</div>
                        <div className="text-xs" style={{ color: "#555550" }}>{item.sub}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 rounded-2xl" style={{ backgroundColor: "#111111", border: "1px dashed #222222" }}>
              <span className="text-4xl mb-3 opacity-20"></span>
              <p className="text-sm" style={{ color: "#444440" }}>{isEn ? "Fill in the form and calculate SPV returns" : "填写表单后点击计算"}</p>
            </div>
          )}

          {/* Document Checklist */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>DOCUMENT CHECKLIST / 文件清单</p>
            <div className="space-y-2">
              {DOC_CHECKLIST.map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: "#1E1E1E" }}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                    <span className="text-xs" style={{ color: PURPLE }}></span>
                  </div>
                  <span className="text-sm" style={{ color: "#A0A09A" }}>{isEn ? d.en : d.zh}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>NEXT STEPS / 下一步行动</p>
            <div className="space-y-3">
              {NEXT_STEPS.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs font-mono font-bold w-5 flex-shrink-0 mt-0.5" style={{ color: PURPLE }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>{isEn ? s.en : s.zh}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
