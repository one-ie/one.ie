/**
 * EventListener Component
 *
 * Listen to and display smart contract events in real-time.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export interface ContractEvent {
  id: string;
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
  args: Record<string, any>;
}

interface EventListenerProps {
  contractAddress?: string;
  events: ContractEvent[];
  isListening?: boolean;
  onStartListening?: (address: string, eventName?: string) => void;
  onStopListening?: () => void;
  onViewTransaction?: (txHash: string) => void;
  maxEvents?: number;
  className?: string;
}

export function EventListener({
  contractAddress,
  events = [],
  isListening = false,
  onStartListening,
  onStopListening,
  onViewTransaction,
  maxEvents = 20,
  className,
}: EventListenerProps) {
  const [inputAddress, setInputAddress] = useState(contractAddress || "");
  const [eventFilter, setEventFilter] = useState("");

  const filteredEvents = events
    .filter((event) =>
      eventFilter ? event.eventName === eventFilter : true
    )
    .slice(0, maxEvents);

  // Get unique event names for filter
  const uniqueEventNames = Array.from(
    new Set(events.map((e) => e.eventName))
  );

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-font text-lg">Event Listener</CardTitle>
            {isListening && (
              <Badge className="bg-tertiary text-white">
                <span className="animate-pulse mr-1">●</span> Listening
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Contract Address Input */}
        <div className="mb-4">
          <Label htmlFor="contract" className="text-font text-sm mb-2 block">
            Contract Address
          </Label>
          <div className="flex gap-2">
            <Input
              id="contract"
              placeholder="0x..."
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="bg-background font-mono"
              disabled={isListening}
            />
            {!isListening ? (
              <Button
                variant="primary"
                onClick={() => onStartListening?.(inputAddress)}
                disabled={!inputAddress}
              >
                Listen
              </Button>
            ) : (
              <Button variant="outline" onClick={onStopListening}>
                Stop
              </Button>
            )}
          </div>
        </div>

        {/* Event Filter */}
        {isListening && uniqueEventNames.length > 0 && (
          <div className="mb-4">
            <Label className="text-font text-sm mb-2 block">
              Filter Events
            </Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={eventFilter === "" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setEventFilter("")}
              >
                All ({events.length})
              </Button>
              {uniqueEventNames.map((name) => (
                <Button
                  key={name}
                  variant={eventFilter === name ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setEventFilter(name)}
                >
                  {name} ({events.filter((e) => e.eventName === name).length})
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Events List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-background rounded-md p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{event.eventName}</Badge>
                    <span className="text-font/60 text-xs">
                      Block #{event.blockNumber}
                    </span>
                  </div>
                  <div className="text-font/60 text-xs">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewTransaction?.(event.transactionHash)}
                >
                  View Tx
                </Button>
              </div>

              {Object.keys(event.args).length > 0 && (
                <div className="mt-2 bg-foreground rounded-md p-2">
                  <div className="text-font/60 text-xs mb-1">Arguments</div>
                  <pre className="text-font text-xs font-mono overflow-x-auto">
                    {JSON.stringify(event.args, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {filteredEvents.length === 0 && isListening && (
            <div className="bg-background rounded-md p-8 text-center">
              <p className="text-font/60">
                Waiting for events...
                <br />
                <span className="text-xs">
                  Events will appear here in real-time
                </span>
              </p>
            </div>
          )}

          {!isListening && (
            <div className="bg-background rounded-md p-8 text-center">
              <p className="text-font/60">
                Enter a contract address and click "Listen" to start monitoring
                events
              </p>
            </div>
          )}
        </div>

        {/* Event Count */}
        {events.length > maxEvents && (
          <div className="mt-4 text-center">
            <p className="text-font/60 text-sm">
              Showing latest {maxEvents} of {events.length} events
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
