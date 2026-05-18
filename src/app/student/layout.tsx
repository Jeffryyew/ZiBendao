import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import Sidebar, { NavItem } from "@/components/Sidebar";
import SharedNav from "@/components/SharedNav";
import { getRoleLabel } from "@/lib/roles";
import { getLocale } from "@/lib/i18n";

const NAV_ITEMS: NavItem[] = [
  { label: "学习中心", href: "/student/learn" },
  { label: "资本工具", href: "/student/tools" },
  { label: "个人档案", href: "/student/profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role as string;
  const locale = await getLocale();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="hidden md:block">
        <SharedNav locale={locale} isLoggedIn={true} />
      </div>
      <Sidebar
        navItems={NAV_ITEMS}
        userName={session.user.name}
        userEmail={session.user.email}
        roleLabel={getRoleLabel(role)}
        topOffset={64}
        showFooterActions={false}
        hideBrand={true}
      />
      <main className="md:ml-60 pt-14 md:pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
