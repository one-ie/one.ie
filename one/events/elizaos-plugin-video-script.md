---
title: ElizaOS Plugins - Video Walkthrough Script
dimension: events
category: marketing
tags: video, tutorial, elizaos, plugins, demo
related_dimensions: knowledge, things
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: draft
ai_context: |
  This document is part of the events dimension in the marketing category.
  Location: one/events/elizaos-plugin-video-script.md
  Purpose: Script for video demo of elizaOS plugin system
  For AI agents: Use this to create video walkthroughs of plugin features.
---

# ElizaOS Plugins - Video Walkthrough Script

**Duration:** 9 minutes
**Format:** Screen recording + voiceover
**Target Audience:** Developers, AI enthusiasts, potential users
**Goal:** Demonstrate plugin installation and usage end-to-end

---

## Pre-Production Checklist

**Environment Setup:**
- [ ] Clean browser (no extensions, fresh session)
- [ ] ONE Platform account logged in
- [ ] Test Solana wallet with devnet SOL
- [ ] Discord test server set up
- [ ] Screen recording software ready (OBS, Loom, etc.)
- [ ] Microphone tested (clear audio)
- [ ] Background music (subtle, non-intrusive)

**Demo Data:**
- [ ] Sample organization with agents
- [ ] Test API keys (Solana RPC, Discord bot token)
- [ ] Example prompts prepared

**Visual Assets:**
- [ ] ONE Platform logo (intro/outro)
- [ ] Plugin icons
- [ ] Animated transitions
- [ ] Highlight callouts (arrows, circles)

---

## Script Timeline

### SEGMENT 1: Introduction (0:00 - 1:00)

**[Visual: ONE Platform logo animation]**

**Voiceover:**
> "Imagine your AI agents could access blockchain networks, remember every conversation, scrape the web, and connect to Discord—all with just a few clicks."
>
> "That's now possible with ONE Platform's ElizaOS plugin integration."
>
> "In the next 9 minutes, I'll show you how to browse 261 plugins, install them, and use them with your AI agents."

**[Visual: Fade to desktop, browser opening to one.ie]**

**Screen Actions:**
- Open browser
- Navigate to one.ie
- Show clean, modern landing page

**Voiceover:**
> "Let's dive in."

---

### SEGMENT 2: Browsing the Plugin Marketplace (1:00 - 2:00)

**[Visual: Navigate to /plugins]**

**Screen Actions:**
1. Click "Plugins" in main navigation
2. Show plugin marketplace loading
3. Display grid of plugin cards

**Voiceover:**
> "The plugin marketplace gives you access to 261 ElizaOS plugins across 6 categories."
>
> "Each plugin extends your AI agents with new capabilities—blockchain transactions, knowledge bases, social media integration, and more."

**[Visual: Scroll through plugin grid slowly]**

**Screen Actions:**
- Highlight different plugin categories (show category badges)
- Show plugin cards: name, icon, description, rating

**Voiceover:**
> "You can browse by category, search by name, or use semantic search to describe what you need."

**[Visual: Demo semantic search]**

**Screen Actions:**
1. Type in search bar: "blockchain wallet integration"
2. Show results: plugin-solana, plugin-wallet, plugin-0x
3. Clear search
4. Type: "remember conversations"
5. Show results: plugin-memory, plugin-knowledge

**Voiceover:**
> "Semantic search understands what you're trying to do, not just keyword matching."

---

### SEGMENT 3: Viewing Plugin Details (2:00 - 3:00)

**[Visual: Click on plugin-solana]**

**Screen Actions:**
- Navigate to plugin detail page
- Show plugin header (name, logo, install button)
- Scroll through sections

**Voiceover:**
> "Let's install the Solana plugin, which lets your agents interact with the Solana blockchain."
>
> "The detail page shows everything you need to know: what the plugin does, what capabilities it provides, what dependencies it needs, and how to configure it."

**[Visual: Highlight sections as mentioned]**

**Screen Actions:**
1. Show "Description" section (what plugin does)
2. Show "Capabilities" section (actions, providers, evaluators)
3. Show "Dependencies" section (required packages)
4. Show "Configuration" section (API keys needed)
5. Show "Examples" section (code samples)

**Voiceover:**
> "You can see this plugin requires a Solana RPC endpoint. We'll configure that during installation."

**[Visual: Scroll to reviews section]**

**Screen Actions:**
- Show community ratings (5 stars, 247 installs)
- Show sample reviews

**Voiceover:**
> "Community ratings help you choose trusted plugins. This one has 5 stars from 247 installations."

---

### SEGMENT 4: Installing a Plugin (3:00 - 5:00)

**[Visual: Click "Install" button]**

**Screen Actions:**
- Installation wizard opens (modal/dialog)
- Step 1: Review dependencies

**Voiceover:**
> "Installation is a guided process. First, review dependencies."
>
> "Plugin-solana needs a few npm packages, but no other plugins. ONE Platform handles dependencies automatically."

**[Visual: Click "Next"]**

**Screen Actions:**
- Step 2: Configure settings

**Voiceover:**
> "Next, configure the plugin. We need to provide a Solana RPC endpoint."

