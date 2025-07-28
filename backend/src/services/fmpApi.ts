import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

interface FMPApiConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

interface StockQuote {
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

interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  website: string;
  description: string;
  ceo: string;
  employees: number;
  city: string;
  state: string;
  country: string;
  image: string;
}

interface TechnicalIndicator {
  symbol: string;
  rsi: number;
  sma: number;
  ema: number;
  wma: number;
  adx: number;
  williams: number;
}

interface AnalystEstimate {
  symbol: string;
  analystRatingsbuy: number;
  analystRatingsHold: number;
  analystRatingsSell: number;
  analystRatingsStrongSell: number;
  analystRatingsStrongBuy: number;
  targetHighPrice: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetMedianPrice: number;
}

interface NewsArticle {
  title: string;
  url: string;
  publishedDate: string;
  site: string;
  text: string;
  symbol: string;
}

interface EconomicIndicator {
  date: string;
  value: number;
  indicator: string;
}

export class FMPApiService {
  private client: AxiosInstance;
  private config: FMPApiConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
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

    // Request interceptor for logging
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

    // Response interceptor for error handling
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
   * Get S&P 500 company list
   */
  async getSP500Companies(): Promise<CompanyProfile[]> {
    const cacheKey = 'sp500-companies';
    
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    const request = this.makeRequest<CompanyProfile[]>('/sp500_constituent');
    this.requestQueue.set(cacheKey, request);

    try {
      const result = await request;
      // Cache for 24 hours
      setTimeout(() => this.requestQueue.delete(cacheKey), 24 * 60 * 60 * 1000);
      return result;
    } catch (error) {
      this.requestQueue.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Get real-time stock quotes for multiple symbols
   */
  async getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
    if (symbols.length === 0) return [];

    const symbolString = symbols.join(',');
    const cacheKey = `quotes-${symbolString}`;

    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    const request = this.makeRequest<StockQuote[]>(`/quote/${symbolString}`);
    this.requestQueue.set(cacheKey, request);

    try {
      const result = await request;
      // Cache for 1 minute
      setTimeout(() => this.requestQueue.delete(cacheKey), 60 * 1000);
      return result;
    } catch (error) {
      this.requestQueue.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Get company profile information
   */
  async getCompanyProfile(symbol: string): Promise<CompanyProfile[]> {
    return this.makeRequest<CompanyProfile[]>(`/profile/${symbol}`);
  }

  /**
   * Get technical indicators for a stock
   */
  async getTechnicalIndicators(symbol: string, period: string = '1day'): Promise<TechnicalIndicator[]> {
    const indicators = ['rsi', 'sma', 'ema', 'wma', 'adx', 'williams'];
    const requests = indicators.map(indicator =>
      this.makeRequest<any[]>(`/technical_indicator/${period}/${symbol}?type=${indicator}`)
    );

    try {
      const results = await Promise.allSettled(requests);
      const data: any = {};

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          const indicatorName = indicators[index];
          data[indicatorName] = result.value[0][indicatorName];
        }
      });

      return [{
        symbol,
        rsi: data.rsi || 0,
        sma: data.sma || 0,
        ema: data.ema || 0,
        wma: data.wma || 0,
        adx: data.adx || 0,
        williams: data.williams || 0,
      }];
    } catch (error) {
      logger.error(`Error fetching technical indicators for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get analyst estimates for a stock
   */
  async getAnalystEstimates(symbol: string): Promise<AnalystEstimate[]> {
    return this.makeRequest<AnalystEstimate[]>(`/analyst-estimates/${symbol}`);
  }

  /**
   * Get latest news for specific stocks
   */
  async getStockNews(symbols?: string[], limit: number = 50): Promise<NewsArticle[]> {
    let endpoint = `/stock_news?limit=${limit}`;
    
    if (symbols && symbols.length > 0) {
      endpoint += `&tickers=${symbols.join(',')}`;
    }

    return this.makeRequest<NewsArticle[]>(endpoint);
  }

  /**
   * Get general market news
   */
  async getGeneralNews(limit: number = 20): Promise<NewsArticle[]> {
    return this.makeRequest<NewsArticle[]>(`/general_news?limit=${limit}`);
  }

  /**
   * Get economic indicators
   */
  async getEconomicIndicators(): Promise<{
    gdp: EconomicIndicator[];
    inflation: EconomicIndicator[];
    unemployment: EconomicIndicator[];
    interestRate: EconomicIndicator[];
  }> {
    const indicators = [
      { name: 'GDP', endpoint: '/economic?name=GDP' },
      { name: 'CPI', endpoint: '/economic?name=CPI' },
      { name: 'unemployment', endpoint: '/economic?name=unemploymentRate' },
      { name: 'federalFunds', endpoint: '/economic?name=federalFunds' },
    ];

    try {
      const requests = indicators.map(indicator =>
        this.makeRequest<EconomicIndicator[]>(indicator.endpoint)
      );

      const results = await Promise.allSettled(requests);

      return {
        gdp: results[0].status === 'fulfilled' ? results[0].value : [],
        inflation: results[1].status === 'fulfilled' ? results[1].value : [],
        unemployment: results[2].status === 'fulfilled' ? results[2].value : [],
        interestRate: results[3].status === 'fulfilled' ? results[3].value : [],
      };
    } catch (error) {
      logger.error('Error fetching economic indicators:', error);
      throw error;
    }
  }

  /**
   * Get historical stock prices
   */
  async getHistoricalPrices(symbol: string, from?: string, to?: string): Promise<any[]> {
    let endpoint = `/historical-price-full/${symbol}`;
    
    if (from && to) {
      endpoint += `?from=${from}&to=${to}`;
    }

    const response = await this.makeRequest<{ historical: any[] }>(endpoint);
    return response.historical || [];
  }

  /**
   * Get market gainers, losers, and most active
   */
  async getMarketMovers(): Promise<{
    gainers: StockQuote[];
    losers: StockQuote[];
    mostActive: StockQuote[];
  }> {
    try {
      const [gainers, losers, mostActive] = await Promise.allSettled([
        this.makeRequest<StockQuote[]>('/gainers'),
        this.makeRequest<StockQuote[]>('/losers'),
        this.makeRequest<StockQuote[]>('/actives'),
      ]);

      return {
        gainers: gainers.status === 'fulfilled' ? gainers.value : [],
        losers: losers.status === 'fulfilled' ? losers.value : [],
        mostActive: mostActive.status === 'fulfilled' ? mostActive.value : [],
      };
    } catch (error) {
      logger.error('Error fetching market movers:', error);
      throw error;
    }
  }

  /**
   * Generic request method with retry logic
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

  /**
   * Check API status and limits
   */
  async checkApiStatus(): Promise<{ status: string; remaining?: number; resetTime?: string }> {
    try {
      // Make a simple request to check API status
      await this.makeRequest('/quote/AAPL');
      return { status: 'active' };
    } catch (error: any) {
      return {
        status: 'error',
        remaining: error.response?.headers['x-ratelimit-remaining'],
        resetTime: error.response?.headers['x-ratelimit-reset'],
      };
    }
  }
} 