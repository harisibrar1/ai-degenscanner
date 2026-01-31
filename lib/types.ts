export interface TokenMetrics {
  // Basic token info
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  
  // Age and timestamps
  createdAt?: string;
  ageHours?: number;
  
  // Market metrics
  priceUsd?: number;
  priceChange1h?: number;
  priceChange24h?: number;
  marketCap?: number;
  fullyDilutedValuation?: number;
  
  // Liquidity
  liquidityUsd?: number;
  
  // Holders
  holderCount?: number;
  top10HolderPercentage?: number;
  devHolderPercentage?: number;
  
  // Volume
  volume1h?: number;
  volume24h?: number;
  
  // Trading activity
  buyCount1h?: number;
  sellCount1h?: number;
  netBuysVsSells?: number;
  
  // Social/other
  website?: string;
  twitter?: string;
  telegram?: string;
  
  // Flags
  isRenounced?: boolean;
  isFreezeAuthorityRevoked?: boolean;
  isMintAuthorityRevoked?: boolean;
}

export interface AnalysisResult {
  // Core verdict
  verdict: 'COOKED' | 'DEGEN' | 'SAFE' | 'SCAM' | 'UNCLEAR' | 'APEX_RISK' | 'BASED';
  degenScore: number; // 0-10
  confidence: number; // 0-100
  
  // Flags
  redFlags: string[];
  yellowFlags: string[];
  greenFlags: string[];
  
  // Key metrics summary
  keyMetrics: {
    age: string;
    liquidity: string;
    marketCap: string;
    holders: string;
    top10Percentage: string;
    devPercentage: string;
    volume1h: string;
    buysVsSells: string;
    priceChange: string;
  };
  
  // What to watch
  watchList: string[];
  
  // Missing data
  missingData: string[];
  
  // Raw metrics for reference
  rawMetrics: TokenMetrics;
}

export interface ScanRequest {
  mintAddress: string;
}

export interface ScanResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  cached?: boolean;
}