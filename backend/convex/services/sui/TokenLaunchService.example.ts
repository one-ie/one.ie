/**
 * TokenLaunchService Usage Examples
 *
 * Demonstrates how to use TokenLaunchService with Effect.ts composition patterns.
 *
 * @module TokenLaunchService.example
 */

import { Effect, pipe } from "effect";
import {
  createTokenLaunchService,
  type DatabaseContext,
  type SuiProvider,
  type CreateTokenInput,
  type TokenEntity,
} from "./TokenLaunchService";
import type { Id } from "../../_generated/dataModel";

// ============================================================================
// Example 1: Basic Token Creation
// ============================================================================

/**
 * Create a simple token with minimal configuration
 */
async function exampleBasicTokenCreation(
  db: DatabaseContext,
  suiProvider: SuiProvider
) {
  const service = createTokenLaunchService(db, suiProvider);

  const input: CreateTokenInput = {
    groupId: "j123..." as Id<"groups">,
    actorId: "j456..." as Id<"things">,
    name: "Agent Token",
    symbol: "AGT",
    decimals: 9,
    totalSupply: "1000000000000000000", // 1B tokens with 9 decimals
    network: "mainnet",
    description: "Utility token for AI agent services",
    logoUrl: "https://example.com/logo.png",
    website: "https://example.com",
  };

  // Run the effect
  const result = await Effect.runPromise(
    service.createToken(input).pipe(
      Effect.catchAll((error) => {
        console.error("Token creation failed:", error);
        return Effect.fail(error);
      })
    )
  );

  console.log("Token created:", result._id);
  return result;
}

// ============================================================================
// Example 2: Token Creation with Error Handling
// ============================================================================

/**
 * Create token with comprehensive error handling
 */
async function exampleTokenCreationWithErrorHandling(
  db: DatabaseContext,
  suiProvider: SuiProvider
) {
  const service = createTokenLaunchService(db, suiProvider);

  const input: CreateTokenInput = {
    groupId: "j123..." as Id<"groups">,
    actorId: "j456..." as Id<"things">,
    name: "Community Token",
    symbol: "COMM",
    decimals: 6,
    totalSupply: "5000000000000", // 5M tokens
    network: "testnet",
  };

  const program = service.createToken(input).pipe(
    Effect.tap((token) =>
      Effect.sync(() => {
        console.log("✓ Token created successfully");
        console.log(`  ID: ${token._id}`);
        console.log(`  Symbol: ${token.properties.symbol}`);
        console.log(`  Supply: ${token.properties.totalSupply}`);
      })
    ),
    Effect.catchTags({
      TokenCreationError: (error) =>
        Effect.sync(() => {
          console.error("❌ Token creation failed:", error.reason);
          throw new Error(`Creation failed: ${error.reason}`);
        }),
      GroupLimitExceededError: (error) =>
        Effect.sync(() => {
          console.error(
            `❌ Group limit exceeded: ${error.current}/${error.limit} tokens`
          );
          throw new Error("Token limit reached for this organization");
        }),
      InsufficientPermissionsError: (error) =>
        Effect.sync(() => {
          console.error(
            `❌ Permission denied: ${error.action} requires ${error.requiredRole}`
          );
          throw new Error("You don't have permission to create tokens");
        }),
      InvalidMetadataError: (error) =>
        Effect.sync(() => {
          console.error(`❌ Invalid ${error.field}: ${error.reason}`);
          throw new Error(`Invalid token metadata: ${error.field}`);
        }),
    })
  );

  return await Effect.runPromise(program);
}

// ============================================================================
// Example 3: Complete Token Lifecycle
// ============================================================================

/**
 * Demonstrate complete token lifecycle: create → mint → update → transfer
 */
async function exampleTokenLifecycle(
  db: DatabaseContext,
  suiProvider: SuiProvider
) {
  const service = createTokenLaunchService(db, suiProvider);

  const creatorId = "j456..." as Id<"things">;
  const recipientId = "j789..." as Id<"things">;
  const newOwnerId = "j012..." as Id<"things">;

  // Step 1: Create token
  const createProgram = service.createToken({
    groupId: "j123..." as Id<"groups">,
    actorId: creatorId,
    name: "Lifecycle Token",
    symbol: "LIFE",
    decimals: 9,
    totalSupply: "1000000000000000000",
    network: "testnet",
  });

  // Step 2: Mint tokens
  const mintProgram = (tokenId: Id<"things">) =>
    service.mintTokens(tokenId, "100000000000000", recipientId, creatorId);

  // Step 3: Update metadata
  const updateProgram = (tokenId: Id<"things">) =>
    service.updateMetadata(
      tokenId,
      {
        description: "Updated description after launch",
        website: "https://newsite.com",
      },
      creatorId
    );

  // Step 4: Transfer ownership
  const transferProgram = (tokenId: Id<"things">) =>
    service.transferOwnership(tokenId, newOwnerId, creatorId);

  // Compose all operations
  const fullLifecycle = createProgram.pipe(
    Effect.tap((token) =>
      Effect.sync(() => console.log("✓ Token created:", token._id))
    ),
    Effect.flatMap((token) =>
      mintProgram(token._id).pipe(
        Effect.tap(() =>
          Effect.sync(() => console.log("✓ Tokens minted to recipient"))
        ),
        Effect.map(() => token)
      )
    ),
    Effect.flatMap((token) =>
      updateProgram(token._id).pipe(
        Effect.tap(() =>
          Effect.sync(() => console.log("✓ Metadata updated"))
        ),
        Effect.map(() => token)
      )
    ),
    Effect.flatMap((token) =>
      transferProgram(token._id).pipe(
        Effect.tap(() =>
          Effect.sync(() => console.log("✓ Ownership transferred"))
        ),
        Effect.map(() => token)
      )
    ),
    Effect.tap((token) =>
      Effect.sync(() =>
        console.log("✓ Complete lifecycle finished for:", token._id)
      )
    )
  );

  return await Effect.runPromise(fullLifecycle);
}

