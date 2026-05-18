"use client";

import Link from "next/link";
import { useState } from "react";

interface ToolCardProps {
  href: string;
  name: string;
  desc: string;
  accentColor: string;
}

export default function ToolCard({ href, name, desc, accentColor }: ToolCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      className="block rounded-xl p-4 relative overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: hovered ? "#FDFCF9" : "#FFFFFF",
        border: `1px solid ${hovered ? accentColor + "60" : "#E0D9CE"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: accentColor, opacity: 0.4 }} />
      <div className="text-sm font-semibold mb-1 mt-0.5" style={{ color: "var(--color-text-primary)" }}>
        {name}
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>
        {desc}
      </p>
      <span className="text-xs font-medium" style={{ color: accentColor }}>
        使用工具 →
      </span>
    </Link>
  );
}
