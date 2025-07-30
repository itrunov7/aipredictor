import { Router, Request, Response } from 'express';
import { dailyScheduler } from '../services/dailyScheduler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/scheduler/status
 * Get scheduler status and history
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = dailyScheduler.getStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error: any) {
    logger.error('Error fetching scheduler status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduler status'
    });
  }
});

/**
 * POST /api/scheduler/trigger
 * Manually trigger daily update
 */
router.post('/trigger', async (req: Request, res: Response) => {
  try {
    logger.info('Manual scheduler trigger requested');
    
    const result = await dailyScheduler.triggerManualUpdate();
    
    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    logger.error('Error triggering manual update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger manual update'
    });
  }
});

/**
 * GET /api/scheduler/companies
 * Get current featured companies
 */
router.get('/companies', async (req: Request, res: Response) => {
  try {
    const companies = dailyScheduler.getCurrentFeaturedCompanies();
    
    res.json({
      success: true,
      data: {
        companies,
        count: companies.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('Error fetching featured companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured companies'
    });
  }
});

/**
 * POST /api/scheduler/companies/add
 * Add company to the pool
 */
router.post('/companies/add', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid symbol required'
      });
    }
    
    dailyScheduler.addCompanyToPool(symbol.toUpperCase());
    
    res.json({
      success: true,
      message: `Added ${symbol.toUpperCase()} to company pool`
    });

  } catch (error: any) {
    logger.error('Error adding company to pool:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add company to pool'
    });
  }
});

/**
 * DELETE /api/scheduler/companies/:symbol
 * Remove company from the pool
 */
router.delete('/companies/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    dailyScheduler.removeCompanyFromPool(symbol.toUpperCase());
    
    res.json({
      success: true,
      message: `Removed ${symbol.toUpperCase()} from company pool`
    });

  } catch (error: any) {
    logger.error('Error removing company from pool:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove company from pool'
    });
  }
});

// Manual trigger for testing (add before export)
router.post('/trigger-selection', async (req, res) => {
  try {
    logger.info('🔧 Manual company selection triggered');
    const result = await dailyScheduler.triggerManualUpdate();
    res.json({
      success: true,
      message: 'Company selection triggered successfully',
      result
    });
  } catch (error: any) {
    logger.error('❌ Manual selection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger company selection',
      details: error.message
    });
  }
});

export { router as schedulerRoutes }; 