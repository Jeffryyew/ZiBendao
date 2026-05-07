import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import MarketCapTool from "./MarketCapTool";

export default async function MarketCapPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, studentLevel } = session.user;
  const level = studentLevel ?? 0;

  const canAccess =
    role === "SUPER_ADMIN" ||
    role === "SUB_ADMIN" ||
    role === "CLIENT" ||
    (role === "STUDENT" && level >= 2);

  if (!canAccess) redirect("/dashboard");

  return <MarketCapTool />;
}
