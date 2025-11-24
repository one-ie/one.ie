# Sui Launchpad Services

Effect.ts services for the Sui cryptocurrency launchpad features.

## Overview

This directory contains pure calculation and business logic services for tokenomics, blockchain interaction, and crypto utilities. All services follow Effect.ts patterns for composability, type safety, and testability.

## Services

### TokenomicsCalculatorService

**Pure calculation service** for tokenomics modeling and simulation.

**Features:**
- 6 built-in templates (Standard, Team Vesting, Fair Launch, DAO, AI Agent, Revenue Share)
- Token distribution calculations
- Vesting schedule simulations
- Staking APY calculations (simple + compounded)
- Treasury runway projections
- Market cap / FDV calculations

**Location:** `TokenomicsCalculatorService.ts`

**Examples:** `TokenomicsCalculatorService.example.ts`

#### Quick Start

\`\`\`typescript
import { Effect } from "effect";
import {
  TokenomicsCalculatorService,
  TokenomicsCalculatorServiceDefault,
} from "./services/sui/TokenomicsCalculatorService";

// Calculate distribution
const program = Effect.gen(function* () {
  const service = yield* TokenomicsCalculatorService;

  const distribution = yield* service.calculateTokenDistribution(
    "standard",
    "1000000000"
  );

  return distribution;
});

// Run with dependencies
const result = await Effect.runPromise(
  program.pipe(Effect.provide(TokenomicsCalculatorServiceDefault))
);
\`\`\`

See full documentation in `TokenomicsCalculatorService.ts`.

---

### TokenLaunchService

**Effect.ts service for creating and managing tokens on Sui blockchain.**

**Features:**
- Create tokens with full metadata
- Mint tokens to holders
- Burn tokens from supply
- Transfer ownership
- Update metadata
- Multi-tenant scoping
- Complete audit trail

**Location:** `TokenLaunchService.ts`

**Examples:** `TokenLaunchService.example.ts`

#### Quick Start

```typescript
import { Effect } from "effect";
import { createTokenLaunchService } from "./services/sui/TokenLaunchService";

// Create service instance
const service = createTokenLaunchService(db, suiProvider);

// Create token
const program = service.createToken({
  groupId: "j123..." as Id<"groups">,
  actorId: "j456..." as Id<"things">,
  name: "Agent Token",
  symbol: "AGT",
  decimals: 9,
  totalSupply: "1000000000000000000",
  network: "mainnet",
});

// Run effect
const token = await Effect.runPromise(program);
```

#### Service Operations

**createToken(input)** - Launch new token on Sui
- Creates token thing in database
- Creates ownership connection
- Logs `token_created` event
- Updates group usage

**mintTokens(tokenId, amount, recipientId, actorId)** - Mint tokens to holder
- Updates total supply
- Creates/updates `holds_tokens` connection
- Logs `tokens_minted` event

**burnTokens(tokenId, amount, actorId)** - Burn tokens from supply
- Reduces total supply
- Logs `tokens_burned` event

**transferOwnership(tokenId, newOwnerId, actorId)** - Change token owner
- Invalidates old ownership
- Creates new ownership connection
- Logs `entity_updated` event

**updateMetadata(tokenId, metadata, actorId)** - Update token info
- Updates token properties
- Logs `entity_updated` event

**getTokenDetails(tokenId)** - Get token from database

#### Error Types

- `TokenCreationError` - Token creation failed
- `TokenNotFoundError` - Token doesn't exist
- `InsufficientPermissionsError` - Actor lacks permissions
- `InvalidMetadataError` - Invalid parameters
- `GroupLimitExceededError` - Token limit reached
- `SuiNetworkError` - Blockchain error

#### Service Composition

```typescript
// Create → mint → update → transfer
const lifecycle = service.createToken(input).pipe(
  Effect.flatMap((token) =>
    service.mintTokens(token._id, "100000", recipientId, actorId).pipe(
      Effect.map(() => token)
    )
  ),
  Effect.flatMap((token) =>
    service.updateMetadata(token._id, { description: "Updated" }, actorId).pipe(
      Effect.map(() => token)
    )
  ),
  Effect.flatMap((token) =>
    service.transferOwnership(token._id, newOwnerId, actorId).pipe(
      Effect.map(() => token)
    )
  )
);

const result = await Effect.runPromise(lifecycle);
```

See comprehensive examples in `TokenLaunchService.example.ts` including error handling, parallel operations, retry logic, and more.

---

## Architecture

All services follow these patterns:

1. **Effect.ts composition** - Composable, type-safe operations
2. **Tagged errors** - Exhaustive error handling
3. **Abstraction layers** - Testable database and blockchain interfaces
4. **6-dimension integration** - Groups, people, things, connections, events, knowledge
5. **Event logging** - Complete audit trail
6. **Multi-tenant scoping** - Organization-level isolation

## Integration with Convex

To use services in Convex mutations:

```typescript
import { mutation } from "./_generated/server";
import { Effect } from "effect";
import { createTokenLaunchService } from "./services/sui/TokenLaunchService";

export const createToken = mutation({
  args: { name: v.string(), symbol: v.string(), ... },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    const person = await ctx.db.query("things")...;

    // Create database context
    const dbContext = {
      get: (id) => ctx.db.get(id),
      insert: (table, doc) => ctx.db.insert(table, doc),
      patch: (id, updates) => ctx.db.patch(id, updates),
      query: (table) => ctx.db.query(table),
    };

    // Create service
    const service = createTokenLaunchService(dbContext, suiProvider);

    // Run effect
    const result = await Effect.runPromise(
      service.createToken({ groupId: person.groupId, actorId: person._id, ...args })
    );

    return result._id;
  },
});
```

---

**Built on Effect.ts and the 6-dimension ontology.**
