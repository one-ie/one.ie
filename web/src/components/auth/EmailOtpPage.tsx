/**
 * EmailOtpPage - Complete Email OTP page with AppProviders
 *
 * This component wraps the EmailOtpForm with AppProviders to ensure
 * the DataProvider context is available. This is necessary because of
 * Astro's islands architecture - each client:load directive creates an
 * isolated React tree.
 */

import { AppProviders } from "@/components/providers/AppProviders";
import { EmailOtpForm } from "./EmailOtpForm";

export function EmailOtpPage() {
  return (
    <AppProviders>
      <EmailOtpForm />
    </AppProviders>
  );
}
