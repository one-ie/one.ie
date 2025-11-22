---
title: "Ontology-UI + Website Builder Integration - 10 Cycle Plan"
dimension: things
category: plans
tags: integration, ontology-ui, website-builder, ai-chat, seamless
scope: integration
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
---

# Ontology-UI + Website Builder Integration - 10 Cycle Plan

**Goal:** Seamlessly integrate the 286+ ontology-ui components with the AI website builder, chat interface, and live preview system.

**Vision:** Users can chat with AI to build websites using ontology-ui components, see live previews, and deploy production-ready pages with the 6-dimension ontology.

---

## CYCLE 1: Component Registry Integration

**Goal:** Create a unified component registry that includes both builder components and ontology-ui components

**Tasks:**
- Extend `/web/src/lib/componentLibrary.ts` to include ontology-ui components
- Categorize ontology-ui components (things, people, groups, connections, events, knowledge, crypto, streaming)
- Add component metadata (description, props, examples, category)
- Generate semantic descriptions for AI search
- Create component manifest with all 286+ components

**Deliverable:** Complete component registry with ontology-ui integration

---

## CYCLE 2: AI Tool Enhancement

**Goal:** Update AI code generation tools to use ontology-ui components

**Tasks:**
- Update `generateAstroPage.ts` to import ontology-ui components
- Add ontology-ui components to code templates
- Update `searchComponents.ts` to search ontology-ui library
- Create usage examples for top 50 ontology-ui components
- Add proper import paths for ontology-ui

**Deliverable:** AI tools that generate code using ontology-ui components

---

## CYCLE 3: Chat Interface Integration

**Goal:** Connect AI chat to ontology-ui component library

**Tasks:**
- Update `/web/src/components/ai/WebsiteBuilderChat.tsx` to suggest ontology-ui components
- Add ontology-ui component picker to chat interface
- Display ontology-ui component previews in chat
- Enable "Use this component" action from chat
- Add component category filters (crypto, streaming, things, etc.)

**Deliverable:** Chat interface with ontology-ui component suggestions

---

## CYCLE 4: Live Preview Enhancement

**Goal:** Make live preview work seamlessly with ontology-ui components

**Tasks:**
- Update `/web/src/components/features/creator/LivePreview.tsx` to support ontology-ui
- Add ontology-ui component imports to preview compilation
- Handle ontology-ui component dependencies (hooks, stores, types)
- Add error handling for missing ontology-ui dependencies
- Test preview with ThingCard, PersonCard, EventCard, etc.

**Deliverable:** Live preview that renders ontology-ui components correctly

---

## CYCLE 5: Component Picker Integration

**Goal:** Create visual component picker with ontology-ui components

**Tasks:**
- Update `/web/src/components/features/creator/ComponentPicker.tsx` with ontology-ui
- Add category tabs: Builder, Things, People, Groups, Connections, Events, Knowledge, Crypto, Streaming
- Add component thumbnails/icons for ontology-ui
- Add search that works across both libraries
- Add drag-and-drop from picker to preview

**Deliverable:** Unified component picker with all components

---

## CYCLE 6: Page Templates with Ontology-UI

**Goal:** Create page templates using ontology-ui components

**Tasks:**
- Create 5 templates using ontology-ui:
  1. Dashboard template (DimensionNav, EntityDisplay, UnifiedSearch)
  2. Profile template (UserCard, UserActivity, UserPermissions)
  3. Marketplace template (ProductCard, TokenCard, NFTCard)
  4. Analytics template (TimeSeriesChart, HeatmapChart, NetworkDiagram)
  5. Chat template (ChatMessage, ChatInput, LiveNotifications)
- Add templates to AI suggestions
- Test template generation via AI chat

**Deliverable:** 5 production-ready templates using ontology-ui

---

## CYCLE 7: Navigation Integration

**Goal:** Seamless navigation between chat, builder, component library

**Tasks:**
- Add "Open in Builder" button from chat
- Add "Ask AI" button from builder
- Add "Browse Components" navigation
- Create breadcrumb navigation (Chat → Builder → Preview → Deploy)
- Add keyboard shortcuts (⌘K for chat, ⌘B for builder)

**Deliverable:** Unified navigation experience

---

## CYCLE 8: Real-time Collaboration

**Goal:** Enable collaborative editing using ontology-ui streaming components

**Tasks:**
- Integrate `PresenceIndicator.tsx` into website builder
- Add `CollaborationCursor.tsx` for multi-user editing
- Use `LiveActivityFeed.tsx` to show team member actions
- Add `LiveNotifications.tsx` for real-time updates
- Test with multiple concurrent users

