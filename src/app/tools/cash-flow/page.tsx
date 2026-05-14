import { getLocale } from "@/lib/i18n";
import CashFlowTool from "@/components/tools/CashFlowTool";

export default async function CashFlowPage() {
  const locale = await getLocale();
  return <CashFlowTool locale={locale} />;
}
