import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type LessonType = "VIDEO" | "READING" | "QUIZ" | "EXERCISE";
type LessonStatus = "completed" | "current" | "locked";

const TYPE_ICON: Record<LessonType, string> = {
  VIDEO: "",
  READING: "≡",
  QUIZ: "?",
  EXERCISE: "",
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
          学习路径
        </h1>
        {totalLessons > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0D9CE", maxWidth: 200 }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round((completedLessons / totalLessons) * 100)}%`,
                  background: "linear-gradient(to right, #9A7A32, #C9A84C)",
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>
              {completedLessons}/{totalLessons} 关
            </span>
          </div>
        )}
      </div>

      {modules.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#FFFFFF", border: "1px dashed #E0D9CE" }}
        >
          <div className="text-lg mb-4" style={{ color: "var(--color-text-muted)" }}>课程准备中</div>
          <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>课程内容正在准备中</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>管理员将陆续发布课程模块，请稍后回来查看</p>
        </div>
      )}

      <div className="space-y-10">
        {modules.map((module) => {
          const getStatus = (
            lessonId: string,
            index: number,
            allIds: string[],
          ): LessonStatus => {
            if (completedIds.has(lessonId)) return "completed";
            const prevCompleted = index === 0 || completedIds.has(allIds[index - 1]);
            return prevCompleted ? "current" : "locked";
          };

          const allIds = module.lessons.map((l) => l.id);

          return (
            <div key={module.id}>
              <div
                className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {module.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {module.lessons.length} 关
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-mono"
                  style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                  {module.lessons.filter((l) => completedIds.has(l.id)).length}/{module.lessons.length}
                </span>
              </div>

              <LessonMap
                moduleId={module.id}
                lessons={module.lessons as { id: string; title: string; type: LessonType; points: number }[]}
                completedIds={completedIds}
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
  lessons,
  completedIds,
  allIds,
  getStatus,
}: {
  moduleId: string;
  lessons: { id: string; title: string; type: LessonType; points: number }[];
  completedIds: Set<string>;
  allIds: string[];
  getStatus: (id: string, i: number, allIds: string[]) => LessonStatus;
}) {
  const containerH = lessons.length * SLOT_HEIGHT + NODE_RADIUS * 2;
  const nodeX = (i: number) => (i % 2 === 0 ? LEFT_CX : RIGHT_CX);

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: 320, height: containerH }}>
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
                stroke={prevDone ? "#C9A84C" : "#D8D1C6"}
                strokeWidth={2}
                strokeDasharray={prevDone ? "0" : "6 4"}
                strokeOpacity={prevDone ? 0.7 : 1}
              />
            );
          })}
        </svg>

        {lessons.map((lesson, i) => {
          const status = getStatus(lesson.id, i, allIds);
          const cx = nodeX(i);
          const cy = i * SLOT_HEIGHT;
          const isLeft = i % 2 === 0;

          const nodeStyle = {
            completed: {
              bg: "#C9A84C",
              border: "none",
              color: "#FFFFFF",
              shadow: "none",
            },
            current: {
              bg: "#FFFFFF",
              border: "2px solid #C9A84C",
              color: "#C9A84C",
              shadow: "0 0 16px rgba(201,168,76,0.25)",
            },
            locked: {
              bg: "#F0EDE7",
              border: "2px solid #D8D1C6",
              color: "#B0A898",
              shadow: "none",
            },
          }[status];

          const icon =
            status === "completed" ? ""
            : status === "locked" ? "×"
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
                  cursor: status === "locked" ? "default" : "pointer",
                }}
              >
                {icon}
              </div>
              <div
                className="mt-1.5 text-center text-xs font-mono"
                style={{ color: status === "completed" ? "#C9A84C" : "#9A9490" }}
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
                    status === "completed" ? "#9A9490"
                    : status === "current" ? "#1C1814"
                    : "#B0A898",
                }}
              >
                <div className="font-medium leading-tight mb-0.5">{lesson.title}</div>
                <div style={{ color: status === "locked" ? "#C8C1B8" : "#68625C" }}>
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
