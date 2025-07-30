import cron from 'node-cron';
import { enhancedFmpApi } from './enhancedFmpApi';
import { cacheService } from './cacheService';
import { logger } from '../utils/logger';

interface DailyJobResult {
  success: boolean;
  message: string;
  timestamp: string;
  companiesUpdated?: string[];
  errors?: string[];
}

/**
 * Daily Scheduler Service
 * Handles daily data updates, company rotation, and AI predictions
 */
class DailySchedulerService {
  private isRunning = false;
  private lastRun: Date | null = null;
  private jobHistory: DailyJobResult[] = [];

  // Extended pool of interesting S&P 500 companies for rotation
  private companyPool = [
    // Tech Giants
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'CRM', 'ORCL', 'ADBE',
    // Financial Services
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BRK.A', 'AXP', 'V', 'MA',
    // Healthcare
    'JNJ', 'PFE', 'UNH', 'ABBV', 'BMY', 'MRK', 'CVS', 'MDT', 'TMO', 'ABT',
    // Consumer & Retail
    'WMT', 'HD', 'PG', 'KO', 'PEP', 'MCD', 'NKE', 'SBUX', 'TGT', 'COST',
    // Energy & Utilities
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'KMI', 'OKE', 'NEE', 'SO', 'DUK',
    // Industrial
    'CAT', 'BA', 'HON', 'UPS', 'LMT', 'RTX', 'DE', 'MMM', 'GE', 'FDX'
  ];

  constructor() {
    this.setupCronJobs();
  }

