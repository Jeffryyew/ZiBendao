import { getLocale } from "@/lib/i18n";
import SpvStructureTool from "@/components/tools/SpvStructureTool";

export default async function Page() {
  const locale = await getLocale();
  return <SpvStructureTool locale={locale} />;
}
