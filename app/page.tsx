"use client";

import { useState } from 'react';
import { ScanResponse, AnalysisResult } from '@/lib/types';

export default function Home() {
  const [mintAddress, setMintAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleScan = async () => {
    if (!mintAddress.trim()) {
      setError('Please enter a mint address');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mintAddress: mintAddress.trim() }),
      });

      const data: ScanResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan token');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'COOKED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'DEGEN':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'SAFE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SCAM':
        return 'bg-red-500 text-white border-red-700';
      case 'UNCLEAR':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'APEX_RISK':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'BASED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDegenScoreColor = (score: number) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Degenscanner</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Paste a Solana token mint address to get AI-powered analysis, degen score, and risk assessment.
          </p>
        </header>

        {/* Main Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="mintAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Solana Token Mint Address
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                id="mintAddress"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                suppressHydrationWarning
              />
              <button
                onClick={handleScan}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scanning...
                  </span>
                ) : (
                  'Scan Token'
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Try: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (USDC), DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263 (BONK), or any Solana mint address
            </p>
          </div>

          {/* Results */}
          {result?.success && result.data && (
            <div className="mt-8 space-y-8">
              {/* Verdict Banner */}
              <div className={`p-6 rounded-xl border-2 ${getVerdictColor(result.data.verdict)}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Verdict: {result.data.verdict}</h2>
                    <p className="text-lg">
                      {result.data.verdict === 'COOKED' && 'Fully degen - high risk, might be cooked'}
                      {result.data.verdict === 'DEGEN' && 'Speculative - degen territory'}
                      {result.data.verdict === 'SAFE' && 'Established - relatively safe'}
                      {result.data.verdict === 'SCAM' && 'Obvious scam - avoid'}
                      {result.data.verdict === 'UNCLEAR' && 'Insufficient data - be cautious'}
                      {result.data.verdict === 'APEX_RISK' && 'Extreme volatility - apex predator risk'}
                      {result.data.verdict === 'BASED' && 'Solid fundamentals - based'}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{result.data.degenScore}/10</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Degen Score</div>
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${getDegenScoreColor(result.data.degenScore)} transition-all duration-500`}
                          style={{ width: `${result.data.degenScore * 10}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{result.data.confidence}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Confidence</div>
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${getConfidenceColor(result.data.confidence)} transition-all duration-500`}
                          style={{ width: `${result.data.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Red Flags */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Red Flags ({result.data.redFlags.length})
                  </h3>
                  {result.data.redFlags.length > 0 ? (
                    <ul className="space-y-2">
                      {result.data.redFlags.map((flag, index) => (
                        <li key={index} className="text-red-700 dark:text-red-400 text-sm flex items-start">
                          <span className="mr-2">⚠️</span> {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 dark:text-green-400 text-sm">No critical red flags detected</p>
                  )}
                </div>

                {/* Yellow Flags */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    Yellow Flags ({result.data.yellowFlags.length})
                  </h3>
                  {result.data.yellowFlags.length > 0 ? (
                    <ul className="space-y-2">
                      {result.data.yellowFlags.map((flag, index) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-400 text-sm flex items-start">
                          <span className="mr-2">⚠️</span> {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 dark:text-green-400 text-sm">No warning flags detected</p>
                  )}
                </div>

                {/* Green Flags */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Green Flags ({result.data.greenFlags.length})
                  </h3>
                  {result.data.greenFlags.length > 0 ? (
                    <ul className="space-y-2">
                      {result.data.greenFlags.map((flag, index) => (
                        <li key={index} className="text-green-700 dark:text-green-400 text-sm flex items-start">
                          <span className="mr-2">✅</span> {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No positive flags detected</p>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(result.data.keyMetrics).map(([key, value]) => (
                    <div key={key} className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watch List & Missing Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* What to Watch */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                    <span className="mr-2">👀</span>
                    What to Watch
                  </h3>
                  {result.data.watchList.length > 0 ? (
                    <ul className="space-y-2">
                      {result.data.watchList.map((item, index) => (
                        <li key={index} className="text-blue-700 dark:text-blue-400 text-sm">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No specific watch items</p>
                  )}
                </div>

                {/* Missing Data */}
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    Missing Data
                  </h3>
                  {result.data.missingData.length > 0 ? (
                    <>
                      <ul className="space-y-2 mb-3">
                        {result.data.missingData.map((item, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-400 text-sm">
                            • {item.replace(/_/g, ' ')}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Analysis confidence affected by missing data
                      </p>
                    </>
                  ) : (
                    <p className="text-green-600 dark:text-green-400 text-sm">All critical data available</p>
                  )}
                </div>
              </div>

              {/* Token Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Token Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</div>
                    <div className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      {formatAddress(result.data.rawMetrics.address)}
                    </div>
                  </div>
                  {result.data.rawMetrics.name && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {result.data.rawMetrics.name} ({result.data.rawMetrics.symbol})
                      </div>
                    </div>
                  )}
                </div>
                {result.cached && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      ⚡ Showing cached results (from last 60 seconds)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p className="mb-2">
            AI Degenscanner analyzes Solana tokens using mock data for MVP demonstration.
            Add your API keys for real Birdeye and OpenAI integration.
          </p>
          <p className="text-xs">
            This tool is for educational purposes only. Always do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}
