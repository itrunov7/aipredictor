import express, { Request, Response } from 'express';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/cache/stats
 * Get cache statistics and status
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = cacheService.getStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        uptime: process.uptime(),
        message: `Cache contains ${stats.validKeys} valid entries, ${stats.expiredKeys} expired`
      }
    });

  } catch (error: any) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
      details: error.message
    });
  }
});

/**
 * POST /api/cache/clear
 * Clear all cached data (force fresh API calls)
 */
router.post('/clear', async (req: Request, res: Response) => {
  try {
    const statsBefore = cacheService.getStats();
    cacheService.clear();
    
    logger.info('Cache cleared manually via API');
    
    res.json({
      success: true,
      message: `Cleared ${statsBefore.totalKeys} cache entries. Next API calls will fetch fresh data.`,
      clearedEntries: statsBefore.totalKeys
    });

  } catch (error: any) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      details: error.message
    });
  }
});

/**
 * DELETE /api/cache/:key
 * Clear specific cached data by key
 */
router.delete('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Cache key is required'
      });
    }

    const existed = cacheService.has(key);
    cacheService.delete(key);
    
    logger.info(`Cache key deleted: ${key}`);
    
    res.json({
      success: true,
      message: existed 
        ? `Cache entry '${key}' deleted successfully` 
        : `Cache entry '${key}' was not found`,
      existed
    });

  } catch (error: any) {
    logger.error(`Error deleting cache key ${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete cache entry',
      details: error.message
    });
  }
});

export const cacheRoutes = router; 