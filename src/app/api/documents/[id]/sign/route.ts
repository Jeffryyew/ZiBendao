import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.signatureData || typeof body.signatureData !== "string") {
    return NextResponse.json({ error: "Missing signature data" }, { status: 400 });
  }

  // Max ~500KB base64 sanity check
  if (body.signatureData.length > 700_000) {
    return NextResponse.json({ error: "Signature too large" }, { status: 400 });
  }

  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (doc.status === "SIGNED") return NextResponse.json({ error: "Already signed" }, { status: 409 });

  await prisma.document.update({
    where: { id },
    data: {
      signatureData: body.signatureData,
      signedAt: new Date(),
      status: "SIGNED",
    },
  });

  return NextResponse.json({ ok: true });
}
