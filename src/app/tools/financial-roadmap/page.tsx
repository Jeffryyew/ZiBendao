import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import FinancialRoadmapTool from "./FinancialRoadmapTool";

export default async function FinancialRoadmapPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, studentLevel } = session.user;
  const level = studentLevel ?? 0;

  const canAccess =
    role === "SUPER_ADMIN" ||
    role === "SUB_ADMIN" ||
    role === "CLIENT" ||
    (role === "STUDENT" && level >= 1);

  if (!canAccess) redirect("/dashboard");

  return <FinancialRoadmapTool />;
}
