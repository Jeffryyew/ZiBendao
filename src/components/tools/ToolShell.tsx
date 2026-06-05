"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";
import type { CompanyMode } from "@/lib/enterprise";

interface ToolShellProps {
  icon: string;
  title: string;
  desc: string;
  levelRequired?: number;
  backHref?: string;
  guideButton?: React.ReactNode;
  children: React.ReactNode;
}

interface CompanyState {
  mode: CompanyMode;
  companyName: string | null;
  hasActiveCompany: boolean;
  ready: boolean;
}

function useCompanyState(): CompanyState {
  const [mode, setMode] = useState<CompanyMode>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [hasActiveCompany, setHasActiveCompany] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const rawMode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      const raw = rawMode ? JSON.parse(rawMode) as CompanyMode : null;
      if (raw === "single") {
        setMode("single");
        const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
        if (sc) setCompanyName(JSON.parse(sc).name || null);
        setHasActiveCompany(true);
      } else if (raw === "group") {
        setMode("group");
        const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
        if (ac) {
          const parsed = JSON.parse(ac);
          setCompanyName(parsed.name || null);
          setHasActiveCompany(true);
        } else {
          // No active company selected — try to show parent name as fallback
          const grp = localStorage.getItem(ENTERPRISE_KEYS.GROUP);
          if (grp) {
            const parsed = JSON.parse(grp);
            setCompanyName(parsed.parent?.name || null);
          }
          setHasActiveCompany(false);
        }
      }
    } catch {}
    setReady(true);
  }, []);

  return { mode, companyName, hasActiveCompany, ready };
}

export default function ToolShell({
  icon,
  title,
  desc,
  backHref = "/student/tools",
  guideButton,
  children,
}: ToolShellProps) {
  const { mode, companyName, hasActiveCompany, ready } = useCompanyState();

  // Gate: no enterprise mode configured
  if (ready && !mode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        <div className="max-w-sm w-full rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold mx-auto mb-5"
            style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            企业
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            请先设置企业架构
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#68625C" }}>
            资本工具需要先确认你的企业主体，才能正确计算估值、股权、融资路径与企业数据。
          </p>
          <Link
            href="/student/dashboard?tab=enterprise"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#FFFFFF" }}
          >
            前往设置企业架构 →
          </Link>
        </div>
      </div>
    );
  }

  // Gate: group mode but no company selected
  if (ready && mode === "group" && !hasActiveCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        <div className="max-w-sm w-full rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold mx-auto mb-5"
            style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.25)" }}
          >
            集团
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            请先选择企业主体
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#68625C" }}>
            集团模式下，请先从公司列表中选择要操作的企业，工具数据将按企业独立记录。
          </p>
          <Link
            href="/student/tools"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #5A8AC0, #6B9BD2)", color: "#FFFFFF" }}
          >
            返回选择企业 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-30 print:hidden"
        style={{
          backgroundColor: "rgba(247,244,239,0.95)",
          borderBottom: "1px solid #E0D9CE",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-[#1C1814]"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← 返回
          </Link>
          <span style={{ color: "#D8D1C6" }}>·</span>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--color-text-primary)" }}>
            {icon} {title}
          </span>
          {ready && companyName && (
            <span
              className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
            >
              {mode === "group" ? "集团 · " : ""}{companyName}
            </span>
          )}
          {guideButton && <div className="flex-shrink-0">{guideButton}</div>}
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        <div className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl print:text-xl">{icon}</span>
            <h1
              className="text-2xl font-bold print:text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
            >
              {title}
            </h1>
          </div>
          <p className="text-sm print:hidden" style={{ color: "var(--color-text-secondary)" }}>
            {desc}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
