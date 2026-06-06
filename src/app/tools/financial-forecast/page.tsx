import { getLocale } from "@/lib/i18n";
import FinancialForecastTool from "@/components/tools/FinancialForecastTool";

export default async function Page() {
  const locale = await getLocale();
  return <FinancialForecastTool locale={locale} />;
}
