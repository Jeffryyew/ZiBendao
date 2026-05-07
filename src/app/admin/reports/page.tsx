import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReportCharts from "./ReportCharts";

function getLast6Months() {
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${d.getMonth() + 1}月`,
    });
  }
  return months;
}

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const months = getLast6Months();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [allUsers, recentUsers, successPayments, docGroups, roleGroups, toolAccessCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.payment.findMany({
        where: { createdAt: { gte: sixMonthsAgo }, status: "SUCCESS" },
        select: { createdAt: true, amount: true },
      }),
      prisma.document.groupBy({ by: ["status"], _count: true }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.clientToolAccess.count(),
    ]);

  const usersByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  recentUsers.forEach((u) => {
    const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (key in usersByMonth) usersByMonth[key]++;
  });

  const revenueByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  successPayments.forEach((p) => {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (key in revenueByMonth) revenueByMonth[key] += p.amount;
  });

  const monthlyData = months.map((m) => ({
    month: m.label,
    users: usersByMonth[m.key],
    revenue: Math.round(revenueByMonth[m.key] * 100) / 100,
  }));

  const docData = [
    {
      label: "草稿",
      value: docGroups.find((d) => d.status === "DRAFT")?._count ?? 0,
      color: "#666660",
    },
    {
      label: "已发送",
      value: docGroups.find((d) => d.status === "SENT")?._count ?? 0,
      color: "#C9A84C",
    },
    {
      label: "已签署",
      value: docGroups.find((d) => d.status === "SIGNED")?._count ?? 0,
      color: "#4CAF82",
    },
  ];

  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: "超级管理员",
    SUB_ADMIN: "副管理员",
    CLIENT: "咨询客户",
    STUDENT: "学生会员",
    FREE_MEMBER: "免费会员",
  };

  const roleData = roleGroups.map((r) => ({
    label: ROLE_LABEL[r.role] ?? r.role,
    value: r._count,
  }));

  const totalRevenue = successPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          数据报表
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          平台运营统计 — 过去 6 个月
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "总用户", value: allUsers, color: "#F5F5F0" },
          { label: "本期付款", value: successPayments.length, color: "#4CAF82" },
          { label: "本期收入", value: `MYR ${totalRevenue.toFixed(0)}`, color: "#C9A84C" },
          { label: "工具授权", value: toolAccessCount, color: "#A0A09A" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-xs mb-2" style={{ color: "#666660" }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <ReportCharts monthlyData={monthlyData} docData={docData} roleData={roleData} />
    </div>
  );
}
