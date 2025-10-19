/**
 * Routes for Python AI services integration
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validationResult } from 'express-validator';
import { body, param, query } from 'express-validator';
import PythonServiceBridge from '../services/PythonServiceBridge';
import { logger } from '../utils/logger';

const router = Router();
const pythonBridge = new PythonServiceBridge();

// Market data routes
router.get('/market/quote/:symbol', 
  authenticateToken,
  param('symbol').isString().isLength({ min: 1, max: 10 }),
  validateRequest,
  async (req, res) => {
    try {
      const { symbol } = req.params;
      const result = await pythonBridge.getMarketQuote(symbol.toUpperCase());
      res.json(result);
    } catch (error) {
      logger.error('Error getting market quote:', error);
      res.status(500).json({ error: 'Failed to get market quote' });
    }
  }
);

router.post('/market/batch-quotes',
  authenticateToken,
  body('symbols').isArray().isLength({ min: 1, max: 50 }),
  validateRequest,
  async (req, res) => {
    try {
      const { symbols } = req.body;
      const result = await pythonBridge.getBatchQuotes(symbols);
      res.json(result);
    } catch (error) {
      logger.error('Error getting batch quotes:', error);
      res.status(500).json({ error: 'Failed to get batch quotes' });
    }
  }
);

router.get('/market/historical/:symbol',
  authenticateToken,
  param('symbol').isString().isLength({ min: 1, max: 10 }),
  query('period').optional().isString(),
  query('interval').optional().isString(),
  validateRequest,
  async (req, res) => {
    try {
      const { symbol } = req.params;
      const { period = '1y', interval = '1d' } = req.query;
      const result = await pythonBridge.getHistoricalData(
        symbol.toUpperCase(), 
        period as string, 
        interval as string
      );
      res.json(result);
    } catch (error) {
      logger.error('Error getting historical data:', error);
      res.status(500).json({ error: 'Failed to get historical data' });
    }
  }
);

// Portfolio optimization routes
router.post('/portfolio/optimize',
  authenticateToken,
  body('symbols').isArray().isLength({ min: 2, max: 50 }),
  body('objective').optional().isString(),
  body('risk_tolerance').optional().isFloat({ min: 0, max: 1 }),
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonBridge.optimizePortfolio(req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error optimizing portfolio:', error);
      res.status(500).json({ error: 'Failed to optimize portfolio' });
    }
  }
);

router.post('/portfolio/efficient-frontier',
  authenticateToken,
  body('symbols').isArray().isLength({ min: 2, max: 50 }),
  body('num_portfolios').optional().isInt({ min: 10, max: 1000 }),
  validateRequest,
  async (req, res) => {
    try {
      const { symbols, num_portfolios = 100 } = req.body;
      const result = await pythonBridge.calculateEfficientFrontier(symbols, num_portfolios);
      res.json(result);
    } catch (error) {
      logger.error('Error calculating efficient frontier:', error);
      res.status(500).json({ error: 'Failed to calculate efficient frontier' });
    }
  }
);

// Risk management routes
router.post('/risk/var',
  authenticateToken,
  body('portfolio').isObject(),
  body('confidence_level').optional().isFloat({ min: 0.8, max: 0.999 }),
  validateRequest,
  async (req, res) => {
    try {
      const { portfolio, confidence_level = 0.95 } = req.body;
      const result = await pythonBridge.calculateVaR(portfolio, confidence_level);
      res.json(result);
    } catch (error) {
      logger.error('Error calculating VaR:', error);
      res.status(500).json({ error: 'Failed to calculate VaR' });
    }
  }
);

router.post('/risk/stress-test',
  authenticateToken,
  body('portfolio').isObject(),
  body('scenarios').optional().isArray(),
  validateRequest,
  async (req, res) => {
    try {
      const { portfolio, scenarios = [] } = req.body;
      const result = await pythonBridge.stressTestPortfolio(portfolio, scenarios);
      res.json(result);
    } catch (error) {
      logger.error('Error performing stress test:', error);
      res.status(500).json({ error: 'Failed to perform stress test' });
    }
  }
);

// AI trading routes
router.post('/ai/signals',
  authenticateToken,
  body('symbols').isArray().isLength({ min: 1, max: 20 }),
  body('strategy_type').optional().isString(),
  validateRequest,
  async (req, res) => {
    try {
      const { symbols, strategy_type = 'momentum' } = req.body;
      const result = await pythonBridge.generateTradingSignals(symbols, strategy_type);
      res.json(result);
    } catch (error) {
      logger.error('Error generating trading signals:', error);
      res.status(500).json({ error: 'Failed to generate trading signals' });
    }
  }
);

router.post('/ai/predict-price',
  authenticateToken,
  body('symbol').isString().isLength({ min: 1, max: 10 }),
  body('horizon').optional().isInt({ min: 1, max: 30 }),
  validateRequest,
  async (req, res) => {
    try {
      const { symbol, horizon = 5 } = req.body;
      const result = await pythonBridge.predictPrice(symbol.toUpperCase(), horizon);
      res.json(result);
    } catch (error) {
      logger.error('Error predicting price:', error);
      res.status(500).json({ error: 'Failed to predict price' });
    }
  }
);

router.post('/ai/sentiment',
  authenticateToken,
  body('symbols').isArray().isLength({ min: 1, max: 20 }),
  validateRequest,
  async (req, res) => {
    try {
      const { symbols } = req.body;
      const result = await pythonBridge.analyzeSentiment(symbols);
      res.json(result);
    } catch (error) {
      logger.error('Error analyzing sentiment:', error);
      res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
  }
);

// Backtesting routes
router.post('/backtest/run',
  authenticateToken,
  body('strategy').isString(),
  body('symbols').isArray().isLength({ min: 1, max: 10 }),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  validateRequest,
  async (req, res) => {
    try {
      const { strategy, symbols, start_date, end_date } = req.body;
      const result = await pythonBridge.runBacktest(strategy, symbols, start_date, end_date);
      res.json(result);
    } catch (error) {
      logger.error('Error running backtest:', error);
      res.status(500).json({ error: 'Failed to run backtest' });
    }
  }
);

router.get('/backtest/results/:id',
  authenticateToken,
  param('id').isString(),
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pythonBridge.getBacktestResults(id);
      res.json(result);
    } catch (error) {
      logger.error('Error getting backtest results:', error);
      res.status(500).json({ error: 'Failed to get backtest results' });
    }
  }
);

// Health check
router.get('/health',
  async (req, res) => {
    try {
      const result = await pythonBridge.healthCheck();
      res.json(result);
    } catch (error) {
      res.status(500).json({ status: 'unhealthy', error: error.message });
    }
  }
);

export default router;
