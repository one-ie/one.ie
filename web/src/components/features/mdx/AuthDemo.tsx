"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Clock, Key, Mail, Smartphone, Lock } from "lucide-react";

interface AuthMethod {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  security: "high" | "medium" | "very-high";
  setup: "easy" | "medium" | "complex";
  userExperience: "excellent" | "good" | "fair";
  features: string[];
  components: string[];
}

const authMethods: AuthMethod[] = [
  {
    name: "Email/Password",
    icon: Lock,
    description: "Traditional username and password authentication",
    security: "medium",
    setup: "easy",
    userExperience: "good",
    features: ["Password strength validation", "Bcrypt hashing", "Remember me", "Password reset"],
    components: ["SimpleSignInForm", "SimpleSignUpForm", "ForgotPasswordForm"]
  },
  {
    name: "OAuth Social Login",
    icon: Key,
    description: "One-click sign in with Google, GitHub, Discord, Microsoft",
    security: "high",
    setup: "medium",
    userExperience: "excellent",
    features: ["Google OAuth", "GitHub OAuth", "Discord OAuth", "Microsoft OAuth", "Auto account linking"],
    components: ["SocialLoginButtons"]
  },
  {
    name: "Magic Link",
    icon: Mail,
    description: "Passwordless email authentication with one-time links",
    security: "high",
    setup: "easy",
    userExperience: "excellent",
    features: ["No password needed", "Email verification", "Time-limited tokens", "Secure links"],
    components: ["RequestMagicLinkForm", "MagicLinkAuth"]
  },
  {
    name: "Two-Factor (2FA)",
    icon: Smartphone,
    description: "Extra security layer with SMS or authenticator app codes",
    security: "very-high",
    setup: "complex",
    userExperience: "fair",
    features: ["SMS codes", "TOTP authenticator", "Backup codes", "Trusted devices"],
    components: ["TwoFactorSettings"]
  },
  {
    name: "Email Verification",
    icon: Mail,
    description: "Verify email ownership before account activation",
    security: "medium",
    setup: "easy",
    userExperience: "good",
    features: ["Email confirmation", "Resend verification", "Expiring tokens"],
    components: ["VerifyEmailForm"]
  },
  {
    name: "Password Reset",
    icon: Shield,
    description: "Secure account recovery via email-based password reset",
    security: "medium",
    setup: "easy",
    userExperience: "good",
    features: ["Email verification", "Time-limited tokens", "Password strength validation"],
    components: ["ForgotPasswordForm", "ResetPasswordForm"]
  }
];

const securityColors = {
  "very-high": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "high": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
};

interface AuthDemoProps {
  title?: string;
  description?: string;
}

/**
 * Authentication Methods Chart
 *
 * Visual comparison of all 6 authentication methods.
 * Shows features, components, and security levels.
 *
 * Usage in MDX:
 * <AuthDemo
 *   title="Authentication Methods"
 *   description="Compare all six authentication methods and their features"
 * />
 */
export function AuthDemo({
  title = "Authentication Methods Overview",
  description = "All 6 authentication methods with their features and components"
}: AuthDemoProps) {
  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {authMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Card key={method.name} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                    </div>
                    <Badge className={securityColors[method.security]} variant="secondary">
                      {method.security === "very-high" ? "Very High" : method.security.charAt(0).toUpperCase() + method.security.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {method.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Features
                    </h4>
                    <ul className="space-y-1">
                      {method.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Components
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {method.components.map((component) => (
                        <Badge key={component} variant="outline" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      Setup: {method.setup}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      UX: {method.userExperience}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
