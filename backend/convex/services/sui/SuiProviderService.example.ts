/**
 * SuiProviderService Usage Examples
 *
 * Demonstrates how to use SuiProviderService with Effect.ts patterns
 * including dependency injection, error handling, and service composition.
 *
 * @module SuiProviderService.example
 * @version 1.0.0
 */

import { Effect, Layer, Context } from "effect";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SuiProviderService,
  SuiProviderServiceLive,
  NetworkError,
  TransactionFailed,
  InsufficientBalance,
  parseEvent,
  mistToSui,
  suiToMist,
} from "./SuiProviderService";
import type { SuiNetwork, SuiAddress } from "../../types/sui";

// ============================================================================
// Example 1: Basic Connection and Balance Query
// ============================================================================

/**
 * Connect to Sui network and get wallet balance
 */
const getBalanceExample = Effect.gen(function* () {
  // 1. Get service from context
  const provider = yield* SuiProviderService;

  // 2. Connect to network
  const client = yield* provider.connect({
    network: "mainnet",
    timeout: 10000,
    maxRetries: 3,
  });

  console.log("Connected to Sui mainnet");

  // 3. Get wallet balance
  const address: SuiAddress =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const balance = yield* provider.getWalletBalance(address);

  console.log(`SUI Balance: ${mistToSui(balance.suiBalance)} SUI`);
  console.log(`Token Balances:`, balance.tokenBalances);

  return balance;
});

/**
 * Run the balance example
 */
export function runBalanceExample() {
  return Effect.runPromise(
    getBalanceExample.pipe(
      Effect.provide(SuiProviderServiceLive),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          console.error("Error:", error);
          return null;
        })
      )
    )
  );
}

// ============================================================================
// Example 2: Execute Transaction with Retry Logic
// ============================================================================

/**
 * Execute a token transfer with automatic retry
 */
const transferTokensExample = Effect.gen(function* () {
  const provider = yield* SuiProviderService;

  // Connect to network
  yield* provider.connect({ network: "testnet" });

  // Build transaction
  const tx = new TransactionBlock();

  // Split coin for transfer
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000000000)]); // 1 SUI

  // Transfer to recipient
  tx.transferObjects(
    [coin],
    tx.pure(
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    )
  );

  // Estimate gas first
  const gasEstimate = yield* provider.estimateGas(tx, {
    sender:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  });

  console.log(`Estimated gas: ${gasEstimate.gasCostSui} SUI`);

  // Execute with retry (max 3 attempts)
  const result = yield* provider.signAndExecute(
    tx,
    {
      sender:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      gasBudget: Number(gasEstimate.gasCost) * 1.2, // 20% buffer
    },
    3 // maxRetries
  );

  console.log(`Transaction ${result.status}:`, result.digest);
  console.log(`Gas used: ${mistToSui(result.gasUsed)} SUI`);

  return result;
});

/**
 * Run transfer example with error handling
 */
export function runTransferExample() {
  return Effect.runPromise(
    transferTokensExample.pipe(
      Effect.provide(SuiProviderServiceLive),
      Effect.catchTags({
        InsufficientBalance: (error) =>
          Effect.sync(() => {
            console.error(
              `Insufficient balance: need ${mistToSui(error.required)} SUI, have ${mistToSui(error.available)} SUI`
            );
            return null;
          }),
        TransactionFailed: (error) =>
          Effect.sync(() => {
            console.error(`Transaction failed: ${error.reason}`);
            return null;
          }),
        NetworkError: (error) =>
          Effect.sync(() => {
            console.error(
              `Network error on ${error.network}: ${error.message}`
            );
            return null;
          }),
      })
    )
  );
}

// ============================================================================
// Example 3: Subscribe to Smart Contract Events
// ============================================================================

/**
 * Listen for token transfer events
 */
const subscribeToTransfersExample = Effect.gen(function* () {
  const provider = yield* SuiProviderService;

  yield* provider.connect({ network: "mainnet" });

  console.log("Subscribing to token transfer events...");

  // Subscribe to events
  yield* provider.subscribeToEvents(
    {
      packageId:
        "0x2b3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d",
      module: "token",
      eventType: "Transfer",
    },
    (event) =>
      Effect.sync(() => {
        const parsed = parseEvent(event);
        console.log(`[${new Date(parsed.timestamp).toISOString()}] Transfer:`, {
          from: (parsed.data as any).from,
          to: (parsed.data as any).to,
          amount: (parsed.data as any).amount,
          txDigest: parsed.txDigest,
        });
      })
  );
});

