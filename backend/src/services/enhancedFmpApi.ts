import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';

/**
 * Enhanced Financial Modeling Prep API Service
 * Comprehensive integration of all FMP endpoints including news, analyst data, and reports
 * Based on: https://site.financialmodelingprep.com/developer/docs/stable
 */

interface FMPApiConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

// Enhanced interfaces for comprehensive data
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  eps: number;
  pe: number;
  sharesOutstanding: number;
  timestamp: number;
}

export interface NewsArticle {
  title: string;
  url: string;
  publishedDate: string;
  site: string;
  text: string;
  symbol?: string;
  tickers?: string[];
}

export interface AnalystEstimate {
  symbol: string;
  date: string;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  estimatedRevenueAvg: number;
  estimatedEpsLow: number;
  estimatedEpsHigh: number;
  estimatedEpsAvg: number;
  numberAnalysts: number;
}

export interface PriceTarget {
  symbol: string;
  publishedDate: string;
  newsURL: string;
  newsTitle: string;
  analystName: string;
  priceTarget: number;
  adjPriceTarget: number;
  priceWhenPosted: number;
  newsPublisher: string;
  newsBaseURL: string;
  analystCompany: string;
}

export interface UpgradeDowngrade {
  symbol: string;
  publishedDate: string;
  newsURL: string;
  newsTitle: string;
  newsPublisher: string;
  newGrade: string;
  previousGrade: string;
  gradingCompany: string;
  action: string;
  priceWhenPosted: number;
}

export interface EarningsTranscript {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
  content: string;
}

export interface FinancialStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  // Income Statement fields
  revenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
  eps?: number;
  // Balance Sheet fields
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  // Cash Flow fields
  operatingCashFlow?: number;
  freeCashFlow?: number;
  capitalExpenditure?: number;
}

export interface ComprehensiveStockData {
  quote: StockQuote | null;
  profile: any | null;
  news: NewsArticle[];
  analystEstimates: AnalystEstimate[];
  priceTargets: PriceTarget[];
  upgradesDowngrades: UpgradeDowngrade[];
  latestEarnings?: FinancialStatement | null;
  earningsTranscript?: EarningsTranscript | null;
}

export class EnhancedFMPApiService {
  private client: AxiosInstance;
  private config: FMPApiConfig;

  constructor() {
    // Load environment variables if not already loaded
    if (!process.env.FMP_API_KEY) {
      require('dotenv').config({ path: '.env' });
    }

    this.config = {
      apiKey: process.env.FMP_API_KEY || '',
      baseUrl: 'https://financialmodelingprep.com/api/v3',
      timeout: 30000,
      retryAttempts: 3,
    };

    if (!this.config.apiKey) {
      throw new Error('FMP_API_KEY environment variable is required');
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      params: {
        apikey: this.config.apiKey,
      },
    });

