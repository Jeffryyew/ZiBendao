import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentAccountsClient from "./StudentAccountsClient";

export default async function AdminStudentAccountsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role as string;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  const accounts = await prisma.offlineStudentAccount.findMany({
    include: {
      linkedUser: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          线下学员账号
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          管理线下课程学员账号，审核并确认成就徽章
        </p>
      </div>
      <StudentAccountsClient accounts={accounts} />
    </div>
  );
}
