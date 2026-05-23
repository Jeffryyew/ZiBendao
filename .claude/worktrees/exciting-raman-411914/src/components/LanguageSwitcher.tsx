"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";

export default function LanguageSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = current === "zh" ? "en" : "zh";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="text-xs px-3 py-1 rounded-full border transition-all"
      style={{
        borderColor: "#C9A84C",
        color: "#C9A84C",
        backgroundColor: "transparent",
        opacity: pending ? 0.5 : 1,
        cursor: pending ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
      }}
      title={current === "zh" ? "Switch to English" : "切换为中文"}
    >
      {current === "zh" ? "EN" : "中文"}
    </button>
  );
}
