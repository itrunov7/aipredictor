import { Router, Request, Response } from 'express';
import { enhancedFmpApi } from '../services/enhancedFmpApi';
import { cacheService } from '../services/cacheService';
import { dailyScheduler } from '../services/dailyScheduler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/stocks/quote/:symbol
 * Get real-time quote for a single stock
 */
router.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol parameter is required'
      });
    }

    logger.info(`Fetching quote for symbol: ${symbol}`);
    const quote = await enhancedFmpApi.getStockQuote(symbol.toUpperCase());

    res.json({
      success: true,
      data: quote
    });

  } catch (error: any) {
    logger.error(`Error fetching quote for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock quote',
      details: error.message
    });
  }
});

/**
 * GET /api/stocks/quotes
 * Get quotes for multiple symbols
 */
router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols || typeof symbols !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Symbols query parameter is required (comma-separated)'
      });
    }

    const symbolList = symbols.toUpperCase().split(',').map(s => s.trim());
    logger.info(`Fetching quotes for symbols: ${symbolList.join(', ')}`);

    // Fetch quotes in parallel
    const promises = symbolList.map(symbol => 
      enhancedFmpApi.getStockQuote(symbol).catch(error => ({
        symbol,
        error: error.message
      }))
    );

    const results = await Promise.allSettled(promises);
    const quotes = results
      .filter(result => result.status === 'fulfilled' && !(result.value as any).error)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    res.json({
      success: true,
      data: quotes,
      count: quotes.length
    });

  } catch (error: any) {
    logger.error('Error fetching multiple quotes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock quotes',
      details: error.message
    });
  }
});

/**
 * GET /api/stocks/news
 * Get recent stock market news
 */
router.get('/news', async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;
    
    logger.info(`Fetching general news with limit: ${limit}`);
    const news = await enhancedFmpApi.getGeneralNews(parseInt(limit as string));

    res.json({
      success: true,
      data: news,
      count: news.length
    });

  } catch (error: any) {
    logger.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      details: error.message
    });
  }
});

/**
 * GET /api/stocks/:symbol/news
 * Get news for a specific stock
 */
router.get('/:symbol/news', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { limit = '10' } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol parameter is required'
      });
    }

    logger.info(`Fetching news for symbol: ${symbol}`);
    const news = await enhancedFmpApi.getStockNews(symbol.toUpperCase(), parseInt(limit as string));

    res.json({
      success: true,
      data: news,
      count: news.length
    });

  } catch (error: any) {
    logger.error(`Error fetching news for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock news',
      details: error.message
    });
  }
});

/**
 * GET /api/stocks/featured
 * Get featured stocks for homepage
 * CACHED: Featured stocks are cached for 24 hours to minimize API calls
 */
router.get('/featured', async (req: Request, res: Response) => {
  const cacheKey = 'featured_stocks_daily';
  
  // Check cache first - only fetch once per day
  const cachedData = cacheService.get<any>(cacheKey);
  if (cachedData && cachedData.quotes && Array.isArray(cachedData.quotes) && cachedData.quotes.length > 0) {
    logger.info(`✅ Using cached featured stocks (avoiding API calls)`);
    return res.json({
      success: true,
      data: cachedData.quotes,
      count: cachedData.quotes.length,
      cached: true,
      lastUpdated: cachedData.lastUpdated || new Date().toISOString()
    });
  }

  try {
    const featuredSymbols = dailyScheduler.getCurrentFeaturedCompanies();
    
    logger.info(`🔄 Fetching fresh featured stocks from API: ${featuredSymbols.join(', ')} (will cache for 24h)`);

    // Fetch quotes for all featured stocks in parallel
    const quotePromises = featuredSymbols.map(async (symbol: string) => {
      try {
        return await enhancedFmpApi.getStockQuote(symbol);
      } catch (error) {
        logger.error(`Failed to fetch quote for ${symbol}:`, error);
        return null;
      }
    });

    const quoteResults = await Promise.allSettled(quotePromises);
    const validQuotes = quoteResults
      .filter((result: any) => result.status === 'fulfilled' && result.value !== null)
      .map((result: any) => result.value);

    // Cache the result for 24 hours
    const cacheData = {
      quotes: validQuotes,
      lastUpdated: new Date().toISOString()
    };
    cacheService.set(cacheKey, cacheData);
    logger.info(`💾 Cached featured stocks for 24 hours`);

    res.json({
      success: true,
      data: validQuotes,
      count: validQuotes.length,
      cached: false,
      lastUpdated: cacheData.lastUpdated
    });

  } catch (error: any) {
    logger.error('Error fetching featured stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured stocks',
      details: error.message
    });
  }
});

export { router as stockRoutes }; 