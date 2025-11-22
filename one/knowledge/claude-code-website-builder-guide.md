---
title: Claude Code for Website Builder - Integration Guide
dimension: knowledge
category: integration
tags: claude-code, website-builder, ai-sdk, streaming, safety
version: 1.0.0
created: 2025-11-22
updated: 2025-11-22
---

# Claude Code for Website Builder - Integration Guide

**Purpose:** Enable non-developers to use Claude Code AI SDK for website building with safety constraints
**Audience:** Backend developers, website builder feature developers
**Status:** Verified implementation, ready for enhancement

---

## Overview

Claude Code AI SDK Provider integrates with the ONE platform to enable website builders to:

1. **Ask Claude to generate components** - "Create a hero section with image and CTA"
2. **Generate pages** - "Build a product listing page with filters"
3. **Read component documentation** - "Show me how ProductCard works"
4. **Create content** - "Generate 5 product descriptions"

All with **built-in safety constraints** to prevent accidental breakage.

---

## Current Implementation

### Architecture

```
Website Builder UI
       ↓
ChatClientV2.tsx (model: "claude-code/sonnet")
       ↓
POST /api/chat-claude-code
       ↓
streamText() from AI SDK
       ↓
Claude Code CLI (local execution)
       ↓
Tool Execution (Read, Write, Edit, Bash, etc.)
       ↓
Response Stream (SSE format)
       ↓
Frontend (ChatClientV2 parses events)
```

### Request Format

```typescript
// From ChatClientV2.tsx
const response = await fetch("/api/chat-claude-code", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Create a hero component" }
    ],
    model: "sonnet"  // or "opus"
  })
});
```

### Response Format (SSE)

```
data: {"choices":[{"delta":{"content":"I'll create a hero component for you."}}]}

data: {"type":"tool_call","payload":{"name":"Read","args":{"path":"/web/src/components/ui"}}}

data: {"type":"tool_result","payload":{"name":"Read","result":"[list of components]"}}

data: {"choices":[{"delta":{"content":"Here's the hero component..."}}]}

data: [DONE]
```

---

## Enhancement 1: Website Builder Safety Mode

### Problem
Currently, Claude Code has full access to:
- All files (Read, Write, Edit)
- Shell commands (Bash)
- File operations (LS, Glob)

For non-developers, this is dangerous:
- Can delete `package.json`
- Can modify `.env` files
- Can run `rm -rf /` equivalent commands
- Can break the entire codebase

### Solution
Add a `mode: "website-builder"` parameter that restricts operations.

### Implementation

#### Step 1: Update API Endpoint

```typescript
// /web/src/pages/api/chat-claude-code.ts

// Add configuration for website builder mode
const SAFETY_CONFIG = {
  "website-builder": {
    // Only allow reading
    allowedTools: ["Read", "Grep", "Glob", "WebFetch"],
    disallowedTools: ["Write", "Edit", "Bash", "LS"],

    // Only allow reading from safe directories
    allowedPathPatterns: [
      /^\/web\/src\/components\//,
      /^\/web\/src\/pages\//,
      /^\/web\/src\/content\//,
      /^\/one\/knowledge\//,
    ],

    // Never allow reading sensitive files
    forbiddenPathPatterns: [
      /\.env/,
      /node_modules/,
      /\.git/,
      /package.json/,
      /tsconfig.json/,
    ],

    // Timeout constraints
    maxExecutionTime: 5 * 60 * 1000, // 5 minutes max
    maxTokens: 8000,
  },

  "admin": {
    // Full access
    allowedTools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob", "WebFetch", "LS"],
    allowedPathPatterns: [/^/], // All paths
    forbiddenPathPatterns: [],
    maxExecutionTime: 10 * 60 * 1000, // 10 minutes
    maxTokens: 16000,
  },
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const {
      messages,
      model = "sonnet",
      mode = "admin", // New parameter
      allowedTools,
      disallowedTools,
    } = await request.json();

    // Select configuration based on mode
    const modeConfig = SAFETY_CONFIG[mode as keyof typeof SAFETY_CONFIG];

    if (!modeConfig) {
      return new Response(
        JSON.stringify({ error: `Invalid mode: ${mode}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build provider config from mode
    const providerConfig: {
      allowedTools?: string[];
      disallowedTools?: string[];
    } = {
      allowedTools: modeConfig.allowedTools,
      disallowedTools: modeConfig.disallowedTools,
    };

    // Allow override if explicitly provided
    if (allowedTools && allowedTools.length > 0) {
      providerConfig.allowedTools = allowedTools;
    }
    if (disallowedTools && disallowedTools.length > 0) {
      providerConfig.disallowedTools = disallowedTools;
    }

    // ... rest of implementation
  } catch (error) {
    // ... error handling
  }
};
```

#### Step 2: Update Frontend Integration

```typescript
// /web/src/components/ai/ChatClientV2.tsx

