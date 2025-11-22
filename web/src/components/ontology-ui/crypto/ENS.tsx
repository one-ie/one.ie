/**
 * ENS Component
 *
 * Ethereum Name Service lookup and management.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface ENSRecord {
  name: string;
  address: string;
  avatar?: string;
  description?: string;
  twitter?: string;
  github?: string;
  email?: string;
  url?: string;
}

interface ENSProps {
  onLookup?: (nameOrAddress: string) => Promise<ENSRecord | null>;
  onRegister?: (name: string) => Promise<void>;
  className?: string;
}

export function ENS({ onLookup, onRegister, className }: ENSProps) {
  const [query, setQuery] = useState("");
  const [record, setRecord] = useState<ENSRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async () => {
    if (!query || !onLookup) return;

    setIsSearching(true);
    setRecord(null);
    setNotFound(false);

    try {
      const result = await onLookup(query);
      if (result) {
        setRecord(result);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">ENS Lookup</CardTitle>
          <p className="text-font/60 text-sm">
            Resolve Ethereum names and addresses
          </p>
        </CardHeader>

        {/* Search */}
        <div className="mb-4">
          <Label htmlFor="ens-query" className="text-font text-sm mb-2 block">
            ENS Name or Address
          </Label>
          <div className="flex gap-2">
            <Input
              id="ens-query"
              placeholder="vitalik.eth or 0x..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="bg-background font-mono"
            />
            <Button
              variant="primary"
              onClick={handleLookup}
              disabled={!query || isSearching}
            >
              {isSearching ? "..." : "Lookup"}
            </Button>
          </div>
        </div>

        {/* ENS Record */}
        {record && (
          <div className="bg-background rounded-md p-4">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={record.avatar} />
                <AvatarFallback className="bg-primary text-white">
                  {record.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-font font-semibold text-lg">
                  {record.name}
                </div>
                <div className="text-font/60 text-xs font-mono break-all">
                  {record.address}
                </div>
              </div>
              <Badge className="bg-tertiary text-white">✓ Resolved</Badge>
            </div>

            {record.description && (
              <p className="text-font text-sm mb-3">{record.description}</p>
            )}

            {/* Social Links */}
            {(record.twitter || record.github || record.email || record.url) && (
              <div className="space-y-2 text-sm">
                {record.url && (
                  <div className="flex items-center gap-2">
                    <span className="text-font/60">Website:</span>
                    <a
                      href={record.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {record.url}
                    </a>
                  </div>
                )}
                {record.twitter && (
                  <div className="flex items-center gap-2">
                    <span className="text-font/60">Twitter:</span>
                    <a
                      href={`https://twitter.com/${record.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{record.twitter}
                    </a>
                  </div>
                )}
                {record.github && (
                  <div className="flex items-center gap-2">
                    <span className="text-font/60">GitHub:</span>
                    <a
                      href={`https://github.com/${record.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {record.github}
                    </a>
                  </div>
                )}
                {record.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-font/60">Email:</span>
                    <span className="text-font">{record.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Not Found */}
        {notFound && (
          <div className="bg-background rounded-md p-8 text-center">
            <p className="text-font/60 mb-3">
              No ENS record found for "{query}"
            </p>
            {query.endsWith(".eth") && onRegister && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRegister(query)}
              >
                Register {query}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
