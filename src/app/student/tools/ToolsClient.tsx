"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import type { LayerId } from "@/lib/capitalModules";
import type { CompanyMode, Company, GroupStructure } from "@/lib/enterprise";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

type ActiveCompany = { id: string; name: string } | null;

const LAYER_ZH: Record<LayerId, string> = {
  1: "资本基础",
  2: "资本智慧",
  3: "资本架构",
};

function getCompleteness(company: Company): number {
  let score = 2;
  if (company.industry) score++;
  if (company.notes) score++;
  return Math.round((score / 4) * 100);
}

function CompanyCard({
  company,
  isParent,
  onSelect,
}: {
  company: Company;
  isParent: boolean;
  onSelect: (c: Company) => void;
}) {
  const color = isParent ? "#6B9BD2" : "#C9A84C";
  const completeness = getCompleteness(company);

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
      <div className="mb-4">
        <div className="min-w-0">
          <div className="text-sm font-bold mb-1 truncate" style={{ color: "#1C1814" }}>
            {company.name}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: isParent ? "#EFF4FF" : "#FBF4E4", color }}
            >
              {isParent ? "母公司" : "子公司"}
            </span>
            {!isParent && company.shareholding !== undefined && (
              <span className="text-xs" style={{ color: "#9A9490" }}>
                {company.shareholding}% 持股
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#9A9490" }}>企业类型</span>
          <span style={{ color: "#5C5650" }}>{company.type}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#9A9490" }}>所属行业</span>
          <span style={{ color: company.industry ? "#5C5650" : "#C8C1B8" }}>
            {company.industry || "未填写"}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: "#9A9490" }}>资料完整度</span>
            <span className="font-mono" style={{ color }}>{completeness}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#E0D9CE" }}>
            <div className="h-full rounded-full" style={{ width: `${completeness}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>

      <button
        onClick={() => onSelect(company)}
        className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
        style={{
          background: isParent
            ? "linear-gradient(135deg, #5A8AC0, #6B9BD2)"
            : "linear-gradient(135deg, #B8943A, #C9A84C)",
          color: "#FFFFFF",
        }}
      >
        进入工具 →
      </button>
    </div>
  );
}

function CompanyBanner({
  companyName,
  isGroup,
  onChangeCompany,
}: {
  companyName: string;
  isGroup: boolean;
  onChangeCompany?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl"
      style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.25)" }}
    >
      <div>
        <div className="text-xs mb-0.5" style={{ color: "#9A7A32" }}>当前操作企业</div>
        <div className="text-sm font-semibold" style={{ color: "#1C1814" }}>{companyName}</div>
      </div>
      {isGroup && onChangeCompany && (
        <button
          onClick={onChangeCompany}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: "#FFFFFF", color: "#9A7A32", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          切换企业
        </button>
      )}
    </div>
  );
}

function ToolGrid({ companyName, isGroup, onChangeCompany }: {
  companyName: string;
  isGroup: boolean;
  onChangeCompany?: () => void;
}) {
  const layers = [1, 2, 3] as const;
  return (
    <div>
      <CompanyBanner companyName={companyName} isGroup={isGroup} onChangeCompany={onChangeCompany} />
      <div className="space-y-8">
        {layers.map((layer) => {
          const meta = LAYER_META[layer];
          const modules = getModulesByLayer(layer);
          return (
            <div key={layer}>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                >
                  {LAYER_ZH[layer]}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
                <span className="text-xs" style={{ color: "#9A9490" }}>{modules.length} 个工具</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {modules.map((mod) => (
                  <Link
                    key={mod.id}
                    href={mod.href}
                    className="block rounded-xl p-4 relative overflow-hidden transition-all duration-200 hover:shadow-sm"
                    style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: meta.color, opacity: 0.45 }} />
                    <div className="text-sm font-semibold mb-1 mt-0.5" style={{ color: "#1C1814" }}>
                      {mod.zh.name}
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "#68625C" }}>
                      {mod.zh.desc}
                    </p>
                    <span className="text-xs font-medium" style={{ color: meta.color }}>
                      使用工具 →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-7 rounded-xl mb-2 animate-pulse" style={{ backgroundColor: "#E0D9CE", width: 160 }} />
      <div className="h-4 rounded-lg mb-8 animate-pulse" style={{ backgroundColor: "#E0D9CE", width: 260 }} />
      <div className="grid sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: "#E0D9CE" }} />
        ))}
      </div>
    </div>
  );
}

export default function ToolsClient() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<CompanyMode>(null);
  const [single, setSingle] = useState<Company | null>(null);
  const [group, setGroup] = useState<GroupStructure>({ parent: null, subsidiaries: [] });
  const [activeCompany, setActiveCompany] = useState<ActiveCompany>(null);

  useEffect(() => {
    try {
      const rawMode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      setMode(rawMode ? JSON.parse(rawMode) as CompanyMode : null);

      const rawSingle = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
      if (rawSingle) setSingle(JSON.parse(rawSingle));

      const rawGroup = localStorage.getItem(ENTERPRISE_KEYS.GROUP);
      if (rawGroup) setGroup(JSON.parse(rawGroup));

      const rawActive = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
      if (rawActive) setActiveCompany(JSON.parse(rawActive));
    } catch {}
    setReady(true);
  }, []);

  const handleSelectCompany = (company: Company) => {
    const ac = { id: company.id, name: company.name };
    setActiveCompany(ac);
    try { localStorage.setItem(ENTERPRISE_KEYS.ACTIVE_COMPANY, JSON.stringify(ac)); } catch {}
  };

  const handleChangeCompany = () => {
    setActiveCompany(null);
    try { localStorage.removeItem(ENTERPRISE_KEYS.ACTIVE_COMPANY); } catch {}
  };

  if (!ready) return <LoadingSkeleton />;

  const pageHeader = (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
        资本工具
      </h1>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {CAPITAL_MODULES.length} 个专业工具，涵盖资本基础到架构
      </p>
    </div>
  );

  // Gate: no enterprise mode set
  if (mode === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold mx-auto mb-5"
            style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            企业
          </div>
          <h2 className="text-base font-bold mb-2" style={{ color: "#1C1814", fontFamily: "var(--font-display)" }}>
            请先设置企业架构
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#68625C" }}>
            资本工具需要先确认你的企业主体，才能正确计算估值、股权、融资路径与企业数据。
          </p>
          <Link
            href="/student/dashboard?tab=enterprise"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#FFFFFF" }}
          >
            前往设置企业架构 →
          </Link>
        </div>
      </div>
    );
  }

  // Single company mode
  if (mode === "single") {
    const companyName = single?.name ?? "我的公司";
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
        {pageHeader}
        <ToolGrid companyName={companyName} isGroup={false} />
      </div>
    );
  }

  // Group mode
  const companies: { company: Company; isParent: boolean }[] = [];
  if (group.parent) companies.push({ company: group.parent, isParent: true });
  group.subsidiaries.forEach((s) => companies.push({ company: s, isParent: false }));

  // Group: no company selected → show company picker
  if (!activeCompany) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
        {pageHeader}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5 text-xs"
          style={{ backgroundColor: "#EFF4FF", border: "1px solid rgba(107,155,210,0.2)", color: "#6B9BD2" }}
        >
          <span style={{ flexShrink: 0 }}>i</span>
          集团模式 · 请先选择要操作的企业主体，再进入工具
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold mx-auto mb-5"
              style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.2)" }}
            >
              集团
            </div>
            <p className="text-sm mb-4" style={{ color: "#68625C" }}>尚未设置集团架构</p>
            <Link
              href="/student/dashboard?tab=enterprise"
              className="inline-block px-5 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "linear-gradient(135deg, #5A8AC0, #6B9BD2)", color: "#FFFFFF" }}
            >
              前往设置集团架构 →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {companies.map(({ company, isParent }) => (
              <CompanyCard
                key={company.id}
                company={company}
                isParent={isParent}
                onSelect={handleSelectCompany}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Group: company selected → show tool grid
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      {pageHeader}
      <ToolGrid
        companyName={activeCompany.name}
        isGroup={true}
        onChangeCompany={handleChangeCompany}
      />
    </div>
  );
}
