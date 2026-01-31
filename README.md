# AI Degenscanner

An AI-powered Solana token analysis tool for degen traders. Paste a token mint address and get instant analysis including degen score, risk flags, and key metrics.

## Features

- **AI-Powered Analysis**: Mock AI analysis with real OpenAI integration ready
- **Comprehensive Metrics**: Age, liquidity, market cap, holders, concentration, volume, and more
- **Risk Assessment**: Red/Yellow/Green flags with specific warnings
- **Degen Score**: 0-10 scale from safest to maximum degen
- **Confidence Rating**: 0-100% based on data completeness
- **Real-time Caching**: 60-second cache to avoid repeated API calls
- **Rate Limiting**: 10 requests per minute per IP
- **Dark/Light Mode**: Full theme support

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Mock API** for demonstration (no API keys required for MVP)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-degenscanner
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

For production use with real API integration, create a `.env.local` file:

```env
# OpenAI API Key (for real AI analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Birdeye API Key (for real token data)
BIRDEYE_API_KEY=your_birdeye_api_key_here

# Optional: Solscan or Helius fallback
SOLSCAN_API_KEY=your_solscan_api_key_here
HELIUS_API_KEY=your_helius_api_key_here
```

## Project Structure

```
ai-degenscanner/
├── app/
│   ├── api/
│   │   └── scan/
│   │       └── route.ts          # Scan API endpoint
│   ├── page.tsx                  # Main landing page UI
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── tokenProviders/
│   │   └── index.ts              # Token data providers (Birdeye, Solscan, mock)
│   └── llm/
│       ├── index.ts              # AI analysis logic
│       └── prompt.ts             # LLM system prompt
├── public/                       # Static assets
└── package.json
```

## API Usage

### Scan Token

**Endpoint:** `POST /api/scan`

**Request Body:**
```json
{
  "mintAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
}
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "verdict": "SAFE",
    "degenScore": 2,
    "confidence": 85,
    "redFlags": [],
    "yellowFlags": ["Liquidity $10k-$100k - thin liquidity"],
    "greenFlags": ["Token is over 7 days old - established", "Mint authority renounced - contract safety"],
    "keyMetrics": {
      "age": "13.5 days",
      "liquidity": "$50.23K",
      "marketCap": "$1.23M",
      "holders": "1,234",
      "top10Percentage": "45.2%",
      "devPercentage": "8.5%",
      "volume1h": "$12.34K",
      "buysVsSells": "+24 net buys",
      "priceChange": "+2.3%"
    },
    "watchList": ["Monitor liquidity changes", "Watch for large holder sells"],
    "missingData": [],
    "rawMetrics": { ... }
  }
}
```

## Example Token Addresses for Testing

- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **BONK**: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
- **SAMO**: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
- **Any Solana mint address**: Will generate random mock data

## Mock Data Implementation

Since this is an MVP with no API keys required, the app uses:

1. **Pre-defined mock data** for known tokens (USDC, BONK, SAMO)
2. **Randomly generated data** for unknown tokens
3. **Mock AI analysis** with realistic scoring logic

To switch to real APIs:

1. Add your API keys to `.env.local`
2. Uncomment the real implementations in:
   - `lib/tokenProviders/index.ts` (Birdeye/Solscan)
   - `lib/llm/index.ts` (OpenAI)

## Features Implemented

### ✅ Completed
- Next.js 14 App Router with TypeScript
- TailwindCSS for styling
- Mock token data provider with fallback logic
- AI analysis engine with comprehensive scoring
- API route with rate limiting (10/min) and caching (60s)
- Fully responsive UI with dark/light mode support
- All required display components (flags, scores, metrics)

### 🔄 Ready for Real Integration
- Birdeye API integration stubs
- Solscan fallback stubs
- OpenAI GPT-4 integration stubs
- Environment variable configuration

## Security Features

- **Rate Limiting**: 10 requests per minute per IP address
- **Input Validation**: Basic Solana address format validation
- **Error Handling**: Comprehensive error responses
- **No Client Exposure**: API keys never exposed to client
- **CORS**: Built-in Next.js CORS protection

## Performance

- **Client-side Rendering**: Fast, interactive UI
- **Server-side Analysis**: AI processing on server only
- **Caching**: 60-second cache to reduce duplicate calls
- **Lazy Loading**: Components load as needed

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Token Provider**:
   - Add to `lib/tokenProviders/index.ts`
   - Follow existing interface pattern
   - Add to provider fallback chain

2. **New Analysis Criteria**:
   - Modify `lib/llm/index.ts` analyzeWithAI function
   - Add new flag categories or scoring logic
   - Update types in `lib/types.ts`

3. **UI Improvements**:
   - Modify `app/page.tsx`
   - Add new components as needed
   - Update Tailwind classes

## License

This project is for educational purposes only. Not financial advice. Always do your own research.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions, please open a GitHub issue.