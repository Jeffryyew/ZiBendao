import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

const COURSE_PRICE_MAP: Record<string, string | undefined> = {
  "capital-map":  process.env.STRIPE_PRICE_ID_CAPITAL_MAP  ?? process.env.STRIPE_PRICE_ID,
  "capital-code": process.env.STRIPE_PRICE_ID_CAPITAL_CODE ?? process.env.STRIPE_PRICE_ID,
  "capital-dao":  process.env.STRIPE_PRICE_ID_CAPITAL_DAO  ?? process.env.STRIPE_PRICE_ID,
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录后再付款。" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const course = (body?.course as string | undefined) ?? "capital-map";

  const priceId = COURSE_PRICE_MAP[course] ?? process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "未配置付款价格，请联系管理员。" }, { status: 500 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email ?? undefined,
      metadata: { userId: session.user.id, course },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Stripe 未返回付款链接，请重试。" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Stripe 付款创建失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
