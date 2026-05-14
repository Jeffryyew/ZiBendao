import { getLocale } from "@/lib/i18n";
import DealFlowTool from "@/components/tools/DealFlowTool";

export default async function Page() {
  const locale = await getLocale();
  return <DealFlowTool locale={locale} />;
}
