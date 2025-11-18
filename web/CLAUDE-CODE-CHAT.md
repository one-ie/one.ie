# Claude Code Chat Integration

## 🚀 Quick Start

**Claude Code Sonnet is the DEFAULT model** - Just authenticate once and start chatting!

```bash
# One-time setup (takes 30 seconds)
npm install -g @anthropic-ai/claude-code
claude login
```

That's it! The chat interface will automatically use Claude Code with full tool access.

## What is Claude Code?

Claude Code is an AI provider that gives Claude models access to powerful built-in tools:

- **File Operations**: Read, Write, Edit files in your codebase
- **Search Tools**: Grep (search code), Glob (find files by pattern)
- **Command Execution**: Bash commands with controlled access
- **Web Fetching**: Fetch and analyze web content

## Available Models

The chat interface includes two Claude Code models (both appear FIRST in the "Free Models" section):

1. **Claude Code Sonnet** ⭐ - **DEFAULT MODEL** - Fast and balanced, great for most tasks
2. **Claude Code Opus** - Most capable, best for complex reasoning and coding tasks

Both models appear in the model selector with a "Tools" badge to indicate they have built-in tool access.

## Authentication

### Required: Claude Pro or Max Subscription

Claude Code models use your existing **Claude Pro** or **Claude Max** subscription. You need:

1. An active Claude Pro or Max subscription
2. The Claude Code CLI installed on your machine
3. Authentication via `claude login`

### Setup Instructions

#### 1. Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

#### 2. Authenticate

Run the login command:

```bash
claude login
```

This will:
- Open your browser
- Ask you to sign in to Claude
- Grant the CLI access to your Pro/Max subscription

#### 3. Verify Installation

```bash
claude --version
```

You should see the Claude Code CLI version number.

## Usage

### In the Chat Interface

1. Go to `/pages/chat` (or click "AI Chat" in navigation)
2. The model selector defaults to "Claude Code Sonnet"
3. Start chatting! Claude Code models work automatically with tool access

### Tool Capabilities

**⚠️ FULL WRITE PERMISSIONS ENABLED** - Claude Code has complete access to your codebase!

The chat interface gives Claude Code access to ALL tools:

| Tool | Permission | What it can do |
|------|-----------|----------------|
| **Read** | ✅ Enabled | Read any file in your project |
| **Write** | ✅ Enabled | Create or overwrite files |
| **Edit** | ✅ Enabled | Modify existing files |
| **Bash** | ✅ Enabled | Execute terminal commands |
| **Grep** | ✅ Enabled | Search content in files |
| **Glob** | ✅ Enabled | Find files by pattern |
| **WebFetch** | ✅ Enabled | Fetch and analyze web content |
| **LS** | ✅ Enabled | List directory contents |

**Example commands you can give:**

**Read and analyze:**
```
"Read the package.json file and tell me what dependencies we're using"
```

**Search the codebase:**
```
"Find all TypeScript files that import React hooks"
```

**Write new files:**
```
"Create a new API route at /api/users.ts with CRUD operations"
```

**Edit existing files:**
```
"Update the README to include installation instructions"
"Fix the TypeScript errors in src/components/Header.tsx"
```

**Execute commands:**
```
"Run npm test and show me the results"
"Install the @stripe/stripe-js package"
```

**Fetch web content:**
```
"Fetch the latest docs from tailwindcss.com and summarize the new features"
```

**Multi-step tasks:**
```
"Create a new React component for a product card, add it to the components folder,
and update the index page to use it"
```

### Security

**⚠️ IMPORTANT: Full Permissions Enabled by Default**

The chat interface gives Claude Code **complete access** to your codebase:
- ✅ Can read any file
- ✅ Can create/modify/delete files
- ✅ Can execute terminal commands
- ✅ Can install packages
- ✅ Can make network requests

**This is by design** - Claude Code is meant to be a powerful coding assistant that can actually help you build!

