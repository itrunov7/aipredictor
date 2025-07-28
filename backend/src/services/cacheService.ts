import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStorage {
  [key: string]: CacheEntry<any>;
}

export class CacheService {
  private cacheDir: string;
  private cacheFile: string;
  private cache: CacheStorage;
  private defaultTTL: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'cache');
    this.cacheFile = path.join(this.cacheDir, 'fmp-data.json');
    this.cache = {};
    this.loadCacheFromFile();
    this.ensureCacheDirectory();
  }

  private ensureCacheDirectory(): void {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
        logger.info('Created cache directory');
      }
    } catch (error) {
      logger.error('Failed to create cache directory:', error);
    }
  }

  private loadCacheFromFile(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const fileContent = fs.readFileSync(this.cacheFile, 'utf8');
        this.cache = JSON.parse(fileContent);
        logger.info('Loaded cache from file');
      }
    } catch (error) {
      logger.error('Failed to load cache from file:', error);
      this.cache = {};
    }
  }

  private saveCacheToFile(): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
      logger.debug('Saved cache to file');
    } catch (error) {
      logger.error('Failed to save cache to file:', error);
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache[key] = {
      data,
      timestamp: now,
      expiresAt
    };
    
    this.saveCacheToFile();
    logger.info(`Cached data for key: ${key}, expires at: ${new Date(expiresAt).toISOString()}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache[key];
    
    if (!entry) {
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    }
    
    const now = Date.now();
    if (now > entry.expiresAt) {
      logger.info(`Cache expired for key: ${key}`);
      delete this.cache[key];
      this.saveCacheToFile();
      return null;
    }
    
    const hoursRemaining = Math.round((entry.expiresAt - now) / (60 * 60 * 1000));
    logger.info(`Cache hit for key: ${key}, expires in ${hoursRemaining} hours`);
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache[key];
    if (!entry) return false;
    
    const now = Date.now();
    if (now > entry.expiresAt) {
      delete this.cache[key];
      this.saveCacheToFile();
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    if (this.cache[key]) {
      delete this.cache[key];
      this.saveCacheToFile();
      logger.info(`Deleted cache for key: ${key}`);
    }
  }

  clear(): void {
    this.cache = {};
    this.saveCacheToFile();
    logger.info('Cleared all cache');
  }

  getStats(): { totalKeys: number; validKeys: number; expiredKeys: number } {
    const now = Date.now();
    const totalKeys = Object.keys(this.cache).length;
    let validKeys = 0;
    let expiredKeys = 0;

    Object.values(this.cache).forEach(entry => {
      if (now <= entry.expiresAt) {
        validKeys++;
      } else {
        expiredKeys++;
      }
    });

    return { totalKeys, validKeys, expiredKeys };
  }

  cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    Object.keys(this.cache).forEach(key => {
      if (now > this.cache[key].expiresAt) {
        delete this.cache[key];
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      this.saveCacheToFile();
      logger.info(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Cleanup expired entries every hour
setInterval(() => {
  cacheService.cleanupExpired();
}, 60 * 60 * 1000); 