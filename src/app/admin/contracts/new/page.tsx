import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContractForm from "./ContractForm";

export default async function NewContractPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") redirect("/dashboard");

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <a href="/admin/contracts" className="text-xs" style={{ color: "#666660" }}>
          ← 返回合约列表
        </a>
        <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
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
