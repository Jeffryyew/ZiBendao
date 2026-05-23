import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = { DRAFT: "草稿", SENT: "已发送", SIGNED: "已签署" };
const STATUS_COLOR: Record<string, string> = { DRAFT: "#666660", SENT: "#C9A84C", SIGNED: "#4CAF82" };

export default async function AdminContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  const { status } = await searchParams;

  const documents = await prisma.document.findMany({
    where: status ? { status: status as never } : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const allCounts = await prisma.document.groupBy({ by: ["status"], _count: true });
  const countByStatus = Object.fromEntries(allCounts.map((r) => [r.status, r._count]));
  const totalCount = allCounts.reduce((s, r) => s + r._count, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            合约管理
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
            共 {totalCount} 份合约文件{status ? `（筛选: ${STATUS_LABEL[status] ?? status}）` : ""}
          </p>
        </div>
        <Link
          href="/admin/contracts/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
        >
          + 生成新合约
        </Link>
      </div>

      {/* Status summary + filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/contracts"
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: !status ? "rgba(201,168,76,0.15)" : "#111111",
            color: !status ? "#C9A84C" : "#666660",
            border: `1px solid ${!status ? "rgba(201,168,76,0.3)" : "#1A1A1A"}`,
          }}
        >
          全部 ({totalCount})
        </Link>
        {["DRAFT", "SENT", "SIGNED"].map((s) => {
          const active = status === s;
          const color = STATUS_COLOR[s];
          return (
            <Link
              key={s}
              href={`/admin/contracts?status=${s}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: active ? `${color}18` : "#111111",
                color: active ? color : "#666660",
                border: `1px solid ${active ? `${color}35` : "#1A1A1A"}`,
              }}
            >
              {STATUS_LABEL[s]} ({countByStatus[s] ?? 0})
            </Link>
          );
        })}
      </div>

      {/* List */}
      {documents.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#0D0D0D", border: "1px dashed #1E1E1E" }}
        >
          <div className="text-sm mb-4" style={{ color: "#555550" }}>暂无合约</div>
          <p className="text-sm mb-1" style={{ color: "#555550" }}>
            {status ? `暂无${STATUS_LABEL[status] ?? status}合约` : "暂无合约，点击右上角生成第一份。"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const color = STATUS_COLOR[doc.status] ?? "#666660";
            return (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono flex-shrink-0"
                  style={{ backgroundColor: "#1A1A1A", color: "#666660" }}
                >
                  合约
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>
                    {doc.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#444440" }}>
                    {doc.user.name} · {doc.user.email} · {new Date(doc.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${color}18`,
                    color,
                    border: `1px solid ${color}35`,
                  }}
                >
                  {STATUS_LABEL[doc.status] ?? doc.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
