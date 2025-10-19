import { BaseAIService, AIProvider, AICapability, AIRequest, AIResponse } from './BaseAIService';
import { logger } from '../../utils/logger';

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalPattern {
  name: string;
  type: 'reversal' | 'continuation' | 'neutral';
  reliability: number;
  timeframe: string;
  targetPrice?: number;
  stopLoss?: number;
  description: string;
}

export class TechnicalAnalysisService extends BaseAIService {
  constructor() {
    const provider: AIProvider = {
      name: 'TechnicalAnalysis',
      isAvailable: true,
      priority: 2,
      capabilities: [
        AICapability.TREND_ANALYSIS,
        AICapability.PRICE_PREDICTION,
        AICapability.ANOMALY_DETECTION
      ]
    };

    super(provider);
  }

  async isHealthy(): Promise<boolean> {
    return true; // Always available as it's computation-based
  }

  getCapabilities(): AICapability[] {
    return this.provider.capabilities;
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (request.type) {
        case AICapability.TREND_ANALYSIS:
          result = await this.analyzeTrends(request.data);
          break;
        case AICapability.PRICE_PREDICTION:
          result = await this.predictPrice(request.data);
          break;
        case AICapability.ANOMALY_DETECTION:
          result = await this.detectAnomalies(request.data);
          break;
        default:
          throw new Error(`Unsupported capability: ${request.type}`);
      }

      return {
        id: this.generateRequestId(),
        requestId: request.id,
        type: request.type,
        result,
        confidence: result.confidence || 0.75,
        provider: this.provider.name,
        processingTime: Date.now() - startTime,
        metadata: {
          model: 'technical_analysis',
          version: '1.0.0'
        },
        createdAt: new Date()
      };
    } catch (error) {
      logger.error(`Technical analysis failed:`, error);
      throw error;
    }
  }

  private async analyzeTrends(data: {
    prices: PriceData[];
    timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
    indicators?: string[];
  }): Promise<{
    trend: {
      direction: 'bullish' | 'bearish' | 'sideways';
      strength: 'strong' | 'moderate' | 'weak';
      confidence: number;
    };
    indicators: TechnicalIndicator[];
    patterns: TechnicalPattern[];
    support: number[];
    resistance: number[];
    volume: {
      trend: 'increasing' | 'decreasing' | 'stable';
      averageVolume: number;
      volumeRatio: number;
    };
    recommendation: {
      action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
      confidence: number;
      reasoning: string;
    };
  }> {
    const prices = data.prices;
    if (prices.length < 20) {
      throw new Error('Insufficient data for technical analysis (minimum 20 periods required)');
    }

    // Calculate technical indicators
    const indicators = await this.calculateIndicators(prices, data.indicators);
    
    // Detect patterns
    const patterns = await this.detectPatterns(prices);
    
    // Find support and resistance levels
    const supportLevels = this.findSupportLevels(prices);
    const resistanceLevels = this.findResistanceLevels(prices);
    
    // Analyze volume
    const volumeAnalysis = this.analyzeVolume(prices);
    
    // Determine overall trend
    const trendAnalysis = this.determineTrend(prices, indicators);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(
      trendAnalysis,
      indicators,
      patterns,
      volumeAnalysis
    );

    return {
      trend: trendAnalysis,
      indicators,
      patterns,
      support: supportLevels,
      resistance: resistanceLevels,
      volume: volumeAnalysis,
      recommendation
    };
  }

  private async predictPrice(data: {
    prices: PriceData[];
    timeframe: '1d' | '7d' | '30d' | '90d';
    method?: 'sma' | 'ema' | 'linear_regression' | 'lstm';
  }): Promise<{
    predictions: Array<{
      date: string;
      price: number;
      confidence: number;
      range: { min: number; max: number };
    }>;
    method: string;
    accuracy: number;
    factors: string[];
  }> {
    const prices = data.prices;
    const method = data.method || 'linear_regression';
    
    let predictions: any[] = [];
    let accuracy = 0.75;
    let factors: string[] = [];

    switch (method) {
      case 'sma':
        predictions = this.predictWithSMA(prices, data.timeframe);
        factors = ['Simple Moving Average', 'Historical Price Trends'];
        accuracy = 0.65;
        break;
      
      case 'ema':
        predictions = this.predictWithEMA(prices, data.timeframe);
        factors = ['Exponential Moving Average', 'Recent Price Momentum'];
        accuracy = 0.70;
        break;
      
      case 'linear_regression':
        predictions = this.predictWithLinearRegression(prices, data.timeframe);
        factors = ['Price Trend Line', 'Linear Growth Pattern'];
        accuracy = 0.75;
        break;
      
      default:
        throw new Error(`Unsupported prediction method: ${method}`);
    }

    return {
      predictions,
      method,
      accuracy,
      factors
    };
  }

  private async detectAnomalies(data: {
    prices: PriceData[];
    sensitivity?: 'low' | 'medium' | 'high';
  }): Promise<{
    anomalies: Array<{
      timestamp: number;
      type: 'price_spike' | 'volume_spike' | 'gap' | 'unusual_pattern';
      severity: 'low' | 'medium' | 'high';
      description: string;
      value: number;
      expectedValue: number;
    }>;
    summary: {
      totalAnomalies: number;
      highSeverityCount: number;
      mostCommonType: string;
    };
  }> {
    const prices = data.prices;
    const sensitivity = data.sensitivity || 'medium';
    const anomalies: any[] = [];

    // Detect price spikes
    const priceAnomalies = this.detectPriceSpikes(prices, sensitivity);
    anomalies.push(...priceAnomalies);

    // Detect volume spikes
    const volumeAnomalies = this.detectVolumeSpikes(prices, sensitivity);
    anomalies.push(...volumeAnomalies);

    // Detect gaps
    const gapAnomalies = this.detectGaps(prices, sensitivity);
    anomalies.push(...gapAnomalies);

    // Calculate summary
    const summary = {
      totalAnomalies: anomalies.length,
      highSeverityCount: anomalies.filter(a => a.severity === 'high').length,
      mostCommonType: this.getMostCommonAnomalyType(anomalies)
    };

    return { anomalies, summary };
  }

  // Technical Indicator Calculations
  private async calculateIndicators(prices: PriceData[], requestedIndicators?: string[]): Promise<TechnicalIndicator[]> {
    const indicators: TechnicalIndicator[] = [];
    const defaultIndicators = ['SMA_20', 'EMA_12', 'RSI_14', 'MACD', 'BB_20'];
    const indicatorsToCalculate = requestedIndicators || defaultIndicators;

    for (const indicator of indicatorsToCalculate) {
      try {
        const result = await this.calculateSingleIndicator(prices, indicator);
        indicators.push(result);
      } catch (error) {
        logger.warn(`Failed to calculate indicator ${indicator}:`, error);
      }
    }

    return indicators;
  }

  private async calculateSingleIndicator(prices: PriceData[], indicatorName: string): Promise<TechnicalIndicator> {
    const closePrices = prices.map(p => p.close);
    const volumes = prices.map(p => p.volume);

    switch (indicatorName) {
      case 'SMA_20':
        return this.calculateSMA(closePrices, 20);
      
      case 'EMA_12':
        return this.calculateEMA(closePrices, 12);
      
      case 'RSI_14':
        return this.calculateRSI(closePrices, 14);
      
      case 'MACD':
        return this.calculateMACD(closePrices);
      
      case 'BB_20':
        return this.calculateBollingerBands(closePrices, 20);
      
      case 'STOCH_14':
        return this.calculateStochastic(prices, 14);
      
      case 'ADX_14':
        return this.calculateADX(prices, 14);
      
      default:
        throw new Error(`Unknown indicator: ${indicatorName}`);
    }
  }

  private calculateSMA(prices: number[], period: number): TechnicalIndicator {
    if (prices.length < period) {
      throw new Error(`Insufficient data for SMA${period}`);
    }

    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    const currentPrice = prices[prices.length - 1];
    
    let signal: 'buy' | 'sell' | 'hold' | 'neutral' = 'neutral';
    let strength: 'strong' | 'moderate' | 'weak' = 'moderate';

    if (currentPrice > sma * 1.02) {
      signal = 'buy';
      strength = currentPrice > sma * 1.05 ? 'strong' : 'moderate';
    } else if (currentPrice < sma * 0.98) {
      signal = 'sell';
      strength = currentPrice < sma * 0.95 ? 'strong' : 'moderate';
    } else {
      signal = 'hold';
      strength = 'weak';
    }

    return {
      name: `SMA ${period}`,
      value: sma,
      signal,
      strength,
      description: `${period}-period Simple Moving Average: ${sma.toFixed(2)}`
    };
  }

  private calculateEMA(prices: number[], period: number): TechnicalIndicator {
    if (prices.length < period) {
      throw new Error(`Insufficient data for EMA${period}`);
    }

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    const currentPrice = prices[prices.length - 1];
    let signal: 'buy' | 'sell' | 'hold' | 'neutral' = 'neutral';
    let strength: 'strong' | 'moderate' | 'weak' = 'moderate';

    if (currentPrice > ema * 1.02) {
      signal = 'buy';
      strength = currentPrice > ema * 1.05 ? 'strong' : 'moderate';
    } else if (currentPrice < ema * 0.98) {
      signal = 'sell';
      strength = currentPrice < ema * 0.95 ? 'strong' : 'moderate';
    } else {
      signal = 'hold';
      strength = 'weak';
    }

    return {
      name: `EMA ${period}`,
      value: ema,
      signal,
      strength,
      description: `${period}-period Exponential Moving Average: ${ema.toFixed(2)}`
    };
  }

  private calculateRSI(prices: number[], period: number): TechnicalIndicator {
    if (prices.length < period + 1) {
      throw new Error(`Insufficient data for RSI${period}`);
    }

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;

    const rs = avgGain / (avgLoss || 0.01);
    const rsi = 100 - (100 / (1 + rs));

    let signal: 'buy' | 'sell' | 'hold' | 'neutral' = 'neutral';
    let strength: 'strong' | 'moderate' | 'weak' = 'moderate';

    if (rsi > 70) {
      signal = 'sell';
      strength = rsi > 80 ? 'strong' : 'moderate';
    } else if (rsi < 30) {
      signal = 'buy';
      strength = rsi < 20 ? 'strong' : 'moderate';
    } else {
      signal = 'hold';
      strength = 'weak';
    }

    return {
      name: 'RSI 14',
      value: rsi,
      signal,
      strength,
      description: `Relative Strength Index: ${rsi.toFixed(2)} (Overbought: >70, Oversold: <30)`
    };
  }

  private calculateMACD(prices: number[]): TechnicalIndicator {
    const ema12 = this.calculateEMAValue(prices, 12);
    const ema26 = this.calculateEMAValue(prices, 26);
    const macd = ema12 - ema26;
    
    // Calculate signal line (9-period EMA of MACD)
    const macdValues = [];
    for (let i = 26; i < prices.length; i++) {
      const ema12_i = this.calculateEMAValue(prices.slice(0, i + 1), 12);
      const ema26_i = this.calculateEMAValue(prices.slice(0, i + 1), 26);
      macdValues.push(ema12_i - ema26_i);
    }
    
    const signal = this.calculateEMAValue(macdValues, 9);
    const histogram = macd - signal;

    let actionSignal: 'buy' | 'sell' | 'hold' | 'neutral' = 'neutral';
    let strength: 'strong' | 'moderate' | 'weak' = 'moderate';

    if (macd > signal && histogram > 0) {
      actionSignal = 'buy';
      strength = histogram > 0.5 ? 'strong' : 'moderate';
    } else if (macd < signal && histogram < 0) {
      actionSignal = 'sell';
      strength = histogram < -0.5 ? 'strong' : 'moderate';
    } else {
      actionSignal = 'hold';
      strength = 'weak';
    }

    return {
      name: 'MACD',
      value: macd,
      signal: actionSignal,
      strength,
      description: `MACD: ${macd.toFixed(4)}, Signal: ${signal.toFixed(4)}, Histogram: ${histogram.toFixed(4)}`
    };
  }

  private calculateBollingerBands(prices: number[], period: number): TechnicalIndicator {
    const sma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
    
    const variance = prices.slice(-period)
      .reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    const upperBand = sma + (2 * stdDev);
    const lowerBand = sma - (2 * stdDev);
    const currentPrice = prices[prices.length - 1];
    
    let signal: 'buy' | 'sell' | 'hold' | 'neutral' = 'neutral';
    let strength: 'strong' | 'moderate' | 'weak' = 'moderate';

    if (currentPrice > upperBand) {
      signal = 'sell';
      strength = 'strong';
    } else if (currentPrice < lowerBand) {
      signal = 'buy';
      strength = 'strong';
    } else if (currentPrice > sma) {
      signal = 'buy';
      strength = 'weak';
    } else {
      signal = 'sell';
      strength = 'weak';
    }

    return {
      name: 'Bollinger Bands',
      value: currentPrice,
      signal,
      strength,
      description: `Upper: ${upperBand.toFixed(2)}, SMA: ${sma.toFixed(2)}, Lower: ${lowerBand.toFixed(2)}`
    };
  }

  private calculateStochastic(prices: PriceData[], period: number): TechnicalIndicator {
    const recentData = prices.slice(-period);
    const highestHigh = Math.max(...recentData.map(p => p.high));
    const lowestLow = Math.min(...recentData.map(p => p.low));
    const currentClose = prices[prices.length - 1].close;
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    let signal: 'buy' | 'sell' | 'hold' | 'neutral' = 'neutral';
    let strength: 'strong' | 'moderate' | 'weak' = 'moderate';

    if (k > 80) {
      signal = 'sell';
      strength = 'strong';
    } else if (k < 20) {
      signal = 'buy';
      strength = 'strong';
    } else {
      signal = 'hold';
      strength = 'weak';
    }

    return {
      name: 'Stochastic %K',
      value: k,
      signal,
      strength,
      description: `Stochastic %K: ${k.toFixed(2)} (Overbought: >80, Oversold: <20)`
    };
  }

  private calculateADX(prices: PriceData[], period: number): TechnicalIndicator {
    // Simplified ADX calculation
    const trueRanges = [];
    const plusDMs = [];
    const minusDMs = [];
    
    for (let i = 1; i < prices.length; i++) {
      const high = prices[i].high;
      const low = prices[i].low;
      const prevHigh = prices[i - 1].high;
      const prevLow = prices[i - 1].low;
      const prevClose = prices[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
      
      const plusDM = high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0;
      const minusDM = prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0;
      
      plusDMs.push(plusDM);
      minusDMs.push(minusDM);
    }
    
    const avgTR = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
    const avgPlusDM = plusDMs.slice(-period).reduce((sum, dm) => sum + dm, 0) / period;
    const avgMinusDM = minusDMs.slice(-period).reduce((sum, dm) => sum + dm, 0) / period;
    
    const plusDI = (avgPlusDM / avgTR) * 100;
    const minusDI = (avgMinusDM / avgTR) * 100;
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
    
    let signal: 'buy' | 'sell' | 'hold' | 'neutral' = 'neutral';
    let strength: 'strong' | 'moderate' | 'weak' = 'moderate';

    if (dx > 25) {
      signal = plusDI > minusDI ? 'buy' : 'sell';
      strength = dx > 40 ? 'strong' : 'moderate';
    } else {
      signal = 'hold';
      strength = 'weak';
    }

    return {
      name: 'ADX',
      value: dx,
      signal,
      strength,
      description: `Average Directional Index: ${dx.toFixed(2)} (+DI: ${plusDI.toFixed(2)}, -DI: ${minusDI.toFixed(2)})`
    };
  }

  private calculateEMAValue(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  // Pattern Detection
  private async detectPatterns(prices: PriceData[]): Promise<TechnicalPattern[]> {
    const patterns: TechnicalPattern[] = [];

    // Detect common patterns
    patterns.push(...this.detectHeadAndShoulders(prices));
    patterns.push(...this.detectDoubleTopBottom(prices));
    patterns.push(...this.detectTriangle(prices));
    patterns.push(...this.detectFlagPennant(prices));

    return patterns.filter(pattern => pattern.reliability > 0.6);
  }

  private detectHeadAndShoulders(prices: PriceData[]): TechnicalPattern[] {
    // Simplified head and shoulders detection
    if (prices.length < 50) return [];

    const recentPrices = prices.slice(-50);
    const highs = recentPrices.map(p => p.high);
    
    // Find local maxima
    const peaks = [];
    for (let i = 5; i < highs.length - 5; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i+1]) {
        peaks.push({ index: i, value: highs[i] });
      }
    }

    if (peaks.length >= 3) {
      const [leftShoulder, head, rightShoulder] = peaks.slice(-3);
      
      if (head.value > leftShoulder.value && head.value > rightShoulder.value &&
          Math.abs(leftShoulder.value - rightShoulder.value) < head.value * 0.05) {
        return [{
          name: 'Head and Shoulders',
          type: 'reversal',
          reliability: 0.75,
          timeframe: '1-2 weeks',
          description: 'Bearish reversal pattern detected'
        }];
      }
    }

    return [];
  }

  private detectDoubleTopBottom(prices: PriceData[]): TechnicalPattern[] {
    // Simplified double top/bottom detection
    const patterns: TechnicalPattern[] = [];
    
    if (prices.length < 30) return patterns;

    const recentPrices = prices.slice(-30);
    const highs = recentPrices.map(p => p.high);
    const lows = recentPrices.map(p => p.low);

    // Detect double top
    const peaks = [];
    for (let i = 3; i < highs.length - 3; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i+1]) {
        peaks.push({ index: i, value: highs[i] });
      }
    }

    if (peaks.length >= 2) {
      const [firstPeak, secondPeak] = peaks.slice(-2);
      if (Math.abs(firstPeak.value - secondPeak.value) < firstPeak.value * 0.03) {
        patterns.push({
          name: 'Double Top',
          type: 'reversal',
          reliability: 0.70,
          timeframe: '1-3 weeks',
          description: 'Bearish reversal pattern - double top formation'
        });
      }
    }

    return patterns;
  }

  private detectTriangle(prices: PriceData[]): TechnicalPattern[] {
    // Simplified triangle pattern detection
    if (prices.length < 20) return [];

    const recentPrices = prices.slice(-20);
    const highs = recentPrices.map(p => p.high);
    const lows = recentPrices.map(p => p.low);

    const highTrend = this.calculateTrendLine(highs);
    const lowTrend = this.calculateTrendLine(lows);

    if (highTrend.slope < 0 && lowTrend.slope > 0) {
      return [{
        name: 'Symmetrical Triangle',
        type: 'continuation',
        reliability: 0.65,
        timeframe: '1-2 weeks',
        description: 'Symmetrical triangle - breakout expected'
      }];
    }

    return [];
  }

  private detectFlagPennant(prices: PriceData[]): TechnicalPattern[] {
    // Simplified flag/pennant detection
    if (prices.length < 15) return [];

    const recentPrices = prices.slice(-15);
    const closes = recentPrices.map(p => p.close);
    const volumes = recentPrices.map(p => p.volume);

    // Check for recent strong move followed by consolidation
    const earlyPrices = closes.slice(0, 5);
    const latePrices = closes.slice(-5);
    const avgEarly = earlyPrices.reduce((sum, p) => sum + p, 0) / earlyPrices.length;
    const avgLate = latePrices.reduce((sum, p) => sum + p, 0) / latePrices.length;
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const recentVolume = volumes.slice(-3).reduce((sum, v) => sum + v, 0) / 3;

    if (Math.abs(avgLate - avgEarly) / avgEarly > 0.05 && recentVolume < avgVolume * 0.8) {
      return [{
        name: avgLate > avgEarly ? 'Bull Flag' : 'Bear Flag',
        type: 'continuation',
        reliability: 0.68,
        timeframe: '3-7 days',
        description: `${avgLate > avgEarly ? 'Bullish' : 'Bearish'} continuation pattern with decreasing volume`
      }];
    }

    return [];
  }

  private calculateTrendLine(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    const xSum = n * (n - 1) / 2;
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = values.reduce((sum, val, i) => sum + val * i, 0);
    const x2Sum = n * (n - 1) * (2 * n - 1) / 6;

    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    return { slope, intercept };
  }

  // Support and Resistance
  private findSupportLevels(prices: PriceData[]): number[] {
    const lows = prices.map(p => p.low);
    const supports: number[] = [];

    for (let i = 2; i < lows.length - 2; i++) {
      if (lows[i] < lows[i-1] && lows[i] < lows[i+1] &&
          lows[i] < lows[i-2] && lows[i] < lows[i+2]) {
        supports.push(lows[i]);
      }
    }

    // Return unique levels sorted
    return [...new Set(supports)].sort((a, b) => b - a).slice(0, 3);
  }

  private findResistanceLevels(prices: PriceData[]): number[] {
    const highs = prices.map(p => p.high);
    const resistances: number[] = [];

    for (let i = 2; i < highs.length - 2; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i+1] &&
          highs[i] > highs[i-2] && highs[i] > highs[i+2]) {
        resistances.push(highs[i]);
      }
    }

    // Return unique levels sorted
    return [...new Set(resistances)].sort((a, b) => b - a).slice(0, 3);
  }

  // Volume Analysis
  private analyzeVolume(prices: PriceData[]): {
    trend: 'increasing' | 'decreasing' | 'stable';
    averageVolume: number;
    volumeRatio: number;
  } {
    const volumes = prices.map(p => p.volume);
    const recentVolumes = volumes.slice(-10);
    const olderVolumes = volumes.slice(-20, -10);

    const recentAvg = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
    const olderAvg = olderVolumes.reduce((sum, v) => sum + v, 0) / olderVolumes.length;
    const totalAvg = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

    const ratio = recentAvg / olderAvg;
    let trend: 'increasing' | 'decreasing' | 'stable';

    if (ratio > 1.2) {
      trend = 'increasing';
    } else if (ratio < 0.8) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      trend,
      averageVolume: totalAvg,
      volumeRatio: recentAvg / totalAvg
    };
  }

  // Trend Determination
  private determineTrend(prices: PriceData[], indicators: TechnicalIndicator[]): {
    direction: 'bullish' | 'bearish' | 'sideways';
    strength: 'strong' | 'moderate' | 'weak';
    confidence: number;
  } {
    const closes = prices.map(p => p.close);
    const recentPrices = closes.slice(-10);
    const firstPrice = recentPrices[0];
    const lastPrice = recentPrices[recentPrices.length - 1];
    
    const priceChange = (lastPrice - firstPrice) / firstPrice;
    const smaIndicator = indicators.find(i => i.name.includes('SMA'));
    const rsiIndicator = indicators.find(i => i.name === 'RSI 14');

    let direction: 'bullish' | 'bearish' | 'sideways' = 'sideways';
    let strength: 'strong' | 'moderate' | 'weak' = 'weak';
    let confidence = 0.5;

    // Determine direction based on price change
    if (priceChange > 0.05) {
      direction = 'bullish';
    } else if (priceChange < -0.05) {
      direction = 'bearish';
    }

    // Adjust based on indicators
    let bullishSignals = 0;
    let bearishSignals = 0;

    indicators.forEach(indicator => {
      if (indicator.signal === 'buy') {
        bullishSignals += indicator.strength === 'strong' ? 2 : 1;
      } else if (indicator.signal === 'sell') {
        bearishSignals += indicator.strength === 'strong' ? 2 : 1;
      }
    });

    if (bullishSignals > bearishSignals + 2) {
      direction = 'bullish';
      strength = bullishSignals > bearishSignals + 4 ? 'strong' : 'moderate';
      confidence = Math.min(0.9, 0.6 + (bullishSignals - bearishSignals) * 0.05);
    } else if (bearishSignals > bullishSignals + 2) {
      direction = 'bearish';
      strength = bearishSignals > bullishSignals + 4 ? 'strong' : 'moderate';
      confidence = Math.min(0.9, 0.6 + (bearishSignals - bullishSignals) * 0.05);
    }

    return { direction, strength, confidence };
  }

  // Price Prediction Methods
  private predictWithSMA(prices: PriceData[], timeframe: string): Array<{
    date: string;
    price: number;
    confidence: number;
    range: { min: number; max: number };
  }> {
    const closes = prices.map(p => p.close);
    const sma20 = closes.slice(-20).reduce((sum, p) => sum + p, 0) / 20;
    const currentPrice = closes[closes.length - 1];
    
    const predictions = [];
    const days = this.getTimeframeDays(timeframe);
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simple trend continuation
      const trendFactor = (currentPrice - sma20) / sma20;
      const predictedPrice = currentPrice * (1 + trendFactor * 0.1 * i);
      const volatility = this.calculateVolatility(closes.slice(-20));
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        price: predictedPrice,
        confidence: Math.max(0.3, 0.8 - i * 0.05),
        range: {
          min: predictedPrice * (1 - volatility),
          max: predictedPrice * (1 + volatility)
        }
      });
    }
    
    return predictions;
  }

  private predictWithEMA(prices: PriceData[], timeframe: string): any[] {
    const closes = prices.map(p => p.close);
    const ema = this.calculateEMAValue(closes, 12);
    const currentPrice = closes[closes.length - 1];
    
    const predictions = [];
    const days = this.getTimeframeDays(timeframe);
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const trendFactor = (currentPrice - ema) / ema;
      const predictedPrice = currentPrice * (1 + trendFactor * 0.15 * Math.sqrt(i));
      const volatility = this.calculateVolatility(closes.slice(-12));
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        price: predictedPrice,
        confidence: Math.max(0.4, 0.85 - i * 0.04),
        range: {
          min: predictedPrice * (1 - volatility * 1.5),
          max: predictedPrice * (1 + volatility * 1.5)
        }
      });
    }
    
    return predictions;
  }

  private predictWithLinearRegression(prices: PriceData[], timeframe: string): any[] {
    const closes = prices.map(p => p.close);
    const recentPrices = closes.slice(-30);
    
    // Calculate linear regression
    const n = recentPrices.length;
    const xSum = n * (n - 1) / 2;
    const ySum = recentPrices.reduce((sum, val) => sum + val, 0);
    const xySum = recentPrices.reduce((sum, val, i) => sum + val * i, 0);
    const x2Sum = n * (n - 1) * (2 * n - 1) / 6;

    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    const predictions = [];
    const days = this.getTimeframeDays(timeframe);
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const predictedPrice = intercept + slope * (n + i - 1);
      const volatility = this.calculateVolatility(recentPrices);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(0, predictedPrice),
        confidence: Math.max(0.5, 0.9 - i * 0.03),
        range: {
          min: Math.max(0, predictedPrice * (1 - volatility * 2)),
          max: predictedPrice * (1 + volatility * 2)
        }
      });
    }
    
    return predictions;
  }

  private getTimeframeDays(timeframe: string): number {
    switch (timeframe) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  }

  private calculateVolatility(prices: number[]): number {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  // Anomaly Detection Methods
  private detectPriceSpikes(prices: PriceData[], sensitivity: string): any[] {
    const closes = prices.map(p => p.close);
    const anomalies = [];
    const threshold = sensitivity === 'high' ? 0.05 : sensitivity === 'medium' ? 0.08 : 0.12;
    
    for (let i = 1; i < closes.length; i++) {
      const change = Math.abs((closes[i] - closes[i - 1]) / closes[i - 1]);
      
      if (change > threshold) {
        anomalies.push({
          timestamp: prices[i].timestamp,
          type: 'price_spike',
          severity: change > threshold * 2 ? 'high' : change > threshold * 1.5 ? 'medium' : 'low',
          description: `Price spike of ${(change * 100).toFixed(1)}%`,
          value: closes[i],
          expectedValue: closes[i - 1]
        });
      }
    }
    
    return anomalies;
  }

  private detectVolumeSpikes(prices: PriceData[], sensitivity: string): any[] {
    const volumes = prices.map(p => p.volume);
    const anomalies = [];
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const threshold = sensitivity === 'high' ? 2 : sensitivity === 'medium' ? 3 : 5;
    
    for (let i = 0; i < volumes.length; i++) {
      if (volumes[i] > avgVolume * threshold) {
        anomalies.push({
          timestamp: prices[i].timestamp,
          type: 'volume_spike',
          severity: volumes[i] > avgVolume * threshold * 2 ? 'high' : 'medium',
          description: `Volume spike: ${(volumes[i] / avgVolume).toFixed(1)}x average`,
          value: volumes[i],
          expectedValue: avgVolume
        });
      }
    }
    
    return anomalies;
  }

  private detectGaps(prices: PriceData[], sensitivity: string): any[] {
    const anomalies = [];
    const threshold = sensitivity === 'high' ? 0.02 : sensitivity === 'medium' ? 0.03 : 0.05;
    
    for (let i = 1; i < prices.length; i++) {
      const prevClose = prices[i - 1].close;
      const currentOpen = prices[i].open;
      const gap = Math.abs(currentOpen - prevClose) / prevClose;
      
      if (gap > threshold) {
        anomalies.push({
          timestamp: prices[i].timestamp,
          type: 'gap',
          severity: gap > threshold * 2 ? 'high' : 'medium',
          description: `${currentOpen > prevClose ? 'Gap up' : 'Gap down'}: ${(gap * 100).toFixed(1)}%`,
          value: currentOpen,
          expectedValue: prevClose
        });
      }
    }
    
    return anomalies;
  }

  private getMostCommonAnomalyType(anomalies: any[]): string {
    const counts = {};
    anomalies.forEach(anomaly => {
      counts[anomaly.type] = (counts[anomaly.type] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'none');
  }

  // Recommendation Generation
  private generateRecommendation(
    trend: any,
    indicators: TechnicalIndicator[],
    patterns: TechnicalPattern[],
    volume: any
  ): {
    action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    confidence: number;
    reasoning: string;
  } {
    let score = 0;
    const reasons = [];

    // Trend analysis
    if (trend.direction === 'bullish') {
      score += trend.strength === 'strong' ? 3 : trend.strength === 'moderate' ? 2 : 1;
      reasons.push(`${trend.strength} bullish trend`);
    } else if (trend.direction === 'bearish') {
      score -= trend.strength === 'strong' ? 3 : trend.strength === 'moderate' ? 2 : 1;
      reasons.push(`${trend.strength} bearish trend`);
    }

    // Indicator signals
    let bullishIndicators = 0;
    let bearishIndicators = 0;

    indicators.forEach(indicator => {
      if (indicator.signal === 'buy') {
        const weight = indicator.strength === 'strong' ? 2 : 1;
        score += weight;
        bullishIndicators += weight;
      } else if (indicator.signal === 'sell') {
        const weight = indicator.strength === 'strong' ? 2 : 1;
        score -= weight;
        bearishIndicators += weight;
      }
    });

    if (bullishIndicators > 0) {
      reasons.push(`${bullishIndicators} bullish indicator signal${bullishIndicators > 1 ? 's' : ''}`);
    }
    if (bearishIndicators > 0) {
      reasons.push(`${bearishIndicators} bearish indicator signal${bearishIndicators > 1 ? 's' : ''}`);
    }

    // Pattern analysis
    patterns.forEach(pattern => {
      const weight = pattern.reliability * (pattern.type === 'reversal' ? 2 : 1);
      if (pattern.name.includes('Bull') || pattern.name.includes('Bottom')) {
        score += weight;
        reasons.push(`${pattern.name} pattern`);
      } else if (pattern.name.includes('Bear') || pattern.name.includes('Top')) {
        score -= weight;
        reasons.push(`${pattern.name} pattern`);
      }
    });

    // Volume confirmation
    if (volume.trend === 'increasing' && trend.direction === 'bullish') {
      score += 1;
      reasons.push('volume confirms uptrend');
    } else if (volume.trend === 'increasing' && trend.direction === 'bearish') {
      score -= 1;
      reasons.push('volume confirms downtrend');
    }

    // Determine action
    let action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    let confidence: number;

    if (score >= 6) {
      action = 'strong_buy';
      confidence = Math.min(0.9, 0.7 + score * 0.02);
    } else if (score >= 3) {
      action = 'buy';
      confidence = Math.min(0.85, 0.6 + score * 0.03);
    } else if (score <= -6) {
      action = 'strong_sell';
      confidence = Math.min(0.9, 0.7 + Math.abs(score) * 0.02);
    } else if (score <= -3) {
      action = 'sell';
      confidence = Math.min(0.85, 0.6 + Math.abs(score) * 0.03);
    } else {
      action = 'hold';
      confidence = 0.6;
      reasons.push('mixed signals');
    }

    return {
      action,
      confidence,
      reasoning: reasons.join(', ')
    };
  }
}

export default TechnicalAnalysisService;
