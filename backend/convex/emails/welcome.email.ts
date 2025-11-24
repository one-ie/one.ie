/**
 * Welcome Email Template
 * Sent after successful signup (before email verification)
 */

export function WelcomeEmail({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  return `
    <email>
      <subject>Welcome to ONE - Let's Get Started!</subject>
      <from>noreply@one.ie</from>
      <to>${email}</to>

      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1>Welcome to ONE, ${displayName}!</h1>

          <p>We're excited to have you on board. ONE is the platform where creators like you can build, share, and grow with your audience.</p>

          <h2>What's Next?</h2>
          <ol>
            <li><strong>Verify Your Email:</strong> Check your inbox for a 6-digit verification code</li>
            <li><strong>Complete Your Profile:</strong> Add your bio, avatar, and areas of expertise</li>
            <li><strong>Create Your Workspace:</strong> Set up your creator space</li>
            <li><strong>Build Your Team:</strong> Invite collaborators to join you</li>
            <li><strong>Connect Your Wallet:</strong> Enable Web3 features (optional)</li>
          </ol>

          <p>
            <a href="https://one.ie/onboarding/verify" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Verification
            </a>
          </p>

          <p>If you have any questions, reply to this email or visit our <a href="https://one.ie/help">help center</a>.</p>

          <p>Best regards,<br/>The ONE Team</p>

          <footer style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px; font-size: 12px; color: #666;">
            <p>ONE Platform | <a href="https://one.ie">one.ie</a></p>
            <p>You're receiving this because you signed up for ONE</p>
          </footer>
        </body>
      </html>
    </email>
  `;
}
