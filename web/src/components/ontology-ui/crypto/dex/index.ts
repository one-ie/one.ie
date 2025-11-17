/**
 * DEX Trading Components
 *
 * Decentralized exchange components for token swaps, limit orders,
 * DCA strategies, and transaction settings.
 *
 * @module crypto/dex
 */

export { DCAStrategy } from "./DCAStrategy";
export { GasSettings } from "./GasSettings";
export { LimitOrder } from "./LimitOrder";
export { SlippageSettings } from "./SlippageSettings";
export { SwapHistory } from "./SwapHistory";
export { SwapQuote } from "./SwapQuote";
export { TokenSwap } from "./TokenSwap";

export type {
  DCAStrategyData,
  DCAStrategyProps,
  GasConfig,
  GasSettingsProps,
  LimitOrderData,
  LimitOrderProps,
  SlippageConfig,
  SlippageSettingsProps,
  SwapHistoryProps,
  SwapQuoteData,
  SwapQuoteProps,
  SwapRoute,
  SwapTransaction,
  Token,
  TokenSwapProps,
} from "./types";
