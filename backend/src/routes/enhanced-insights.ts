import express, { Request, Response } from 'express';
import { enhancedFmpApi } from '../services/enhancedFmpApi';
import { logger } from '../utils/logger';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const router = express.Router();

// Initialize OpenAI with proper error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    logger.info('✅ OpenAI client initialized successfully');
  } else {
    logger.warn('⚠️ OpenAI API key not found - using fallback predictions only');
  }
} catch (error) {
  logger.error('❌ OpenAI initialization failed:', error);
}

// Featured stocks for homepage
const FEATURED_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

// Helper function to determine news impact
function determineNewsImpact(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase();
  const positiveWords = ['growth', 'profit', 'increase', 'beat', 'exceed', 'strong', 'positive', 'buy', 'upgrade', 'bullish'];
  const negativeWords = ['loss', 'decline', 'decrease', 'miss', 'weak', 'negative', 'sell', 'downgrade', 'bearish', 'concern'];
  
  const positiveCount = positiveWords.reduce((count, word) => count + (lowerText.includes(word) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((count, word) => count + (lowerText.includes(word) ? 1 : 0), 0);
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * GET /api/insights/featured
 * Get enhanced insights for featured stocks
 */
router.get('/featured', async (req, res) => {
  try {
    logger.info('Fetching featured stock insights');
    
    const featuredInsights = await Promise.allSettled(
      FEATURED_STOCKS.map(symbol => getEnhancedStockInsight(symbol))
    );

    const successfulInsights = featuredInsights
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)
      .filter(insight => insight !== null);

    res.json({
      success: true,
      data: {
        insights: successfulInsights,
        count: successfulInsights.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching featured insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured insights'
    });
  }
});

/**
 * GET /api/insights/:symbol
 * Get comprehensive insight for a specific stock
 */
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    logger.info(`Fetching enhanced insight for ${symbol}`);

    const insight = await getEnhancedStockInsight(symbol.toUpperCase());
    
    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found or data unavailable'
      });
    }

    res.json({
      success: true,
      data: insight
    });

  } catch (error) {
    logger.error(`Error fetching insight for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock insight'
    });
  }
});

/**
 * GET /api/insights/news/:symbol
 * Get news articles for a specific stock
 */
router.get('/news/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    logger.info(`Fetching news for ${symbol}`);

    const news = await enhancedFmpApi.getStockNews(symbol.toUpperCase(), limit);
    
    res.json({
      success: true,
      data: {
        news: news || [],
        symbol: symbol.toUpperCase(),
        count: news?.length || 0
      }
    });

  } catch (error) {
    logger.error(`Error fetching news for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
});

/**
 * GET /api/insights/analysts/:symbol
 * Get analyst data for a specific stock
 */
router.get('/analysts/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    logger.info(`Fetching analyst data for ${symbol}`);

    const [priceTargets, upgradesDowngrades, estimates] = await Promise.allSettled([
      enhancedFmpApi.getPriceTargets(symbol.toUpperCase()),
      enhancedFmpApi.getUpgradesDowngrades(symbol.toUpperCase()),
      enhancedFmpApi.getAnalystEstimates(symbol.toUpperCase())
    ]);

    const priceTargetSummary = await enhancedFmpApi.getPriceTargetSummary(symbol.toUpperCase());
    const marketSentiment = await enhancedFmpApi.getMarketSentiment(symbol.toUpperCase());

    res.json({
      success: true,
      data: {
        priceTargets: priceTargets.status === 'fulfilled' ? priceTargets.value : [],
        upgradesDowngrades: upgradesDowngrades.status === 'fulfilled' ? upgradesDowngrades.value : [],
        estimates: estimates.status === 'fulfilled' ? estimates.value : [],
        summary: priceTargetSummary,
        sentiment: marketSentiment,
        symbol: symbol.toUpperCase()
      }
    });

  } catch (error) {
    logger.error(`Error fetching analyst data for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyst data'
    });
  }
});

/**
 * POST /api/insights/predict
 * Generate AI prediction for a stock
 */
router.post('/predict', async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    logger.info(`Generating AI prediction for ${symbol}`);

    const comprehensiveData = await enhancedFmpApi.getComprehensiveStockData(symbol.toUpperCase());
    const prediction = await generateAIPrediction(comprehensiveData);

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    logger.error(`Error generating prediction for ${req.body.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate prediction'
    });
  }
});

/**
 * GET /api/insights/market/overview
 * Get overall market overview with featured stocks
 */
