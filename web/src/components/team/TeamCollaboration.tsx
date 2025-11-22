/**
 * TeamCollaboration Component
 *
 * Main team collaboration interface with members, permissions, activity, and comments
 * Cycle 96: Team Collaboration Features
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupMembers } from '@/components/ontology-ui/groups/GroupMembers';
import { UserInvite } from '@/components/ontology-ui/people/UserInvite';
import { UserPermissions } from '@/components/ontology-ui/people/UserPermissions';
import { LiveActivityFeed } from '@/components/ontology-ui/streaming/LiveActivityFeed';
import { PresenceIndicator } from '@/components/ontology-ui/streaming/PresenceIndicator';
import { TeamComments } from './TeamComments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Person, Event, Permission, UserRole } from '@/components/ontology-ui/types';

// Mock data - replace with real data from Convex
const mockMembers: Person[] = [
  {
    _id: '1' as any,
    type: 'creator',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    role: 'org_owner',
    groupId: 'group1' as any,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    _id: '2' as any,
    type: 'user',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    role: 'org_user',
    groupId: 'group1' as any,
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    _id: '3' as any,
    type: 'user',
    name: 'Carol White',
    email: 'carol@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    role: 'org_user',
    groupId: 'group1' as any,
    createdAt: Date.now() - 86400000 * 7,
  },
];

const mockEvents: Event[] = [
  {
    _id: 'e1' as any,
    _creationTime: Date.now() - 3600000,
    type: 'updated',
    actorId: '2' as any,
    targetId: 'funnel1' as any,
    groupId: 'group1' as any,
    metadata: { resource: 'Funnel', name: 'Product Launch Funnel' },
    timestamp: Date.now() - 3600000,
  },
  {
    _id: 'e2' as any,
    _creationTime: Date.now() - 7200000,
    type: 'created',
    actorId: '1' as any,
    targetId: 'page1' as any,
    groupId: 'group1' as any,
    metadata: { resource: 'Page', name: 'Landing Page A' },
    timestamp: Date.now() - 7200000,
  },
  {
    _id: 'e3' as any,
    _creationTime: Date.now() - 86400000,
    type: 'invited',
    actorId: '1' as any,
    targetId: '3' as any,
    groupId: 'group1' as any,
    metadata: { email: 'carol@example.com', role: 'org_user' },
    timestamp: Date.now() - 86400000,
  },
];

const mockPermissions: Permission[] = [
  { resource: 'funnels', action: 'create', granted: true },
  { resource: 'funnels', action: 'read', granted: true },
  { resource: 'funnels', action: 'update', granted: true },
  { resource: 'funnels', action: 'delete', granted: false },
  { resource: 'pages', action: 'create', granted: true },
  { resource: 'pages', action: 'read', granted: true },
  { resource: 'pages', action: 'update', granted: true },
  { resource: 'pages', action: 'delete', granted: true },
];

export function TeamCollaboration() {
  const [members, setMembers] = useState<Person[]>(mockMembers);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const handleInvite = (emails: string[], role: UserRole) => {
    console.log('Inviting users:', emails, 'with role:', role);
    // TODO: Implement actual invite logic via Convex mutation
    setShowInviteDialog(false);
  };

  const handleMemberClick = (member: Person) => {
    setSelectedMember(member);
  };

  const handlePermissionChange = (resource: string, action: Permission['action'], granted: boolean) => {
    console.log('Permission changed:', resource, action, granted);
    // TODO: Implement actual permission change via Convex mutation
  };

  return (
    <div className="space-y-6">
      {/* Real-time Presence Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Currently Editing
          </CardTitle>
          <CardDescription>
            See who's working on funnels in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {members.slice(0, 2).map((member) => (
              <PresenceIndicator
                key={member._id}
                userId={member._id}
                name={member.name}
                avatarUrl={member.avatar}
                showName
                showLastSeen
                size="md"
                status="online"
              />
            ))}
            <PresenceIndicator
              userId={members[2]._id}
              name={members[2].name}
              avatarUrl={members[2].avatar}
              showName
              showLastSeen
              size="md"
              status="away"
              lastSeen={Date.now() - 600000}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            Permissions
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Team Members</h2>
              <p className="text-muted-foreground">
                Manage team members and their roles
              </p>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button>+ Invite Members</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Invite Team Members</DialogTitle>
                </DialogHeader>
                <UserInvite
                  onInvite={handleInvite}
                  onCancel={() => setShowInviteDialog(false)}
                  maxInvites={10}
                  defaultRole="org_user"
                />
              </DialogContent>
            </Dialog>
          </div>

          <GroupMembers
            members={members}
            onMemberClick={handleMemberClick}
            showRoles
          />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">User Permissions</h2>
            <p className="text-muted-foreground mb-4">
              Control who can create, edit, publish, and delete resources
            </p>
          </div>

          {selectedMember ? (
            <UserPermissions
              user={selectedMember}
              permissions={mockPermissions}
              onPermissionChange={handlePermissionChange}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select a team member from the Members tab to view and edit their permissions
              </CardContent>
            </Card>
          )}

          {/* Role Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  Owner
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">Full access</p>
                  <p className="text-sm text-muted-foreground">
                    Can manage team, create/edit/delete all resources, and change settings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Editor
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">Edit access</p>
                  <p className="text-sm text-muted-foreground">
                    Can create and edit resources, but cannot delete or change settings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  Viewer
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">Read-only access</p>
                  <p className="text-sm text-muted-foreground">
                    Can view resources but cannot make any changes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Team Activity</h2>
            <p className="text-muted-foreground mb-4">
              See who made changes and when
            </p>
          </div>

          <LiveActivityFeed
            events={mockEvents}
            onLoadMore={() => console.log('Load more events')}
            hasMore={false}
            isLoading={false}
          />
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Team Comments</h2>
            <p className="text-muted-foreground mb-4">
              Add comments on funnel pages and @mention team members
            </p>
          </div>

          <TeamComments
            members={members}
            resourceId="funnel1"
            resourceType="funnel"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
