import { getLocale } from "@/lib/i18n";
import EquityStructureTool from "@/components/tools/EquityStructureTool";

export default async function Page() {
  const locale = await getLocale();
  return <EquityStructureTool locale={locale} />;
}
