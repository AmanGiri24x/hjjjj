import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface RagRequest {
  query: string;
  userId: string;
  context?: any;
  maxSources?: number;
  confidenceThreshold?: number;
}

export interface RagResponse {
  answer: string;
  confidence: number;
  sources: string[];
  recommendations?: any[];
  processingTime: number;
  metadata: any;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  embedding?: number[];
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  metadata: any;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private knowledgeBase: Map<string, KnowledgeDocument> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
  ) {
    this.initializeKnowledgeBase();
  }

  private async initializeKnowledgeBase(): Promise<void> {
    try {
      // Load financial knowledge documents
      const documents = await this.loadFinancialKnowledge();
      documents.forEach(doc => {
        this.knowledgeBase.set(doc.id, doc);
      });

      this.logger.log(`Initialized knowledge base with ${documents.length} documents`);
    } catch (error) {
      this.logger.error(`Failed to initialize knowledge base: ${error.message}`);
    }
  }

  private loadFinancialKnowledge(): KnowledgeDocument[] {
    return [
      {
        id: 'portfolio-diversification',
        title: 'Portfolio Diversification Best Practices',
        content: `Portfolio diversification is a risk management strategy that involves spreading investments across various financial instruments, industries, and other categories to minimize the impact of any single asset's poor performance. Key principles include:

1. Asset Class Diversification: Spread investments across stocks, bonds, real estate, commodities, and cash equivalents.
2. Geographic Diversification: Invest in domestic and international markets to reduce country-specific risks.
3. Sector Diversification: Avoid concentration in any single industry or sector.
4. Time Diversification: Use dollar-cost averaging to spread investment timing risk.
5. Correlation Analysis: Choose assets with low correlation to each other.

The optimal diversification strategy depends on individual risk tolerance, investment goals, and time horizon. Regular rebalancing is essential to maintain desired allocation percentages.`,
        category: 'investment_strategy',
        tags: ['diversification', 'risk_management', 'portfolio', 'asset_allocation'],
        metadata: { priority: 'high', complexity: 'intermediate' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'risk-assessment',
        title: 'Investment Risk Assessment Framework',
        content: `Investment risk assessment is crucial for making informed financial decisions. Key risk types include:

1. Market Risk: The risk of losses due to market movements affecting all securities.
2. Credit Risk: The risk that a borrower will default on their obligations.
3. Liquidity Risk: The risk of not being able to sell an investment quickly without significant price impact.
4. Inflation Risk: The risk that inflation will erode the purchasing power of returns.
5. Interest Rate Risk: The risk that changes in interest rates will affect bond prices and other investments.

Risk assessment tools include:
- Value at Risk (VaR) calculations
- Beta analysis for market sensitivity
- Standard deviation for volatility measurement
- Sharpe ratio for risk-adjusted returns
- Maximum drawdown analysis

Regular risk assessment should be part of every investment strategy, with adjustments made based on changing market conditions and personal circumstances.`,
        category: 'risk_management',
        tags: ['risk_assessment', 'market_risk', 'volatility', 'var', 'beta'],
        metadata: { priority: 'high', complexity: 'advanced' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tax-optimization',
        title: 'Tax-Efficient Investment Strategies',
        content: `Tax optimization is essential for maximizing after-tax returns. Key strategies include:

1. Tax-Advantaged Accounts:
   - 401(k) and IRA contributions for retirement savings
   - HSA contributions for healthcare expenses
   - 529 plans for education expenses

2. Tax-Loss Harvesting:
   - Realize losses to offset capital gains
   - Be aware of wash sale rules
   - Consider tax-lot optimization

3. Asset Location:
   - Hold tax-inefficient investments in tax-advantaged accounts
   - Keep tax-efficient investments in taxable accounts
   - Consider municipal bonds for high-tax-bracket investors

4. Long-Term Capital Gains:
   - Hold investments for more than one year
   - Take advantage of lower long-term capital gains rates
   - Plan timing of asset sales

5. Tax-Efficient Fund Selection:
   - Choose index funds and ETFs over actively managed funds
   - Consider tax-managed funds
   - Be mindful of fund turnover rates

Regular tax planning should be integrated with investment decisions to optimize overall portfolio performance.`,
        category: 'tax_planning',
        tags: ['tax_optimization', 'tax_loss_harvesting', 'asset_location', 'capital_gains'],
        metadata: { priority: 'high', complexity: 'intermediate' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'retirement-planning',
        title: 'Comprehensive Retirement Planning Guide',
        content: `Retirement planning requires a systematic approach to ensure financial security in later years. Key components include:

1. Retirement Needs Assessment:
   - Estimate retirement expenses (typically 70-90% of pre-retirement income)
   - Consider healthcare costs and inflation
   - Plan for longevity risk

2. Savings Strategies:
   - Start early to benefit from compound interest
   - Maximize employer 401(k) matching
   - Consider Roth vs. traditional retirement accounts
   - Use catch-up contributions if over 50

3. Investment Allocation:
   - Age-appropriate asset allocation (100 - age = stock percentage rule of thumb)
   - Gradually shift to more conservative investments as retirement approaches
   - Consider target-date funds for automatic rebalancing

4. Withdrawal Strategies:
   - 4% rule as a starting point for withdrawal rates
   - Consider bucket strategy for different time horizons
   - Plan for required minimum distributions (RMDs)

5. Social Security Optimization:
   - Understand benefit calculation and timing options
   - Consider spousal benefits and survivor benefits
   - Evaluate delayed retirement credits

Regular review and adjustment of retirement plans is essential as circumstances change.`,
        category: 'retirement_planning',
        tags: ['retirement', '401k', 'ira', 'social_security', 'withdrawal_strategy'],
        metadata: { priority: 'high', complexity: 'intermediate' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'emergency-fund',
        title: 'Emergency Fund Planning and Management',
        content: `An emergency fund is a crucial component of financial security, providing a financial cushion for unexpected expenses. Guidelines include:

1. Emergency Fund Size:
   - 3-6 months of living expenses for most people
   - 6-12 months for those with irregular income
   - Consider job security, health, and family circumstances

2. What Constitutes an Emergency:
   - Job loss or income reduction
   - Major medical expenses
   - Significant home or car repairs
   - Family emergencies

3. Where to Keep Emergency Funds:
   - High-yield savings accounts for liquidity and growth
   - Money market accounts for slightly higher returns
   - Short-term CDs for portion of fund (laddered approach)
   - Avoid volatile investments like stocks

4. Building Your Emergency Fund:
   - Start with small, consistent contributions
   - Use windfalls (tax refunds, bonuses) to boost savings
   - Automate transfers to emergency fund
   - Prioritize emergency fund before other investments

5. Maintaining and Using the Fund:
   - Replenish immediately after use
   - Review fund size annually
   - Keep separate from other savings to avoid temptation
   - Consider inflation impact over time

An emergency fund provides peace of mind and prevents the need to go into debt during financial crises.`,
        category: 'financial_planning',
        tags: ['emergency_fund', 'savings', 'liquidity', 'financial_security'],
        metadata: { priority: 'high', complexity: 'beginner' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async generateResponse(
    query: string,
    userId: string,
    context?: any,
    sessionId?: string
  ): Promise<RagResponse> {
    const startTime = Date.now();

    try {
      // Validate user access
      await this.securityService.validateUserAccess(userId, 'ai_chat');

      // Get or create conversation context
      const conversationContext = await this.getConversationContext(userId, sessionId);

      // Retrieve relevant documents
      const relevantDocs = await this.retrieveRelevantDocuments(query, context);

      // Generate contextual response
      const response = await this.generateContextualResponse(
        query,
        relevantDocs,
        conversationContext,
        context
      );

      // Update conversation context
      await this.updateConversationContext(conversationContext, query, response.answer);

      const ragResponse: RagResponse = {
        answer: response.answer,
        confidence: response.confidence,
        sources: relevantDocs.map(doc => doc.title),
        recommendations: response.recommendations,
        processingTime: Date.now() - startTime,
        metadata: {
          documentsUsed: relevantDocs.length,
          sessionId: conversationContext.sessionId,
          contextLength: conversationContext.messages.length,
        },
      };

      // Record metrics
      await this.monitoringService.recordMetric('rag_response_time', ragResponse.processingTime, {
        userId,
        documentsUsed: relevantDocs.length,
      });

      return ragResponse;

    } catch (error) {
      this.logger.error(`RAG response generation failed: ${error.message}`, error.stack);
      
      await this.monitoringService.logError({
        level: 'error',
        message: `RAG response generation failed: ${error.message}`,
        context: 'rag_service',
        userId,
        metadata: { query, processingTime: Date.now() - startTime },
      });

      throw error;
    }
  }

  private async retrieveRelevantDocuments(
    query: string,
    context?: any,
    maxResults = 5
  ): Promise<KnowledgeDocument[]> {
    // Simple keyword-based retrieval (in production, use vector similarity)
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const documents = Array.from(this.knowledgeBase.values());

    const scoredDocs = documents.map(doc => {
      let score = 0;
      const docText = (doc.title + ' ' + doc.content + ' ' + doc.tags.join(' ')).toLowerCase();

      // Calculate relevance score
      queryTerms.forEach(term => {
        const titleMatches = (doc.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        const contentMatches = (doc.content.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        const tagMatches = doc.tags.some(tag => tag.toLowerCase().includes(term)) ? 1 : 0;

        score += titleMatches * 3 + contentMatches + tagMatches * 2;
      });

      // Boost score based on context
      if (context?.category && doc.category === context.category) {
        score *= 1.5;
      }

      return { doc, score };
    });

    return scoredDocs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.doc);
  }

  private async generateContextualResponse(
    query: string,
    relevantDocs: KnowledgeDocument[],
    conversationContext: ConversationContext,
    context?: any
  ): Promise<{ answer: string; confidence: number; recommendations?: any[] }> {
    // Combine relevant document content
    const knowledgeContext = relevantDocs
      .map(doc => `${doc.title}:\n${doc.content}`)
      .join('\n\n');

    // Get recent conversation history
    const recentMessages = conversationContext.messages
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Generate response using template-based approach
    const response = await this.generateTemplateResponse(
      query,
      knowledgeContext,
      recentMessages,
      context
    );

    return response;
  }

  private async generateTemplateResponse(
    query: string,
    knowledgeContext: string,
    conversationHistory: string,
    context?: any
  ): Promise<{ answer: string; confidence: number; recommendations?: any[] }> {
    // Analyze query intent
    const intent = this.analyzeQueryIntent(query);
    
    let answer = '';
    let confidence = 0.8;
    const recommendations: any[] = [];

    switch (intent.type) {
      case 'portfolio_advice':
        answer = this.generatePortfolioAdvice(query, knowledgeContext, context);
        recommendations.push({
          type: 'action',
          title: 'Review Portfolio Allocation',
          description: 'Consider rebalancing your portfolio based on current market conditions',
        });
        break;

      case 'risk_assessment':
        answer = this.generateRiskAssessment(query, knowledgeContext, context);
        recommendations.push({
          type: 'analysis',
          title: 'Risk Analysis',
          description: 'Run a comprehensive risk analysis on your current holdings',
        });
        break;

      case 'tax_planning':
        answer = this.generateTaxAdvice(query, knowledgeContext, context);
        recommendations.push({
          type: 'planning',
          title: 'Tax Optimization Review',
          description: 'Schedule a tax planning session to optimize your strategy',
        });
        break;

      case 'retirement_planning':
        answer = this.generateRetirementAdvice(query, knowledgeContext, context);
        recommendations.push({
          type: 'planning',
          title: 'Retirement Goal Review',
          description: 'Update your retirement goals and timeline',
        });
        break;

      case 'general_financial':
        answer = this.generateGeneralAdvice(query, knowledgeContext, context);
        break;

      default:
        answer = this.generateFallbackResponse(query, knowledgeContext);
        confidence = 0.6;
    }

    // Add personalization based on context
    if (context?.userProfile) {
      answer = this.personalizeResponse(answer, context.userProfile);
      confidence += 0.1;
    }

    return { answer, confidence: Math.min(confidence, 1.0), recommendations };
  }

  private analyzeQueryIntent(query: string): { type: string; confidence: number } {
    const queryLower = query.toLowerCase();

    const intentPatterns = {
      portfolio_advice: ['portfolio', 'allocation', 'diversification', 'rebalance', 'holdings'],
      risk_assessment: ['risk', 'volatility', 'safe', 'conservative', 'aggressive'],
      tax_planning: ['tax', 'deduction', 'ira', '401k', 'capital gains', 'harvest'],
      retirement_planning: ['retirement', 'retire', 'pension', 'social security', 'rmd'],
      general_financial: ['money', 'save', 'invest', 'budget', 'financial'],
    };

    let bestMatch = { type: 'general_financial', confidence: 0 };

    Object.entries(intentPatterns).forEach(([type, patterns]) => {
      const matches = patterns.filter(pattern => queryLower.includes(pattern)).length;
      const confidence = matches / patterns.length;

      if (confidence > bestMatch.confidence) {
        bestMatch = { type, confidence };
      }
    });

    return bestMatch;
  }

  private generatePortfolioAdvice(query: string, knowledge: string, context?: any): string {
    return `Based on your portfolio and current market conditions, here's my analysis:

${this.extractRelevantKnowledge(knowledge, ['diversification', 'allocation', 'rebalancing'])}

For your specific situation, I recommend:
1. Review your current asset allocation against your target
2. Consider rebalancing if any asset class is more than 5% off target
3. Evaluate your international exposure and sector diversification
4. Check if your risk level still matches your investment timeline

Would you like me to analyze your specific holdings or help you create a rebalancing plan?`;
  }

  private generateRiskAssessment(query: string, knowledge: string, context?: any): string {
    return `Let me help you assess your investment risk profile:

${this.extractRelevantKnowledge(knowledge, ['risk', 'volatility', 'assessment'])}

Key factors to consider for your risk assessment:
1. Your investment timeline and goals
2. Current portfolio volatility and correlation
3. Your comfort level with market fluctuations
4. Emergency fund and overall financial stability

Based on typical risk profiles, I can help you determine if your current allocation matches your risk tolerance. Would you like me to analyze your portfolio's risk metrics?`;
  }

  private generateTaxAdvice(query: string, knowledge: string, context?: any): string {
    return `Here are some tax optimization strategies to consider:

${this.extractRelevantKnowledge(knowledge, ['tax', 'optimization', 'harvesting'])}

Immediate actions you can take:
1. Review your tax-advantaged account contributions
2. Consider tax-loss harvesting opportunities
3. Evaluate your asset location strategy
4. Plan timing for any major transactions

Remember, tax strategies should align with your overall investment goals. Would you like me to help you identify specific tax-saving opportunities in your portfolio?`;
  }

  private generateRetirementAdvice(query: string, knowledge: string, context?: any): string {
    return `Let's work on optimizing your retirement planning:

${this.extractRelevantKnowledge(knowledge, ['retirement', 'planning', 'savings'])}

Key areas to focus on:
1. Maximize employer matching in your 401(k)
2. Consider Roth vs. traditional retirement accounts
3. Plan your Social Security claiming strategy
4. Adjust your asset allocation as you approach retirement

The earlier you start and the more consistent you are, the better your retirement outcomes will be. What specific aspect of retirement planning would you like to explore further?`;
  }

  private generateGeneralAdvice(query: string, knowledge: string, context?: any): string {
    return `I'm here to help with your financial questions. Based on the information available:

${this.extractRelevantKnowledge(knowledge, ['financial', 'planning', 'investment'])}

Some general principles that apply to most financial situations:
1. Build and maintain an emergency fund
2. Invest consistently over time
3. Diversify your investments appropriately
4. Keep costs low and tax efficiency in mind
5. Review and adjust your strategy regularly

What specific financial topic would you like to dive deeper into?`;
  }

  private generateFallbackResponse(query: string, knowledge: string): string {
    return `I understand you're asking about financial matters. While I have extensive knowledge about personal finance, investing, and financial planning, I want to make sure I give you the most relevant advice.

Could you help me understand what specific aspect of your finances you'd like to focus on? For example:
- Portfolio management and investment strategy
- Risk assessment and asset allocation
- Tax planning and optimization
- Retirement planning
- General financial planning

This will help me provide more targeted and useful guidance for your situation.`;
  }

  private extractRelevantKnowledge(knowledge: string, keywords: string[]): string {
    const sentences = knowledge.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const relevantSentences = sentences.filter(sentence =>
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );

    return relevantSentences.slice(0, 3).join('. ') + '.';
  }

  private personalizeResponse(response: string, userProfile: any): string {
    // Add personalization based on user profile
    if (userProfile.riskTolerance) {
      response += `\n\nBased on your ${userProfile.riskTolerance} risk tolerance, this approach should align well with your investment style.`;
    }

    if (userProfile.investmentGoals) {
      response += `\n\nThis strategy supports your goal of ${userProfile.investmentGoals.join(' and ')}.`;
    }

    return response;
  }

  private async getConversationContext(userId: string, sessionId?: string): Promise<ConversationContext> {
    const contextId = sessionId || `${userId}_default`;
    
    let context = this.conversationContexts.get(contextId);
    if (!context) {
      context = {
        sessionId: contextId,
        userId,
        messages: [],
        metadata: { createdAt: new Date() },
      };
      this.conversationContexts.set(contextId, context);
    }

    return context;
  }

  private async updateConversationContext(
    context: ConversationContext,
    userMessage: string,
    assistantResponse: string
  ): Promise<void> {
    const now = new Date();
    
    context.messages.push(
      { role: 'user', content: userMessage, timestamp: now },
      { role: 'assistant', content: assistantResponse, timestamp: now }
    );

    // Keep only last 20 messages to prevent memory issues
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }

    // Update context in storage (in production, persist to database)
    this.conversationContexts.set(context.sessionId, context);
  }

  async addKnowledgeDocument(document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const knowledgeDoc: KnowledgeDocument = {
      id,
      ...document,
      createdAt: now,
      updatedAt: now,
    };

    this.knowledgeBase.set(id, knowledgeDoc);
    this.logger.log(`Added knowledge document: ${document.title}`);

    return id;
  }

  async getKnowledgeDocuments(category?: string): Promise<KnowledgeDocument[]> {
    const documents = Array.from(this.knowledgeBase.values());
    
    if (category) {
      return documents.filter(doc => doc.category === category);
    }

    return documents;
  }
}
