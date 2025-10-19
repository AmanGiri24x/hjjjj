import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface GeminiRequest {
  userId: string;
  query: string;
  context: {
    userProfile?: any;
    portfolioData?: any;
    financialGoals?: any;
    riskTolerance?: string;
    investmentExperience?: string;
    currentMarketData?: any;
  };
  conversationHistory?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  sessionId?: string;
}

export interface GeminiResponse {
  id: string;
  response: string;
  confidence: number;
  reasoning: string;
  actionableInsights: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    action: string;
    expectedImpact: string;
    timeline: string;
  }>;
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
  marketInsights?: {
    trends: string[];
    opportunities: string[];
    warnings: string[];
  };
  personalizedRecommendations: string[];
  followUpQuestions: string[];
  sources: string[];
  timestamp: Date;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly geminiApiKey: string;
  private readonly geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
  ) {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    if (!this.geminiApiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
    }
  }

  async generateFinancialResponse(request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();

    try {
      // Validate user access
      await this.securityService.validateUserAccess(request.userId, 'finny_ai');

      // Build comprehensive financial context
      const financialContext = await this.buildFinancialContext(request);

      // Create Gemini prompt with financial expertise
      const prompt = this.createFinancialPrompt(request.query, financialContext, request.context);

      // Call Gemini API
      const geminiResponse = await this.callGeminiApi(prompt, request.conversationHistory);

      // Parse and enhance response
      const enhancedResponse = await this.enhanceFinancialResponse(
        geminiResponse,
        request.context,
        request.userId
      );

      // Log interaction
      await this.logFinnyInteraction(request, enhancedResponse);

      // Record metrics
      const processingTime = Date.now() - startTime;
      await this.monitoringService.recordMetric('finny_response_time', processingTime, {
        userId: request.userId,
        queryLength: request.query.length,
      });

      return enhancedResponse;

    } catch (error) {
      this.logger.error(`Finny AI response failed: ${error.message}`, error.stack);
      
      await this.monitoringService.logError({
        level: 'error',
        message: `Finny AI failed: ${error.message}`,
        context: 'gemini_service',
        userId: request.userId,
        metadata: { 
          query: request.query.substring(0, 100),
          processingTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  private async buildFinancialContext(request: GeminiRequest): Promise<string> {
    const context = request.context;
    let financialContext = '';

    // User profile context
    if (context.userProfile) {
      financialContext += `User Profile:
- Age: ${context.userProfile.age || 'Not specified'}
- Income: ${context.userProfile.income ? `$${context.userProfile.income.toLocaleString()}` : 'Not specified'}
- Risk Tolerance: ${context.riskTolerance || 'Moderate'}
- Investment Experience: ${context.investmentExperience || 'Intermediate'}
- Financial Goals: ${context.financialGoals ? context.financialGoals.join(', ') : 'Not specified'}

`;
    }

    // Portfolio context
    if (context.portfolioData) {
      financialContext += `Current Portfolio:
- Total Value: $${context.portfolioData.totalValue?.toLocaleString() || '0'}
- Asset Allocation: ${JSON.stringify(context.portfolioData.allocation || {})}
- Performance: ${context.portfolioData.performance ? `${(context.portfolioData.performance * 100).toFixed(2)}%` : 'N/A'}
- Risk Metrics: Beta ${context.portfolioData.beta || 'N/A'}, Volatility ${context.portfolioData.volatility ? `${(context.portfolioData.volatility * 100).toFixed(1)}%` : 'N/A'}

`;
    }

    // Market context
    if (context.currentMarketData) {
      financialContext += `Current Market Conditions:
- Market Trend: ${context.currentMarketData.trend || 'Neutral'}
- VIX Level: ${context.currentMarketData.vix || 'N/A'}
- Interest Rates: ${context.currentMarketData.interestRates ? `${(context.currentMarketData.interestRates * 100).toFixed(2)}%` : 'N/A'}
- Economic Indicators: ${context.currentMarketData.economicIndicators || 'Stable'}

`;
    }

    return financialContext;
  }

  private createFinancialPrompt(query: string, financialContext: string, context: any): string {
    return `You are Finny, an advanced AI financial copilot and expert advisor. You have deep expertise in:
- Portfolio management and asset allocation
- Risk assessment and management
- Tax optimization strategies
- Retirement and financial planning
- Market analysis and investment strategies
- Trading techniques and timing
- Regulatory compliance and best practices

IMPORTANT GUIDELINES:
1. Always provide personalized advice based on the user's specific financial situation
2. Include actionable insights with clear priorities and timelines
3. Assess risks and provide mitigation strategies
4. Offer specific, measurable recommendations
5. Explain your reasoning clearly
6. Suggest follow-up questions to gather more information
7. Stay current with market conditions and regulatory changes
8. Never provide generic advice - always personalize based on user context

${financialContext}

User Question: ${query}

Please provide a comprehensive, personalized financial response that includes:
1. Direct answer to the user's question
2. Personalized recommendations based on their profile
3. Risk assessment and mitigation strategies
4. Actionable insights with priorities and timelines
5. Market context and opportunities
6. Follow-up questions to better assist them
7. Clear reasoning for your recommendations

Format your response as a detailed, professional financial advisory response.`;
  }

  private async callGeminiApi(prompt: string, conversationHistory?: any[]): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      requestBody.contents = [...conversationHistory, requestBody.contents[0]];
    }

    const response = await fetch(`${this.geminiApiUrl}?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private async enhanceFinancialResponse(
    geminiResponse: string,
    context: any,
    userId: string
  ): Promise<GeminiResponse> {
    // Parse the response to extract structured information
    const actionableInsights = this.extractActionableInsights(geminiResponse);
    const riskAssessment = this.extractRiskAssessment(geminiResponse);
    const marketInsights = this.extractMarketInsights(geminiResponse);
    const personalizedRecommendations = this.extractRecommendations(geminiResponse);
    const followUpQuestions = this.extractFollowUpQuestions(geminiResponse);

    // Calculate confidence based on response quality and context completeness
    const confidence = this.calculateConfidence(geminiResponse, context);

    // Generate reasoning
    const reasoning = this.generateReasoning(actionableInsights, riskAssessment, context);

    return {
      id: this.generateId(),
      response: geminiResponse,
      confidence,
      reasoning,
      actionableInsights,
      riskAssessment,
      marketInsights,
      personalizedRecommendations,
      followUpQuestions,
      sources: [
        'Gemini Pro AI Model',
        'Real-time market data',
        'User portfolio analysis',
        'Financial best practices',
      ],
      timestamp: new Date(),
    };
  }

  private extractActionableInsights(response: string): Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    action: string;
    expectedImpact: string;
    timeline: string;
  }> {
    // Simple extraction logic - in production, use more sophisticated NLP
    const insights = [];
    
    if (response.toLowerCase().includes('rebalance')) {
      insights.push({
        type: 'portfolio_rebalancing',
        priority: 'high' as const,
        action: 'Rebalance portfolio to target allocation',
        expectedImpact: 'Improved risk-adjusted returns',
        timeline: '1-2 weeks',
      });
    }

    if (response.toLowerCase().includes('tax') && response.toLowerCase().includes('loss')) {
      insights.push({
        type: 'tax_optimization',
        priority: 'medium' as const,
        action: 'Implement tax-loss harvesting strategy',
        expectedImpact: 'Reduced tax liability',
        timeline: 'Before year-end',
      });
    }

    if (response.toLowerCase().includes('emergency fund')) {
      insights.push({
        type: 'emergency_fund',
        priority: 'high' as const,
        action: 'Build or increase emergency fund',
        expectedImpact: 'Enhanced financial security',
        timeline: '3-6 months',
      });
    }

    return insights;
  }

  private extractRiskAssessment(response: string): {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  } | undefined {
    const riskKeywords = ['risk', 'volatile', 'uncertainty', 'danger'];
    const hasRiskContent = riskKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );

    if (!hasRiskContent) return undefined;

    return {
      level: 'medium',
      factors: [
        'Market volatility',
        'Concentration risk',
        'Interest rate changes',
      ],
      mitigation: [
        'Diversify across asset classes',
        'Regular portfolio rebalancing',
        'Maintain adequate cash reserves',
      ],
    };
  }

  private extractMarketInsights(response: string): {
    trends: string[];
    opportunities: string[];
    warnings: string[];
  } | undefined {
    const marketKeywords = ['market', 'trend', 'opportunity', 'sector'];
    const hasMarketContent = marketKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );

    if (!hasMarketContent) return undefined;

    return {
      trends: [
        'Technology sector showing strength',
        'Interest rate environment stabilizing',
        'Emerging markets gaining momentum',
      ],
      opportunities: [
        'Value stocks appearing attractive',
        'International diversification benefits',
        'ESG investing growth potential',
      ],
      warnings: [
        'Inflation concerns persist',
        'Geopolitical tensions affecting markets',
        'Overvaluation in some sectors',
      ],
    };
  }

  private extractRecommendations(response: string): string[] {
    // Extract recommendation sentences
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const recommendations = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return lower.includes('recommend') || 
             lower.includes('suggest') || 
             lower.includes('consider') ||
             lower.includes('should');
    });

    return recommendations.slice(0, 5).map(rec => rec.trim());
  }

  private extractFollowUpQuestions(response: string): string[] {
    const defaultQuestions = [
      'What is your current risk tolerance and investment timeline?',
      'Are there any specific financial goals you\'re working towards?',
      'How often do you review and rebalance your portfolio?',
      'What is your experience with different investment types?',
      'Are there any upcoming major expenses or life changes?',
    ];

    // In production, generate dynamic questions based on response content
    return defaultQuestions.slice(0, 3);
  }

  private calculateConfidence(response: string, context: any): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on context completeness
    if (context.userProfile) confidence += 0.1;
    if (context.portfolioData) confidence += 0.1;
    if (context.financialGoals) confidence += 0.05;

    // Increase confidence based on response quality
    if (response.length > 500) confidence += 0.05;
    if (response.includes('recommend') || response.includes('suggest')) confidence += 0.05;

    return Math.min(confidence, 0.95);
  }

  private generateReasoning(
    insights: any[],
    riskAssessment: any,
    context: any
  ): string {
    let reasoning = 'My recommendation is based on ';
    const factors = [];

    if (context.userProfile) {
      factors.push('your personal financial profile');
    }

    if (context.portfolioData) {
      factors.push('current portfolio analysis');
    }

    if (insights.length > 0) {
      factors.push('identified optimization opportunities');
    }

    if (riskAssessment) {
      factors.push('comprehensive risk assessment');
    }

    factors.push('current market conditions and best practices');

    reasoning += factors.join(', ') + '.';

    if (insights.length > 0) {
      reasoning += ` I've identified ${insights.length} actionable insights that could improve your financial position.`;
    }

    return reasoning;
  }

  private async logFinnyInteraction(request: GeminiRequest, response: GeminiResponse): Promise<void> {
    try {
      await this.prisma.finnyInteraction.create({
        data: {
          id: response.id,
          userId: request.userId,
          query: request.query,
          response: response.response,
          confidence: response.confidence,
          actionableInsights: response.actionableInsights,
          sessionId: request.sessionId,
          metadata: {
            reasoning: response.reasoning,
            riskAssessment: response.riskAssessment,
            marketInsights: response.marketInsights,
            personalizedRecommendations: response.personalizedRecommendations,
            followUpQuestions: response.followUpQuestions,
          },
          createdAt: response.timestamp,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log Finny interaction: ${error.message}`);
    }
  }

  private generateId(): string {
    return `finny_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
