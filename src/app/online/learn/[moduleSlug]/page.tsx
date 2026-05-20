"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getModuleBySlug } from "@/lib/capitalLaunchCourse";

const DEMO_COMPLETED: string[] = [];

export default function ModuleOverviewPage({ params }: { params: Promise<{ moduleSlug: string }> }) {
  const { moduleSlug } = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [completedLessons] = useState<Set<string>>(new Set(DEMO_COMPLETED));

  useEffect(() => { setMounted(true); }, []);

  const mod = getModuleBySlug(moduleSlug);

  if (!mounted) return null;
  if (!mod) {
    router.push("/student/learn");
    return null;
  }

  const completedCount = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
  const color = mod.levelColor;

  const nextLesson = mod.lessons.find((l) => !completedLessons.has(l.id)) ?? mod.lessons[0];

  const LESSON_TYPE_LABEL: Record<string, string> = {
    STORY: "故事讲解",
    QUIZ: "理解测验",
    SIMULATION: "互动模拟",
    REFLECTION: "深度思考",
  };

  const LESSON_TYPE_DURATION: Record<string, string> = {
    STORY: "4-5 分钟",
    QUIZ: "2-3 分钟",
    SIMULATION: "5-8 分钟",
    REFLECTION: "2-3 分钟",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {/* Back */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href="/student/learn"
          className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-muted)" }}
        >
          ← 资本启航
        </Link>
      </div>

      {/* Module Hero */}
      <div
        className="mx-4 mt-2 rounded-3xl p-6 relative overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: `1px solid ${color}30`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="relative z-10">
          <div className="text-xs font-medium mb-2" style={{ color: `${color}cc` }}>
            {mod.levelLabel} · 模块 {mod.order} / 11
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            {mod.title}
          </h1>
          <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-text-secondary)" }}>
            {mod.description}
          </p>

          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="text-lg font-bold font-mono" style={{ color }}>{mod.lessons.length}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>关卡</div>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: "#E0D9CE" }} />
            <div className="text-center">
              <div className="text-lg font-bold font-mono" style={{ color }}>+{mod.xpReward}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>XP</div>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: "#E0D9CE" }} />
            <div className="text-center">
              <div className="text-lg font-bold font-mono" style={{ color }}>{completedCount}/{mod.lessons.length}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>完成</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="px-4 mt-6 pb-28">
        <h2
          className="text-xs font-semibold mb-4 uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          课程关卡
        </h2>
        <div className="space-y-2">
          {mod.lessons.map((lesson, idx) => {
            const isDone = completedLessons.has(lesson.id);
            const isNext = lesson.id === nextLesson.id;
            const isLocked =
              !isDone && !isNext && idx > 0 && !completedLessons.has(mod.lessons[idx - 1].id);

            const row = (
              <div
                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: isNext ? `${color}08` : "#FFFFFF",
                  border: isNext
                    ? `1px solid ${color}30`
                    : `1px solid #E0D9CE`,
                  opacity: isLocked ? 0.4 : 1,
                  cursor: isLocked ? "default" : "pointer",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: isDone ? color : isNext ? `${color}18` : "#F7F4EF",
                    color: isDone ? "#FFF" : isNext ? color : "var(--color-text-muted)",
                    border: isNext ? `1px solid ${color}40` : "none",
                  }}
                >
                  {isDone ? "✓" : isLocked ? "-" : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: isDone ? "var(--color-text-muted)" : "var(--color-text-primary)" }}
                  >
                    {lesson.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {LESSON_TYPE_LABEL[lesson.type] ?? lesson.type}
                    </span>
                    <span style={{ color: "#E0D9CE" }}>·</span>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {LESSON_TYPE_DURATION[lesson.type] ?? "5 分钟"}
                    </span>
                  </div>
                </div>

                <div
                  className="text-xs font-mono flex-shrink-0"
                  style={{ color: isDone ? color : "var(--color-text-muted)" }}
                >
                  +{lesson.xpReward}XP
                </div>
              </div>
            );

            return (
              <div key={lesson.id}>
                {isLocked ? row : (
                  <Link href={`/online/learn/${moduleSlug}/${lesson.slug}`}>{row}</Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 md:left-60"
        style={{ background: "linear-gradient(to top, var(--color-bg-primary) 60%, transparent)" }}
      >
        <Link
          href={`/online/learn/${moduleSlug}/${nextLesson.slug}`}
          className="block w-full max-w-sm mx-auto text-center py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            color: "#FFFFFF",
          }}
        >
          {completedCount === 0 ? "开始学习 →" : completedCount === mod.lessons.length ? "再次复习 →" : "继续学习 →"}
        </Link>
      </div>
    </div>
  );
}
