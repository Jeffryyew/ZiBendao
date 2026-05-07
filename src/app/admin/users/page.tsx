import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserTable from "./UserTable";
import CreateClientDialog from "./CreateClientDialog";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const adminRole = session.user.role;
  if (adminRole !== "SUPER_ADMIN" && adminRole !== "SUB_ADMIN") redirect("/dashboard");

  const { q, role } = searchParams;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        role ? { role: role as never } : {},
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    include: {
      toolAccess: { select: { toolId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    orderBy: { requiredLevel: "asc" },
  });

  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: "超级管理员",
    SUB_ADMIN: "副管理员",
    CLIENT: "咨询客户",
    STUDENT: "学生",
    FREE_MEMBER: "免费会员",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
            用户管理
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
            共 {users.length} 位用户{q ? `（搜索: ${q}）` : ""}
          </p>
        </div>
        <CreateClientDialog />
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜索姓名或邮箱…"
          className="flex-1 min-w-48 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A", color: "#F5F5F0" }}
        />
        <select
          name="role"
          defaultValue={role ?? ""}
          className="rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A", color: "#F5F5F0" }}
        >
          <option value="">全部角色</option>
          {Object.entries(ROLE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          搜索
        </button>
        {(q || role) && (
          <a
            href="/admin/users"
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
          >
            重置
          </a>
        )}
      </form>

      <UserTable users={users} tools={tools} />
    </div>
  );
}
