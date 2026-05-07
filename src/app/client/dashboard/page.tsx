import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [documents, toolAccess] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.clientToolAccess.findMany({
      where: { userId },
      include: { tool: true },
    }),
  ]);

  const docStatusLabel: Record<string, string> = {
    DRAFT: "草稿",
    SENT: "已发送",
    SIGNED: "已签署",
  };

  const docStatusColor: Record<string, string> = {
    DRAFT: "#666660",
    SENT: "#C9A84C",
    SIGNED: "#4CAF82",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          欢迎回来，{session.user.name}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          资本道咨询客户门户 · ZiBenDao Client Portal
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "合约文件", value: documents.length, sub: "份文件", href: "/client/documents" },
          { label: "已签署", value: documents.filter((d) => d.status === "SIGNED").length, sub: "份合约", href: "/client/documents" },
          { label: "授权工具", value: toolAccess.length, sub: "个工具", href: "/client/tools" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl p-5 transition-colors group"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-xs mb-3 font-medium" style={{ color: "#666660" }}>{card.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: "#C9A84C" }}>{card.value}</span>
              <span className="text-sm" style={{ color: "#A0A09A" }}>{card.sub}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "#F5F5F0" }}>最近合约文件</h2>
          <Link href="/client/documents" className="text-xs" style={{ color: "#C9A84C" }}>
            查看全部 →
          </Link>
        </div>

        {documents.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-3xl mb-3">📄</div>
            <p className="text-sm" style={{ color: "#666660" }}>暂无合约文件，请联系顾问为您生成。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/client/documents/${doc.id}`}
                className="flex items-center justify-between rounded-xl px-5 py-4 transition-colors"
                style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">📋</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{doc.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#555550" }}>
                      {new Date(doc.createdAt).toLocaleDateString("zh-CN")}
                    </div>
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${docStatusColor[doc.status]}22`,
                    color: docStatusColor[doc.status],
                  }}
                >
                  {docStatusLabel[doc.status] ?? doc.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Authorized tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "#F5F5F0" }}>授权计算工具</h2>
          <Link href="/client/tools" className="text-xs" style={{ color: "#C9A84C" }}>
            前往使用 →
          </Link>
        </div>

        {toolAccess.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-3xl mb-3">🔒</div>
            <p className="text-sm" style={{ color: "#666660" }}>暂无授权工具，请联系顾问开通权限。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {toolAccess.map(({ tool }) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-4 rounded-xl px-5 py-4"
                style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
              >
                <span className="text-2xl">🧮</span>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#F5F5F0" }}>{tool.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#555550" }}>{tool.description}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
