import { getLocale } from "@/lib/i18n";
import StoreExpansionTool from "@/components/tools/StoreExpansionTool";

export default async function Page() {
  const locale = await getLocale();
  return <StoreExpansionTool locale={locale} />;
}
