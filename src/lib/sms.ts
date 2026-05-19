// Phone OTP via Twilio. Configure TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM in env.
// Without those vars, OTP is printed to server console (dev only).

export async function sendSmsOtp(phone: string, otp: string): Promise<void> {
  const sid   = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from  = process.env.TWILIO_FROM;

  if (sid && token && from) {
    const body = `【资本道】您的验证码是 ${otp}，10 分钟内有效，请勿分享。`;
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, From: from, Body: body }).toString(),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SMS failed: ${text}`);
    }
    return;
  }

  // Dev fallback — no SMS provider configured
  console.warn(`[SMS-OTP] No Twilio env vars. OTP for ${phone}: ${otp}`);
}
