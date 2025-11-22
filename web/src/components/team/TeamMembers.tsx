/**
 * TeamMembers Component
 *
 * Wrapper around GroupMembers with team-specific features
 * Cycle 96: Team Collaboration Features
 */

import { GroupMembers } from '@/components/ontology-ui/groups/GroupMembers';
import type { Person } from '@/components/ontology-ui/types';

interface TeamMembersProps {
  members: Person[];
  onMemberClick?: (member: Person) => void;
  onInvite?: () => void;
  showRoles?: boolean;
}

export function TeamMembers({ members, onMemberClick, onInvite, showRoles = true }: TeamMembersProps) {
  return (
    <GroupMembers
      members={members}
      onMemberClick={onMemberClick}
      onInvite={onInvite}
      showRoles={showRoles}
    />
  );
}
