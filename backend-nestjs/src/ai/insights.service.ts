import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface FinancialInsight {
  id: string;
  type: 'diversification' | 'risk_analysis' | 'tax_optimization' | 'rebalancing' | 'goal_tracking' | 'cost_analysis' | 'performance_review';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations: string[];
  impact: {
    financial: number; // Potential financial impact in dollars
    risk: number; // Risk impact score (-100 to 100)
    timeline: string; // When to act
  };
  confidence: number; // 0-1 confidence score
  createdAt: Date;
  userId: string;
  metadata?: any;
}

export interface PortfolioAnalysis {
  totalValue: number;
  assetAllocation: { [key: string]: number };
  riskMetrics: {
    beta: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  diversificationScore: number;
  performanceMetrics: {
    ytdReturn: number;
    oneYearReturn: number;
    threeYearReturn: number;
    averageReturn: number;
  };
}

export interface GoalProgress {
  goalId: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  projectedCompletion: Date;
  onTrack: boolean;
  monthlyContributionNeeded: number;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
  ) {}

  async generateInsights(userId: string, context?: any): Promise<FinancialInsight[]> {
    const startTime = Date.now();

    try {
      // Validate user access
      await this.securityService.validateUserAccess(userId, 'financial_insights');

      // Get user's financial data
      const [portfolioData, goals, transactions] = await Promise.all([
        this.getUserPortfolioData(userId),
        this.getUserGoals(userId),
        this.getRecentTransactions(userId, 90), // Last 90 days
      ]);

      const insights: FinancialInsight[] = [];

      // Generate different types of insights
      insights.push(...await this.analyzeDiversification(userId, portfolioData));
      insights.push(...await this.analyzeRiskProfile(userId, portfolioData));
      insights.push(...await this.analyzeTaxOptimization(userId, portfolioData, transactions));
      insights.push(...await this.analyzeRebalancing(userId, portfolioData));
      insights.push(...await this.analyzeGoalProgress(userId, goals, portfolioData));
      insights.push(...await this.analyzeCosts(userId, portfolioData, transactions));
      insights.push(...await this.analyzePerformance(userId, portfolioData));

      // Sort by priority and confidence
      const sortedInsights = insights
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.confidence - a.confidence;
        })
        .slice(0, 10); // Limit to top 10 insights

      // Record metrics
      const processingTime = Date.now() - startTime;
      await this.monitoringService.recordMetric('insights_generation_time', processingTime, {
        userId,
        insightCount: sortedInsights.length,
      });

      // Log insights generation
      await this.logInsightsGeneration(userId, sortedInsights);

