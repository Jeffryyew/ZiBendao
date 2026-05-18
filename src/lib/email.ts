import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM ?? "资本道 ZiBenDao <noreply@zibendao.com>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #1A1A1A;">
    <h1 style="margin:0;color:#C9A84C;font-size:22px;letter-spacing:2px;">资本道 ZiBenDao</h1>
  </div>
  ${body}
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1A1A1A;text-align:center;">
    <p style="margin:0;color:#444440;font-size:12px;">© 2025 资本道 ZiBenDao. 保留所有权利。</p>
    <p style="margin:4px 0 0;color:#333330;font-size:11px;">如有疑问，请联系您的顾问。</p>
  </div>
</div>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${href}" style="display:inline-block;background:#C9A84C;color:#0D0D0D;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">${label}</a>
  </div>`;
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const link = `${BASE_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "请验证你的资本道账号邮箱",
    html: wrap(`
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px;">你好，${name}！</h2>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 16px;">感谢注册资本道。请点击下方按钮验证你的邮箱，链接 <strong style="color:#F5F5F0;">24小时内</strong>有效。</p>
      ${btn(link, "验证我的邮箱")}
      <p style="color:#555550;font-size:12px;text-align:center;">如果你没有注册资本道账号，请忽略此邮件。</p>
      <p style="color:#333330;font-size:11px;text-align:center;margin-top:16px;word-break:break-all;">或复制链接：${link}</p>
    `),
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "欢迎加入资本道 — 开启你的金融学习之旅",
    html: wrap(`
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px;">你好，${name}！</h2>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 12px;">感谢您注册资本道，您的<strong style="color:#C9A84C;">免费会员</strong>账户已成功创建。</p>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 16px;">作为免费会员，您现在可以：</p>
      <ul style="color:#A0A09A;line-height:2.2;padding-left:20px;margin:0 0 8px;">
        <li>体验前 2-3 节精选课程</li>
        <li>使用基础版计算工具（每日限次）</li>
        <li>了解完整课程体系与升级方案</li>
      </ul>
      ${btn(`${BASE_URL}/member/dashboard`, "进入我的仪表板")}
      <p style="color:#555550;font-size:12px;text-align:center;">升级为学生会员，解锁完整内容 → <a href="${BASE_URL}/pricing" style="color:#C9A84C;">查看定价</a></p>
    `),
  });
}

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  amount: string,
  currency: string,
): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "付款成功 — 你已成为资本道学生会员 ",
    html: wrap(`
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px;">恭喜，${name}！</h2>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 20px;">您的付款已成功处理，您现在是资本道 <strong style="color:#C9A84C;">学生会员</strong>。</p>
      <div style="background:#111111;border-radius:12px;padding:20px;margin:0 0 20px;border:1px solid #1A1A1A;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#666660;font-size:13px;padding:6px 0;">付款金额</td>
            <td style="color:#C9A84C;font-size:13px;font-weight:600;text-align:right;padding:6px 0;">${currency} ${amount}</td>
          </tr>
          <tr>
            <td style="color:#666660;font-size:13px;padding:6px 0;">会员等级</td>
            <td style="color:#F5F5F0;font-size:13px;text-align:right;padding:6px 0;">学生会员</td>
          </tr>
          <tr>
            <td style="color:#666660;font-size:13px;padding:6px 0;">付款状态</td>
            <td style="color:#4CAF82;font-size:13px;text-align:right;padding:6px 0;">成功</td>
          </tr>
        </table>
      </div>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 8px;">您现在可以访问完整的课程体系和所有计算工具。</p>
      ${btn(`${BASE_URL}/student/dashboard`, "开始学习")}
    `),
  });
}

export async function sendContractEmail(
  to: string,
  name: string,
  docTitle: string,
  docId: string,
): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `合约待签署 — ${docTitle}`,
    html: wrap(`
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px;">你好，${name}！</h2>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 16px;">您的资本道顾问已向您发送了一份咨询服务合约，请尽快查阅并完成签署。</p>
      <div style="background:#111111;border-radius:12px;padding:20px;margin:0 0 20px;border:1px solid #C9A84C22;">
        <p style="margin:0 0 6px;color:#666660;font-size:12px;">合约名称</p>
        <p style="margin:0;color:#F5F5F0;font-weight:600;">${docTitle}</p>
      </div>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 8px;">点击下方按钮即可在线查看合约详情并完成电子签署。</p>
      ${btn(`${BASE_URL}/client/documents/${docId}/sign`, "查看并签署合约")}
      <p style="color:#555550;font-size:12px;text-align:center;">如有任何疑问，请直接联系您的资本道顾问。</p>
    `),
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${otp} — 资本道登录验证码`,
    html: wrap(`
      <h2 style="color:#F5F5F0;font-size:20px;margin:0 0 16px;">你的登录验证码</h2>
      <p style="color:#A0A09A;line-height:1.8;margin:0 0 24px;">请使用以下验证码完成登录。验证码 <strong style="color:#F5F5F0;">10 分钟内</strong>有效，请勿分享给他人。</p>
      <div style="text-align:center;margin:0 0 24px;">
        <div style="display:inline-block;background:#111111;border:1px solid #C9A84C44;border-radius:16px;padding:24px 48px;">
          <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#C9A84C;font-family:monospace;">${otp}</span>
        </div>
      </div>
      <p style="color:#555550;font-size:12px;text-align:center;">如果你没有请求此验证码，请忽略此邮件。</p>
    `),
  });
}
