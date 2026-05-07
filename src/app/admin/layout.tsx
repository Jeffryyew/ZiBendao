import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar, { NavItem } from "@/components/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { label: "仪表板", href: "/admin", icon: "⊕" },
  { label: "用户管理", href: "/admin/users", icon: "👥" },
  { label: "合约管理", href: "/admin/contracts", icon: "📄" },
  { label: "课程管理", href: "/admin/courses", icon: "📚" },
  { label: "工具管理", href: "/admin/tools", icon: "🧮" },
  { label: "支付记录", href: "/admin/payments", icon: "💳" },
  { label: "数据报表", href: "/admin/reports", icon: "📊" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const roleLabel = role === "SUPER_ADMIN" ? "超级管理员" : "副管理员";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <Sidebar
        navItems={NAV_ITEMS}
        userName={session.user.name}
        userEmail={session.user.email}
        roleLabel={roleLabel}
      />
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
