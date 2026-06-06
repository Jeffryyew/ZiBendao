import { getLocale } from "@/lib/i18n";
import ValuationTool from "@/components/tools/ValuationTool";

export default async function Page() {
  const locale = await getLocale();
  return <ValuationTool locale={locale} />;
}