    // Add interceptors for logging and error handling
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`FMP API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('FMP API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`FMP API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('FMP API Response Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get comprehensive stock data including all available information
   * CACHED: Data is cached for 24 hours to minimize API calls and costs
   */
  async getComprehensiveStockData(symbol: string): Promise<ComprehensiveStockData> {
    const cacheKey = `comprehensive_${symbol.toUpperCase()}`;
    
    // Check cache first - only make API calls once per day
    const cachedData = cacheService.get<ComprehensiveStockData>(cacheKey);
    if (cachedData) {
      logger.info(`✅ Using cached comprehensive data for ${symbol} (avoiding API calls)`);
      return cachedData;
    }

    try {
      logger.info(`🔄 Fetching fresh comprehensive data for ${symbol} from API (will cache for 24h)`);

      // Fetch all data in parallel for efficiency
      const [
        quote,
        profile,
        news,
        analystEstimates,
        priceTargets,
        upgradesDowngrades,
        latestEarnings,
        earningsTranscript
      ] = await Promise.allSettled([
        this.getStockQuote(symbol),
        this.getCompanyProfile(symbol),
        this.getStockNews(symbol, 10),
        this.getAnalystEstimates(symbol),
        this.getPriceTargets(symbol),
        this.getUpgradesDowngrades(symbol),
        this.getLatestFinancials(symbol),
        this.getLatestEarningsTranscript(symbol)
      ]);

      const comprehensiveData: ComprehensiveStockData = {
        quote: quote.status === 'fulfilled' ? quote.value : null,
        profile: profile.status === 'fulfilled' ? profile.value : null,
        news: news.status === 'fulfilled' ? news.value : [],
        analystEstimates: analystEstimates.status === 'fulfilled' ? analystEstimates.value : [],
        priceTargets: priceTargets.status === 'fulfilled' ? priceTargets.value : [],
        upgradesDowngrades: upgradesDowngrades.status === 'fulfilled' ? upgradesDowngrades.value : [],
        latestEarnings: latestEarnings.status === 'fulfilled' ? latestEarnings.value : null,
        earningsTranscript: earningsTranscript.status === 'fulfilled' ? earningsTranscript.value : null
      };

      // Cache the result for 24 hours to minimize API costs
      cacheService.set(cacheKey, comprehensiveData);
      logger.info(`💾 Cached comprehensive data for ${symbol} for 24 hours`);

      return comprehensiveData;

    } catch (error) {
      logger.error(`Error fetching comprehensive data for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get real-time stock quote
   */
  async getStockQuote(symbol: string): Promise<StockQuote> {
    const response = await this.makeRequest<StockQuote[]>(`/quote/${symbol}`);
    return response[0];
  }

  /**
   * Get company profile
   */
  async getCompanyProfile(symbol: string): Promise<any> {
    const response = await this.makeRequest<any[]>(`/profile/${symbol}`);
    return response[0];
  }

  /**
   * Get stock-specific news and press releases
   * Endpoint: https://financialmodelingprep.com/api/v3/stock_news?tickers=AAPL&limit=50
   */
  async getStockNews(symbol: string, limit: number = 20): Promise<NewsArticle[]> {
    return this.makeRequest<NewsArticle[]>(`/stock_news?tickers=${symbol}&limit=${limit}`);
  }

  /**
   * Get general market news
   * Endpoint: https://financialmodelingprep.com/api/v3/general_news?page=0
   */
  async getGeneralNews(limit: number = 20): Promise<NewsArticle[]> {
    return this.makeRequest<NewsArticle[]>(`/general_news?page=0&limit=${limit}`);
  }

  /**
   * Get analyst financial estimates
   * Endpoint: https://financialmodelingprep.com/api/v3/analyst-estimates/AAPL
   */
  async getAnalystEstimates(symbol: string): Promise<AnalystEstimate[]> {
    return this.makeRequest<AnalystEstimate[]>(`/analyst-estimates/${symbol}`);
  }

  /**
   * Get analyst price targets
   * Endpoint: https://financialmodelingprep.com/api/v3/price-target/AAPL
   */
  async getPriceTargets(symbol: string): Promise<PriceTarget[]> {
    return this.makeRequest<PriceTarget[]>(`/price-target/${symbol}`);
  }

  /**
   * Get analyst upgrades and downgrades
   * Endpoint: https://financialmodelingprep.com/api/v3/upgrades-downgrades/AAPL
   */
  async getUpgradesDowngrades(symbol: string): Promise<UpgradeDowngrade[]> {
    return this.makeRequest<UpgradeDowngrade[]>(`/upgrades-downgrades/${symbol}`);
  }

  /**
   * Get latest earnings call transcript
   * Endpoint: https://financialmodelingprep.com/api/v3/earning_call_transcript/AAPL
   */
  async getLatestEarningsTranscript(symbol: string): Promise<EarningsTranscript | null> {
    try {
      const transcripts = await this.makeRequest<EarningsTranscript[]>(`/earning_call_transcript/${symbol}`);
      return transcripts.length > 0 ? transcripts[0] : null;
    } catch (error) {
      logger.warn(`No earnings transcript available for ${symbol}`);
      return null;
    }
  }

  /**
   * Get latest financial statements
   * Endpoint: https://financialmodelingprep.com/api/v3/income-statement/AAPL
   */
  async getLatestFinancials(symbol: string): Promise<FinancialStatement | null> {
    try {
      const financials = await this.makeRequest<FinancialStatement[]>(`/income-statement/${symbol}?limit=1`);
      return financials.length > 0 ? financials[0] : null;
    } catch (error) {
      logger.warn(`No financial statements available for ${symbol}`);
      return null;
    }
  }

  /**
   * Get price target summary with consensus data
   */
  async getPriceTargetSummary(symbol: string): Promise<{
    symbol: string;
    targetHigh: number;
    targetLow: number;
    targetMean: number;
    targetMedian: number;
    analystCount: number;
    lastUpdated: string;
  } | null> {
    try {
      const priceTargets = await this.getPriceTargets(symbol);
      
      if (!priceTargets || priceTargets.length === 0) {
        return null;
      }

      // Calculate consensus from recent targets (last 90 days)
      const recentTargets = priceTargets.filter(target => {
        const targetDate = new Date(target.publishedDate);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return targetDate >= ninetyDaysAgo;
      });

      if (recentTargets.length === 0) {
        return null;
      }

      const targets = recentTargets.map(t => t.priceTarget).filter(t => t > 0);
      targets.sort((a, b) => a - b);

      return {
        symbol,
        targetHigh: Math.max(...targets),
        targetLow: Math.min(...targets),
        targetMean: targets.reduce((sum, target) => sum + target, 0) / targets.length,
        targetMedian: targets.length % 2 === 0 
          ? (targets[targets.length / 2 - 1] + targets[targets.length / 2]) / 2
          : targets[Math.floor(targets.length / 2)],
        analystCount: targets.length,
        lastUpdated: recentTargets[0].publishedDate
      };

    } catch (error) {
      logger.error(`Error calculating price target summary for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get recent market sentiment from upgrades/downgrades
   */
  async getMarketSentiment(symbol: string): Promise<{
    sentiment: 'bullish' | 'bearish' | 'neutral';
    recentActions: UpgradeDowngrade[];
    upgradeCount: number;
    downgradeCount: number;
  }> {
    try {
      const upgradesDowngrades = await this.getUpgradesDowngrades(symbol);
      
      // Filter recent actions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActions = upgradesDowngrades.filter(action => {
        const actionDate = new Date(action.publishedDate);
        return actionDate >= thirtyDaysAgo;
      });

      const upgradeCount = recentActions.filter(action => 
        action.action?.toLowerCase().includes('upgrade') || 
        action.action?.toLowerCase().includes('initiated') ||
        action.newGrade?.toLowerCase().includes('buy')
      ).length;

      const downgradeCount = recentActions.filter(action => 
        action.action?.toLowerCase().includes('downgrade') ||
        action.newGrade?.toLowerCase().includes('sell')
      ).length;

      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (upgradeCount > downgradeCount) {
        sentiment = 'bullish';
      } else if (downgradeCount > upgradeCount) {
        sentiment = 'bearish';
      }

      return {
        sentiment,
        recentActions: recentActions.slice(0, 5), // Most recent 5
        upgradeCount,
        downgradeCount
      };

    } catch (error) {
      logger.error(`Error calculating market sentiment for ${symbol}:`, error);
      return {
        sentiment: 'neutral',
        recentActions: [],
        upgradeCount: 0,
        downgradeCount: 0
      };
    }
  }

  /**
   * Generic request method with retry logic and error handling
   */
  private async makeRequest<T>(endpoint: string, retryCount: number = 0): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(endpoint);
      
      if (!response.data) {
        throw new Error('No data received from FMP API');
      }

      return response.data;
    } catch (error: any) {
      if (retryCount < this.config.retryAttempts && this.shouldRetry(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        logger.warn(`Retrying FMP API request after ${delay}ms (attempt ${retryCount + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, retryCount + 1);
      }

      logger.error(`FMP API request failed after ${retryCount + 1} attempts:`, error.message);
      throw new Error(`FMP API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Determine if an error is retryable
   */
  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // Network error
    
    const status = error.response.status;
    return status >= 500 || status === 429; // Server errors or rate limiting
  }
}

// Export singleton instance
export const enhancedFmpApi = new EnhancedFMPApiService(); 