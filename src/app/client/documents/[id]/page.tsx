import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrintButton from "./PrintButton";
import Link from "next/link";

export default async function DocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const doc = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!doc) notFound();

  const content = typeof doc.content === "string" ? doc.content : (doc.content as { text?: string })?.text ?? "";
  const signedAt = doc.signedAt ? new Date(doc.signedAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : null;

  const statusLabel: Record<string, string> = { DRAFT: "草稿", SENT: "已发送", SIGNED: "已签署" };
  const statusColor: Record<string, string> = { DRAFT: "#666660", SENT: "#C9A84C", SIGNED: "#4CAF82" };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link
            href="/client/documents"
            className="text-xs mb-2 flex items-center gap-1 transition-colors"
            style={{ color: "#666660" }}
          >
            ← 返回文件列表
          </Link>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
            {doc.title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: "#555550" }}>
              {new Date(doc.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${statusColor[doc.status] ?? "#666660"}22`,
                color: statusColor[doc.status] ?? "#666660",
              }}
            >
              {statusLabel[doc.status] ?? doc.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {doc.status === "SENT" && (
            <Link
              href={`/client/documents/${doc.id}/sign`}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              签署合约
            </Link>
          )}
          <PrintButton />
        </div>
      </div>

      {/* Contract content */}
      <div
        className="rounded-2xl p-8 print:rounded-none print:p-0 print:border-none print:shadow-none"
        style={{ backgroundColor: "#FAFAF8", border: "1px solid #E0E0D8" }}
      >
        <pre
          className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
          style={{ color: "#1A1A1A", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
        >
          {content}
        </pre>
      </div>

      {/* Signature display */}
      {doc.status === "SIGNED" && doc.signatureData && (
        <div
          className="rounded-2xl p-6 print:border print:border-gray-300"
          style={{ backgroundColor: "#111111", border: "1px solid #4CAF8244" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span style={{ color: "#4CAF82" }}></span>
            <span className="text-sm font-medium" style={{ color: "#4CAF82" }}>已电子签署</span>
            {signedAt && <span className="text-xs" style={{ color: "#555550" }}>— {signedAt}</span>}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#FAFAF8", border: "1px solid #E0E0D8" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc.signatureData} alt="客户签名" className="max-h-32 object-contain" />
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-xs text-center print:hidden" style={{ color: "#444440" }}>
        {doc.status === "SENT" ? "请点击「签署合约」完成电子签署。" : "如有任何疑问，请联系您的资本道顾问。"}
      </p>
    </div>
  );
}
