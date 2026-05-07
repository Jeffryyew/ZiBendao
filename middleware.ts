import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const isAuthApi = pathname.startsWith("/api/auth");
  const isPublic =
    isAuthApi ||
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

  const role = user.role;

  if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/client") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/member") && role !== "FREE_MEMBER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
