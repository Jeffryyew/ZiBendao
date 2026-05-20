import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CAPITAL_LAUNCH_MODULES } from "@/lib/capitalLaunchCourse";
import Link from "next/link";

export default async function CapitalLaunchPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let completedIds = new Set<string>();
  try {
    const progress = await prisma.onlineLessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { lessonId: true },
    });
    completedIds = new Set(progress.map((p) => p.lessonId));
  } catch {}

  const totalLessons = CAPITAL_LAUNCH_MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = CAPITAL_LAUNCH_MODULES.reduce(
    (s, m) => s + m.lessons.filter((l) => completedIds.has(l.id)).length,
    0
  );
  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          资本启航
        </h1>
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "#E0D9CE", maxWidth: 200 }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${overallPct}%`,
                background: "linear-gradient(to right, #9A7A32, #C9A84C)",
              }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            {completedCount}/{totalLessons} 关
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {CAPITAL_LAUNCH_MODULES.map((mod) => {
          const done = mod.lessons.filter((l) => completedIds.has(l.id)).length;
          const total = mod.lessons.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Link key={mod.id} href={`/online/learn/${mod.slug}`} className="block">
              <div
                className="rounded-2xl p-4 transition-all hover:shadow-sm"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${mod.levelColor}18`, color: mod.levelColor }}
                  >
                    {mod.levelLabel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {mod.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {mod.subtitle} · {total} 关
                    </div>
                  </div>
                  <div
                    className="text-xs font-mono flex-shrink-0"
                    style={{ color: pct === 100 ? "#82C8A0" : "var(--color-text-muted)" }}
                  >
                    {done}/{total}
                  </div>
                </div>
                {pct > 0 && (
                  <div
                    className="mt-3 h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#E0D9CE" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? "#82C8A0" : "#C9A84C",
                      }}
                    />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
