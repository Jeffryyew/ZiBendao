import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewModuleForm from "./NewModuleForm";
import ModuleActions from "./ModuleActions";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const modules = await prisma.module.findMany({
    include: { _count: { select: { lessons: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          课程管理
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          共 {modules.length} 个模块
        </p>
      </div>

      {/* Module list */}
      <div className="space-y-3">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="flex items-center gap-4 px-5 py-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
              >
                {mod.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm" style={{ color: "#F5F5F0" }}>{mod.title}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: mod.isPublished ? "rgba(76,175,130,0.15)" : "rgba(102,102,96,0.2)",
                      color: mod.isPublished ? "#4CAF82" : "#666660",
                    }}
                  >
                    {mod.isPublished ? "已发布" : "草稿"}
                  </span>
                  <span className="text-xs" style={{ color: "#555550" }}>
                    L{mod.requiredLevel} · {mod._count.lessons} 课
                  </span>
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#666660" }}>{mod.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/admin/courses/${mod.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
                >
                  管理课节 →
                </Link>
                <ModuleActions moduleId={mod.id} isPublished={mod.isPublished} />
              </div>
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <p className="text-sm" style={{ color: "#666660" }}>暂无模块，创建第一个吧。</p>
          </div>
        )}
      </div>

      {/* Create module form */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#F5F5F0" }}>添加模块</h2>
        <NewModuleForm nextOrder={modules.length + 1} />
      </div>
    </div>
  );
}
