/**
 * Sui Provider Service
 *
 * Effect.ts service for blockchain interaction with Sui network.
 * Provides connection pooling, transaction execution, event subscriptions,
 * and comprehensive error handling.
 *
 * Maps to 6-dimension ontology:
 * - THINGS: tokens, transactions, contracts
 * - EVENTS: transaction_confirmed, event_emitted
 * - CONNECTIONS: holds_tokens, interacted_with
 *
 * @module SuiProviderService
 * @version 1.0.0
 */

import { Effect, Context, Layer, Data } from "effect";
import {
  SuiClient,
  SuiTransactionBlockResponse,
  SuiEvent,
  PaginatedEvents,
  CoinBalance,
  getFullnodeUrl,
  SuiTransactionBlockResponseOptions,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import type {
  SuiNetwork,
  SuiAddress,
  TransactionDigest,
  CoinAmount,
  SuiError,
  SuiTransactionOptions,
} from "../../types/sui";

// ============================================================================
// Error Types
// ============================================================================

/**
 * Network connection error
 *
 * @example
 * Effect.fail(new NetworkError({ network: 'mainnet', message: 'Connection timeout' }))
 */
export class NetworkError extends Data.TaggedError("NetworkError")<{
  network: SuiNetwork;
  message: string;
  cause?: unknown;
}> {}

/**
 * Transaction execution failed
 *
 * @example
 * Effect.fail(new TransactionFailed({ txHash: '0x...', reason: 'Insufficient gas' }))
 */
export class TransactionFailed extends Data.TaggedError("TransactionFailed")<{
  txHash?: string;
  reason: string;
  cause?: unknown;
}> {}

/**
 * Insufficient balance for transaction
 *
 * @example
 * Effect.fail(new InsufficientBalance({ address: '0x...', required: '1000', available: '500' }))
 */
export class InsufficientBalance extends Data.TaggedError(
  "InsufficientBalance"
)<{
  address: string;
  required: string;
  available: string;
}> {}

/**
 * Invalid network configuration
 *
 * @example
 * Effect.fail(new InvalidNetwork({ expected: 'mainnet', actual: 'testnet' }))
 */
export class InvalidNetwork extends Data.TaggedError("InvalidNetwork")<{
  expected: SuiNetwork;
  actual: SuiNetwork;
}> {}

/**
 * Contract interaction error
 *
 * @example
 * Effect.fail(new ContractError({ contractId: '0x...', function: 'transfer', message: 'Invalid recipient' }))
 */
export class ContractError extends Data.TaggedError("ContractError")<{
  contractId: string;
  function: string;
  message: string;
  cause?: unknown;
}> {}

// ============================================================================
// Service Types
// ============================================================================

/**
 * Balance information for a wallet
 */
export interface WalletBalance {
  /** Sui address */
  address: SuiAddress;
  /** SUI balance (in MIST, 1 SUI = 1e9 MIST) */
  suiBalance: string;
  /** Token balances by coin type */
  tokenBalances: Record<string, CoinBalance>;
  /** Total value in USD (if available) */
  totalValueUsd?: string;
}

/**
 * Transaction execution result
 */
export interface TransactionResult {
  /** Transaction digest/hash */
  digest: TransactionDigest;
  /** Transaction status */
  status: "success" | "failure";
  /** Gas used */
  gasUsed: string;
  /** Block timestamp */
  timestamp?: number;
  /** Transaction effects */
  effects?: unknown;
  /** Events emitted */
  events?: SuiEvent[];
}

/**
 * Gas estimation result
 */
export interface GasEstimate {
  /** Estimated gas cost in MIST */
  gasCost: string;
  /** Estimated gas cost in SUI */
  gasCostSui: string;
  /** Computation cost */
  computationCost: string;
  /** Storage cost */
  storageCost: string;
  /** Storage rebate */
  storageRebate: string;
}

/**
 * Event subscription callback
 */
export type EventCallback = (event: SuiEvent) => Effect.Effect<void, never>;

/**
 * Connection configuration
 */
export interface ConnectionConfig {
  /** Network to connect to */
  network: SuiNetwork;
  /** Optional custom RPC URL */
  rpcUrl?: string;
  /** Connection timeout in ms */
  timeout?: number;
  /** Max retry attempts */
  maxRetries?: number;
}

// ============================================================================
// Service Definition
// ============================================================================

/**
 * SuiProviderService interface
 *
 * Provides blockchain interaction capabilities for Sui network.
 */
export interface SuiProviderService {
  /**
   * Connect to Sui network
   *
   * @example
   * Effect.gen(function* () {
   *   const provider = yield* SuiProviderService;
   *   const client = yield* provider.connect({ network: 'mainnet' });
   * });
   */
  connect(
    config: ConnectionConfig
  ): Effect.Effect<SuiClient, NetworkError | InvalidNetwork>;

  /**
   * Get wallet balance (SUI + tokens)
   *
   * @example
   * Effect.gen(function* () {
   *   const provider = yield* SuiProviderService;
   *   const balance = yield* provider.getWalletBalance('0x1234...');
   *   console.log(`SUI Balance: ${balance.suiBalance}`);
   * });
   */
  getWalletBalance(
    address: SuiAddress
  ): Effect.Effect<WalletBalance, NetworkError>;

  /**
   * Execute programmable transaction block
   *
   * @example
   * Effect.gen(function* () {
   *   const provider = yield* SuiProviderService;
   *   const tx = new TransactionBlock();
   *   tx.moveCall({ target: '0x...::module::function', arguments: [] });
   *   const result = yield* provider.executeTransaction(tx, {
   *     sender: '0x1234...',
   *     gasBudget: 10000000
   *   });
   * });
   */
  executeTransaction(
    transaction: TransactionBlock,
    options: SuiTransactionOptions
  ): Effect.Effect<
    TransactionResult,
    TransactionFailed | InsufficientBalance | NetworkError
  >;

  /**
   * Subscribe to smart contract events
   *
   * @example
   * Effect.gen(function* () {
   *   const provider = yield* SuiProviderService;
   *   yield* provider.subscribeToEvents(
   *     { packageId: '0x...', module: 'token', eventType: 'Transfer' },
   *     (event) => Effect.sync(() => console.log('Event:', event))
   *   );
   * });
   */
  subscribeToEvents(
    filter: {
      packageId: string;
      module: string;
      eventType: string;
    },
    callback: EventCallback
  ): Effect.Effect<void, NetworkError>;

  /**
   * Get transaction status and confirmation
   *
   * @example
   * Effect.gen(function* () {
   *   const provider = yield* SuiProviderService;
   *   const status = yield* provider.getTransactionStatus('0x...');
   *   console.log(`Status: ${status.status}`);
   * });
   */
  getTransactionStatus(
    txHash: TransactionDigest
  ): Effect.Effect<TransactionResult, NetworkError>;

  /**
   * Estimate gas cost for transaction
   *
   * @example
   * Effect.gen(function* () {
   *   const provider = yield* SuiProviderService;
   *   const tx = new TransactionBlock();
   *   const estimate = yield* provider.estimateGas(tx, { sender: '0x...' });
   *   console.log(`Gas cost: ${estimate.gasCostSui} SUI`);
   * });
   */
  estimateGas(
    transaction: TransactionBlock,
    options: SuiTransactionOptions
  ): Effect.Effect<GasEstimate, NetworkError | TransactionFailed>;

  /**
   * Sign and execute transaction (with retry logic)
   *
   * @example
   * Effect.gen(function* () {
   *   const provider = yield* SuiProviderService;
   *   const tx = new TransactionBlock();
   *   const result = yield* provider.signAndExecute(
   *     tx,
   *     { sender: '0x...', gasBudget: 10000000 },
   *     3 // max retries
   *   );
   * });
   */
  signAndExecute(
    transaction: TransactionBlock,
    options: SuiTransactionOptions,
    maxRetries?: number
  ): Effect.Effect<
    TransactionResult,
    TransactionFailed | InsufficientBalance | NetworkError
  >;
}

/**
 * SuiProviderService context tag
 */
export class SuiProviderService extends Context.Tag("SuiProviderService")<
  SuiProviderService,
  SuiProviderService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Connection pool for multiple networks
 */
class ConnectionPool {
  private clients: Map<SuiNetwork, SuiClient> = new Map();

  getOrCreate(config: ConnectionConfig): SuiClient {
    const existing = this.clients.get(config.network);
    if (existing) return existing;

    const url = config.rpcUrl || getFullnodeUrl(config.network);
    const client = new SuiClient({ url });
    this.clients.set(config.network, client);
    return client;
  }

  get(network: SuiNetwork): SuiClient | undefined {
    return this.clients.get(network);
  }

  clear(): void {
    this.clients.clear();
  }
}

/**
 * Retry with exponential backoff
 *
 * @example
 * const result = yield* retryWithBackoff(
 *   () => executeTransaction(...),
 *   3,
 *   1000
 * );
 */
function retryWithBackoff<A, E>(
  operation: () => Effect.Effect<A, E>,
  maxRetries: number,
  initialDelay: number = 1000
): Effect.Effect<A, E> {
  return Effect.gen(function* () {
    let lastError: E | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = yield* Effect.either(operation());

      if (result._tag === "Right") {
        return result.right;
      }

      lastError = result.left;

      // Don't sleep on last attempt
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        yield* Effect.sleep(delay);
      }
    }

    return yield* Effect.fail(lastError as E);
  });
}

