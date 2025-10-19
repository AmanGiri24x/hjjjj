import { AlphaVantageClient } from './api/AlphaVantageClient';
import { FinnhubClient } from './api/FinnhubClient';
import { MarketData } from '../models/MarketData';
import { NewsArticle } from '../models/NewsArticle';
import { logger } from '../config/logger';
import { EventEmitter } from 'events';
import cron from 'node-cron';

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  timestamp: Date;
  source: 'alpha_vantage' | 'finnhub';
}

export interface HistoricalData {
  symbol: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  source: string;
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  description?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  country?: string;
  currency?: string;
  exchange?: string;
  website?: string;
}

export class FinancialDataService extends EventEmitter {
  private alphaVantageClient?: AlphaVantageClient;
  private finnhubClient?: FinnhubClient;
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private isRealTimeEnabled = false;

  constructor() {
    super();
    this.initializeClients();
    this.setupCronJobs();
  }

  private initializeClients(): void {
    try {
      // Initialize Alpha Vantage client
      const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (alphaVantageKey && alphaVantageKey !== 'demo') {
        this.alphaVantageClient = new AlphaVantageClient(alphaVantageKey);
        logger.info('Alpha Vantage client initialized');
      } else {
        logger.warn('Alpha Vantage API key not found or is demo');
      }

      // Initialize Finnhub client
      const finnhubKey = process.env.FINNHUB_API_KEY;
      if (finnhubKey && finnhubKey !== 'demo') {
        this.finnhubClient = new FinnhubClient(finnhubKey);
        logger.info('Finnhub client initialized');
      } else {
        logger.warn('Finnhub API key not found or is demo');
      }

    } catch (error) {
      logger.error('Failed to initialize API clients:', error);
    }
  }

  private setupCronJobs(): void {
    // Update market data every 5 minutes during market hours (9:30 AM - 4:00 PM EST, Mon-Fri)
    cron.schedule('*/5 9-16 * * 1-5', async () => {
      await this.updateMarketData();
    }, {
      timezone: 'America/New_York'
    });

    // Update news every hour
    cron.schedule('0 * * * *', async () => {
      await this.updateNews();
    });

    // Weekly cleanup of old data
    cron.schedule('0 2 * * 0', async () => {
      await this.cleanupOldData();
    });
  }

  public async validateConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    if (this.alphaVantageClient) {
      try {
        results.alphaVantage = await this.alphaVantageClient.validateConnection();
      } catch (error) {
        logger.error('Alpha Vantage validation failed:', error);
        results.alphaVantage = false;
      }
    }

    if (this.finnhubClient) {
      try {
        results.finnhub = await this.finnhubClient.validateConnection();
      } catch (error) {
        logger.error('Finnhub validation failed:', error);
        results.finnhub = false;
      }
    }

