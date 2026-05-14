import { getLocale } from "@/lib/i18n";
import BreakevenAnalysisTool from "@/components/tools/BreakevenAnalysisTool";

export default async function BreakevenAnalysisPage() {
  const locale = await getLocale();
  return <BreakevenAnalysisTool locale={locale} />;
}
