import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);
const STUDENT_AREA_ROLES = new Set(["ZIBENTONG_GRAD", "QIDONG_GRAD", "ZIBENDAO_GRAD", "ONLINE_STUDENT"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const isPublic =
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/courses" ||
    pathname === "/tools" ||
    pathname === "/pricing" ||
    pathname === "/about" ||
    pathname.startsWith("/payment");

  if (isPublic) return NextResponse.next();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = user.role as string;

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.has(role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/client") && role !== "ENTERPRISE_CLIENT") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/student") && !STUDENT_AREA_ROLES.has(role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/member") && role !== "FREE_MEMBER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
