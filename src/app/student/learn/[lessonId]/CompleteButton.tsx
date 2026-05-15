"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeLesson } from "@/app/actions/student";

interface Props {
  lessonId: string;
  points: number;
  nextLessonId?: string;
}

export default function CompleteButton({ lessonId, points, nextLessonId }: Props) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleComplete() {
    startTransition(async () => {
      await completeLesson(lessonId);
      setDone(true);
      if (nextLessonId) {
        setTimeout(() => router.push(`/student/learn/${nextLessonId}`), 1200);
      }
    });
  }

  if (done) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ backgroundColor: "rgba(76,175,130,0.08)", border: "1px solid rgba(76,175,130,0.25)" }}
      >
        <div className="text-2xl mb-2"></div>
        <p className="text-sm font-semibold mb-0.5" style={{ color: "#4CAF82" }}>
          完成！获得 +{points} XP
        </p>
        {nextLessonId && (
          <p className="text-xs" style={{ color: "#555550" }}>正在跳转到下一课…</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={pending}
      className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-opacity"
      style={{
        background: "linear-gradient(135deg, #B8943A, #C9A84C)",
        color: "#0D0D0D",
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? "记录中…" : `标记完成 · 获得 +${points} XP`}
    </button>
  );
}
