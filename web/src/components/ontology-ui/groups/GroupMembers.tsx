/**
 * GroupMembers Component
 *
 * List of members in a group
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Person, UserRole } from "../types";
import { cn, getRoleDisplay, getRoleColor } from "../utils";

export interface GroupMembersProps {
  members: Person[];
  onMemberClick?: (member: Person) => void;
  onInvite?: () => void;
  showRoles?: boolean;
  className?: string;
}

export function GroupMembers({
  members,
  onMemberClick,
  onInvite,
  showRoles = true,
  className,
}: GroupMembersProps) {
  const roleCount = members.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    {} as Record<UserRole, number>
  );

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md p-4 text-font">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-font">
              <span>👥</span>
              Members ({members.length})
            </CardTitle>
            {onInvite && (
              <Button variant="primary" onClick={onInvite} size="sm">
                + Invite
              </Button>
            )}
          </div>

          {showRoles && Object.keys(roleCount).length > 0 && (
            <div className="flex gap-2 flex-wrap pt-2">
              {Object.entries(roleCount).map(([role, count]) => (
                <Badge
                  key={role}
                  variant="outline"
                  className={`bg-${getRoleColor(role as UserRole)}-50`}
                >
                  {count} {getRoleDisplay(role as UserRole)}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member._id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors duration-150",
                  onMemberClick && "cursor-pointer"
                )}
                onClick={() => onMemberClick?.(member)}
              >
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-font">{member.name}</p>
                  {member.email && (
                    <p className="text-sm text-font/60 truncate">
                      {member.email}
                    </p>
                  )}
                </div>

                {showRoles && (
                  <Badge variant="secondary">{getRoleDisplay(member.role)}</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
