import { getLocale } from "@/lib/i18n";
import IncomeStatementTool from "@/components/tools/IncomeStatementTool";

export default async function IncomeStatementPage() {
  const locale = await getLocale();
  return <IncomeStatementTool locale={locale} />;
}
