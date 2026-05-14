import { getLocale } from "@/lib/i18n";
import StartupExpenseTool from "@/components/tools/StartupExpenseTool";

export default async function StartupExpensePage() {
  const locale = await getLocale();
  return <StartupExpenseTool locale={locale} />;
}
