import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import type { LayerId } from "@/lib/capitalModules";
import ToolCard from "./ToolCard";

const LAYER_DISPLAY: Record<LayerId, string> = {
  1: "商业基础层",
  2: "资本成长层",
  3: "资本架构层",
};

export default async function StudentToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const layers = [1, 2, 3] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
          资本工具
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {CAPITAL_MODULES.length} 个专业工具，涵盖商业基础到资本架构
        </p>
      </div>

      <div className="space-y-10">
        {layers.map((layer) => {
          const meta = LAYER_META[layer];
          const modules = getModulesByLayer(layer);

          return (
            <div key={layer}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                >
                  {LAYER_DISPLAY[layer]}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {modules.length} 个工具
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {modules.map((mod) => (
                  <ToolCard
                    key={mod.id}
                    href={mod.href}
                    name={mod.zh.name}
                    desc={mod.zh.desc}
                    accentColor={meta.color}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs mt-10" style={{ color: "var(--color-text-muted)" }}>
        所有计算在浏览器本地完成 · 数据不上传服务器
      </p>
    </div>
  );
}
