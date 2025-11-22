/**
 * Domain Manager Component
 *
 * Manages custom domain configuration for Cloudflare Pages projects
 */

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface DomainManagerProps {
  groupId: Id<'groups'>;
  projectName: string;
}

export function DomainManager({ groupId, projectName }: DomainManagerProps) {
  const [domainName, setDomainName] = useState('');
  const [recordType, setRecordType] = useState<'CNAME' | 'A'>('CNAME');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Id<'things'> | null>(null);

  // Queries
  const domains = useQuery(api.queries.domains.listDomains, { groupId });
  const selectedDomainData = selectedDomain
    ? useQuery(api.queries.domains.getDomain, { domainId: selectedDomain })
    : null;
  const dnsInstructions = selectedDomain
    ? useQuery(api.queries.domains.getDNSInstructions, { domainId: selectedDomain })
    : null;

  // Mutations
  const addDomain = useMutation(api.mutations.domains.addCustomDomain);
  const verifyDNS = useMutation(api.mutations.domains.verifyDomainDNS);
  const removeDomain = useMutation(api.mutations.domains.removeCustomDomain);

  const handleAddDomain = async () => {
    if (!domainName.trim()) return;

    try {
      const result = await addDomain({
        groupId,
        domainName: domainName.trim(),
        projectName,
        recordType,
      });

      // Show DNS instructions
      setSelectedDomain(result.domainId);
      setDomainName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add domain:', error);
      alert(error instanceof Error ? error.message : 'Failed to add domain');
    }
  };

  const handleVerifyDNS = async (domainId: Id<'things'>) => {
    try {
      await verifyDNS({ domainId });
      alert('DNS verification initiated. Please wait a few moments and refresh.');
    } catch (error) {
      console.error('Failed to verify DNS:', error);
      alert(error instanceof Error ? error.message : 'Failed to verify DNS');
    }
  };

  const handleRemoveDomain = async (domainId: Id<'things'>) => {
    if (!confirm('Are you sure you want to remove this domain?')) return;

    try {
      await removeDomain({ domainId });
      setSelectedDomain(null);
    } catch (error) {
      console.error('Failed to remove domain:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove domain');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSSLBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>
            Configure custom domains for your Cloudflare Pages project: {projectName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Domain Form */}
          {!isAdding ? (
            <Button onClick={() => setIsAdding(true)}>Add Custom Domain</Button>
          ) : (
            <div className="space-y-4 border rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium mb-2">Domain Name</label>
                <Input
                  type="text"
                  placeholder="example.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">DNS Record Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recordType"
                      value="CNAME"
                      checked={recordType === 'CNAME'}
                      onChange={() => setRecordType('CNAME')}
                    />
                    CNAME (Recommended)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recordType"
                      value="A"
                      checked={recordType === 'A'}
                      onChange={() => setRecordType('A')}
                    />
                    A Record
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddDomain}>Add Domain</Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Domain List */}
          {domains && domains.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Configured Domains</h3>
              {domains.map((domain) => (
                <div
                  key={domain._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedDomain(domain._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{domain.name}</div>
                      <div className="text-sm text-gray-500">
                        Project: {domain.projectName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(domain.verificationStatus)}
                      {getSSLBadge(domain.sslStatus)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {domains && domains.length === 0 && !isAdding && (
            <Alert>
              <AlertDescription>
                No custom domains configured yet. Click "Add Custom Domain" to get started.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* DNS Configuration Instructions */}
      {selectedDomain && selectedDomainData && dnsInstructions && (
        <Card>
          <CardHeader>
            <CardTitle>DNS Configuration for {selectedDomainData.name}</CardTitle>
            <CardDescription>
              Follow these steps to configure your DNS settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">DNS Verification</div>
                <div className="mt-1">{getStatusBadge(selectedDomainData.verificationStatus)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">SSL Certificate</div>
                <div className="mt-1">{getSSLBadge(selectedDomainData.sslStatus)}</div>
              </div>
            </div>

            {/* DNS Instructions */}
            <div className="space-y-4">
              <h4 className="font-semibold">Configuration Steps:</h4>
              {dnsInstructions.steps.map((step: any) => (
                <div key={step.step} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-medium">
                    Step {step.step}: {step.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{step.description}</div>
                  {step.value && (
                    <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
                      {step.value}
                    </div>
                  )}
                  {step.values && (
                    <div className="mt-2 space-y-1">
                      {step.values.map((value: string, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-100 rounded font-mono text-sm">
                          {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Example Configuration */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2">Example DNS Record:</h4>
              <div className="space-y-1 text-sm font-mono">
                <div>Type: {dnsInstructions.example.type}</div>
                <div>Name: {dnsInstructions.example.name}</div>
                <div>Value: {dnsInstructions.example.value}</div>
                <div>TTL: {dnsInstructions.example.ttl}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => handleVerifyDNS(selectedDomain)}>
                Verify DNS Configuration
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRemoveDomain(selectedDomain)}
              >
                Remove Domain
              </Button>
              <Button variant="outline" onClick={() => setSelectedDomain(null)}>
                Close
              </Button>
            </div>

            {/* SSL Certificate Info */}
            {selectedDomainData.verificationStatus === 'verified' && (
              <Alert>
                <AlertDescription>
                  Once DNS is verified, Cloudflare will automatically provision an SSL
                  certificate for your domain. This usually takes 5-15 minutes.
                </AlertDescription>
              </Alert>
            )}

            {/* Pending Verification */}
            {selectedDomainData.verificationStatus === 'pending' && (
              <Alert>
                <AlertDescription>
                  DNS verification is pending. Make sure you've configured your DNS records
                  correctly and allow 5-10 minutes for propagation before verifying.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