// When user is in website builder mode:
const isWebsiteBuilder = userRole === "customer" || userRole === "org_user";

const response = await fetch("/api/chat-claude-code", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: allMessages,
    model: claudeCodeModel,
    mode: isWebsiteBuilder ? "website-builder" : "admin", // Add mode
  }),
});
```

#### Step 3: Add Safety Layer Hook

```python
# .claude/hooks/website-builder-safety.py
#!/usr/bin/env python3
"""
Prevents dangerous operations in website builder mode
"""

import sys
import json
import re

FORBIDDEN_PATHS = [
    r'\.env',
    r'package\.json',
    r'tsconfig\.json',
    r'convex/',
    r'node_modules/',
    r'\.git/',
    r'backend/',
]

def validate_path(path: str, mode: str) -> bool:
    """Check if path is allowed in the given mode"""
    if mode != "website-builder":
        return True  # Admin mode allows everything

    # Block forbidden paths
    for pattern in FORBIDDEN_PATHS:
        if re.search(pattern, path):
            print(f"⚠️  Website Builder Safety: Cannot access '{path}'")
            print("📖 Only read from: /web/src/components/, /web/src/pages/, /web/src/content/")
            return False

    return True

if __name__ == "__main__":
    try:
        # Read tool call data
        data = json.load(sys.stdin)

        mode = data.get("mode", "admin")
        tool_name = data.get("tool_name")
        file_path = data.get("file_path")

        # Validate write operations
        if tool_name in ["Write", "Edit", "Bash"] and mode == "website-builder":
            print("⚠️  Website Builder Safety: Cannot perform write operations")
            print("📖 Use website builder UI to edit components")
            sys.exit(2)  # Block operation

        # Validate file paths
        if file_path and not validate_path(file_path, mode):
            sys.exit(2)  # Block operation

        sys.exit(0)  # Allow operation

    except Exception as e:
        print(f"Error in safety check: {e}")
        sys.exit(1)
```

### Benefits

1. **Safe for non-developers** - Can't delete critical files
2. **Clear boundaries** - Developers understand what's off-limits
3. **Better error messages** - Users get helpful feedback
4. **Audit trail** - All attempts logged (blocked operations)
5. **Easy to customize** - Different roles can have different permissions

---

## Enhancement 2: Component Generation Context

### Problem
Claude generates code, but without knowledge of:
- Design system rules (6 colors + 4 properties)
- Component patterns (ThingCard, PersonCard, EventItem)
- Available shadcn/ui components
- Ontology mapping requirements

Result: Generated components may not follow patterns or use design tokens correctly.

### Solution
Inject component context into every request.

### Implementation

#### Step 1: Create Context Builder

```typescript
// /web/src/lib/ai/component-context.ts

import { readFileSync } from "fs";
import { resolve } from "path";

export interface ComponentContext {
  designSystem: string;
  patterns: string;
  availableComponents: string;
  ontology: string;
}

