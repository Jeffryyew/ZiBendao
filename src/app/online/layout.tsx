import type { ReactNode } from "react";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function OnlineLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