**Deliverable:** Real-time collaboration in website builder

---

## CYCLE 9: Crypto Integration

**Goal:** Enable crypto features in website builder

**Tasks:**
- Add crypto component suggestions when user mentions "payment", "token", "NFT"
- Integrate `WalletConnectButton.tsx` into generated pages
- Add `TokenSwap.tsx`, `NFTMarketplace.tsx` to component library
- Create "Crypto Landing Page" template
- Test wallet connection in live preview

**Deliverable:** Crypto-enabled website builder

---

## CYCLE 10: End-to-End Testing & Documentation

**Goal:** Test complete integration and document workflows

**Tasks:**
- Create 5 end-to-end test workflows:
  1. Chat → Generate Dashboard → Preview → Deploy
  2. Chat → Add Crypto Component → Test Wallet → Deploy
  3. Browse Components → Add ThingCard → Customize → Deploy
  4. Create from Template → Modify with AI → Deploy
  5. Collaborative Editing → Multi-user → Deploy
- Write integration guide (`INTEGRATION-COMPLETE.md`)
- Create video walkthrough
- Document known issues and workarounds

**Deliverable:** Complete integration with full documentation

---

## Success Criteria

**MVP (Cycle 5):**
- ✅ AI chat generates code using ontology-ui components
- ✅ Component picker shows both libraries
- ✅ Live preview renders ontology-ui components

**Complete (Cycle 10):**
- ✅ 286+ ontology-ui components available in website builder
- ✅ AI suggests relevant ontology-ui components
- ✅ Live preview works with all component types
- ✅ Templates use ontology-ui components
- ✅ Real-time collaboration enabled
- ✅ Crypto features integrated
- ✅ End-to-end workflows tested
- ✅ Complete documentation

---

## Integration Workflows

### Workflow 1: AI Chat → Website with Ontology-UI Components

```
User: "Create a dashboard with user stats and activity feed"

AI: *searches ontology-ui components*
    "I'll create a dashboard using:
     - DimensionNav for navigation
     - UserCard for user profile
     - LiveActivityFeed for real-time updates
     - TimeSeriesChart for stats"

AI: *generates code with ontology-ui imports*
    ```astro
    ---
    import { DimensionNav } from '@/components/ontology-ui/app';
    import { UserCard } from '@/components/ontology-ui/people';
    import { LiveActivityFeed } from '@/components/ontology-ui/streaming';
    ---
    <DimensionNav client:load />
    <UserCard userId={currentUser.id} client:load />
    <LiveActivityFeed groupId={currentGroup.id} client:load />
    ```

User: *sees live preview with working components*

User: "Deploy this"

AI: *deploys to Cloudflare Pages*
```

### Workflow 2: Component Picker → Drag-and-Drop

```
User: Opens component picker
User: Filters by "Crypto" category
User: Sees TokenSwap, WalletConnect, NFTCard components
User: Drags TokenSwap to preview
User: Customizes token pair in properties panel
User: Deploys
```

### Workflow 3: Template → Customize with AI

```
User: Selects "Crypto Marketplace" template
AI: Generates page with NFTMarketplace, TokenCard, WalletConnect
User: "Make the NFT cards larger and add a filter"
AI: *modifies code to enlarge cards and add NFTFilter component*
User: Previews → Deploys
```

---

## Technical Architecture

### Component Discovery Flow

```
User Input
    ↓
AI analyzes intent
    ↓
searchComponents(query, category: "ontology-ui")
    ↓
Semantic search returns relevant ontology-ui components
    ↓
AI generates code with proper imports
    ↓
Code sent to live preview
    ↓
Preview compiles with ontology-ui dependencies
    ↓
User sees working component
```

### Import Resolution

```typescript
// Auto-generated import paths
import { ThingCard } from '@/components/ontology-ui/things';
import { UserCard } from '@/components/ontology-ui/people';
import { EventCard } from '@/components/ontology-ui/events';
import { TokenSwap } from '@/components/ontology-ui/crypto/dex';
import { LiveActivityFeed } from '@/components/ontology-ui/streaming';

// All paths resolved automatically in live preview
```

---

## Timeline

**Sequential:** 10 days (1 cycle/day)
**Parallel (10 agents):** 1-2 days
**Aggressive:** Same day with proper coordination

---

## Next Steps

After completion:
1. Launch to beta users
2. Gather feedback on component discovery
3. Add more templates
4. Expand ontology-ui library with user requests
5. Build community component marketplace

---

**Built for seamless integration, powered by AI, enabled by the 6-dimension ontology.**
