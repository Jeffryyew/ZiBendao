import Link from "next/link";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";

export default async function CapitalDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getLocale();
  const isEn = locale === "en";
  const layers = [1, 2, 3] as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30"
        style={{ backgroundColor: "rgba(247,244,239,0.95)", borderBottom: "1px solid #E0D9CE", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="text-sm transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← {isEn ? "Back" : "返回"}
          </Link>
          <span style={{ color: "#D8D1C6" }}>·</span>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--color-text-primary)" }}>
            {isEn ? "Capital Operating System" : "企业资本操作系统"}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0"
            style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            {CAPITAL_MODULES.length} {isEn ? "Modules" : "模块"}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Capital Operating System
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            {isEn ? "Capital Command Centre" : "资本指挥中心"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {isEn
              ? "22 professional capital tools across 3 strategic layers — foundations, intelligence, and structure."
              : "22 个专业资本工具，三层战略体系 — 基础、智慧与架构。"}
          </p>
        </div>

        {/* Layer sections */}
        <div className="space-y-14">
          {layers.map((layer) => {
            const meta = LAYER_META[layer];
            const modules = getModulesByLayer(layer);
            return (
              <div key={layer}>
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="text-xs font-mono font-bold px-3 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    L{layer}
                  </span>
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
                    {isEn ? meta.en : meta.zh}
                  </h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
                    {modules.length} {isEn ? "tools" : "模块"}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {modules.map((mod) => {
                    const t = isEn ? mod.en : mod.zh;
                    return (
                      <Link
                        key={mod.id}
                        href={mod.href}
                        className="group block rounded-xl p-5 transition-all duration-200 hover:border-[#C9A84C]/40 hover:shadow-sm"
                        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
                      >
                        <div className="text-2xl mb-3">{mod.icon}</div>
                        <div className="text-sm font-semibold mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                          {t.name}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                          {t.desc}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs mt-16" style={{ color: "var(--color-text-muted)" }}>
          {isEn
            ? "All calculations run locally in your browser · Data never uploaded to servers"
            : "所有计算在浏览器本地完成 · 数据不上传服务器"}
        </p>
      </div>
    </div>
  );
}
