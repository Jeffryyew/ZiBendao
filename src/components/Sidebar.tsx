"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/actions/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  highlight?: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  userName: string;
  userEmail: string;
  roleLabel: string;
  accentColor?: string;
}

export default function Sidebar({
  navItems,
  userName,
  userEmail,
  roleLabel,
  accentColor = "#C9A84C",
}: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeItem = navItems.find(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  const accentAlpha = (a: number) => {
    const hex = accentColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const navList = (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: item.highlight
                ? accentAlpha(0.1)
                : isActive
                ? "#1A1A1A"
                : "transparent",
              color: item.highlight ? accentColor : isActive ? "#F5F5F0" : "#808080",
              border: item.highlight
                ? `1px solid ${accentAlpha(0.2)}`
                : isActive
                ? "1px solid #252525"
                : "1px solid transparent",
            }}
          >
            <span className="text-base w-5 text-center flex-shrink-0 leading-none">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {isActive && !item.highlight && (
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const userFooter = (
    <div className="px-3 pb-4 pt-2 border-t space-y-1" style={{ borderColor: "#1A1A1A" }}>
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
        style={{ backgroundColor: "#151515" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: accentAlpha(0.18), color: accentColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>{userName}</div>
          <div className="text-xs truncate" style={{ color: "#555550" }}>{roleLabel}</div>
        </div>
      </div>
      <Link
        href="/"
        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors"
        style={{ color: "#555550" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#A0A09A";
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#151515";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#555550";
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
        }}
      >
        <span className="w-5 text-center text-base">⌂</span>
        主页
      </Link>
      <form action={logout} className="w-full">
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left"
          style={{ color: "#555550" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#EF4444";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#555550";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <span className="w-5 text-center">↩</span>
          退出登录
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 z-40"
        style={{ backgroundColor: "#0B0B0B", borderRight: "1px solid #1A1A1A" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "#1A1A1A" }}>
          <Link href="/" className="flex items-baseline gap-2">
            <span
              className="text-xl font-bold tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: accentColor }}
            >
              资本道
            </span>
            <span className="text-xs" style={{ color: "#383835" }}>ZiBenDao</span>
          </Link>
          <div
            className="mt-2 text-xs px-2 py-0.5 rounded-full inline-block"
            style={{ backgroundColor: accentAlpha(0.1), color: accentColor }}
          >
            {roleLabel}
          </div>
        </div>

        {navList}
        {userFooter}
      </aside>

      {/* ── Mobile top bar ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4"
        style={{ backgroundColor: "#0B0B0B", borderBottom: "1px solid #1A1A1A" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-lg font-bold flex-shrink-0"
            style={{ fontFamily: "var(--font-display)", color: accentColor }}
          >
            资本道
          </span>
          {activeItem && (
            <>
              <span style={{ color: "#2A2A2A" }}>/</span>
              <span className="text-sm truncate" style={{ color: "#A0A09A" }}>
                {activeItem.icon} {activeItem.label}
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg flex-shrink-0"
          style={{ backgroundColor: "#1A1A1A" }}
          aria-label="打开菜单"
        >
          <span className="w-4 h-0.5 rounded" style={{ backgroundColor: "#A0A09A" }} />
          <span className="w-4 h-0.5 rounded" style={{ backgroundColor: "#A0A09A" }} />
          <span className="w-3 h-0.5 rounded" style={{ backgroundColor: "#A0A09A" }} />
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      <div
        className="md:hidden fixed inset-0 z-50 transition-all duration-200"
        style={{
          pointerEvents: open ? "auto" : "none",
          opacity: open ? 1 : 0,
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", opacity: open ? 1 : 0 }}
          onClick={() => setOpen(false)}
        />

        {/* Drawer panel */}
        <aside
          className="absolute left-0 top-0 h-full w-72 flex flex-col transition-transform duration-200"
          style={{
            backgroundColor: "#0B0B0B",
            transform: open ? "translateX(0)" : "translateX(-100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer header */}
          <div
            className="flex items-center justify-between px-5 py-5 border-b flex-shrink-0"
            style={{ borderColor: "#1A1A1A" }}
          >
            <div>
              <Link href="/" className="flex items-baseline gap-2">
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: accentColor }}
                >
                  资本道
                </span>
              </Link>
              <div
                className="mt-1 text-xs px-2 py-0.5 rounded-full inline-block"
                style={{ backgroundColor: accentAlpha(0.1), color: accentColor }}
              >
                {roleLabel}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm flex-shrink-0"
              style={{ backgroundColor: "#1A1A1A", color: "#808080" }}
              aria-label="关闭菜单"
            >
              ✕
            </button>
          </div>

          {/* Drawer nav */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium"
                    style={{
                      backgroundColor: item.highlight
                        ? accentAlpha(0.1)
                        : isActive
                        ? "#1A1A1A"
                        : "transparent",
                      color: item.highlight ? accentColor : isActive ? "#F5F5F0" : "#808080",
                      border: item.highlight
                        ? `1px solid ${accentAlpha(0.2)}`
                        : isActive
                        ? "1px solid #252525"
                        : "1px solid transparent",
                    }}
                  >
                    <span className="text-lg w-6 text-center flex-shrink-0 leading-none">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && !item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                    )}
                  </Link>
                );
              })}
            </nav>
            {userFooter}
          </div>
        </aside>
      </div>
    </>
  );
}
