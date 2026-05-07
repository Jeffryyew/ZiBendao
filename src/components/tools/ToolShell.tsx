"use client";

import Link from "next/link";

interface ToolShellProps {
  icon: string;
  title: string;
  desc: string;
  levelRequired: number;
  backHref?: string;
  children: React.ReactNode;
}

export default function ToolShell({
  icon,
  title,
  desc,
  levelRequired,
  backHref = "/student/tools",
  children,
}: ToolShellProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-30 print:hidden"
        style={{ backgroundColor: "rgba(11,11,11,0.95)", borderBottom: "1px solid #1A1A1A", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "#666660" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#A0A09A")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#666660")}
          >
            ← 返回工具
          </Link>
          <span style={{ color: "#2A2A2A" }}>·</span>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: "#F5F5F0" }}>
            {icon} {title}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            L{levelRequired}+
          </span>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        {/* Tool header */}
        <div className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl print:text-xl">{icon}</span>
            <h1
              className="text-2xl font-bold print:text-xl"
              style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
            >
              {title}
            </h1>
          </div>
          <p className="text-sm print:hidden" style={{ color: "#A0A09A" }}>
            {desc}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
