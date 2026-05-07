import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [totalUsers, totalDocuments, recentPayments] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });

  const roleCount = Object.fromEntries(usersByRole.map((r) => [r.role, r._count]));

  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: "超级管理员",
    SUB_ADMIN: "副管理员",
    CLIENT: "咨询客户",
    STUDENT: "学生会员",
    FREE_MEMBER: "免费会员",
  };

  const PAY_STATUS_COLOR: Record<string, string> = {
    PENDING: "#C9A84C",
    SUCCESS: "#4CAF82",
    FAILED: "#EF4444",
  };

  const PAY_STATUS_LABEL: Record<string, string> = {
    PENDING: "待处理",
    SUCCESS: "成功",
    FAILED: "失败",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          管理仪表板
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          资本道平台后台 — {session.user.role === "SUPER_ADMIN" ? "超级管理员" : "副管理员"}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "总用户", value: totalUsers, href: "/admin/users" },
          { label: "学生会员", value: roleCount["STUDENT"] ?? 0, href: "/admin/users" },
          { label: "咨询客户", value: roleCount["CLIENT"] ?? 0, href: "/admin/users" },
          { label: "合约文件", value: totalDocuments, href: "/admin/contracts" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-xs mb-2" style={{ color: "#666660" }}>{s.label}</div>
            <div className="text-3xl font-bold" style={{ color: "#C9A84C" }}>{s.value}</div>
          </Link>
        ))}
      </div>

      {/* User breakdown */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#F5F5F0" }}>用户角色分布</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {Object.entries(ROLE_LABEL).map(([role, label]) => (
            <div
              key={role}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: "#F5F5F0" }}>
                {roleCount[role] ?? 0}
              </div>
              <div className="text-xs" style={{ color: "#666660" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#F5F5F0" }}>快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/contracts/new"
            className="flex items-center gap-4 rounded-xl px-5 py-4"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>生成新合约</div>
              <div className="text-xs mt-0.5" style={{ color: "#555550" }}>为客户创建咨询服务合约</div>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-4 rounded-xl px-5 py-4"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <span className="text-2xl">👥</span>
            <div>
              <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>用户管理</div>
              <div className="text-xs mt-0.5" style={{ color: "#555550" }}>查看、编辑用户角色与权限</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent payments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "#F5F5F0" }}>最近支付记录</h2>
          <Link href="/admin/payments" className="text-xs" style={{ color: "#C9A84C" }}>查看全部 →</Link>
        </div>

        {recentPayments.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <p className="text-sm" style={{ color: "#666660" }}>暂无支付记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between rounded-xl px-5 py-3"
                style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{pay.user.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#555550" }}>
                    {pay.user.email} · {new Date(pay.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>
                    {pay.currency} {pay.amount.toFixed(2)}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: PAY_STATUS_COLOR[pay.status] ?? "#666660" }}
                  >
                    {PAY_STATUS_LABEL[pay.status] ?? pay.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
