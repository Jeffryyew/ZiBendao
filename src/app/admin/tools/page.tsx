import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ToolsPanel from "./ToolsPanel";

export default async function AdminToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const [tools, clients] = await Promise.all([
    prisma.tool.findMany({ orderBy: { requiredLevel: "asc" } }),
    prisma.user.findMany({
      where: { role: "CLIENT", isActive: true },
      include: { toolAccess: { select: { toolId: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
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
