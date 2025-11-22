/**
 * DomainSetup Component - Custom Domain Configuration UI
 *
 * Allows users to add custom domains, view DNS instructions, and verify domains
 * Uses nanostores for state management (frontend-only)
 */

import { useState } from "react";
import { useStore } from "@nanostores/react";
import {
  customDomains$,
  addCustomDomain,
  removeCustomDomain,
  verifyDomain,
  getDNSRecords,
  getDefaultSubdomain,
  getDomainsForFunnel,
  verifying$,
  type CustomDomain,
  type DomainStatus,
} from "@/stores/domains";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe,
  Plus,
  Check,
  X,
  Loader2,
  Copy,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface DomainSetupProps {
  funnelId: string;
  funnelSlug: string;
  funnelName: string;
}

export function DomainSetup({ funnelId, funnelSlug, funnelName }: DomainSetupProps) {
  const allDomains = useStore(customDomains$);
  const isVerifying = useStore(verifying$);
  const domains = allDomains.filter((d) => d.funnelId === funnelId);

  const [newDomain, setNewDomain] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<CustomDomain | null>(null);
  const [showDNSInstructions, setShowDNSInstructions] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const defaultSubdomain = getDefaultSubdomain(funnelSlug);

  // Add new domain
  const handleAddDomain = () => {
    if (!newDomain.trim()) return;

    // Basic domain validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(newDomain.toLowerCase())) {
      alert("Invalid domain format. Please enter a valid domain (e.g., example.com)");
      return;
    }

    const domain = addCustomDomain(funnelId, newDomain);
    setSelectedDomain(domain);
    setShowDNSInstructions(true);
    setNewDomain("");
  };

  // Verify domain
  const handleVerifyDomain = async (domainId: string) => {
    const result = await verifyDomain(domainId);
    alert(result.message);
  };

  // Copy to clipboard
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Remove domain
  const handleRemoveDomain = (domainId: string) => {
    if (confirm("Are you sure you want to remove this domain?")) {
      removeCustomDomain(domainId);
      if (selectedDomain?.id === domainId) {
        setSelectedDomain(null);
        setShowDNSInstructions(false);
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status: DomainStatus) => {
    const variants: Record<DomainStatus, { variant: any; icon: any; label: string }> = {
      pending: { variant: "outline", icon: AlertCircle, label: "Pending" },
      verifying: { variant: "secondary", icon: Loader2, label: "Verifying" },
      active: { variant: "default", icon: Check, label: "Active" },
      failed: { variant: "destructive", icon: X, label: "Failed" },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Default Subdomain Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Default Subdomain
          </CardTitle>
          <CardDescription>
            Your funnel is automatically available at this subdomain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-muted/50 px-4 py-3 font-mono text-sm">
              {defaultSubdomain}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(defaultSubdomain, "subdomain")}
            >
              {copiedField === "subdomain" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://${defaultSubdomain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This subdomain is always active and requires no configuration.
          </p>
        </CardContent>
      </Card>

      {/* Add Custom Domain Card */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domains</CardTitle>
          <CardDescription>
            Add your own domain (e.g., shop.yourdomain.com) to use for this funnel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Domain Form */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="domain" className="sr-only">
                Domain
              </Label>
              <Input
                id="domain"
                placeholder="shop.yourdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
              />
            </div>
            <Button onClick={handleAddDomain} disabled={!newDomain.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>

          {/* Domain List */}
          {domains.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{domain.domain}</p>
                        {getStatusBadge(domain.status)}
                      </div>
                      {domain.errorMessage && (
                        <p className="mt-1 text-sm text-destructive">
                          {domain.errorMessage}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Added {new Date(domain.addedAt).toLocaleDateString()}
                        {domain.verifiedAt && (
                          <> · Verified {new Date(domain.verifiedAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {domain.status === "pending" || domain.status === "failed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDomain(domain);
                            setShowDNSInstructions(true);
                          }}
                        >
                          Setup DNS
                        </Button>
                      ) : null}
                      {domain.status !== "verifying" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDomain(domain.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {domains.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No custom domains configured yet. Add your first domain above.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* DNS Instructions Card */}
      {showDNSInstructions && selectedDomain && (
        <Card>
          <CardHeader>
            <CardTitle>DNS Configuration</CardTitle>
            <CardDescription>
              Add these DNS records to your domain provider for{" "}
              <span className="font-mono">{selectedDomain.domain}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                DNS changes can take up to 24 hours to propagate. After adding these records,
                click "Verify Domain" to check the configuration.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold">Option 1: CNAME Record (Recommended)</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDNSRecords(selectedDomain.domain, funnelSlug)
                      .filter((r) => r.type === "CNAME")
                      .map((record, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{record.type}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {record.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {record.value}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopy(record.value, `cname-${idx}`)
                              }
                            >
                              {copiedField === `cname-${idx}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-semibold">Option 2: A Record</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDNSRecords(selectedDomain.domain, funnelSlug)
                      .filter((r) => r.type === "A")
                      .map((record, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{record.type}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {record.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {record.value}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(record.value, `a-${idx}`)}
                            >
                              {copiedField === `a-${idx}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-semibold">Verification Record (Optional)</h4>
                <p className="mb-2 text-sm text-muted-foreground">
                  Add this TXT record for faster verification
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDNSRecords(selectedDomain.domain, funnelSlug)
                      .filter((r) => r.type === "TXT")
                      .map((record, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{record.type}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {record.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm truncate max-w-[200px]">
                            {record.value}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(record.value, `txt-${idx}`)}
                            >
                              {copiedField === `txt-${idx}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold">Common DNS Providers</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <a
                  href="https://www.cloudflare.com/dns/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Cloudflare DNS
                </a>
                <a
                  href="https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Namecheap DNS
                </a>
                <a
                  href="https://support.google.com/domains/answer/3290309"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google Domains
                </a>
                <a
                  href="https://www.godaddy.com/help/manage-dns-records-680"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  GoDaddy DNS
                </a>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowDNSInstructions(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => handleVerifyDomain(selectedDomain.id)}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Verify Domain
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SSL Certificate Info */}
      {domains.some((d) => d.status === "active") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              SSL Certificates
            </CardTitle>
            <CardDescription>
              Automatic SSL certificates via Let's Encrypt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription>
                SSL certificates are automatically provisioned for verified domains within 24
                hours. Your funnel will be accessible via HTTPS once the certificate is
                issued.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
