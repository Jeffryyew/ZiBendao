import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = { DRAFT: "草稿", SENT: "已发送", SIGNED: "已签署" };
const STATUS_COLOR: Record<string, string> = { DRAFT: "#666660", SENT: "#C9A84C", SIGNED: "#4CAF82" };

export default async function AdminContractsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const documents = await prisma.document.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
            合约管理
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
            共 {documents.length} 份合约文件
          </p>
        </div>
        <Link
          href="/admin/contracts/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          + 生成新合约
        </Link>
      </div>

      {documents.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
        >
          <div className="text-5xl mb-4">📄</div>
          <p className="text-sm" style={{ color: "#666660" }}>暂无合约，点击右上角生成第一份。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-2xl px-6 py-4"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">📋</span>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{doc.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#555550" }}>
                    {doc.user.name} ({doc.user.email}) · {new Date(doc.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${STATUS_COLOR[doc.status] ?? "#666660"}22`,
                  color: STATUS_COLOR[doc.status] ?? "#666660",
                }}
              >
                {STATUS_LABEL[doc.status] ?? doc.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
