import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isGraduate } from "@/lib/roles";
import Link from "next/link";

type LessonType = "VIDEO" | "READING" | "QUIZ" | "EXERCISE";
type LessonStatus = "completed" | "current" | "locked";

const TYPE_ICON: Record<LessonType, string> = {
  VIDEO: "▶",
  READING: "≡",
  QUIZ: "?",
  EXERCISE: "✎",
};

const TYPE_LABEL: Record<LessonType, string> = {
  VIDEO: "视频",
  READING: "阅读",
  QUIZ: "测验",
  EXERCISE: "练习",
};

const LEFT_CX = 44;
const RIGHT_CX = 276;
const NODE_RADIUS = 28;
const SLOT_HEIGHT = 110;

export default async function StudentLearnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const grad = isGraduate(role);
  const studentLevel = grad ? 99 : (session.user.studentLevel ?? 1);

  const modules = await prisma.module.findMany({
    where: { isPublished: true },
    include: { lessons: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  let completedIds = new Set<string>();
  try {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { lessonId: true },
    });
    completedIds = new Set(progress.map((p) => p.lessonId));
  } catch {
    // DB not seeded
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = completedIds.size;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          学习路径
        </h1>
        {totalLessons > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1E1E", maxWidth: 200 }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round((completedLessons / totalLessons) * 100)}%`,
                  background: "linear-gradient(to right, #9A7A32, #C9A84C)",
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: "#A0A09A" }}>
              {completedLessons}/{totalLessons} 关
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {modules.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#0D0D0D", border: "1px dashed #1E1E1E" }}
        >
          <div className="text-4xl mb-4">📚</div>
          <p className="text-sm mb-1" style={{ color: "#555550" }}>课程内容正在准备中</p>
          <p className="text-xs" style={{ color: "#333330" }}>管理员将陆续发布课程模块，请稍后回来查看</p>
        </div>
      )}

      {/* Course modules */}
      <div className="space-y-10">
        {modules.map((module) => {
          const moduleLocked = studentLevel < module.requiredLevel;

          const getStatus = (
            lessonId: string,
            index: number,
            allIds: string[],
          ): LessonStatus => {
            if (completedIds.has(lessonId)) return "completed";
            if (moduleLocked) return "locked";
            const prevCompleted = index === 0 || completedIds.has(allIds[index - 1]);
            return prevCompleted ? "current" : "locked";
          };

          const allIds = module.lessons.map((l) => l.id);

          return (
            <div key={module.id}>
              {/* Module Banner */}
              <div
                className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                style={{
                  backgroundColor: moduleLocked ? "#0F0F0F" : "#1A1A1A",
                  border: `1px solid ${moduleLocked ? "#161616" : "rgba(201,168,76,0.2)"}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: moduleLocked ? "#555550" : "#F5F5F0" }}>
                    {module.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#444440" }}>
                    {module.lessons.length} 关
                    {module.requiredLevel > 1 && ` · 需要 L${module.requiredLevel}`}
                  </div>
                </div>
                {moduleLocked ? (
                  <span style={{ color: "#2A2A28" }}>🔒</span>
                ) : (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-mono"
                    style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
                  >
                    L{module.requiredLevel}
                  </span>
                )}
              </div>

              {/* Lesson Path Map */}
              <LessonMap
                moduleId={module.id}
                lessons={module.lessons as { id: string; title: string; type: LessonType; points: number }[]}
                completedIds={completedIds}
                moduleLocked={moduleLocked}
                allIds={allIds}
                getStatus={getStatus}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonMap({
  moduleId,
  lessons,
  completedIds,
  moduleLocked,
  allIds,
  getStatus,
}: {
  moduleId: string;
  lessons: { id: string; title: string; type: LessonType; points: number }[];
  completedIds: Set<string>;
  moduleLocked: boolean;
  allIds: string[];
  getStatus: (id: string, i: number, allIds: string[]) => LessonStatus;
}) {
  const containerH = lessons.length * SLOT_HEIGHT + NODE_RADIUS * 2;
  const nodeX = (i: number) => (i % 2 === 0 ? LEFT_CX : RIGHT_CX);

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: 320, height: containerH }}>
        {/* SVG connector lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={320}
          height={containerH}
          aria-hidden
        >
          {lessons.map((lesson, i) => {
            if (i === 0) return null;
            const x1 = nodeX(i - 1);
            const y1 = (i - 1) * SLOT_HEIGHT + NODE_RADIUS;
            const x2 = nodeX(i);
            const y2 = i * SLOT_HEIGHT + NODE_RADIUS;
            const prevDone = completedIds.has(lessons[i - 1].id);
            return (
              <line
                key={lesson.id}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={prevDone ? "#C9A84C" : "#1E1E1E"}
                strokeWidth={2}
                strokeDasharray={prevDone ? "0" : "6 4"}
                strokeOpacity={prevDone ? 0.5 : 1}
              />
            );
          })}
        </svg>

        {/* Lesson nodes */}
        {lessons.map((lesson, i) => {
          const status = getStatus(lesson.id, i, allIds);
          const cx = nodeX(i);
          const cy = i * SLOT_HEIGHT;
          const isLeft = i % 2 === 0;

          const nodeStyle = {
            completed: { bg: "#C9A84C", border: "none", color: "#0D0D0D", shadow: "none" },
            current: {
              bg: "#1A1A1A",
              border: "2px solid #C9A84C",
              color: "#C9A84C",
              shadow: "0 0 18px rgba(201,168,76,0.4), 0 0 6px rgba(201,168,76,0.6)",
            },
            locked: { bg: "#111111", border: "2px solid #1A1A1A", color: "#2A2A28", shadow: "none" },
          }[status];

          const icon =
            status === "completed" ? "✓"
            : status === "locked" ? "🔒"
            : TYPE_ICON[lesson.type];

          const labelLeft = isLeft ? cx + NODE_RADIUS + 8 : undefined;
          const labelRight = !isLeft ? 320 - cx + NODE_RADIUS + 8 : undefined;

          const NodeContent = (
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold select-none"
                style={{
                  backgroundColor: nodeStyle.bg,
                  border: nodeStyle.border,
                  color: nodeStyle.color,
                  boxShadow: nodeStyle.shadow,
                  cursor: status === "locked" ? "not-allowed" : "pointer",
                }}
              >
                {icon}
              </div>
              <div
                className="mt-1.5 text-center text-xs font-mono"
                style={{ color: status === "completed" ? "#C9A84C" : "#2A2A28" }}
              >
                +{lesson.points}
              </div>
              <div
                className="absolute text-xs leading-snug"
                style={{
                  left: labelLeft,
                  right: labelRight,
                  top: 8,
                  width: 112,
                  textAlign: isLeft ? "left" : "right",
                  color:
                    status === "completed" ? "#888880"
                    : status === "current" ? "#F5F5F0"
                    : "#2A2A28",
                }}
              >
                <div className="font-medium leading-tight mb-0.5">{lesson.title}</div>
                <div style={{ color: status === "locked" ? "#222220" : "#555550" }}>
                  {TYPE_LABEL[lesson.type]}
                </div>
              </div>
            </>
          );

          return (
            <div key={lesson.id} className="absolute" style={{ left: cx - NODE_RADIUS, top: cy }}>
              {status !== "locked" ? (
                <Link href={`/student/learn/${lesson.id}`} className="block">
                  {NodeContent}
                </Link>
              ) : (
                <div>{NodeContent}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
