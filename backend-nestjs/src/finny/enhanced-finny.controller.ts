import { Controller, Post, Get, Body, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinnyService } from './finny.service';
import { SupabaseDirectService } from '../database/supabase-direct.service';
import { GeminiService } from './gemini.service';

interface FinnyRequest {
  message: string;
  context?: string;
  includePersonalization?: boolean;
  sessionId?: string;
}

@Controller('api/finny')
@UseGuards(JwtAuthGuard)
export class EnhancedFinnyController {
  constructor(
    private readonly finnyService: FinnyService,
    private readonly supabaseService: SupabaseDirectService,
    private readonly geminiService: GeminiService,
  ) {}

  @Post('chat')
  async chat(@Request() req, @Body() body: FinnyRequest) {
    const userId = req.user.id;
    
    try {
      // Get user's real financial data for context
      const financialSummary = await this.supabaseService.getFinancialSummary(userId);
      
      // Build enhanced context with real data
      const enhancedContext = await this.buildFinancialContext(userId, financialSummary, body.message);
      
      // Get AI response with real financial context
      const aiResponse = await this.getEnhancedAIResponse(body.message, enhancedContext);
      
      // Process through Finny service for additional enhancements
      const finnyResponse = await this.finnyService.processUserMessage(
        userId,
        body.message,
        JSON.stringify(enhancedContext),
        body.includePersonalization ?? true,
        body.sessionId
      );

      // Merge AI response with Finny enhancements
      return {
        messageId: finnyResponse.messageId,
        content: aiResponse.content,
        confidence: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        actionItems: aiResponse.actionItems,
        personalizedInsights: aiResponse.personalizedInsights,
        riskAssessment: aiResponse.riskAssessment,
        followUpQuestions: finnyResponse.followUpQuestions,
        processingTime: finnyResponse.processingTime,
        financialContext: {
          totalIncome: financialSummary.totalIncome,
          totalExpenses: financialSummary.totalExpenses,
          netSavings: financialSummary.netSavings,
          savingsRate: ((financialSummary.netSavings / financialSummary.totalIncome) * 100).toFixed(1),
          topCategories: financialSummary.topCategories?.slice(0, 3) || []
        }
      };
    } catch (error) {
      console.error('Enhanced Finny chat error:', error);
      
      // Fallback to basic Finny response
      return this.finnyService.processUserMessage(
        userId,
        body.message,
        body.context,
        body.includePersonalization ?? true,
        body.sessionId
      );
    }
  }

  @Get('financial-insights')
  async getFinancialInsights(@Request() req) {
    const userId = req.user.id;
    
    try {
      const financialSummary = await this.supabaseService.getFinancialSummary(userId);
      const insights = await this.generateFinancialInsights(financialSummary);
      
      return {
        insights,
        summary: financialSummary,
        recommendations: await this.generateSmartRecommendations(financialSummary),
        riskAssessment: await this.assessFinancialRisk(financialSummary)
      };
    } catch (error) {
      console.error('Financial insights error:', error);
      throw error;
    }
  }

  @Post('quick-analysis')
  async quickAnalysis(@Request() req, @Body() body: { type: string; data?: any }) {
    const userId = req.user.id;
    
    try {
      const financialSummary = await this.supabaseService.getFinancialSummary(userId);
      
      switch (body.type) {
        case 'spending':
          return this.analyzeSpending(financialSummary);
        case 'savings':
          return this.analyzeSavings(financialSummary);
        case 'investment':
          return this.analyzeInvestmentReadiness(financialSummary);
        case 'budget':
          return this.analyzeBudget(financialSummary);
        default:
          return this.generateGeneralAnalysis(financialSummary);
      }
    } catch (error) {
      console.error('Quick analysis error:', error);
      throw error;
    }
  }