  /**
   * Set up cron jobs for daily updates
   */
  private setupCronJobs(): void {
    // Run daily at 6:00 AM EST (market pre-open)
    cron.schedule('0 6 * * *', async () => {
      await this.runDailyUpdate();
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    // Also run at 9:30 AM EST (market open) for any missed data
    cron.schedule('30 9 * * 1-5', async () => {
      await this.runMarketOpenUpdate();
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    logger.info('📅 Daily scheduler initialized with cron jobs');
  }

  /**
   * Run daily data update and company rotation
   */
  async runDailyUpdate(): Promise<DailyJobResult> {
    if (this.isRunning) {
      return { success: false, message: 'Daily update already in progress', timestamp: new Date().toISOString() };
    }

    this.isRunning = true;
    this.lastRun = new Date();
    const startTime = Date.now();
    
    try {
      logger.info('🚀 Starting daily update process...');

      // 1. Select 5 most interesting companies for today
      const todaysCompanies = this.selectTodaysCompanies();
      logger.info(`📊 Selected today's companies: ${todaysCompanies.join(', ')}`);

      // 2. Update cache with today's featured companies
      cacheService.set('featured_companies_symbols', todaysCompanies);
      cacheService.set('last_company_rotation', new Date().toISOString());
      
      // 3. Track recently shown companies for variety
      const recentCompanies = cacheService.get<string[]>('recent_companies') || [];
      const updatedRecent = [...todaysCompanies, ...recentCompanies].slice(0, 20); // Keep last 20 companies
      cacheService.set('recent_companies', updatedRecent);

      // 4. Pre-fetch comprehensive data for each selected company
      const updatedCompanies: string[] = [];
      const errors: string[] = [];

      for (const symbol of todaysCompanies) {
        try {
          logger.info(`🔄 Pre-fetching data for ${symbol}...`);
          await this.updateCompanyData(symbol);
          updatedCompanies.push(symbol);
          logger.info(`✅ Updated data for ${symbol}`);
        } catch (error: any) {
          const errorMsg = `Failed to update ${symbol}: ${error.message}`;
          logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      const duration = Date.now() - startTime;
      const result: DailyJobResult = {
        success: true,
        message: `Daily update completed in ${duration}ms. Updated ${updatedCompanies.length}/5 companies.`,
        timestamp: new Date().toISOString(),
        companiesUpdated: updatedCompanies,
        errors: errors.length > 0 ? errors : undefined
      };

      this.jobHistory.push(result);
      if (this.jobHistory.length > 10) {
        this.jobHistory = this.jobHistory.slice(-10); // Keep last 10 results
      }

      logger.info(`✅ Daily update completed: ${result.message}`);
      return result;

    } catch (error: any) {
      const result: DailyJobResult = {
        success: false,
        message: `Daily update failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        errors: [error.message]
      };

      this.jobHistory.push(result);
      logger.error('❌ Daily update failed:', error);
      return result;

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run market open update for any missed data
   */
  async runMarketOpenUpdate(): Promise<void> {
    logger.info('🏢 Running market open update...');
    
    try {
      // Get current featured companies
      const featuredCompanies = cacheService.get<string[]>('featured_companies_symbols') || this.getDefaultCompanies();
      
      // Quick refresh of featured stock quotes for real-time prices
      const quotePromises = featuredCompanies.map(async (symbol) => {
        try {
          await enhancedFmpApi.getStockQuote(symbol);
          logger.info(`📈 Refreshed quote for ${symbol}`);
        } catch (error: any) {
          logger.warn(`⚠️ Failed to refresh quote for ${symbol}: ${error.message}`);
        }
      });

      await Promise.allSettled(quotePromises);
      logger.info('✅ Market open update completed');

    } catch (error: any) {
      logger.error('❌ Market open update failed:', error);
    }
  }

  /**
   * Smart daily company selection algorithm
   * Considers multiple factors to pick the most interesting companies
   */
  private selectTodaysCompanies(): string[] {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Create scoring system for company selection
    const companyScores = this.companyPool.map(symbol => {
      let score = 0;
      let factors: string[] = [];
      
      // 1. Base sector rotation (changes weekly)
      const sectorBonus = this.getSectorRotationBonus(symbol, dayOfYear);
      score += sectorBonus.score;
      if (sectorBonus.factor) factors.push(sectorBonus.factor);
      
      // 2. Volatility interest (higher volatility = more interesting)
      const volatilityBonus = this.getVolatilityBonus(symbol);
      score += volatilityBonus.score;
      factors.push(volatilityBonus.factor);
      
      // 3. Market cap diversity (mix of large, mid, small caps)
      const capBonus = this.getMarketCapBonus(symbol, dayOfYear);
      score += capBonus.score;
      factors.push(capBonus.factor);
      
      // 4. Earnings season proximity bonus
      const earningsBonus = this.getEarningsBonus(symbol, today);
      score += earningsBonus.score;
      if (earningsBonus.factor) factors.push(earningsBonus.factor);
      
      // 5. Recent performance interest (momentum/contrarian plays)
      const performanceBonus = this.getPerformanceBonus(symbol, dayOfYear);
      score += performanceBonus.score;
      factors.push(performanceBonus.factor);
      
      // 6. Day-of-week bias (different sectors perform better on different days)
      const dayBonus = this.getDayOfWeekBonus(symbol, today.getDay());
      score += dayBonus.score;
      if (dayBonus.factor) factors.push(dayBonus.factor);
      
      // 7. Avoid recent repeats (ensure variety)
      const varietyPenalty = this.getVarietyPenalty(symbol);
      score -= varietyPenalty;
      
      return {
        symbol,
        score: Math.round(score * 100) / 100,
        factors: factors.filter(f => f).join(', ')
      };
    });
    
    // Sort by score and select top 5
    const sortedCompanies = companyScores.sort((a, b) => b.score - a.score);
    const selectedCompanies = sortedCompanies.slice(0, 5);
    
    // Log the selection reasoning
    logger.info(`🎯 Company selection weights: ${sortedCompanies.slice(0, 10).map(c => `${c.symbol}:${c.score}`).join(', ')}`);
    logger.info(`📊 Selected today's companies: ${selectedCompanies.map(c => c.symbol).join(', ')}`);
    logger.info(`🔍 Selection factors: ${selectedCompanies.map(c => `${c.symbol}(${c.factors})`).join(' | ')}`);
    
    return selectedCompanies.map(c => c.symbol);
  }
  
  /**
   * Sector rotation bonus based on market cycles and day of year
   */
  private getSectorRotationBonus(symbol: string, dayOfYear: number): {score: number, factor?: string} {
    const week = Math.floor(dayOfYear / 7) % 8; // 8-week rotation cycle
    
    const sectorMap: {[key: string]: string[]} = {
      tech: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'CRM', 'ORCL', 'ADBE'],
      finance: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BRK.A', 'AXP', 'V', 'MA'],
      healthcare: ['JNJ', 'PFE', 'UNH', 'ABBV', 'BMY', 'MRK', 'CVS', 'MDT', 'TMO', 'ABT'],
      consumer: ['WMT', 'HD', 'PG', 'KO', 'PEP', 'MCD', 'NKE', 'SBUX', 'TGT', 'COST'],
      energy: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'KMI', 'OKE', 'NEE', 'SO', 'DUK'],
      industrial: ['CAT', 'BA', 'HON', 'UPS', 'LMT', 'RTX', 'DE', 'MMM', 'GE', 'FDX']
    };
    
    const sectorPriority = ['tech', 'finance', 'healthcare', 'consumer', 'energy', 'industrial'];
    const primarySector = sectorPriority[week % 6];
    const secondarySector = sectorPriority[(week + 2) % 6];
    
    for (const [sector, symbols] of Object.entries(sectorMap)) {
      if (symbols.includes(symbol)) {
        if (sector === primarySector) {
          return {score: 0.8, factor: `${sector}-focus`};
        } else if (sector === secondarySector) {
          return {score: 0.4, factor: `${sector}-secondary`};
        }
        return {score: 0.1};
      }
    }
    return {score: 0.2};
  }
  
  /**
   * Volatility bonus - more volatile stocks are more interesting for trading
   */
  private getVolatilityBonus(symbol: string): {score: number, factor: string} {
    // Simulate volatility based on symbol characteristics
    const highVolSymbols = ['TSLA', 'NVDA', 'META', 'CRM', 'BA', 'CAT'];
    const medVolSymbols = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'JPM', 'GS'];
    
    if (highVolSymbols.includes(symbol)) {
      return {score: 0.6, factor: 'high-vol'};
    } else if (medVolSymbols.includes(symbol)) {
      return {score: 0.3, factor: 'med-vol'};
    } else {
      return {score: 0.1, factor: 'low-vol'};
    }
  }
  
  /**
   * Market cap diversity bonus
   */
  private getMarketCapBonus(symbol: string, dayOfYear: number): {score: number, factor: string} {
    const megaCap = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA'];
    const largeCap = ['JPM', 'JNJ', 'WMT', 'PG', 'HD', 'BAC', 'XOM', 'CVX'];
    const midCap = ['CRM', 'ORCL', 'ADBE', 'CVS', 'MDT', 'TMO', 'ABT'];
    
    // Rotate preference every few days
    const preference = Math.floor(dayOfYear / 3) % 3;
    
    if (preference === 0 && megaCap.includes(symbol)) {
      return {score: 0.4, factor: 'mega-cap-day'};
    } else if (preference === 1 && largeCap.includes(symbol)) {
      return {score: 0.4, factor: 'large-cap-day'};
    } else if (preference === 2 && midCap.includes(symbol)) {
      return {score: 0.4, factor: 'mid-cap-day'};
    }
    return {score: 0.1, factor: 'cap-neutral'};
  }
  
  /**
   * Earnings season proximity bonus
   */
  private getEarningsBonus(symbol: string, date: Date): {score: number, factor?: string} {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    
    // Earnings seasons: Jan (Q4), Apr (Q1), Jul (Q2), Oct (Q3)
    const earningsMonths = [1, 4, 7, 10];
    const isEarningsSeason = earningsMonths.includes(month);
    
    if (isEarningsSeason) {
      // Higher bonus for weeks 2-3 of earnings month
      if (day >= 8 && day <= 21) {
        return {score: 0.5, factor: 'earnings-peak'};
      } else {
        return {score: 0.2, factor: 'earnings-season'};
      }
    }
    return {score: 0.0};
  }
  
  /**
   * Performance momentum/contrarian bonus
   */
  private getPerformanceBonus(symbol: string, dayOfYear: number): {score: number, factor: string} {
    // Simulate recent performance trends
    const trendingUp = ['NVDA', 'META', 'GOOGL', 'MSFT', 'AMZN'];
    const trendingDown = ['AAPL', 'TSLA', 'BA', 'CAT', 'GE'];
    const sideways = ['JPM', 'WMT', 'PG', 'KO', 'JNJ'];
    
    // Alternate between momentum and contrarian strategy
    const isMomentumDay = (dayOfYear % 6) < 3;
    
    if (isMomentumDay) {
      if (trendingUp.includes(symbol)) {
        return {score: 0.4, factor: 'momentum-up'};
      } else if (sideways.includes(symbol)) {
        return {score: 0.2, factor: 'momentum-stable'};
      }
      return {score: 0.0, factor: 'momentum-weak'};
    } else {
      // Contrarian day - buy the dips
      if (trendingDown.includes(symbol)) {
        return {score: 0.4, factor: 'contrarian-dip'};
      } else if (sideways.includes(symbol)) {
        return {score: 0.2, factor: 'contrarian-stable'};
      }
      return {score: 0.0, factor: 'contrarian-expensive'};
    }
  }
  
  /**
   * Day of week bonus - different sectors perform better on different days
   */
  private getDayOfWeekBonus(symbol: string, dayOfWeek: number): {score: number, factor?: string} {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const techSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA'];
    const financeSymbols = ['JPM', 'BAC', 'WFC', 'GS', 'MS'];
    const consumerSymbols = ['WMT', 'HD', 'PG', 'KO', 'MCD'];
    
    switch (dayOfWeek) {
      case 1: // Monday - Tech momentum
        if (techSymbols.includes(symbol)) return {score: 0.3, factor: 'monday-tech'};
        break;
      case 2: // Tuesday - Finance focus
        if (financeSymbols.includes(symbol)) return {score: 0.3, factor: 'tuesday-finance'};
        break;
      case 3: // Wednesday - Mixed/Balanced
        return {score: 0.1, factor: 'wednesday-balanced'};
      case 4: // Thursday - Consumer/Retail
        if (consumerSymbols.includes(symbol)) return {score: 0.3, factor: 'thursday-consumer'};
        break;
      case 5: // Friday - High volatility for weekend news
        if (['TSLA', 'BA', 'CAT', 'NVDA'].includes(symbol)) return {score: 0.3, factor: 'friday-volatile'};
        break;
    }
    return {score: 0.0};
  }
  
  /**
   * Variety penalty to avoid showing the same companies too frequently
   */
  private getVarietyPenalty(symbol: string): number {
    const lastRotation = cacheService.get<string>('last_company_rotation');
    if (!lastRotation) return 0;
    
    const daysSinceRotation = Math.floor((Date.now() - new Date(lastRotation).getTime()) / (1000 * 60 * 60 * 24));
    
    // Get recently shown companies from cache
    const recentCompanies = cacheService.get<string[]>('recent_companies') || [];
    
    if (recentCompanies.includes(symbol)) {
      // Penalize recently shown companies based on how recently they appeared
      const recentIndex = recentCompanies.indexOf(symbol);
      if (recentIndex < 5) return 0.6 - (recentIndex * 0.1); // Heavy penalty for very recent
      if (recentIndex < 10) return 0.3 - ((recentIndex - 5) * 0.05); // Medium penalty
      return 0.1; // Light penalty for older appearances
    }
    
    return 0; // No penalty for companies not recently shown
  }

  /**
   * Update comprehensive data for a single company
   */
  private async updateCompanyData(symbol: string): Promise<void> {
    await enhancedFmpApi.getComprehensiveStockData(symbol);
  }

  /**
   * Cleanup old cache entries
   */
  private async cleanupOldCache(): Promise<void> {
    try {
      const stats = cacheService.getStats();
      logger.info(`🧹 Cache cleanup: ${stats.totalKeys} entries, ${stats.expiredKeys} expired`);
      
      cacheService.cleanupExpired();
      
    } catch (error: any) {
      logger.warn('⚠️ Cache cleanup failed:', error.message);
    }
  }

  /**
   * Get default companies if none cached
   */
  private getDefaultCompanies(): string[] {
    return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
  }

  /**
   * Manual trigger for daily update (for testing/admin)
   */
  async triggerManualUpdate(): Promise<DailyJobResult> {
    logger.info('🔧 Manual daily update triggered');
    return await this.runDailyUpdate();
  }

  /**
   * Get current featured companies
   */
  getCurrentFeaturedCompanies(): string[] {
    return cacheService.get<string[]>('featured_companies_symbols') || this.getDefaultCompanies();
  }

  /**
   * Get scheduler status and history
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      currentFeaturedCompanies: this.getCurrentFeaturedCompanies(),
      recentJobs: this.jobHistory.slice(-5),
      nextScheduledRun: 'Daily at 6:00 AM EST',
      companyPoolSize: this.companyPool.length
    };
  }

  /**
   * Add company to the pool
   */
  addCompanyToPool(symbol: string): void {
    if (!this.companyPool.includes(symbol)) {
      this.companyPool.push(symbol);
      logger.info(`➕ Added ${symbol} to company pool`);
    }
  }

  /**
   * Remove company from the pool
   */
  removeCompanyFromPool(symbol: string): void {
    const index = this.companyPool.indexOf(symbol);
    if (index > -1) {
      this.companyPool.splice(index, 1);
      logger.info(`➖ Removed ${symbol} from company pool`);
    }
  }
}

// Export singleton instance
export const dailyScheduler = new DailySchedulerService(); 