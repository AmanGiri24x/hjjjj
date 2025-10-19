import express from 'express';
import AIController, {
  sentimentValidation,
  newsAnalysisValidation,
  technicalAnalysisValidation,
  riskAssessmentValidation,
  batchAnalysisValidation,
} from '../controllers/aiController';
import { auth } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
import { rateLimitStrict, rateLimitModerate, rateLimitLight } from '../middleware/rateLimiter';
import { UserRole } from '../models/User';

const router = express.Router();
const aiController = new AIController();

// Apply authentication to all AI routes
router.use(auth);

// Health check endpoint (no role restriction)
router.get('/health', aiController.healthCheck.bind(aiController));

// Service status and capabilities (accessible by all authenticated users)
router.get('/status', rateLimitLight, aiController.getStatus.bind(aiController));
router.get('/capabilities', rateLimitLight, aiController.getCapabilities.bind(aiController));

// Sentiment Analysis
router.post(
  '/sentiment',
  rateLimitModerate,
  sentimentValidation,
  aiController.analyzeSentiment.bind(aiController)
);

// News Analysis
router.post(
  '/news/analyze',
  rateLimitModerate,
  newsAnalysisValidation,
  aiController.analyzeNews.bind(aiController)
);

// Technical Analysis
router.post(
  '/technical/analyze',
  rateLimitModerate,
  technicalAnalysisValidation,
  aiController.analyzeTechnical.bind(aiController)
);

// Risk Assessment
router.post(
  '/risk/assess',
  rateLimitModerate,
  riskAssessmentValidation,
  aiController.assessRisk.bind(aiController)
);

// Price Prediction
router.post(
  '/price/predict',
  rateLimitModerate,
  [
    ...technicalAnalysisValidation, // Reuse price data validation
    // Additional validation for prediction-specific fields
  ],
  aiController.predictPrice.bind(aiController)
);

// Anomaly Detection
router.post(
  '/anomalies/detect',
  rateLimitModerate,
  [
    ...technicalAnalysisValidation, // Reuse price data validation
    // Additional validation for anomaly-specific fields
  ],
  aiController.detectAnomalies.bind(aiController)
);

// Financial Summarization
router.post(
  '/summary/financial',
  rateLimitModerate,
  [
    // Validation for financial summarization
    ...riskAssessmentValidation, // Reuse data validation
  ],
  aiController.summarizeFinancial.bind(aiController)
);

// Portfolio Analysis (comprehensive analysis combining multiple AI capabilities)
router.post(
  '/portfolio/analyze',
  rateLimitStrict, // More strict rate limiting for complex operations
  [
    // Portfolio-specific validation
    ...riskAssessmentValidation, // Portfolio data validation
  ],
  aiController.analyzePortfolio.bind(aiController)
);

// Batch Analysis (premium feature - requires paid plan)
router.post(
  '/batch',
  roleAuth([UserRole.PREMIUM, UserRole.ADMIN]), // Restrict to premium users
  rateLimitStrict,
  batchAnalysisValidation,
  aiController.batchAnalyze.bind(aiController)
);

// Advanced AI endpoints (restricted to premium users)
router.use('/advanced', roleAuth([UserRole.PREMIUM, UserRole.ADMIN]));

// Advanced sentiment analysis with custom models
router.post(
  '/advanced/sentiment/custom',
  rateLimitStrict,
  [
    ...sentimentValidation,
    // Additional validation for custom model parameters
  ],
  aiController.analyzeSentiment.bind(aiController)
);

// Advanced technical analysis with custom indicators
router.post(
  '/advanced/technical/custom',
  rateLimitStrict,
  [
    ...technicalAnalysisValidation,
    // Additional validation for custom indicators
  ],
  aiController.analyzeTechnical.bind(aiController)
);

// Advanced risk modeling
router.post(
  '/advanced/risk/model',
  rateLimitStrict,
  [
    ...riskAssessmentValidation,
    // Additional validation for risk modeling parameters
  ],
  aiController.assessRisk.bind(aiController)
);

// Admin-only endpoints
router.use('/admin', roleAuth([UserRole.ADMIN]));

// Admin endpoint to get detailed service status
router.get('/admin/status/detailed', async (req, res) => {
  try {
    // This would include more detailed metrics, health checks, etc.
    const status = await aiController.getStatus(req, res);
    return status;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get detailed status',
      code: 'ADMIN_STATUS_FAILED',
    });
  }
});

// Admin endpoint to manage AI service configuration
router.post('/admin/config', async (req, res) => {
  try {
    // This would allow admins to update AI service configuration
    // Implementation would depend on specific configuration management needs
    return res.status(200).json({
      success: true,
      message: 'Configuration updated',
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      code: 'CONFIG_UPDATE_FAILED',
    });
  }
});

// Error handling middleware specific to AI routes
router.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('AI Route Error:', error);

  // Handle specific AI-related errors
  if (error.message.includes('OpenAI')) {
    return res.status(503).json({
      success: false,
      message: 'AI service temporarily unavailable',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
  }

  if (error.message.includes('timeout')) {
    return res.status(408).json({
      success: false,
      message: 'AI request timed out',
      code: 'AI_REQUEST_TIMEOUT',
    });
  }

  if (error.message.includes('rate limit')) {
    return res.status(429).json({
      success: false,
      message: 'AI rate limit exceeded',
      code: 'AI_RATE_LIMIT_EXCEEDED',
    });
  }

  // Generic error response
  return res.status(500).json({
    success: false,
    message: 'AI service error',
    code: 'AI_SERVICE_ERROR',
  });
});

export default router;