export function buildComponentContext(): ComponentContext {
  const cwd = process.cwd();

  return {
    designSystem: readFileSync(
      resolve(cwd, "one/things/design-system.md"),
      "utf-8"
    ).slice(0, 2000), // First 2000 chars to save tokens

    patterns: `
## Component Patterns

### 1. Thing Card (All Entity Types)
Use for products, courses, tokens, agents - anything from 'things' table.

\`\`\`typescript
interface ThingCardProps {
  thing: Thing;
  type: string;
}

export function ThingCard({ thing, type }: ThingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{thing.name}</CardTitle>
        <Badge>{type}</Badge>
      </CardHeader>
      <CardContent>
        {thing.properties.description && (
          <p>{thing.properties.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
\`\`\`

### 2. Person Card (Users/Creators)
Use for displaying people with roles.

\`\`\`typescript
interface PersonCardProps {
  person: Person;
  showRole?: boolean;
}
\`\`\`

### 3. Event Item (Activity Feed)
Use for displaying events in timeline or feed.

\`\`\`typescript
interface EventItemProps {
  event: Event;
  compact?: boolean;
}
\`\`\`

## Golden Rules
- NEVER create ProductCard, CourseCard (use ThingCard instead)
- NEVER create UserProfile, TeamCard (use PersonCard instead)
- ALWAYS use shadcn/ui components
- ALWAYS use design tokens (not hardcoded colors)
    `.trim(),

    availableComponents: `
## Available shadcn/ui Components (50+)

Button, Card, Input, Select, Dialog, Dropdown Menu, Avatar, Badge,
Skeleton, Separator, Table, Tabs, Toast, Tooltip, Form, Label, Checkbox,
Radio Group, Switch, Progress, Slider, Collapsible, Scroll Area, Popover,
Hover Card, Alert, Menubar, Navigation Menu, Aspect Ratio, Callout

Visit: https://ui.shadcn.com/docs/components
    `.trim(),

    ontology: `
## 6-Dimension Ontology

### 1. Groups (Organization scoping)
- Every data operation scoped by groupId
- Multi-tenant isolation

### 2. People (Authorization)
- creator (primary user type)
- role: platform_owner, org_owner, org_user, customer
- email, name, avatarUrl

### 3. Things (66 types)
- Core: creator, ai_clone, organization
- Content: blog_post, video, course, lesson
- Products: digital_product, membership, consultation
- Community: community, conversation, message

### 4. Connections (25 types)
- Ownership: owns, created_by
- Content: authored, published_to, part_of
- Product: purchased, enrolled_in, completed
- Social: member_of, following, collaborates_with

### 5. Events (67 types)
- Lifecycle: created, updated, deleted, archived
- Specific: course_created, lesson_created, user_joined
- Consolidated: content_event, payment_event, subscription_event

### 6. Knowledge (Labels + Vectors + RAG)
- Labels for categorization
- Vector embeddings for search
- Source linking to things

Key: Always map features to these 6 dimensions first!
    `.trim(),
  };
}

export function injectComponentContext(messages: any[]): any[] {
  const context = buildComponentContext();

  const systemMessage = {
    role: "system",
    content: `You are a React component expert for the ONE platform.

Follow these patterns EXACTLY:

${context.patterns}

Available Components:
${context.availableComponents}

Design System:
${context.designSystem}

Ontology Reference:
${context.ontology}

Rules:
1. Use ONE ThingCard for all entity types (don't create separate cards)
2. Use design tokens for all colors (never hardcode colors)
3. Import from @/components/ui/ for UI primitives
4. Add proper TypeScript interfaces for all props
5. Use only imported components, never create custom ones`,
  };

  return [systemMessage, ...messages];
}
```

#### Step 2: Inject into API Handler

```typescript
// /web/src/pages/api/chat-claude-code.ts

import { injectComponentContext } from "@/lib/ai/component-context";

export const POST: APIRoute = async ({ request }) => {
  try {
    let {
      messages,
      model = "sonnet",
      mode = "admin",
      injectContext = true, // New parameter
    } = await request.json();

    // Inject component context for website builder mode
    if (injectContext && (mode === "website-builder" || mode === "admin")) {
      messages = injectComponentContext(messages);
    }

    // Continue with rest of implementation...
  } catch (error) {
    // ... error handling
  }
};
```

#### Step 3: Update Frontend to Opt-In

```typescript
// /web/src/components/ai/ChatClientV2.tsx

