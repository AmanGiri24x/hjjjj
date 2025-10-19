import { BaseApiClient, ApiClientConfig, ApiResponse } from './BaseApiClient';
import { logger } from '../../config/logger';

export interface AlphaVantageQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface AlphaVantageTimeSeries {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

export interface AlphaVantageForexQuote {
  'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': string;
    '2. From_Currency Name': string;
    '3. To_Currency Code': string;
    '4. To_Currency Name': string;
    '5. Exchange Rate': string;
    '6. Last Refreshed': string;
    '7. Time Zone': string;
    '8. Bid Price': string;
    '9. Ask Price': string;
  };
}

export interface AlphaVantageSearchResult {
  bestMatches: Array<{
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }>;
}

export interface AlphaVantageCompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  OfficialSite: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

export class AlphaVantageClient extends BaseApiClient {
  constructor(apiKey: string) {
    const config: ApiClientConfig = {
      baseURL: 'https://www.alphavantage.co',
      apiKey,
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 2000,
      rateLimit: {
        requestsPerMinute: 5, // Alpha Vantage free tier limit
        requestsPerDay: 500,  // Daily limit
      },
    };

    super(config);

    // Add API key to all requests
    this.client.interceptors.request.use((config) => {
      if (config.params) {
        config.params.apikey = this.config.apiKey;
      } else {
        config.params = { apikey: this.config.apiKey };
      }
      return config;
    });
  }

  public async validateConnection(): Promise<boolean> {
    try {
      const response = await this.getQuote('AAPL');
      return response.success;
    } catch (error) {
      logger.error('Alpha Vantage connection validation failed:', error);
      return false;
    }
  }

  public async getQuote(symbol: string): Promise<ApiResponse<AlphaVantageQuote>> {
    return this.makeRequest<AlphaVantageQuote>('/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async getBatchQuotes(symbols: string[]): Promise<ApiResponse<any>> {
    // Alpha Vantage doesn't support batch quotes directly
    // We'll make individual requests for each symbol
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

  public async getTimeSeries(
    symbol: string,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily',
    outputSize: 'compact' | 'full' = 'compact'
  ): Promise<ApiResponse<AlphaVantageTimeSeries>> {
    const functionMap = {
      daily: 'TIME_SERIES_DAILY',
      weekly: 'TIME_SERIES_WEEKLY',
      monthly: 'TIME_SERIES_MONTHLY',
    };

    return this.makeRequest<AlphaVantageTimeSeries>('/query', {
      params: {
        function: functionMap[interval],
        symbol: symbol.toUpperCase(),
        outputsize: outputSize,
      },
    });
  }

  public async getIntradayData(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min',
    outputSize: 'compact' | 'full' = 'compact'
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('/query', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol.toUpperCase(),
        interval,
        outputsize: outputSize,
      },
    });
  }

