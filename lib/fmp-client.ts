/**
 * Frontend FMP API Client
 * Safely access Financial Modeling Prep data through our backend proxy
 */

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
  exchange: string;
  open: number;
  previousClose: number;
}

export interface SP500Company {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: number;
  website: string;
  description: string;
  ceo: string;
  country: string;
  city: string;
  state: string;
  image: string;
}

export interface MarketMovers {
  gainers: StockQuote[];
  losers: StockQuote[];
  mostActive: StockQuote[];
}

export interface NewsArticle {
  title: string;
  url: string;
  publishedDate: string;
  site: string;
  text: string;
  symbol: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

class FMPClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' 
      ? (window as any).__NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      : 'http://localhost:3001/api';
  }

  /**
   * Get real-time quote for a single stock
   */
  async getQuote(symbol: string): Promise<StockQuote> {
    const response = await fetch(`${this.baseUrl}/stocks/${symbol}/quote`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get multiple stock quotes
   */
  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const symbolString = symbols.join(',');
    const response = await fetch(`${this.baseUrl}/stocks/quotes?symbols=${symbolString}`);
    if (!response.ok) {
      throw new Error('Failed to fetch quotes');
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get S&P 500 company list
   */
  async getSP500Companies(): Promise<SP500Company[]> {
    const response = await fetch(`${this.baseUrl}/stocks/sp500`);
    if (!response.ok) {
      throw new Error('Failed to fetch S&P 500 companies');
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get market gainers, losers, and most active
   */
  async getMarketMovers(): Promise<MarketMovers> {
    const response = await fetch(`${this.baseUrl}/stocks/movers`);
    if (!response.ok) {
      throw new Error('Failed to fetch market movers');
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get daily insights (5 featured stocks)
   */
  async getDailyInsights(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/insights/daily`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily insights');
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get predictions for a specific stock
   */
  async getPrediction(symbol: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/predictions/${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch prediction for ${symbol}`);
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get stock news
   */
  async getStockNews(symbols?: string[], limit = 20): Promise<NewsArticle[]> {
    let url = `${this.baseUrl}/news?limit=${limit}`;
    if (symbols && symbols.length > 0) {
      url += `&symbols=${symbols.join(',')}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch stock news');
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Search for stocks
   */
  async searchStocks(query: string): Promise<StockQuote[]> {
    const response = await fetch(`${this.baseUrl}/stocks/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search stocks');
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get historical prices for charting
   */
  async getHistoricalPrices(symbol: string, days = 30): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/stocks/${symbol}/history?days=${days}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    }
    const data = await response.json();
    return data.data;
  }

  /**
   * Get economic indicators
   */
  async getEconomicIndicators(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/economic/indicators`);
    if (!response.ok) {
      throw new Error('Failed to fetch economic indicators');
    }
    const data = await response.json();
    return data.data;
  }
}

// Export singleton instance
export const fmpClient = new FMPClient();

// Named exports for convenience
export default fmpClient; 