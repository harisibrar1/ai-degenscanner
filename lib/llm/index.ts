import { AnalysisResult, TokenMetrics } from '@/lib/types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';

// Mock AI response generator for MVP (would use OpenAI API in production)
export async function analyzeWithAI(tokenMetrics: TokenMetrics): Promise<AnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check for critical missing data
  const missingData: string[] = [];
  if (!tokenMetrics.ageHours) missingData.push('age');
  if (!tokenMetrics.liquidityUsd) missingData.push('liquidity');
  if (!tokenMetrics.holderCount) missingData.push('holders');
  if (!tokenMetrics.top10HolderPercentage) missingData.push('top10_holdings');
  if (!tokenMetrics.devHolderPercentage) missingData.push('dev_holdings');

  // Determine verdict based on metrics
  let verdict: AnalysisResult['verdict'] = 'UNCLEAR';
  let degenScore = 5;
  let confidence = 75;
  const redFlags: string[] = [];
  const yellowFlags: string[] = [];
  const greenFlags: string[] = [];

  // Age analysis
  const ageHours = tokenMetrics.ageHours || 0;
  if (ageHours < 1) {
    redFlags.push('Token is less than 1 hour old - extreme rug risk');
    degenScore += 3;
  } else if (ageHours < 24) {
    yellowFlags.push('Token is less than 24 hours old - high risk');
    degenScore += 2;
  } else if (ageHours > 168) { // 7 days
    greenFlags.push('Token is over 7 days old - established');
    degenScore -= 1;
  }

  // Liquidity analysis
  const liquidity = tokenMetrics.liquidityUsd || 0;
  if (liquidity < 10000) {
    redFlags.push('Liquidity under $10k - high rug pull risk');
    degenScore += 3;
  } else if (liquidity < 100000) {
    yellowFlags.push('Liquidity $10k-$100k - thin liquidity');
    degenScore += 1;
  } else if (liquidity > 1000000) {
    greenFlags.push('Liquidity over $1M - healthy pool');
    degenScore -= 1;
  }

  // Holder concentration analysis
  const top10 = tokenMetrics.top10HolderPercentage || 0;
  if (top10 > 80) {
    redFlags.push(`Top 10 holders control ${top10.toFixed(1)}% - extreme concentration risk`);
    degenScore += 3;
  } else if (top10 > 50) {
    yellowFlags.push(`Top 10 holders control ${top10.toFixed(1)}% - high concentration`);
    degenScore += 2;
  } else if (top10 < 20) {
    greenFlags.push(`Top 10 holders control ${top10.toFixed(1)}% - good distribution`);
    degenScore -= 1;
  }

  // Dev holdings analysis
  const devPercentage = tokenMetrics.devHolderPercentage || 0;
  if (devPercentage > 30) {
    redFlags.push(`Dev holds ${devPercentage.toFixed(1)}% - high insider control`);
    degenScore += 3;
  } else if (devPercentage > 10) {
    yellowFlags.push(`Dev holds ${devPercentage.toFixed(1)}% - concerning insider holdings`);
    degenScore += 1;
  } else if (devPercentage < 5) {
    greenFlags.push(`Dev holds ${devPercentage.toFixed(1)}% - reasonable insider holdings`);
    degenScore -= 1;
  }

  // Contract safety
  if (tokenMetrics.isRenounced) {
    greenFlags.push('Mint authority renounced - contract safety');
    degenScore -= 2;
  } else {
    yellowFlags.push('Mint authority not renounced - dev can mint more tokens');
    degenScore += 1;
  }

  if (tokenMetrics.isFreezeAuthorityRevoked) {
    greenFlags.push('Freeze authority revoked - cannot freeze accounts');
    degenScore -= 1;
  }

  // Volume and activity
  const volumeRatio = (tokenMetrics.volume1h || 0) / (tokenMetrics.marketCap || 1);
  if (volumeRatio > 0.1) {
    yellowFlags.push('High 1h volume relative to market cap - extreme volatility');
    degenScore += 1;
  }

  const netBuys = tokenMetrics.netBuysVsSells || 0;
  if (netBuys > 0) {
    greenFlags.push(`Net positive buys in last hour (+${netBuys}) - buying pressure`);
    degenScore -= 1;
  } else if (netBuys < -50) {
    yellowFlags.push(`Net negative buys in last hour (${netBuys}) - selling pressure`);
    degenScore += 1;
  }

  // Price volatility
  const priceChange = tokenMetrics.priceChange1h || 0;
  if (Math.abs(priceChange) > 20) {
    yellowFlags.push(`1h price change ${priceChange.toFixed(1)}% - extreme volatility`);
    degenScore += 1;
  }

  // Determine final verdict
  if (missingData.length >= 3) {
    verdict = 'UNCLEAR';
    confidence = 50;
  } else if (redFlags.length >= 3) {
    verdict = 'SCAM';
    degenScore = Math.min(10, degenScore);
  } else if (degenScore >= 8) {
    verdict = 'COOKED';
  } else if (degenScore >= 6) {
    verdict = 'DEGEN';
  } else if (degenScore >= 4) {
    verdict = 'APEX_RISK';
  } else if (degenScore <= 2 && greenFlags.length >= 3) {
    verdict = 'BASED';
  } else if (degenScore <= 4) {
    verdict = 'SAFE';
  } else {
    verdict = 'UNCLEAR';
  }

  // Clamp degen score to 0-10
  degenScore = Math.max(0, Math.min(10, degenScore));

  // Adjust confidence based on data completeness
  if (missingData.length > 0) {
    confidence = Math.max(30, 100 - (missingData.length * 15));
  }

  // Format key metrics for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number): string => `${num.toFixed(1)}%`;

  return {
    verdict,
    degenScore,
    confidence,
    redFlags,
    yellowFlags,
    greenFlags,
    keyMetrics: {
      age: ageHours < 24 ? `${ageHours.toFixed(1)} hours` : `${(ageHours / 24).toFixed(1)} days`,
      liquidity: formatNumber(liquidity),
      marketCap: formatNumber(tokenMetrics.marketCap || 0),
      holders: (tokenMetrics.holderCount || 0).toLocaleString(),
      top10Percentage: formatPercentage(top10),
      devPercentage: formatPercentage(devPercentage),
      volume1h: formatNumber(tokenMetrics.volume1h || 0),
      buysVsSells: netBuys >= 0 ? `+${netBuys} net buys` : `${netBuys} net sells`,
      priceChange: `${priceChange.toFixed(1)}%`
    },
    watchList: [
      ...(liquidity < 50000 ? ['Monitor liquidity changes'] : []),
      ...(top10 > 60 ? ['Watch for large holder sells'] : []),
      ...(devPercentage > 15 ? ['Monitor dev wallet activity'] : []),
      ...(ageHours < 48 ? ['Token is very new - high risk period'] : []),
      ...(volumeRatio > 0.05 ? ['High volatility - set stop losses'] : [])
    ],
    missingData,
    rawMetrics: tokenMetrics
  };
}

// Real OpenAI implementation (would be used with API key)
export async function analyzeWithOpenAI(tokenMetrics: TokenMetrics): Promise<AnalysisResult> {
  // This would make actual API call to OpenAI
  // const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${OPENAI_API_KEY}`
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4-turbo-preview',
  //     messages: [
  //       { role: 'system', content: SYSTEM_PROMPT },
  //       { role: 'user', content: buildUserPrompt(tokenMetrics) }
  //     ],
  //     temperature: 0.1,
  //     response_format: { type: 'json_object' }
  //   })
  // });
  // 
  // const data = await response.json();
  // const result = JSON.parse(data.choices[0].message.content);
  // return { ...result, rawMetrics: tokenMetrics };
  
  // Fallback to mock for now
  return analyzeWithAI(tokenMetrics);
}