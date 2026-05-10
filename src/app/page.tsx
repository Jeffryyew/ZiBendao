import { getLocale, getT } from "@/lib/i18n";
import { auth } from "../../auth";
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  const [locale, t, session] = await Promise.all([
    getLocale(),
    getT(),
    auth(),
  ]);
  return <HomeClient t={t} locale={locale} isLoggedIn={!!session?.user} />;
}
