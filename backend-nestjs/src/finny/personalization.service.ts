import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface PersonalizationProfile {
  userId: string;
  preferences: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    investmentStyle: 'passive' | 'active' | 'hybrid';
    timeHorizon: 'short' | 'medium' | 'long';
    communicationStyle: 'detailed' | 'concise' | 'visual';
    preferredLanguage: string;
    notificationFrequency: 'real_time' | 'daily' | 'weekly';
    topics: string[];
    excludeTopics: string[];
  };
  demographics: {
    age?: number;
    income?: string;
    occupation?: string;
    location?: string;
    familyStatus?: string;
    dependents?: number;
  };
  financialGoals: {
    primary: string;
    secondary: string[];
    targetAmount?: number;
    targetDate?: Date;
    priority: 'high' | 'medium' | 'low';
  }[];
  learningProfile: {
    knowledgeLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    preferredComplexity: 'simple' | 'moderate' | 'complex';
    interactionPatterns: any;
  };
  behaviorAnalysis: {
    decisionMakingStyle: 'analytical' | 'intuitive' | 'collaborative';
    riskBehavior: 'risk_averse' | 'risk_neutral' | 'risk_seeking';
    marketSentiment: 'optimistic' | 'neutral' | 'pessimistic';
    tradingFrequency: 'never' | 'rarely' | 'occasionally' | 'frequently';
  };
  adaptiveSettings: {
    responseLength: 'short' | 'medium' | 'long';
    technicalDepth: 'basic' | 'intermediate' | 'advanced';
    examplePreference: 'real_world' | 'hypothetical' | 'personal';
    visualAids: boolean;
    actionOriented: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PersonalizationService {
  private readonly logger = new Logger(PersonalizationService.name);

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
  ) {}

  async getUserPersonalizationProfile(userId: string): Promise<PersonalizationProfile> {
    try {
      await this.securityService.validateUserAccess(userId, 'personalization_profile');

      // Get existing profile or create default
      let profile = await this.getExistingProfile(userId);
      
      if (!profile) {
        profile = await this.createDefaultProfile(userId);
      }

      // Enhance profile with recent behavioral data
      profile = await this.enhanceProfileWithBehavioralData(profile);

      return profile;
    } catch (error) {
      this.logger.error(`Failed to get personalization profile: ${error.message}`);
      throw error;
    }
  }

  async updatePersonalization(userId: string, preferences: any, learningData?: any): Promise<PersonalizationProfile> {
    try {
      await this.securityService.validateUserAccess(userId, 'personalization_update');

      const existingProfile = await this.getUserPersonalizationProfile(userId);
      
      // Merge new preferences with existing profile
      const updatedProfile: PersonalizationProfile = {
        ...existingProfile,
        preferences: {
          ...existingProfile.preferences,
          ...preferences,
        },
        updatedAt: new Date(),
      };

      // Update learning profile if learning data provided
      if (learningData) {
        updatedProfile.learningProfile = {
          ...existingProfile.learningProfile,
          ...this.analyzeLearningData(learningData),
        };
      }

      // Save updated profile
      await this.saveProfile(updatedProfile);

      // Record personalization update metrics
      await this.monitoringService.recordMetric('personalization_updates', 1);

      this.logger.log(`Updated personalization profile for user ${userId}`);

      return updatedProfile;
    } catch (error) {
      this.logger.error(`Failed to update personalization: ${error.message}`);
      throw error;
    }
  }

  async updateFromInteraction(userId: string, userMessage: string, aiResponse: any): Promise<void> {
    try {
      const profile = await this.getUserPersonalizationProfile(userId);

      // Analyze interaction patterns
      const interactionAnalysis = this.analyzeInteraction(userMessage, aiResponse);

      // Update learning profile based on interaction
      const updatedLearningProfile = this.updateLearningProfile(
        profile.learningProfile,
        interactionAnalysis
      );

      // Update behavioral analysis
      const updatedBehaviorAnalysis = this.updateBehaviorAnalysis(
        profile.behaviorAnalysis,
        interactionAnalysis
      );

      // Update adaptive settings
      const updatedAdaptiveSettings = this.updateAdaptiveSettings(
        profile.adaptiveSettings,
        interactionAnalysis
      );

      // Save updates
      await this.saveProfile({
        ...profile,
        learningProfile: updatedLearningProfile,
        behaviorAnalysis: updatedBehaviorAnalysis,
        adaptiveSettings: updatedAdaptiveSettings,
        updatedAt: new Date(),
      });

      this.logger.log(`Updated personalization from interaction for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update from interaction: ${error.message}`);
    }
  }

  async updateFromFeedback(userId: string, rating: number, feedback?: string, helpful?: boolean): Promise<void> {
    try {
      const profile = await this.getUserPersonalizationProfile(userId);

      // Analyze feedback
      const feedbackAnalysis = this.analyzeFeedback(rating, feedback, helpful);

      // Adjust adaptive settings based on feedback
      const updatedAdaptiveSettings = this.adjustSettingsFromFeedback(
        profile.adaptiveSettings,
        feedbackAnalysis
      );

      // Update communication preferences if needed
      const updatedPreferences = this.adjustPreferencesFromFeedback(
        profile.preferences,
        feedbackAnalysis
      );

      // Save updates
      await this.saveProfile({
        ...profile,
        preferences: updatedPreferences,
        adaptiveSettings: updatedAdaptiveSettings,
        updatedAt: new Date(),
      });

      this.logger.log(`Updated personalization from feedback for user ${userId}: rating=${rating}`);
    } catch (error) {
      this.logger.error(`Failed to update from feedback: ${error.message}`);
    }
  }

  async generatePersonalizedContext(userId: string, topic: string): Promise<any> {
    try {
      const profile = await this.getUserPersonalizationProfile(userId);

      const context = {
        userProfile: {
          riskTolerance: profile.preferences.riskTolerance,
          knowledgeLevel: profile.learningProfile.knowledgeLevel,
          communicationStyle: profile.preferences.communicationStyle,
          timeHorizon: profile.preferences.timeHorizon,
        },
        adaptations: {
          responseLength: profile.adaptiveSettings.responseLength,
          technicalDepth: profile.adaptiveSettings.technicalDepth,
          useVisualAids: profile.adaptiveSettings.visualAids,
          includeExamples: profile.adaptiveSettings.examplePreference,
          actionOriented: profile.adaptiveSettings.actionOriented,
        },
        relevantGoals: this.getRelevantGoals(profile.financialGoals, topic),
        behaviorInsights: {
          decisionStyle: profile.behaviorAnalysis.decisionMakingStyle,
          riskBehavior: profile.behaviorAnalysis.riskBehavior,
          marketSentiment: profile.behaviorAnalysis.marketSentiment,
        },
        personalizationTips: this.generatePersonalizationTips(profile, topic),
      };

      return context;
    } catch (error) {
      this.logger.error(`Failed to generate personalized context: ${error.message}`);
      return null;
    }
  }

  private async createDefaultProfile(userId: string): Promise<PersonalizationProfile> {
    const defaultProfile: PersonalizationProfile = {
      userId,
      preferences: {
        riskTolerance: 'moderate',
        investmentStyle: 'passive',
        timeHorizon: 'long',
        communicationStyle: 'detailed',
        preferredLanguage: 'en',
        notificationFrequency: 'daily',
        topics: ['investment', 'retirement', 'budgeting'],
        excludeTopics: [],
      },
      demographics: {},
      financialGoals: [
        {
          primary: 'retirement',
          secondary: ['emergency_fund', 'wealth_building'],
          priority: 'high',
        },
      ],
      learningProfile: {
        knowledgeLevel: 'beginner',
        learningStyle: 'visual',
        preferredComplexity: 'simple',
        interactionPatterns: {},
      },
      behaviorAnalysis: {
        decisionMakingStyle: 'analytical',
        riskBehavior: 'risk_neutral',
        marketSentiment: 'neutral',
        tradingFrequency: 'rarely',
      },
      adaptiveSettings: {
        responseLength: 'medium',
        technicalDepth: 'basic',
        examplePreference: 'real_world',
        visualAids: true,
        actionOriented: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveProfile(defaultProfile);
    return defaultProfile;
  }

  private async enhanceProfileWithBehavioralData(profile: PersonalizationProfile): Promise<PersonalizationProfile> {
    try {
      // Get recent interaction data
      const recentInteractions = await this.getRecentInteractions(profile.userId);
      
      // Analyze patterns
      const patterns = this.analyzeInteractionPatterns(recentInteractions);
      
      // Update learning profile with patterns
      profile.learningProfile.interactionPatterns = patterns;
      
      // Adjust adaptive settings based on recent behavior
      if (patterns.averageMessageLength > 100) {
        profile.adaptiveSettings.responseLength = 'long';
      } else if (patterns.averageMessageLength < 50) {
        profile.adaptiveSettings.responseLength = 'short';
      }

      if (patterns.technicalQuestions > 0.7) {
        profile.adaptiveSettings.technicalDepth = 'advanced';
      } else if (patterns.technicalQuestions < 0.3) {
        profile.adaptiveSettings.technicalDepth = 'basic';
      }

      return profile;
    } catch (error) {
      this.logger.error(`Failed to enhance profile with behavioral data: ${error.message}`);
      return profile;
    }
  }

  private analyzeInteraction(userMessage: string, aiResponse: any): any {
    return {
      messageLength: userMessage.length,
      complexity: this.assessMessageComplexity(userMessage),
      topics: this.extractTopics(userMessage),
      questionType: this.classifyQuestionType(userMessage),
      responseRating: aiResponse.confidence || 0.5,
      technicalLevel: this.assessTechnicalLevel(userMessage),
    };
  }

  private updateLearningProfile(currentProfile: any, analysis: any): any {
    return {
      ...currentProfile,
      // Adjust knowledge level based on question complexity
      knowledgeLevel: this.adjustKnowledgeLevel(currentProfile.knowledgeLevel, analysis.complexity),
      // Update preferred complexity based on user engagement
      preferredComplexity: this.adjustComplexity(currentProfile.preferredComplexity, analysis.technicalLevel),
    };
  }

  private updateBehaviorAnalysis(currentBehavior: any, analysis: any): any {
    return {
      ...currentBehavior,
      // Update decision making style based on question patterns
      decisionMakingStyle: this.inferDecisionStyle(analysis.questionType),
      // Adjust trading frequency based on topics
      tradingFrequency: this.inferTradingFrequency(analysis.topics),
    };
  }

  private updateAdaptiveSettings(currentSettings: any, analysis: any): any {
    return {
      ...currentSettings,
      // Adjust response length based on user message length
      responseLength: this.adjustResponseLength(currentSettings.responseLength, analysis.messageLength),
      // Adjust technical depth based on question complexity
      technicalDepth: this.adjustTechnicalDepth(currentSettings.technicalDepth, analysis.technicalLevel),
    };
  }

  private analyzeFeedback(rating: number, feedback?: string, helpful?: boolean): any {
    return {
      rating,
      helpful,
      sentiment: this.analyzeFeedbackSentiment(feedback),
      suggestions: this.extractFeedbackSuggestions(feedback),
      satisfactionLevel: rating >= 4 ? 'high' : rating >= 3 ? 'medium' : 'low',
    };
  }

  private adjustSettingsFromFeedback(currentSettings: any, feedbackAnalysis: any): any {
    const adjustments = { ...currentSettings };

    // Adjust based on satisfaction level
    if (feedbackAnalysis.satisfactionLevel === 'low') {
      // Try different approach
      if (currentSettings.responseLength === 'long') {
        adjustments.responseLength = 'medium';
      } else if (currentSettings.technicalDepth === 'advanced') {
        adjustments.technicalDepth = 'intermediate';
      }
    }

    // Adjust based on specific feedback
    if (feedbackAnalysis.suggestions.includes('too_complex')) {
      adjustments.technicalDepth = 'basic';
      adjustments.preferredComplexity = 'simple';
    }

    if (feedbackAnalysis.suggestions.includes('too_simple')) {
      adjustments.technicalDepth = 'advanced';
      adjustments.preferredComplexity = 'complex';
    }

    return adjustments;
  }

  private adjustPreferencesFromFeedback(currentPreferences: any, feedbackAnalysis: any): any {
    const adjustments = { ...currentPreferences };

    // Adjust communication style based on feedback
    if (feedbackAnalysis.suggestions.includes('more_detail')) {
      adjustments.communicationStyle = 'detailed';
    } else if (feedbackAnalysis.suggestions.includes('more_concise')) {
      adjustments.communicationStyle = 'concise';
    }

    return adjustments;
  }

  private getRelevantGoals(goals: any[], topic: string): any[] {
    return goals.filter(goal => 
      goal.primary.includes(topic) || 
      goal.secondary.some((secondary: string) => secondary.includes(topic))
    );
  }

  private generatePersonalizationTips(profile: PersonalizationProfile, topic: string): string[] {
    const tips = [];

    // Risk tolerance tips
    if (profile.preferences.riskTolerance === 'conservative') {
      tips.push('Focus on capital preservation and steady growth');
    } else if (profile.preferences.riskTolerance === 'aggressive') {
      tips.push('Consider higher-growth opportunities with managed risk');
    }

    // Knowledge level tips
    if (profile.learningProfile.knowledgeLevel === 'beginner') {
      tips.push('Start with fundamental concepts and build gradually');
    } else if (profile.learningProfile.knowledgeLevel === 'advanced') {
      tips.push('Include sophisticated strategies and detailed analysis');
    }

    // Time horizon tips
    if (profile.preferences.timeHorizon === 'short') {
      tips.push('Focus on liquidity and capital preservation');
    } else if (profile.preferences.timeHorizon === 'long') {
      tips.push('Emphasize compound growth and long-term strategies');
    }

    return tips;
  }

  // Helper methods for analysis
  private assessMessageComplexity(message: string): number {
    const complexWords = ['derivative', 'volatility', 'correlation', 'diversification', 'allocation'];
    const complexCount = complexWords.filter(word => message.toLowerCase().includes(word)).length;
    return Math.min(complexCount / complexWords.length, 1);
  }

  private extractTopics(message: string): string[] {
    const topicKeywords = {
      investment: ['invest', 'stock', 'bond', 'portfolio'],
      retirement: ['retire', '401k', 'pension', 'ira'],
      risk: ['risk', 'volatile', 'safe', 'conservative'],
      tax: ['tax', 'deduction', 'ira', 'capital gains'],
    };

    const topics = [];
    const lowerMessage = message.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private classifyQuestionType(message: string): string {
    if (message.includes('?')) {
      if (message.toLowerCase().includes('what')) return 'definition';
      if (message.toLowerCase().includes('how')) return 'process';
      if (message.toLowerCase().includes('why')) return 'explanation';
      if (message.toLowerCase().includes('should')) return 'recommendation';
    }
    return 'statement';
  }

  private assessTechnicalLevel(message: string): number {
    const technicalTerms = ['beta', 'alpha', 'sharpe ratio', 'volatility', 'correlation', 'derivatives'];
    const technicalCount = technicalTerms.filter(term => message.toLowerCase().includes(term)).length;
    return Math.min(technicalCount / technicalTerms.length, 1);
  }

  private adjustKnowledgeLevel(current: string, complexity: number): string {
    if (complexity > 0.7 && current === 'beginner') return 'intermediate';
    if (complexity > 0.8 && current === 'intermediate') return 'advanced';
    return current;
  }

  private adjustComplexity(current: string, technicalLevel: number): string {
    if (technicalLevel > 0.6 && current === 'simple') return 'moderate';
    if (technicalLevel > 0.8 && current === 'moderate') return 'complex';
    return current;
  }

  private inferDecisionStyle(questionType: string): string {
    if (questionType === 'recommendation') return 'collaborative';
    if (questionType === 'explanation') return 'analytical';
    return 'intuitive';
  }

  private inferTradingFrequency(topics: string[]): string {
    if (topics.includes('trading') || topics.includes('day trading')) return 'frequently';
    if (topics.includes('investment') || topics.includes('portfolio')) return 'occasionally';
    return 'rarely';
  }

  private adjustResponseLength(current: string, messageLength: number): string {
    if (messageLength > 200 && current === 'short') return 'medium';
    if (messageLength > 400 && current === 'medium') return 'long';
    if (messageLength < 50 && current === 'long') return 'medium';
    return current;
  }

  private adjustTechnicalDepth(current: string, technicalLevel: number): string {
    if (technicalLevel > 0.7 && current === 'basic') return 'intermediate';
    if (technicalLevel > 0.8 && current === 'intermediate') return 'advanced';
    if (technicalLevel < 0.3 && current === 'advanced') return 'intermediate';
    return current;
  }

  private analyzeFeedbackSentiment(feedback?: string): string {
    if (!feedback) return 'neutral';
    
    const positive = ['good', 'great', 'helpful', 'excellent', 'perfect'];
    const negative = ['bad', 'poor', 'unhelpful', 'wrong', 'confusing'];
    
    const lowerFeedback = feedback.toLowerCase();
    
    if (positive.some(word => lowerFeedback.includes(word))) return 'positive';
    if (negative.some(word => lowerFeedback.includes(word))) return 'negative';
    
    return 'neutral';
  }

  private extractFeedbackSuggestions(feedback?: string): string[] {
    if (!feedback) return [];
    
    const suggestions = [];
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes('too complex') || lowerFeedback.includes('complicated')) {
      suggestions.push('too_complex');
    }
    if (lowerFeedback.includes('too simple') || lowerFeedback.includes('basic')) {
      suggestions.push('too_simple');
    }
    if (lowerFeedback.includes('more detail') || lowerFeedback.includes('elaborate')) {
      suggestions.push('more_detail');
    }
    if (lowerFeedback.includes('concise') || lowerFeedback.includes('shorter')) {
      suggestions.push('more_concise');
    }
    
    return suggestions;
  }

  private analyzeLearningData(learningData: any): any {
    return {
      knowledgeLevel: learningData.knowledgeLevel || 'intermediate',
      learningStyle: learningData.learningStyle || 'visual',
      preferredComplexity: learningData.preferredComplexity || 'moderate',
    };
  }

  private async getExistingProfile(userId: string): Promise<PersonalizationProfile | null> {
    // In real implementation, fetch from database
    try {
      const profile = await this.prisma.personalizationProfile.findUnique({
        where: { userId },
      });
      return profile as PersonalizationProfile;
    } catch (error) {
      return null;
    }
  }

  private async saveProfile(profile: PersonalizationProfile): Promise<void> {
    // In real implementation, save to database
    try {
      await this.prisma.personalizationProfile.upsert({
        where: { userId: profile.userId },
        update: profile,
        create: profile,
      });
    } catch (error) {
      this.logger.error(`Failed to save profile: ${error.message}`);
    }
  }

  private async getRecentInteractions(userId: string): Promise<any[]> {
    // In real implementation, fetch from database
    return [];
  }

  private analyzeInteractionPatterns(interactions: any[]): any {
    return {
      averageMessageLength: 150,
      technicalQuestions: 0.4,
      topicDistribution: { investment: 0.6, retirement: 0.3, risk: 0.1 },
      responsePreference: 'detailed',
    };
  }
}
