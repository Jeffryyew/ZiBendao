import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import FinancialRoadmapTool from "./FinancialRoadmapTool";
import { isAdmin, isGraduate } from "@/lib/roles";

export default async function FinancialRoadmapPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const level = session.user.studentLevel ?? 0;

  const canAccess =
    isAdmin(role) ||
    isGraduate(role) ||
    role === "ENTERPRISE_CLIENT" ||
    (role === "ONLINE_STUDENT" && level >= 1);

  if (!canAccess) redirect("/dashboard");

  return <FinancialRoadmapTool />;
}
