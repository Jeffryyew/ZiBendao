import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "SUPER_ADMIN" || role === "SUB_ADMIN") redirect("/admin");
  if (role === "CLIENT") redirect("/client/dashboard");
  if (role === "STUDENT") redirect("/student/dashboard");
  redirect("/member/dashboard");
}
