import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

interface SendGiftCardEmailParams {
  to: string;
  brand: string;
  amount: number;
  code: string;
  serial?: string;
  redemptionInstructions?: string;
}

export async function sendGiftCardEmail({
  to,
  brand,
  amount,
  code,
  serial,
  redemptionInstructions,
}: SendGiftCardEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key not configured, skipping email");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Gift Cards <noreply@yourdomain.com>",
      to,
      subject: `Your ${brand} Gift Card`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Gift Card</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🎁 Your Gift Card is Ready!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Thank you for your purchase! Your gift card details are below:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea;">
                <h2 style="margin-top: 0; color: #667eea;">${brand}</h2>
                <p style="font-size: 18px; margin: 10px 0;"><strong>Amount: $${amount}</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p style="margin: 5px 0; font-size: 14px; color: #666;">Gift Card Code:</p>
                  <p style="margin: 5px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333; font-family: monospace;">${code}</p>
                </div>
                ${serial ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Serial Number:</strong> ${serial}</p>` : ""}
              </div>

              ${redemptionInstructions ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <h3 style="margin-top: 0;">Redemption Instructions:</h3>
                  <p style="margin: 0;">${redemptionInstructions}</p>
                </div>
              ` : ""}

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                If you have any questions or need assistance, please contact our support team.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

