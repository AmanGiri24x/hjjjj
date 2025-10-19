import { Router } from 'express';
import { body, param, query } from 'express-validator';
import MarketDataController from '../controllers/MarketDataController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

// Get market data for a single symbol
router.get('/quote/:symbol', 
  param('symbol').isString().isLength({ min: 1, max: 10 }).withMessage('Valid symbol required'),
  validate,
  MarketDataController.getMarketData
);

// Get market data for multiple symbols
router.post('/batch',
  body('symbols').isArray({ min: 1, max: 50 }).withMessage('Symbols array required (1-50 symbols)'),
  body('symbols.*').isString().isLength({ min: 1, max: 10 }).withMessage('Each symbol must be valid'),
  validate,
  MarketDataController.getBatchMarketData
);

// Get market indices
router.get('/indices', MarketDataController.getMarketIndices);

// Get cryptocurrency prices
router.get('/crypto', MarketDataController.getCryptoPrices);

// Get financial news
router.get('/news',
  query('symbols').optional().isString().withMessage('Symbols must be comma-separated string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  validate,
  MarketDataController.getFinancialNews
);

// Search symbols
router.get('/search',
  query('query').isString().isLength({ min: 1, max: 50 }).withMessage('Search query required'),
  validate,
  MarketDataController.searchSymbols
);

// Update portfolio prices
router.post('/portfolio/:portfolioId/update-prices',
  param('portfolioId').isMongoId().withMessage('Valid portfolio ID required'),
  validate,
  MarketDataController.updatePortfolioPrices
);

export default router;
