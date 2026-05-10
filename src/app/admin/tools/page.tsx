import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ToolsPanel from "./ToolsPanel";

export default async function AdminToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  const [tools, clients] = await Promise.all([
    prisma.tool.findMany({ orderBy: { requiredLevel: "asc" } }),
    prisma.user.findMany({
      where: { role: "ENTERPRISE_CLIENT", isActive: true },
      include: { toolAccess: { select: { toolId: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          工具管理
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          管理计算工具目录与客户访问权限
        </p>
      </div>

      <ToolsPanel tools={tools} clients={clients} />
    </div>
  );
}
