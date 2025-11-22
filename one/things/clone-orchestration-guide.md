# Clone Orchestration Quick Start Guide

**Cycle 13 Implementation** - Advanced multi-clone management

---

## Files Implemented

### Backend (Convex)
- `/backend/convex/mutations/clone-orchestration.ts` (22KB, 673 lines)
- `/backend/convex/queries/clone-orchestration.ts` (9.9KB, 404 lines)

### Frontend (React)
- `/web/src/components/ai-clone/CloneRouter.tsx` (15KB, 518 lines)
- `/web/src/components/ai-clone/CloneRouter.module.css` (6.2KB, 367 lines)

### Documentation
- `/one/events/cycle-13-orchestration-summary.md` (Complete implementation summary)

---

## Quick Start: Clone Routing

### 1. Configure Clone Expertise

```typescript
// When creating a clone, set expertise and topics
await ctx.runMutation('ai-clones/createClone', {
  groupId: groupId,
  name: 'Tech Support Clone',
  systemPrompt: 'You are a helpful technical support specialist...',
  // Routing configuration:
  properties: {
    expertise: ['react', 'javascript', 'debugging'],
    topics: ['frontend', 'web development', 'troubleshooting'],
    specialization: {
      keywords: ['hooks', 'state', 'components', 'errors']
    },
    isDefault: false,
    availability: 'online'
  }
});
```

### 2. Route User Message

```typescript
const result = await ctx.runMutation('clone-orchestration/routeToClone', {
  groupId: groupId,
  userId: 'user@example.com',
  message: 'My React component is throwing an error with hooks',
  creatorId: creatorId
});

// Result:
{
  cloneId: "tech-support-clone-id",
  reason: "expertise: react, specialization: hooks, specialization: errors",
  confidence: 0.88,
  clone: { name: "Tech Support Clone", ... },
  alternatives: [
    { name: "General Clone", score: 12 }
  ]
}
```

### 3. View Routing Analytics

```typescript
const analytics = await ctx.runQuery('clone-orchestration/getRoutingAnalytics', {
  groupId: groupId,
  creatorId: creatorId,
  days: 30
});

// Shows:
// - Which clones handle which topics
// - Average routing scores
// - Top reasons for routing decisions
```

---

## Quick Start: Clone Handoff

### When to Use
- User's question changes topic mid-conversation
- Initial clone doesn't have expertise needed
- Load balancing across clones

### Example

```typescript
// User starts with Sales Clone asking about pricing
// Then asks: "How do I integrate this with my React app?"

await ctx.runMutation('clone-orchestration/handoffClone', {
  threadId: threadId,
  fromCloneId: salesCloneId,
  toCloneId: techCloneId,
  reason: 'User needs technical integration help'
});

// Thread now belongs to Tech Clone
// Handoff logged in thread metadata
// User sees smooth transition
```

---

## Quick Start: Clone Collaboration

### Strategy Options

**1. Best Match** (Recommended)
- Each message routed to clone with best expertise
- Seamless switching
- User sees unified conversation

**2. Round Robin**
- Clones take turns
- Load balancing
- Fair distribution

**3. Parallel**
- All clones respond
- User picks best answer
- Highest quality, highest cost

### Example

```typescript
// Enable 3 clones to collaborate
await ctx.runMutation('clone-orchestration/collaborateClones', {
  threadId: threadId,
  cloneIds: [techCloneId, marketingCloneId, designCloneId],
  strategy: 'best_match'
});

// Now each message automatically routes to best clone
// User experience: seamless expert switching
// Creator experience: comprehensive coverage
```

---

## Quick Start: Clone Comparison (A/B Testing)

### Use Cases
- Test new system prompt
- Compare clone personalities
- Optimize temperature/tone
- Evaluate training sources

### Example

```typescript
// Create comparison
const comparison = await ctx.runMutation('clone-orchestration/compareClones', {
  cloneIds: [originalCloneId, optimizedCloneId],
  testPrompts: [
    'What is your main service?',
    'How much does it cost?',
    'Can you help me get started?',
    'What makes you different?',
    'Tell me about your expertise'
  ],
  evaluationCriteria: {
    accuracy: true,
    tone: true,
    length: true,
    expertise: true
  }
});

// Use RAG service to execute tests (Cycle 6)
// Analyze results to pick winner
// Deploy best-performing clone
```

---

## Quick Start: Clone Versioning

### Create Snapshot Before Changes

```typescript
// Before updating system prompt
await ctx.runMutation('clone-orchestration/createCloneVersion', {
  cloneId: cloneId,
  versionName: 'v1.0.0',
  changes: 'Original stable version'
});

// Now safe to experiment with changes
await ctx.runMutation('ai-clones/updateClone', {
  cloneId: cloneId,
  updates: {
    systemPrompt: 'New experimental prompt...',
    temperature: 0.8
  }
});
```

### Rollback if Needed

```typescript
// If changes don't work out
await ctx.runMutation('clone-orchestration/rollbackCloneVersion', {
  cloneId: cloneId,
  versionId: versionId
});

// Clone immediately restored to snapshot
// No data loss
// Fast recovery
```

### View Version History

```typescript
const history = await ctx.runQuery('clone-orchestration/getVersionHistory', {
  cloneId: cloneId
});

// Returns all versions with:
// - Version name
// - Changes description
// - Snapshot of all settings
// - Creation timestamp
```

---

## Frontend Usage

### Import Component

