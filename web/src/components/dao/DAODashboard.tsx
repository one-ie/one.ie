/**
 * DAO Dashboard Component
 *
 * Displays DAO overview including governance parameters,
 * member count, and recent activity.
 *
 * @dimension things (DAO overview)
 * @category solana-components
 */

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Vote, Clock, Shield, ExternalLink } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface DAODashboardProps {
  daoId: string;
}

export function DAODashboard({ daoId }: DAODashboardProps) {
  const dao = useQuery(api.queries.dao.getDAO, {
    daoId: daoId as Id<'things'>,
  });

  if (dao === undefined) {
    return <DAODashboardSkeleton />;
  }

  if (!dao) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">DAO not found</p>
        </CardContent>
      </Card>
    );
  }

  const governance = dao.properties?.governance || {};
  const memberCount = dao.actualMemberCount || 0;
  const proposalCount = dao.properties?.proposalCount || 0;

  // Format time periods for display
  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{dao.name}</h1>
            <Badge variant="outline" className="capitalize">
              {dao.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Governance Token: {dao.governanceToken?.name || 'Unknown'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://explorer.solana.com/address/${dao.properties?.governanceAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </a>
          </Button>
          <Button asChild>
            <a href={`/dao/${daoId}/proposals`}>
              <Vote className="mr-2 h-4 w-4" />
              View Proposals
            </a>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {dao.userMembership ? 'You are a member' : 'Not a member'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposalCount}</div>
            <p className="text-xs text-muted-foreground">
              Total governance proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quorum</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{governance.quorum}%</div>
            <p className="text-xs text-muted-foreground">
              Required for proposals to pass
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voting Period</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(governance.votingPeriod || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Proposals open for voting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Governance Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Parameters</CardTitle>
          <CardDescription>
            Configuration for this DAO's decision-making process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Proposal Threshold</p>
              <p className="text-2xl font-bold">{governance.proposalThreshold || '0'}</p>
              <p className="text-xs text-muted-foreground">
                Tokens required to create proposal
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Execution Delay</p>
              <p className="text-2xl font-bold">
                {formatDuration(governance.executionDelay || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Timelock before execution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Membership (if member) */}
      {dao.userMembership && (
        <Card>
          <CardHeader>
            <CardTitle>Your Membership</CardTitle>
            <CardDescription>
              Your participation in this DAO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Voting Power</p>
                <p className="text-2xl font-bold">{dao.userMembership.votingPower}</p>
                <p className="text-xs text-muted-foreground">
                  Based on token holdings
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Proposals Created</p>
                <p className="text-2xl font-bold">{dao.userMembership.proposalsCreated}</p>
                <p className="text-xs text-muted-foreground">
                  Total proposals you created
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Votes Cast</p>
                <p className="text-2xl font-bold">{dao.userMembership.votesParticipated}</p>
                <p className="text-xs text-muted-foreground">
                  Proposals you voted on
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DAODashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
