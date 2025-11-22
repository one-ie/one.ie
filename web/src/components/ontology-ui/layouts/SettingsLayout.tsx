/**
 * SettingsLayout - Settings pages layout
 *
 * Uses 6-token design system with sidebar navigation.
 */

import { cn } from "../utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  sections?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  currentSection?: string;
  onSectionChange?: (sectionId: string) => void;
  className?: string;
}

/**
 * SettingsLayout - Settings page with sidebar navigation
 *
 * @example
 * ```tsx
 * <SettingsLayout
 *   title="Account Settings"
 *   sections={[
 *     { id: "profile", label: "Profile", icon: <User /> },
 *     { id: "security", label: "Security", icon: <Lock /> }
 *   ]}
 *   currentSection="profile"
 * >
 *   <ProfileSettings />
 * </SettingsLayout>
 * ```
 */
export function SettingsLayout({
  children,
  title,
  description,
  sections,
  currentSection,
  onSectionChange,
  className,
}: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      {(title || description) && (
        <div>
          {title && (
            <h1 className="text-3xl font-bold text-font">{title}</h1>
          )}
          {description && (
            <p className="text-sm text-font/60 mt-2">{description}</p>
          )}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        {sections && sections.length > 0 && (
          <Card className="lg:col-span-1 bg-background p-1 shadow-sm rounded-md h-fit">
            <CardContent className="bg-foreground p-4 rounded-md">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={currentSection === section.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      currentSection === section.id && "bg-background"
                    )}
                    onClick={() => onSectionChange?.(section.id)}
                  >
                    {section.icon}
                    {section.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        )}

        {/* Content Area */}
        <div className={cn(
          sections && sections.length > 0 ? "lg:col-span-3" : "lg:col-span-4",
          className
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}
