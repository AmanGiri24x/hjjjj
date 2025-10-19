/**
 * Simplified Python AI services integration routes
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import PythonServiceBridge from '../services/PythonServiceBridge';
import { logger } from '../utils/logger';

const router = Router();
const pythonBridge = new PythonServiceBridge();

// Simple validation middleware
const validateAuth = authenticate;

// Market data routes
router.get('/market/quote/:symbol', validateAuth, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const result = await pythonBridge.getMarketQuote(symbol.toUpperCase());
    res.json(result);
  } catch (error: any) {
    logger.error('Error getting market quote:', error);
    res.status(500).json({ error: 'Failed to get market quote' });
  }
});

router.post('/market/batch-quotes', validateAuth, async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body;
    const result = await pythonBridge.getBatchQuotes(symbols);
    res.json(result);
  } catch (error: any) {
    logger.error('Error getting batch quotes:', error);
    res.status(500).json({ error: 'Failed to get batch quotes' });
  }
});

router.get('/market/historical/:symbol', validateAuth, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { period = '1y', interval = '1d' } = req.query;
    const result = await pythonBridge.getHistoricalData(
      symbol.toUpperCase(), 
      period as string, 
      interval as string
    );
    res.json(result);
  } catch (error: any) {
    logger.error('Error getting historical data:', error);
    res.status(500).json({ error: 'Failed to get historical data' });
  }
});

// Portfolio optimization routes
router.post('/portfolio/optimize', validateAuth, async (req: Request, res: Response) => {
  try {
    const result = await pythonBridge.optimizePortfolio(req.body);
    res.json(result);
  } catch (error: any) {
    logger.error('Error optimizing portfolio:', error);
    res.status(500).json({ error: 'Failed to optimize portfolio' });
  }
});

// AI trading routes
router.post('/ai/signals', validateAuth, async (req: Request, res: Response) => {
  try {
    const { symbols, strategy_type = 'momentum' } = req.body;
    const result = await pythonBridge.generateTradingSignals(symbols, strategy_type);
    res.json(result);
  } catch (error: any) {
    logger.error('Error generating trading signals:', error);
    res.status(500).json({ error: 'Failed to generate trading signals' });
  }
});

// Risk management routes
router.post('/risk/var', validateAuth, async (req: Request, res: Response) => {
  try {
    const { portfolio, confidence_level = 0.95 } = req.body;
    const result = await pythonBridge.calculateVaR(portfolio, confidence_level);
    res.json(result);
  } catch (error: any) {
    logger.error('Error calculating VaR:', error);
    res.status(500).json({ error: 'Failed to calculate VaR' });
  }
});

// Health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    const result = await pythonBridge.healthCheck();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

export default router;
