/**
 * Voting Interface Component
 *
 * Interface for casting votes on active proposals.
 *
 * @dimension connections (voting)
 * @category solana-components
 */

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Minus, Loader2 } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface VotingInterfaceProps {
  proposalId: Id<'things'>;
}

type VoteDecision = 'for' | 'against' | 'abstain';

export function VotingInterface({ proposalId }: VotingInterfaceProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedVote, setSelectedVote] = useState<VoteDecision | null>(null);
  const castVote = useMutation(api.mutations.dao.castVote);

  const handleVote = async (decision: VoteDecision) => {
    setIsVoting(true);
    setSelectedVote(decision);

    try {
      const result = await castVote({
        proposalId,
        decision,
      });

      if (result.success) {
        toast.success('Vote cast successfully!', {
          description: `You voted ${decision}. Quorum ${result.quorumReached ? 'reached' : 'not reached'}.`,
        });
      }
    } catch (error) {
      console.error('Failed to cast vote:', error);
      toast.error('Failed to cast vote', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsVoting(false);
      setSelectedVote(null);
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Cast Your Vote</h3>
          <Badge variant="outline">Active</Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Vote For */}
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950"
            onClick={() => handleVote('for')}
            disabled={isVoting}
          >
            {isVoting && selectedVote === 'for' ? (
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            ) : (
              <ThumbsUp className="h-6 w-6 text-green-600" />
            )}
            <span className="text-sm font-medium">For</span>
          </Button>

          {/* Vote Against */}
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950"
            onClick={() => handleVote('against')}
            disabled={isVoting}
          >
            {isVoting && selectedVote === 'against' ? (
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            ) : (
              <ThumbsDown className="h-6 w-6 text-red-600" />
            )}
            <span className="text-sm font-medium">Against</span>
          </Button>

          {/* Abstain */}
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-950"
            onClick={() => handleVote('abstain')}
            disabled={isVoting}
          >
            {isVoting && selectedVote === 'abstain' ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            ) : (
              <Minus className="h-6 w-6 text-gray-600" />
            )}
            <span className="text-sm font-medium">Abstain</span>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Your voting power is based on your governance token holdings
        </p>
      </CardContent>
    </Card>
  );
}
