import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;

  if (role === "SUPER_ADMIN" || role === "ADMIN") redirect("/admin");
  if (role === "ENTERPRISE_CLIENT") redirect("/client/dashboard");
  redirect("/student/dashboard");
}