/**
 * Run event subscription example
 */
export function runEventSubscriptionExample() {
  return Effect.runPromise(
    subscribeToTransfersExample.pipe(Effect.provide(SuiProviderServiceLive))
  );
}

// ============================================================================
// Example 4: Token Service - Depends on SuiProviderService
// ============================================================================

/**
 * Token Service interface
 */
export interface TokenService {
  createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    sender: SuiAddress;
  }): Effect.Effect<
    { tokenId: string; txHash: string },
    NetworkError | TransactionFailed
  >;

  transferTokens(params: {
    tokenType: string;
    recipient: SuiAddress;
    amount: string;
    sender: SuiAddress;
  }): Effect.Effect<
    { txHash: string },
    NetworkError | TransactionFailed | InsufficientBalance
  >;
}

/**
 * Token Service context tag
 */
export class TokenService extends Context.Tag("TokenService")<
  TokenService,
  TokenService
>() {}

/**
 * Create TokenService implementation
 * DEPENDS ON: SuiProviderService
 */
const makeTokenService = Effect.gen(function* () {
  // Get dependency from context
  const provider = yield* SuiProviderService;

  const createToken = (params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    sender: SuiAddress;
  }): Effect.Effect<
    { tokenId: string; txHash: string },
    NetworkError | TransactionFailed
  > =>
    Effect.gen(function* () {
      // Build transaction for token creation
      const tx = new TransactionBlock();

      // Call move function to create token
      // This is a placeholder - actual implementation depends on your Move contract
      const [tokenObject] = tx.moveCall({
        target: "0x2::coin::create_currency",
        arguments: [
          tx.pure(params.name),
          tx.pure(params.symbol),
          tx.pure(params.decimals),
          tx.pure(params.totalSupply),
        ],
      });

      tx.transferObjects([tokenObject], tx.pure(params.sender));

      // Estimate and execute
      const estimate = yield* provider.estimateGas(tx, {
        sender: params.sender,
      });

      const result = yield* provider.signAndExecute(
        tx,
        {
          sender: params.sender,
          gasBudget: Number(estimate.gasCost) * 1.2,
        },
        3
      );

      // Extract token ID from events
      const tokenId =
        result.events?.[0]?.parsedJson?.["token_id"] || "unknown";

      return {
        tokenId,
        txHash: result.digest,
      };
    });

  const transferTokens = (params: {
    tokenType: string;
    recipient: SuiAddress;
    amount: string;
    sender: SuiAddress;
  }): Effect.Effect<
    { txHash: string },
    NetworkError | TransactionFailed | InsufficientBalance
  > =>
    Effect.gen(function* () {
      const tx = new TransactionBlock();

      // Split coins and transfer
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(params.amount)]);
      tx.transferObjects([coin], tx.pure(params.recipient));

      const result = yield* provider.signAndExecute(
        tx,
        {
          sender: params.sender,
          gasBudget: 10000000,
        },
        3
      );

      return {
        txHash: result.digest,
      };
    });

  return {
    createToken,
    transferTokens,
  } satisfies TokenService;
});

/**
 * TokenService layer
 * REQUIRES: SuiProviderService
 */
export const TokenServiceLive: Layer.Layer<
  TokenService,
  never,
  SuiProviderService
> = Layer.effect(TokenService, makeTokenService);

// ============================================================================
// Example 5: Composed Services
// ============================================================================

/**
 * Use TokenService (which depends on SuiProviderService)
 */
const createAndTransferTokenExample = Effect.gen(function* () {
  const tokenService = yield* TokenService;

  const sender: SuiAddress =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  // Create token
  const { tokenId, txHash: createTxHash } = yield* tokenService.createToken({
    name: "Agent Token",
    symbol: "AGT",
    decimals: 9,
    totalSupply: suiToMist("1000000"), // 1M tokens
    sender,
  });

  console.log(`Token created: ${tokenId} (tx: ${createTxHash})`);

  // Transfer some tokens
  const { txHash: transferTxHash } = yield* tokenService.transferTokens({
    tokenType: `${tokenId}::AGT`,
    recipient:
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    amount: suiToMist("100"), // 100 tokens
    sender,
  });

  console.log(`Tokens transferred (tx: ${transferTxHash})`);

  return { tokenId, createTxHash, transferTxHash };
});

