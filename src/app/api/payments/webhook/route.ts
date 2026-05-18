import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendPaymentConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const COURSE_ROLE: Record<string, "ZIBENTONG_GRAD" | "QIDONG_GRAD" | "ZIBENDAO_GRAD" | "ONLINE_STUDENT"> = {
  "capital-map":  "ZIBENTONG_GRAD",
  "capital-code": "QIDONG_GRAD",
  "capital-dao":  "ZIBENDAO_GRAD",
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return NextResponse.json({ error: "No userId in metadata" }, { status: 400 });

    const course = session.metadata?.course ?? "capital-map";
    const role = COURSE_ROLE[course] ?? "ONLINE_STUDENT";

    const amount = (session.amount_total ?? 0) / 100;
    const currency = (session.currency ?? "myr").toUpperCase();

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role, studentLevel: 1 },
      }),
      prisma.payment.create({
        data: {
          userId,
          amount,
          currency,
          status: "SUCCESS",
          provider: "stripe",
          metadata: { stripeSessionId: session.id, course },
        },
      }),
    ]);

    sendPaymentConfirmationEmail(
      user.email,
      user.name ?? user.email.split("@")[0],
      amount.toFixed(2),
      currency,
    ).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
