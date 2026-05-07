"use client";

import { useTransition } from "react";
import { deleteLesson } from "@/app/actions/admin";

export default function LessonActions({ lessonId, moduleId }: { lessonId: string; moduleId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("确认删除此课节？")) return;
        startTransition(async () => { await deleteLesson(lessonId, moduleId); });
      }}
      disabled={pending}
      className="px-3 py-1.5 rounded-lg text-xs flex-shrink-0"
      style={{ backgroundColor: "#1A1A1A", color: "#666660" }}
    >
      删除
    </button>
  );
}
