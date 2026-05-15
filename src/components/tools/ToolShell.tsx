"use client";

import Link from "next/link";

interface ToolShellProps {
  icon: string;
  title: string;
  desc: string;
  levelRequired?: number;
  backHref?: string;
  children: React.ReactNode;
}

export default function ToolShell({
  icon,
  title,
  desc,
  backHref = "/student/tools",
  children,
}: ToolShellProps) {
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
            ← 返回工具
          </Link>
          <span style={{ color: "#D8D1C6" }}>·</span>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-[#1C1814]"
            style={{ color: "var(--color-text-muted)" }}
          >
             主页
          </Link>
          <span style={{ color: "#D8D1C6" }}>·</span>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--color-text-primary)" }}>
            {icon} {title}
          </span>
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
