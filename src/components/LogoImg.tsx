"use client";

import { useState } from "react";

interface Props {
  height?: number;
  className?: string;
}

export default function LogoImg({ height = 34, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={className}
        style={{ fontFamily: "var(--font-display)", color: "#C9A84C", fontSize: height * 0.65, fontWeight: 700 }}
      >
        资本道
      </span>
    );
  }

  return (
    <img
      src="https://cdn1.npcdn.net/images/np_26751_1734661918.png"
      alt="Capital Mastery 资本道"
      height={height}
      style={{ height, width: "auto", objectFit: "contain" }}
      onError={() => setFailed(true)}
    />
  );
}
