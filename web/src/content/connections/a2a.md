---
title: "Agent-to-Agent Protocol"
description: "Universal language for AI agents to collaborate. Framework-agnostic coordination across LangGraph, CrewAI, Semantic Kernel, and custom systems."
protocol: "a2a"
category: "coordination"
organization: "Google"
ontologyDimensions: ["Connections", "Events", "Things"]
createdAt: 2025-10-30T00:00:00Z
specification:
  version: "1.0"
  status: "active"
  standards:
    - "Google"
    - "Linux Foundation"
    - "Framework-agnostic"
features:
  - name: "Framework-Agnostic"
    description: "Work with any agent framework - LangGraph, CrewAI, AutoGen, custom"
  - name: "Multi-Agent Coordination"
    description: "Coordinate complex workflows with multiple specialized agents"
  - name: "Task Dependency Management"
    description: "Express dependencies, run tasks in parallel when possible"
  - name: "State Synchronization"
    description: "Keep agent states in sync across distributed systems"
ontologyMapping:
  groups: "A2A coordination happens within group boundaries"
  people: "Role-based access determines which agents can coordinate with which"
  things: "Agents, tasks, and workflow states stored as things"
  connections: "Task dependencies and delegations tracked as connections"
  events: "Coordination events (task_created, task_started, task_completed) logged"
  knowledge: "Workflow patterns and outcomes stored for learning"
useCases:
  - title: "Multi-Agent Workflow Orchestration"
    description: "Coordinate planner, researcher, writer, and reviewer agents"
    protocols: ["a2a", "acp"]
  - title: "Specialized Agent Teams"
    description: "Assemble domain-specific agents (sales, engineering, finance)"
    protocols: ["a2a"]
  - title: "Error Handling & Retries"
    description: "Handle failures gracefully with fallback agents"
    protocols: ["a2a"]
  - title: "Human-in-the-Loop Workflows"
    description: "Pause workflows for human approval before proceeding"
    protocols: ["a2a"]
