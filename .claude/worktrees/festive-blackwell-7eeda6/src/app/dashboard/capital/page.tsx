import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";

export default async function CapitalDashboardPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const layers = [1, 2, 3] as const;

  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh", color: "#F5F5F0" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30"
        style={{ backgroundColor: "rgba(10,10,10,0.95)", borderBottom: "1px solid #1A1A1A", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm transition-colors"
            style={{ color: "#666660" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#A0A09A")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#666660")}
          >
            ← {isEn ? "Back" : "返回"}
          </Link>
          <span style={{ color: "#2A2A2A" }}>·</span>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: "#F5F5F0" }}>
            {isEn ? "Capital Operating System" : "企业资本操作系统"}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
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
            style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.18)", color: "#C9A84C" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Capital Operating System
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {isEn ? "Capital Command Centre" : "资本指挥中心"}
          </h1>
          <p style={{ color: "#A0A09A" }}>
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
                {/* Layer header */}
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="text-xs font-mono font-bold px-3 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    L{layer}
                  </span>
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {isEn ? meta.en : meta.zh}
                  </h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#1A1A1A" }} />
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "#3A3A3A" }}>
                    {modules.length} {isEn ? "tools" : "模块"}
                  </span>
                </div>

                {/* Module grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {modules.map((mod) => {
                    const t = isEn ? mod.en : mod.zh;
                    return (
                      <Link
                        key={mod.id}
                        href={mod.href}
                        className="group block rounded-xl p-5 transition-all duration-200"
                        style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = `${meta.color}50`;
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#181818";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1E1E1E";
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#141414";
                        }}
                      >
                        <div className="text-2xl mb-3">{mod.icon}</div>
                        <div className="text-sm font-semibold mb-1.5" style={{ color: "#F5F5F0" }}>
                          {t.name}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "#666660" }}>
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

        <p className="text-center text-xs mt-16" style={{ color: "#2A2A2A" }}>
          {isEn
            ? "All calculations run locally in your browser · Data never uploaded to servers"
            : "所有计算在浏览器本地完成 · 数据不上传服务器"}
        </p>
      </div>
    </div>
  );
}
