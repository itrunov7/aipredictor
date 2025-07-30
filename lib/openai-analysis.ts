import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface FinancialDataInput {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
  sources: Array<{
    type: string;
    title: string;
    impact: string;
    confidence: number;
    source: string;
    date: string;
  }>;
  technicalIndicators?: {
    rsi?: number;
    priceTargets?: any;
    upgradesDowngrades?: any[];
  };
  fundamentals?: {
    revenue?: number;
    netIncome?: number;
    eps?: number;
    peRatio?: number;
    marketCap?: number;
    enterpriseValue?: number;
    revenueGrowth?: number;
    grossMargin?: number;
    operatingMargin?: number;
    netMargin?: number;
    debtToEquity?: number;
    currentRatio?: number;
    quickRatio?: number;
    returnOnEquity?: number;
    returnOnAssets?: number;
    sector?: string;
    industry?: string;
    employees?: number;
    description?: string;
    sectorAvgPE?: number;
    sectorAvgGrossMargin?: number;
    sectorAvgOperatingMargin?: number;
    sectorAvgNetMargin?: number;
  };
  sentiment?: {
    positiveSources: number;
    negativeSources: number;
    neutralSources: number;
  };
}

export async function generateAIAnalysis(data: FinancialDataInput): Promise<string> {
  try {
    // Prepare the financial data context for AI analysis
    const dataContext = `
FINANCIAL ANALYSIS REQUEST

Company: ${data.name} (${data.symbol})
Current Price: $${data.currentPrice}
Price Change: ${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%
Volume: ${(data.volume / 1e6).toFixed(1)}M (Avg: ${(data.avgVolume / 1e6).toFixed(1)}M)
Market Cap: ${data.marketCap ? `$${(data.marketCap / 1e9).toFixed(1)}B` : 'N/A'}

DATA SOURCES ANALYZED (${data.sources.length} total):
${data.sources.map((source, index) => `
${index + 1}. ${source.source} (${source.type})
   Title: ${source.title}
   Impact: ${source.impact}
   Confidence: ${source.confidence}%
   Date: ${source.date}
`).join('')}

TECHNICAL INDICATORS:
- RSI: ${data.technicalIndicators?.rsi || 'N/A'}
- Price Targets: ${data.technicalIndicators?.priceTargets ? 'Available' : 'Limited data'}
- Recent Ratings: ${data.technicalIndicators?.upgradesDowngrades?.length || 0} recent changes

FUNDAMENTAL METRICS:
- Revenue: ${data.fundamentals?.revenue ? `$${(data.fundamentals.revenue / 1e9).toFixed(1)}B` : 'N/A'}
- Net Income: ${data.fundamentals?.netIncome ? `$${(data.fundamentals.netIncome / 1e6).toFixed(0)}M` : 'N/A'}
- EPS: ${data.fundamentals?.eps ? `$${data.fundamentals.eps.toFixed(2)}` : 'N/A'}
- P/E Ratio: ${data.fundamentals?.peRatio ? data.fundamentals.peRatio.toFixed(1) : 'N/A'}
- Revenue Growth: ${data.fundamentals?.revenueGrowth ? `${(data.fundamentals.revenueGrowth * 100).toFixed(1)}%` : 'N/A'}
- Gross Margin: ${data.fundamentals?.grossMargin ? `${(data.fundamentals.grossMargin * 100).toFixed(1)}%` : 'N/A'}
- Operating Margin: ${data.fundamentals?.operatingMargin ? `${(data.fundamentals.operatingMargin * 100).toFixed(1)}%` : 'N/A'}
- Net Margin: ${data.fundamentals?.netMargin ? `${(data.fundamentals.netMargin * 100).toFixed(1)}%` : 'N/A'}
- Return on Equity: ${data.fundamentals?.returnOnEquity ? `${(data.fundamentals.returnOnEquity * 100).toFixed(1)}%` : 'N/A'}
- Return on Assets: ${data.fundamentals?.returnOnAssets ? `${(data.fundamentals.returnOnAssets * 100).toFixed(1)}%` : 'N/A'}
- Debt to Equity: ${data.fundamentals?.debtToEquity ? data.fundamentals.debtToEquity.toFixed(2) : 'N/A'}
- Current Ratio: ${data.fundamentals?.currentRatio ? data.fundamentals.currentRatio.toFixed(2) : 'N/A'}

COMPANY PROFILE:
- Sector: ${data.fundamentals?.sector || 'N/A'}
- Industry: ${data.fundamentals?.industry || 'N/A'}
- Employees: ${data.fundamentals?.employees ? data.fundamentals.employees.toLocaleString() : 'N/A'}

SECTOR BENCHMARKS (for comparison):
- Sector Avg P/E: ${data.fundamentals?.sectorAvgPE || 'N/A'}
- Sector Avg Gross Margin: ${data.fundamentals?.sectorAvgGrossMargin ? `${(data.fundamentals.sectorAvgGrossMargin * 100).toFixed(1)}%` : 'N/A'}
- Sector Avg Operating Margin: ${data.fundamentals?.sectorAvgOperatingMargin ? `${(data.fundamentals.sectorAvgOperatingMargin * 100).toFixed(1)}%` : 'N/A'}
- Sector Avg Net Margin: ${data.fundamentals?.sectorAvgNetMargin ? `${(data.fundamentals.sectorAvgNetMargin * 100).toFixed(1)}%` : 'N/A'}

SENTIMENT BREAKDOWN:
- Positive Sources: ${data.sentiment?.positiveSources || 0}
- Negative Sources: ${data.sentiment?.negativeSources || 0}
- Neutral Sources: ${data.sentiment?.neutralSources || 0}
`;

    const systemPrompt = `You are a senior equity research analyst with 15+ years of experience at top-tier investment banks. You have expertise in:
- Technical analysis and chart patterns
- Fundamental analysis and financial modeling
- Market sentiment and institutional flow analysis
- Risk assessment and portfolio management
- Macroeconomic factors affecting equity markets

    Your task is to provide comprehensive financial analysis AND specific price predictions based on the provided data. You must provide:

    1. SPECIFIC PRICE PREDICTIONS:
       - Next Day Target Price (24 hours)
       - Next Week Target Price (7 days) 
       - Next Month Target Price (30 days)
       - Each with confidence percentage (0-100%)

    2. DETAILED REASONING organized by:
       - TECHNICAL SIGNALS: Chart patterns, volume, momentum indicators
       - FUNDAMENTAL DRIVERS: Valuation metrics, financial health, earnings quality
       - MARKET CATALYSTS: News events, analyst actions, sector trends
       - RISK FACTORS: Key downside risks and volatility sources

    3. DATA TRANSPARENCY: Reference specific data points from the provided sources

    Writing Style:
    - Clear, confident predictions with specific price targets
    - Professional yet accessible (Bloomberg/CNBC analyst style)
    - Use bullet points for key factors
    - Quantify everything with real numbers from the data
    - Structure as: Predictions → Reasoning → Risk Assessment

    CRITICAL: You must provide specific dollar price targets for each timeframe based on the data analysis.`;

        const userPrompt = `Based on the comprehensive financial data below, provide specific price predictions and detailed analysis:

    ${dataContext}

    REQUIRED OUTPUT FORMAT:
    1. PRICE PREDICTIONS (with confidence %)
    2. TECHNICAL ANALYSIS (key chart signals)
    3. FUNDAMENTAL DRIVERS (valuation & financial factors)
    4. MARKET CATALYSTS (news, events, sentiment)
    5. RISK ASSESSMENT (key risks to watch)

    Make predictions based on the actual data provided, not generic analysis.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent, professional analysis
    });

    const analysis = response.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('No analysis generated from OpenAI');
    }

    return analysis;

  } catch (error) {
    console.error('Error generating AI analysis:', error);
    
    // Fallback to enhanced template if OpenAI fails
    return generateFallbackAnalysis(data);
  }
}

function generateFallbackAnalysis(data: FinancialDataInput): string {
  const trend = data.changePercent > 0 ? 'positive' : 'negative';
  const volumeRatio = data.volume / data.avgVolume;
  const volumeDesc = volumeRatio > 1.2 ? 'elevated' : volumeRatio < 0.8 ? 'subdued' : 'normal';
  
  return `Professional Analysis: ${data.name} (${data.symbol}) presents a ${trend} technical setup with ${volumeDesc} volume dynamics. Current price action of ${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}% reflects ${Math.abs(data.changePercent) > 2 ? 'significant' : 'moderate'} market sentiment. Our ${data.sources.length}-source analysis reveals ${data.sentiment?.positiveSources || 0} positive and ${data.sentiment?.negativeSources || 0} negative signals, suggesting ${data.sentiment && data.sentiment.positiveSources > data.sentiment.negativeSources ? 'constructive' : 'cautious'} positioning. Volume trends at ${(data.volume / 1e6).toFixed(1)}M shares indicate ${volumeRatio > 1.2 ? 'heightened institutional interest' : 'standard participation levels'}. Risk assessment suggests ${Math.abs(data.changePercent) > 3 ? 'elevated' : 'manageable'} volatility profile. Investment outlook requires monitoring of technical levels and fundamental catalysts for directional confirmation.`;
} 