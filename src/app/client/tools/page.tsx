import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const TOOL_ICONS: Record<string, string> = {
  "financial-roadmap": "FV",
  "pricing-system": "QT",
  "market-cap": "PE",
  "pat-kpi": "KPI",
};

const TOOL_LABELS: Record<string, string> = {
  "financial-roadmap": "金融路线图方程式",
  "pricing-system": "产品服务报价系统",
  "market-cap": "市值/市盈率计算器",
  "pat-kpi": "T04 企业经营绩效模拟系统",
};

export default async function ClientToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const toolAccess = await prisma.clientToolAccess.findMany({
    where: { userId: session.user.id },
    include: { tool: true },
    orderBy: { grantedAt: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          计算工具
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          您的专属授权工具 — 由顾问为您开通
        </p>
      </div>

      {toolAccess.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
        >
          <div className="text-2xl mb-4" style={{ color: "#555550" }}>暂无授权</div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#F5F5F0" }}>暂无授权工具</h2>
          <p className="text-sm" style={{ color: "#666660" }}>
            请联系您的资本道顾问开通相应工具权限。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {toolAccess.map(({ tool, grantedAt }) => {
            const icon = TOOL_ICONS[tool.slug] ?? "工具";
            const label = TOOL_LABELS[tool.slug] ?? tool.name;
            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="rounded-2xl p-6 flex flex-col gap-4 transition-all group"
                style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{icon}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: "rgba(107,143,212,0.15)", color: "#6B8FD4" }}
                  >
                    已授权
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: "#F5F5F0" }}>{label}</div>
                  <div className="text-xs" style={{ color: "#666660" }}>{tool.description}</div>
                </div>
                <div
                  className="text-xs pt-3 border-t flex items-center justify-between"
                  style={{ borderColor: "#1A1A1A", color: "#444440" }}
                >
                  <span>授权日期：{new Date(grantedAt).toLocaleDateString("zh-CN")}</span>
                  <span
                    className="group-hover:text-[#6B8FD4] transition-colors"
                    style={{ color: "#555550" }}
                  >
                    进入工具 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
