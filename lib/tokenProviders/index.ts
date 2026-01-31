import { TokenMetrics } from '@/lib/types';

// Mock token data for MVP since no API keys available
const MOCK_TOKENS: Record<string, TokenMetrics> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { // USDC
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    createdAt: '2021-06-01T00:00:00Z',
    ageHours: 32000,
    priceUsd: 1.0,
    priceChange1h: 0.01,
    priceChange24h: 0.02,
    marketCap: 35000000000,
    fullyDilutedValuation: 35000000000,
    liquidityUsd: 5000000000,
    holderCount: 2500000,
    top10HolderPercentage: 15.2,
    devHolderPercentage: 0.5,
    volume1h: 120000000,
    volume24h: 2800000000,
    buyCount1h: 45000,
    sellCount1h: 42000,
    netBuysVsSells: 3000,
    website: 'https://www.centre.io/usdc',
    twitter: 'https://twitter.com/centre_io',
    isRenounced: true,
    isFreezeAuthorityRevoked: true,
    isMintAuthorityRevoked: true,
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { // BONK
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk',
    symbol: 'BONK',
    decimals: 5,
    createdAt: '2022-12-25T00:00:00Z',
    ageHours: 9000,
    priceUsd: 0.000023,
    priceChange1h: 5.2,
    priceChange24h: -12.4,
    marketCap: 1500000000,
    fullyDilutedValuation: 2300000000,
    liquidityUsd: 85000000,
    holderCount: 450000,
    top10HolderPercentage: 42.8,
    devHolderPercentage: 18.5,
    volume1h: 25000000,
    volume24h: 180000000,
    buyCount1h: 12000,
    sellCount1h: 15000,
    netBuysVsSells: -3000,
    website: 'https://www.bonkcoin.com',
    twitter: 'https://twitter.com/bonk_inu',
    telegram: 'https://t.me/bonk_inu',
    isRenounced: true,
    isFreezeAuthorityRevoked: true,
    isMintAuthorityRevoked: false,
  },
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': { // SAMO
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    name: 'Samoyedcoin',
    symbol: 'SAMO',
    decimals: 9,
    createdAt: '2021-06-15T00:00:00Z',
    ageHours: 31000,
    priceUsd: 0.012,
    priceChange1h: -2.3,
    priceChange24h: 8.7,
    marketCap: 48000000,
    fullyDilutedValuation: 120000000,
    liquidityUsd: 3200000,
    holderCount: 85000,
    top10HolderPercentage: 68.4,
    devHolderPercentage: 25.3,
    volume1h: 450000,
    volume24h: 5200000,
    buyCount1h: 450,
    sellCount1h: 620,
    netBuysVsSells: -170,
    website: 'https://samoyedcoin.com',
    twitter: 'https://twitter.com/samoyedcoin',
    isRenounced: false,
    isFreezeAuthorityRevoked: false,
    isMintAuthorityRevoked: false,
  },
};

export async function fetchTokenMetrics(mintAddress: string): Promise<TokenMetrics> {
  // Validate mint address format (basic check)
  if (!mintAddress || mintAddress.length < 32) {
    throw new Error('Invalid mint address format');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Return mock data for known tokens, random for others
  if (MOCK_TOKENS[mintAddress]) {
    return { ...MOCK_TOKENS[mintAddress] };
  }

  // Generate random token data for unknown addresses
  const ageHours = Math.floor(Math.random() * 1000) + 1;
  const marketCap = Math.random() * 1000000000;
  const liquidityUsd = marketCap * (Math.random() * 0.1 + 0.01);
  const holderCount = Math.floor(Math.random() * 100000) + 100;
  const top10Percentage = Math.random() * 80 + 10;
  const devPercentage = Math.random() * 30 + 5;
  
  return {
    address: mintAddress,
    name: `Token ${mintAddress.slice(0, 8)}`,
    symbol: `TKN${mintAddress.slice(0, 4)}`,
    decimals: 9,
    createdAt: new Date(Date.now() - ageHours * 60 * 60 * 1000).toISOString(),
    ageHours,
    priceUsd: Math.random() * 10,
    priceChange1h: (Math.random() - 0.5) * 20,
    priceChange24h: (Math.random() - 0.5) * 40,
    marketCap,
    fullyDilutedValuation: marketCap * (Math.random() + 1),
    liquidityUsd,
    holderCount,
    top10HolderPercentage: top10Percentage,
    devHolderPercentage: devPercentage,
    volume1h: marketCap * (Math.random() * 0.05),
    volume24h: marketCap * (Math.random() * 0.15),
    buyCount1h: Math.floor(Math.random() * 1000),
    sellCount1h: Math.floor(Math.random() * 1000),
    netBuysVsSells: Math.floor((Math.random() - 0.5) * 200),
    isRenounced: Math.random() > 0.7,
    isFreezeAuthorityRevoked: Math.random() > 0.6,
    isMintAuthorityRevoked: Math.random() > 0.8,
  };
}

// Real implementation for Birdeye (would be used with API key)
export async function fetchFromBirdeye(mintAddress: string): Promise<TokenMetrics> {
  // This would make actual API call to Birdeye
  // const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;
  // const response = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`, {
  //   headers: { 'X-API-KEY': BIRDEYE_API_KEY! }
  // });
  // const data = await response.json();
  // return transformBirdeyeData(data);
  
  // Fallback to mock for now
  return fetchTokenMetrics(mintAddress);
}

// Real implementation for Solscan (fallback)
export async function fetchFromSolscan(mintAddress: string): Promise<TokenMetrics> {
  // This would make actual API call to Solscan
  // const response = await fetch(`https://api.solscan.io/token?token=${mintAddress}`);
  // const data = await response.json();
  // return transformSolscanData(data);
  
  // Fallback to mock for now
  return fetchTokenMetrics(mintAddress);
}