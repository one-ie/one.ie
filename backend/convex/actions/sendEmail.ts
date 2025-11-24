/**
 * Email Actions - Send transactional emails
 * Must be an action (not mutation) to use fetch()
 */
"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@one.ie";

export const sendVerificationEmail = action({
  args: {
    to: v.string(),
    displayName: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.log(
        `[EMAIL] Verification email to ${args.to}: Code is ${args.code}`
      );
      return { success: true, message: "Development mode - no email sent" };
    }

    const html = `
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1>Verify Your Email</h1>

        <p>Hi ${args.displayName},</p>

        <p>Thanks for signing up for ONE! Here's your verification code:</p>

        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h2 style="letter-spacing: 5px; font-size: 32px; color: #0066cc; margin: 0;">
            ${args.code.split("").join(" ")}
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
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: args.to,
          subject: `Your ONE Verification Code: ${args.code}`,
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
      console.log(`✅ Verification email sent to ${args.to}`);
      return { success: true, messageId: result.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Email action error:", message);
      return { success: false, error: message };
    }
  },
});
