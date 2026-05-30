"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";
import type { CompanyMode } from "@/lib/enterprise";

interface UseToolButtonProps {
  href: string;
  label: string;
  color: string;
}

export default function UseToolButton({ href, label, color }: UseToolButtonProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CompanyMode | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      setMode(raw ? (JSON.parse(raw) as CompanyMode) : null);
    } catch {
      setMode(null);
    }
  }, []);

  const handleClick = () => {
    // null  → not set up yet
    if (mode === null || mode === undefined) {
      router.push("/student/dashboard?tab=enterprise");
      return;
    }
    // group → must go to company selection first, never to enterprise setup
    if (mode === "group") {
      router.push("/student/tools");
      return;
    }
    // single → go directly to the tool
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-85 cursor-pointer"
      style={{
        backgroundColor: color + "15",
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </button>
  );
}
