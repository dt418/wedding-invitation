import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export interface InviteEmailData {
  guestName: string;
  guestEmail: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  inviteUrl: string;
  deliveryId: string;
  qrCodeDataUrl?: string;
}

export async function sendInviteEmail(data: InviteEmailData): Promise<{ id: string }> {
  const trackingPixelUrl = `${env.NEXT_PUBLIC_BASE_URL}/api/track/open?deliveryId=${data.deliveryId}`;

  const { data: emailResult, error } = await resend.emails.send({
    from: env.EMAIL_FROM || "wedding@yourdomain.com",
    to: data.guestEmail,
    subject: `Loi moi cuoi - ${data.groomName} & ${data.brideName}`,
    html: buildInviteEmailHtml(data, trackingPixelUrl),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { id: emailResult?.id || "" };
}

function buildInviteEmailHtml(data: InviteEmailData, trackingPixelUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #d4a574 0%, #c9956c 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .couple-names { text-align: center; font-size: 32px; color: #333; margin-bottom: 30px; }
    .event-details { background: #faf7f4; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .event-details p { margin: 10px 0; color: #555; }
    .event-details strong { color: #333; }
    .cta-button { display: inline-block; background: #d4a574; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Wedding Invitation</h1>
      <p>You're invited to our special day</p>
    </div>
    <div class="content">
      <div class="couple-names">${data.groomName} & ${data.brideName}</div>
      <div class="event-details">
        <p><strong>Date:</strong> ${data.eventDate}</p>
        <p><strong>Time:</strong> ${data.eventTime}</p>
        <p><strong>Venue:</strong> ${data.venueName}</p>
        <p><strong>Address:</strong> ${data.venueAddress}</p>
      </div>
      <div style="text-align: center;">
        <a href="${data.inviteUrl}" class="cta-button">View Invitation</a>
      </div>
    </div>
    <div class="footer">
      <p>This invitation was sent to ${data.guestName}</p>
      <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
    </div>
  </div>
</body>
</html>
  `.trim();
}