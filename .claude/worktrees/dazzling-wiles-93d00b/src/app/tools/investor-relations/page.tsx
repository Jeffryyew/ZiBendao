import { getLocale } from "@/lib/i18n";
import InvestorRelationsTool from "@/components/tools/InvestorRelationsTool";

export default async function Page() {
  const locale = await getLocale();
  return <InvestorRelationsTool locale={locale} />;
}
