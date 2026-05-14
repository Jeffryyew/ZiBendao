import { getLocale } from "@/lib/i18n";
import DueDiligenceTool from "@/components/tools/DueDiligenceTool";

export default async function Page() {
  const locale = await getLocale();
  return <DueDiligenceTool locale={locale} />;
}
