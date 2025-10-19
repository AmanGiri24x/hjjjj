import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { GeminiService } from './gemini.service';
import { PersonalizationService } from './personalization.service';

export interface FinnyMessage {
  id: string;
  sessionId: string;
  userId: string;
  type: 'user' | 'assistant';
  content: string;
  context?: any;
  metadata?: any;
  timestamp: Date;
  processed: boolean;
}

export interface FinnyResponse {
  messageId: string;
  content: string;
  confidence: number;
  sources: string[];
  recommendations: any[];
  followUpQuestions: string[];
  actionItems: string[];
  personalizedInsights: any[];
  riskAssessment?: any;
  marketContext?: any;
  processingTime: number;
}

@Injectable()
export class FinnyService {
  private readonly logger = new Logger(FinnyService.name);

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
    private geminiService: GeminiService,
    private personalizationService: PersonalizationService,
  ) {}

  async processUserMessage(
    userId: string,
    message: string,
    context?: string,
    includePersonalization: boolean = true,
    sessionId?: string
  ): Promise<FinnyResponse> {
    const startTime = Date.now();
    
    try {
      // Validate user access and rate limiting
      await this.securityService.validateUserAccess(userId, 'finny_chat');
      await this.securityService.checkRateLimit(userId, 'finny_chat', 20, 3600); // 20 requests per hour

      // Create or get session
      const activeSessionId = sessionId || await this.createChatSession(userId);

      // Store user message
      const userMessage = await this.storeMessage({
        id: this.generateMessageId(),
        sessionId: activeSessionId,
        userId,
        type: 'user',
        content: message,
        context: context ? JSON.parse(context) : undefined,
        timestamp: new Date(),
        processed: false,
      });

      // Get user personalization profile if requested
      let personalizationData = null;
      if (includePersonalization) {
        personalizationData = await this.personalizationService.getUserPersonalizationProfile(userId);
      }

      // Process message with Gemini AI
      const aiResponse = await this.geminiService.generateFinancialAdvice(
        userId,
        message,
        {
          sessionId: activeSessionId,
          context,
          personalization: personalizationData,
          conversationHistory: await this.getRecentConversationHistory(activeSessionId),
        }
      );

      // Enhance response with additional insights
      const enhancedResponse = await this.enhanceResponse(userId, aiResponse, message);

      // Store assistant response
      const assistantMessage = await this.storeMessage({
        id: this.generateMessageId(),
        sessionId: activeSessionId,
        userId,
        type: 'assistant',
        content: enhancedResponse.content,
        metadata: {
          confidence: enhancedResponse.confidence,
          sources: enhancedResponse.sources,
          recommendations: enhancedResponse.recommendations,
          processingTime: Date.now() - startTime,
        },
        timestamp: new Date(),
        processed: true,
      });

      // Update user personalization based on interaction
      if (includePersonalization) {
        await this.personalizationService.updateFromInteraction(userId, message, enhancedResponse);
      }

      // Record metrics
      await this.recordInteractionMetrics(userId, message, enhancedResponse, Date.now() - startTime);

      const finalResponse: FinnyResponse = {
        messageId: assistantMessage.id,
        content: enhancedResponse.content,
        confidence: enhancedResponse.confidence,
        sources: enhancedResponse.sources || [],
        recommendations: enhancedResponse.recommendations || [],
        followUpQuestions: enhancedResponse.followUpQuestions || [],
        actionItems: enhancedResponse.actionItems || [],
        personalizedInsights: enhancedResponse.personalizedInsights || [],
        riskAssessment: enhancedResponse.riskAssessment,
        marketContext: enhancedResponse.marketContext,
        processingTime: Date.now() - startTime,
      };

      this.logger.log(`Processed Finny message for user ${userId} in ${finalResponse.processingTime}ms`);

      return finalResponse;
    } catch (error) {
      this.logger.error(`Failed to process Finny message: ${error.message}`);
      await this.monitoringService.recordError('finny_message_processing_failed', error);
      
      // Return fallback response
      return this.generateFallbackResponse(message, Date.now() - startTime);
    }
  }

  async getUserSessionHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      await this.securityService.validateUserAccess(userId, 'finny_history');

      const sessions = await this.getChatSessions(userId, limit);
      
      return sessions.map(session => ({
        sessionId: session.id,
        startTime: session.createdAt,
        lastActivity: session.updatedAt,
        messageCount: session.messageCount,
        topics: session.topics || [],
        summary: session.summary,
        satisfaction: session.userRating,
      }));
    } catch (error) {
      this.logger.error(`Failed to get session history: ${error.message}`);
      throw error;
    }
  }

  async recordUserFeedback(
    userId: string,
    sessionId: string,
    messageId: string,
    rating: number,
    feedback?: string,
    helpful?: boolean
  ): Promise<void> {
    try {
      await this.securityService.validateUserAccess(userId, 'finny_feedback');

      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Store feedback
      await this.storeFeedback({
        id: this.generateId(),
        userId,
        sessionId,
        messageId,
        rating,
        feedback,
        helpful,
        createdAt: new Date(),
      });

      // Update personalization based on feedback
      await this.personalizationService.updateFromFeedback(userId, rating, feedback, helpful);

      // Record metrics
      await this.monitoringService.recordMetric('finny_user_rating', rating);
      await this.monitoringService.recordMetric('finny_helpful_responses', helpful ? 1 : 0);

      this.logger.log(`Recorded feedback for message ${messageId}: rating=${rating}, helpful=${helpful}`);
    } catch (error) {
      this.logger.error(`Failed to record feedback: ${error.message}`);
      throw error;
    }
  }

  async getFinnyAnalytics(userId: string): Promise<any> {
    try {
      await this.securityService.validateUserAccess(userId, 'finny_analytics');

      const analytics = {
        usage: await this.getUserUsageStats(userId),
        satisfaction: await this.getUserSatisfactionStats(userId),
        topics: await this.getUserTopicStats(userId),
        improvements: await this.getPersonalizedImprovements(userId),
        insights: await this.getUsageInsights(userId),
      };

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get Finny analytics: ${error.message}`);
      throw error;
    }
  }

  private async enhanceResponse(userId: string, aiResponse: any, originalMessage: string): Promise<any> {
    try {
      // Add personalized insights
      const personalizedInsights = await this.generatePersonalizedInsights(userId, originalMessage);

      // Add market context if relevant
      const marketContext = await this.addMarketContext(originalMessage);

      // Generate follow-up questions
      const followUpQuestions = await this.generateFollowUpQuestions(originalMessage, aiResponse);

      // Extract action items
      const actionItems = await this.extractActionItems(aiResponse.content);

      // Assess risk if financial advice is given
      const riskAssessment = await this.assessResponseRisk(aiResponse.content);

      return {
        ...aiResponse,
        personalizedInsights,
        marketContext,
        followUpQuestions,
        actionItems,
        riskAssessment,
      };
    } catch (error) {
      this.logger.error(`Failed to enhance response: ${error.message}`);
      return aiResponse; // Return original response if enhancement fails
    }
  }

  private async generatePersonalizedInsights(userId: string, message: string): Promise<any[]> {
    try {
      const userProfile = await this.personalizationService.getUserPersonalizationProfile(userId);
      const insights = [];

      // Generate insights based on user profile and message
      if (message.toLowerCase().includes('invest') && userProfile.riskTolerance) {
        insights.push({
          type: 'risk_alignment',
          title: 'Risk Alignment Check',
          content: `Based on your ${userProfile.riskTolerance} risk tolerance, here are some considerations...`,
          relevance: 0.9,
        });
      }

      if (message.toLowerCase().includes('retire') && userProfile.age) {
        const yearsToRetirement = Math.max(65 - userProfile.age, 0);
        insights.push({
          type: 'retirement_timeline',
          title: 'Retirement Planning',
          content: `With approximately ${yearsToRetirement} years until retirement, consider...`,
          relevance: 0.8,
        });
      }

      return insights;
    } catch (error) {
      this.logger.error(`Failed to generate personalized insights: ${error.message}`);
      return [];
    }
  }

  private async addMarketContext(message: string): Promise<any> {
    try {
      // Check if message is market-related
      const marketKeywords = ['market', 'stock', 'invest', 'portfolio', 'economy', 'trading'];
      const isMarketRelated = marketKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      if (!isMarketRelated) {
        return null;
      }

      // Get current market context
      const marketData = await this.getCurrentMarketContext();
      
      return {
        marketTrend: marketData.trend,
        volatilityLevel: marketData.volatility,
        keyEvents: marketData.recentEvents,
        sectorPerformance: marketData.sectors,
        economicIndicators: marketData.indicators,
        relevanceScore: 0.7,
      };
    } catch (error) {
      this.logger.error(`Failed to add market context: ${error.message}`);
      return null;
    }
  }

  private async generateFollowUpQuestions(message: string, aiResponse: any): Promise<string[]> {
    const questions = [];

    // Generate contextual follow-up questions
    if (message.toLowerCase().includes('portfolio')) {
      questions.push('Would you like me to analyze your current portfolio allocation?');
      questions.push('Are you interested in rebalancing recommendations?');
    }

    if (message.toLowerCase().includes('risk')) {
      questions.push('Would you like a detailed risk assessment of your investments?');
      questions.push('Should we explore risk mitigation strategies?');
    }

    if (message.toLowerCase().includes('goal')) {
      questions.push('Would you like help setting up a financial goal tracking system?');
      questions.push('Should we create a timeline for achieving this goal?');
    }

    // Limit to 3 most relevant questions
    return questions.slice(0, 3);
  }

  private async extractActionItems(responseContent: string): Promise<string[]> {
    const actionItems = [];

    // Use simple keyword extraction for action items
    const actionKeywords = [
      'should consider',
      'recommend',
      'suggest',
      'action:',
      'next step',
      'to do:',
    ];

    const sentences = responseContent.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (actionKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 10) {
          actionItems.push(cleanSentence);
        }
      }
    }

    return actionItems.slice(0, 5); // Limit to 5 action items
  }

  private async assessResponseRisk(content: string): Promise<any> {
    const riskKeywords = {
      high: ['volatile', 'risky', 'speculative', 'aggressive', 'high-risk'],
      medium: ['moderate', 'balanced', 'diversified', 'conservative'],
      low: ['safe', 'stable', 'guaranteed', 'low-risk', 'bonds'],
    };

    let riskLevel = 'medium';
    let riskScore = 0.5;

    const lowerContent = content.toLowerCase();

    // Calculate risk score based on keywords
    for (const [level, keywords] of Object.entries(riskKeywords)) {
      const matchCount = keywords.filter(keyword => lowerContent.includes(keyword)).length;
      if (matchCount > 0) {
        if (level === 'high') {
          riskLevel = 'high';
          riskScore = 0.8;
        } else if (level === 'low') {
          riskLevel = 'low';
          riskScore = 0.2;
        }
      }
    }

    return {
      level: riskLevel,
      score: riskScore,
      disclaimer: this.getRiskDisclaimer(riskLevel),
      factors: this.identifyRiskFactors(content),
    };
  }

  private getRiskDisclaimer(riskLevel: string): string {
    const disclaimers = {
      high: 'High-risk investments can result in significant losses. Please consider your risk tolerance carefully.',
      medium: 'All investments carry some level of risk. Past performance does not guarantee future results.',
      low: 'While considered lower risk, no investment is completely risk-free.',
    };

    return disclaimers[riskLevel] || disclaimers.medium;
  }

  private identifyRiskFactors(content: string): string[] {
    const factors = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('market volatility')) factors.push('Market Volatility');
    if (lowerContent.includes('inflation')) factors.push('Inflation Risk');
    if (lowerContent.includes('interest rate')) factors.push('Interest Rate Risk');
    if (lowerContent.includes('liquidity')) factors.push('Liquidity Risk');
    if (lowerContent.includes('credit')) factors.push('Credit Risk');

    return factors;
  }

  private generateFallbackResponse(message: string, processingTime: number): FinnyResponse {
    return {
      messageId: this.generateMessageId(),
      content: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or contact our support team if the issue persists.",
      confidence: 0.1,
      sources: [],
      recommendations: [],
      followUpQuestions: ['Would you like to try asking your question differently?'],
      actionItems: ['Contact support if the issue continues'],
      personalizedInsights: [],
      processingTime,
    };
  }

  private async recordInteractionMetrics(userId: string, message: string, response: any, processingTime: number): Promise<void> {
    try {
      await this.monitoringService.recordMetric('finny_interactions_total', 1);
      await this.monitoringService.recordMetric('finny_processing_time', processingTime);
      await this.monitoringService.recordMetric('finny_confidence_score', response.confidence);
      await this.monitoringService.recordMetric('finny_message_length', message.length);
      await this.monitoringService.recordMetric('finny_response_length', response.content.length);
    } catch (error) {
      this.logger.error(`Failed to record interaction metrics: ${error.message}`);
    }
  }

  private async createChatSession(userId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    
    // In real implementation, create session in database
    await this.prisma.finnySession.create({
      data: {
        id: sessionId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
      },
    });

    return sessionId;
  }

  private async storeMessage(message: FinnyMessage): Promise<FinnyMessage> {
    // In real implementation, store in database
    return message;
  }

  private async storeFeedback(feedback: any): Promise<void> {
    // In real implementation, store in database
  }

  private async getRecentConversationHistory(sessionId: string, limit: number = 10): Promise<FinnyMessage[]> {
    // In real implementation, fetch from database
    return [];
  }

  private async getChatSessions(userId: string, limit: number): Promise<any[]> {
    // In real implementation, fetch from database
    return [];
  }

  private async getCurrentMarketContext(): Promise<any> {
    return {
      trend: 'bullish',
      volatility: 'medium',
      recentEvents: ['Fed rate decision', 'Earnings season'],
      sectors: { tech: 'outperforming', healthcare: 'stable' },
      indicators: { vix: 18.5, yield: 4.2 },
    };
  }

  private async getUserUsageStats(userId: string): Promise<any> {
    return {
      totalSessions: 25,
      totalMessages: 150,
      averageSessionLength: 8,
      mostActiveHour: 14,
      favoriteTopics: ['portfolio', 'retirement', 'risk'],
    };
  }

  private async getUserSatisfactionStats(userId: string): Promise<any> {
    return {
      averageRating: 4.6,
      totalRatings: 45,
      helpfulResponses: 42,
      improvementTrend: 'positive',
    };
  }

  private async getUserTopicStats(userId: string): Promise<any> {
    return {
      mostDiscussed: ['Investment Strategy', 'Portfolio Optimization', 'Risk Management'],
      emerging: ['ESG Investing', 'Cryptocurrency', 'Tax Planning'],
      expertise: ['Retirement Planning', 'Asset Allocation'],
    };
  }

  private async getPersonalizedImprovements(userId: string): Promise<any[]> {
    return [
      {
        area: 'Portfolio Diversification',
        currentScore: 7.2,
        targetScore: 8.5,
        recommendations: ['Add international exposure', 'Consider REITs'],
      },
      {
        area: 'Emergency Fund',
        currentScore: 6.8,
        targetScore: 9.0,
        recommendations: ['Increase savings rate', 'Optimize cash allocation'],
      },
    ];
  }

  private async getUsageInsights(userId: string): Promise<any[]> {
    return [
      {
        insight: 'You ask most questions about retirement planning on weekends',
        actionable: true,
        suggestion: 'Consider scheduling a dedicated retirement planning session',
      },
      {
        insight: 'Your engagement with investment topics has increased 40% this month',
        actionable: false,
        suggestion: 'This shows growing financial confidence',
      },
    ];
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
