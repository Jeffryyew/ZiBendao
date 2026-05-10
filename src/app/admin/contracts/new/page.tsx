import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContractForm from "./ContractForm";

export default async function NewContractPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  const clients = await prisma.user.findMany({
    where: { role: "ENTERPRISE_CLIENT", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10 space-y-6">
      <div>
        <Link href="/admin/contracts" className="text-xs" style={{ color: "#555550" }}>
          ← 返回合约列表
        </Link>
        <h1 className="text-2xl font-bold mt-3" style={{ fontFamily: "var(--font-display)" }}>
          生成新合约
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>
          为客户生成咨询服务合约，完成后可在客户文件夹中查看。
        </p>
      </div>

      <ContractForm clients={clients} consultantName={session.user.name} />
    </div>
  );
}
