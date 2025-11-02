---
title: "Agent-Generated UI"
description: "Dynamic interfaces from structured JSON. Agents send component specs, frontend renders securely. Charts, tables, forms, actions—all type-safe and composable."
protocol: "agui"
category: "interface"
organization: "ONE Platform"
ontologyDimensions: ["Things", "Knowledge", "Events"]
createdAt: 2025-10-30T00:00:00Z
specification:
  version: "1.0"
  status: "active"
  standards:
    - "ONE Platform"
    - "JSON Schema"
    - "Web Components"
features:
  - name: "Type-Safe Components"
    description: "JSON Schema validation ensures safe component rendering"
  - name: "Real-Time Updates"
    description: "WebSocket streaming for live UI updates"
  - name: "Composable Specs"
    description: "Build complex UIs from simple component definitions"
  - name: "Interactive Actions"
    description: "Users can interact with generated UIs (click, form submit, etc)"
ontologyMapping:
  groups: "UI components scoped to groups for multi-tenancy"
  people: "Role determines which UI components and actions are available"
  things: "UI component messages stored as things"
  connections: "User interactions with components tracked as connections"
  events: "Component renders, interactions, and updates logged as events"
  knowledge: "Component patterns and user interaction data used for optimization"
useCases:
  - title: "Agent-Generated Dashboards"
    description: "Agents create custom dashboards showing real-time data"
    protocols: ["agui", "mcp"]
  - title: "Dynamic Forms"
    description: "Agents generate forms with conditional fields based on context"
    protocols: ["agui"]
  - title: "Interactive Tables"
    description: "Agents create sortable, filterable tables of data"
    protocols: ["agui"]
  - title: "Charts & Visualizations"
    description: "Agents generate charts visualizing data analysis results"
    protocols: ["agui", "knowledge"]
