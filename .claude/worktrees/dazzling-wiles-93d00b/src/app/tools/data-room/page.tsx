import { getLocale } from "@/lib/i18n";
import DataRoomTool from "@/components/tools/DataRoomTool";

export default async function Page() {
  const locale = await getLocale();
  return <DataRoomTool locale={locale} />;
}
