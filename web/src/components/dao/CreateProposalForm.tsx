/**
 * Create Proposal Form Component
 *
 * Form for creating new governance proposals.
 *
 * @dimension things (proposal creation)
 * @category solana-components
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, FileText } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

// Form validation schema
const proposalFormSchema = z.object({
  name: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  proposalType: z.enum(['parameter', 'treasury', 'upgrade', 'general']),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

interface CreateProposalFormProps {
  daoId: string;
}

export function CreateProposalForm({ daoId }: CreateProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createProposal = useMutation(api.mutations.dao.createProposal);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      name: '',
      description: '',
      proposalType: 'general',
    },
  });

  const onSubmit = async (data: ProposalFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await createProposal({
        daoId: daoId as Id<'things'>,
        name: data.name,
        description: data.description,
        proposalType: data.proposalType,
        actions: [], // Actions would be defined based on proposal type
      });

      if (result.success) {
        toast.success('Proposal created successfully!', {
          description: `Voting ends: ${new Date(result.votingEnds).toLocaleDateString()}`,
        });

        // Reset form
        form.reset();
      }
    } catch (error) {
      console.error('Failed to create proposal:', error);
      toast.error('Failed to create proposal', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Proposal</CardTitle>
        <CardDescription>
          Submit a proposal for DAO members to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Proposal Title */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Add new feature to protocol..." {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, concise title for your proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proposal Type */}
            <FormField
              control={form.control}
              name="proposalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="parameter">Parameter Change</SelectItem>
                      <SelectItem value="treasury">Treasury Action</SelectItem>
                      <SelectItem value="upgrade">Protocol Upgrade</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Category of your proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your proposal in detail..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed explanation of what this proposal does and why
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
                    Creating Proposal...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Proposal
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
