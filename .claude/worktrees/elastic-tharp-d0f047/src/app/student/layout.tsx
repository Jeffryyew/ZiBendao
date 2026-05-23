import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import Sidebar, { NavItem } from "@/components/Sidebar";
import { getRoleLabel, isStudentArea } from "@/lib/roles";

const NAV_ITEMS: NavItem[] = [
  { label: "主页", href: "/student/dashboard", icon: "⊕" },
  { label: "学习中心", href: "/student/learn" },
  { label: "计算工具", href: "/student/tools" },
  { label: "工具讲解", href: "/tools/guide" },
  { label: "个人档案", href: "/student/profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role as string;
  if (!isStudentArea(role)) redirect("/dashboard");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <Sidebar
        navItems={NAV_ITEMS}
        userName={session.user.name}
        userEmail={session.user.email}
        roleLabel={getRoleLabel(role)}
      />
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
