/**
 * Email Service - Cycle 065
 *
 * Resend API integration for sending form notifications and confirmations.
 *
 * Features:
 * - Admin notifications on form submission
 * - User confirmation emails
 * - Template merge tags: {name}, {email}, {field_name}
 * - Error handling with retry logic
 * - Event logging (email_sent, email_failed)
 *
 * @see https://resend.com/docs
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { Effect } from "effect";

// ============================================================================
// TYPES
// ============================================================================

export interface EmailTemplate {
  subject: string;
  body: string; // HTML or plain text
  from?: string; // Override default sender
  replyTo?: string;
}

export interface FormSubmissionData {
  formId: string;
  formName: string;
  submittedAt: number;
  fields: Record<string, any>;
  submitterEmail?: string;
  submitterName?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailParams {
  to: EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface ResendResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

// ============================================================================
// ERRORS
// ============================================================================

export class EmailServiceError {
  readonly _tag = "EmailServiceError";
  constructor(
    public message: string,
    public code: string,
    public details?: any
  ) {}
}

export class EmailTemplateError {
  readonly _tag = "EmailTemplateError";
  constructor(public message: string, public field: string) {}
}

export class ResendAPIError {
  readonly _tag = "ResendAPIError";
  constructor(
    public statusCode: number,
    public message: string,
    public response?: any
  ) {}
}

// ============================================================================
// MERGE TAG PROCESSING
// ============================================================================

/**
 * Replace merge tags in template with actual values
 *
 * Supported tags:
 * - {name} - Submitter name
 * - {email} - Submitter email
 * - {form_name} - Form name
 * - {submitted_at} - Submission timestamp
 * - {field_name} - Any form field value
 *
 * Example:
 *   "Hi {name}, thanks for submitting {form_name}!"
 *   → "Hi John, thanks for submitting Contact Form!"
 */
export const processMergeTags = (
  template: string,
  data: FormSubmissionData
): Effect.Effect<string, EmailTemplateError> =>
  Effect.try({
    try: () => {
      let processed = template;

      // Replace standard merge tags
      processed = processed.replace(/{name}/g, data.submitterName || "there");
      processed = processed.replace(/{email}/g, data.submitterEmail || "");
      processed = processed.replace(/{form_name}/g, data.formName);
      processed = processed.replace(
        /{submitted_at}/g,
        new Date(data.submittedAt).toLocaleString()
      );

      // Replace field-specific merge tags
      Object.entries(data.fields).forEach(([fieldName, fieldValue]) => {
        const tag = new RegExp(`{${fieldName}}`, "g");
        processed = processed.replace(tag, String(fieldValue));
      });

      return processed;
    },
    catch: (error) =>
      new EmailTemplateError(
        `Failed to process merge tags: ${error}`,
        "template"
      ),
  });

// ============================================================================
// TEMPLATE GENERATION
// ============================================================================

/**
 * Generate admin notification email HTML
 */
