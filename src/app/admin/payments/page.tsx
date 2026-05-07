import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = { PENDING: "待处理", SUCCESS: "成功", FAILED: "失败" };
const STATUS_COLOR: Record<string, string> = { PENDING: "#C9A84C", SUCCESS: "#4CAF82", FAILED: "#EF4444" };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const { status } = searchParams;

  const payments = await prisma.payment.findMany({
    where: status ? { status: status as never } : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalSuccess = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          支付记录
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          共 {payments.length} 笔记录
          {status ? `（筛选: ${STATUS_LABEL[status] ?? status}）` : ""}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "总笔数", value: payments.length, color: "#F5F5F0" },
          { label: "成功笔数", value: payments.filter((p) => p.status === "SUCCESS").length, color: "#4CAF82" },
          { label: "成功金额", value: `MYR ${totalSuccess.toFixed(2)}`, color: "#C9A84C" },
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

      {/* Filter */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A", color: "#F5F5F0" }}
        >
          <option value="">全部状态</option>
          <option value="SUCCESS">成功</option>
          <option value="PENDING">待处理</option>
          <option value="FAILED">失败</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          筛选
        </button>
        {status && (
          <a
            href="/admin/payments"
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
          >
            重置
          </a>
        )}
      </form>

      {/* List */}
      {payments.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
        >
          <div className="text-4xl mb-4">💳</div>
          <p className="text-sm" style={{ color: "#666660" }}>暂无支付记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((pay) => (
            <div
              key={pay.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl px-5 py-4"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{pay.user.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#555550" }}>
                  {pay.user.email} · {pay.provider} · {new Date(pay.createdAt).toLocaleString("zh-CN")}
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>
                    {pay.currency} {pay.amount.toFixed(2)}
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${STATUS_COLOR[pay.status] ?? "#666660"}22`,
                    color: STATUS_COLOR[pay.status] ?? "#666660",
                  }}
                >
                  {STATUS_LABEL[pay.status] ?? pay.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
