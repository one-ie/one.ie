// Type definitions for analytics components
export interface TokenMetrics {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  transactions24h: number;
  priceHistory: PriceDataPoint[];
  volumeHistory: VolumeDataPoint[];
  distribution: {
    top10Holders: number;
    walletConcentration: number;
  };
}

export interface PriceDataPoint {
  timestamp: number;
  price: number;
  date: string;
}

export interface VolumeDataPoint {
  timestamp: number;
  volume: number;
  date: string;
}

export interface Holder {
  walletAddress: string;
  balance: string;
  percentage: number;
  valueUSD: number;
  rank: number;
}

export interface RiskScore {
  overallScore: number;
  factors: {
    rugPullRisk: number;
    liquidityRisk: number;
    concentrationRisk: number;
    contractRisk: number;
  };
  signals: {
    redFlags: string[];
    yellowFlags: string[];
    greenFlags: string[];
  };
}

export interface TradingPattern {
  pattern: "accumulation" | "distribution" | "pump" | "stable";
  confidence: number;
  detectedAt: number;
  description: string;
}