    return results;
  }

  public async getQuote(symbol: string, preferredSource?: 'alpha_vantage' | 'finnhub'): Promise<QuoteData | null> {
    const sources = this.getPrioritizedSources(preferredSource);

    for (const source of sources) {
      try {
        const data = await this.getQuoteFromSource(symbol, source);
        if (data) {
          // Update database with latest quote
          await this.updateMarketDataInDb(symbol, data);
          return data;
        }
      } catch (error) {
        logger.warn(`Failed to get quote from ${source} for ${symbol}:`, error);
        continue;
      }
    }

    logger.error(`Failed to get quote for ${symbol} from all sources`);
    return null;
  }

  public async getBatchQuotes(symbols: string[]): Promise<QuoteData[]> {
    const results: QuoteData[] = [];
    const batchSize = 10; // Process in batches to avoid rate limits

    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => this.getQuote(symbol));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else {
            logger.warn(`Failed to get quote for ${batch[index]}`);
          }
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error('Batch quote request failed:', error);
      }
    }

    return results;
  }

  public async getHistoricalData(
    symbol: string,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily',
    period: 'compact' | 'full' = 'compact'
  ): Promise<HistoricalData | null> {
    // Try Alpha Vantage first for historical data
    if (this.alphaVantageClient) {
      try {
        const response = await this.alphaVantageClient.getTimeSeries(symbol, interval, period);
        if (response.success && response.data) {
          const parsedData = this.alphaVantageClient.parseTimeSeriesData(response.data);
          return {
            symbol,
            data: parsedData,
            source: 'alpha_vantage',
          };
        }
      } catch (error) {
        logger.warn(`Alpha Vantage historical data failed for ${symbol}:`, error);
      }
    }

    // Fallback to Finnhub
    if (this.finnhubClient) {
      try {
        const to = Math.floor(Date.now() / 1000);
        const from = to - (period === 'full' ? 365 * 24 * 60 * 60 : 90 * 24 * 60 * 60);
        const resolution = interval === 'daily' ? 'D' : interval === 'weekly' ? 'W' : 'M';
        
        const response = await this.finnhubClient.getCandles(symbol, resolution, from, to);
        if (response.success && response.data) {
          const parsedData = this.finnhubClient.parseCandleData(response.data);
          return {
            symbol,
            data: parsedData.map(item => ({
              date: new Date((item.timestamp || 0) * 1000).toISOString().split('T')[0],
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
              volume: item.volume,
            })),
            source: 'finnhub',
          };
        }
      } catch (error) {
        logger.warn(`Finnhub historical data failed for ${symbol}:`, error);
      }
    }

    return null;
  }

  public async getCompanyInfo(symbol: string): Promise<CompanyInfo | null> {
    // Try Finnhub first for company profile
    if (this.finnhubClient) {
      try {
        const response = await this.finnhubClient.getCompanyProfile(symbol);
        if (response.success && response.data) {
          const profile = response.data;
          return {
            symbol,
            name: profile.name,
            description: '', // Finnhub doesn't provide description in profile
            sector: profile.finnhubIndustry,
            marketCap: profile.marketCapitalization,
            country: profile.country,
            currency: profile.currency,
            exchange: profile.exchange,
            website: profile.weburl,
          };
        }
      } catch (error) {
        logger.warn(`Finnhub company info failed for ${symbol}:`, error);
      }
    }

    // Fallback to Alpha Vantage
    if (this.alphaVantageClient) {
      try {
        const response = await this.alphaVantageClient.getCompanyOverview(symbol);
        if (response.success && response.data) {
          const overview = response.data;
          return {
            symbol,
            name: overview.Name,
            description: overview.Description,
            sector: overview.Sector,
            industry: overview.Industry,
            marketCap: parseFloat(overview.MarketCapitalization) || undefined,
            country: overview.Country,
            currency: overview.Currency,
            exchange: overview.Exchange,
          };
        }
      } catch (error) {
        logger.warn(`Alpha Vantage company info failed for ${symbol}:`, error);
      }
    }

    return null;
  }

  public async searchSymbols(query: string): Promise<any[]> {
    if (this.alphaVantageClient) {
      try {
        const response = await this.alphaVantageClient.searchSymbol(query);
        if (response.success && response.data?.bestMatches) {
          return response.data.bestMatches.map((match: any) => ({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'],
            region: match['4. region'],
            currency: match['8. currency'],
            matchScore: parseFloat(match['9. matchScore']),
            source: 'alpha_vantage',
          }));
        }
      } catch (error) {
        logger.error(`Symbol search failed for ${query}:`, error);
      }
    }

    return [];
  }

  public async enableRealTimeData(symbols: string[]): Promise<boolean> {
    if (!this.finnhubClient) {
      logger.warn('Real-time data not available: Finnhub client not initialized');
      return false;
    }

    try {
      await this.finnhubClient.connectWebSocket();
      
      // Subscribe to symbols
      symbols.forEach(symbol => {
        this.finnhubClient!.subscribeToSymbol(symbol);
      });

      // Set up event handlers
      this.finnhubClient.onPriceUpdate((data) => {
        this.emit('priceUpdate', data);
        this.handleRealTimePriceUpdate(data);
      });

      this.finnhubClient.onTrade((data) => {
        this.emit('trade', data);
      });

      this.isRealTimeEnabled = true;
      logger.info(`Real-time data enabled for ${symbols.length} symbols`);
      return true;
    } catch (error) {
      logger.error('Failed to enable real-time data:', error);
      return false;
    }
  }

  public async disableRealTimeData(): Promise<void> {
    if (this.finnhubClient) {
      this.finnhubClient.disconnectWebSocket();
    }
    this.isRealTimeEnabled = false;
    logger.info('Real-time data disabled');
  }

  private async getQuoteFromSource(symbol: string, source: 'alpha_vantage' | 'finnhub'): Promise<QuoteData | null> {
    if (source === 'alpha_vantage' && this.alphaVantageClient) {
      const response = await this.alphaVantageClient.getQuote(symbol);
      if (response.success && response.data) {
        const parsed = this.alphaVantageClient.parseQuoteData(response.data);
        return {
          symbol: parsed.symbol,
          price: parsed.price,
          change: parsed.change,
          changePercent: parsed.changePercent,
          high: parsed.high,
          low: parsed.low,
          open: parsed.open,
          previousClose: parsed.previousClose,
          volume: parsed.volume,
          timestamp: new Date(),
          source: 'alpha_vantage',
        };
      }
    }

    if (source === 'finnhub' && this.finnhubClient) {
      const response = await this.finnhubClient.getQuote(symbol);
      if (response.success && response.data) {
        const parsed = this.finnhubClient.parseQuoteData(response.data);
        return {
          symbol,
          price: parsed.price,
          change: parsed.change,
          changePercent: parsed.changePercent,
          high: parsed.high,
          low: parsed.low,
          open: parsed.open,
          previousClose: parsed.previousClose,
          volume: 0, // Finnhub doesn't provide volume in quote
          timestamp: new Date(parsed.timestamp * 1000),
          source: 'finnhub',
        };
      }
    }

    return null;
  }

  private getPrioritizedSources(preferredSource?: 'alpha_vantage' | 'finnhub'): ('alpha_vantage' | 'finnhub')[] {
    const sources: ('alpha_vantage' | 'finnhub')[] = [];
    
    if (preferredSource && this.getClient(preferredSource)) {
      sources.push(preferredSource);
    }

    // Add remaining sources based on availability and reliability
    if (this.finnhubClient && !sources.includes('finnhub')) {
      sources.push('finnhub');
    }
    
    if (this.alphaVantageClient && !sources.includes('alpha_vantage')) {
      sources.push('alpha_vantage');
    }

    return sources;
  }

  private getClient(source: 'alpha_vantage' | 'finnhub') {
    return source === 'alpha_vantage' ? this.alphaVantageClient : this.finnhubClient;
  }

  private async updateMarketDataInDb(symbol: string, quoteData: QuoteData): Promise<void> {
    try {
      await MarketData.findOneAndUpdate(
        { symbol },
        {
          symbol: quoteData.symbol,
          price: quoteData.price,
          previousClose: quoteData.previousClose,
          change: quoteData.change,
          changePercentage: quoteData.changePercent,
          volume: quoteData.volume,
          timestamp: quoteData.timestamp,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error(`Failed to update market data for ${symbol}:`, error);
    }
  }

  private async handleRealTimePriceUpdate(data: any): Promise<void> {
    try {
      await MarketData.findOneAndUpdate(
        { symbol: data.symbol },
        {
          price: data.price,
          timestamp: new Date(data.timestamp),
        },
        { upsert: true }
      );

      logger.debug(`Updated real-time price for ${data.symbol}: $${data.price}`);
    } catch (error) {
      logger.error(`Failed to handle real-time price update for ${data.symbol}:`, error);
    }
  }

  private async updateMarketData(): Promise<void> {
    try {
      // Get all unique symbols from portfolios and watchlists
      const symbols = await this.getActiveSymbols();
      
      if (symbols.length > 0) {
        logger.info(`Updating market data for ${symbols.length} symbols`);
        await this.getBatchQuotes(symbols);
      }
    } catch (error) {
      logger.error('Failed to update market data:', error);
    }
  }

  private async updateNews(): Promise<void> {
    try {
      if (this.finnhubClient) {
        const response = await this.finnhubClient.getMarketNews();
        if (response.success && response.data) {
          const articles = response.data.slice(0, 50); // Limit to 50 most recent
          
          for (const article of articles) {
            try {
              await NewsArticle.findOneAndUpdate(
                { url: article.url },
                {
                  title: article.headline,
                  summary: article.summary,
                  author: article.source,
                  source: article.source,
                  url: article.url,
                  imageUrl: article.image,
                  publishedAt: new Date(article.datetime * 1000),
                  symbols: article.related ? article.related.split(',') : [],
                  category: article.category,
                  sentiment: 'neutral', // Default, can be analyzed later
                  relevanceScore: 1.0,
                },
                { upsert: true }
              );
            } catch (error) {
              logger.warn(`Failed to save article: ${article.headline}`, error);
            }
          }
          
          logger.info(`Updated ${articles.length} news articles`);
        }
      }
    } catch (error) {
      logger.error('Failed to update news:', error);
    }
  }

  private async getActiveSymbols(): Promise<string[]> {
    try {
      const marketDataSymbols = await MarketData.distinct('symbol');
      return marketDataSymbols;
    } catch (error) {
      logger.error('Failed to get active symbols:', error);
      return [];
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

      const result = await NewsArticle.deleteMany({
        publishedAt: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} old news articles`);
    } catch (error) {
      logger.error('Failed to cleanup old data:', error);
    }
  }

  public getServiceStatus(): any {
    return {
      alphaVantage: {
        available: !!this.alphaVantageClient,
        rateLimitStatus: this.alphaVantageClient?.getRateLimitStatus(),
      },
      finnhub: {
        available: !!this.finnhubClient,
        rateLimitStatus: this.finnhubClient?.getRateLimitStatus(),
        websocketStatus: this.finnhubClient?.getWebSocketStatus(),
      },
      realTimeEnabled: this.isRealTimeEnabled,
    };
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down Financial Data Service...');
    
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }

    await this.disableRealTimeData();
    
    logger.info('Financial Data Service shutdown complete');
  }
}