/**
 * Create SuiProviderService implementation
 */
const makeSuiProviderService = Effect.gen(function* () {
  const pool = new ConnectionPool();
  let currentClient: SuiClient | null = null;
  let currentNetwork: SuiNetwork | null = null;

  const connect = (
    config: ConnectionConfig
  ): Effect.Effect<SuiClient, NetworkError | InvalidNetwork> =>
    Effect.gen(function* () {
      try {
        const client = pool.getOrCreate(config);
        currentClient = client;
        currentNetwork = config.network;

        // Verify connection
        yield* Effect.tryPromise({
          try: () => client.getLatestSuiSystemState(),
          catch: (error) =>
            new NetworkError({
              network: config.network,
              message: `Failed to connect to ${config.network}`,
              cause: error,
            }),
        });

        return client;
      } catch (error) {
        return yield* Effect.fail(
          new NetworkError({
            network: config.network,
            message: "Connection failed",
            cause: error,
          })
        );
      }
    });

  const getWalletBalance = (
    address: SuiAddress
  ): Effect.Effect<WalletBalance, NetworkError> =>
    Effect.gen(function* () {
      if (!currentClient) {
        return yield* Effect.fail(
          new NetworkError({
            network: "mainnet",
            message: "Not connected to network",
          })
        );
      }

      const [suiBalance, allBalances] = yield* Effect.all([
        Effect.tryPromise({
          try: () => currentClient.getBalance({ owner: address }),
          catch: (error) =>
            new NetworkError({
              network: currentNetwork || "mainnet",
              message: "Failed to get SUI balance",
              cause: error,
            }),
        }),
        Effect.tryPromise({
          try: () => currentClient.getAllBalances({ owner: address }),
          catch: (error) =>
            new NetworkError({
              network: currentNetwork || "mainnet",
              message: "Failed to get token balances",
              cause: error,
            }),
        }),
      ]);

      const tokenBalances: Record<string, CoinBalance> = {};
      for (const balance of allBalances) {
        tokenBalances[balance.coinType] = balance;
      }

      return {
        address,
        suiBalance: suiBalance.totalBalance,
        tokenBalances,
      };
    });

  const executeTransaction = (
    transaction: TransactionBlock,
    options: SuiTransactionOptions
  ): Effect.Effect<
    TransactionResult,
    TransactionFailed | InsufficientBalance | NetworkError
  > =>
    Effect.gen(function* () {
      if (!currentClient) {
        return yield* Effect.fail(
          new NetworkError({
            network: "mainnet",
            message: "Not connected to network",
          })
        );
      }

      // Set transaction options
      if (options.gasBudget) {
        transaction.setGasBudget(options.gasBudget);
      }

      if (options.sender) {
        transaction.setSender(options.sender);
      }

      // Check balance before executing
      if (options.sender) {
        const balance = yield* getWalletBalance(options.sender);
        const gasBudget = options.gasBudget?.toString() || "0";

        if (BigInt(balance.suiBalance) < BigInt(gasBudget)) {
          return yield* Effect.fail(
            new InsufficientBalance({
              address: options.sender,
              required: gasBudget,
              available: balance.suiBalance,
            })
          );
        }
      }

      const response = yield* Effect.tryPromise({
        try: async () => {
          // In production, you would sign with a wallet/keypair
          // For now, this is a placeholder for the signing logic
          const txBytes = await transaction.build({
            client: currentClient!,
          });

          // Execute transaction
          // NOTE: This requires a signer - in production integrate with wallet
          throw new Error(
            "Transaction signing not implemented - integrate with wallet"
          );

          // Example of what it would look like with a signer:
          // return await currentClient!.signAndExecuteTransactionBlock({
          //   transactionBlock: txBytes,
          //   signer: keypair,
          //   options: {
          //     showEffects: true,
          //     showEvents: true,
          //   },
          // });
        },
        catch: (error) =>
          new TransactionFailed({
            reason: error instanceof Error ? error.message : String(error),
            cause: error,
          }),
      });

      return {
        digest: response.digest,
        status: response.effects?.status?.status === "success" ? "success" : "failure",
        gasUsed: response.effects?.gasUsed?.computationCost || "0",
        timestamp: response.timestampMs ? Number(response.timestampMs) : undefined,
        effects: response.effects,
        events: response.events,
      };
    });

  const subscribeToEvents = (
    filter: {
      packageId: string;
      module: string;
      eventType: string;
    },
    callback: EventCallback
  ): Effect.Effect<void, NetworkError> =>
    Effect.gen(function* () {
      if (!currentClient) {
        return yield* Effect.fail(
          new NetworkError({
            network: "mainnet",
            message: "Not connected to network",
          })
        );
      }

      // Construct event filter
      const eventFilter = {
        MoveEventType: `${filter.packageId}::${filter.module}::${filter.eventType}`,
      };

      // Subscribe to events
      yield* Effect.tryPromise({
        try: async () => {
          // Poll for events (Sui doesn't have websocket subscriptions yet)
          let cursor: string | null | undefined = null;

          const pollInterval = setInterval(async () => {
            try {
              const events: PaginatedEvents =
                await currentClient!.queryEvents({
                  query: eventFilter,
                  cursor,
                  limit: 50,
                });

              for (const event of events.data) {
                // Run callback in Effect context
                await Effect.runPromise(callback(event));
              }

              cursor = events.nextCursor;
            } catch (error) {
              console.error("Event polling error:", error);
            }
          }, 5000); // Poll every 5 seconds

          // Keep subscription alive
          return new Promise(() => {
            /* Never resolves - keeps polling */
          });
        },
        catch: (error) =>
          new NetworkError({
            network: currentNetwork || "mainnet",
            message: "Failed to subscribe to events",
            cause: error,
          }),
      });
    });

  const getTransactionStatus = (
    txHash: TransactionDigest
  ): Effect.Effect<TransactionResult, NetworkError> =>
    Effect.gen(function* () {
      if (!currentClient) {
        return yield* Effect.fail(
          new NetworkError({
            network: "mainnet",
            message: "Not connected to network",
          })
        );
      }

      const response = yield* Effect.tryPromise({
        try: () =>
          currentClient.getTransactionBlock({
            digest: txHash,
            options: {
              showEffects: true,
              showEvents: true,
            },
          }),
        catch: (error) =>
          new NetworkError({
            network: currentNetwork || "mainnet",
            message: "Failed to get transaction status",
            cause: error,
          }),
      });

      return {
        digest: response.digest,
        status: response.effects?.status?.status === "success" ? "success" : "failure",
        gasUsed: response.effects?.gasUsed?.computationCost || "0",
        timestamp: response.timestampMs ? Number(response.timestampMs) : undefined,
        effects: response.effects,
        events: response.events,
      };
    });

  const estimateGas = (
    transaction: TransactionBlock,
    options: SuiTransactionOptions
  ): Effect.Effect<GasEstimate, NetworkError | TransactionFailed> =>
    Effect.gen(function* () {
      if (!currentClient) {
        return yield* Effect.fail(
          new NetworkError({
            network: "mainnet",
            message: "Not connected to network",
          })
        );
      }

      if (options.sender) {
        transaction.setSender(options.sender);
      }

      const dryRunResult = yield* Effect.tryPromise({
        try: async () => {
          const txBytes = await transaction.build({
            client: currentClient!,
          });

          return await currentClient!.dryRunTransactionBlock({
            transactionBlock: txBytes,
          });
        },
        catch: (error) =>
          new TransactionFailed({
            reason: "Gas estimation failed",
            cause: error,
          }),
      });

      const gasUsed = dryRunResult.effects.gasUsed;
      const computationCost = gasUsed.computationCost;
      const storageCost = gasUsed.storageCost;
      const storageRebate = gasUsed.storageRebate;

      const totalCost =
        BigInt(computationCost) +
        BigInt(storageCost) -
        BigInt(storageRebate);

      return {
        gasCost: totalCost.toString(),
        gasCostSui: (Number(totalCost) / 1e9).toFixed(9),
        computationCost,
        storageCost,
        storageRebate,
      };
    });

  const signAndExecute = (
    transaction: TransactionBlock,
    options: SuiTransactionOptions,
    maxRetries: number = 3
  ): Effect.Effect<
    TransactionResult,
    TransactionFailed | InsufficientBalance | NetworkError
  > =>
    retryWithBackoff(
      () => executeTransaction(transaction, options),
      maxRetries
    );

  return {
    connect,
    getWalletBalance,
    executeTransaction,
    subscribeToEvents,
    getTransactionStatus,
    estimateGas,
    signAndExecute,
  } satisfies SuiProviderService;
});

