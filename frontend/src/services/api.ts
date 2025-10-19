/**
 * API service to connect frontend with Python backend services
 */

const PYTHON_API_BASE = 'http://localhost:8001';

export class ApiService {
  private static async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${PYTHON_API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Market Data
  static async getQuote(symbol: string) {
    return this.request(`/api/v1/market/quote/${symbol}`);
  }

  static async getBatchQuotes(symbols: string[]) {
    return this.request('/api/v1/market/batch-quotes', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
    });
  }

  static async getHistoricalData(symbol: string, period = '1y') {
    return this.request(`/api/v1/market/historical/${symbol}?period=${period}`);
  }

  // Portfolio Optimization
  static async optimizePortfolio(symbols: string[], objective = 'max_sharpe') {
    return this.request('/api/v1/portfolio/optimize', {
      method: 'POST',
      body: JSON.stringify({
        symbols,
        objective,
        risk_tolerance: 0.5,
      }),
    });
  }

  // AI Trading Signals
  static async getTradingSignals(symbols: string[], strategy = 'momentum') {
    return this.request('/api/v1/ai/generate-signals', {
      method: 'POST',
      body: JSON.stringify({
        symbols,
        strategy_type: strategy,
      }),
    });
  }

  // Risk Management
  static async calculateVaR(portfolio: any, confidenceLevel = 0.95) {
    return this.request('/api/v1/risk/calculate-var', {
      method: 'POST',
      body: JSON.stringify({
        portfolio,
        confidence_level: confidenceLevel,
      }),
    });
  }

  // Health Check
  static async healthCheck() {
    return this.request('/health');
  }
}

export default ApiService;
