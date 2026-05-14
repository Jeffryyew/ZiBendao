import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import Sidebar, { NavItem } from "@/components/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { label: "主页", href: "/member/dashboard", icon: "⊕" },
  { label: "学习中心", href: "/member/learn" },
  { label: "工具讲解", href: "/tools/guide" },
  { label: "了解课程", href: "/courses", highlight: true },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "FREE_MEMBER") redirect("/dashboard");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <Sidebar
        navItems={NAV_ITEMS}
        userName={session.user.name}
        userEmail={session.user.email}
        roleLabel="免费会员"
      />
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
