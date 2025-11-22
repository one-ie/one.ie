/**
 * Proposal List Component
 *
 * Displays list of DAO proposals with filtering and voting status.
 *
 * @dimension things (proposal listing)
 * @category solana-components
 */

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VotingInterface } from './VotingInterface';
import { CheckCircle2, XCircle, Clock, Play, FileText } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface ProposalListProps {
  daoId: string;
}

type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'executed';

export function ProposalList({ daoId }: ProposalListProps) {
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | undefined>(undefined);

  const proposalsData = useQuery(api.queries.dao.listProposals, {
    daoId: daoId as Id<'things'>,
    status: statusFilter,
    limit: 50,
  });

  if (proposalsData === undefined) {
    return <ProposalListSkeleton />;
  }

  const proposals = proposalsData?.proposals || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'passed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'executed':
        return <Play className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'executed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeRemaining = (votingEnds: number) => {
    const now = Date.now();
    const diff = votingEnds - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={(value) => {
        setStatusFilter(value === 'all' ? undefined : value as ProposalStatus);
      }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="executed">Executed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Proposals */}
      {proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No proposals found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Be the first to create a proposal for this DAO
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{proposal.name}</CardTitle>
                      <Badge className={getStatusColor(proposal.properties.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(proposal.properties.status)}
                          {proposal.properties.status}
                        </span>
                      </Badge>
                      <Badge variant="outline">{proposal.properties.proposalType}</Badge>
                    </div>
                    <CardDescription>
                      {proposal.properties.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voting Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">For</p>
                    <p className="text-lg font-bold text-green-600">
                      {proposal.properties.voting.votesFor}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Against</p>
                    <p className="text-lg font-bold text-red-600">
                      {proposal.properties.voting.votesAgainst}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Abstain</p>
                    <p className="text-lg font-bold text-gray-600">
                      {proposal.properties.voting.votesAbstain}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Created: {formatDate(proposal.properties.timeline.createdAt)}
                  </span>
                  {proposal.properties.status === 'active' && (
                    <span className="text-blue-600 font-medium">
                      {formatTimeRemaining(proposal.properties.timeline.votingEnds)}
                    </span>
                  )}
                  {proposal.properties.timeline.executionETA && (
                    <span>
                      Executed: {formatDate(proposal.properties.timeline.executionETA)}
                    </span>
                  )}
                </div>

                {/* Quorum Status */}
                {proposal.properties.voting.quorumReached ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Quorum Reached
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                    <Clock className="mr-1 h-3 w-3" />
                    Quorum Not Reached
                  </Badge>
                )}

                {/* Voting Interface (for active proposals) */}
                {proposal.properties.status === 'active' && (
                  <VotingInterface proposalId={proposal._id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-12" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
