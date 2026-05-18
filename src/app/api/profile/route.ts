import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, phone, company, position, city, bio } = body;

  if (name !== undefined && !String(name).trim()) {
    return NextResponse.json({ error: "姓名不能为空" }, { status: 400 });
  }

  const data: Record<string, string | null> = {};
  if (name !== undefined) data.name = String(name).trim();
  if (phone !== undefined) data.phone = String(phone).trim() || null;
  if (company !== undefined) data.company = String(company).trim() || null;
  if (position !== undefined) data.position = String(position).trim() || null;
  if (city !== undefined) data.city = String(city).trim() || null;
  if (bio !== undefined) data.bio = String(bio).trim() || null;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { name: true, phone: true, company: true, position: true, city: true, bio: true },
  });

  return NextResponse.json(updated);
}
