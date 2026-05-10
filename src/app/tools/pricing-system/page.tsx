import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import PricingSystemTool from "./PricingSystemTool";
import { isAdmin, isGraduate } from "@/lib/roles";

export default async function PricingSystemPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const level = session.user.studentLevel ?? 0;

  const canAccess =
    isAdmin(role) ||
    isGraduate(role) ||
    role === "ENTERPRISE_CLIENT" ||
    (role === "ONLINE_STUDENT" && level >= 2);

  if (!canAccess) redirect("/dashboard");

  return <PricingSystemTool />;
}