```typescript
import CloneRouter from '@/components/ai-clone/CloneRouter';

// In your page
<CloneRouter
  groupId={groupId}
  creatorId={creatorId}
  userId={userId}
/>
```

### Component Features

**Routing Tab:**
- Test routing with sample messages
- See which clone would handle each message
- View confidence scores and alternatives
- Understand routing decisions

**Collaboration Tab:**
- Select clones to collaborate
- Choose strategy (best_match, round_robin, parallel)
- Enable/disable collaboration

**Comparison Tab:**
- Select clones to compare
- Add test prompts
- Run A/B tests
- View results

**Versioning Tab:**
- Create version snapshots
- View version history
- Rollback to previous versions
- Compare versions

---

## Example: Complete Routing Flow

```typescript
// STEP 1: User sends message
const userMessage = "How do I use React hooks?";

// STEP 2: System routes to best clone
const routing = await routeToClone({
  groupId: groupId,
  userId: userId,
  message: userMessage,
  creatorId: creatorId
});

console.log(routing);
// {
//   cloneId: "tech-clone-id",
//   reason: "expertise: react, specialization: hooks",
//   confidence: 0.92,
//   clone: { name: "Tech Clone", ... }
// }

// STEP 3: Create or get thread
let threadId;
const existingThreads = await listThreads({
  cloneId: routing.cloneId,
  userId: userId,
  status: 'active'
});

if (existingThreads.length > 0) {
  threadId = existingThreads[0]._id;
} else {
  threadId = await createThread({
    cloneId: routing.cloneId,
    userId: userId,
    title: 'React Hooks Help'
  });
}

// STEP 4: Add user message
await addMessage({
  threadId: threadId,
  role: 'user',
  content: userMessage
});

// STEP 5: Generate response (RAG service - Cycle 6)
const response = await generateResponse({
  threadId: threadId,
  cloneId: routing.cloneId,
  message: userMessage
});

// STEP 6: Add assistant message
await addMessage({
  threadId: threadId,
  role: 'assistant',
  content: response.content,
  metadata: {
    tokensUsed: response.tokensUsed,
    model: 'gpt-4-turbo',
    citations: response.citations
  }
});

// STEP 7: Check if handoff needed
if (response.suggestsHandoff) {
  await handoffClone({
    threadId: threadId,
    fromCloneId: routing.cloneId,
    toCloneId: response.suggestedCloneId,
    reason: response.handoffReason
  });
}
```

---

## Integration with Other Cycles

### Cycle 3: Embeddings
- Route messages using semantic similarity
- Compare clone profiles with message embeddings
- More accurate routing (40 points from similarity)

### Cycle 6: RAG Pipeline
- Execute clone comparisons automatically
- Evaluate response quality
- Generate insights for routing optimization

### Cycle 10: Tools
- Clones maintain individual tool configurations
- Tool permissions preserved during handoff
- Collaboration respects tool access

### Cycle 14: Analytics
- Routing decisions feed performance metrics
- Identify gaps in clone coverage
- Optimize clone configurations

---

## Advanced Features

### Clone Marketplace (Future)

```typescript
// Publish clone to marketplace
await publishToMarketplace({
  cloneId: cloneId,
  price: 99.00,
  category: 'tech_support',
  description: 'Expert React support clone trained on 50+ courses'
});

// Other creators can purchase
await purchaseClone({
  listingId: listingId,
  groupId: buyerGroupId
});
```

### Clone Templates (Future)

```typescript
// Use pre-configured template
await createCloneFromTemplate({
  templateId: 'tech_support',
  groupId: groupId,
  customizations: {
    expertise: ['react', 'vue', 'angular'], // Extended
    name: 'My Custom Tech Clone'
  }
});
```

### Clone Inheritance (Future)

```typescript
// Create specialized clone from parent
await createChildClone({
  parentCloneId: parentCloneId,
  name: 'Advanced React Clone',
  additionalExpertise: ['next.js', 'typescript'],
  enhancedPrompt: 'Specialize in Next.js and TypeScript...'
});

// Inherits: voice, appearance, training sources, base prompt
// Customizes: expertise, additional training, prompt extensions
```

---

## Performance Tips

### Routing Optimization
- Set clear expertise keywords (10-15 per clone)
- Use specific topic areas (not too broad)
- Configure default clone for fallback
- Keep clone count reasonable (3-7 for most creators)

### Analytics Queries
- Use date ranges (avoid querying all events)
- Pre-aggregate stats for dashboards
- Cache routing analytics (30-min TTL)

### Collaboration
- Best Match: Lowest overhead (recommended)
- Round Robin: Moderate overhead
- Parallel: Highest cost (3x tokens)

---

## Troubleshooting

### "No active clones found"
- Ensure clones have status: 'active' or 'published'
- Check clone ownership (createdByPersonId matches creator)
- Verify group access

### "Low routing confidence"
- Add more expertise keywords to clones
- Improve topic coverage
- Consider creating specialized clone
- Set default clone for fallback

### "Handoff fails"
- Verify both clones in same group
- Check clone status (must be active)
- Ensure thread belongs to fromClone

### "Version rollback doesn't work"
- Verify version belongs to clone (originalCloneId)
- Check version type (must be 'clone_version')
- Ensure user has ownership

---

## Next Steps

1. **Test routing** with sample messages
2. **Configure clone expertise** for your use case
3. **Create version snapshot** before experimenting
4. **Enable collaboration** for complex topics
5. **Run A/B test** to optimize performance
6. **View analytics** to understand routing patterns

---

**Built with 6-dimension ontology. Scales from 1 clone to 100s.**
