/**
 * Email Service
 * Sends transactional emails via Resend API
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@one.ie";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  // If no API key, log and continue (development mode)
  if (!RESEND_API_KEY) {
    console.warn(
      "⚠️  RESEND_API_KEY not set. Emails will not be sent in development."
    );
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    return { success: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Resend API error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    const result = await response.json();
    console.log(`✅ Email sent to ${to} (ID: ${result.id})`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Email service error:", message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Send verification code email
 */
export async function sendVerificationCodeEmail(
  to: string,
  displayName: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <email>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1>Verify Your Email</h1>

        <p>Hi ${displayName},</p>

        <p>Thanks for signing up for ONE! Here's your verification code:</p>

        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h2 style="letter-spacing: 5px; font-size: 32px; color: #0066cc; margin: 0;">
            ${code.split("").join(" ")}
          </h2>
          <p style="color: #666; margin-top: 10px;">This code expires in 15 minutes</p>
        </div>

        <p style="color: #666; font-size: 14px;">
          Don't share this code with anyone. ONE will never ask for it via email or message.
        </p>

        <h3>Next Step</h3>
        <p>Go back to ONE and enter the 6-digit code above to verify your email address.</p>

        <footer style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px; font-size: 12px; color: #666;">
          <p>ONE Platform | <a href="https://one.ie">one.ie</a></p>
        </footer>
      </body>
    </email>
  `;

  return sendEmail({
    to,
    subject: `Your ONE Verification Code: ${code}`,
    html,
  });
}
