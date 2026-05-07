import { getLocale, getT } from "@/lib/i18n";
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getT();
  return <HomeClient t={t} locale={locale} />;
}
