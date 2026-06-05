import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/tools/snapshot?toolSlug=xxx&companyId=yyy
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const toolSlug = searchParams.get("toolSlug");
  const companyId = searchParams.get("companyId");

  if (!toolSlug || !companyId) {
    return NextResponse.json({ error: "toolSlug and companyId required" }, { status: 400 });
  }

  const snapshot = await prisma.toolSnapshot.findUnique({
    where: {
      userId_companyId_toolSlug: {
        userId: session.user.id,
        companyId,
        toolSlug,
      },
    },
  });

  return NextResponse.json(snapshot ?? null);
}

// POST /api/tools/snapshot
// body: { toolSlug, companyId, data }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { toolSlug, companyId, data } = body as {
    toolSlug: string;
    companyId: string;
    data: Record<string, unknown>;
  };

  if (!toolSlug || !companyId || !data) {
    return NextResponse.json({ error: "toolSlug, companyId and data required" }, { status: 400 });
  }

  const snapshot = await prisma.toolSnapshot.upsert({
    where: {
      userId_companyId_toolSlug: {
        userId: session.user.id,
        companyId,
        toolSlug,
      },
    },
    create: {
      userId: session.user.id,
      companyId,
      toolSlug,
      data,
    },
    update: { data },
  });

  return NextResponse.json(snapshot);
}