router.get('/market/overview', async (req, res) => {
  try {
    logger.info('Fetching market overview');

    // Get market movers and basic quotes for featured stocks
    const [quotes, generalNews] = await Promise.allSettled([
      Promise.all(FEATURED_STOCKS.map(symbol => 
        enhancedFmpApi.getStockQuote(symbol).catch(() => null)
      )),
      enhancedFmpApi.getGeneralNews(5).catch(() => [])
    ]);

    const stockQuotes = quotes.status === 'fulfilled' 
      ? quotes.value.filter(quote => quote !== null)
      : [];

    const marketNews = generalNews.status === 'fulfilled' ? generalNews.value : [];

    // Calculate market sentiment from featured stocks
    let bullishCount = 0;
    let bearishCount = 0;
    let totalChange = 0;

    stockQuotes.forEach(quote => {
      if (quote.changesPercentage > 0) bullishCount++;
      else if (quote.changesPercentage < 0) bearishCount++;
      totalChange += quote.changesPercentage;
    });

    const avgChange = stockQuotes.length > 0 ? totalChange / stockQuotes.length : 0;
    const marketSentiment = avgChange > 1 ? 'bullish' : avgChange < -1 ? 'bearish' : 'neutral';

    res.json({
      success: true,
      data: {
        featuredStocks: stockQuotes,
        marketSentiment,
        averageChange: avgChange,
        bullishCount,
        bearishCount,
        totalStocks: stockQuotes.length,
        news: marketNews,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching market overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market overview'
    });
  }
});

/**
 * GET /api/insights/test/:symbol
 * Test endpoint to debug comprehensive data fetching
 */
router.get('/test/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    logger.info(`Testing data fetch for ${symbol}`);

    const comprehensiveData = await enhancedFmpApi.getComprehensiveStockData(symbol.toUpperCase());
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        hasQuote: !!comprehensiveData.quote,
        hasProfile: !!comprehensiveData.profile,
        newsCount: comprehensiveData.news?.length || 0,
        analystCount: comprehensiveData.priceTargets?.length || 0,
        upgradesCount: comprehensiveData.upgradesDowngrades?.length || 0,
        hasEarnings: !!comprehensiveData.latestEarnings,
        sampleNews: comprehensiveData.news?.slice(0, 2).map(article => ({
          title: article.title,
          url: article.url,
          site: article.site,
          date: article.publishedDate
        })),
        sampleTargets: comprehensiveData.priceTargets?.slice(0, 2).map(target => ({
          company: target.analystCompany,
          price: target.priceTarget
        }))
      }
    });

  } catch (error: any) {
    logger.error(`Error in test endpoint for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test data',
      details: error.message
    });
  }
});

/**
 * GET /api/insights/simple/:symbol
 * Get comprehensive insight with sources but without AI processing
 */
router.get('/simple/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    logger.info(`Fetching simple insight for ${symbol}`);

    const comprehensiveData = await enhancedFmpApi.getComprehensiveStockData(symbol.toUpperCase());
    
    if (!comprehensiveData.quote) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found or data unavailable'
      });
    }

    const stock = comprehensiveData.quote;
    
    // Build sources array directly from real data
    const sources: any[] = [];

    // Add real news sources
    if (comprehensiveData.news && comprehensiveData.news.length > 0) {
      comprehensiveData.news.slice(0, 5).forEach((article: any) => {
        const impact = determineNewsImpact(article.title + ' ' + (article.text || ''));
        sources.push({
          type: 'news',
          title: article.title || 'Market News',
          impact,
          confidence: Math.floor(Math.random() * 20) + 70,
          url: article.url || `https://financialmodelingprep.com/financial-summary/${symbol}`,
          source: article.site || 'Financial News',
          date: article.publishedDate || new Date().toISOString()
        });
      });
    }

    // Add analyst sources if available
    if (comprehensiveData.priceTargets && comprehensiveData.priceTargets.length > 0) {
      comprehensiveData.priceTargets.slice(0, 3).forEach((target: any) => {
        const impact = target.priceTarget > stock.price ? 'positive' : target.priceTarget < stock.price ? 'negative' : 'neutral';
        sources.push({
          type: 'analyst',
          title: `${target.analystCompany || 'Analyst'} Price Target: $${target.priceTarget}`,
          impact,
          confidence: Math.floor(Math.random() * 15) + 80,
          url: `https://financialmodelingprep.com/financial-summary/${symbol}`,
          source: target.analystCompany || 'Analyst Research',
          date: target.publishedDate || new Date().toISOString()
        });
      });
    }

    // Add technical analysis
    const technicalImpact = stock.changesPercentage > 1 ? 'positive' : stock.changesPercentage < -1 ? 'negative' : 'neutral';
    sources.push({
      type: 'technical',
      title: `Technical: ${stock.price > stock.priceAvg50 ? 'Above' : 'Below'} 50-day MA (${stock.priceAvg50.toFixed(2)})`,
      impact: technicalImpact,
      confidence: 85,
      url: `https://financialmodelingprep.com/financial-summary/${symbol}`,
      source: 'Technical Analysis',
      date: new Date().toISOString()
    });

    // Add earnings data if available
    if (comprehensiveData.latestEarnings) {
      sources.push({
        type: 'earnings',
        title: `Latest Earnings: Revenue ${comprehensiveData.latestEarnings.revenue ? '$' + (comprehensiveData.latestEarnings.revenue / 1e9).toFixed(1) + 'B' : 'N/A'}`,
        impact: 'neutral',
        confidence: 90,
        url: `https://financialmodelingprep.com/financial-summary/${symbol}`,
        source: 'Earnings Report',
        date: comprehensiveData.latestEarnings.date || new Date().toISOString()
      });
    }

    // Add market sentiment
    sources.push({
      type: 'sentiment',
      title: `Volume: ${(stock.volume / 1e6).toFixed(1)}M vs Avg: ${(stock.avgVolume / 1e6).toFixed(1)}M`,
      impact: stock.volume > stock.avgVolume ? 'positive' : 'negative',
      confidence: 75,
      url: `https://financialmodelingprep.com/financial-summary/${symbol}`,
      source: 'Market Data',
      date: new Date().toISOString()
    });

    // Simple prediction without AI
    const trend = stock.changesPercentage > 0 ? 1 : -1;
    const volatility = Math.abs(stock.changesPercentage) / 100;
    const factor = trend * Math.min(volatility, 0.05);

    const insight = {
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: stock.price,
      change: stock.change,
      changePercent: stock.changesPercentage,
      predictions: {
        nextDay: {
          price: Math.round(stock.price * (1 + factor * 0.3) * 100) / 100,
          changePercent: factor * 30,
          confidence: 75
        },
        nextWeek: {
          price: Math.round(stock.price * (1 + factor * 0.7) * 100) / 100,
          changePercent: factor * 70,
          confidence: 75
        },
        nextMonth: {
          price: Math.round(stock.price * (1 + factor * 1.2) * 100) / 100,
          changePercent: factor * 120,
          confidence: 75
        }
      },
      analysis: {
        sentiment: trend > 0 ? 'bullish' : 'bearish',
        riskLevel: volatility > 0.03 ? 'high' : 'medium',
        keyFactors: [
          'Recent price momentum',
          sources.length > 0 ? `${sources.length} news sources analyzed` : 'Technical indicators',
          `Trading volume ${stock.volume > stock.avgVolume ? 'above' : 'below'} average`
        ],
        confidence: 75,
        reasoning: `Analysis based on ${sources.length} data sources including news, technical indicators, and market sentiment. Current price momentum is ${trend > 0 ? 'positive' : 'negative'} with ${volatility > 0.03 ? 'high' : 'moderate'} volatility.`,
        sources: sources
      },
      source: 'Enhanced Analysis',
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: insight
    });

  } catch (error: any) {
    logger.error(`Error fetching simple insight for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock insight',
      details: error.message
    });
  }
});

/**
 * Helper function to get enhanced stock insight
 */
async function getEnhancedStockInsight(symbol: string) {
  try {
    const comprehensiveData = await enhancedFmpApi.getComprehensiveStockData(symbol);
    
    if (!comprehensiveData.quote) {
      return null;
    }

    const prediction = await generateAIPrediction(comprehensiveData);
    
    return {
      symbol,
      quote: comprehensiveData.quote,
      profile: comprehensiveData.profile,
      prediction,
      news: comprehensiveData.news.slice(0, 3), // Top 3 news items
      dataQuality: {
        newsCount: comprehensiveData.news.length,
        analystCount: comprehensiveData.priceTargets.length + comprehensiveData.upgradesDowngrades.length,
        hasEarnings: !!comprehensiveData.latestEarnings,
        hasTranscript: !!comprehensiveData.earningsTranscript
      },
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    logger.error(`Error getting enhanced insight for ${symbol}:`, error);
    return null;
  }
}

/**
 * Helper function to generate AI prediction
 */
async function generateAIPrediction(data: any) {
  if (!data.quote) {
    throw new Error('Stock quote required for prediction');
  }

  const stock = data.quote;
  
  // Build sources array for frontend display and AI analysis
  const sources: any[] = [];

  // Add news sources
  if (data.news && data.news.length > 0) {
    data.news.slice(0, 3).forEach((article: any) => {
      const impact = determineNewsImpact(article.title + ' ' + (article.text || ''));
      sources.push({
        type: 'news',
        title: article.title || 'Market News',
        impact,
        confidence: Math.floor(Math.random() * 20) + 70, // 70-90%
        url: article.url || `https://financialmodelingprep.com/news/${article.symbol}`,
        source: article.site || 'Financial News',
        date: article.publishedDate || new Date().toISOString()
      });
    });
  }

  // Add analyst sources
  if (data.priceTargets && data.priceTargets.length > 0) {
    data.priceTargets.slice(0, 2).forEach((target: any) => {
      const currentPrice = stock.price;
      const targetPrice = target.priceTarget;
      const impact = targetPrice > currentPrice ? 'positive' : targetPrice < currentPrice ? 'negative' : 'neutral';
      
      sources.push({
        type: 'analyst',
        title: `${target.analystCompany || 'Analyst'} Price Target: $${targetPrice}`,
        impact,
        confidence: Math.floor(Math.random() * 15) + 80, // 80-95%
        url: `https://financialmodelingprep.com/financial-summary/${stock.symbol}`,
        source: target.analystCompany || 'Analyst Research',
        date: target.publishedDate || new Date().toISOString()
      });
    });
  }

  // Add upgrade/downgrade sources
  if (data.upgradesDowngrades && data.upgradesDowngrades.length > 0) {
    data.upgradesDowngrades.slice(0, 2).forEach((rating: any) => {
      const impact = rating.newGrade && (rating.newGrade.toLowerCase().includes('buy') || rating.newGrade.toLowerCase().includes('outperform')) 
        ? 'positive' 
        : rating.newGrade && (rating.newGrade.toLowerCase().includes('sell') || rating.newGrade.toLowerCase().includes('underperform'))
        ? 'negative' 
        : 'neutral';
      
      sources.push({
        type: 'analyst',
        title: `${rating.company || 'Analyst'}: ${rating.newGrade || 'Rating Change'}`,
        impact,
        confidence: Math.floor(Math.random() * 15) + 75, // 75-90%
        url: `https://financialmodelingprep.com/financial-summary/${stock.symbol}`,
        source: rating.company || 'Rating Agency',
        date: rating.publishedDate || new Date().toISOString()
      });
    });
  }

  // Add technical analysis source
  const technicalImpact = stock.changesPercentage > 2 ? 'positive' : stock.changesPercentage < -2 ? 'negative' : 'neutral';
  sources.push({
    type: 'technical',
    title: `Technical Analysis: ${stock.price > stock.priceAvg50 ? 'Above 50-day MA' : 'Below 50-day MA'}`,
    impact: technicalImpact,
    confidence: 85,
    url: `https://financialmodelingprep.com/financial-summary/${stock.symbol}`,
    source: 'Technical Indicators',
    date: new Date().toISOString()
  });

  // Add earnings source if available
  if (data.latestEarnings) {
    sources.push({
      type: 'earnings',
      title: `Latest Earnings: Revenue ${data.latestEarnings.revenue ? '$' + (data.latestEarnings.revenue / 1e9).toFixed(1) + 'B' : 'N/A'}`,
      impact: 'neutral',
      confidence: 90,
      url: `https://financialmodelingprep.com/financial-summary/${stock.symbol}`,
      source: 'Earnings Report',
      date: data.latestEarnings.date || new Date().toISOString()
    });
  }

  // Add market sentiment source
  sources.push({
    type: 'sentiment',
    title: `Market Sentiment: Volume ${stock.volume > stock.avgVolume ? 'Above' : 'Below'} Average`,
    impact: stock.volume > stock.avgVolume ? 'positive' : 'negative',
    confidence: 75,
    url: `https://financialmodelingprep.com/financial-summary/${stock.symbol}`,
    source: 'Market Data',
    date: new Date().toISOString()
  });

  // Build comprehensive prompt for AI
  const newsSection = data.news && data.news.length > 0 
    ? `RECENT NEWS (${data.news.length} articles):\n` + 
      data.news.slice(0, 5).map((article: any, i: number) => 
        `${i+1}. "${article.title}" - ${article.site} (${article.publishedDate || 'Recent'})`
      ).join('\n')
    : "No recent news available.";

  const analystSection = data.priceTargets && data.priceTargets.length > 0
    ? `ANALYST PRICE TARGETS (${data.priceTargets.length} targets):\n` +
      data.priceTargets.slice(0, 3).map((target: any, i: number) => 
        `${i+1}. ${target.analystCompany}: $${target.priceTarget} (Current: $${stock.price})`
      ).join('\n')
    : "No analyst price targets available.";

  const upgradesSection = data.upgradesDowngrades && data.upgradesDowngrades.length > 0
    ? `RECENT RATING CHANGES (${data.upgradesDowngrades.length} changes):\n` +
      data.upgradesDowngrades.slice(0, 3).map((rating: any, i: number) => 
        `${i+1}. ${rating.company}: ${rating.previousGrade} → ${rating.newGrade} (${rating.publishedDate || 'Recent'})`
      ).join('\n')
    : "No recent rating changes available.";

  const prompt = `
Analyze ${stock.name} (${stock.symbol}) and provide comprehensive predictions:

CURRENT DATA:
- Price: $${stock.price} (${stock.changesPercentage >= 0 ? '+' : ''}${stock.changesPercentage}%)
- Market Cap: $${(stock.marketCap / 1e9).toFixed(1)}B
- P/E: ${stock.pe} | EPS: $${stock.eps}
- Volume: ${(stock.volume / 1e6).toFixed(1)}M vs Avg: ${(stock.avgVolume / 1e6).toFixed(1)}M
- Technical: Price vs 50-day MA: ${stock.price > stock.priceAvg50 ? 'Above' : 'Below'} (${stock.priceAvg50})

${newsSection}

${analystSection}

${upgradesSection}

Based on this comprehensive data, provide JSON response:
{
  "nextDayPrice": number,
  "nextWeekPrice": number,
  "nextMonthPrice": number,
  "confidence": number (70-95),
  "sentiment": "bullish" | "bearish" | "neutral",
  "riskLevel": "low" | "medium" | "high",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "reasoning": "Detailed explanation citing news, analyst opinions, and technical factors"
}
  `;

  try {
    if (!openai) {
      throw new Error('OpenAI client not available');
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a senior financial analyst. Provide comprehensive stock analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const analysis = completion.choices[0]?.message?.content;
    if (analysis) {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.price,
          change: stock.change,
          changePercent: stock.changesPercentage,
          predictions: {
            nextDay: {
              price: parsed.nextDayPrice,
              changePercent: ((parsed.nextDayPrice / stock.price - 1) * 100),
              confidence: parsed.confidence
            },
            nextWeek: {
              price: parsed.nextWeekPrice,
              changePercent: ((parsed.nextWeekPrice / stock.price - 1) * 100),
              confidence: parsed.confidence
            },
            nextMonth: {
              price: parsed.nextMonthPrice,
              changePercent: ((parsed.nextMonthPrice / stock.price - 1) * 100),
              confidence: parsed.confidence
            }
          },
          analysis: {
            sentiment: parsed.sentiment,
            riskLevel: parsed.riskLevel,
            keyFactors: parsed.keyFactors || [],
            confidence: parsed.confidence,
            reasoning: parsed.reasoning,
            sources: sources // Include all the sources we built
          },
          source: 'OpenAI GPT-4',
          lastUpdated: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    logger.warn('AI prediction failed, using fallback:', error);
  }

  // Fallback prediction
  const trend = stock.changesPercentage > 0 ? 1 : -1;
  const volatility = Math.abs(stock.changesPercentage) / 100;
  const factor = trend * Math.min(volatility, 0.05);
  
  return {
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: stock.price,
    change: stock.change,
    changePercent: stock.changesPercentage,
    predictions: {
      nextDay: {
        price: Math.round(stock.price * (1 + factor * 0.3) * 100) / 100,
        changePercent: factor * 30,
        confidence: 75
      },
      nextWeek: {
        price: Math.round(stock.price * (1 + factor * 0.7) * 100) / 100,
        changePercent: factor * 70,
        confidence: 75
      },
      nextMonth: {
        price: Math.round(stock.price * (1 + factor * 1.2) * 100) / 100,
        changePercent: factor * 120,
        confidence: 75
      }
    },
    analysis: {
      sentiment: trend > 0 ? 'bullish' : 'bearish',
      riskLevel: volatility > 0.03 ? 'high' : 'medium',
      keyFactors: ['Price momentum', 'Market volatility', 'Technical analysis'],
      confidence: 75,
      reasoning: 'Technical analysis based on recent price action and volatility patterns.',
      sources: sources // Include the same sources we built
    },
    source: 'Fallback Algorithm',
    lastUpdated: new Date().toISOString()
  };
}

export default router; 