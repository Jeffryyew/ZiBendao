import { getLocale } from "@/lib/i18n";
import CapitalRoadmapTool from "@/components/tools/CapitalRoadmapTool";

export default async function Page() {
  const locale = await getLocale();
  return <CapitalRoadmapTool locale={locale} />;
}