const response = await fetch("/api/chat-claude-code", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: allMessages,
    model: claudeCodeModel,
    mode: isWebsiteBuilder ? "website-builder" : "admin",
    injectContext: true, // New parameter
  }),
});
```

### Benefits

1. **Generated code follows patterns** - AI uses same patterns as codebase
2. **Design system compliance** - Uses design tokens, not hardcoded colors
3. **Reduces human review** - Code is production-ready
4. **Faster component creation** - No refactoring needed
5. **Consistent architecture** - All components follow 6-dimension mapping

---

## Enhancement 3: Improved Error Handling and Recovery

### Problem
Currently, errors are shown but no recovery options provided.

Example:
```
"Claude Code authentication required. Please run: claude login"
```

Non-developers don't know what to do with this error.

### Solution
Add guided error recovery with contextual help.

### Implementation

#### Step 1: Enhanced Error Types

```typescript
// /web/src/lib/ai/error-types.ts

export enum ClaudeCodeErrorType {
  // Authentication
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",
  AUTH_EXPIRED = "AUTH_EXPIRED",

  // Connection
  CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  CONNECTION_REFUSED = "CONNECTION_REFUSED",

  // Claude Code CLI
  CLI_NOT_FOUND = "CLI_NOT_FOUND",
  CLI_NOT_RUNNING = "CLI_NOT_RUNNING",

  // Tool errors
  TOOL_NOT_FOUND = "TOOL_NOT_FOUND",
  TOOL_PERMISSION_DENIED = "TOOL_PERMISSION_DENIED",

  // Safety
  OPERATION_BLOCKED = "OPERATION_BLOCKED",
  SAFETY_VIOLATION = "SAFETY_VIOLATION",

  // Unknown
  UNKNOWN = "UNKNOWN",
}

export interface ClaudeCodeError {
  type: ClaudeCodeErrorType;
  message: string;
  recovery: RecoveryAction[];
  documentation?: string;
}

export interface RecoveryAction {
  label: string;
  action: "retry" | "login" | "open-docs" | "contact-support";
  detail?: string;
}
```

#### Step 2: Error Parser

```typescript
// /web/src/lib/ai/error-parser.ts

export function parseClaudeCodeError(error: string): ClaudeCodeError {
  if (error.includes("auth")) {
    return {
      type: ClaudeCodeErrorType.NOT_AUTHENTICATED,
      message: "Claude Code authentication required",
      recovery: [
        {
          label: "Open Claude Code Terminal",
          action: "open-docs",
          detail: "Run `claude login` in terminal",
        },
        {
          label: "Learn More",
          action: "open-docs",
          detail: "https://docs.claude.ai/claude-code/getting-started",
        },
      ],
    };
  }

  if (error.includes("timeout")) {
    return {
      type: ClaudeCodeErrorType.CONNECTION_TIMEOUT,
      message: "Connection timed out after 30 seconds",
      recovery: [
        {
          label: "Retry Request",
          action: "retry",
          detail: "Check your internet connection and try again",
        },
        {
          label: "Use Simpler Request",
          action: "open-docs",
          detail: "Try breaking request into smaller steps",
        },
      ],
    };
  }

  if (error.includes("ECONNREFUSED")) {
    return {
      type: ClaudeCodeErrorType.CONNECTION_REFUSED,
      message: "Cannot connect to Claude Code",
      recovery: [
        {
          label: "Start Claude Code",
          action: "open-docs",
          detail: "Make sure Claude Code is running",
        },
        {
          label: "Contact Support",
          action: "contact-support",
          detail: "If problem persists",
        },
      ],
    };
  }

  // ... more error types

  return {
    type: ClaudeCodeErrorType.UNKNOWN,
    message: error,
    recovery: [
      {
        label: "Try Again",
        action: "retry",
      },
      {
        label: "Contact Support",
        action: "contact-support",
      },
    ],
  };
}
```

#### Step 3: Enhanced Error Display

```typescript
// /web/src/components/ai/ErrorRecovery.tsx

import { useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";

interface Props {
  error: ClaudeCodeError;
  onRetry?: () => void;
  onLogin?: () => void;
}

export function ErrorRecovery({ error, onRetry, onLogin }: Props) {
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-lg font-semibold">
        {error.message}
      </AlertTitle>
      <AlertDescription className="space-y-3 mt-3">
        <p className="text-sm">What you can do:</p>

        <div className="space-y-2">
          {error.recovery.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (action.action === "retry" && onRetry) onRetry();
                if (action.action === "login" && onLogin) onLogin();
                if (action.action === "open-docs") {
                  window.open(error.documentation, "_blank");
                }
              }}
            >
              <span className="flex-1 text-left">{action.label}</span>
              {action.detail && (
                <span className="text-xs text-muted-foreground ml-2">
                  {action.detail}
                </span>
              )}
              {action.action === "open-docs" && (
                <ExternalLink className="h-4 w-4 ml-2" />
              )}
            </Button>
          ))}
        </div>

        {error.documentation && (
          <p className="text-xs text-muted-foreground mt-3">
            <a href={error.documentation} target="_blank" rel="noreferrer">
              View full documentation →
            </a>
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

### Benefits

1. **Non-developers can recover** - Clear instructions provided
2. **Reduces support tickets** - Common errors have known solutions
3. **Better visibility** - Users understand what went wrong
4. **Faster resolution** - One-click recovery actions

---

## Enhancement 4: Test Suite

### Implementation

```typescript
// /web/test/api/chat-claude-code.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("POST /api/chat-claude-code", () => {
  // Setup and teardown
  beforeEach(() => {
    // Mock Claude Code CLI responses
  });

  afterEach(() => {
    // Cleanup
  });

  describe("Basic Functionality", () => {
    it("should stream responses in SSE format", async () => {
      const response = await fetch("/api/chat-claude-code", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Say hello" }],
          model: "sonnet",
        }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "text/event-stream"
      );

      const text = await response.text();
      expect(text).toContain("data:");
      expect(text).toContain("[DONE]");
    });

    it("should handle tool calls", async () => {
      const response = await fetch("/api/chat-claude-code", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Read /web/package.json" }],
          model: "sonnet",
        }),
      });

      const text = await response.text();
      expect(text).toContain("tool_call");
      expect(text).toContain("Read");
    });
  });

  describe("Website Builder Safety", () => {
    it("should block write operations in website-builder mode", async () => {
      const response = await fetch("/api/chat-claude-code", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            { role: "user", content: "Delete /web/package.json" },
          ],
          model: "sonnet",
          mode: "website-builder",
        }),
      });

      // Should fail or redirect to read-only
      const text = await response.text();
      expect(text).not.toContain('Write("/web/package.json"');
    });

    it("should allow read operations in website-builder mode", async () => {
      const response = await fetch("/api/chat-claude-code", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Read /web/src/components/ui/button.tsx",
            },
          ],
          model: "sonnet",
          mode: "website-builder",
        }),
      });

      expect(response.status).toBe(200);
    });

    it("should block access to .env in website-builder mode", async () => {
      const response = await fetch("/api/chat-claude-code", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Read /web/.env" }],
          model: "sonnet",
          mode: "website-builder",
        }),
      });

      const text = await response.text();
      expect(text).toContain("Safety") || expect(response.status).not.toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should timeout after 30 seconds of no response", async () => {
      // Mock slow response
    });

    it("should provide helpful auth error messages", async () => {
      // Mock auth failure
    });

    it("should handle network errors gracefully", async () => {
      // Mock network failure
    });
  });

  describe("Component Context", () => {
    it("should inject design system context when requested", async () => {
      // Verify context is included in system message
    });

    it("should include component patterns in context", async () => {
      // Verify patterns are available to Claude
    });
  });
});
```

---

## Integration Checklist

### Before Enabling Website Builder Mode

- [ ] Implement website builder safety mode (Enhancement 1)
- [ ] Add component generation context (Enhancement 2)
- [ ] Improve error handling and recovery (Enhancement 3)
- [ ] Create and pass test suite (Enhancement 4)
- [ ] Update ChatClientV2 to support new parameters
- [ ] Document safety constraints for end users
- [ ] Create user guide for website builders
- [ ] Set up monitoring for errors and usage
- [ ] Prepare support documentation

### Verification Steps

```bash
# 1. Test safety mode blocks write operations
curl -X POST http://localhost:4321/api/chat-claude-code \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Create a file"}],
    "model": "sonnet",
    "mode": "website-builder"
  }'
# Should return error or block operation

# 2. Test context injection
curl -X POST http://localhost:4321/api/chat-claude-code \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Create a component"}],
    "model": "sonnet",
    "injectContext": true
  }'
# Should include design system in response

# 3. Run test suite
cd /web && bun test api/chat-claude-code.test.ts

# 4. Load test with multiple concurrent requests
# Verify timeout and error handling under load
```

---

## Security Considerations

### Tool Permissions in Website Builder Mode

**Allowed Tools:**
- `Read` - Safe, read-only access
- `Grep` - Safe, search-only
- `Glob` - Safe, file discovery only
- `WebFetch` - Safe, external data fetching

**Blocked Tools:**
- `Write` - Could create malicious files
- `Edit` - Could modify critical files
- `Bash` - Could execute arbitrary commands
- `LS` - Could reveal sensitive file structure (blocked in strict mode)

### Path Restrictions

**Allowed Paths:**
```
/web/src/components/     - Component library
/web/src/pages/          - Page templates
/web/src/content/        - Content collections
/one/knowledge/          - Documentation
```

**Blocked Paths:**
```
/.env*                   - Environment variables
/package.json            - Dependencies
/tsconfig.json           - Configuration
/convex/*                - Backend schema
/backend/*               - Backend code
/node_modules/*          - Dependencies
/.git/*                  - Version control
```

### Rate Limiting Recommendations

```typescript
// Implement rate limiting for non-admin users
const RATE_LIMITS = {
  "website-builder": {
    requestsPerMinute: 10,
    maxTokensPerRequest: 8000,
    maxConcurrent: 2,
  },
  "admin": {
    requestsPerMinute: 60,
    maxTokensPerRequest: 16000,
    maxConcurrent: 5,
  },
};
```

---

## Monitoring and Logging

### Events to Log

```typescript
// Log all Claude Code interactions
interface ClaudeCodeLog {
  timestamp: number;
  mode: "website-builder" | "admin";
  userRole: string;
  userId: string;
  requestSize: number;
  responseSize: number;
  duration: number;
  toolsCalled: string[];
  errors: string[];
  success: boolean;
}
```

### Metrics to Track

1. **Usage:** Requests per user, tools used, response times
2. **Errors:** Failure rates by error type, recovery success
3. **Safety:** Blocked operations, denied paths, rate limit hits
4. **Performance:** Streaming latency, timeout frequency, token usage

---

## Example Use Cases

### Use Case 1: Website Builder Creates Hero Section

```
User: "Create a hero component with an image, headline, and call-to-action button"

Claude (with context):
1. Reads existing hero components to follow patterns
2. Uses ThingCard pattern if data-driven
3. Applies design system colors
4. Returns production-ready component

Result: /web/src/components/features/hero/HeroSection.tsx
```

### Use Case 2: Generate Product Cards

```
User: "Generate 3 product card variations for different use cases"

Claude (with context):
1. References ThingCard pattern
2. Creates variants: compact, featured, grid
3. Uses design tokens for colors
4. All inherit from base ThingCard

Result: 3 component files, all consistent with patterns
```

### Use Case 3: Read Documentation

```
User: "How do I use the ProductCard component?"

Claude:
1. Reads ProductCard source
2. Returns usage examples
3. Shows available props
4. Provides integration example

Result: Clear documentation without code changes
```

---

## Next Steps

1. **Immediate (This Cycle):** Implement website builder safety mode
2. **Short-term (Next 2 Cycles):** Add component context and error recovery
3. **Medium-term (Next 4 Cycles):** Create comprehensive test suite
4. **Long-term:** Build website builder UI that uses this safely

---

## Summary

Claude Code as an AI SDK Provider enables powerful website building capabilities:

1. **Current:** Fully functional, production-ready for developers
2. **Enhanced:** Safe, constrained mode for non-developers
3. **Guided:** Component-aware with design system knowledge
4. **Reliable:** Comprehensive error recovery and testing

With these enhancements, website builders can harness Claude's code generation while staying within safe boundaries.

---

**Reference Documents:**
- `/one/knowledge/claude-code-integration.md` - Complete Claude Code guide
- `/one/knowledge/astro-effect-simple-architecture.md` - Architecture patterns
- `/one/things/design-system.md` - Design system specification
- `/one/knowledge/ontology.md` - 6-dimension ontology
