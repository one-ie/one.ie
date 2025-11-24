/**
 * Email Verification Code Template
 * Sent with 6-digit code for email verification during signup
 */

export function VerifyEmailCodeEmail({
  displayName,
  email,
  code,
}: {
  displayName: string;
  email: string;
  code: string;
}) {
  return `
    <email>
      <subject>Your ONE Verification Code: ${code}</subject>
      <from>noreply@one.ie</from>
      <to>${email}</to>

      <html>
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
      </html>
    </email>
  `;
}
