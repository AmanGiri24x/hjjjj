import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AIServiceManager, AIServiceConfig } from '../services/ai/AIServiceManager';
import { AICapability } from '../services/ai/BaseAIService';
import { logger } from '../utils/logger';

export class AIController {
  private aiManager: AIServiceManager;

  constructor() {
    // Initialize AI Service Manager with configuration
    const config: AIServiceConfig = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      },
      caching: {
        enabled: process.env.AI_CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.AI_CACHE_TTL || '300'),
        keyPrefix: process.env.AI_CACHE_PREFIX || 'ai_cache:',
      },
      fallbackStrategy: (process.env.AI_FALLBACK_STRATEGY as any) || 'next_available',
      requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '60000'),
      maxConcurrentRequests: parseInt(process.env.AI_MAX_CONCURRENT || '10'),
    };

    this.aiManager = new AIServiceManager(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.aiManager.on('request:queued', (requestId, request, provider) => {
      logger.debug(`AI request ${requestId} queued for ${provider}`);
    });

    this.aiManager.on('request:completed', (requestId, result, provider) => {
      logger.info(`AI request ${requestId} completed by ${provider} in ${result.processingTime}ms`);
    });

    this.aiManager.on('request:failed', (requestId, error, provider) => {
      logger.error(`AI request ${requestId} failed on ${provider}:`, error);
    });

    this.aiManager.on('provider:unhealthy', (provider) => {
      logger.warn(`AI provider ${provider} marked as unhealthy`);
    });
  }

  private handleValidationErrors(req: Request, res: Response): boolean {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
        })),
      });
    }
    return false;
  }

  // Sentiment Analysis
  async analyzeSentiment(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { text, context, priority, provider } = req.body;
      const userId = req.user?.userId;

      const response = await this.aiManager.analyzeSentiment(text, {
        context,
        priority,
        provider,
      });

      return res.status(200).json({
        success: true,
        message: 'Sentiment analysis completed',
        data: {
          requestId: response.requestId,
          result: response.result,
          confidence: response.confidence,
          provider: response.provider,
          processingTime: response.processingTime,
          cached: response.metadata?.cached || false,
        },
      });
    } catch (error) {
      logger.error('Sentiment analysis failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Sentiment analysis failed',
        code: 'SENTIMENT_ANALYSIS_FAILED',
      });
    }
  }

  // News Analysis
  async analyzeNews(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { articles, symbol, sector, priority } = req.body;
      const userId = req.user?.userId;

      const response = await this.aiManager.analyzeNews(articles, {
        symbol,
        sector,
        priority,
      });

      return res.status(200).json({
        success: true,
        message: 'News analysis completed',
        data: {
          requestId: response.requestId,
          result: response.result,
          confidence: response.confidence,
          provider: response.provider,
          processingTime: response.processingTime,
          cached: response.metadata?.cached || false,
        },
      });
    } catch (error) {
      logger.error('News analysis failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'News analysis failed',
        code: 'NEWS_ANALYSIS_FAILED',
      });
    }
  }

  // Technical Analysis
  async analyzeTechnical(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { priceData, timeframe, indicators, priority } = req.body;
      const userId = req.user?.userId;

      const response = await this.aiManager.analyzeTechnical(priceData, {
        timeframe,
        indicators,
        priority,
      });

      return res.status(200).json({
        success: true,
        message: 'Technical analysis completed',
        data: {
          requestId: response.requestId,
          result: response.result,
          confidence: response.confidence,
          provider: response.provider,
          processingTime: response.processingTime,
          cached: response.metadata?.cached || false,
        },
      });
    } catch (error) {
      logger.error('Technical analysis failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Technical analysis failed',
        code: 'TECHNICAL_ANALYSIS_FAILED',
      });
    }
  }

  // Risk Assessment
  async assessRisk(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { data, type, timeframe, riskProfile, priority } = req.body;
      const userId = req.user?.userId;

      const response = await this.aiManager.assessRisk(data, {
        type,
        timeframe,
        riskProfile,
        priority,
      });

      return res.status(200).json({
        success: true,
        message: 'Risk assessment completed',
        data: {
          requestId: response.requestId,
          result: response.result,
          confidence: response.confidence,
          provider: response.provider,
          processingTime: response.processingTime,
          cached: response.metadata?.cached || false,
        },
      });
    } catch (error) {
      logger.error('Risk assessment failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Risk assessment failed',
        code: 'RISK_ASSESSMENT_FAILED',
      });
    }
  }

  // Price Prediction
  async predictPrice(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { priceData, timeframe, method, priority } = req.body;
      const userId = req.user?.userId;

      const response = await this.aiManager.predictPrice(priceData, {
        timeframe,
        method,
        priority,
      });

      return res.status(200).json({
        success: true,
        message: 'Price prediction completed',
        data: {
          requestId: response.requestId,
          result: response.result,
          confidence: response.confidence,
          provider: response.provider,
          processingTime: response.processingTime,
          cached: response.metadata?.cached || false,
        },
      });
    } catch (error) {
      logger.error('Price prediction failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Price prediction failed',
        code: 'PRICE_PREDICTION_FAILED',
      });
    }
  }

  // Anomaly Detection
  async detectAnomalies(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { priceData, sensitivity, priority } = req.body;
      const userId = req.user?.userId;

      const response = await this.aiManager.detectAnomalies(priceData, {
        sensitivity,
        priority,
      });

      return res.status(200).json({
        success: true,
        message: 'Anomaly detection completed',
        data: {
          requestId: response.requestId,
          result: response.result,
          confidence: response.confidence,
          provider: response.provider,
          processingTime: response.processingTime,
          cached: response.metadata?.cached || false,
        },
      });
    } catch (error) {
      logger.error('Anomaly detection failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Anomaly detection failed',
        code: 'ANOMALY_DETECTION_FAILED',
      });
    }
  }

  // Financial Summarization
  async summarizeFinancial(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { data, type, symbol, period, priority } = req.body;
      const userId = req.user?.userId;

      const response = await this.aiManager.summarizeFinancial(data, {
        type,
        symbol,
        period,
        priority,
      });

      return res.status(200).json({
        success: true,
        message: 'Financial summarization completed',
        data: {
          requestId: response.requestId,
          result: response.result,
          confidence: response.confidence,
          provider: response.provider,
          processingTime: response.processingTime,
          cached: response.metadata?.cached || false,
        },
      });
    } catch (error) {
      logger.error('Financial summarization failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Financial summarization failed',
        code: 'FINANCIAL_SUMMARIZATION_FAILED',
      });
    }
  }

  // Batch Analysis
  async batchAnalyze(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { requests } = req.body;
      const userId = req.user?.userId;

      if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Requests array is required and cannot be empty',
          code: 'INVALID_BATCH_REQUESTS',
        });
      }

      // Convert requests to AI requests format
      const aiRequests = requests.map((request: any) => ({
        id: `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        type: request.type as AICapability,
        data: request.data,
        options: {
          priority: request.priority || 'medium',
          timeout: request.timeout,
          retries: request.retries,
        },
        userId,
        createdAt: new Date(),
      }));

      const results = await this.aiManager.batchProcess(aiRequests);
      
      // Format results
      const formattedResults = Array.from(results.entries()).map(([requestId, result]) => ({
        requestId,
        success: !(result instanceof Error),
        data: result instanceof Error ? null : {
          result: result.result,
          confidence: result.confidence,
          provider: result.provider,
          processingTime: result.processingTime,
          cached: result.metadata?.cached || false,
        },
        error: result instanceof Error ? {
          message: result.message,
          code: 'BATCH_REQUEST_FAILED',
        } : null,
      }));

      const successCount = formattedResults.filter(r => r.success).length;
      const failureCount = formattedResults.length - successCount;

      return res.status(200).json({
        success: true,
        message: `Batch analysis completed: ${successCount} successful, ${failureCount} failed`,
        data: {
          results: formattedResults,
          summary: {
            total: formattedResults.length,
            successful: successCount,
            failed: failureCount,
          },
        },
      });
    } catch (error) {
      logger.error('Batch analysis failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Batch analysis failed',
        code: 'BATCH_ANALYSIS_FAILED',
      });
    }
  }

  // Service Status
  async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const status = await this.aiManager.getStatus();
      
      return res.status(200).json({
        success: true,
        message: 'AI service status retrieved',
        data: status,
      });
    } catch (error) {
      logger.error('Failed to get AI service status:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve service status',
        code: 'STATUS_RETRIEVAL_FAILED',
      });
    }
  }

  // Capabilities
  async getCapabilities(req: Request, res: Response): Promise<Response> {
    try {
      const capabilities = this.aiManager.getCapabilities();
      
      return res.status(200).json({
        success: true,
        message: 'AI capabilities retrieved',
        data: {
          capabilities,
          supportedCapabilities: Object.keys(capabilities),
        },
      });
    } catch (error) {
      logger.error('Failed to get AI capabilities:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve capabilities',
        code: 'CAPABILITIES_RETRIEVAL_FAILED',
      });
    }
  }

  // Portfolio Analysis (combines multiple AI capabilities)
  async analyzePortfolio(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { portfolio, timeframe, includeNews, includeRisk, includePredictions } = req.body;
      const userId = req.user?.userId;

      const analysisPromises = [];
      
      // Technical analysis of portfolio
      if (portfolio.holdings && portfolio.holdings.length > 0) {
        const technicalPromise = this.aiManager.analyzeTechnical(
          portfolio.priceHistory || [],
          { timeframe: timeframe || '1d' }
        );
        analysisPromises.push({
          type: 'technical',
          promise: technicalPromise
        });
      }

      // Risk assessment
      if (includeRisk !== false) {
        const riskPromise = this.aiManager.assessRisk(portfolio, {
          type: 'portfolio',
          timeframe: timeframe || '1Y',
        });
        analysisPromises.push({
          type: 'risk',
          promise: riskPromise
        });
      }

      // Price predictions for holdings
      if (includePredictions !== false && portfolio.holdings) {
        for (const holding of portfolio.holdings.slice(0, 5)) { // Limit to top 5 holdings
          if (holding.priceHistory) {
            const predictionPromise = this.aiManager.predictPrice(
              holding.priceHistory,
              { timeframe: '30d', method: 'linear_regression' }
            );
            analysisPromises.push({
              type: 'prediction',
              symbol: holding.symbol,
              promise: predictionPromise
            });
          }
        }
      }

      // News analysis if requested
      if (includeNews && portfolio.news) {
        const newsPromise = this.aiManager.analyzeNews(portfolio.news);
        analysisPromises.push({
          type: 'news',
          promise: newsPromise
        });
      }

      // Execute all analyses concurrently
      const results = await Promise.allSettled(
        analysisPromises.map(({ promise }) => promise)
      );

      // Format results
      const analysis: any = {
        portfolioId: portfolio.id,
        timestamp: new Date().toISOString(),
        analyses: {},
      };

      results.forEach((result, index) => {
        const { type, symbol } = analysisPromises[index];
        
        if (result.status === 'fulfilled') {
          if (type === 'prediction' && symbol) {
            if (!analysis.analyses.predictions) {
              analysis.analyses.predictions = {};
            }
            analysis.analyses.predictions[symbol] = {
              result: result.value.result,
              confidence: result.value.confidence,
              provider: result.value.provider,
            };
          } else {
            analysis.analyses[type] = {
              result: result.value.result,
              confidence: result.value.confidence,
              provider: result.value.provider,
            };
          }
        } else {
          logger.error(`Portfolio analysis ${type} failed:`, result.reason);
          analysis.analyses[type] = {
            error: result.reason.message || 'Analysis failed',
          };
        }
      });

      // Generate overall summary
      analysis.summary = this.generatePortfolioSummary(analysis.analyses);

      return res.status(200).json({
        success: true,
        message: 'Portfolio analysis completed',
        data: analysis,
      });
    } catch (error) {
      logger.error('Portfolio analysis failed:', error);
      
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Portfolio analysis failed',
        code: 'PORTFOLIO_ANALYSIS_FAILED',
      });
    }
  }

  private generatePortfolioSummary(analyses: any): any {
    const summary: any = {
      overallRisk: 'unknown',
      sentiment: 'neutral',
      technicalOutlook: 'neutral',
      recommendations: [],
    };

    // Risk assessment summary
    if (analyses.risk && !analyses.risk.error) {
      summary.overallRisk = analyses.risk.result.riskLevel || 'unknown';
      summary.recommendations.push(...(analyses.risk.result.recommendations || []));
    }

    // News sentiment summary
    if (analyses.news && !analyses.news.error) {
      summary.sentiment = analyses.news.result.overallSentiment || 'neutral';
    }

    // Technical analysis summary
    if (analyses.technical && !analyses.technical.error) {
      const technical = analyses.technical.result;
      summary.technicalOutlook = technical.recommendation?.action || 'neutral';
      if (technical.recommendation?.reasoning) {
        summary.recommendations.push(technical.recommendation.reasoning);
      }
    }

    // Predictions summary
    if (analyses.predictions) {
      const predictions = Object.values(analyses.predictions);
      const avgConfidence = predictions.reduce(
        (acc: number, pred: any) => acc + (pred.confidence || 0), 0
      ) / predictions.length;
      summary.predictionConfidence = avgConfidence;
    }

    return summary;
  }

  // Health check
  async healthCheck(req: Request, res: Response): Promise<Response> {
    try {
      const status = await this.aiManager.getStatus();
      const isHealthy = status.availableProviders > 0;

      return res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? 'AI service is healthy' : 'AI service is unhealthy',
        data: {
          healthy: isHealthy,
          availableProviders: status.availableProviders,
          totalProviders: status.totalProviders,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('AI health check failed:', error);
      
      return res.status(503).json({
        success: false,
        message: 'AI service health check failed',
        code: 'HEALTH_CHECK_FAILED',
      });
    }
  }
}

// Validation rules
export const sentimentValidation = [
  body('text')
    .notEmpty()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Text must be between 10 and 10,000 characters'),
  body('context')
    .optional()
    .isIn(['financial', 'news', 'social'])
    .withMessage('Context must be financial, news, or social'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
];

export const newsAnalysisValidation = [
  body('articles')
    .isArray({ min: 1, max: 50 })
    .withMessage('Articles must be an array with 1-50 items'),
  body('articles.*.title')
    .notEmpty()
    .isLength({ max: 500 })
    .withMessage('Article title is required and must be max 500 characters'),
  body('articles.*.content')
    .notEmpty()
    .isLength({ max: 5000 })
    .withMessage('Article content is required and must be max 5000 characters'),
];

export const technicalAnalysisValidation = [
  body('priceData')
    .isArray({ min: 20 })
    .withMessage('Price data must be an array with at least 20 items'),
  body('timeframe')
    .optional()
    .isIn(['1m', '5m', '15m', '1h', '4h', '1d'])
    .withMessage('Invalid timeframe'),
];

export const riskAssessmentValidation = [
  body('data')
    .notEmpty()
    .withMessage('Data is required for risk assessment'),
  body('type')
    .optional()
    .isIn(['portfolio', 'stock', 'sector'])
    .withMessage('Type must be portfolio, stock, or sector'),
];

export const batchAnalysisValidation = [
  body('requests')
    .isArray({ min: 1, max: 20 })
    .withMessage('Requests must be an array with 1-20 items'),
  body('requests.*.type')
    .isIn(Object.values(AICapability))
    .withMessage('Invalid AI capability type'),
];

export default AIController;