  @Get('personalized-tips')
  async getPersonalizedTips(@Request() req, @Query('category') category?: string) {
    const userId = req.user.id;
    
    try {
      const financialSummary = await this.supabaseService.getFinancialSummary(userId);
      const tips = await this.generatePersonalizedTips(financialSummary, category);
      
      return {
        tips,
        category: category || 'general',
        basedOnData: {
          totalTransactions: financialSummary.recentTransactions?.length || 0,
          analysisDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Personalized tips error:', error);
      throw error;
    }
  }

  private async buildFinancialContext(userId: string, financialSummary: any, message: string) {
    const context = {
      userId,
      financialProfile: {
        totalIncome: financialSummary.totalIncome || 0,
        totalExpenses: financialSummary.totalExpenses || 0,
        netSavings: financialSummary.netSavings || 0,
        monthlyIncome: financialSummary.monthlyIncome || 0,
        monthlyExpenses: financialSummary.monthlyExpenses || 0,
        savingsRate: financialSummary.totalIncome > 0 ? 
          ((financialSummary.netSavings / financialSummary.totalIncome) * 100).toFixed(1) : '0',
        topCategories: financialSummary.topCategories || [],
        recentTransactions: financialSummary.recentTransactions?.slice(0, 5) || []
      },
      userQuery: message,
      timestamp: new Date().toISOString()
    };

    return context;
  }

  private async getEnhancedAIResponse(message: string, context: any) {
    const lowerMessage = message.toLowerCase();
    
    // Spending analysis
    if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      return this.generateSpendingResponse(context);
    }
    
    // Investment advice
    if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return this.generateInvestmentResponse(context);
    }
    
    // Savings advice
    if (lowerMessage.includes('save') || lowerMessage.includes('goal')) {
      return this.generateSavingsResponse(context);
    }
    
    // Budget advice
    if (lowerMessage.includes('budget')) {
      return this.generateBudgetResponse(context);
    }
    
    // Use Gemini AI for complex queries
    return this.generateGeminiResponse(message, context);
  }

  private generateSpendingResponse(context: any) {
    const { financialProfile } = context;
    const savingsRate = parseFloat(financialProfile.savingsRate);
    const topCategory = financialProfile.topCategories[0];
    
    return {
      content: `Based on your actual spending data:

💰 **Your Spending Overview:**
• Monthly expenses: ₹${financialProfile.monthlyExpenses.toLocaleString()}
• Savings rate: ${financialProfile.savingsRate}% ${savingsRate >= 20 ? '✅ Excellent!' : savingsRate >= 10 ? '⚠️ Good, but can improve' : '🔴 Needs attention'}
• Top category: ${topCategory?.category || 'Unknown'} (₹${topCategory?.amount?.toLocaleString() || 0})

📊 **Analysis:**
${savingsRate < 10 ? 
  'Your savings rate is below 10%. Focus on reducing expenses or increasing income.' :
  savingsRate < 20 ?
  'Your savings rate is decent but aim for 20%+ for better financial health.' :
  'Great job! Your savings rate shows excellent financial discipline.'
}

💡 **Key Insights:**
• You spend ${((financialProfile.monthlyExpenses / financialProfile.monthlyIncome) * 100).toFixed(1)}% of your income
• Recommended: 50% needs, 30% wants, 20% savings`,
      confidence: 0.92,
      recommendations: this.generateSpendingRecommendations(financialProfile),
      actionItems: [
        'Review your top spending categories',
        'Set monthly budgets for each category',
        'Track daily expenses for better control'
      ],
      personalizedInsights: [
        {
          type: 'spending_pattern',
          title: 'Spending Pattern Analysis',
          content: `Your ${topCategory?.category || 'top'} spending represents ${topCategory?.percentage?.toFixed(1) || 0}% of total expenses`
        }
      ]
    };
  }

  private generateInvestmentResponse(context: any) {
    const { financialProfile } = context;
    const availableForInvestment = Math.max(0, financialProfile.netSavings);
    const emergencyFund = financialProfile.monthlyExpenses * 6;
    
    return {
      content: `Investment advice based on your financial profile:

💼 **Investment Readiness:**
• Available savings: ₹${availableForInvestment.toLocaleString()}
• Emergency fund needed: ₹${emergencyFund.toLocaleString()}
• Investment capacity: ${availableForInvestment > emergencyFund ? '✅ Ready to invest' : '⚠️ Build emergency fund first'}

🎯 **Recommended Allocation:**
${availableForInvestment > emergencyFund ? `
• Equity (60%): ₹${(availableForInvestment * 0.6).toLocaleString()}
• Debt (30%): ₹${(availableForInvestment * 0.3).toLocaleString()}
• Gold/Others (10%): ₹${(availableForInvestment * 0.1).toLocaleString()}` : `
• Focus on building emergency fund first
• Start small SIPs (₹1000-5000/month)
• Consider liquid funds for emergency corpus`}

📈 **Investment Options:**
• Index funds for equity exposure
• ELSS for tax benefits (80C)
• PPF for long-term savings
• Liquid funds for emergency money`,
      confidence: 0.88,
      recommendations: this.generateInvestmentRecommendations(financialProfile),
      actionItems: [
        availableForInvestment > emergencyFund ? 'Start SIP in diversified equity funds' : 'Build emergency fund first',
        'Open investment accounts (demat, mutual fund)',
        'Set investment goals and timeline'
      ],
      riskAssessment: {
        level: availableForInvestment > emergencyFund ? 'medium' : 'low',
        score: availableForInvestment > emergencyFund ? 0.6 : 0.3,
        factors: ['Emergency fund status', 'Available surplus', 'Income stability']
      }
    };
  }

