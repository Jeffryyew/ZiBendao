import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import { getLocale } from "@/lib/i18n";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import type { LayerId } from "@/lib/capitalModules";

const LAYER_DISPLAY: Record<LayerId, { zh: string; en: string }> = {
  1: { zh: "资本基础", en: "Capital Foundations" },
  2: { zh: "资本智慧", en: "Capital Intelligence" },
  3: { zh: "资本架构", en: "Capital Structure" },
};

export default async function ToolsPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const layers = [1, 2, 3] as const;

  return (
    <div style={{ backgroundColor: "#F7F4EF", color: "#1C1814", minHeight: "100vh" }}>
      <SharedNav locale={locale} activeHref="/tools" />

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-6"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.15)", color: "#8B6514" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
            {CAPITAL_MODULES.length} {isEn ? "Professional Tools" : "个专业工具"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {isEn ? "Capital Tools" : "资本工具"}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#68625C" }}>
            {isEn
              ? "Professional tools covering financial analysis, fundraising, equity structure and capital governance. All calculations run locally in your browser."
              : "涵盖财务分析、融资、股权架构与资本治理的专业工具套件。所有计算在浏览器本地完成。"}
          </p>
        </div>

        {/* Tools by layer */}
        <div className="space-y-14">
          {layers.map((layer) => {
            const meta = LAYER_META[layer];
            const modules = getModulesByLayer(layer);
            const display = LAYER_DISPLAY[layer];

            return (
              <div key={layer}>
                {/* Layer header */}
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-base font-bold" style={{ color: "#1C1814", fontFamily: "var(--font-display)" }}>
                    {isEn ? display.en : display.zh}
                  </h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "#9A9490" }}>
                    {modules.length} {isEn ? "tools" : "个工具"}
                  </span>
                </div>

                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {modules.map((mod) => {
                    const t = isEn ? mod.en : mod.zh;
                    return (
                      <Link
                        key={mod.id}
                        href={mod.href}
                        className="group rounded-2xl p-5 flex flex-col relative overflow-hidden transition-all duration-200"
                        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = meta.color + "60";
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FDFCF9";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E0D9CE";
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FFFFFF";
                        }}
                      >
                        <div
                          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: meta.color, opacity: 0.5 }}
                        />
                        <div className="text-sm font-semibold mb-2 mt-1" style={{ color: "#1C1814" }}>
                          {t.name}
                        </div>
                        <p className="text-xs leading-relaxed flex-1" style={{ color: "#68625C" }}>
                          {t.desc}
                        </p>
                        <div className="mt-4 text-xs font-medium" style={{ color: meta.color }}>
                          {isEn ? "Open →" : "使用 →"}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-16" style={{ color: "#9A9490" }}>
          {isEn
            ? "All calculations run locally in your browser · Data never uploaded to servers"
            : "所有计算在浏览器本地完成 · 数据不上传服务器"}
        </p>
      </div>
    </div>
  );
}
