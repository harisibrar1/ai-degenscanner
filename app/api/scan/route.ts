import { NextRequest, NextResponse } from 'next/server';
import { fetchTokenMetrics } from '@/lib/tokenProviders';
import { analyzeWithAI } from '@/lib/llm';
import { ScanResponse } from '@/lib/types';

// Simple in-memory cache for rate limiting and token data
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const tokenCache = new Map<string, { data: any; timestamp: number }>();

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Cache duration: 60 seconds
const CACHE_DURATION = 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Reset if window has passed
  if (now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Check if limit exceeded
  if (limit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  limit.count += 1;
  rateLimit.set(ip, limit);
  return { allowed: true, remaining: RATE_LIMIT_MAX - limit.count };
}

function getFromCache(mintAddress: string): any | null {
  const cached = tokenCache.get(mintAddress);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    tokenCache.delete(mintAddress);
    return null;
  }

  return cached.data;
}

function setCache(mintAddress: string, data: any): void {
  tokenCache.set(mintAddress, {
    data,
    timestamp: Date.now()
  });
}

// Clean up old cache entries periodically (simple implementation)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tokenCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION * 10) { // 10x cache duration
        tokenCache.delete(key);
      }
    }
  }, 60000); // Run every minute
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.get(ip)?.resetTime || 0 - Date.now()) / 1000)} seconds.`
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { mintAddress } = body;

    // Validate mint address
    if (!mintAddress || typeof mintAddress !== 'string') {
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          error: 'Missing or invalid mint address'
        },
        { status: 400 }
      );
    }

    // Basic format validation (Solana addresses are base58 encoded, 32-44 chars)
    if (mintAddress.length < 32 || mintAddress.length > 44) {
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          error: 'Invalid mint address format'
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResult = getFromCache(mintAddress);
    if (cachedResult) {
      return NextResponse.json<ScanResponse>({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // Fetch token metrics
    let tokenMetrics;
    try {
      tokenMetrics = await fetchTokenMetrics(mintAddress);
    } catch (error) {
      console.error('Error fetching token metrics:', error);
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          error: 'Failed to fetch token data. The token may not exist or the provider is unavailable.'
        },
        { status: 500 }
      );
    }

    // Analyze with AI
    let analysisResult;
    try {
      analysisResult = await analyzeWithAI(tokenMetrics);
    } catch (error) {
      console.error('Error analyzing token:', error);
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          error: 'Failed to analyze token. Please try again.'
        },
        { status: 500 }
      );
    }

    // Cache the result
    setCache(mintAddress, analysisResult);

    // Return success response
    return NextResponse.json<ScanResponse>({
      success: true,
      data: analysisResult,
      cached: false
    });

  } catch (error) {
    console.error('Unexpected error in scan route:', error);
    return NextResponse.json<ScanResponse>(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json<ScanResponse>(
    {
      success: false,
      error: 'Method not allowed. Use POST with { "mintAddress": "token_address_here" }'
    },
    { status: 405 }
  );
}