// ============================================================================
// Service Layer
// ============================================================================

/**
 * Live SuiProviderService layer
 *
 * @example
 * const program = Effect.gen(function* () {
 *   const provider = yield* SuiProviderService;
 *   yield* provider.connect({ network: 'mainnet' });
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(SuiProviderServiceLive)));
 */
export const SuiProviderServiceLive: Layer.Layer<
  SuiProviderService,
  never,
  never
> = Layer.effect(SuiProviderService, makeSuiProviderService);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse Sui event to normalized format
 *
 * @example
 * const parsedEvent = parseEvent(rawEvent);
 * console.log(parsedEvent.type, parsedEvent.data);
 */
export function parseEvent(event: SuiEvent): {
  type: string;
  packageId: string;
  module: string;
  eventType: string;
  data: unknown;
  timestamp: number;
  txDigest: string;
} {
  const eventType = event.type;
  const parts = eventType.split("::");

  return {
    type: eventType,
    packageId: parts[0] || "",
    module: parts[1] || "",
    eventType: parts[2] || "",
    data: event.parsedJson,
    timestamp: Number(event.timestampMs || Date.now()),
    txDigest: event.id.txDigest,
  };
}

/**
 * Convert MIST to SUI
 *
 * @example
 * const sui = mistToSui('1000000000'); // '1.000000000'
 */
export function mistToSui(mist: string): string {
  return (Number(mist) / 1e9).toFixed(9);
}

/**
 * Convert SUI to MIST
 *
 * @example
 * const mist = suiToMist('1.5'); // '1500000000'
 */
export function suiToMist(sui: string): string {
  return (Math.floor(Number(sui) * 1e9)).toString();
}

/**
 * Validate Sui address format
 *
 * @example
 * const isValid = isValidSuiAddress('0x1234...'); // true/false
 */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}
