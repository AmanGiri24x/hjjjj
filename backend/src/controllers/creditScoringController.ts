import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import FederatedGraphCreditScoring, { CreditApplicant, ExplanationResult, PrivacyMetrics } from '../services/federatedGraphCreditScoring';
import { logger } from '../config/logger';

class CreditScoringController {
  private creditScoringService: FederatedGraphCreditScoring;

  constructor() {
    this.creditScoringService = new FederatedGraphCreditScoring('bank_001');
  }

  /**
   * Assess credit risk for an applicant using federated graph neural networks
   */
  public assessCreditRisk = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const applicantData: CreditApplicant = req.body;

      // Log the assessment request
      logger.info(`Credit risk assessment requested for applicant: ${applicantData.id}`);

      // Perform credit risk assessment
      const result: ExplanationResult = await this.creditScoringService.assessCreditRisk(applicantData);

      // Log successful assessment
      logger.info(`Credit risk assessment completed for applicant: ${applicantData.id}, score: ${result.prediction}`);

      res.status(200).json({
        success: true,
        message: 'Credit risk assessment completed successfully',
        data: {
          applicantId: applicantData.id,
          creditScore: result.prediction,
          confidence: result.confidence,
          riskLevel: this.getRiskLevel(result.prediction),
          explanation: {
            local: result.localExplanation,
            global: result.globalPattern,
            nodeImportance: Object.fromEntries(result.nodeImportance),
            edgeImportance: Object.fromEntries(result.edgeImportance),
            featureImportance: Object.fromEntries(result.featureImportance)
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      logger.error('Credit risk assessment failed:', error);
      res.status(500).json({
        success: false,
        message: 'Credit risk assessment failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Get privacy metrics for the federated learning system
   */
  public getPrivacyMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Privacy metrics requested');

      const metrics: PrivacyMetrics = await this.creditScoringService.calculatePrivacyMetrics();

      res.status(200).json({
        success: true,
        message: 'Privacy metrics retrieved successfully',
        data: {
          metrics,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      logger.error('Failed to retrieve privacy metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve privacy metrics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Batch assess multiple credit applications
   */
  public batchAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { applicants }: { applicants: CreditApplicant[] } = req.body;

      if (!Array.isArray(applicants) || applicants.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid applicants array'
        });
        return;
      }

      logger.info(`Batch credit assessment requested for ${applicants.length} applicants`);

      const results = await Promise.all(
        applicants.map(async (applicant) => {
          try {
            const result = await this.creditScoringService.assessCreditRisk(applicant);
            return {
              applicantId: applicant.id,
              success: true,
              creditScore: result.prediction,
              confidence: result.confidence,
              riskLevel: this.getRiskLevel(result.prediction),
              explanation: result.localExplanation
            };
          } catch (error: any) {
            logger.error(`Failed to assess credit for applicant ${applicant.id}:`, error);
            return {
              applicantId: applicant.id,
              success: false,
              error: error.message
            };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      logger.info(`Batch assessment completed: ${successCount}/${applicants.length} successful`);

      res.status(200).json({
        success: true,
        message: `Batch assessment completed: ${successCount}/${applicants.length} successful`,
        data: {
          results,
          summary: {
            total: applicants.length,
            successful: successCount,
            failed: applicants.length - successCount
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      logger.error('Batch credit assessment failed:', error);
      res.status(500).json({
        success: false,
        message: 'Batch credit assessment failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Get system health and model status
   */
  public getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const privacyMetrics = await this.creditScoringService.calculatePrivacyMetrics();
      
      res.status(200).json({
        success: true,
        message: 'System health retrieved successfully',
        data: {
          status: 'operational',
          federatedLearning: {
            status: 'active',
            privacyBudget: privacyMetrics.differentialPrivacyEpsilon,
            informationLeakage: privacyMetrics.informationLeakage
          },
          graphNeuralNetwork: {
            status: 'ready',
            embeddingDimension: 128,
            layers: 3
          },
          explainabilityEngine: {
            status: 'active',
            features: ['node_importance', 'edge_importance', 'feature_importance']
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      logger.error('Failed to retrieve system health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system health',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Helper method to determine risk level from credit score
   */
  private getRiskLevel(score: number): string {
    if (score >= 0.7) return 'HIGH_RISK';
    if (score >= 0.4) return 'MEDIUM_RISK';
    return 'LOW_RISK';
  }
}

export default CreditScoringController;
