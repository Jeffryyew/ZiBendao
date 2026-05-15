"use client";

import { useState } from "react";

interface NotificationBannerProps {
  isEn: boolean;
}

export default function NotificationBanner({ isEn }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg px-4 py-3"
      style={{
        borderLeft: "3px solid #C9A84C",
        backgroundColor: "#111111",
        border: "1px solid rgba(201,168,76,0.18)",
        borderLeftWidth: "3px",
        borderLeftColor: "#C9A84C",
      }}
    >
      <div>
        <p className="text-xs font-semibold" style={{ color: "#C9A84C" }}>
          ✓ {isEn ? "Congratulations, Capitalist." : "恭喜，资本家。"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#666660" }}>
          {isEn
            ? "You've unlocked: Business Capitalization"
            : "你已解锁：《企业资本化》"}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="flex-shrink-0 text-base leading-none transition-colors mt-0.5"
        style={{ color: "#444440", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888880"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#444440"; }}
      >
        ×
      </button>
    </div>
  );
}
