/**
 * Bridge service to connect Node.js backend with Python AI services
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface PythonServiceConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export class PythonServiceBridge {
  private client: AxiosInstance;
  private config: PythonServiceConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.PYTHON_SERVICES_URL || 'http://localhost:8001',
      timeout: 30000,
      retries: 3
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      // Add any auth headers if needed
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Python service error:', error.message);
        throw error;
      }
    );
  }

  async getMarketQuote(symbol: string) {
    try {
      const response = await this.client.get(`/api/v1/market/quote/${symbol}`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting quote for ${symbol}:`, error);
      throw error;
    }
  }

  async getBatchQuotes(symbols: string[]) {
    try {
      const response = await this.client.post('/api/v1/market/batch-quotes', {
        symbols
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting batch quotes:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, period: string = '1y', interval: string = '1d') {
    try {
      const response = await this.client.get(`/api/v1/market/historical/${symbol}`, {
        params: { period, interval }
      });
      return response.data;
    } catch (error) {
      logger.error(`Error getting historical data for ${symbol}:`, error);
      throw error;
    }
  }

  async optimizePortfolio(portfolioData: any) {
    try {
      const response = await this.client.post('/api/v1/portfolio/optimize', portfolioData);
      return response.data;
    } catch (error) {
      logger.error('Error optimizing portfolio:', error);
      throw error;
    }
  }

  async calculateEfficientFrontier(symbols: string[], numPortfolios: number = 100) {
    try {
      const response = await this.client.post('/api/v1/portfolio/efficient-frontier', {
        symbols,
        num_portfolios: numPortfolios,
        risk_free_rate: 0.02
      });
      return response.data;
    } catch (error) {
      logger.error('Error calculating efficient frontier:', error);
      throw error;
    }
  }

  async calculateVaR(portfolio: any, confidenceLevel: number = 0.95) {
    try {
      const response = await this.client.post('/api/v1/risk/calculate-var', {
        portfolio,
        confidence_level: confidenceLevel,
        time_horizon: 1,
        method: 'historical'
      });
      return response.data;
    } catch (error) {
      logger.error('Error calculating VaR:', error);
      throw error;
    }
  }

  async stressTestPortfolio(portfolio: any, scenarios: any[] = []) {
    try {
      const response = await this.client.post('/api/v1/risk/stress-test', {
        portfolio,
        scenarios,
        shock_magnitude: 0.2
      });
      return response.data;
    } catch (error) {
      logger.error('Error performing stress test:', error);
      throw error;
    }
  }

  async generateTradingSignals(symbols: string[], strategyType: string = 'momentum') {
    try {
      const response = await this.client.post('/api/v1/ai/generate-signals', {
        symbols,
        timeframe: '1d',
        strategy_type: strategyType,
        risk_level: 0.5
      });
      return response.data;
    } catch (error) {
      logger.error('Error generating trading signals:', error);
      throw error;
    }
  }

  async predictPrice(symbol: string, horizon: number = 5) {
    try {
      const response = await this.client.post('/api/v1/ai/predict-price', {
        symbol,
        horizon,
        model_type: 'lstm',
        features: []
      });
      return response.data;
    } catch (error) {
      logger.error(`Error predicting price for ${symbol}:`, error);
      throw error;
    }
  }

  async analyzeSentiment(symbols: string[]) {
    try {
      const response = await this.client.post('/api/v1/ai/sentiment-analysis', {
        symbols,
        sources: ['news'],
        timeframe: '1d'
      });
      return response.data;
    } catch (error) {
      logger.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async runBacktest(strategy: string, symbols: string[], startDate: string, endDate: string) {
    try {
      const response = await this.client.post('/api/v1/backtest/run', {
        strategy,
        symbols,
        start_date: startDate,
        end_date: endDate,
        initial_capital: 100000,
        parameters: {}
      });
      return response.data;
    } catch (error) {
      logger.error('Error running backtest:', error);
      throw error;
    }
  }

  async getBacktestResults(backtestId: string) {
    try {
      const response = await this.client.get(`/api/v1/backtest/results/${backtestId}`);
      return response.data;
    } catch (error) {
      logger.error('Error getting backtest results:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      logger.error('Python services health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Utility method to check if Python services are available
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }
}

export default PythonServiceBridge;