**Safety Features:**
1. **Git Integration** - All changes can be reviewed and reverted via git
2. **CLI Authentication** - Only you (via `claude login`) can use it
3. **Local Execution** - Runs on your machine, not in the cloud
4. **Transparent Actions** - All tool calls are visible in the conversation

**Restricting Permissions (Optional):**

If you want to limit what Claude Code can do, you can modify the API route:

```typescript
// In /api/chat-claude-code.ts, change the providerConfig:
const providerConfig = {
  allowedTools: ['Read', 'Grep', 'Glob'],  // Read-only mode
  disallowedTools: ['Bash', 'Write']        // Block execution and writing
};
```

**Best Practices:**
- Use git to track all changes
- Review file modifications before committing
- Run Claude Code in development environments, not production
- Keep your Claude CLI authenticated only on trusted machines

## Comparison with Other Models

### Claude Code vs OpenRouter Models

| Feature | Claude Code | OpenRouter Models |
|---------|-------------|-------------------|
| Authentication | Claude Pro/Max | API Key |
| Tool Access | Built-in (Read, Write, Bash, etc.) | None |
| Cost | Subscription-based | Pay-per-use |
| Context | 200K tokens | Varies by model |
| Use Case | Coding, file operations | General chat, content generation |

### When to Use Claude Code

**Use Claude Code when you need:**
- File reading/writing capabilities
- Code analysis and search
- Command execution
- Multi-file context
- Extended thinking (10min timeout)

**Use OpenRouter models when you need:**
- Simple conversations
- Content generation
- No file system access required
- Want to try different providers (OpenAI, Google, etc.)

## API Endpoints

### Claude Code Endpoint

```
POST /api/chat-claude-code
```

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Read package.json" }
  ],
  "model": "sonnet",
  "allowedTools": ["Read", "Grep"],
  "disallowedTools": ["Bash"]
}
```

**Response:**
Streaming response using AI SDK's `toDataStreamResponse()` format.

### OpenRouter Endpoint (Existing)

```
POST /api/chat
```

Still works for all OpenRouter models (Gemini, GPT, Claude, etc.)

## Extended Thinking

Claude Code models support extended thinking with up to 10-minute timeouts for complex problems:

```typescript
// Automatically enabled in the API route
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);

const result = streamText({
  model: claudeCode('opus'),
  messages,
  abortSignal: controller.signal,
});
```

## Troubleshooting

### "Authentication required" error

**Solution:** Run `claude login` to authenticate with your Claude Pro/Max account.

### "Claude Code CLI not found" error

**Solution:** Install the CLI globally:
```bash
npm install -g @anthropic-ai/claude-code
```

### Tools not working

**Check:**
1. Your subscription is active (Claude Pro or Max)
2. You're authenticated (`claude login`)
3. The requested tools aren't blocked in `allowedTools`/`disallowedTools`

### Model selector shows Claude Code but won't select

**Issue:** API key modal appearing for Claude Code models

**Solution:** Claude Code models should NOT require an API key. Check that the `isClaudeCode` check in ChatClientV2.tsx is working correctly.

## Learn More

- **AI SDK Claude Code Provider**: https://ai-sdk.dev/providers/community-providers/claude-code
- **Claude Code CLI**: https://github.com/anthropics/claude-code
- **Claude Pricing**: https://claude.ai/pricing

## Integration Summary

**What we built:**

1. ✅ Installed `ai-sdk-provider-claude-code` package
2. ✅ Created `/api/chat-claude-code` endpoint with streamText
3. ✅ Added Claude Code Opus and Sonnet to model selector
4. ✅ Set Claude Code Sonnet as default model
5. ✅ Added "Tools" badge to indicate capabilities
6. ✅ Automatic routing: Claude Code models → Claude Code API, others → OpenRouter API
7. ✅ No API key required (uses CLI authentication)

**Result:** Users can now chat with Claude models that have full tool access, making the chat interface a powerful code assistant that can read, write, search, and execute code!
