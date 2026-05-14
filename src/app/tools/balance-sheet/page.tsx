import { getLocale } from "@/lib/i18n";
import BalanceSheetTool from "@/components/tools/BalanceSheetTool";

export default async function BalanceSheetPage() {
  const locale = await getLocale();
  return <BalanceSheetTool locale={locale} />;
}
