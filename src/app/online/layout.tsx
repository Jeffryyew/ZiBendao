import type { ReactNode } from "react";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { BadgeProvider } from "@/context/BadgeContext";
import { BadgeUnlockModal } from "@/components/badges/BadgeUnlockModal";

export default async function OnlineLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <BadgeProvider>
      <div style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
        {children}
        <BadgeUnlockModal />
      </div>
    </BadgeProvider>
  );
}