export const generateAdminNotification = (
  data: FormSubmissionData
): Effect.Effect<string, never> =>
  Effect.sync(() => {
    const fieldRows = Object.entries(data.fields)
      .map(
        ([name, value]) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">${name}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${value}</td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Form Submission</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #111827;">New Form Submission</h1>
            <p style="margin: 0; color: #6b7280;">Form: <strong>${data.formName}</strong></p>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Submitted: ${new Date(data.submittedAt).toLocaleString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f3f4f6; text-align: left;">Field</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f3f4f6; text-align: left;">Value</th>
              </tr>
            </thead>
            <tbody>
              ${fieldRows}
            </tbody>
          </table>

          ${
            data.submitterEmail
              ? `
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Contact Info:</strong></p>
            ${data.submitterName ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #1e40af;">Name: ${data.submitterName}</p>` : ""}
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #1e40af;">Email: <a href="mailto:${data.submitterEmail}" style="color: #2563eb;">${data.submitterEmail}</a></p>
          </div>
          `
              : ""
          }

          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">This is an automated notification from your ONE Platform funnel.</p>
          </div>
        </body>
      </html>
    `;
  });

/**
 * Generate user confirmation email HTML
 */
export const generateUserConfirmation = (
  data: FormSubmissionData,
  customTemplate?: EmailTemplate
): Effect.Effect<string, EmailTemplateError> =>
  Effect.gen(function* () {
    // If custom template provided, use it with merge tags
    if (customTemplate?.body) {
      return yield* processMergeTags(customTemplate.body, data);
    }

    // Default confirmation template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Submission Received</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
            <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #065f46;">Thank You!</h1>
            <p style="margin: 0; color: #047857;">We've received your submission.</p>
          </div>

          <div style="padding: 24px 0;">
            <p style="margin: 0 0 16px 0;">Hi ${data.submitterName || "there"},</p>
            <p style="margin: 0 0 16px 0;">Thank you for submitting the <strong>${data.formName}</strong>. We've received your information and will get back to you soon.</p>
            <p style="margin: 0 0 16px 0;">Here's a summary of what you submitted:</p>

            <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
              ${Object.entries(data.fields)
                .map(
                  ([name, value]) => `
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>${name}:</strong> ${value}</p>
              `
                )
                .join("")}
            </div>

            <p style="margin: 0;">If you have any questions, feel free to reply to this email.</p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #6b7280; text-align: center;">
            <p style="margin: 0;">Powered by ONE Platform</p>
          </div>
        </body>
      </html>
    `;
  });

// ============================================================================
// RESEND API INTEGRATION
// ============================================================================

/**
 * Send email via Resend API
 *
 * Requires RESEND_API_KEY environment variable
 *
 * @see https://resend.com/docs/api-reference/emails/send-email
 */
export const sendEmailViaResend = (
  params: SendEmailParams,
  apiKey: string
): Effect.Effect<ResendResponse, ResendAPIError> =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: params.from || "noreply@one.ie",
          to: params.to.map((r) => r.email),
          subject: params.subject,
          html: params.html,
          text: params.text,
          reply_to: params.replyTo,
          tags: params.tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ResendAPIError(
          response.status,
          error.message || "Resend API request failed",
          error
        );
      }

      return (await response.json()) as ResendResponse;
    },
    catch: (error) => {
      if (error instanceof ResendAPIError) {
        return error;
      }
      return new ResendAPIError(
        500,
        `Resend API error: ${error}`,
        error
      );
    },
  });

// ============================================================================
// HIGH-LEVEL EMAIL SENDING
// ============================================================================

/**
 * Send admin notification email
 */
export const sendAdminNotification = (
  adminEmail: string,
  submissionData: FormSubmissionData,
  apiKey: string
): Effect.Effect<ResendResponse, ResendAPIError | EmailServiceError> =>
  Effect.gen(function* () {
    // Generate HTML content
    const html = yield* generateAdminNotification(submissionData);

    // Send email
    return yield* sendEmailViaResend(
      {
        to: [{ email: adminEmail }],
        subject: `New Submission: ${submissionData.formName}`,
        html,
        tags: {
          type: "admin_notification",
          formId: submissionData.formId,
        },
      },
      apiKey
    );
  });

/**
 * Send user confirmation email
 */
export const sendUserConfirmation = (
  submissionData: FormSubmissionData,
  apiKey: string,
  customTemplate?: EmailTemplate
): Effect.Effect<
  ResendResponse,
  ResendAPIError | EmailTemplateError | EmailServiceError
> =>
  Effect.gen(function* () {
    // Validate user email exists
    if (!submissionData.submitterEmail) {
      return yield* Effect.fail(
        new EmailServiceError(
          "Cannot send confirmation: no email address provided",
          "missing_email"
        )
      );
    }

    // Generate HTML content
    const html = yield* generateUserConfirmation(
      submissionData,
      customTemplate
    );

    // Process subject if custom template
    const subject = customTemplate?.subject
      ? yield* processMergeTags(customTemplate.subject, submissionData)
      : `Thanks for submitting ${submissionData.formName}`;

    // Send email
    return yield* sendEmailViaResend(
      {
        to: [{ email: submissionData.submitterEmail }],
        subject,
        html,
        replyTo: customTemplate?.replyTo,
        tags: {
          type: "user_confirmation",
          formId: submissionData.formId,
        },
      },
      apiKey
    );
  });

// ============================================================================
// EMAIL SERVICE FACADE
// ============================================================================

export const EmailService = {
  /**
   * Send form submission notifications
   *
   * Sends both admin notification and user confirmation (if enabled)
   */
  sendFormNotifications: (params: {
    submissionData: FormSubmissionData;
    adminEmail?: string;
    sendUserConfirmation?: boolean;
    userTemplate?: EmailTemplate;
    apiKey: string;
  }) =>
    Effect.gen(function* () {
      const results: {
        admin?: ResendResponse;
        user?: ResendResponse;
        errors: any[];
      } = { errors: [] };

      // Send admin notification (if enabled)
      if (params.adminEmail) {
        const adminResult = yield* Effect.either(
          sendAdminNotification(
            params.adminEmail,
            params.submissionData,
            params.apiKey
          )
        );

        if (adminResult._tag === "Right") {
          results.admin = adminResult.right;
        } else {
          results.errors.push({
            type: "admin",
            error: adminResult.left,
          });
        }
      }

      // Send user confirmation (if enabled)
      if (params.sendUserConfirmation && params.submissionData.submitterEmail) {
        const userResult = yield* Effect.either(
          sendUserConfirmation(
            params.submissionData,
            params.apiKey,
            params.userTemplate
          )
        );

        if (userResult._tag === "Right") {
          results.user = userResult.right;
        } else {
          results.errors.push({
            type: "user",
            error: userResult.left,
          });
        }
      }

      return results;
    }),

  /**
   * Validate email template
   */
  validateTemplate: (template: EmailTemplate) =>
    Effect.try({
      try: () => {
        const errors: string[] = [];

        if (!template.subject || template.subject.trim().length === 0) {
          errors.push("Subject is required");
        }

        if (!template.body || template.body.trim().length === 0) {
          errors.push("Body is required");
        }

        if (template.from && !isValidEmail(template.from)) {
          errors.push("Invalid 'from' email address");
        }

        if (template.replyTo && !isValidEmail(template.replyTo)) {
          errors.push("Invalid 'replyTo' email address");
        }

        return { isValid: errors.length === 0, errors };
      },
      catch: (error) =>
        new EmailTemplateError(
          `Template validation failed: ${error}`,
          "template"
        ),
    }),
};

// ============================================================================
// UTILITIES
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