// ============================================================================
// Example 4: Parallel Token Operations
// ============================================================================

/**
 * Create multiple tokens in parallel
 */
async function exampleParallelTokenCreation(
  db: DatabaseContext,
  suiProvider: SuiProvider
) {
  const service = createTokenLaunchService(db, suiProvider);

  const tokens: CreateTokenInput[] = [
    {
      groupId: "j123..." as Id<"groups">,
      actorId: "j456..." as Id<"things">,
      name: "Token A",
      symbol: "TOKA",
      decimals: 9,
      totalSupply: "1000000000000000000",
      network: "testnet",
    },
    {
      groupId: "j123..." as Id<"groups">,
      actorId: "j456..." as Id<"things">,
      name: "Token B",
      symbol: "TOKB",
      decimals: 6,
      totalSupply: "5000000000000",
      network: "testnet",
    },
    {
      groupId: "j123..." as Id<"groups">,
      actorId: "j456..." as Id<"things">,
      name: "Token C",
      symbol: "TOKC",
      decimals: 9,
      totalSupply: "100000000000000000",
      network: "testnet",
    },
  ];

  // Create all tokens in parallel
  const parallelCreation = Effect.all(
    tokens.map((input) => service.createToken(input)),
    { concurrency: "unbounded" } // Run all in parallel
  );

  const results = await Effect.runPromise(
    parallelCreation.pipe(
      Effect.tap((tokens) =>
        Effect.sync(() => {
          console.log(`✓ Created ${tokens.length} tokens in parallel:`);
          tokens.forEach((token) => {
            console.log(`  - ${token.name} (${token.properties.symbol})`);
          });
        })
      )
    )
  );

  return results;
}

// ============================================================================
// Example 5: Service Composition with Other Services
// ============================================================================

/**
 * Compose TokenLaunchService with hypothetical VestingService
 */
async function exampleServiceComposition(
  db: DatabaseContext,
  suiProvider: SuiProvider,
  vestingService: any // Hypothetical VestingService
) {
  const tokenService = createTokenLaunchService(db, suiProvider);

  const creatorId = "j456..." as Id<"things">;
  const beneficiaryId = "j789..." as Id<"things">;

  // Create token and immediately set up vesting
  const tokenWithVesting = tokenService
    .createToken({
      groupId: "j123..." as Id<"groups">,
      actorId: creatorId,
      name: "Vested Token",
      symbol: "VEST",
      decimals: 9,
      totalSupply: "1000000000000000000",
      network: "mainnet",
    })
    .pipe(
      // After token creation, mint tokens
      Effect.flatMap((token) =>
        tokenService
          .mintTokens(token._id, "500000000000000000", creatorId, creatorId)
          .pipe(Effect.map(() => token))
      ),
      // Then create vesting schedule
      Effect.flatMap((token) =>
        vestingService
          .createVestingSchedule({
            tokenId: token._id,
            beneficiaryId: beneficiaryId,
            totalAmount: "500000000000000000",
            cliffEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
            vestingEnd: Date.now() + 4 * 365 * 24 * 60 * 60 * 1000, // 4 years
            actorId: creatorId,
          })
          .pipe(Effect.map((schedule) => ({ token, schedule })))
      ),
      Effect.tap(({ token, schedule }) =>
        Effect.sync(() => {
          console.log("✓ Token created:", token._id);
          console.log("✓ Vesting schedule created:", schedule._id);
        })
      )
    );

  return await Effect.runPromise(tokenWithVesting);
}

// ============================================================================
// Example 6: Retry Logic with Effect.retry
// ============================================================================

/**
 * Token creation with automatic retry on network errors
 */