examples:
  - title: "Send Chart Component from Agent"
    language: "typescript"
    code: |
      // Agent creates and sends a chart UI
      import { AgentUI } from "@agui/sdk";

      const ui = new AgentUI();

      // Create chart spec
      const chartSpec = {
        type: "chart",
        data: {
          type: "bar",
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Revenue",
              data: [120000, 150000, 180000, 210000],
              borderColor: "rgb(75, 192, 192)",
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          title: "Annual Revenue Trend"
        }
      };

      // Send to user
      await ui.send({
        componentType: "chart",
        spec: chartSpec,
        layout: {
          width: "full",
          height: "400px"
        }
      });

      // Store in ontology
      const thingId = await ctx.db.insert("things", {
        type: "message",
        name: "Revenue Chart",
        groupId: ctx.auth?.getOrganizationId?.(),
        properties: {
          protocols: {
            agui: {
              componentType: "chart",
              spec: chartSpec,
              createdBy: "agent_analyst"
            }
          }
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

  - title: "Create Interactive Form"
    language: "typescript"
    code: |
      // Agent creates form for user interaction
      const formSpec = {
        type: "form",
        fields: [
          {
            name: "email",
            type: "email",
            label: "Email Address",
            required: true,
            validation: {
              pattern: "^[^@]+@[^@]+\\.[^@]+$",
              message: "Invalid email format"
            }
          },
          {
            name: "messageType",
            type: "select",
            label: "Message Type",
            options: [
              { value: "feedback", label: "Feedback" },
              { value: "bug", label: "Bug Report" },
              { value: "feature", label: "Feature Request" }
            ]
          },
          {
            name: "message",
            type: "textarea",
            label: "Your Message",
            required: true,
            placeholder: "Please describe..."
          }
        ],
        actions: [
          {
            type: "submit",
            label: "Send",
            style: "primary",
            action: {
              type: "send_message",
              handler: "handleFormSubmit"
            }
          },
          {
            type: "button",
            label: "Cancel",
            style: "secondary",
            action: { type: "close" }
          }
        ]
      };

      // Send form to user
      const formId = await ui.send({
        componentType: "form",
        spec: formSpec,
        onSubmit: async (values) => {
          // Handle form submission
          console.log("Form submitted:", values);

          // Log interaction
          await ctx.db.insert("events", {
            type: "ui_interaction",
            groupId: ctx.auth?.getOrganizationId?.(),
            metadata: {
              protocol: "agui",
              componentType: "form",
              action: "submit",
              values: values
            },
            timestamp: Date.now()
          });
        }
      });

  - title: "Live Table with Real-Time Updates"
    language: "typescript"
    code: |
      // Agent creates table that updates in real-time
      const tableSpec = {
        type: "table",
        columns: [
          { key: "id", title: "ID", width: "60px" },
          { key: "name", title: "Name", width: "200px" },
          { key: "status", title: "Status", width: "100px" },
          { key: "progress", title: "Progress", width: "150px" }
        ],
        data: [
          { id: 1, name: "Task A", status: "active", progress: 65 },
          { id: 2, name: "Task B", status: "pending", progress: 0 },
          { id: 3, name: "Task C", status: "completed", progress: 100 }
        ],
        features: {
          sortable: true,
          filterable: true,
          pagination: { pageSize: 10 }
        }
      };

      // Send table
      const table = await ui.send({
        componentType: "table",
        spec: tableSpec,
        live: true // Enable real-time updates
      });

      // Update table as data changes
      const taskStream = db.query("things")
        .withIndex("by_type", q => q.eq("type", "task"))
        .watch();

      for await (const change of taskStream) {
        const updatedData = await fetchTableData();

        // Push update to client
        await table.update({
          data: updatedData
        });

        // Log update event
        await ctx.db.insert("events", {
          type: "ui_updated",
          metadata: {
            protocol: "agui",
            componentType: "table",
            rowCount: updatedData.length
          },
          timestamp: Date.now()
        });
      }
prerequisites:
  - "Frontend with AG-UI component library"
  - "WebSocket support for real-time updates"
  - "JSON Schema validation"
  - "Secure component rendering"
integrationLevel: "advanced"
standards:
  - "JSON Schema"
  - "Web Standards"
  - "Component-based architecture"
organizations:
  - "ONE Platform"
  - "Web Standards Community"
draft: false
---

## Overview

AG-UI (Agent-Generated UI) allows AI agents to create dynamic, interactive user interfaces by sending JSON specifications instead of building UI code. The frontend safely renders these specifications into beautiful, interactive components.

This enables agents to create custom dashboards, forms, tables, and visualizations tailored to each user's needs, all without requiring UI development skills.

## Key Characteristics

### Type-Safe Rendering
- JSON Schema validation ensures safety
- No arbitrary code execution
- Whitelist of allowed components
- Input sanitization

### Component-Based
- Pre-built components (table, chart, form, card)
- Composable into larger UIs
- Consistent styling and behavior
- Accessible by default

### Real-Time
- WebSocket support for streaming updates
- Live data refresh
- Server push for notifications
- Efficient delta updates

### Interactive
- Forms with validation
- Buttons with custom actions
- User interactions tracked
- Two-way data binding

## Component Types

### Data Display
- **Table**: Sortable, filterable tables
- **Chart**: Bar, line, pie, area charts
- **Card**: Rich information cards
- **List**: Simple lists and item collections

### Data Entry
- **Form**: Multi-field forms with validation
- **Input**: Single text input
- **Select**: Dropdown selections
- **Checkbox**: Boolean inputs
- **Textarea**: Multi-line text

### Interactions
- **Button**: Clickable buttons with actions
- **Link**: Hyperlinks and navigation
- **Modal**: Dialog boxes for confirmation
- **Notification**: Toast notifications

## Ontology Integration

AG-UI integrates with the 6-dimension ontology:

### Things
- **message**: Each UI component sent is a thing
- **ui_component**: Reusable component definitions
- All scoped to group for multi-tenancy

### Connections
- **authored_by**: Who created the UI component
- **viewed_by**: Who viewed the UI
- **interacted_with**: User interactions with UI

### Events
- **ui_rendered**: Component rendered to user
- **ui_interaction**: User clicked, typed, submitted
- **ui_updated**: Component data changed
- **ui_error**: Component failed to render

### Knowledge
- **Component patterns**: Common UI patterns
- **User interactions**: Understand user behavior
- **Engagement metrics**: Track UI effectiveness

## Example: Complete Dashboard

```typescript
const dashboard = {
  type: "layout",
  layout: "grid",
  grid: { columns: 2, gap: 16 },
  children: [
    {
      type: "card",
      layout: { gridColumn: "span 2" },
      title: "Sales Overview",
      children: [
        {
          type: "chart",
          data: salesData,
          width: "full"
        }
      ]
    },
    {
      type: "card",
      title: "Recent Orders",
      children: [
        {
          type: "table",
          columns: orderColumns,
          data: recentOrders
        }
      ]
    },
    {
      type: "card",
      title: "Team Performance",
      children: [
        {
          type: "chart",
          data: performanceData
        }
      ]
    }
  ]
};
```

## Security Model

AG-UI implements security through:

1. **Whitelist Validation**: Only allowed component types
2. **Schema Validation**: JSON Schema ensures valid structure
3. **Input Sanitization**: HTML/JS escape all user content
4. **Content Security Policy**: Prevent injection attacks
5. **Rate Limiting**: Prevent abuse
6. **Audit Logging**: Track all UI renders and interactions

## Real-Time Updates

AG-UI supports WebSocket-based real-time updates:

```
Agent              WebSocket Connection              User
  │                                                   │
  ├─ Send initial UI spec ──────────────────────→ │
  │                                                   │ Render
  │                                                   │
  ├─ Send update: { data: newData } ──────────→ │
  │                                                   │ Update
  │                                                   │
  ← [ User interacts: { action: submit } ] ────── │
  │                                                   │
  │ Handle action                                    │
  │ Send response: { status: success } ───────→ │
  │                                                   │ Show confirmation
```

## User Interaction Handling

When users interact with AG-UI components:

```typescript
// User clicks button or submits form
user_action = {
  componentId: "form_contact",
  action: "submit",
  values: {
    email: "user@example.com",
    message: "Hello"
  },
  timestamp: Date.now()
};

// Agent receives and handles
if (user_action.action === "submit") {
  const result = await handleSubmission(user_action.values);

  // Send response back to UI
  await ui.sendResponse({
    componentId: user_action.componentId,
    status: "success",
    message: "Message sent successfully!",
    nextAction: "close" // Close form after success
  });

  // Log interaction
  await ctx.db.insert("events", {
    type: "ui_interaction",
    metadata: {
      protocol: "agui",
      componentId: user_action.componentId,
      action: user_action.action
    },
    timestamp: Date.now()
  });
}
```

## Performance Optimization

AG-UI includes performance features:

- **Virtual Scrolling**: Handle large tables efficiently
- **Lazy Loading**: Load data on demand
- **Delta Updates**: Only send changed data
- **Compression**: Gzip compress UI specs
- **Caching**: Cache component specs

## Comparison with Other Protocols

| Aspect | AG-UI | ACP | MCP |
|--------|-------|-----|-----|
| **Primary Use** | UI rendering | Messaging | Resource access |
| **User Interaction** | Full UX | None | Tool calling |
| **Real-time** | WebSocket | Async queue | Streaming |
| **Components** | Rich variety | Message-based | Tool-based |

## Use Cases at Scale

### E-Commerce Agent
1. Agent queries catalog via MCP
2. Agent generates table of products
3. User sorts and filters via AG-UI
4. Agent generates checkout form
5. User submits payment
6. Agent processes via AP2

### Data Analysis Workflow
1. Agent runs analysis on data
2. Agent generates charts showing results
3. Agent creates form for "what-if" analysis
4. User inputs new parameters
5. Agent re-runs analysis
6. Charts update in real-time

### Project Management Dashboard
1. Agent aggregates project status
2. Agent generates live dashboard
3. Agent creates charts and tables
4. User clicks to drill into details
5. Agent fetches detailed data
6. UI updates with details

## Getting Started

1. Implement AG-UI component library on frontend
2. Define JSON schemas for your components
3. Teach agents to generate component specs
4. Test component rendering and interactions
5. Monitor user interactions and feedback
6. Iterate on UI design based on analytics

## Best Practices

✅ **Keep specs small**: Smaller JSON = faster transmission
✅ **Use real-time wisely**: Limit WebSocket updates
✅ **Provide feedback**: Show loading, success, error states
✅ **Validate input**: Server-side validation in handlers
✅ **Monitor performance**: Track render times and user satisfaction
✅ **Version your specs**: Support multiple schema versions

## Related Resources

- **AG-UI Specification**: [Component Reference](https://agui.one.ie)
- **Component Library**: [React components for AG-UI](https://github.com/one-ie/agui-components)
- **Examples**: [Dashboard, form, table examples](https://github.com/one-ie/agui-examples)
- **Patterns**: [Common UI patterns for agents](https://one.ie/connections/agui.md)