**[Visual: Enter configuration]**

**Screen Actions:**
1. Show configuration form
2. Enter RPC URL: `https://api.devnet.solana.com`
3. Show password-style API key field (masked)
4. Show "Test Connection" button (optional)
5. Click "Test Connection"
6. Show success checkmark

**Voiceover:**
> "API keys are encrypted and stored securely. You can test the connection before installing."
>
> "Connection successful. Let's continue."

**[Visual: Click "Next"]**

**Screen Actions:**
- Step 3: Review permissions

**Voiceover:**
> "Now review what permissions this plugin needs."

**[Visual: Show permission list]**

**Screen Actions:**
- Show permissions:
  - ✅ network.external (Make HTTP requests to Solana RPC)
  - ✅ storage.read (Read wallet addresses from database)
  - ✅ events.publish (Log transactions)

**Voiceover:**
> "Plugin-solana needs network access to call the RPC endpoint, storage access to read wallet addresses, and permission to log events."
>
> "You control all permissions. If anything looks suspicious, you can cancel."

**[Visual: Click "Install"]**

**Screen Actions:**
- Show progress bar
- Show status messages:
  - "Installing dependencies..."
  - "Validating plugin code..."
  - "Setting up sandbox..."
  - "Installation complete!"
- Show success animation

**Voiceover:**
> "Installation takes about 20 seconds. ONE Platform is validating the code, setting up the sandbox, and configuring everything."
>
> "Done! The Solana plugin is installed."

---

### SEGMENT 5: Activating Plugin for Agent (5:00 - 6:00)

**[Visual: Redirect to installed plugins page]**

**Screen Actions:**
- Show installed plugins dashboard
- Highlight plugin-solana card

**Voiceover:**
> "Now we need to activate the plugin for our AI agents."

**[Visual: Click plugin-solana card]**

**Screen Actions:**
- Show plugin management page
- Click "Activate for Agent" button
- Show agent selection modal

**Voiceover:**
> "You can choose which agents can use this plugin. Let's enable it for our trading agent."

**[Visual: Select agent from dropdown]**

**Screen Actions:**
1. Show dropdown of agents
2. Select "Trading Agent"
3. Show permission confirmation
4. Click "Activate"
5. Show success message

**Voiceover:**
> "Perfect. Our trading agent can now interact with the Solana blockchain."

---

### SEGMENT 6: Executing Plugin Action (6:00 - 7:30)

**[Visual: Navigate to Action Executor]**

**Screen Actions:**
- Click "Execute Action" button
- Show action executor interface

**Voiceover:**
> "Let's test it. We can manually execute plugin actions using the Action Executor."

**[Visual: Select action]**

**Screen Actions:**
1. Select plugin: plugin-solana
2. Select action: "Get Token Balance"
3. Show parameter form

**Voiceover:**
> "We'll check the token balance for a Solana wallet."

**[Visual: Enter parameters]**

**Screen Actions:**
1. Enter wallet address (paste from clipboard)
2. Enter token mint address (SOL native token)
3. Click "Execute"

**Voiceover:**
> "Enter the wallet address and token mint. Then execute."

**[Visual: Show execution]**

**Screen Actions:**
- Show loading spinner
- Show execution logs (real-time):
  - "Connecting to Solana RPC..."
  - "Fetching account data..."
  - "Calculating balance..."
  - "Execution complete (1.2s)"
- Show result:
  ```json
  {
    "balance": 15.7,
    "decimals": 9,
    "uiAmount": "15.7 SOL"
  }
  ```

**Voiceover:**
> "In just over 1 second, the plugin connected to Solana, fetched the account data, and returned the balance."
>
> "15.7 SOL in this test wallet."

**[Visual: Show execution logs tab]**

**Screen Actions:**
- Click "Logs" tab
- Show detailed logs
- Show "Events" tab
- Show event log: plugin_action_executed

**Voiceover:**
> "Every execution is logged. You can see detailed logs, events, and performance metrics."

---

### SEGMENT 7: Using Plugin in Agent Conversation (7:30 - 8:30)

**[Visual: Navigate to agent chat]**

**Screen Actions:**
- Navigate to "Agents" page
- Select "Trading Agent"
- Open chat interface

**Voiceover:**
> "Now let's see it in action. We'll chat with our trading agent."

**[Visual: Type message]**

**Screen Actions:**
1. Type: "What's my Solana wallet balance?"
2. Send message
3. Show agent thinking animation

**Voiceover:**
> "I'm asking the agent to check my Solana wallet balance."

**[Visual: Agent response]**

**Screen Actions:**
- Agent typing indicator
- Agent response appears:
  > "I've checked your Solana wallet. You currently have **15.7 SOL**. Would you like me to monitor it for changes?"

**Voiceover:**
> "The agent automatically used the Solana plugin to fetch the balance and responded in natural language."
>
> "No code. No API calls. Just conversation."

**[Visual: Type follow-up]**

**Screen Actions:**
1. Type: "Yes, alert me if it drops below 10 SOL"
2. Send message
3. Agent response:
  > "Monitoring enabled. I'll notify you if your balance falls below 10 SOL."

