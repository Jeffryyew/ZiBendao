import Link from "next/link";
import LogoImg from "@/components/LogoImg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n";

interface SharedNavProps {
  locale: Locale;
  activeHref?: string;
  isLoggedIn?: boolean;
}

export default function SharedNav({ locale, activeHref, isLoggedIn }: SharedNavProps) {
  const isZh = locale === "zh";

  const links = [
    { label: isZh ? "首页" : "Home", href: "/" },
    { label: isZh ? "资本课程" : "Courses", href: "/courses" },
    { label: isZh ? "资本工具" : "Tools", href: "/tools" },
    { label: isZh ? "社群" : "Community", href: "/community" },
    { label: isZh ? "关于" : "About", href: "/about" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
      style={{
        backgroundColor: "rgba(13,13,13,0.95)",
        borderBottom: "1px solid #1A1A1A",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link href="/">
        <LogoImg height={32} />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm transition-colors"
            style={{ color: activeHref === item.href ? "#C9A84C" : "#666660" }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right: lang switcher + auth */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher current={locale} />
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
          >
            {isZh ? "进入平台 →" : "Dashboard →"}
          </Link>
        ) : (
          <>
            <Link href="/login" className="hidden sm:block text-sm" style={{ color: "#666660" }}>
              {isZh ? "登录" : "Login"}
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              {isZh ? "免费注册" : "Get Started Free"}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
