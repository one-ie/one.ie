---
title: Plugin Contribution Guide
dimension: knowledge
category: contribution-guide
tags: elizaos, plugins, contribution, community, submission
related_dimensions: things, connections, events, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: complete
ai_context: |
  Guide for submitting plugins to the ONE Platform registry.
  Covers submission process, review criteria, and community guidelines.
---

# Plugin Contribution Guide

**Contributing Plugins to ONE Platform**

Thank you for contributing to the ONE Platform plugin ecosystem! This guide walks you through submitting your plugin to the registry.

---

## Table of Contents

1. [Overview](#overview)
2. [Before You Submit](#before-you-submit)
3. [Submission Process](#submission-process)
4. [Review Criteria](#review-criteria)
5. [Plugin Categories](#plugin-categories)
6. [Quality Standards](#quality-standards)
7. [Security Requirements](#security-requirements)
8. [Documentation Requirements](#documentation-requirements)
9. [Post-Submission](#post-submission)
10. [Community Guidelines](#community-guidelines)

---

## Overview

### What is the Plugin Registry?

The ONE Platform Plugin Registry is a curated collection of plugins that extend agent capabilities. All plugins go through:

1. **Automated validation** - Security scans, structure checks
2. **Community review** - Peer review by experienced developers
3. **Approval** - Final review by ONE Platform maintainers
4. **Publication** - Available to all ONE Platform users

### Why Submit Your Plugin?

- **Reach thousands of users** - Every ONE Platform organization can discover your plugin
- **Build your reputation** - Showcase your work to the community
- **Get feedback** - Community reviews improve your code
- **Earn recognition** - Featured plugins get highlighted
- **Future revenue** - Paid plugin marketplace coming soon

---

## Before You Submit

### Pre-Submission Checklist

- [ ] Plugin is complete and tested
- [ ] All tests pass (`bun test`)
- [ ] Plugin validated (`one-plugin validate --strict`)
- [ ] README includes clear usage examples
- [ ] LICENSE file included (MIT, Apache 2.0, or GPL recommended)
- [ ] No hardcoded secrets or credentials
- [ ] No malicious or obfuscated code
- [ ] Plugin follows ONE Platform patterns
- [ ] Semantic versioning (1.0.0 for first submission)

### Required Files

Your plugin repository must include:

```
your-plugin/
├── src/
│   └── index.ts           # Plugin entry point
├── tests/
│   └── *.test.ts          # Test files
├── README.md              # Documentation
├── LICENSE                # License file
├── package.json           # NPM package config
├── plugin.config.json     # ONE Platform plugin config
├── tsconfig.json          # TypeScript config (if using TS)
└── .gitignore             # Git ignore file
```

### Validate Before Submitting

```bash
# Run validation
one-plugin validate --strict

# Run tests
bun test

# Check for security issues
npm audit

# Build to ensure it compiles
bun run build
```

---

## Submission Process

### Step 1: Publish to NPM

Your plugin must be published to npm before submitting to the ONE Platform registry.

```bash
# Ensure you're logged in to npm
npm login

# Build plugin
bun run build

# Publish to npm
npm publish
```

**Package name requirements:**

- Must be unique on npm
- Lowercase, alphanumeric with hyphens
- Descriptive (e.g., `one-plugin-weather`, `eliza-solana-plugin`)

### Step 2: Fork the Registry Repository

```bash
# Fork https://github.com/one-platform/plugin-registry
# Clone your fork
git clone https://github.com/YOUR_USERNAME/plugin-registry
cd plugin-registry

# Create branch for your plugin
git checkout -b add-plugin-your-plugin-name
```

### Step 3: Add Your Plugin

Add your plugin to `registry/index.json`:

```json
{
  "plugins": [
    {
      "name": "your-plugin",
      "displayName": "Your Plugin",
      "description": "Brief description of what your plugin does",
      "author": {
        "name": "Your Name",
        "email": "your.email@example.com",
        "github": "your-github-username"
      },
      "version": "1.0.0",
      "npmPackage": "your-plugin",
      "repository": "https://github.com/your-username/your-plugin",
      "category": "action",
      "tags": ["tag1", "tag2", "tag3"],
      "license": "MIT",
      "verified": false,
      "featured": false,
      "permissions": [
        "network.external"
      ],
      "secrets": [
        {
          "key": "API_KEY",
          "description": "API key for external service",
          "required": true
        }
      ],
      "compatibility": {
        "elizaos": ">=0.1.0",
        "onePlatform": ">=1.0.0"
      },
      "documentation": {
        "readme": "https://github.com/your-username/your-plugin#readme",
        "examples": "https://github.com/your-username/your-plugin/tree/main/examples"
      },
      "submittedAt": "2025-11-22T10:00:00Z",
      "submittedBy": "your-github-username"
    }
  ]
}
```

### Step 4: Create Pull Request

```bash
# Commit your changes
git add registry/index.json
git commit -m "Add your-plugin to registry"

# Push to your fork
git push origin add-plugin-your-plugin-name

# Create pull request on GitHub
# Title: "Add [Your Plugin Name] to registry"
# Description: Use the template below
```

**Pull Request Template:**

```markdown
## Plugin Submission: [Your Plugin Name]

### Description

[Brief description of what your plugin does]

### Plugin Information

- **Name:** your-plugin
- **Category:** action | provider | evaluator | blockchain | other
- **NPM Package:** https://npmjs.com/package/your-plugin
- **Repository:** https://github.com/your-username/your-plugin
- **License:** MIT

### Features

- Feature 1
- Feature 2
- Feature 3

### Testing

- [ ] All tests pass
- [ ] Tested in ONE Platform playground
- [ ] No security vulnerabilities
- [ ] Documentation is complete

### Checklist

- [ ] Plugin published to npm
- [ ] README includes usage examples
- [ ] LICENSE file included
- [ ] No hardcoded secrets
- [ ] Follows ONE Platform patterns
- [ ] Tests included

### Additional Notes

[Any additional information reviewers should know]
```

### Step 5: Automated Validation

Once you create the pull request, automated checks will run:

- **Structure validation** - Ensures all required fields present
- **Security scan** - Checks for vulnerabilities and malicious code
- **Package verification** - Confirms npm package exists and is accessible
- **License validation** - Ensures OSI-approved license
- **Code quality** - Linting and style checks

**If checks fail:**

1. Review the error messages
2. Fix issues in your plugin
3. Publish updated version to npm
4. Update PR with new version

### Step 6: Community Review

Community members will review your plugin:

- **Code quality** - Is the code well-written and maintainable?
- **Functionality** - Does the plugin work as described?
- **Documentation** - Is the README clear and complete?
- **Security** - Are there any security concerns?
- **Value** - Does this plugin provide value to users?

**Typical review time:** 48-72 hours

**Respond to feedback:**

- Address review comments promptly
- Make requested changes
- Push updates to npm and PR
- Thank reviewers for their time

### Step 7: Final Approval

ONE Platform maintainers perform final review:

- Overall quality assessment
- Conflicts with existing plugins
- Alignment with platform direction
- Security and safety verification

**If approved:**

- PR is merged
- Plugin appears in registry within 15 minutes
- Automated tweet announces new plugin
- You're notified via email

**If changes requested:**

- Maintainers will provide specific feedback
- Address concerns and resubmit
- Process repeats from Step 6

---

## Review Criteria

### Code Quality (40 points)

- **Well-structured** (10pts): Code is organized and follows best practices
- **Type-safe** (10pts): TypeScript with proper types
- **Tested** (10pts): Comprehensive test coverage (>80%)
- **Documented** (10pts): Clear JSDoc comments

### Functionality (30 points)

- **Works as described** (15pts): Plugin does what README says
- **Error handling** (10pts): Graceful error handling
- **Performance** (5pts): Efficient implementation

### Security (20 points)

- **No vulnerabilities** (10pts): Passes security scan
- **Safe practices** (5pts): No eval(), proper sanitization
- **Secret handling** (5pts): Uses runtime.getSetting()

### Documentation (10 points)

- **Clear README** (5pts): Easy to understand
- **Examples** (3pts): Working code examples
- **API docs** (2pts): Clear API documentation

**Minimum score to pass:** 70/100

---

## Plugin Categories

Choose the most appropriate category:

### Action

Plugins that execute commands or perform tasks.

**Examples:** Send token, search web, create image

**Characteristics:**

- Implements Action interface
- Executes on user command
- Returns success/failure

### Provider

Plugins that fetch and return data.

**Examples:** Weather data, price feeds, news

**Characteristics:**

- Implements Provider interface
- Returns formatted data
- Used in decision-making

### Evaluator

Plugins that score or evaluate situations.

**Examples:** Sentiment analysis, spam detection, trust scoring

**Characteristics:**

- Implements Evaluator interface
- Returns score 0-1
- Used for agent decisions

### Blockchain

Plugins that interact with blockchains.

**Examples:** Solana transactions, EVM interactions, token swaps

**Characteristics:**

- Blockchain interactions
- Wallet management
- Transaction handling

### Knowledge

Plugins that manage knowledge or memory.

**Examples:** RAG systems, memory stores, document indexing

**Characteristics:**

- Vector embeddings
- Semantic search
- Knowledge retrieval

### Client

Plugins that connect to external platforms.

**Examples:** Discord, Twitter, Telegram

**Characteristics:**

- Platform authentication
- Message sending/receiving
- Event handling

### Browser

Plugins that interact with web browsers.

**Examples:** Web scraping, form filling, screenshots

**Characteristics:**

- Playwright/Puppeteer usage
- DOM interaction
- Navigation automation

### Other

Plugins that don't fit other categories.

**Examples:** Utilities, integrations, experimental features

---

## Quality Standards

### Code Standards

1. **Formatting**: Use Prettier or similar
2. **Linting**: ESLint with recommended rules
3. **TypeScript**: Use strict mode
4. **Comments**: JSDoc for all public APIs
5. **Naming**: Clear, descriptive names

### Testing Standards

1. **Coverage**: >80% code coverage
2. **Unit tests**: Test all functions
3. **Integration tests**: Test end-to-end flows
4. **Mocks**: Use runtime mocks for testing
5. **Edge cases**: Test error scenarios

### Documentation Standards

1. **README**: Clear overview, installation, usage, examples
2. **API docs**: TypeDoc or similar
3. **Examples**: At least 2 working examples
4. **Troubleshooting**: Common issues section
5. **License**: Clear license file

---

## Security Requirements

### Prohibited

- **No malicious code**: Crypto miners, keyloggers, data theft
- **No obfuscation**: Code must be readable
- **No eval()**: Dynamic code execution
- **No file system writes**: Read-only access only
- **No process spawning**: No `exec()` or `spawn()`

### Required

- **Input validation**: Sanitize all inputs
- **Secret management**: Use `runtime.getSetting()`
- **Error handling**: Try-catch all async operations
- **Rate limiting**: Respect API rate limits
- **Timeout handling**: Set timeouts for external calls

### Best Practices

```typescript
// ✅ Good
const apiKey = runtime.getSetting("API_KEY");
if (!apiKey) {
  throw new Error("API_KEY not configured");
}

// ❌ Bad
const apiKey = "hardcoded-key-abc123";

// ✅ Good
const response = await Promise.race([
  fetch(url),
  timeout(5000)
]);

// ❌ Bad
const response = await fetch(url); // No timeout

// ✅ Good
const userInput = sanitize(message.content.text);

// ❌ Bad
eval(message.content.text); // Code injection!
```

---

## Documentation Requirements

### README Structure

Your README must include:

```markdown
# Plugin Name

Brief description (1-2 sentences)

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

### For ONE Platform Users

[Installation instructions]

### For Developers

\`\`\`bash
npm install your-plugin
\`\`\`

## Configuration

[Required settings and secrets]

## Usage

\`\`\`typescript
// Example code
\`\`\`

## API Reference

[Link to API docs or inline documentation]

## Examples

[Working code examples]

## Troubleshooting

### Common Issue 1

Solution...

### Common Issue 2

Solution...

## Contributing

[How to contribute]

## License

MIT © Your Name
```

### Example Quality

Include at least 2 complete, working examples:

**Example 1: Basic Usage**

```typescript
import { weatherPlugin } from "weather-plugin";

// Use in agent
const agent = {
  plugins: [weatherPlugin]
};
```

**Example 2: Advanced Usage**

```typescript
import { weatherPlugin } from "weather-plugin";
import { mockRuntime } from "@one-platform/plugin-sdk/testing";

// Test plugin
const runtime = mockRuntime({
  settings: { WEATHER_API_KEY: "test-key" }
});

const result = await weatherPlugin.actions[0].handler(
  runtime,
  mockMessage({ content: { text: "Weather in NYC" } })
);
```

---

## Post-Submission

### After Approval

1. **Monitor issues**: Respond to user issues on GitHub
2. **Track analytics**: View usage stats at `/plugins/analytics`
3. **Engage community**: Answer questions on Discord
4. **Update regularly**: Fix bugs, add features
5. **Maintain docs**: Keep README current

### Versioning

Follow semantic versioning (semver):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Updating Your Plugin

```bash
# Make changes
# Update version in package.json
# Publish to npm
npm publish

# Update registry entry
# Create PR to update version in registry/index.json
```

### Plugin Badge

Add badge to your README:

```markdown
[![ONE Platform Plugin](https://img.shields.io/badge/ONE%20Platform-Plugin-blue)](https://one.ie/plugins/your-plugin)
```

### Getting Featured

Featured plugins appear on homepage. Criteria:

- High quality (90+ review score)
- Popular (>100 installations)
- Well-maintained (active updates)
- Great documentation
- Community engagement

---

## Community Guidelines

### Be Respectful

- Treat reviewers and users with respect
- Accept constructive criticism gracefully
- Provide helpful, polite responses to issues

### Be Collaborative

- Help other plugin developers
- Share knowledge and best practices
- Contribute to documentation improvements

### Be Transparent

- Clearly document limitations
- Acknowledge bugs and issues
- Be honest about capabilities

### Be Responsive

- Respond to issues within 7 days
- Address security issues immediately
- Keep plugin maintained and updated

### Be Professional

- Follow code of conduct
- No spam or self-promotion
- Quality over quantity

---

## Support

### Getting Help

- **Discord**: Join #plugin-development channel
- **Forums**: https://community.one.ie
- **Email**: plugins@one.ie
- **Office Hours**: Weekly video calls (Fridays 2pm UTC)

### Resources

- **Development Guide**: `one/knowledge/plugin-development-guide.md`
- **API Reference**: `one/knowledge/plugin-api-reference.md`
- **Migration Guide**: `one/knowledge/plugin-migration-guide.md`
- **Examples**: https://github.com/one-platform/plugin-examples

---

## Frequently Asked Questions

### Can I submit multiple plugins?

Yes! Each plugin needs separate submission.

### How long does review take?

Typically 48-72 hours for initial review, 1-2 weeks total.

### Can I update my plugin after submission?

Yes, publish new version to npm and update registry entry.

### What if my plugin is rejected?

You'll receive detailed feedback. Address concerns and resubmit.

### Can I charge for my plugin?

Not yet. Paid plugin marketplace coming soon.

### Do I retain ownership?

Yes, you retain full ownership and rights to your code.

### Can I use GPL license?

Yes, but plugins must be compatible with MIT/Apache 2.0.

### What happens to abandoned plugins?

After 6 months of inactivity, plugins may be marked as unmaintained.

---

**Thank you for contributing to the ONE Platform plugin ecosystem! 🚀**

Together, we're building the future of AI agent capabilities.

Built with the 6-dimension ontology. Community-driven, universally compatible.