async function exampleWithRetry(
  db: DatabaseContext,
  suiProvider: SuiProvider
) {
  const service = createTokenLaunchService(db, suiProvider);

  const input: CreateTokenInput = {
    groupId: "j123..." as Id<"groups">,
    actorId: "j456..." as Id<"things">,
    name: "Retry Token",
    symbol: "RETRY",
    decimals: 9,
    totalSupply: "1000000000000000000",
    network: "mainnet",
  };

  // Retry up to 3 times on SuiNetworkError
  const programWithRetry = service.createToken(input).pipe(
    Effect.retry({
      times: 3,
      schedule: Effect.Schedule.exponential("100 millis"),
    }),
    Effect.tap(() =>
      Effect.sync(() => console.log("✓ Token created (with retries)"))
    ),
    Effect.tapError((error) =>
      Effect.sync(() => console.error("❌ Failed after retries:", error))
    )
  );

  return await Effect.runPromise(programWithRetry);
}

// ============================================================================
// Example 7: Using Either for Non-Throwing Errors
// ============================================================================

/**
 * Get token details without throwing errors
 */
async function exampleWithEither(
  db: DatabaseContext,
  suiProvider: SuiProvider,
  tokenId: Id<"things">
) {
  const service = createTokenLaunchService(db, suiProvider);

  // Convert Effect to Either (doesn't throw)
  const result = await Effect.runPromise(
    service.getTokenDetails(tokenId).pipe(Effect.either)
  );

  if (result._tag === "Left") {
    // Error case
    console.error("Token not found or error:", result.left);
    return null;
  } else {
    // Success case
    console.log("Token found:", result.right.name);
    return result.right;
  }
}

// ============================================================================
// Example 8: Batch Operations with Sequential Processing
// ============================================================================

/**
 * Mint tokens to multiple recipients sequentially
 */
async function exampleBatchMinting(
  db: DatabaseContext,
  suiProvider: SuiProvider,
  tokenId: Id<"things">,
  actorId: Id<"things">
) {
  const service = createTokenLaunchService(db, suiProvider);

  const recipients = [
    { id: "j789..." as Id<"things">, amount: "100000000000000" },
    { id: "j012..." as Id<"things">, amount: "200000000000000" },
    { id: "j345..." as Id<"things">, amount: "150000000000000" },
  ];

  // Process sequentially to ensure order
  const batchMint = Effect.all(
    recipients.map(({ id, amount }) =>
      service.mintTokens(tokenId, amount, id, actorId)
    ),
    { concurrency: 1 } // Sequential processing
  );

  await Effect.runPromise(
    batchMint.pipe(
      Effect.tap(() =>
        Effect.sync(() =>
          console.log(`✓ Minted to ${recipients.length} recipients`)
        )
      )
    )
  );
}

// ============================================================================
// Example 9: Timeout Handling
// ============================================================================

/**
 * Token creation with timeout
 */
async function exampleWithTimeout(
  db: DatabaseContext,
  suiProvider: SuiProvider
) {
  const service = createTokenLaunchService(db, suiProvider);

  const input: CreateTokenInput = {
    groupId: "j123..." as Id<"groups">,
    actorId: "j456..." as Id<"things">,
    name: "Timeout Token",
    symbol: "TIME",
    decimals: 9,
    totalSupply: "1000000000000000000",
    network: "mainnet",
  };

  // Fail if takes longer than 30 seconds
  const programWithTimeout = service.createToken(input).pipe(
    Effect.timeout("30 seconds"),
    Effect.catchTag("TimeoutException", () =>
      Effect.sync(() => {
        console.error("❌ Token creation timed out");
        throw new Error("Operation timed out after 30 seconds");
      })
    )
  );

  return await Effect.runPromise(programWithTimeout);
}

// ============================================================================
// Example 10: Logging and Observability
// ============================================================================

/**
 * Token creation with detailed logging
 */
async function exampleWithLogging(
  db: DatabaseContext,
  suiProvider: SuiProvider
) {
  const service = createTokenLaunchService(db, suiProvider);

  const input: CreateTokenInput = {
    groupId: "j123..." as Id<"groups">,
    actorId: "j456..." as Id<"things">,
    name: "Logged Token",
    symbol: "LOG",
    decimals: 9,
    totalSupply: "1000000000000000000",
    network: "mainnet",
  };

  const programWithLogging = service.createToken(input).pipe(
    Effect.tap(() =>
      Effect.sync(() => console.log("[INFO] Starting token creation"))
    ),
    Effect.tap((token) =>
      Effect.sync(() => {
        console.log("[INFO] Token created:", {
          id: token._id,
          name: token.name,
          symbol: token.properties.symbol,
          supply: token.properties.totalSupply,
        });
      })
    ),
    Effect.tapError((error) =>
      Effect.sync(() => {
        console.error("[ERROR] Token creation failed:", {
          error: error._tag,
          details: error,
        });
      })
    )
  );

  return await Effect.runPromise(programWithLogging);
}

// ============================================================================
// Export Examples
// ============================================================================

export {
  exampleBasicTokenCreation,
  exampleTokenCreationWithErrorHandling,
  exampleTokenLifecycle,
  exampleParallelTokenCreation,
  exampleServiceComposition,
  exampleWithRetry,
  exampleWithEither,
  exampleBatchMinting,
  exampleWithTimeout,
  exampleWithLogging,
};
