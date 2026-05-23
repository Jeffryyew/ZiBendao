import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendContractEmail } from "@/lib/email";
import { isAdmin } from "@/lib/roles";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role as string;
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.clientId || !body?.title || !body?.content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const client = await prisma.user.findFirst({
    where: { id: body.clientId, role: "ENTERPRISE_CLIENT" },
  });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const document = await prisma.document.create({
    data: {
      userId: body.clientId,
      title: body.title,
      content: { text: body.content },
      status: "SENT",
    },
  });

  sendContractEmail(client.email, client.name, body.title, document.id).catch(() => {});

  return NextResponse.json({ id: document.id }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role as string;
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const documents = await prisma.document.findMany({
    where: clientId ? { userId: clientId } : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}
