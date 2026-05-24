import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import ToolsClient from "./ToolsClient";

export default async function StudentToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <ToolsClient />;
}
