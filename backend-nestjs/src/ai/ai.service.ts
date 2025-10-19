import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModelService } from './model.service';
import { RagService } from './rag.service';
import { InsightsService } from './insights.service';
import { PredictionService } from './prediction.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface AiRequest {
  userId: string;
  type: 'chat' | 'insights' | 'prediction' | 'analysis';
  query: string;
  context?: any;
  sessionId?: string;
}

export interface AiResponse {
  id: string;
  response: string;
  confidence: number;
  sources?: string[];
  recommendations?: any[];
  metadata?: any;
  timestamp: Date;
}

export interface FinancialInsight {
  id: string;
  type: 'diversification' | 'risk_analysis' | 'tax_optimization' | 'rebalancing' | 'goal_tracking';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations: string[];
  impact: {
    financial: number;
    risk: number;
    timeline: string;
  };
  confidence: number;
  createdAt: Date;
}

export interface ModelPrediction {
  id: string;
  type: 'portfolio_performance' | 'market_trend' | 'risk_assessment' | 'goal_probability';
  prediction: any;
  confidence: number;
  timeframe: string;
  factors: string[];
  scenarios: {
    optimistic: any;
    realistic: any;
    pessimistic: any;
  };
  createdAt: Date;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private modelService: ModelService,
    private ragService: RagService,
    private insightsService: InsightsService,
    private predictionService: PredictionService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
  ) {}

  async processAiRequest(request: AiRequest): Promise<AiResponse> {
    const startTime = Date.now();
    
    try {
      // Security validation
      await this.securityService.validateUserAccess(request.userId, 'ai_services');
      
      // Rate limiting check
      const rateLimitOk = await this.checkRateLimit(request.userId);
      if (!rateLimitOk) {
        throw new Error('Rate limit exceeded for AI services');
      }

      let response: AiResponse;

      switch (request.type) {
        case 'chat':
          response = await this.handleChatRequest(request);
          break;
        case 'insights':
          response = await this.handleInsightsRequest(request);
          break;
        case 'prediction':
          response = await this.handlePredictionRequest(request);
          break;
        case 'analysis':
          response = await this.handleAnalysisRequest(request);
          break;
        default:
          throw new Error(`Unsupported AI request type: ${request.type}`);
      }

      // Log the interaction
      await this.logAiInteraction(request, response);

      // Record metrics
      const responseTime = Date.now() - startTime;
      await this.monitoringService.recordMetric('ai_request_duration', responseTime, {
        type: request.type,
        userId: request.userId,
      });

      return response;

    } catch (error) {
      this.logger.error(`AI request failed: ${error.message}`, error.stack);
      
      await this.monitoringService.logError({
        level: 'error',
        message: `AI request failed: ${error.message}`,
        context: 'ai_service',
        userId: request.userId,
        metadata: { requestType: request.type, query: request.query },
      });

      throw error;
    }
  }

  private async handleChatRequest(request: AiRequest): Promise<AiResponse> {
    // Use RAG service for conversational AI
    const ragResponse = await this.ragService.generateResponse(
      request.query,
      request.userId,
      request.context
    );

    return {
      id: this.generateId(),
      response: ragResponse.answer,
      confidence: ragResponse.confidence,
      sources: ragResponse.sources,
      recommendations: ragResponse.recommendations,
      metadata: {
        type: 'chat',
        sessionId: request.sessionId,
        processingTime: ragResponse.processingTime,
      },
      timestamp: new Date(),
    };
  }

  private async handleInsightsRequest(request: AiRequest): Promise<AiResponse> {
    // Generate financial insights
    const insights = await this.insightsService.generateInsights(
      request.userId,
      request.context
    );

    return {
      id: this.generateId(),
      response: this.formatInsightsResponse(insights),
      confidence: this.calculateAverageConfidence(insights),
      recommendations: insights.map(i => ({
        type: i.type,
        title: i.title,
        priority: i.priority,
        actions: i.recommendations,
      })),
      metadata: {
        type: 'insights',
        insightCount: insights.length,
        categories: [...new Set(insights.map(i => i.type))],
      },
      timestamp: new Date(),
    };
  }

  private async handlePredictionRequest(request: AiRequest): Promise<AiResponse> {
    // Generate ML predictions
    const prediction = await this.predictionService.generatePrediction(
      request.userId,
      request.context?.predictionType || 'portfolio_performance',
      request.context
    );

    return {
      id: this.generateId(),
      response: this.formatPredictionResponse(prediction),
      confidence: prediction.confidence,
      metadata: {
        type: 'prediction',
        predictionType: prediction.type,
        timeframe: prediction.timeframe,
        factors: prediction.factors,
        scenarios: prediction.scenarios,
      },
      timestamp: new Date(),
    };
  }

  private async handleAnalysisRequest(request: AiRequest): Promise<AiResponse> {
    // Comprehensive financial analysis
    const [insights, predictions] = await Promise.all([
      this.insightsService.generateInsights(request.userId, request.context),
      this.predictionService.generatePrediction(
        request.userId,
        'portfolio_performance',
        request.context
      ),
    ]);

    const analysisResponse = this.generateComprehensiveAnalysis(insights, predictions);

    return {
      id: this.generateId(),
      response: analysisResponse.summary,
      confidence: analysisResponse.confidence,
      recommendations: analysisResponse.recommendations,
      metadata: {
        type: 'analysis',
        insightCount: insights.length,
        predictionTypes: [predictions.type],
        comprehensiveScore: analysisResponse.score,
      },
      timestamp: new Date(),
    };
  }

  async getAiHistory(userId: string, limit = 50): Promise<any[]> {
    try {
      await this.securityService.validateUserAccess(userId, 'ai_history');

      const history = await this.prisma.aiInteraction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          type: true,
          query: true,
          response: true,
          confidence: true,
          createdAt: true,
          metadata: true,
        },
      });

      return history;
    } catch (error) {
      this.logger.error(`Failed to get AI history: ${error.message}`);
      throw error;
    }
  }

  async getAiUsageStats(userId: string): Promise<any> {
    try {
      const stats = await this.prisma.aiInteraction.groupBy({
        by: ['type'],
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        _count: {
          id: true,
        },
        _avg: {
          confidence: true,
        },
      });

      const totalInteractions = await this.prisma.aiInteraction.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      return {
        totalInteractions,
        byType: stats.map(stat => ({
          type: stat.type,
          count: stat._count.id,
          averageConfidence: stat._avg.confidence,
        })),
        period: '30_days',
      };
    } catch (error) {
      this.logger.error(`Failed to get AI usage stats: ${error.message}`);
      throw error;
    }
  }

  private async checkRateLimit(userId: string): Promise<boolean> {
    const key = `ai_rate_limit:${userId}`;
    const limit = 100; // 100 requests per hour
    const window = 3600; // 1 hour in seconds

    // This would typically use Redis for distributed rate limiting
    // For now, we'll use a simple in-memory approach
    return true; // Simplified for demo
  }

  private async logAiInteraction(request: AiRequest, response: AiResponse): Promise<void> {
    try {
      await this.prisma.aiInteraction.create({
        data: {
          id: response.id,
          userId: request.userId,
          type: request.type,
          query: request.query,
          response: response.response,
          confidence: response.confidence,
          metadata: {
            ...response.metadata,
            sessionId: request.sessionId,
            sources: response.sources,
            recommendations: response.recommendations,
          },
          createdAt: response.timestamp,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log AI interaction: ${error.message}`);
      // Don't throw here to avoid breaking the main flow
    }
  }

  private formatInsightsResponse(insights: FinancialInsight[]): string {
    if (insights.length === 0) {
      return "I've analyzed your financial data and everything looks good! Your portfolio is well-balanced and on track.";
    }

    const highPriorityInsights = insights.filter(i => i.priority === 'high' || i.priority === 'critical');
    const actionableInsights = insights.filter(i => i.actionable);

    let response = `I've identified ${insights.length} insights from your financial data:\n\n`;

    if (highPriorityInsights.length > 0) {
      response += "🚨 **High Priority Items:**\n";
      highPriorityInsights.forEach(insight => {
        response += `• **${insight.title}**: ${insight.description}\n`;
      });
      response += "\n";
    }

    if (actionableInsights.length > 0) {
      response += "💡 **Actionable Recommendations:**\n";
      actionableInsights.slice(0, 3).forEach(insight => {
        response += `• ${insight.recommendations[0]}\n`;
      });
    }

    return response;
  }

  private formatPredictionResponse(prediction: ModelPrediction): string {
    const timeframe = prediction.timeframe;
    const confidence = Math.round(prediction.confidence * 100);

    let response = `Based on my analysis, here's what I predict for your ${prediction.type.replace('_', ' ')} over the ${timeframe}:\n\n`;

    response += `**Most Likely Scenario (${confidence}% confidence):**\n`;
    response += `${JSON.stringify(prediction.scenarios.realistic, null, 2)}\n\n`;

    response += `**Key Factors Influencing This Prediction:**\n`;
    prediction.factors.forEach(factor => {
      response += `• ${factor}\n`;
    });

    return response;
  }

  private generateComprehensiveAnalysis(
    insights: FinancialInsight[],
    prediction: ModelPrediction
  ): { summary: string; confidence: number; recommendations: any[]; score: number } {
    const avgInsightConfidence = this.calculateAverageConfidence(insights);
    const overallConfidence = (avgInsightConfidence + prediction.confidence) / 2;

    const criticalInsights = insights.filter(i => i.priority === 'critical').length;
    const highInsights = insights.filter(i => i.priority === 'high').length;
    
    // Calculate comprehensive score (0-100)
    const score = Math.max(0, 100 - (criticalInsights * 20) - (highInsights * 10));

    let summary = `**Comprehensive Financial Analysis**\n\n`;
    summary += `Overall Health Score: ${score}/100\n`;
    summary += `Analysis Confidence: ${Math.round(overallConfidence * 100)}%\n\n`;

    if (score >= 80) {
      summary += "🎉 Your financial health is excellent! ";
    } else if (score >= 60) {
      summary += "👍 Your financial health is good with room for improvement. ";
    } else {
      summary += "⚠️ Your financial health needs attention. ";
    }

    summary += `I've identified ${insights.length} insights and generated predictions for your portfolio performance.\n\n`;

    const recommendations = [
      ...insights.filter(i => i.actionable).slice(0, 3).map(i => ({
        type: 'insight',
        priority: i.priority,
        title: i.title,
        action: i.recommendations[0],
      })),
      {
        type: 'prediction',
        priority: 'medium',
        title: 'Portfolio Outlook',
        action: `Based on current trends, expect ${prediction.type} to ${JSON.stringify(prediction.scenarios.realistic)}`,
      },
    ];

    return {
      summary,
      confidence: overallConfidence,
      recommendations,
      score,
    };
  }

  private calculateAverageConfidence(insights: FinancialInsight[]): number {
    if (insights.length === 0) return 0.8; // Default confidence
    return insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;
  }

  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
