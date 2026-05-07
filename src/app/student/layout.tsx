import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import Sidebar, { NavItem } from "@/components/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { label: "主页", href: "/student/dashboard", icon: "⊕" },
  { label: "学习中心", href: "/student/learn", icon: "📚" },
  { label: "计算工具", href: "/student/tools", icon: "🧮" },
  { label: "个人档案", href: "/student/profile", icon: "👤" },
];

const LEVEL_LABEL: Record<number, string> = {
  1: "L1 学生",
  2: "L2 学生",
  3: "L3 学生",
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const level = session.user.studentLevel ?? 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <Sidebar
        navItems={NAV_ITEMS}
        userName={session.user.name}
        userEmail={session.user.email}
        roleLabel={LEVEL_LABEL[level] ?? "学生"}
      />
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
