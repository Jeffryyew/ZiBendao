import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewLessonForm from "./NewLessonForm";
import LessonActions from "./LessonActions";

const TYPE_LABEL: Record<string, string> = {
  VIDEO: "视频",
  READING: "阅读",
  QUIZ: "测验",
  EXERCISE: "练习",
};

export default async function ModuleDetailPage({ params }: { params: { moduleId: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const mod = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!mod) notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin/courses" className="text-xs" style={{ color: "#666660" }}>
          ← 返回模块列表
        </Link>
        <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          {mod.title}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm" style={{ color: "#A0A09A" }}>{mod.description}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: mod.isPublished ? "rgba(76,175,130,0.15)" : "rgba(102,102,96,0.2)",
              color: mod.isPublished ? "#4CAF82" : "#666660",
            }}
          >
            {mod.isPublished ? "已发布" : "草稿"}
          </span>
        </div>
      </div>

      {/* Lessons list */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#F5F5F0" }}>
          课节列表（{mod.lessons.length} 课）
        </h2>
        <div className="space-y-2">
          {mod.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-4 rounded-xl px-5 py-3.5"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#1A1A1A", color: "#C9A84C" }}
              >
                {lesson.order}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>{lesson.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "#555550" }}>
                  {TYPE_LABEL[lesson.type] ?? lesson.type} · {lesson.points} 积分
                </div>
              </div>
              <LessonActions lessonId={lesson.id} moduleId={mod.id} />
            </div>
          ))}
          {mod.lessons.length === 0 && (
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <p className="text-sm" style={{ color: "#666660" }}>暂无课节，添加第一课吧。</p>
            </div>
          )}
        </div>
      </div>

      {/* Add lesson */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#F5F5F0" }}>添加课节</h2>
        <NewLessonForm moduleId={mod.id} nextOrder={mod.lessons.length + 1} />
      </div>
    </div>
  );
}
