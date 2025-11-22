/**
 * Create DAO Form Component
 *
 * Form for creating a new DAO with governance parameters.
 * Uses react-hook-form for validation and Convex for mutations.
 *
 * @dimension things (DAO creation form)
 * @category solana-components
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Rocket } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

// Form validation schema
const daoFormSchema = z.object({
  name: z.string().min(3, 'DAO name must be at least 3 characters').max(50),
  governanceTokenId: z.string().min(1, 'Please select a governance token'),
  quorum: z.number().min(1).max(100, 'Quorum must be between 1 and 100'),
  proposalThreshold: z.string().regex(/^\d+$/, 'Must be a valid number'),
  votingPeriod: z.number().min(60, 'Voting period must be at least 60 seconds'),
  executionDelay: z.number().min(0, 'Execution delay cannot be negative'),
});

type DAOFormValues = z.infer<typeof daoFormSchema>;

export function CreateDAOForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createDAO = useMutation(api.mutations.dao.createDAO);

  // Fetch user's tokens for governance token selection
  // const tokens = useQuery(api.queries.tokens.listTokensByCreator, {});

  const form = useForm<DAOFormValues>({
    resolver: zodResolver(daoFormSchema),
    defaultValues: {
      name: '',
      governanceTokenId: '',
      quorum: 10, // 10% quorum default
      proposalThreshold: '1000000000', // 1 token with 9 decimals
      votingPeriod: 259200, // 3 days in seconds
      executionDelay: 86400, // 1 day in seconds
    },
  });

  const onSubmit = async (data: DAOFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await createDAO({
        name: data.name,
        governanceTokenId: data.governanceTokenId as Id<'things'>,
        quorum: data.quorum,
        proposalThreshold: data.proposalThreshold,
        votingPeriod: data.votingPeriod,
        executionDelay: data.executionDelay,
      });

      if (result.success) {
        toast.success('DAO created successfully!', {
          description: `Governance address: ${result.governanceAddress}`,
        });

        // Redirect to DAO page
        window.location.href = `/dao/${result.daoId}`;
      }
    } catch (error) {
      console.error('Failed to create DAO:', error);
      toast.error('Failed to create DAO', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DAO Configuration</CardTitle>
        <CardDescription>
          Configure your DAO's governance parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* DAO Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DAO Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Amazing DAO" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your DAO
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Governance Token */}
            <FormField
              control={form.control}
              name="governanceTokenId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Governance Token</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="demo-token-1">Demo Token (DEMO)</SelectItem>
                      {/* In production, map over user's tokens */}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Token used for voting power (1 token = 1 vote)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quorum Percentage */}
            <FormField
              control={form.control}
              name="quorum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quorum (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum % of tokens that must vote for a proposal to pass
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proposal Threshold */}
            <FormField
              control={form.control}
              name="proposalThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Threshold (tokens)</FormLabel>
                  <FormControl>
                    <Input placeholder="1000000000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum tokens required to create a proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Voting Period */}
            <FormField
              control={form.control}
              name="votingPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voting Period (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={60}
                      placeholder="259200"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How long voting stays open (259200 = 3 days)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Execution Delay */}
            <FormField
              control={form.control}
              name="executionDelay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Execution Delay (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="86400"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Timelock before executing passed proposals (86400 = 1 day)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating DAO...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Create DAO
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
