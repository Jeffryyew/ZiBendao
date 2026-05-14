import { getLocale } from "@/lib/i18n";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const locale = await getLocale();
  return <LoginClient locale={locale} />;
}
