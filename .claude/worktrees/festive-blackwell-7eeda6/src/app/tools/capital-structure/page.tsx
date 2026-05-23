import { getLocale } from "@/lib/i18n";
import CapitalStructureTool from "@/components/tools/CapitalStructureTool";

export default async function Page() {
  const locale = await getLocale();
  return <CapitalStructureTool locale={locale} />;
}
