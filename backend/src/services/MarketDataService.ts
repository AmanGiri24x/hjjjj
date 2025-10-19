import axios from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { Portfolio } from '../models/Portfolio';
import WebSocket from 'ws';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52Week?: number;
  low52Week?: number;
  timestamp: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  symbols: string[];
}

export class MarketDataService extends EventEmitter {
  private wsConnections: Map<string, WebSocket> = new Map();
  private priceCache: Map<string, MarketData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  private readonly POLYGON_API_KEY = process.env.POLYGON_API_KEY || 'demo';

  constructor() {
    super();
    this.startPriceUpdates();
  }

  // Get real-time market data for a symbol
  async getMarketData(symbol: string): Promise<MarketData | null> {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp.getTime() < 60000) { // 1 minute cache
        return cached;
      }

      // Try multiple data sources
      let data = await this.getAlphaVantageData(symbol);
      if (!data) {
        data = await this.getPolygonData(symbol);
      }
      if (!data) {
        data = await this.getFallbackData(symbol);
      }

      if (data) {
        this.priceCache.set(symbol, data);
        this.emit('priceUpdate', data);
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching market data for ${symbol}:`, error);
      return null;
    }
  }

  // Get multiple symbols at once
  async getBatchMarketData(symbols: string[]): Promise<Map<string, MarketData>> {
    const results = new Map<string, MarketData>();
    
    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map(symbol => this.getMarketData(symbol));
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.set(batch[index], result.value);
        }
      });
      
      // Rate limiting delay
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Alpha Vantage API integration
  private async getAlphaVantageData(symbol: string): Promise<MarketData | null> {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.API_KEY
        },
        timeout: 5000
      });

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        return null;
      }

      return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high52Week: parseFloat(quote['03. high']),
        low52Week: parseFloat(quote['04. low']),
        timestamp: new Date()
      };
    } catch (error) {
      logger.warn(`Alpha Vantage API failed for ${symbol}:`, error.message);
      return null;
    }
  }

  // Polygon.io API integration
  private async getPolygonData(symbol: string): Promise<MarketData | null> {
    try {
      const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev`, {
        params: {
          adjusted: 'true',
          apikey: this.POLYGON_API_KEY
        },
        timeout: 5000
      });

      const result = response.data.results?.[0];
      if (!result) {
        return null;
      }

