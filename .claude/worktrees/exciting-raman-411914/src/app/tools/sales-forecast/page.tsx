import { getLocale } from "@/lib/i18n";
import SalesForecastTool from "@/components/tools/SalesForecastTool";

export default async function SalesForecastPage() {
  const locale = await getLocale();
  return <SalesForecastTool locale={locale} />;
}