/**
 * Run composed services example
 */
export function runComposedServicesExample() {
  // Compose layers: SuiProviderServiceLive → TokenServiceLive
  const AppLayer = SuiProviderServiceLive.pipe(
    Layer.provideMerge(TokenServiceLive)
  );

  return Effect.runPromise(
    createAndTransferTokenExample.pipe(
      Effect.provide(AppLayer),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          console.error("Error:", error);
          return null;
        })
      )
    )
  );
}

// ============================================================================
// Example 6: Check Transaction Status
// ============================================================================

/**
 * Monitor transaction until confirmed
 */
const monitorTransactionExample = (txHash: string) =>
  Effect.gen(function* () {
    const provider = yield* SuiProviderService;

    yield* provider.connect({ network: "mainnet" });

    console.log(`Monitoring transaction: ${txHash}`);

    // Poll every 2 seconds until confirmed
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max

    while (attempts < maxAttempts) {
      const status = yield* provider.getTransactionStatus(txHash);

      console.log(`[${attempts + 1}] Status: ${status.status}`);

      if (status.status === "success") {
        console.log("Transaction confirmed!");
        console.log(`Gas used: ${mistToSui(status.gasUsed)} SUI`);
        if (status.events) {
          console.log(`Events emitted: ${status.events.length}`);
          status.events.forEach((event) => {
            const parsed = parseEvent(event);
            console.log(`  - ${parsed.eventType}`, parsed.data);
          });
        }
        return status;
      }

      if (status.status === "failure") {
        console.error("Transaction failed!");
        return status;
      }

      yield* Effect.sleep(2000);
      attempts++;
    }

    console.error("Transaction monitoring timeout");
    return null;
  });

/**
 * Run transaction monitoring example
 */
export function runMonitorTransactionExample(txHash: string) {
  return Effect.runPromise(
    monitorTransactionExample(txHash).pipe(
      Effect.provide(SuiProviderServiceLive)
    )
  );
}

// ============================================================================
// Example 7: Multi-Network Support
// ============================================================================

/**
 * Get balance across multiple networks
 */
const multiNetworkBalanceExample = (address: SuiAddress) =>
  Effect.gen(function* () {
    const provider = yield* SuiProviderService;

    const networks: SuiNetwork[] = ["mainnet", "testnet", "devnet"];
    const balances: Record<SuiNetwork, string> = {} as any;

    for (const network of networks) {
      yield* provider.connect({ network });
      const balance = yield* provider.getWalletBalance(address);
      balances[network] = balance.suiBalance;
      console.log(`${network}: ${mistToSui(balance.suiBalance)} SUI`);
    }

    return balances;
  });

/**
 * Run multi-network example
 */
export function runMultiNetworkExample(address: SuiAddress) {
  return Effect.runPromise(
    multiNetworkBalanceExample(address).pipe(
      Effect.provide(SuiProviderServiceLive),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          console.error("Error:", error);
          return null;
        })
      )
    )
  );
}

// ============================================================================
// Usage Summary
// ============================================================================

/**
 * USAGE SUMMARY:
 *
 * 1. Basic Usage:
 *    - Import SuiProviderService and SuiProviderServiceLive
 *    - Use Effect.gen to access service via `yield* SuiProviderService`
 *    - Provide layer with Effect.provide(SuiProviderServiceLive)
 *
 * 2. Error Handling:
 *    - Use Effect.catchTags to handle specific errors
 *    - Use Effect.catchAll to handle any error
 *    - Errors are tagged: NetworkError, TransactionFailed, InsufficientBalance
 *
 * 3. Service Composition:
 *    - Create services that depend on SuiProviderService
 *    - Use Layer.effect to create service layers
 *    - Compose layers with Layer.provideMerge
 *
 * 4. Retry Logic:
 *    - Use signAndExecute with maxRetries parameter
 *    - Automatic exponential backoff
 *
 * 5. Event Subscriptions:
 *    - Use subscribeToEvents with callback
 *    - Events are polled every 5 seconds
 *    - Use parseEvent utility to normalize event data
 *
 * 6. Utilities:
 *    - mistToSui() - Convert MIST to SUI
 *    - suiToMist() - Convert SUI to MIST
 *    - parseEvent() - Parse Sui events
 *    - isValidSuiAddress() - Validate address format
 */
