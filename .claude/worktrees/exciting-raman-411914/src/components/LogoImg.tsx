"use client";

import { useState } from "react";

interface Props {
  height?: number;
  className?: string;
  onLight?: boolean;
}

export default function LogoImg({ height = 34, className, onLight }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={className}
        style={{
          fontFamily: "var(--font-display)",
          color: onLight ? "#1C1814" : "#C9A84C",
          fontSize: height * 0.65,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        资本道
      </span>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Capital Mastery 资本道"
      height={height}
      style={{
        height,
        width: "auto",
        objectFit: "contain",
      }}
      onError={() => setFailed(true)}
    />
  );
}
