import { getLocale } from "@/lib/i18n";
import FundraisingSystemTool from "@/components/tools/FundraisingSystemTool";

export default async function Page() {
  const locale = await getLocale();
  return <FundraisingSystemTool locale={locale} />;
}
