import { getLocale } from "@/lib/i18n";
import PortfolioManagementTool from "@/components/tools/PortfolioManagementTool";

export default async function Page() {
  const locale = await getLocale();
  return <PortfolioManagementTool locale={locale} />;
}
