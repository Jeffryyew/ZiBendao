import { auth } from "../../../auth";
import { redirect } from "next/navigation";

const STUDENT_AREA_ROLES = new Set(["ZIBENTONG_GRAD", "QIDONG_GRAD", "ZIBENDAO_GRAD", "ONLINE_STUDENT"]);

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;

  if (role === "SUPER_ADMIN" || role === "ADMIN") redirect("/admin");
  if (role === "ENTERPRISE_CLIENT") redirect("/client/dashboard");
  if (STUDENT_AREA_ROLES.has(role)) redirect("/student/dashboard");
  redirect("/member/dashboard");
}
