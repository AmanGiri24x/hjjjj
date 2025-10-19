import { BaseApiClient, ApiClientConfig, ApiResponse } from './BaseApiClient';
import { logger } from '../../config/logger';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string;   // Status
  t: number[]; // Timestamps
  v: number[]; // Volume
}

export interface FinnhubSymbol {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  mic: string;
  symbol: string;
  type: string;
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubBasicFinancials {
  series: {
    annual: { [key: string]: Array<{ period: string; v: number }> };
    quarterly: { [key: string]: Array<{ period: string; v: number }> };
  };
  metric: { [key: string]: number };
  metricType: string;
  symbol: string;
}

export interface FinnhubRecommendation {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}

export interface FinnhubEarnings {
  actual: number;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
}

export class FinnhubClient extends BaseApiClient {
  private wsClient?: WebSocket;
  private wsEventEmitter: EventEmitter;
  private subscribedSymbols: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(apiKey: string) {
    const config: ApiClientConfig = {
      baseURL: 'https://finnhub.io/api/v1',
      apiKey,
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      rateLimit: {
        requestsPerMinute: 60, // Finnhub free tier limit
        requestsPerDay: 1000,
      },
    };

    super(config);
    this.wsEventEmitter = new EventEmitter();

    // Add API key as header
    this.client.interceptors.request.use((config) => {
      config.headers['X-Finnhub-Token'] = this.config.apiKey;
      return config;
    });
  }

  public async validateConnection(): Promise<boolean> {
    try {
      const response = await this.getQuote('AAPL');
      return response.success && !!response.data?.c;
    } catch (error) {
      logger.error('Finnhub connection validation failed:', error);
      return false;
    }
  }

