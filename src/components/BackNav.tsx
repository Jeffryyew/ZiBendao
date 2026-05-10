"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  className?: string;
}

export default function BackNav({ className }: Props) {
  const router = useRouter();
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <button
        onClick={() => window.history.length > 1 ? router.back() : router.push("/")}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
        style={{ color: "#555550", backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#C9A84C";
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#555550";
          e.currentTarget.style.borderColor = "#1A1A1A";
        }}
      >
        ← 返回
      </button>
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
        style={{ color: "#555550", backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#555550";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1A1A1A";
        }}
      >
        ⌂ 返回主页
      </Link>
    </div>
  );
}