  private generateSavingsResponse(context: any) {
    const { financialProfile } = context;
    const targetSavings = financialProfile.monthlyIncome * 0.2;
    const currentSavingsMonthly = financialProfile.netSavings / 12;
    
    return {
      content: `Savings analysis based on your data:

💰 **Current Savings Status:**
• Monthly savings: ₹${currentSavingsMonthly.toLocaleString()}
• Target (20%): ₹${targetSavings.toLocaleString()}
• Gap: ₹${(targetSavings - currentSavingsMonthly).toLocaleString()}

🎯 **Savings Goals:**
• Emergency fund: ₹${(financialProfile.monthlyExpenses * 6).toLocaleString()}
• Annual target: ₹${(targetSavings * 12).toLocaleString()}

📈 **Improvement Plan:**
${currentSavingsMonthly >= targetSavings ? 
  '✅ You\'re meeting the 20% savings target! Consider increasing to 25%.' :
  `⚠️ Increase savings by ₹${(targetSavings - currentSavingsMonthly).toLocaleString()}/month to reach 20% target.`
}`,
      confidence: 0.90,
      recommendations: this.generateSavingsRecommendations(financialProfile),
      actionItems: [
        'Automate savings on salary day',
        'Use separate accounts for different goals',
        'Review and increase savings rate quarterly'
      ]
    };
  }

  private generateBudgetResponse(context: any) {
    const { financialProfile } = context;
    
    return {
      content: `Budget recommendations based on your spending:

📊 **Current Allocation:**
• Income: ₹${financialProfile.monthlyIncome.toLocaleString()}
• Expenses: ₹${financialProfile.monthlyExpenses.toLocaleString()} (${((financialProfile.monthlyExpenses / financialProfile.monthlyIncome) * 100).toFixed(1)}%)
• Savings: ₹${(financialProfile.monthlyIncome - financialProfile.monthlyExpenses).toLocaleString()} (${financialProfile.savingsRate}%)

🎯 **Ideal 50/30/20 Budget:**
• Needs (50%): ₹${(financialProfile.monthlyIncome * 0.5).toLocaleString()}
• Wants (30%): ₹${(financialProfile.monthlyIncome * 0.3).toLocaleString()}
• Savings (20%): ₹${(financialProfile.monthlyIncome * 0.2).toLocaleString()}

💡 **Budget Tips:**
• Track expenses daily
• Use envelope method for categories
• Review monthly and adjust`,
      confidence: 0.85,
      recommendations: this.generateBudgetRecommendations(financialProfile),
      actionItems: [
        'Categorize all expenses',
        'Set monthly limits per category',
        'Use budgeting apps for tracking'
      ]
    };
  }

  private async generateGeminiResponse(message: string, context: any) {
    try {
      const prompt = `
User's Financial Context:
${JSON.stringify(context.financialProfile, null, 2)}

User Question: ${message}

Provide personalized financial advice based on their actual data. Be specific, actionable, and reference their real numbers.
`;

      const geminiResponse = await this.geminiService.generateResponse(prompt);
      
      return {
        content: geminiResponse,
        confidence: 0.80,
        recommendations: [],
        actionItems: []
      };
    } catch (error) {
      return {
        content: `I understand you're asking about "${message}". Based on your financial profile, I'd recommend focusing on your current savings rate of ${context.financialProfile.savingsRate}% and working towards the ideal 20% target.`,
        confidence: 0.60,
        recommendations: [],
        actionItems: ['Ask more specific questions about spending, investing, or budgeting']
      };
    }
  }

  private generateSpendingRecommendations(financialProfile: any) {
    const recommendations = [];
    
    if (financialProfile.topCategories?.length > 0) {
      financialProfile.topCategories.slice(0, 3).forEach(category => {
        if (category.percentage > 25) {
          recommendations.push({
            title: `Reduce ${category.category} Spending`,
            description: `Currently ${category.percentage.toFixed(1)}% of expenses. Consider reducing by 10-15%.`,
            priority: 'high'
          });
        }
      });
    }
    
    return recommendations;
  }