  public async getForexRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ApiResponse<AlphaVantageForexQuote>> {
    return this.makeRequest<AlphaVantageForexQuote>('/query', {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: fromCurrency.toUpperCase(),
        to_currency: toCurrency.toUpperCase(),
      },
    });
  }

  public async searchSymbol(keywords: string): Promise<ApiResponse<AlphaVantageSearchResult>> {
    return this.makeRequest<AlphaVantageSearchResult>('/query', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords,
      },
    });
  }

  public async getCompanyOverview(symbol: string): Promise<ApiResponse<AlphaVantageCompanyOverview>> {
    return this.makeRequest<AlphaVantageCompanyOverview>('/query', {
      params: {
        function: 'OVERVIEW',
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async getTechnicalIndicator(
    symbol: string,
    indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'STOCH' | 'ADX' | 'CCI' | 'AROON' | 'BBANDS' | 'AD' | 'OBV',
    interval: 'daily' | 'weekly' | 'monthly' = 'daily',
    timePeriod?: number,
    seriesType: 'close' | 'open' | 'high' | 'low' = 'close'
  ): Promise<ApiResponse<any>> {
    const params: any = {
      function: indicator,
      symbol: symbol.toUpperCase(),
      interval,
      series_type: seriesType,
    };

    if (timePeriod) {
      params.time_period = timePeriod;
    }

    return this.makeRequest('/query', { params });
  }

  public async getEconomicIndicator(
    indicator: 'REAL_GDP' | 'REAL_GDP_PER_CAPITA' | 'TREASURY_YIELD' | 'FEDERAL_FUNDS_RATE' | 'CPI' | 'INFLATION' | 'RETAIL_SALES' | 'DURABLES' | 'UNEMPLOYMENT' | 'NONFARM_PAYROLL',
    interval?: 'monthly' | 'quarterly' | 'annual'
  ): Promise<ApiResponse<any>> {
    const params: any = {
      function: indicator,
    };

    if (interval) {
      params.interval = interval;
    }

    return this.makeRequest('/query', { params });
  }

  public async getNews(
    tickers?: string[],
    topics?: string[],
    timeFrom?: string,
    timeTo?: string,
    sort?: 'LATEST' | 'EARLIEST' | 'RELEVANCE',
    limit?: number
  ): Promise<ApiResponse<any>> {
    const params: any = {
      function: 'NEWS_SENTIMENT',
    };

    if (tickers && tickers.length > 0) {
      params.tickers = tickers.join(',');
    }

    if (topics && topics.length > 0) {
      params.topics = topics.join(',');
    }

    if (timeFrom) {
      params.time_from = timeFrom;
    }

    if (timeTo) {
      params.time_to = timeTo;
    }

    if (sort) {
      params.sort = sort;
    }

    if (limit) {
      params.limit = limit;
    }

    return this.makeRequest('/query', { params });
  }

  public async getCryptoQuote(
    symbol: string,
    market: string = 'USD'
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('/query', {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: symbol.toUpperCase(),
        to_currency: market.toUpperCase(),
      },
    });
  }

  public async getCryptoTimeSeries(
    symbol: string,
    market: string = 'USD',
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<ApiResponse<any>> {
    const functionMap = {
      daily: 'DIGITAL_CURRENCY_DAILY',
      weekly: 'DIGITAL_CURRENCY_WEEKLY',
      monthly: 'DIGITAL_CURRENCY_MONTHLY',
    };

    return this.makeRequest('/query', {
      params: {
        function: functionMap[interval],
        symbol: symbol.toUpperCase(),
        market: market.toUpperCase(),
      },
    });
  }

  // Utility methods for data parsing
  public parseQuoteData(data: any): any {
    const quote = data['Global Quote'];
    if (!quote) return null;

    return {
      symbol: quote['01. symbol'],
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      price: parseFloat(quote['05. price']),
      volume: parseInt(quote['06. volume']),
      latestTradingDay: quote['07. latest trading day'],
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    };
  }

  public parseTimeSeriesData(data: any): any[] {
    const timeSeries = data['Time Series (Daily)'] || 
                      data['Weekly Time Series'] || 
                      data['Monthly Time Series'];
    
    if (!timeSeries) return [];

    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }));
  }

  public parseForexData(data: any): any {
    const rate = data['Realtime Currency Exchange Rate'];
    if (!rate) return null;

    return {
      fromCurrency: rate['1. From_Currency Code'],
      fromCurrencyName: rate['2. From_Currency Name'],
      toCurrency: rate['3. To_Currency Code'],
      toCurrencyName: rate['4. To_Currency Name'],
      exchangeRate: parseFloat(rate['5. Exchange Rate']),
      lastRefreshed: rate['6. Last Refreshed'],
      timeZone: rate['7. Time Zone'],
      bidPrice: parseFloat(rate['8. Bid Price']),
      askPrice: parseFloat(rate['9. Ask Price']),
    };
  }
}