  public async getQuote(symbol: string): Promise<ApiResponse<FinnhubQuote>> {
    return this.makeRequest<FinnhubQuote>('/quote', {
      params: {
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async getBatchQuotes(symbols: string[]): Promise<ApiResponse<any>> {
    const results = [];
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        if (quote.success) {
          results.push({
            symbol,
            data: quote.data,
          });
        }
      } catch (error) {
        logger.error(`Failed to get quote for ${symbol}:`, error);
        results.push({
          symbol,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      data: results,
    };
  }

  public async getCandles(
    symbol: string,
    resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
    from: number,
    to: number
  ): Promise<ApiResponse<FinnhubCandle>> {
    return this.makeRequest<FinnhubCandle>('/stock/candle', {
      params: {
        symbol: symbol.toUpperCase(),
        resolution,
        from,
        to,
      },
    });
  }

  public async getSymbols(exchange: string): Promise<ApiResponse<FinnhubSymbol[]>> {
    return this.makeRequest<FinnhubSymbol[]>('/stock/symbol', {
      params: {
        exchange: exchange.toUpperCase(),
      },
    });
  }

  public async getCompanyProfile(symbol: string): Promise<ApiResponse<FinnhubCompanyProfile>> {
    return this.makeRequest<FinnhubCompanyProfile>('/stock/profile2', {
      params: {
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async getCompanyNews(
    symbol: string,
    from: string,
    to: string
  ): Promise<ApiResponse<FinnhubNews[]>> {
    return this.makeRequest<FinnhubNews[]>('/company-news', {
      params: {
        symbol: symbol.toUpperCase(),
        from,
        to,
      },
    });
  }

  public async getMarketNews(
    category: 'general' | 'forex' | 'crypto' | 'merger' = 'general',
    minId?: number
  ): Promise<ApiResponse<FinnhubNews[]>> {
    const params: any = { category };
    if (minId) params.minId = minId;

    return this.makeRequest<FinnhubNews[]>('/news', { params });
  }

  public async getBasicFinancials(symbol: string): Promise<ApiResponse<FinnhubBasicFinancials>> {
    return this.makeRequest<FinnhubBasicFinancials>('/stock/metric', {
      params: {
        symbol: symbol.toUpperCase(),
        metric: 'all',
      },
    });
  }

  public async getRecommendationTrends(symbol: string): Promise<ApiResponse<FinnhubRecommendation[]>> {
    return this.makeRequest<FinnhubRecommendation[]>('/stock/recommendation', {
      params: {
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async getEarnings(symbol: string): Promise<ApiResponse<FinnhubEarnings[]>> {
    return this.makeRequest<FinnhubEarnings[]>('/stock/earnings', {
      params: {
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async getPriceTarget(symbol: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/stock/price-target', {
      params: {
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async getUpgradeDowngrade(
    symbol?: string,
    from?: string,
    to?: string
  ): Promise<ApiResponse<any>> {
    const params: any = {};
    if (symbol) params.symbol = symbol.toUpperCase();
    if (from) params.from = from;
    if (to) params.to = to;

    return this.makeRequest('/stock/upgrade-downgrade', { params });
  }

  public async getInsiderTransactions(
    symbol: string,
    from?: string,
    to?: string
  ): Promise<ApiResponse<any>> {
    const params: any = {
      symbol: symbol.toUpperCase(),
    };
    if (from) params.from = from;
    if (to) params.to = to;

    return this.makeRequest('/stock/insider-transactions', { params });
  }

  public async getInstitutionalOwnership(
    symbol: string,
    limit?: number
  ): Promise<ApiResponse<any>> {
    const params: any = {
      symbol: symbol.toUpperCase(),
    };
    if (limit) params.limit = limit;

    return this.makeRequest('/stock/institutional-ownership', { params });
  }

  public async getStockSplits(
    symbol: string,
    from: string,
    to: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('/stock/split', {
      params: {
        symbol: symbol.toUpperCase(),
        from,
        to,
      },
    });
  }

  public async getDividends(
    symbol: string,
    from: string,
    to: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('/stock/dividend', {
      params: {
        symbol: symbol.toUpperCase(),
        from,
        to,
      },
    });
  }

  // WebSocket Methods for Real-time Data
  public connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wsClient = new WebSocket(`wss://ws.finnhub.io?token=${this.config.apiKey}`);

        this.wsClient.on('open', () => {
          logger.info('Finnhub WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.wsClient.on('message', (data: string) => {
          try {
            const message = JSON.parse(data);
            this.handleWebSocketMessage(message);
          } catch (error) {
            logger.error('Failed to parse WebSocket message:', error);
          }
        });

        this.wsClient.on('close', () => {
          logger.warn('Finnhub WebSocket disconnected');
          this.handleWebSocketReconnect();
        });

        this.wsClient.on('error', (error) => {
          logger.error('Finnhub WebSocket error:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnectWebSocket(): void {
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }
    this.subscribedSymbols.clear();
  }

  public subscribeToSymbol(symbol: string): void {
    if (!this.wsClient || this.wsClient.readyState !== WebSocket.OPEN) {
      logger.warn('WebSocket not connected. Cannot subscribe to symbol:', symbol);
      return;
    }

    const message = JSON.stringify({
      type: 'subscribe',
      symbol: symbol.toUpperCase(),
    });

    this.wsClient.send(message);
    this.subscribedSymbols.add(symbol.toUpperCase());
    logger.info(`Subscribed to ${symbol} real-time updates`);
  }

  public unsubscribeFromSymbol(symbol: string): void {
    if (!this.wsClient || this.wsClient.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = JSON.stringify({
      type: 'unsubscribe',
      symbol: symbol.toUpperCase(),
    });

    this.wsClient.send(message);
    this.subscribedSymbols.delete(symbol.toUpperCase());
    logger.info(`Unsubscribed from ${symbol} real-time updates`);
  }

  public onPriceUpdate(callback: (data: any) => void): void {
    this.wsEventEmitter.on('price-update', callback);
  }

  public onTrade(callback: (data: any) => void): void {
    this.wsEventEmitter.on('trade', callback);
  }

  private handleWebSocketMessage(message: any): void {
    if (message.type === 'trade') {
      const trades = message.data;
      for (const trade of trades) {
        this.wsEventEmitter.emit('trade', {
          symbol: trade.s,
          price: trade.p,
          volume: trade.v,
          timestamp: trade.t,
          conditions: trade.c,
        });

        this.wsEventEmitter.emit('price-update', {
          symbol: trade.s,
          price: trade.p,
          timestamp: trade.t,
        });
      }
    }
  }

  private async handleWebSocketReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max WebSocket reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

    logger.info(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(async () => {
      try {
        await this.connectWebSocket();
        
        // Re-subscribe to all symbols
        for (const symbol of this.subscribedSymbols) {
          this.subscribeToSymbol(symbol);
        }
      } catch (error) {
        logger.error('WebSocket reconnection failed:', error);
        this.handleWebSocketReconnect();
      }
    }, delay);
  }

  // Utility methods for data parsing
  public parseQuoteData(data: FinnhubQuote): any {
    return {
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t,
    };
  }

  public parseCandleData(data: FinnhubCandle): any[] {
    if (data.s !== 'ok' || !data.t || data.t.length === 0) {
      return [];
    }

    return data.t.map((timestamp, index) => ({
      timestamp,
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index],
    }));
  }

  public getWebSocketStatus(): any {
    return {
      connected: this.wsClient?.readyState === WebSocket.OPEN,
      subscribedSymbols: Array.from(this.subscribedSymbols),
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}