  private generateInvestmentRecommendations(financialProfile: any) {
    const recommendations = [];
    const emergencyFund = financialProfile.monthlyExpenses * 6;
    
    if (financialProfile.netSavings < emergencyFund) {
      recommendations.push({
        title: 'Build Emergency Fund',
        description: `Save ₹${emergencyFund.toLocaleString()} (6 months expenses) before investing`,
        priority: 'high'
      });
    } else {
      recommendations.push({
        title: 'Start SIP Investment',
        description: 'Begin with index funds for diversified equity exposure',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  private generateSavingsRecommendations(financialProfile: any) {
    return [
      {
        title: 'Automate Savings',
        description: 'Set up automatic transfers on salary day',
        priority: 'high'
      },
      {
        title: 'Increase Savings Rate',
        description: `Target 20% savings rate (currently ${financialProfile.savingsRate}%)`,
        priority: 'medium'
      }
    ];
  }

  private generateBudgetRecommendations(financialProfile: any) {
    return [
      {
        title: 'Track Daily Expenses',
        description: 'Monitor spending in real-time for better control',
        priority: 'high'
      },
      {
        title: 'Use 50/30/20 Rule',
        description: '50% needs, 30% wants, 20% savings allocation',
        priority: 'medium'
      }
    ];
  }

  private async generateFinancialInsights(financialSummary: any) {
    // Generate comprehensive financial insights
    return [
      {
        type: 'savings_rate',
        title: 'Savings Performance',
        value: `${((financialSummary.netSavings / financialSummary.totalIncome) * 100).toFixed(1)}%`,
        status: financialSummary.netSavings / financialSummary.totalIncome >= 0.2 ? 'good' : 'needs_improvement'
      },
      {
        type: 'top_expense',
        title: 'Highest Expense Category',
        value: financialSummary.topCategories?.[0]?.category || 'Unknown',
        amount: financialSummary.topCategories?.[0]?.amount || 0
      }
    ];
  }

  private async generateSmartRecommendations(financialSummary: any) {
    // Generate smart recommendations based on financial data
    const recommendations = [];
    
    const savingsRate = (financialSummary.netSavings / financialSummary.totalIncome) * 100;
    
    if (savingsRate < 20) {
      recommendations.push({
        type: 'savings',
        title: 'Increase Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Aim for 20%+`,
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  private async assessFinancialRisk(financialSummary: any) {
    const savingsRate = (financialSummary.netSavings / financialSummary.totalIncome) * 100;
    const emergencyFund = financialSummary.monthlyExpenses * 6;
    
    let riskLevel = 'medium';
    let riskScore = 0.5;
    
    if (savingsRate < 10 || financialSummary.netSavings < emergencyFund) {
      riskLevel = 'high';
      riskScore = 0.8;
    } else if (savingsRate >= 20 && financialSummary.netSavings >= emergencyFund) {
      riskLevel = 'low';
      riskScore = 0.2;
    }
    
    return {
      level: riskLevel,
      score: riskScore,
      factors: [
        `Savings rate: ${savingsRate.toFixed(1)}%`,
        `Emergency fund: ${financialSummary.netSavings >= emergencyFund ? 'Adequate' : 'Insufficient'}`
      ]
    };
  }

  private analyzeSpending(financialSummary: any) {
    return {
      analysis: 'spending',
      summary: `You spend ₹${financialSummary.monthlyExpenses.toLocaleString()} monthly`,
      insights: this.generateSpendingRecommendations(financialSummary)
    };
  }

  private analyzeSavings(financialSummary: any) {
    return {
      analysis: 'savings',
      summary: `Your savings rate is ${((financialSummary.netSavings / financialSummary.totalIncome) * 100).toFixed(1)}%`,
      insights: this.generateSavingsRecommendations(financialSummary)
    };
  }

  private analyzeInvestmentReadiness(financialSummary: any) {
    return {
      analysis: 'investment',
      summary: `Available for investment: ₹${Math.max(0, financialSummary.netSavings).toLocaleString()}`,
      insights: this.generateInvestmentRecommendations(financialSummary)
    };
  }

  private analyzeBudget(financialSummary: any) {
    return {
      analysis: 'budget',
      summary: `Current expense ratio: ${((financialSummary.monthlyExpenses / financialSummary.monthlyIncome) * 100).toFixed(1)}%`,
      insights: this.generateBudgetRecommendations(financialSummary)
    };
  }

  private generateGeneralAnalysis(financialSummary: any) {
    return {
      analysis: 'general',
      summary: 'Overall financial health assessment',
      insights: [
        {
          title: 'Financial Health Score',
          description: `Based on your savings rate and spending patterns`,
          priority: 'medium'
        }
      ]
    };
  }

  private async generatePersonalizedTips(financialSummary: any, category?: string) {
    const tips = [];
    
    if (!category || category === 'spending') {
      tips.push({
        category: 'spending',
        title: 'Smart Spending Tip',
        content: `Your top expense is ${financialSummary.topCategories?.[0]?.category}. Consider setting a monthly limit.`,
        actionable: true
      });
    }
    
    if (!category || category === 'savings') {
      const savingsRate = (financialSummary.netSavings / financialSummary.totalIncome) * 100;
      tips.push({
        category: 'savings',
        title: 'Savings Optimization',
        content: `Your savings rate is ${savingsRate.toFixed(1)}%. ${savingsRate < 20 ? 'Try to reach 20%' : 'Great job! Consider increasing to 25%'}.`,
        actionable: true
      });
    }
    
    return tips;
  }
}
