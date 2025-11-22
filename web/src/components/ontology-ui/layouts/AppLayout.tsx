/**
 * AppLayout - Main application layout
 *
 * Uses 6-token design system for consistent app structure.
 */

import { cn } from "../utils";
import { OntologyHeader } from "./OntologyHeader";
import { OntologySidebar } from "./OntologySidebar";
import { OntologyFooter } from "./OntologyFooter";
import type { Dimension, Group, Person } from "../types";

export interface AppLayoutProps {
  children: React.ReactNode;
  currentDimension: Dimension;
  currentGroup?: Group;
  currentUser?: Person;
  onDimensionChange?: (dimension: Dimension) => void;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * AppLayout - Main application wrapper
 *
 * @example
 * ```tsx
 * <AppLayout
 *   currentDimension="things"
 *   currentUser={user}
 *   currentGroup={group}
 * >
 *   <YourContent />
 * </AppLayout>
 * ```
 */
export function AppLayout({
  children,
  currentDimension,
  currentGroup,
  currentUser,
  onDimensionChange,
  showSidebar = true,
  showFooter = true,
  className,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <OntologyHeader
        currentDimension={currentDimension}
        currentGroup={currentGroup}
        currentUser={currentUser}
        onDimensionChange={onDimensionChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {showSidebar && (
          <OntologySidebar
            currentDimension={currentDimension}
          />
        )}

        {/* Content */}
        <main className={cn("flex-1 bg-foreground", className)}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <OntologyFooter />}
    </div>
  );
}
