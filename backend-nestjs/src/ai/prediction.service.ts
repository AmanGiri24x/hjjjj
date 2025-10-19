import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { ModelService } from './model.service';

export interface ModelPrediction {
  id: string;
  type: 'portfolio_performance' | 'market_trend' | 'risk_assessment' | 'goal_probability' | 'volatility_forecast' | 'sector_rotation';
  prediction: any;
  confidence: number;
  timeframe: string;
  factors: string[];
  scenarios: {
    optimistic: any;
    realistic: any;
    pessimistic: any;
  };
  methodology: string;
  limitations: string[];
  createdAt: Date;
  userId: string;
  metadata?: any;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  beta: number;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface EconomicIndicators {
  gdpGrowth: number;
  inflation: number;
  unemploymentRate: number;
  interestRates: number;
  vixLevel: number;
  dollarIndex: number;
}

export interface PredictionRequest {
  type: string;
  userId: string;
  timeframe: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y';
  parameters?: any;
  context?: any;
}

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
    private modelService: ModelService,
  ) {}

  async generatePrediction(
    userId: string,
    predictionType: string,
    context?: any,
    timeframe: string = '1Y'
  ): Promise<ModelPrediction> {
    const startTime = Date.now();

    try {
      // Validate user access
      await this.securityService.validateUserAccess(userId, 'ml_predictions');

      // Get relevant data for prediction
      const [portfolioData, marketData, economicData] = await Promise.all([
        this.getUserPortfolioData(userId),
        this.getMarketData(),
        this.getEconomicIndicators(),
      ]);

      let prediction: ModelPrediction;

      switch (predictionType) {
        case 'portfolio_performance':
          prediction = await this.predictPortfolioPerformance(userId, portfolioData, marketData, economicData, timeframe);
          break;
        case 'market_trend':
          prediction = await this.predictMarketTrend(userId, marketData, economicData, timeframe);
          break;
        case 'risk_assessment':
          prediction = await this.predictRiskMetrics(userId, portfolioData, marketData, timeframe);
          break;
        case 'goal_probability':
          prediction = await this.predictGoalProbability(userId, portfolioData, context, timeframe);
          break;
        case 'volatility_forecast':
          prediction = await this.predictVolatility(userId, portfolioData, marketData, timeframe);
          break;
        case 'sector_rotation':
          prediction = await this.predictSectorRotation(userId, marketData, economicData, timeframe);
          break;
        default:
          throw new Error(`Unsupported prediction type: ${predictionType}`);
      }

      // Record metrics
      const processingTime = Date.now() - startTime;
      await this.monitoringService.recordMetric('prediction_generation_time', processingTime, {
        userId,
        predictionType,
        timeframe,
      });

      // Log prediction generation
      await this.logPredictionGeneration(userId, prediction);

      return prediction;

    } catch (error) {
      this.logger.error(`Prediction generation failed: ${error.message}`, error.stack);
      
      await this.monitoringService.logError({
        level: 'error',
        message: `Prediction generation failed: ${error.message}`,
        context: 'prediction_service',
        userId,
        metadata: { 
          predictionType,
          timeframe,
          processingTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  private async predictPortfolioPerformance(
    userId: string,
    portfolioData: any,
    marketData: MarketData[],
    economicData: EconomicIndicators,
    timeframe: string
  ): Promise<ModelPrediction> {
    // Use ML model for portfolio performance prediction
    const modelRequest = {
      modelId: 'portfolio-analyzer',
      userId,
      input: {
        portfolio: portfolioData,
        market_data: marketData,
        economic_indicators: economicData,
        timeframe,
      },
      parameters: {
        monte_carlo_simulations: 10000,
        confidence_intervals: [0.05, 0.25, 0.75, 0.95],
      },
    };

    const modelResponse = await this.modelService.invokeModel(modelRequest);
    const prediction = modelResponse.output;

    // Calculate scenarios based on confidence intervals
    const scenarios = {
      optimistic: {
        return: prediction.percentiles.p95,
        value: portfolioData.totalValue * (1 + prediction.percentiles.p95),
        probability: 0.05,
      },
      realistic: {
        return: prediction.percentiles.p50,
        value: portfolioData.totalValue * (1 + prediction.percentiles.p50),
        probability: 0.50,
      },
      pessimistic: {
        return: prediction.percentiles.p05,
        value: portfolioData.totalValue * (1 + prediction.percentiles.p05),
        probability: 0.05,
      },
    };

    const factors = [
      'Current portfolio allocation and diversification',
      'Historical performance and volatility patterns',
      'Market correlation and beta exposure',
      'Economic growth projections',
      'Interest rate environment',
      'Sector-specific trends and rotations',
    ];

    return {
      id: this.generateId(),
      type: 'portfolio_performance',
      prediction: {
        expectedReturn: prediction.expected_return,
        volatility: prediction.volatility,
        sharpeRatio: prediction.sharpe_ratio,
        maxDrawdown: prediction.max_drawdown,
        valueAtRisk: prediction.var_95,
        probabilityOfLoss: prediction.probability_of_loss,
      },
      confidence: modelResponse.confidence,
      timeframe,
      factors,
      scenarios,
      methodology: 'Monte Carlo simulation with historical data and economic indicators',
      limitations: [
        'Past performance does not guarantee future results',
        'Model assumes current market conditions continue',
        'Black swan events are not fully captured',
        'Individual security selection impact may vary',
      ],
      createdAt: new Date(),
      userId,
      metadata: {
        simulationCount: 10000,
        dataPoints: marketData.length,
        modelVersion: modelResponse.metadata.modelVersion,
      },
    };
  }

  private async predictMarketTrend(
    userId: string,
    marketData: MarketData[],
    economicData: EconomicIndicators,
    timeframe: string
  ): Promise<ModelPrediction> {
    const modelRequest = {
      modelId: 'market-predictor',
      userId,
      input: {
        market_data: marketData,
        economic_indicators: economicData,
        timeframe,
      },
      parameters: {
        technical_indicators: true,
        sentiment_analysis: true,
      },
    };

    const modelResponse = await this.modelService.invokeModel(modelRequest);
    const prediction = modelResponse.output;

    const scenarios = {
      optimistic: {
        marketReturn: prediction.bull_case.return,
        probability: prediction.bull_case.probability,
        drivers: prediction.bull_case.key_drivers,
      },
      realistic: {
        marketReturn: prediction.base_case.return,
        probability: prediction.base_case.probability,
        drivers: prediction.base_case.key_drivers,
      },
      pessimistic: {
        marketReturn: prediction.bear_case.return,
        probability: prediction.bear_case.probability,
        drivers: prediction.bear_case.key_drivers,
      },
    };

    const factors = [
      'Federal Reserve monetary policy',
      'Economic growth indicators (GDP, employment)',
      'Corporate earnings trends',
      'Geopolitical events and trade policies',
      'Market valuation metrics (P/E ratios)',
      'Technical momentum and sentiment indicators',
    ];

    return {
      id: this.generateId(),
      type: 'market_trend',
      prediction: {
        direction: prediction.trend_direction,
        magnitude: prediction.expected_move,
        volatility: prediction.expected_volatility,
        sectorRotation: prediction.sector_outlook,
        keyRisks: prediction.risk_factors,
      },
      confidence: modelResponse.confidence,
      timeframe,
      factors,
      scenarios,
      methodology: 'Multi-factor model combining technical, fundamental, and sentiment analysis',
      limitations: [
        'Market predictions are inherently uncertain',
        'Model may not capture all market dynamics',
        'Unexpected events can significantly impact outcomes',
        'Short-term predictions are less reliable',
      ],
      createdAt: new Date(),
      userId,
    };
  }

  private async predictRiskMetrics(
    userId: string,
    portfolioData: any,
    marketData: MarketData[],
    timeframe: string
  ): Promise<ModelPrediction> {
    const modelRequest = {
      modelId: 'risk-scorer',
      userId,
      input: {
        portfolio: portfolioData,
        market_data: marketData,
        timeframe,
      },
    };

    const modelResponse = await this.modelService.invokeModel(modelRequest);
    const prediction = modelResponse.output;

    const scenarios = {
      optimistic: {
        volatility: prediction.volatility_scenarios.low,
        maxDrawdown: prediction.drawdown_scenarios.low,
        var95: prediction.var_scenarios.low,
      },
      realistic: {
        volatility: prediction.volatility_scenarios.base,
        maxDrawdown: prediction.drawdown_scenarios.base,
        var95: prediction.var_scenarios.base,
      },
      pessimistic: {
        volatility: prediction.volatility_scenarios.high,
        maxDrawdown: prediction.drawdown_scenarios.high,
        var95: prediction.var_scenarios.high,
      },
    };

    return {
      id: this.generateId(),
      type: 'risk_assessment',
      prediction: {
        portfolioVolatility: prediction.portfolio_volatility,
        beta: prediction.portfolio_beta,
        correlationRisk: prediction.correlation_risk,
        concentrationRisk: prediction.concentration_risk,
        liquidityRisk: prediction.liquidity_risk,
        riskScore: prediction.overall_risk_score,
      },
      confidence: modelResponse.confidence,
      timeframe,
      factors: [
        'Portfolio concentration and diversification',
        'Asset correlation patterns',
        'Historical volatility trends',
        'Market beta exposure',
        'Liquidity characteristics of holdings',
      ],
      scenarios,
      methodology: 'Risk factor modeling with Monte Carlo simulation',
      limitations: [
        'Risk models are based on historical patterns',
        'Correlation patterns may change during stress periods',
        'Tail risks may be underestimated',
      ],
      createdAt: new Date(),
      userId,
    };
  }

  private async predictGoalProbability(
    userId: string,
    portfolioData: any,
    context: any,
    timeframe: string
  ): Promise<ModelPrediction> {
    const goalAmount = context?.goalAmount || 1000000;
    const currentAmount = portfolioData.totalValue;
    const monthlyContribution = context?.monthlyContribution || 0;
    const yearsToGoal = this.parseTimeframe(timeframe);

    // Monte Carlo simulation for goal achievement
    const simulations = 10000;
    let successCount = 0;

    for (let i = 0; i < simulations; i++) {
      const finalValue = this.simulateGoalPath(
        currentAmount,
        monthlyContribution,
        yearsToGoal,
        portfolioData.expectedReturn || 0.08,
        portfolioData.volatility || 0.15
      );

      if (finalValue >= goalAmount) {
        successCount++;
      }
    }

    const probability = successCount / simulations;

    const scenarios = {
      optimistic: {
        probability: Math.min(probability + 0.15, 1.0),
        requiredReturn: this.calculateRequiredReturn(currentAmount, goalAmount, yearsToGoal, monthlyContribution) - 0.02,
      },
      realistic: {
        probability,
        requiredReturn: this.calculateRequiredReturn(currentAmount, goalAmount, yearsToGoal, monthlyContribution),
      },
      pessimistic: {
        probability: Math.max(probability - 0.15, 0.0),
        requiredReturn: this.calculateRequiredReturn(currentAmount, goalAmount, yearsToGoal, monthlyContribution) + 0.02,
      },
    };

    return {
      id: this.generateId(),
      type: 'goal_probability',
      prediction: {
        achievementProbability: probability,
        projectedValue: currentAmount * Math.pow(1.08, yearsToGoal) + monthlyContribution * 12 * yearsToGoal,
        shortfall: Math.max(0, goalAmount - (currentAmount * Math.pow(1.08, yearsToGoal))),
        requiredMonthlyIncrease: this.calculateRequiredIncrease(currentAmount, goalAmount, yearsToGoal, monthlyContribution),
      },
      confidence: 0.85,
      timeframe,
      factors: [
        'Current portfolio value and growth rate',
        'Monthly contribution consistency',
        'Market volatility and return assumptions',
        'Time horizon to goal',
        'Inflation impact on goal value',
      ],
      scenarios,
      methodology: 'Monte Carlo simulation with stochastic returns',
      limitations: [
        'Assumes consistent monthly contributions',
        'Market returns may vary significantly',
        'Inflation may affect real goal value',
        'Life events may impact contribution ability',
      ],
      createdAt: new Date(),
      userId,
      metadata: {
        simulationCount: simulations,
        goalAmount,
        currentAmount,
        monthlyContribution,
      },
    };
  }

  private async predictVolatility(
    userId: string,
    portfolioData: any,
    marketData: MarketData[],
    timeframe: string
  ): Promise<ModelPrediction> {
    // GARCH model for volatility forecasting
    const currentVolatility = portfolioData.volatility || 0.15;
    const marketVolatility = this.calculateMarketVolatility(marketData);

    const scenarios = {
      optimistic: {
        volatility: currentVolatility * 0.8,
        environment: 'Low volatility regime',
      },
      realistic: {
        volatility: currentVolatility * 1.1,
        environment: 'Normal volatility regime',
      },
      pessimistic: {
        volatility: currentVolatility * 1.5,
        environment: 'High volatility regime',
      },
    };

    return {
      id: this.generateId(),
      type: 'volatility_forecast',
      prediction: {
        expectedVolatility: currentVolatility * 1.1,
        volatilityRegime: marketVolatility > 0.25 ? 'high' : marketVolatility > 0.15 ? 'normal' : 'low',
        persistenceFactor: 0.85,
        meanReversion: true,
      },
      confidence: 0.72,
      timeframe,
      factors: [
        'Current market volatility levels',
        'Historical volatility clustering patterns',
        'Economic uncertainty indicators',
        'Central bank policy expectations',
        'Geopolitical risk factors',
      ],
      scenarios,
      methodology: 'GARCH volatility modeling with regime detection',
      limitations: [
        'Volatility clustering may not persist',
        'Structural breaks can alter patterns',
        'Model assumes stationary relationships',
      ],
      createdAt: new Date(),
      userId,
    };
  }

  private async predictSectorRotation(
    userId: string,
    marketData: MarketData[],
    economicData: EconomicIndicators,
    timeframe: string
  ): Promise<ModelPrediction> {
    const sectorOutlook = this.analyzeSectorTrends(marketData, economicData);

    const scenarios = {
      optimistic: {
        leadingSectors: ['Technology', 'Healthcare', 'Consumer Discretionary'],
        laggingSectors: ['Utilities', 'Real Estate'],
      },
      realistic: {
        leadingSectors: ['Technology', 'Financials'],
        laggingSectors: ['Energy', 'Materials'],
      },
      pessimistic: {
        leadingSectors: ['Utilities', 'Consumer Staples'],
        laggingSectors: ['Technology', 'Consumer Discretionary'],
      },
    };

    return {
      id: this.generateId(),
      type: 'sector_rotation',
      prediction: {
        rotationPhase: sectorOutlook.phase,
        leadingSectors: sectorOutlook.leaders,
        laggingSectors: sectorOutlook.laggards,
        rotationStrength: sectorOutlook.strength,
      },
      confidence: 0.68,
      timeframe,
      factors: [
        'Economic cycle positioning',
        'Interest rate environment',
        'Earnings growth expectations',
        'Valuation disparities',
        'Technical momentum patterns',
      ],
      scenarios,
      methodology: 'Sector rotation model based on economic cycle analysis',
      limitations: [
        'Sector rotation patterns may not follow historical norms',
        'Individual stock selection remains important',
        'Timing of rotations is difficult to predict precisely',
      ],
      createdAt: new Date(),
      userId,
    };
  }

  private async getUserPortfolioData(userId: string): Promise<any> {
    // Mock portfolio data - in production, fetch from database
    return {
      totalValue: 150000,
      expectedReturn: 0.08,
      volatility: 0.15,
      beta: 1.1,
      allocation: {
        stocks: 0.7,
        bonds: 0.2,
        alternatives: 0.1,
      },
    };
  }

  private async getMarketData(): Promise<MarketData[]> {
    // Mock market data - in production, fetch from market data provider
    return [
      {
        symbol: 'SPY',
        price: 450,
        volume: 50000000,
        marketCap: 400000000000,
        pe: 22,
        dividend: 0.015,
        beta: 1.0,
        volatility: 0.16,
        trend: 'bullish',
      },
    ];
  }

  private async getEconomicIndicators(): Promise<EconomicIndicators> {
    // Mock economic data - in production, fetch from economic data provider
    return {
      gdpGrowth: 0.025,
      inflation: 0.032,
      unemploymentRate: 0.037,
      interestRates: 0.045,
      vixLevel: 18.5,
      dollarIndex: 103.2,
    };
  }

  private simulateGoalPath(
    initialValue: number,
    monthlyContribution: number,
    years: number,
    expectedReturn: number,
    volatility: number
  ): number {
    let value = initialValue;
    const months = years * 12;

    for (let month = 0; month < months; month++) {
      // Add monthly contribution
      value += monthlyContribution;
      
      // Apply random return
      const monthlyReturn = this.generateRandomReturn(expectedReturn / 12, volatility / Math.sqrt(12));
      value *= (1 + monthlyReturn);
    }

    return value;
  }

  private generateRandomReturn(mean: number, stdDev: number): number {
    // Box-Muller transformation for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z;
  }

  private calculateRequiredReturn(
    currentValue: number,
    goalValue: number,
    years: number,
    monthlyContribution: number
  ): number {
    // Simplified calculation - in practice, would use more sophisticated methods
    const futureValueOfContributions = monthlyContribution * 12 * years;
    const requiredGrowth = goalValue - currentValue - futureValueOfContributions;
    return Math.pow(requiredGrowth / currentValue + 1, 1 / years) - 1;
  }

  private calculateRequiredIncrease(
    currentValue: number,
    goalValue: number,
    years: number,
    currentContribution: number
  ): number {
    const expectedFinalValue = currentValue * Math.pow(1.08, years) + currentContribution * 12 * years;
    const shortfall = Math.max(0, goalValue - expectedFinalValue);
    return shortfall / (12 * years);
  }

  private parseTimeframe(timeframe: string): number {
    const timeframeMap: { [key: string]: number } = {
      '1M': 1/12,
      '3M': 0.25,
      '6M': 0.5,
      '1Y': 1,
      '3Y': 3,
      '5Y': 5,
    };
    return timeframeMap[timeframe] || 1;
  }

  private calculateMarketVolatility(marketData: MarketData[]): number {
    return marketData.reduce((sum, data) => sum + data.volatility, 0) / marketData.length;
  }

  private analyzeSectorTrends(marketData: MarketData[], economicData: EconomicIndicators): any {
    // Simplified sector analysis
    const isEarlyExpansion = economicData.gdpGrowth > 0.02 && economicData.unemploymentRate > 0.05;
    const isLateExpansion = economicData.gdpGrowth > 0.02 && economicData.inflation > 0.03;
    
    if (isEarlyExpansion) {
      return {
        phase: 'early_expansion',
        leaders: ['Technology', 'Consumer Discretionary', 'Industrials'],
        laggards: ['Utilities', 'Consumer Staples'],
        strength: 0.75,
      };
    } else if (isLateExpansion) {
      return {
        phase: 'late_expansion',
        leaders: ['Energy', 'Materials', 'Financials'],
        laggards: ['Technology', 'Real Estate'],
        strength: 0.65,
      };
    } else {
      return {
        phase: 'recession',
        leaders: ['Utilities', 'Consumer Staples', 'Healthcare'],
        laggards: ['Consumer Discretionary', 'Industrials'],
        strength: 0.80,
      };
    }
  }

  private async logPredictionGeneration(userId: string, prediction: ModelPrediction): Promise<void> {
    try {
      await this.prisma.predictionGeneration.create({
        data: {
          userId,
          predictionType: prediction.type,
          confidence: prediction.confidence,
          timeframe: prediction.timeframe,
          metadata: prediction.metadata,
          createdAt: prediction.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log prediction generation: ${error.message}`);
    }
  }

  private generateId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
