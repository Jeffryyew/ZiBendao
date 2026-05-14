import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const TOOL_ICON: Record<string, string> = {
  "financial-roadmap": "FV",
  "pricing-system": "QT",
  "market-cap": "PE",
  "pat-kpi": "KPI",
};

const DOC_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT:  { label: "草稿",   color: "#666660" },
  SENT:   { label: "已发送", color: "#C9A84C" },
  SIGNED: { label: "已签署", color: "#4CAF82" },
};

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? session.user.name ?? "用户";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

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

  const signedCount = documents.filter((d) => d.status === "SIGNED").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-7">

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
          style={{ backgroundColor: "rgba(107,143,212,0.12)", border: "1px solid rgba(107,143,212,0.3)", color: "#6B8FD4" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#6B8FD4" }} />
          企业顾问客户
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "合约文件", value: String(documents.length), unit: "份", icon: "DOC", href: "/client/documents" },
          { label: "已签署",   value: String(signedCount),        unit: "份", icon: "✓", href: "/client/documents" },
          { label: "授权工具", value: String(toolAccess.length),  unit: "个", icon: "工具", href: "/client/tools" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="p-4 rounded-2xl text-center transition-all"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-xl font-bold font-mono" style={{ color: "#6B8FD4" }}>
              {s.value}
              <span className="text-xs font-normal ml-0.5" style={{ color: "#555550" }}>{s.unit}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: "#555550" }}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* ── Recent Documents ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm tracking-wide" style={{ color: "#A0A09A" }}>
            最近合约文件
          </h2>
          <Link href="/client/documents" className="text-xs transition-colors" style={{ color: "#6B8FD4" }}>
            查看全部 →
          </Link>
        </div>

        {documents.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: "#0D0D0D", border: "1px dashed #1E1E1E" }}
          >
            <div className="text-sm mb-3" style={{ color: "#555550" }}>暂无文件</div>
            <p className="text-sm mb-1" style={{ color: "#555550" }}>暂无合约文件</p>
            <p className="text-xs" style={{ color: "#333330" }}>顾问将为您生成定制合约文件</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const status = DOC_STATUS[doc.status] ?? { label: doc.status, color: "#666660" };
              return (
                <Link
                  key={doc.id}
                  href={`/client/documents/${doc.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono flex-shrink-0"
                    style={{ backgroundColor: "#1A1A1A", color: "#666660" }}
                  >
                    DOC
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>
                      {doc.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#444440" }}>
                      {new Date(doc.createdAt).toLocaleDateString("zh-CN")}
                    </div>
                  </div>
                  <span
                    className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${status.color}18`,
                      color: status.color,
                      border: `1px solid ${status.color}30`,
                    }}
                  >
                    {status.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Authorized Tools ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm tracking-wide" style={{ color: "#A0A09A" }}>
            授权计算工具
          </h2>
          {toolAccess.length > 0 && (
            <Link href="/client/tools" className="text-xs transition-colors" style={{ color: "#6B8FD4" }}>
              前往使用 →
            </Link>
          )}
        </div>

        {toolAccess.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: "#0D0D0D", border: "1px dashed #1E1E1E" }}
          >
            <div className="text-sm mb-3" style={{ color: "#555550" }}>暂无授权</div>
            <p className="text-sm mb-1" style={{ color: "#555550" }}>暂无授权工具</p>
            <p className="text-xs" style={{ color: "#333330" }}>联系顾问为您开通专业工具访问权限</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {toolAccess.map(({ tool }) => (
              <Link
                key={tool.id}
                href={`/client/tools`}
                className="flex items-center gap-3 p-4 rounded-xl transition-all"
                style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: "rgba(107,143,212,0.1)", border: "1px solid rgba(107,143,212,0.2)" }}
                >
                  {TOOL_ICON[tool.slug] ?? "工具"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>{tool.name}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: "#444440" }}>{tool.description}</div>
                </div>
                <span style={{ color: "#6B8FD4", fontSize: "0.75rem" }}>→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Contact Advisor CTA ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, #111218 0%, #141520 100%)",
          border: "1px solid rgba(107,143,212,0.2)",
          boxShadow: "0 0 40px rgba(107,143,212,0.04)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: "radial-gradient(circle at 90% 50%, rgba(107,143,212,0.06) 0%, transparent 60%)" }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(107,143,212,0.1)", color: "#6B8FD4", border: "1px solid rgba(107,143,212,0.2)" }}>
                专属服务
              </span>
            </div>
            <h2 className="text-base font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              需要顾问协助？
            </h2>
            <p className="text-sm" style={{ color: "#666660" }}>
              您的专属顾问随时为您提供财务规划与策略咨询服务。
            </p>
          </div>
          <a
            href="mailto:advisor@zibendao.com"
            className="relative flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #4A6FB8, #6B8FD4)", color: "#F0F4FF" }}
          >
            联系顾问 →
          </a>
        </div>
      </div>

    </div>
  );
}
