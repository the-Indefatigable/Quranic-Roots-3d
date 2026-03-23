import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginUrl = `${appUrl}/api/auth/verify?token=${token}`;

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'QuRoots <noreply@quroots.com>',
    to: email,
    subject: 'Your QuRoots login link',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#08080F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080F;padding:48px 24px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0D0D1C;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:48px 40px;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Qu<span style="color:#E8B86D;">Roots</span></span>
        </td></tr>
        <tr><td align="center" style="padding-bottom:12px;">
          <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff;">Sign in to QuRoots</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.45);line-height:1.6;">
            Click the button below to sign in. This link expires in 15 minutes.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="${loginUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(145deg,#F5CFA0,#E8B86D);color:#1a0c00;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;">
            Sign in
          </a>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.22);line-height:1.6;">
            If the button doesn't work, paste this link into your browser:<br/>
            <a href="${loginUrl}" style="color:#E8B86D;word-break:break-all;">${loginUrl}</a>
          </p>
        </td></tr>
        <tr><td align="center">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">
            If you didn't request this email, you can safely ignore it.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
