import { getLocale } from "@/lib/i18n";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  const locale = await getLocale();
  return <RegisterClient locale={locale} />;
}