      return sortedInsights;

    } catch (error) {
      this.logger.error(`Insights generation failed: ${error.message}`, error.stack);
      
      await this.monitoringService.logError({
        level: 'error',
        message: `Insights generation failed: ${error.message}`,
        context: 'insights_service',
        userId,
        metadata: { processingTime: Date.now() - startTime },
      });

      throw error;
    }
  }

  private async analyzeDiversification(userId: string, portfolio: PortfolioAnalysis): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Check asset allocation diversification
    const allocation = portfolio.assetAllocation;
    const stockPercentage = (allocation.stocks || 0) * 100;
    const bondPercentage = (allocation.bonds || 0) * 100;
    const cashPercentage = (allocation.cash || 0) * 100;

    // Over-concentration in stocks
    if (stockPercentage > 90) {
      insights.push({
        id: this.generateId(),
        type: 'diversification',
        title: 'High Stock Concentration Risk',
        description: `Your portfolio is ${stockPercentage.toFixed(1)}% stocks, which may expose you to excessive market risk.`,
        priority: 'high',
        actionable: true,
        recommendations: [
          'Consider adding bonds to reduce volatility',
          'Diversify into international markets',
          'Add alternative investments like REITs',
        ],
        impact: {
          financial: portfolio.totalValue * 0.1, // Potential risk reduction value
          risk: -25, // Risk reduction
          timeline: '1-3 months',
        },
        confidence: 0.85,
        createdAt: new Date(),
        userId,
      });
    }

    // Insufficient diversification score
    if (portfolio.diversificationScore < 0.6) {
      insights.push({
        id: this.generateId(),
        type: 'diversification',
        title: 'Low Portfolio Diversification',
        description: `Your diversification score is ${(portfolio.diversificationScore * 100).toFixed(1)}%, indicating concentration risk.`,
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Spread investments across more sectors',
          'Add international exposure',
          'Consider index funds for instant diversification',
        ],
        impact: {
          financial: portfolio.totalValue * 0.05,
          risk: -15,
          timeline: '2-4 months',
        },
        confidence: 0.78,
        createdAt: new Date(),
        userId,
      });
    }

    return insights;
  }

  private async analyzeRiskProfile(userId: string, portfolio: PortfolioAnalysis): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // High volatility warning
    if (portfolio.riskMetrics.volatility > 0.25) {
      insights.push({
        id: this.generateId(),
        type: 'risk_analysis',
        title: 'High Portfolio Volatility',
        description: `Your portfolio volatility is ${(portfolio.riskMetrics.volatility * 100).toFixed(1)}%, which is above average market volatility.`,
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Add defensive assets like bonds or utilities',
          'Consider dollar-cost averaging for new investments',
          'Review your risk tolerance and investment timeline',
        ],
        impact: {
          financial: 0,
          risk: -20,
          timeline: '1-2 months',
        },
        confidence: 0.82,
        createdAt: new Date(),
        userId,
      });
    }

    // Poor risk-adjusted returns
    if (portfolio.riskMetrics.sharpeRatio < 0.5) {
      insights.push({
        id: this.generateId(),
        type: 'risk_analysis',
        title: 'Low Risk-Adjusted Returns',
        description: `Your Sharpe ratio of ${portfolio.riskMetrics.sharpeRatio.toFixed(2)} suggests you're not being adequately compensated for the risk you're taking.`,
        priority: 'high',
        actionable: true,
        recommendations: [
          'Review high-fee investments that may be dragging down returns',
          'Consider low-cost index funds',
          'Rebalance to optimize risk-return profile',
        ],
        impact: {
          financial: portfolio.totalValue * 0.02, // 2% potential improvement
          risk: 0,
          timeline: '1-3 months',
        },
        confidence: 0.75,
        createdAt: new Date(),
        userId,
      });
    }

    return insights;
  }

  private async analyzeTaxOptimization(userId: string, portfolio: PortfolioAnalysis, transactions: any[]): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Tax-loss harvesting opportunities
    const losers = transactions.filter(t => t.type === 'sell' && t.gainLoss < 0);
    const totalLosses = losers.reduce((sum, t) => sum + Math.abs(t.gainLoss), 0);

    if (totalLosses > 1000) {
      insights.push({
        id: this.generateId(),
        type: 'tax_optimization',
        title: 'Tax-Loss Harvesting Opportunity',
        description: `You have approximately $${totalLosses.toFixed(0)} in realized losses that could offset capital gains.`,
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Harvest additional losses before year-end',
          'Use losses to offset capital gains',
          'Be mindful of wash sale rules',
        ],
        impact: {
          financial: totalLosses * 0.22, // Approximate tax savings at 22% rate
          risk: 0,
          timeline: 'Before year-end',
        },
        confidence: 0.88,
        createdAt: new Date(),
        userId,
      });
    }

    // Asset location optimization
    const taxableAccountValue = portfolio.totalValue * 0.6; // Assume 60% in taxable accounts
    if (taxableAccountValue > 50000) {
      insights.push({
        id: this.generateId(),
        type: 'tax_optimization',
        title: 'Asset Location Optimization',
        description: 'You may benefit from optimizing which investments are held in taxable vs. tax-advantaged accounts.',
        priority: 'low',
        actionable: true,
        recommendations: [
          'Hold tax-inefficient investments in tax-advantaged accounts',
          'Keep tax-efficient index funds in taxable accounts',
          'Consider municipal bonds for high tax brackets',
        ],
        impact: {
          financial: taxableAccountValue * 0.005, // 0.5% potential savings
          risk: 0,
          timeline: '3-6 months',
        },
        confidence: 0.65,
        createdAt: new Date(),
        userId,
      });
    }

    return insights;
  }

  private async analyzeRebalancing(userId: string, portfolio: PortfolioAnalysis): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Check if rebalancing is needed (assuming target allocation)
    const targetStocks = 0.7; // 70% stocks target
    const targetBonds = 0.3; // 30% bonds target
    const actualStocks = portfolio.assetAllocation.stocks || 0;
    const actualBonds = portfolio.assetAllocation.bonds || 0;

    const stocksDrift = Math.abs(actualStocks - targetStocks);
    const bondsDrift = Math.abs(actualBonds - targetBonds);

    if (stocksDrift > 0.05 || bondsDrift > 0.05) { // 5% drift threshold
      insights.push({
        id: this.generateId(),
        type: 'rebalancing',
        title: 'Portfolio Rebalancing Needed',
        description: `Your asset allocation has drifted from target. Stocks: ${(actualStocks * 100).toFixed(1)}% (target: 70%), Bonds: ${(actualBonds * 100).toFixed(1)}% (target: 30%).`,
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Rebalance to target allocation',
          'Use new contributions to buy underweight assets',
          'Consider tax implications when rebalancing in taxable accounts',
        ],
        impact: {
          financial: portfolio.totalValue * 0.01, // 1% potential improvement
          risk: stocksDrift > 0.05 ? 10 : -10, // Risk adjustment based on drift direction
          timeline: '1 month',
        },
        confidence: 0.90,
        createdAt: new Date(),
        userId,
      });
    }

    return insights;
  }

  private async analyzeGoalProgress(userId: string, goals: GoalProgress[]): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    goals.forEach(goal => {
      if (!goal.onTrack && goal.progressPercentage < 80) {
        const shortfall = goal.targetAmount - goal.currentAmount;
        
        insights.push({
          id: this.generateId(),
          type: 'goal_tracking',
          title: `Behind on Financial Goal`,
          description: `You're ${(100 - goal.progressPercentage).toFixed(1)}% behind on your financial goal. You need an additional $${goal.monthlyContributionNeeded.toFixed(0)}/month to get back on track.`,
          priority: goal.progressPercentage < 50 ? 'high' : 'medium',
          actionable: true,
          recommendations: [
            `Increase monthly contributions by $${goal.monthlyContributionNeeded.toFixed(0)}`,
            'Review and optimize current expenses',
            'Consider adjusting the goal timeline if needed',
          ],
          impact: {
            financial: shortfall,
            risk: 0,
            timeline: 'Immediate',
          },
          confidence: 0.95,
          createdAt: new Date(),
          userId,
        });
      }
    });

    return insights;
  }

  private async analyzeCosts(userId: string, portfolio: PortfolioAnalysis, transactions: any[]): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Estimate annual fees (simplified calculation)
    const estimatedAnnualFees = portfolio.totalValue * 0.008; // 0.8% average fee

    if (estimatedAnnualFees > 1000) {
      insights.push({
        id: this.generateId(),
        type: 'cost_analysis',
        title: 'High Investment Fees',
        description: `You're paying approximately $${estimatedAnnualFees.toFixed(0)} annually in investment fees, which could significantly impact long-term returns.`,
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Review expense ratios of your investments',
          'Consider low-cost index funds',
          'Consolidate accounts to reduce fees',
        ],
        impact: {
          financial: estimatedAnnualFees * 0.5, // 50% potential savings
          risk: 0,
          timeline: '2-3 months',
        },
        confidence: 0.70,
        createdAt: new Date(),
        userId,
      });
    }

    return insights;
  }

  private async analyzePerformance(userId: string, portfolio: PortfolioAnalysis): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Underperformance analysis
    const marketReturn = 0.10; // 10% market average
    if (portfolio.performanceMetrics.oneYearReturn < marketReturn - 0.02) { // 2% underperformance
      insights.push({
        id: this.generateId(),
        type: 'performance_review',
        title: 'Portfolio Underperformance',
        description: `Your one-year return of ${(portfolio.performanceMetrics.oneYearReturn * 100).toFixed(1)}% is below market average.`,
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Review underperforming investments',
          'Consider broad market index funds',
          'Evaluate your investment selection process',
        ],
        impact: {
          financial: portfolio.totalValue * 0.02, // 2% potential improvement
          risk: 0,
          timeline: '3-6 months',
        },
        confidence: 0.75,
        createdAt: new Date(),
        userId,
      });
    }

    return insights;
  }

  private async getUserPortfolioData(userId: string): Promise<PortfolioAnalysis> {
    // This would fetch real portfolio data from the database
    // For now, returning mock data
    return {
      totalValue: 150000,
      assetAllocation: {
        stocks: 0.85,
        bonds: 0.10,
        cash: 0.05,
      },
      riskMetrics: {
        beta: 1.15,
        volatility: 0.18,
        sharpeRatio: 0.65,
        maxDrawdown: 0.22,
      },
      diversificationScore: 0.72,
      performanceMetrics: {
        ytdReturn: 0.08,
        oneYearReturn: 0.12,
        threeYearReturn: 0.09,
        averageReturn: 0.10,
      },
    };
  }

  private async getUserGoals(userId: string): Promise<GoalProgress[]> {
    // Mock goal data
    return [
      {
        goalId: 'retirement',
        targetAmount: 1000000,
        currentAmount: 150000,
        progressPercentage: 15,
        projectedCompletion: new Date('2045-01-01'),
        onTrack: false,
        monthlyContributionNeeded: 2500,
      },
    ];
  }

  private async getRecentTransactions(userId: string, days: number): Promise<any[]> {
    // Mock transaction data
    return [
      {
        id: '1',
        type: 'sell',
        amount: 5000,
        gainLoss: -500,
        date: new Date(),
      },
      {
        id: '2',
        type: 'buy',
        amount: 3000,
        gainLoss: 0,
        date: new Date(),
      },
    ];
  }

  private async logInsightsGeneration(userId: string, insights: FinancialInsight[]): Promise<void> {
    try {
      // Log insights to database for tracking and improvement
      await this.prisma.insightGeneration.create({
        data: {
          userId,
          insightCount: insights.length,
          insights: insights.map(i => ({
            type: i.type,
            priority: i.priority,
            confidence: i.confidence,
          })),
          createdAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log insights generation: ${error.message}`);
    }
  }

  private generateId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
