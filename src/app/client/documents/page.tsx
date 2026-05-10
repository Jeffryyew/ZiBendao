import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "草稿",
  SENT: "已发送",
  SIGNED: "已签署",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#666660",
  SENT: "#C9A84C",
  SIGNED: "#4CAF82",
};

export default async function ClientDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          合约文件
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          您的所有咨询合约 — 点击查看或下载
        </p>
      </div>

      {documents.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
        >
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#F5F5F0" }}>暂无合约文件</h2>
          <p className="text-sm" style={{ color: "#666660" }}>
            您的顾问将在签署咨询协议后为您生成合约文件。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/client/documents/${doc.id}`}
              className="flex items-center justify-between rounded-2xl px-6 py-5 transition-all group"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <div className="flex items-center gap-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)" }}
                >
                  📋
                </div>
                <div>
                  <div className="font-medium text-sm" style={{ color: "#F5F5F0" }}>{doc.title}</div>
                  <div className="text-xs mt-1" style={{ color: "#555550" }}>
                    生成于 {new Date(doc.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${STATUS_COLOR[doc.status] ?? "#666660"}22`,
                    color: STATUS_COLOR[doc.status] ?? "#666660",
                  }}
                >
                  {STATUS_LABEL[doc.status] ?? doc.status}
                </span>
                <span
                  className="text-sm group-hover:text-[#C9A84C] transition-colors hidden sm:block"
                  style={{ color: "#444440" }}
                >
                  查看 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
