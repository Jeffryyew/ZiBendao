"use client";

import { useTransition } from "react";
import { toggleModulePublished, deleteModule } from "@/app/actions/admin";

interface Props {
  moduleId: string;
  isPublished: boolean;
}

export default function ModuleActions({ moduleId, isPublished }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => startTransition(async () => { await toggleModulePublished(moduleId, !isPublished); })}
        disabled={pending}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: isPublished ? "rgba(239,68,68,0.1)" : "rgba(76,175,130,0.15)",
          color: isPublished ? "#EF4444" : "#4CAF82",
        }}
      >
        {isPublished ? "下架" : "发布"}
      </button>
      <button
        onClick={() => {
          if (!confirm("确认删除此模块及其所有课节？")) return;
          startTransition(async () => { await deleteModule(moduleId); });
        }}
        disabled={pending}
        className="px-3 py-1.5 rounded-lg text-xs"
        style={{ backgroundColor: "#1A1A1A", color: "#666660" }}
      >
        删除
      </button>
    </div>
  );
}