**Voiceover:**
> "And just like that, we've set up automated monitoring. The agent will use the plugin to check periodically."

---

### SEGMENT 8: Conclusion & Call to Action (8:30 - 9:00)

**[Visual: Fade to summary slide]**

**Screen Actions:**
- Show summary animation:
  - ✅ Browsed 261+ plugins
  - ✅ Installed plugin-solana in < 2 minutes
  - ✅ Executed blockchain actions
  - ✅ Enabled AI agent automation

**Voiceover:**
> "In just 9 minutes, we've browsed the plugin marketplace, installed a blockchain plugin, executed actions, and enabled our AI agent to interact with Solana."
>
> "This is the power of ONE Platform with ElizaOS plugins."

**[Visual: Show plugin categories]**

**Screen Actions:**
- Montage of plugin categories:
  - Blockchain (Solana, 0x, EVM)
  - Knowledge (RAG, memory, timeline)
  - Social (Discord, Telegram, Twitter)
  - Web (browser, scraping, search)
  - LLM (OpenRouter, OpenAI, Claude)

**Voiceover:**
> "261 plugins across 6 categories. Blockchain, knowledge, social media, web automation, LLMs, and developer tools."
>
> "All secured, sandboxed, and mapped to the 6-dimension ontology."

**[Visual: Call to action slide]**

**Screen Actions:**
- Show:
  - **Get Started:** one.ie/plugins
  - **Documentation:** one.ie/plugins/docs
  - **Join Community:** discord.gg/one-platform

**Voiceover:**
> "Ready to build your own AI agents with plugin superpowers?"
>
> "Visit one.ie/plugins to get started."
>
> "Join our Discord community to share your agent creations."
>
> "Thanks for watching!"

**[Visual: ONE Platform logo + music fade out]**

---

## Post-Production Checklist

**Editing:**
- [ ] Add intro animation (0-5 seconds)
- [ ] Add background music (subtle, instrumental)
- [ ] Add text overlays for key points
- [ ] Add highlight callouts (arrows, circles on important UI elements)
- [ ] Add smooth transitions between segments
- [ ] Add captions/subtitles (accessibility)
- [ ] Add outro with links (on-screen text)

**Audio:**
- [ ] Normalize audio levels
- [ ] Remove background noise
- [ ] Add subtle sound effects (click sounds, success chimes)
- [ ] Mix background music (quiet, non-intrusive)

**Visual:**
- [ ] Color grade for consistency
- [ ] Add zoom effects on important actions
- [ ] Speed up slow parts (2x speed with indicator)
- [ ] Add B-roll footage if needed

**Export:**
- [ ] Export in 1080p (1920x1080)
- [ ] 30 FPS minimum
- [ ] H.264 codec (YouTube-friendly)
- [ ] Add video thumbnail (custom, eye-catching)

---

## Publishing Checklist

**YouTube:**
- [ ] Upload video
- [ ] Title: "ElizaOS Plugins on ONE Platform - Full Walkthrough (9 minutes)"
- [ ] Description:
  ```
  Learn how to supercharge your AI agents with 261+ ElizaOS plugins on ONE Platform.

  In this video:
  - Browse the plugin marketplace
  - Install plugin-solana (blockchain integration)
  - Execute plugin actions
  - Use plugins in AI agent conversations

  Get started: https://one.ie/plugins
  Documentation: https://one.ie/plugins/docs
  Join Discord: https://discord.gg/one-platform

  Timestamps:
  0:00 - Introduction
  1:00 - Browsing the Marketplace
  2:00 - Viewing Plugin Details
  3:00 - Installing plugin-solana
  5:00 - Activating for Agents
  6:00 - Executing Actions
  7:30 - Using in Agent Chat
  8:30 - Conclusion

  #AIAgents #ElizaOS #Blockchain #Solana #Automation
  ```
- [ ] Tags: AI agents, ElizaOS, plugins, Solana, blockchain, automation, ONE Platform
- [ ] Category: Science & Technology
- [ ] Add to playlist: "Product Tutorials"
- [ ] Custom thumbnail (design: plugin icons + bold text)
- [ ] End screen: Subscribe + Related videos

**Website:**
- [ ] Embed on `/plugins` page
- [ ] Embed on `/plugins/docs` page
- [ ] Add to blog post
- [ ] Feature on homepage

**Social Media:**
- [ ] Twitter thread with video
- [ ] LinkedIn post
- [ ] Discord announcement
- [ ] Reddit (r/AI, r/solana, r/programming)

---

## Alternative Versions

**Short Version (60 seconds):**
- Quick overview for social media
- Focus on one use case (Solana plugin)
- End with strong CTA

**Technical Deep Dive (30 minutes):**
- Show code implementation
- Explain adapter architecture
- Demo security features
- Q&A section

**Plugin Spotlight Series:**
- Dedicated video for each major plugin
- 3-5 minutes each
- Use case focused
- Weekly releases

---

**Prepared by:** agent-ops
**Status:** Ready for production (once feature is implemented)
**Last Updated:** 2025-11-22
