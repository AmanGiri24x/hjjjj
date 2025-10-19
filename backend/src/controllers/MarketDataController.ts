import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import MarketDataService from '../services/MarketDataService';
import { logger } from '../utils/logger';

export class MarketDataController {
  // Get market data for a single symbol
  async getMarketData(req: Request, res: Response): Promise<Response> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({
          success: false,
          message: 'Symbol is required',
          code: 'SYMBOL_REQUIRED'
        });
      }

      const data = await MarketDataService.getMarketData(symbol.toUpperCase());
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Market data not found for symbol',
          code: 'DATA_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Get market data error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch market data',
        code: 'MARKET_DATA_ERROR'
      });
    }
  }

  // Get market data for multiple symbols
  async getBatchMarketData(req: Request, res: Response): Promise<Response> {
    try {
      const { symbols } = req.body;
      
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Symbols array is required',
          code: 'SYMBOLS_REQUIRED'
        });
      }

      if (symbols.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 50 symbols allowed per request',
          code: 'TOO_MANY_SYMBOLS'
        });
      }

      const data = await MarketDataService.getBatchMarketData(symbols);
      const results = Object.fromEntries(data);

      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Get batch market data error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch batch market data',
        code: 'BATCH_DATA_ERROR'
      });
    }
  }

  // Get market indices
  async getMarketIndices(req: Request, res: Response): Promise<Response> {
    try {
      const indices = await MarketDataService.getMarketIndices();

      return res.status(200).json({
        success: true,
        data: indices
      });
    } catch (error) {
      logger.error('Get market indices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch market indices',
        code: 'INDICES_ERROR'
      });
    }
  }

  // Get cryptocurrency prices
  async getCryptoPrices(req: Request, res: Response): Promise<Response> {
    try {
      const cryptos = await MarketDataService.getCryptoPrices();

      return res.status(200).json({
        success: true,
        data: cryptos
      });
    } catch (error) {
      logger.error('Get crypto prices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch crypto prices',
        code: 'CRYPTO_ERROR'
      });
    }
  }

  // Get financial news
  async getFinancialNews(req: Request, res: Response): Promise<Response> {
    try {
      const { symbols, limit = 20 } = req.query;
      
      let symbolsArray: string[] | undefined;
      if (symbols) {
        symbolsArray = typeof symbols === 'string' 
          ? symbols.split(',').map(s => s.trim().toUpperCase())
          : Array.isArray(symbols) 
            ? symbols.map(s => String(s).trim().toUpperCase())
            : undefined;
      }

      const limitNum = Math.min(parseInt(String(limit)) || 20, 100);
      const news = await MarketDataService.getFinancialNews(symbolsArray, limitNum);

      return res.status(200).json({
        success: true,
        data: news
      });
    } catch (error) {
      logger.error('Get financial news error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch financial news',
        code: 'NEWS_ERROR'
      });
    }
  }

  // Update portfolio prices
  async updatePortfolioPrices(req: Request, res: Response): Promise<Response> {
    try {
      const { portfolioId } = req.params;
      const userId = req.user?.userId;

      if (!portfolioId) {
        return res.status(400).json({
          success: false,
          message: 'Portfolio ID is required',
          code: 'PORTFOLIO_ID_REQUIRED'
        });
      }

      await MarketDataService.updatePortfolioPrices(portfolioId);

      return res.status(200).json({
        success: true,
        message: 'Portfolio prices updated successfully'
      });
    } catch (error) {
      logger.error('Update portfolio prices error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to update portfolio prices';
      const statusCode = message.includes('not found') ? 404 : 500;

      return res.status(statusCode).json({
        success: false,
        message,
        code: 'UPDATE_PRICES_ERROR'
      });
    }
  }

  // Search symbols
  async searchSymbols(req: Request, res: Response): Promise<Response> {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
          code: 'QUERY_REQUIRED'
        });
      }

      // For demo purposes, return mock search results
      const mockResults = this.generateMockSearchResults(query);

      return res.status(200).json({
        success: true,
        data: mockResults
      });
    } catch (error) {
      logger.error('Search symbols error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search symbols',
        code: 'SEARCH_ERROR'
      });
    }
  }

  private generateMockSearchResults(query: string) {
    const allSymbols = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', exchange: 'NASDAQ' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', exchange: 'NYSE' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', exchange: 'NASDAQ' },
      { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', exchange: 'CRYPTO' },
      { symbol: 'ETH', name: 'Ethereum', type: 'crypto', exchange: 'CRYPTO' }
    ];

    const searchTerm = query.toLowerCase();
    return allSymbols
      .filter(item => 
        item.symbol.toLowerCase().includes(searchTerm) || 
        item.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);
  }
}

export default new MarketDataController();
