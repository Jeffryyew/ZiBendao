import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar, { NavItem } from "@/components/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { label: "主页", href: "/client/dashboard", icon: "⊕" },
  { label: "计算工具", href: "/client/tools", icon: "🧮" },
  { label: "合约文件", href: "/client/documents", icon: "📄" },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <Sidebar
        navItems={NAV_ITEMS}
        userName={session.user.name}
        userEmail={session.user.email}
        roleLabel="咨询客户"
      />
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
