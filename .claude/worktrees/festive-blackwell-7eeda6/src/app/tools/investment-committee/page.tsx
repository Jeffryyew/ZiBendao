import { getLocale } from "@/lib/i18n";
import InvestmentCommitteeTool from "@/components/tools/InvestmentCommitteeTool";

export default async function Page() {
  const locale = await getLocale();
  return <InvestmentCommitteeTool locale={locale} />;
}
