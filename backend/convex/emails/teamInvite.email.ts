/**
 * Team Invitation Email Template
 * Sent when inviting team members to a workspace
 */

export function TeamInviteEmail({
  invitedEmail,
  inviterName,
  workspaceName,
  inviteToken,
  role,
}: {
  invitedEmail: string;
  inviterName: string;
  workspaceName: string;
  inviteToken: string;
  role: "editor" | "viewer";
}) {
  const acceptUrl = `https://one.ie/onboarding/accept-invite?token=${inviteToken}`;

  const roleDescription =
    role === "editor"
      ? "create and edit workspace content"
      : "view workspace content";

  return `
    <email>
      <subject>${inviterName} invited you to join ${workspaceName} on ONE</subject>
      <from>noreply@one.ie</from>
      <to>${invitedEmail}</to>

      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1>You've Been Invited!</h1>

          <p>Hi,</p>

          <p><strong>${inviterName}</strong> invited you to join their workspace on ONE: <strong>${workspaceName}</strong></p>

          <p>As a <strong>${role}</strong>, you'll be able to ${roleDescription}.</p>

          <p>
            <a href="${acceptUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Accept Invitation
            </a>
          </p>

          <p style="color: #666; font-size: 14px;">
            This invitation expires in 7 days. If you can't click the button above, copy and paste this link:<br/>
            <code>${acceptUrl}</code>
          </p>

          <h3>Not sure what this is about?</h3>
          <p>If you don't recognize this workspace or didn't expect this invitation, you can safely ignore it.</p>

          <footer style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #666;">
            <p>ONE Platform | <a href="https://one.ie">one.ie</a></p>
          </footer>
        </body>
      </html>
    </email>
  `;
}
