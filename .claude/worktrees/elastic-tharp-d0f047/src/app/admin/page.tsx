import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ROLE_LABEL, getRoleLabel, ROLE_COLOR } from "@/lib/roles";

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

  const role = session.user.role as string;
  const firstName = session.user.name?.split(" ")[0] ?? session.user.name ?? "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const roleColor = ROLE_COLOR[role] ?? "#F97316";

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
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 space-y-7">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm mb-1" style={{ color: "#666660" }}>{greeting}，</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {firstName}
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{
            backgroundColor: `${roleColor}18`,
            border: `1px solid ${roleColor}40`,
            color: roleColor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: roleColor }} />
          {getRoleLabel(role)}
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "总用户", value: totalUsers,                                icon: "用户", href: "/admin/users" },
          { label: "线上学生", value: roleCount["ONLINE_STUDENT"] ?? 0,        icon: "学生", href: "/admin/users" },
          { label: "企业客户", value: roleCount["ENTERPRISE_CLIENT"] ?? 0,     icon: "客户", href: "/admin/users" },
          { label: "合约文件", value: totalDocuments,                           icon: "合约", href: "/admin/contracts" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="p-4 rounded-2xl text-center transition-all"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: "#C9A84C" }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#555550" }}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* ── User Breakdown ── */}
      <div>
        <h2 className="font-semibold text-sm tracking-wide mb-4" style={{ color: "#A0A09A" }}>用户角色分布</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(ROLE_LABEL).map(([r, label]) => {
            const count = roleCount[r] ?? 0;
            const color = ROLE_COLOR[r] ?? "#666660";
            return (
              <div
                key={r}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: "#0D0D0D", border: `1px solid ${count > 0 ? color + "30" : "#161616"}` }}
              >
                <div
                  className="text-xl font-bold font-mono mb-0.5"
                  style={{ color: count > 0 ? color : "#333330" }}
                >
                  {count}
                </div>
                <div className="text-xs leading-snug" style={{ color: "#444440" }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="font-semibold text-sm tracking-wide mb-4" style={{ color: "#A0A09A" }}>快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { href: "/admin/contracts/new", icon: "+", title: "生成新合约", desc: "为客户创建咨询服务合约" },
            { href: "/admin/users",         icon: "◈", title: "用户管理",   desc: "查看、编辑用户角色与权限" },
            { href: "/admin/reports",       icon: "▦", title: "数据报告",   desc: "平台运营统计与分析" },
            { href: "/admin/payments",      icon: "¥", title: "支付记录",   desc: "查看所有订单与支付状态" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{action.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "#555550" }}>{action.desc}</div>
              </div>
              <span style={{ color: "#C9A84C", fontSize: "0.75rem" }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Payments ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm tracking-wide" style={{ color: "#A0A09A" }}>最近支付记录</h2>
          <Link href="/admin/payments" className="text-xs" style={{ color: "#C9A84C" }}>查看全部 →</Link>
        </div>

        {recentPayments.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#0D0D0D", border: "1px dashed #1E1E1E" }}
          >
            <div className="text-sm mb-3" style={{ color: "#555550" }}>暂无记录</div>
            <p className="text-sm" style={{ color: "#555550" }}>暂无支付记录</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPayments.map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{pay.user.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#444440" }}>
                    {pay.user.email} · {new Date(pay.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold font-mono" style={{ color: "#F5F5F0" }}>
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
