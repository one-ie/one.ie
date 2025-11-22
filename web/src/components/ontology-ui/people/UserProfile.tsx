/**
 * UserProfile Component
 *
 * Full user profile display with tabs
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import type { Person } from "../types";
import { cn, getRoleDisplay, formatDate, formatRelativeTime } from "../utils";

export interface UserProfileProps {
  user: Person;
  showActivity?: boolean;
  showStats?: boolean;
  className?: string;
}

export function UserProfile({
  user,
  showActivity = true,
  showStats = true,
  className,
}: UserProfileProps) {
  // Extract bio and other metadata
  const bio = user.metadata?.bio as string | undefined;
  const location = user.metadata?.location as string | undefined;
  const website = user.metadata?.website as string | undefined;
  const joinedDate = formatDate(user.createdAt);
  const lastActive = user.updatedAt
    ? formatRelativeTime(user.updatedAt)
    : "Never";

  return (
    <Card className={cn("w-full bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md text-font">
        {/* Profile Header */}
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-20 w-20 rounded-full border-2 border-font/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl text-font bg-background">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl text-font">{user.name}</CardTitle>
                <Badge>{getRoleDisplay(user.role)}</Badge>
              </div>

              {user.email && (
                <p className="text-sm text-font/80">{user.email}</p>
              )}

              {bio && (
                <p className="text-sm mt-2 max-w-2xl text-font">{bio}</p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-xs text-font/60">
                {location && (
                  <span className="flex items-center gap-1">
                    📍 {location}
                  </span>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:opacity-90 transition-opacity duration-150"
                  >
                    🔗 {new URL(website).hostname}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  📅 Joined {joinedDate}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Tabs */}
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-background rounded-md p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-foreground text-font transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              {showActivity && (
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-foreground text-font transition-all duration-300"
                >
                  Activity
                </TabsTrigger>
              )}
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-foreground text-font transition-all duration-300"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 animate-in fade-in duration-300">
              {showStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Role"
                    value={getRoleDisplay(user.role)}
                  />
                  <StatCard
                    label="User Type"
                    value={user.type === "creator" ? "Creator" : "User"}
                  />
                  <StatCard label="Last Active" value={lastActive} />
                  <StatCard
                    label="Member Since"
                    value={formatRelativeTime(user.createdAt)}
                  />
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-font">User Information</h3>
                <div className="grid gap-2 text-sm">
                  <InfoRow label="User ID" value={user._id} />
                  <InfoRow label="Group ID" value={user.groupId} />
                  {user.metadata?.company && (
                    <InfoRow
                      label="Company"
                      value={user.metadata.company as string}
                    />
                  )}
                  {user.metadata?.department && (
                    <InfoRow
                      label="Department"
                      value={user.metadata.department as string}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            {showActivity && (
              <TabsContent value="activity" className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center py-8 text-font/60">
                  <p className="text-lg">Activity feed coming soon</p>
                  <p className="text-sm mt-2">
                    View user events, actions, and timeline here
                  </p>
                </div>
              </TabsContent>
            )}

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-3">
                <h3 className="font-semibold text-font">User Settings</h3>
                <div className="grid gap-2 text-sm">
                  <InfoRow label="Role" value={getRoleDisplay(user.role)} />
                  <InfoRow label="Status" value="Active" />
                  <InfoRow
                    label="Email Verified"
                    value={user.metadata?.emailVerified ? "Yes" : "No"}
                  />
                  <InfoRow
                    label="Two-Factor Auth"
                    value={user.metadata?.twoFactorEnabled ? "Enabled" : "Disabled"}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </Card>
  );
}

// Helper Components

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-font/10 p-3 space-y-1 bg-background/50">
      <p className="text-xs text-font/60">{label}</p>
      <p className="text-lg font-semibold truncate text-font">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-font/10 last:border-0">
      <span className="text-font/60">{label}</span>
      <span className="font-medium truncate ml-4 max-w-xs text-font">{value}</span>
    </div>
  );
}
