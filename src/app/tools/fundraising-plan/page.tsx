import { getLocale } from "@/lib/i18n";
import FundraisingPlanTool from "@/components/tools/FundraisingPlanTool";

export default async function Page() {
  const locale = await getLocale();
  return <FundraisingPlanTool locale={locale} />;
}
