"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
}

export default function Sidebar({ navItems, userName, userEmail, roleLabel }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "#1A1A1A" }}>
        <Link href="/" onClick={() => setOpen(false)} className="flex items-baseline gap-2">
          <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
            资本道
          </span>
          <span className="text-xs" style={{ color: "#444440" }}>ZiBenDao</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: item.highlight
                  ? "rgba(201,168,76,0.1)"
                  : isActive
                  ? "#1A1A1A"
                  : "transparent",
                color: item.highlight ? "#C9A84C" : isActive ? "#F5F5F0" : "#A0A09A",
                border: item.highlight ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
              }}
            >
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Sign out */}
      <div className="px-3 py-4 border-t space-y-2" style={{ borderColor: "#1A1A1A" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#1A1A1A" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.2)", color: "#C9A84C" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>{userName}</div>
            <div className="text-xs truncate" style={{ color: "#555550" }}>{roleLabel}</div>
          </div>
        </div>
        <form action={logout} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
            style={{ color: "#666660" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1A1A1A";
              (e.currentTarget as HTMLButtonElement).style.color = "#F5F5F0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#666660";
            }}
          >
            <span className="w-5 text-center">↩</span>
            退出登录
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 z-40"
        style={{ backgroundColor: "#0B0B0B", borderRight: "1px solid #1A1A1A" }}
      >
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4"
        style={{ backgroundColor: "#0B0B0B", borderBottom: "1px solid #1A1A1A" }}
      >
        <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
          资本道
        </span>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg"
          style={{ backgroundColor: "#1A1A1A" }}
          aria-label="打开菜单"
        >
          <span className="w-4 h-0.5 rounded" style={{ backgroundColor: "#A0A09A" }} />
          <span className="w-4 h-0.5 rounded" style={{ backgroundColor: "#A0A09A" }} />
          <span className="w-4 h-0.5 rounded" style={{ backgroundColor: "#A0A09A" }} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.75)" }} />
          <aside
            className="absolute left-0 top-0 h-full w-72 flex flex-col"
            style={{ backgroundColor: "#0B0B0B" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1A1A1A" }}>
              <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
                资本道
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
                style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                      style={{
                        backgroundColor: item.highlight ? "rgba(201,168,76,0.1)" : isActive ? "#1A1A1A" : "transparent",
                        color: item.highlight ? "#C9A84C" : isActive ? "#F5F5F0" : "#A0A09A",
                        border: item.highlight ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
                      }}
                    >
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t space-y-2" style={{ borderColor: "#1A1A1A" }}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#1A1A1A" }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "rgba(201,168,76,0.2)", color: "#C9A84C" }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>{userName}</div>
                    <div className="text-xs truncate" style={{ color: "#555550" }}>{roleLabel}</div>
                  </div>
                </div>
                <form action={logout} className="w-full">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left"
                    style={{ color: "#666660" }}
                  >
                    <span className="w-5 text-center">↩</span>
                    退出登录
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
