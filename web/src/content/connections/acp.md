---
title: "Agent Communication Protocol"
description: "REST-based protocol for AI agent communication. Send messages, delegate tasks, and coordinate multi-agent workflows. Supports all data modalities."
protocol: "acp"
category: "communication"
organization: "Linux Foundation"
ontologyDimensions: ["Things", "Connections", "Events"]
createdAt: 2025-10-30T00:00:00Z
specification:
  version: "1.0"
  status: "active"
  standards:
    - "Linux Foundation"
    - "REST/HTTP"
    - "JSON-based"
features:
  - name: "Multimodal Support"
    description: "Send text, images, audio, video, and structured data between agents"
  - name: "Async-First Architecture"
    description: "Built for asynchronous communication with guaranteed delivery"
  - name: "Task Delegation"
    description: "Agents can delegate work to other agents with tracking"
  - name: "Message Routing"
    description: "Intelligent routing of messages based on agent capabilities"
ontologyMapping:
  groups: "ACPs operate within group boundaries with group-scoped message queues"
  people: "Each agent has a role-based access control determining what messages it can send/receive"
  things: "Agents are represented as things with type: 'intelligence_agent' and properties.protocols.acp"
  connections: "Messages create transacted connections between agents"
  events: "Each message triggers a communication_event with metadata.protocol: 'acp'"
  knowledge: "Message content can be indexed and searched via embeddings"
useCases:
  - title: "Multi-Agent Workflow Coordination"
    description: "Coordinate work across planning, execution, and verification agents"
    protocols: ["acp", "a2a"]
  - title: "Agent-to-Agent Query Distribution"
    description: "Query multiple specialist agents in parallel for different data needs"
    protocols: ["acp"]
  - title: "Task Delegation Pipeline"
    description: "Break down complex tasks and delegate subtasks to specialized agents"
    protocols: ["acp", "a2a"]
  - title: "Real-time Chat Between Agents"
    description: "Enable dynamic conversation and negotiation between AI systems"
    protocols: ["acp"]
examples:
  - title: "Send Message Between Agents"
    language: "typescript"
    code: |
      // Send ACP message from one agent to another
      const message = {
        from: "agent_planner_123",
        to: "agent_researcher_456",
        contentType: "application/json",
        body: {
          task: "Research competitive landscape",
          deadline: "2025-10-31",
          resources: ["web_search", "reports_database"]
        },
        timestamp: Date.now()
      };

      const response = await fetch('/api/acp/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-ID': 'agent_planner_123'
        },
        body: JSON.stringify(message)
      });

      const result = await response.json();
      console.log(`Message sent: ${result.messageId}`);

  - title: "Handle Incoming Messages"
    language: "typescript"
    code: |
      // Server handler for incoming ACP messages
      import { mutation } from "./_generated/server";

      export const receiveMessage = mutation({
        args: {
          messageId: v.string(),
          fromAgentId: v.string(),
          toAgentId: v.string(),
          contentType: v.string(),
          body: v.any()
        },
        handler: async (ctx, args) => {
          // Create a thing for this message
          const thingId = await ctx.db.insert("things", {
            type: "message",
            name: `Message from ${args.fromAgentId}`,
            groupId: ctx.auth?.getOrganizationId?.(),
            properties: {
              protocols: {
                acp: {
                  messageId: args.messageId,
                  contentType: args.contentType,
                  body: args.body
                }
              }
            },
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now()
          });

          // Log as event
          await ctx.db.insert("events", {
            type: "communication_event",
            groupId: ctx.auth?.getOrganizationId?.(),
            actorId: args.fromAgentId,
            targetId: thingId,
            metadata: {
              protocol: "acp",
              action: "message_received",
              contentType: args.contentType
            },
            timestamp: Date.now()
          });

          return thingId;
        }
      });

  - title: "Delegate Task to Another Agent"
    language: "typescript"
    code: |
      // Delegate a task using ACP
      const taskDelegation = {
        from: "agent_orchestrator_789",
        to: "agent_executor_012",
        taskType: "execute_plan",
        taskData: {
          planId: "plan_abc123",
          steps: [
            { id: 1, action: "validate", resource: "data_source_1" },
            { id: 2, action: "transform", resource: "data_source_2" },
            { id: 3, action: "publish", resource: "output_sink" }
          ]
        },
        metadata: {
          priority: "high",
          timeout: 3600000, // 1 hour
          retryPolicy: "exponential"
        }
      };

      // Create connection for this delegation
      const delegationId = await ctx.db.insert("connections", {
        type: "delegated_to",
        fromId: args.fromAgentId,
        toId: args.toAgentId,
        groupId: ctx.auth?.getOrganizationId?.(),
        metadata: {
          protocol: "acp",
          taskType: taskDelegation.taskType,
          taskData: taskDelegation.taskData
        },
        validFrom: Date.now(),
        validTo: Date.now() + 3600000
      });
