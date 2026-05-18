import { NextResponse } from "next/server";
import { Resend } from "resend";

const COURSE_NAMES: Record<string, { zh: string; en: string }> = {
  "capital-map":  { zh: "资本通 · 阶段一", en: "The Capital Map · Stage 1" },
  "capital-code": { zh: "启动资本 · 阶段二", en: "The Capital Code · Stage 2" },
  "capital-dao":  { zh: "资本道 · 阶段三", en: "Capital Dao · Stage 3" },
};

const ADMIN_EMAIL = "jeffryyew@gmail.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM ?? "资本道 ZiBenDao <noreply@zibendao.com>";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { name, email, phone, company, course, message } = body as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !course?.trim()) {
    return NextResponse.json({ error: "缺少必填项" }, { status: 400 });
  }

  const courseLabel = COURSE_NAMES[course]?.zh ?? course;
  const resend = getResend();

  if (resend) {
    await Promise.allSettled([
      // Notify admin
      resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `新课程申请 — ${courseLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;background:#F7F4EF;border-radius:16px;">
            <h2 style="color:#1C1814;margin:0 0 4px;font-size:20px;">新课程申请</h2>
            <p style="color:#9A9490;margin:0 0 24px;font-size:13px;">${courseLabel}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:10px 0;color:#9A9490;width:90px;">姓名</td><td style="padding:10px 0;color:#1C1814;font-weight:600;">${name}</td></tr>
              <tr style="border-top:1px solid #E0D9CE;"><td style="padding:10px 0;color:#9A9490;">邮箱</td><td style="padding:10px 0;color:#1C1814;">${email}</td></tr>
              <tr style="border-top:1px solid #E0D9CE;"><td style="padding:10px 0;color:#9A9490;">手机</td><td style="padding:10px 0;color:#1C1814;">${phone || "—"}</td></tr>
              <tr style="border-top:1px solid #E0D9CE;"><td style="padding:10px 0;color:#9A9490;">公司</td><td style="padding:10px 0;color:#1C1814;">${company || "—"}</td></tr>
              ${message ? `<tr style="border-top:1px solid #E0D9CE;"><td style="padding:10px 0;color:#9A9490;vertical-align:top;">留言</td><td style="padding:10px 0;color:#1C1814;">${message}</td></tr>` : ""}
            </table>
          </div>
        `,
      }),
      // Confirm to applicant
      resend.emails.send({
        from: FROM,
        to: email,
        subject: `申请已收到 — ${courseLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;background:#F7F4EF;border-radius:16px;">
            <h2 style="color:#1C1814;margin:0 0 12px;font-size:20px;">你好，${name}！</h2>
            <p style="color:#68625C;line-height:1.8;margin:0 0 16px;">我们已收到您对 <strong style="color:#8B6514;">${courseLabel}</strong> 的报名申请。</p>
            <p style="color:#68625C;line-height:1.8;margin:0 0 24px;">我们的顾问团队将在 1-2 个工作日内通过邮箱或电话与您联系，进一步了解您的需求并安排后续事宜。</p>
            <p style="color:#9A9490;font-size:13px;margin:0;">如有紧急事项，请发邮件至 <a href="mailto:${ADMIN_EMAIL}" style="color:#8B6514;">${ADMIN_EMAIL}</a></p>
          </div>
        `,
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