      return {
        symbol: symbol.toUpperCase(),
        price: result.c,
        change: result.c - result.o,
        changePercent: ((result.c - result.o) / result.o) * 100,
        volume: result.v,
        timestamp: new Date()
      };
    } catch (error) {
      logger.warn(`Polygon API failed for ${symbol}:`, error.message);
      return null;
    }
  }

  // Fallback with simulated data for demo purposes
  private async getFallbackData(symbol: string): Promise<MarketData | null> {
    // Generate realistic-looking demo data
    const basePrice = this.getBasePriceForSymbol(symbol);
    const volatility = Math.random() * 0.05; // 5% max daily volatility
    const change = (Math.random() - 0.5) * volatility * basePrice;
    
    return {
      symbol: symbol.toUpperCase(),
      price: basePrice + change,
      change: change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: basePrice * Math.floor(Math.random() * 1000000000) + 100000000,
      high52Week: basePrice * (1 + Math.random() * 0.5),
      low52Week: basePrice * (1 - Math.random() * 0.3),
      timestamp: new Date()
    };
  }

  private getBasePriceForSymbol(symbol: string): number {
    // Realistic base prices for common symbols
    const basePrices: Record<string, number> = {
      'AAPL': 175,
      'GOOGL': 140,
      'MSFT': 380,
      'AMZN': 145,
      'TSLA': 250,
      'NVDA': 450,
      'META': 320,
      'NFLX': 400,
      'SPY': 450,
      'QQQ': 380,
      'BTC': 45000,
      'ETH': 2500
    };
    
    return basePrices[symbol.toUpperCase()] || (Math.random() * 200 + 50);
  }

  // Get financial news
  async getFinancialNews(symbols?: string[], limit: number = 20): Promise<NewsItem[]> {
    try {
      // For demo, generate realistic news items
      const newsItems: NewsItem[] = [];
      const sources = ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance'];
      const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
      
      for (let i = 0; i < limit; i++) {
        const symbol = symbols?.[Math.floor(Math.random() * symbols.length)] || 'MARKET';
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        
        newsItems.push({
          id: `news_${Date.now()}_${i}`,
          title: this.generateNewsTitle(symbol, sentiment),
          summary: this.generateNewsSummary(symbol, sentiment),
          url: `https://example.com/news/${Date.now()}_${i}`,
          source: sources[Math.floor(Math.random() * sources.length)],
          publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          sentiment,
          symbols: symbols || [symbol]
        });
      }
      
      return newsItems.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    } catch (error) {
      logger.error('Error fetching financial news:', error);
      return [];
    }
  }

  private generateNewsTitle(symbol: string, sentiment: string): string {
    const titles = {
      positive: [
        `${symbol} Surges on Strong Quarterly Earnings`,
        `Analysts Upgrade ${symbol} Price Target`,
        `${symbol} Announces Strategic Partnership`,
        `${symbol} Reports Record Revenue Growth`
      ],
      negative: [
        `${symbol} Falls on Disappointing Guidance`,
        `Regulatory Concerns Weigh on ${symbol}`,
        `${symbol} Faces Supply Chain Challenges`,
        `Analysts Downgrade ${symbol} Rating`
      ],
      neutral: [
        `${symbol} Trading Update: Market Analysis`,
        `${symbol} Maintains Steady Performance`,
        `Technical Analysis: ${symbol} Key Levels`,
        `${symbol} Sector Overview and Outlook`
      ]
    };
    
    const categoryTitles = titles[sentiment as keyof typeof titles];
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  private generateNewsSummary(symbol: string, sentiment: string): string {
    const summaries = {
      positive: `${symbol} shows strong momentum with positive market indicators and investor confidence remaining high.`,
      negative: `${symbol} faces headwinds as market conditions and company-specific factors create uncertainty.`,
      neutral: `${symbol} maintains stable trading patterns with mixed signals from technical and fundamental analysis.`
    };
    
    return summaries[sentiment as keyof typeof summaries];
  }

  // Start periodic price updates
  private startPriceUpdates(): void {
    this.updateInterval = setInterval(async () => {
      try {
        // Update prices for all cached symbols
        const symbols = Array.from(this.priceCache.keys());
        if (symbols.length > 0) {
          const updates = await this.getBatchMarketData(symbols);
          updates.forEach((data, symbol) => {
            this.emit('priceUpdate', data);
          });
        }
      } catch (error) {
        logger.error('Error in periodic price update:', error);
      }
    }, 60000); // Update every minute
  }

  // Update portfolio prices
  async updatePortfolioPrices(portfolioId: string): Promise<void> {
    try {
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const symbols = portfolio.holdings.map(holding => holding.symbol);
      const priceData = await this.getBatchMarketData(symbols);
      
      const priceMap: Record<string, number> = {};
      priceData.forEach((data, symbol) => {
        priceMap[symbol] = data.price;
      });

      await portfolio.updateHoldingPrices(priceMap);
      await portfolio.save();

      this.emit('portfolioUpdated', {
        portfolioId,
        totalValue: portfolio.totalValue,
        totalReturn: portfolio.totalReturn,
        totalReturnPercentage: portfolio.totalReturnPercentage
      });
    } catch (error) {
      logger.error(`Error updating portfolio prices for ${portfolioId}:`, error);
      throw error;
    }
  }

  // Get market indices
  async getMarketIndices(): Promise<MarketData[]> {
    const indices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI'];
    const results = await this.getBatchMarketData(indices);
    return Array.from(results.values());
  }

  // Get crypto prices
  async getCryptoPrices(): Promise<MarketData[]> {
    const cryptos = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK'];
    const results = await this.getBatchMarketData(cryptos);
    return Array.from(results.values());
  }

  // Subscribe to real-time updates for a symbol
  subscribeToSymbol(symbol: string, callback: (data: MarketData) => void): void {
    this.on('priceUpdate', (data: MarketData) => {
      if (data.symbol === symbol.toUpperCase()) {
        callback(data);
      }
    });
  }

  // Cleanup
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    
    this.removeAllListeners();
  }
}

export default new MarketDataService();
