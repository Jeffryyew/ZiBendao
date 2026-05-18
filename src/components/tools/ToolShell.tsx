"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ToolShellProps {
  icon: string;
  title: string;
  desc: string;
  levelRequired?: number;
  backHref?: string;
  children: React.ReactNode;
}

type CompanyMode = "single" | "group" | null;

function useCompanyMode(): { mode: CompanyMode; companyName: string | null; ready: boolean } {
  const [mode, setMode] = useState<CompanyMode>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("zbd_company_mode");
      if (raw === "single" || raw === "group") {
        setMode(raw);
        if (raw === "single") {
          const sc = localStorage.getItem("zbd_single_company");
          if (sc) {
            const parsed = JSON.parse(sc);
            setCompanyName(parsed.name || null);
          }
        } else {
          const grp = localStorage.getItem("zbd_group");
          if (grp) {
            const parsed = JSON.parse(grp);
            setCompanyName(parsed.parentName || null);
          }
        }
      }
    } catch {}
    setReady(true);
  }, []);

  return { mode, companyName, ready };
}

export default function ToolShell({
  icon,
  title,
  desc,
  backHref = "/student/dashboard",
  children,
}: ToolShellProps) {
  const { mode, companyName, ready } = useCompanyMode();

  // Gate: company mode not set up yet
  if (ready && !mode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        <div className="max-w-sm w-full rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            请先设置企业架构
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#68625C" }}>
            使用工具前，需先在总览页面选择企业模式（单一公司或集团模式），以便工具以正确的企业身份运算。
          </p>
          <Link
            href="/student/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
          >
            前往设置企业架构 →
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
              {mode === "group" ? "母公司 · " : ""}{companyName}
            </span>
          )}
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
