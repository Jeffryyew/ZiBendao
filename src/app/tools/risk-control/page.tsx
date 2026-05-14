import { getLocale } from "@/lib/i18n";
import RiskControlTool from "@/components/tools/RiskControlTool";

export default async function Page() {
  const locale = await getLocale();
  return <RiskControlTool locale={locale} />;
}
