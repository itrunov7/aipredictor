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
      logger.warn('Daily update already running, skipping...');
      return {
        success: false,
        message: 'Update already in progress',
        timestamp: new Date().toISOString()
      };
    }

    this.isRunning = true;
    logger.info('🚀 Starting daily update process...');

    try {
      const startTime = Date.now();
      const result: DailyJobResult = {
        success: true,
        message: 'Daily update completed successfully',
        timestamp: new Date().toISOString(),
        companiesUpdated: [],
        errors: []
      };

      // 1. Select 5 most interesting companies for today
      const todaysCompanies = this.selectMostInterestingCompanies();
      logger.info(`📊 Selected today's companies: ${todaysCompanies.join(', ')}`);

      // 2. Update cache with today's featured companies
      cacheService.set('featured_stocks_daily', todaysCompanies);
      cacheService.set('last_company_rotation', new Date().toISOString());

      // 3. Pre-fetch comprehensive data for selected companies
      const updatePromises = todaysCompanies.map(async (symbol) => {
        try {
          logger.info(`🔄 Pre-fetching data for ${symbol}...`);
          await enhancedFmpApi.getComprehensiveStockData(symbol);
          result.companiesUpdated!.push(symbol);
          logger.info(`✅ Updated data for ${symbol}`);
        } catch (error: any) {
          logger.error(`❌ Failed to update ${symbol}:`, error.message);
          result.errors!.push(`${symbol}: ${error.message}`);
        }
      });

      await Promise.allSettled(updatePromises);

      // 4. Clear old cache entries if needed
      await this.cleanupOldCache();

      // 5. Store job result
      this.lastRun = new Date();
      this.jobHistory.push(result);
      
      // Keep only last 30 job results
      if (this.jobHistory.length > 30) {
        this.jobHistory = this.jobHistory.slice(-30);
      }

      const duration = Date.now() - startTime;
      logger.info(`✅ Daily update completed in ${duration}ms. Updated ${result.companiesUpdated!.length} companies.`);
      
      if (result.errors!.length > 0) {
        logger.warn(`⚠️ Some updates failed: ${result.errors!.join(', ')}`);
      }

      return result;

    } catch (error: any) {
      logger.error('❌ Daily update failed:', error);
      const errorResult: DailyJobResult = {
        success: false,
        message: `Daily update failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        errors: [error.message]
      };
      
      this.jobHistory.push(errorResult);
      return errorResult;

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
      const featuredCompanies = cacheService.get<string[]>('featured_stocks_daily') || this.getDefaultCompanies();
      
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
   * Select 5 most interesting companies using weighted algorithm
   */
  private selectMostInterestingCompanies(): string[] {
    const todayDate = new Date().toDateString();
    const seedValue = this.generateSeedFromDate(todayDate);
    
    // Shuffle companies based on today's date for consistent daily selection
    const shuffled = this.shuffleArrayWithSeed([...this.companyPool], seedValue);
    
    // Weight selection based on various factors
    const weightedCompanies = shuffled.map(symbol => ({
      symbol,
      weight: this.calculateCompanyWeight(symbol)
    }));

    // Sort by weight and select top 5
    weightedCompanies.sort((a, b) => b.weight - a.weight);
    const selected = weightedCompanies.slice(0, 5).map(c => c.symbol);

    logger.info(`🎯 Company selection weights: ${weightedCompanies.slice(0, 10).map(c => `${c.symbol}:${c.weight.toFixed(2)}`).join(', ')}`);
    
    return selected;
  }

  /**
   * Calculate interest weight for a company
   */
  private calculateCompanyWeight(symbol: string): number {
    let weight = 1.0;

    // Tech companies get higher base weight (high volatility = interesting)
    const techCompanies = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'CRM'];
    if (techCompanies.includes(symbol)) weight += 0.3;

    // High market cap companies (more news coverage)
    const megaCaps = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'];
    if (megaCaps.includes(symbol)) weight += 0.2;

    // Volatile/newsworthy companies
    const volatileStocks = ['TSLA', 'META', 'NVDA', 'CRM', 'ORCL', 'BA', 'XOM'];
    if (volatileStocks.includes(symbol)) weight += 0.3;

    // Add some randomness for variety
    weight += Math.random() * 0.4;

    return weight;
  }

  /**
   * Generate consistent seed from date string
   */
  private generateSeedFromDate(dateString: string): number {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Shuffle array with deterministic seed
   */
  private shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
    const result = [...array];
    let m = result.length;
    
    // Simple linear congruential generator for pseudo-random numbers
    let current = seed;
    
    while (m) {
      current = (current * 1103515245 + 12345) & 0x7fffffff;
      const i = Math.floor((current / 0x7fffffff) * m--);
      [result[m], result[i]] = [result[i], result[m]];
    }
    
    return result;
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
    return cacheService.get<string[]>('featured_stocks_daily') || this.getDefaultCompanies();
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