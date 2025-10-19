import express from 'express';
import { body, query, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { FinancialDataService } from '../services/FinancialDataService';
import { MarketData } from '../models/MarketData';
import { NewsArticle } from '../models/NewsArticle';
import { logger } from '../config/logger';
import { IApiResponse } from '../types';

const router = express.Router();
const financialDataService = new FinancialDataService();

// Validation middleware
const validateSymbol = [
  param('symbol').isString().isLength({ min: 1, max: 10 }).withMessage('Invalid symbol'),
];

const validateQuoteQuery = [
  query('source').optional().isIn(['alpha_vantage', 'finnhub']).withMessage('Invalid source'),
];

const validateHistoricalQuery = [
  query('interval').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid interval'),
  query('period').optional().isIn(['compact', 'full']).withMessage('Invalid period'),
];

const validateBatchQuotes = [
  body('symbols')
    .isArray({ min: 1, max: 50 })
    .withMessage('Symbols must be an array with 1-50 items'),
  body('symbols.*').isString().isLength({ min: 1, max: 10 }).withMessage('Invalid symbol format'),
];

const validateSearch = [
  query('q').isString().isLength({ min: 1, max: 100 }).withMessage('Query must be 1-100 characters'),
];

const validateNewsQuery = [
  query('symbols').optional().isString().withMessage('Symbols must be a string'),
  query('category').optional().isIn(['general', 'earnings', 'merger', 'ipo', 'analyst', 'regulatory', 'economic']).withMessage('Invalid category'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0'),
];

/**
 * @route   GET /api/financial-data/quote/:symbol
 * @desc    Get real-time quote for a symbol
 * @access  Private
 */
router.get('/quote/:symbol', 
  authMiddleware,
  validateSymbol,
  validateQuoteQuery,
  validate,
  async (req: any, res: express.Response) => {
    try {
      const { symbol } = req.params;
      const { source } = req.query;

      const quote = await financialDataService.getQuote(symbol, source);
      
      if (!quote) {
        const response: IApiResponse = {
          success: false,
          message: `Quote not found for symbol ${symbol}`,
          error: 'Quote not available from any data source',
        };
        return res.status(404).json(response);
      }

      const response: IApiResponse = {
        success: true,
        message: 'Quote retrieved successfully',
        data: quote,
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Quote retrieval failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to retrieve quote',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   POST /api/financial-data/quotes/batch
 * @desc    Get quotes for multiple symbols
 * @access  Private
 */
router.post('/quotes/batch',
  authMiddleware,
  validateBatchQuotes,
  validate,
  async (req: any, res: express.Response) => {
    try {
      const { symbols } = req.body;

      const quotes = await financialDataService.getBatchQuotes(symbols);

      const response: IApiResponse = {
        success: true,
        message: `Retrieved ${quotes.length} quotes`,
        data: {
          quotes,
          total: quotes.length,
          requested: symbols.length,
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Batch quotes retrieval failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to retrieve batch quotes',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   GET /api/financial-data/history/:symbol
 * @desc    Get historical data for a symbol
 * @access  Private
 */
router.get('/history/:symbol',
  authMiddleware,
  validateSymbol,
  validateHistoricalQuery,
  validate,
  async (req: any, res: express.Response) => {
    try {
      const { symbol } = req.params;
      const { interval = 'daily', period = 'compact' } = req.query;

      const historicalData = await financialDataService.getHistoricalData(symbol, interval, period);

      if (!historicalData) {
        const response: IApiResponse = {
          success: false,
          message: `Historical data not found for symbol ${symbol}`,
          error: 'Historical data not available from any data source',
        };
        return res.status(404).json(response);
      }

      const response: IApiResponse = {
        success: true,
        message: 'Historical data retrieved successfully',
        data: historicalData,
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Historical data retrieval failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to retrieve historical data',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   GET /api/financial-data/company/:symbol
 * @desc    Get company information for a symbol
 * @access  Private
 */
router.get('/company/:symbol',
  authMiddleware,
  validateSymbol,
  validate,
  async (req: any, res: express.Response) => {
    try {
      const { symbol } = req.params;

      const companyInfo = await financialDataService.getCompanyInfo(symbol);

      if (!companyInfo) {
        const response: IApiResponse = {
          success: false,
          message: `Company information not found for symbol ${symbol}`,
          error: 'Company information not available from any data source',
        };
        return res.status(404).json(response);
      }

      const response: IApiResponse = {
        success: true,
        message: 'Company information retrieved successfully',
        data: companyInfo,
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Company info retrieval failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to retrieve company information',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   GET /api/financial-data/search
 * @desc    Search for symbols
 * @access  Private
 */
router.get('/search',
  authMiddleware,
  validateSearch,
  validate,
  async (req: any, res: express.Response) => {
    try {
      const { q: query } = req.query;

      const results = await financialDataService.searchSymbols(query);

      const response: IApiResponse = {
        success: true,
        message: `Found ${results.length} results`,
        data: {
          results,
          query,
          total: results.length,
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Symbol search failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to search symbols',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   GET /api/financial-data/news
 * @desc    Get financial news
 * @access  Private
 */
router.get('/news',
  authMiddleware,
  validateNewsQuery,
  validate,
  async (req: any, res: express.Response) => {
    try {
      const { 
        symbols, 
        category, 
        limit = 20, 
        offset = 0 
      } = req.query;

      let query: any = {};

      if (symbols) {
        const symbolArray = symbols.split(',').map((s: string) => s.trim().toUpperCase());
        query.symbols = { $in: symbolArray };
      }

      if (category) {
        query.category = category;
      }

      const news = await NewsArticle.find(query)
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean();

      const total = await NewsArticle.countDocuments(query);

      const response: IApiResponse = {
        success: true,
        message: `Retrieved ${news.length} news articles`,
        data: {
          articles: news,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('News retrieval failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to retrieve news',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   GET /api/financial-data/market-overview
 * @desc    Get market overview data
 * @access  Private
 */
router.get('/market-overview',
  authMiddleware,
  async (req: any, res: express.Response) => {
    try {
      // Get top gainers, losers, and most active stocks
      const [topGainers, topLosers, mostActive] = await Promise.all([
        MarketData.find({ changePercentage: { $gt: 0 } })
          .sort({ changePercentage: -1 })
          .limit(10)
          .lean(),
        MarketData.find({ changePercentage: { $lt: 0 } })
          .sort({ changePercentage: 1 })
          .limit(10)
          .lean(),
        MarketData.find({})
          .sort({ volume: -1 })
          .limit(10)
          .lean(),
      ]);

      const response: IApiResponse = {
        success: true,
        message: 'Market overview retrieved successfully',
        data: {
          topGainers,
          topLosers,
          mostActive,
          lastUpdated: new Date(),
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Market overview retrieval failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to retrieve market overview',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   POST /api/financial-data/realtime/subscribe
 * @desc    Subscribe to real-time data for symbols
 * @access  Private
 */
router.post('/realtime/subscribe',
  authMiddleware,
  validateBatchQuotes,
  validate,
  async (req: any, res: express.Response) => {
    try {
      const { symbols } = req.body;

      const success = await financialDataService.enableRealTimeData(symbols);

      if (!success) {
        const response: IApiResponse = {
          success: false,
          message: 'Failed to enable real-time data',
          error: 'Real-time data service not available',
        };
        return res.status(503).json(response);
      }

      const response: IApiResponse = {
        success: true,
        message: `Subscribed to real-time data for ${symbols.length} symbols`,
        data: {
          symbols,
          subscribedAt: new Date(),
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Real-time subscription failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to subscribe to real-time data',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   POST /api/financial-data/realtime/unsubscribe
 * @desc    Unsubscribe from real-time data
 * @access  Private
 */
router.post('/realtime/unsubscribe',
  authMiddleware,
  async (req: any, res: express.Response) => {
    try {
      await financialDataService.disableRealTimeData();

      const response: IApiResponse = {
        success: true,
        message: 'Unsubscribed from real-time data',
        data: {
          unsubscribedAt: new Date(),
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Real-time unsubscription failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to unsubscribe from real-time data',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

/**
 * @route   GET /api/financial-data/service-status
 * @desc    Get financial data service status
 * @access  Private (Admin only)
 */
router.get('/service-status',
  authMiddleware,
  async (req: any, res: express.Response) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        const response: IApiResponse = {
          success: false,
          message: 'Access denied',
          error: 'Admin access required',
        };
        return res.status(403).json(response);
      }

      const serviceStatus = financialDataService.getServiceStatus();
      const connections = await financialDataService.validateConnections();

      const response: IApiResponse = {
        success: true,
        message: 'Service status retrieved successfully',
        data: {
          ...serviceStatus,
          connections,
          timestamp: new Date(),
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Service status retrieval failed:', error);
      const response: IApiResponse = {
        success: false,
        message: 'Failed to retrieve service status',
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
);

export default router;