examples:
  - title: "Define Multi-Agent Workflow"
    language: "typescript"
    code: |
      // Define workflow using A2A protocol
      const workflow = {
        id: "workflow_research_report",
        name: "Research and Write Report",
        agents: [
          {
            id: "agent_researcher",
            role: "researcher",
            task: "research_topic",
            inputs: { topic: "${topic}" }
          },
          {
            id: "agent_writer",
            role: "writer",
            task: "write_report",
            inputs: { research: "${agent_researcher.output}" },
            dependencies: ["agent_researcher"]
          },
          {
            id: "agent_editor",
            role: "editor",
            task: "review_report",
            inputs: { report: "${agent_writer.output}" },
            dependencies: ["agent_writer"]
          }
        ],
        outputs: {
          finalReport: "${agent_editor.output}"
        }
      };

      // Create workflow as thing
      const workflowId = await ctx.db.insert("things", {
        type: "workflow",
        name: workflow.name,
        groupId: ctx.auth?.getOrganizationId?.(),
        properties: {
          workflow: workflow,
          status: "draft"
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

  - title: "Execute Workflow with A2A"
    language: "typescript"
    code: |
      // Execute multi-agent workflow
      import { A2AClient } from "@a2a/sdk";

      const client = new A2AClient({ apiKey: process.env.A2A_API_KEY });

      // Start workflow
      const execution = await client.workflow.execute({
        workflowId: "workflow_research_report",
        inputs: {
          topic: "Quantum Computing Applications"
        },
        agents: [
          { id: "researcher", framework: "crewai" },
          { id: "writer", framework: "langgraph" },
          { id: "editor", framework: "custom" }
        ]
      });

      // Monitor execution
      execution.on("agent_completed", (event) => {
        console.log(`${event.agentId} completed: ${event.output}`);

        // Log to ontology
        await ctx.db.insert("events", {
          type: "task_completed",
          groupId: ctx.auth?.getOrganizationId?.(),
          actorId: event.agentId,
          targetId: workflowId,
          metadata: {
            protocol: "a2a",
            taskId: event.taskId,
            result: event.output
          },
          timestamp: Date.now()
        });
      });

      const result = await execution.wait();
      return result.outputs.finalReport;

  - title: "Handle Agent Failure with Fallback"
    language: "typescript"
    code: |
      // A2A with error handling and fallback agents
      const workflow = {
        tasks: [
          {
            id: "primary_search",
            agent: "web_search_agent",
            fallback: {
              agent: "cache_search_agent",
              condition: "timeout || rate_limit"
            }
          }
        ]
      };

      // Implement fallback handling
      try {
        result = await executeWithA2A(workflow.tasks[0]);
      } catch (error) {
        if (shouldUseFallback(error, workflow.tasks[0].fallback)) {
          result = await executeWithA2A(workflow.tasks[0].fallback);

          // Log fallback event
          await ctx.db.insert("events", {
            type: "agent_fallback",
            metadata: {
              protocol: "a2a",
              primary: workflow.tasks[0].agent,
              fallback: workflow.tasks[0].fallback.agent,
              reason: error.message
            },
            timestamp: Date.now()
          });
        }
      }
prerequisites:
  - "Multiple agent systems deployed"
  - "A2A-compatible agent frameworks"
  - "Task state storage (database or file)"
  - "Event streaming or logging system"
integrationLevel: "advanced"
standards:
  - "Google A2A Specification"
  - "Linux Foundation"
  - "Framework adapters for LangGraph, CrewAI, etc"
organizations:
  - "Google"
  - "Linux Foundation"
draft: false
---

## Overview

A2A (Agent-to-Agent) Protocol is a framework-agnostic standard for coordinating multiple AI agents. It allows agents built with different frameworks (LangGraph, CrewAI, Semantic Kernel, custom systems) to work together seamlessly.

The protocol focuses on task coordination, state sharing, and orchestration of complex multi-agent workflows.

## Key Characteristics

### Framework Independence
- Works with LangGraph (LangChain's agentic framework)
- Integrates CrewAI multi-agent orchestration
- Compatible with Semantic Kernel
- Supports custom agent systems
- No vendor lock-in

### Task Orchestration
- Express task dependencies clearly
- Automatic parallelization when dependencies allow
- Error handling and retry logic
- Monitoring and observability

### State Management
- Share state between agents safely
- Version control for agent outputs
- Rollback capabilities for failures
- Audit trail of all state changes

## Workflow Structure

A2A workflows define agents, tasks, and dependencies:

```typescript
{
  agents: [
    { id: "planner", role: "planning", framework: "langgraph" },
    { id: "researcher", role: "research", framework: "crewai" },
    { id: "executor", role: "execution", framework: "langgraph" }
  ],
  tasks: [
    { id: "plan", agent: "planner" },
    { id: "research", agent: "researcher", depends: ["plan"] },
    { id: "execute", agent: "executor", depends: ["research", "plan"] }
  ]
}
```

Execution graph:
```
┌─────────┐
│ Plan    │
└────┬────┘
     │
┌────▼─────────┐
│ Research     │
└────┬─────────┘
     │
┌────▼─────────┐
│ Execute      │
└──────────────┘
```

## Ontology Integration

A2A integrates with the 6-dimension ontology for complete tracking:

### Things
- **workflow**: Complete workflow definition
- **intelligence_agent**: Each participating agent
- **task**: Individual task in workflow
- All scoped to `groupId`

### Connections
- **delegated_to**: Agent delegates work to another agent
- **depends_on**: Task dependency relationships
- **coordinates_with**: Agent-to-agent coordination
- Rich metadata about task status

### Events
- **workflow_started**: Workflow execution began
- **task_started**: Individual task started
- **task_completed**: Task finished with output
- **task_failed**: Task failed with error
- **agent_fallback**: Fallback agent was used

### Knowledge
- **Workflow patterns**: Store successful workflow configurations
- **Performance metrics**: Track execution time, success rate
- **Error patterns**: Learn from failures
- **Agent capabilities**: Index agent specializations

## Multi-Agent Patterns

### Sequential Pipeline
Tasks execute one after another:
```
Task1 → Task2 → Task3 → Task4
```

### Parallel Execution
Independent tasks run simultaneously:
```
Task1 ─┐
Task2 ─┤→ Task4
Task3 ─┘
```

### Fan-Out/Fan-In
One task spawns multiple parallel subtasks:
```
       ┌─→ SubTask1 ─┐
Task1 ─┤─→ SubTask2 ─┤→ Task2
       └─→ SubTask3 ─┘
```

### Conditional Branching
Task execution depends on previous results:
```
       ┌─→ Task2 (if error)
Task1 ─┤
       └─→ Task3 (if success)
```

## Communication Between Agents

A2A enables agents to share information:

1. **Direct State Passing**: Output of one agent becomes input to next
2. **Shared Context**: Agents access shared knowledge base
3. **Message Exchange**: Agents communicate via message queue
4. **Event Streaming**: Agents subscribe to events

## Error Handling Strategy

A2A includes robust error handling:

- **Timeouts**: Set time limits for tasks
- **Retries**: Automatic retry with backoff
- **Fallbacks**: Use alternative agents
- **Circuit Breaker**: Stop cascading failures
- **Rollback**: Revert to previous state if needed

## Performance & Scaling

A2A designed for large-scale workflows:

- **Distributed Execution**: Run agents across multiple machines
- **Load Balancing**: Distribute tasks fairly
- **Result Caching**: Cache outputs to reduce redundant work
- **Monitoring**: Track performance metrics
- **Scaling**: Automatically scale up for large workflows

## Comparison with Other Protocols

| Aspect | A2A | ACP | MCP |
|--------|-----|-----|-----|
| **Primary Use** | Task coordination | Agent messaging | Resource access |
| **Focus** | Workflow orchestration | Inter-agent chat | AI data access |
| **State Management** | Rich, versioned | Minimal | None |
| **Task Tracking** | Built-in | Via connections | Via tools |

## Getting Started

1. Identify your agent frameworks and systems
2. Design your workflow with tasks and dependencies
3. Define agents and their capabilities
4. Implement A2A adapters for each framework
5. Deploy workflow coordinator
6. Monitor execution and optimize

## Best Practices

✅ **Keep tasks focused**: Each task should have one clear purpose
✅ **Use meaningful names**: Make workflow easy to understand
✅ **Set timeouts**: Prevent infinite waits
✅ **Monitor metrics**: Track performance and success rates
✅ **Version workflows**: Track changes over time
✅ **Document dependencies**: Make relationships explicit

## Related Resources

- **A2A Specification**: [Google A2A Spec](https://a2a.ai)
- **Framework Adapters**: [LangGraph](https://github.com/langchain-ai/langgraph) | [CrewAI](https://github.com/joaomdmoura/crewAI)
- **Example Workflows**: [Reference Implementations](https://github.com/one-ie/a2a-examples)
- **Community**: [A2A Discussions](https://github.com/a2a-protocol/discussions)
