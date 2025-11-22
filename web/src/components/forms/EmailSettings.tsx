/**
 * Email Settings Component - Cycle 065
 *
 * Configure email notifications for form submissions.
 *
 * Features:
 * - Enable/disable email notifications
 * - Admin notification email address
 * - User confirmation email toggle
 * - Custom email templates with merge tags
 * - Test email functionality
 * - Merge tag documentation
 *
 * Merge Tags:
 * - {name} - Submitter name
 * - {email} - Submitter email
 * - {form_name} - Form name
 * - {submitted_at} - Submission timestamp
 * - {field_name} - Any form field value
 *
 * @see /backend/convex/mutations/forms.ts - Email mutations
 * @see /backend/convex/services/email/email.ts - Email service
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

interface EmailTemplate {
  subject: string;
  body: string;
  replyTo?: string;
}

interface EmailSettings {
  enabled: boolean;
  adminEmail?: string;
  sendUserConfirmation?: boolean;
  userTemplate?: EmailTemplate;
}

interface EmailSettingsProps {
  formId: Id<"things">;
  initialSettings?: EmailSettings;
  onSave?: (settings: EmailSettings) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailSettings({
  formId,
  initialSettings,
  onSave,
}: EmailSettingsProps) {
  // Mutations
  const updateEmailSettings = useMutation(api.mutations.forms.updateEmailSettings);
  const sendTestEmail = useMutation(api.mutations.forms.sendTestEmail);

  // Local state
  const [settings, setSettings] = useState<EmailSettings>(
    initialSettings || {
      enabled: false,
      adminEmail: "",
      sendUserConfirmation: false,
      userTemplate: {
        subject: "Thanks for submitting {form_name}",
        body: "Hi {name},\n\nThank you for your submission. We'll get back to you soon.\n\n{form_name} received your message on {submitted_at}.",
      },
    }
  );

  const [testEmail, setTestEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveMessage("");

      await updateEmailSettings({
        formId,
        settings,
      });

      setSaveMessage("Settings saved successfully!");
      onSave?.(settings);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage(`Error: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setTestMessage("Please enter an email address");
      return;
    }

    try {
      setIsTesting(true);
      setTestMessage("");

      const result = await sendTestEmail({
        formId,
        testEmail,
      });

      setTestMessage(result.message);

      // Clear success message after 5 seconds
      setTimeout(() => setTestMessage(""), 5000);
    } catch (error) {
      setTestMessage(`Error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const updateSetting = <K extends keyof EmailSettings>(
    key: K,
    value: EmailSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateTemplate = <K extends keyof EmailTemplate>(
    key: K,
    value: EmailTemplate[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      userTemplate: {
        ...prev.userTemplate!,
        [key]: value,
      },
    }));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Email Notifications
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure email notifications when this form is submitted.
        </p>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enabled"
            checked={settings.enabled}
            onChange={(e) => updateSetting("enabled", e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            Enable email notifications
          </label>
        </div>
      </div>

      {/* Settings (only show if enabled) */}
      {settings.enabled && (
        <>
          {/* Admin Email */}
          <div>
            <label
              htmlFor="adminEmail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Admin Notification Email
            </label>
            <input
              type="email"
              id="adminEmail"
              value={settings.adminEmail || ""}
              onChange={(e) => updateSetting("adminEmail", e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Receive an email notification when someone submits this form.
            </p>
          </div>

          {/* User Confirmation */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendUserConfirmation"
              checked={settings.sendUserConfirmation || false}
              onChange={(e) =>
                updateSetting("sendUserConfirmation", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="sendUserConfirmation"
              className="text-sm font-medium text-gray-700"
            >
              Send confirmation email to user
            </label>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {showAdvanced ? "Hide" : "Show"} advanced settings
            </button>
          </div>

          {/* User Template (Advanced) */}
          {showAdvanced && settings.sendUserConfirmation && (
            <div className="space-y-4 border-l-4 border-blue-200 pl-4">
              <h4 className="text-sm font-semibold text-gray-900">
                User Confirmation Template
              </h4>

              {/* Subject */}
              <div>
                <label
                  htmlFor="templateSubject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Subject
                </label>
                <input
                  type="text"
                  id="templateSubject"
                  value={settings.userTemplate?.subject || ""}
                  onChange={(e) => updateTemplate("subject", e.target.value)}
                  placeholder="Thanks for submitting {form_name}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Body */}
              <div>
                <label
                  htmlFor="templateBody"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Body
                </label>
                <textarea
                  id="templateBody"
                  value={settings.userTemplate?.body || ""}
                  onChange={(e) => updateTemplate("body", e.target.value)}
                  rows={6}
                  placeholder="Hi {name},&#10;&#10;Thank you for your submission."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* Reply To */}
              <div>
                <label
                  htmlFor="replyTo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reply-To Email (optional)
                </label>
                <input
                  type="email"
                  id="replyTo"
                  value={settings.userTemplate?.replyTo || ""}
                  onChange={(e) => updateTemplate("replyTo", e.target.value)}
                  placeholder="support@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Merge Tags Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h5 className="text-xs font-semibold text-blue-900 mb-2">
                  Available Merge Tags
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    {"{name}"}
                  </code>
                  <span className="text-blue-600">Submitter name</span>

                  <code className="bg-blue-100 px-2 py-1 rounded">
                    {"{email}"}
                  </code>
                  <span className="text-blue-600">Submitter email</span>

                  <code className="bg-blue-100 px-2 py-1 rounded">
                    {"{form_name}"}
                  </code>
                  <span className="text-blue-600">Form name</span>

                  <code className="bg-blue-100 px-2 py-1 rounded">
                    {"{submitted_at}"}
                  </code>
                  <span className="text-blue-600">Submission time</span>

                  <code className="bg-blue-100 px-2 py-1 rounded">
                    {"{field_name}"}
                  </code>
                  <span className="text-blue-600">Any form field</span>
                </div>
                <p className="mt-2 text-xs text-blue-600">
                  Use these tags in subject or body to personalize emails.
                </p>
              </div>
            </div>
          )}

          {/* Test Email */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Test Email Settings
            </h4>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={isTesting || !testEmail}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTesting ? "Sending..." : "Send Test"}
              </button>
            </div>
            {testMessage && (
              <p
                className={`mt-2 text-sm ${testMessage.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
              >
                {testMessage}
              </p>
            )}
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between border-t pt-4">
        <div>
          {saveMessage && (
            <p
              className={`text-sm ${saveMessage.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
            >
              {saveMessage}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Configuration Warning */}
      {settings.enabled && !settings.adminEmail && !settings.sendUserConfirmation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Incomplete Configuration
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                Please specify an admin email or enable user confirmation to receive notifications.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default EmailSettings;