prerequisites:
  - "Active group and organization setup"
  - "Agents registered in the system with agent type"
  - "Authentication/authorization configured for agent identification"
  - "Network connectivity for HTTP/REST calls"
integrationLevel: "basic"
standards:
  - "HTTP/1.1"
  - "REST API"
  - "JSON encoding"
organizations:
  - "Linux Foundation"
  - "Open Source Initiative"
draft: false
---

## Overview

ACP (Agent Communication Protocol) is a REST-based protocol that enables AI agents to communicate, coordinate tasks, and exchange information in real-time. It's designed for asynchronous, reliable communication between agents regardless of their underlying framework or deployment location.

## Key Characteristics

### Multimodal Communication
ACP supports sending and receiving all types of data:
- **Text & Structured Data**: JSON, YAML, plain text
- **Binary Data**: Images, audio, video, models
- **Streaming**: Large file transfers and real-time data
- **Metadata**: Content type, encoding, priorities

### Async-First Design
- Messages are queued and delivered asynchronously
- Guaranteed delivery with retry mechanisms
- No blocking calls required
- Works across network boundaries and time zones

### Task Delegation
- Agents can break down complex tasks and delegate to specialists
- Track task status and dependencies
- Handle failures and retries gracefully
- Maintain audit trail of all delegations

## Protocol Flow

```
Agent A                           ACP Queue                      Agent B
  │
  ├──→ POST /api/acp/messages ──→ [Queue] ──→ GET /webhook ──→ Process
  │                              ↓
  └─← Response with messageId    [Persist]
                                  ↓
                              [Deliver]
```

## Ontology Integration

ACP integrates with the 6-dimension ontology:

### Things
- **intelligence_agent**: Each agent is a thing
- **message**: Each message is stored as a thing
- All messages scoped to `groupId`

### Connections
- **delegated_to**: Agents delegate tasks to other agents
- **transacted**: Track communication between agents
- Bidirectional with metadata about the interaction

### Events
- **communication_event**: Every message creates an event
- **task_delegated**: When work is delegated
- Full audit trail with actor, target, timestamp

### Knowledge
- **Message embeddings**: Content indexed for semantic search
- **Agent profiles**: Capability descriptions stored as embeddings
- **Query optimization**: Find agents by capability

## Security Considerations

- **Agent Authentication**: Each agent authenticates via API keys or OAuth
- **Message Encryption**: Support for TLS and end-to-end encryption
- **Access Control**: Role-based permissions on agent capabilities
- **Audit Logging**: Complete record of all communications

## Comparison with Other Protocols

| Aspect | ACP | MCP | A2A |
|--------|-----|-----|-----|
| **Primary Use** | Agent messaging | Resource access | Task coordination |
| **Architecture** | REST/HTTP | Protocol/Tools | Framework integration |
| **Real-time** | Async queuing | Streaming | Sync & async |
| **Stateful** | Stateless | Stateful | State-dependent |

## Getting Started

1. Register your agent in the system
2. Create an API key for authentication
3. Implement the ACP webhook endpoint
4. Start sending and receiving messages
5. Monitor events and audit logs

## Related Resources

- **GitHub**: [ACP Specification](https://github.com/Linux-Foundation/acp)
- **Documentation**: [Full ACP Spec](https://spec.acp.ai)
- **Examples**: [Agent Implementation Guides](https://github.com/one-ie/acp-examples)
- **Community**: [ACP Discussions](https://github.com/Linux-Foundation/acp/discussions)
