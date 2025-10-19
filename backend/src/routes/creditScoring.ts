import { Router } from 'express';
import { body, param } from 'express-validator';
import CreditScoringController from '../controllers/creditScoringController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const creditScoringController = new CreditScoringController();

// Validation middleware for credit applicant data
const validateCreditApplicant = [
  body('id').notEmpty().withMessage('Applicant ID is required'),
  body('personalInfo.age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('personalInfo.income').isFloat({ min: 0 }).withMessage('Income must be a positive number'),
  body('personalInfo.employmentYears').isFloat({ min: 0 }).withMessage('Employment years must be non-negative'),
  body('personalInfo.education').notEmpty().withMessage('Education is required'),
  body('financialHistory.creditScore').isInt({ min: 300, max: 850 }).withMessage('Credit score must be between 300 and 850'),
  body('financialHistory.loanHistory').isArray().withMessage('Loan history must be an array'),
  body('financialHistory.paymentBehavior').isArray().withMessage('Payment behavior must be an array'),
  body('graphConnections.socialConnections').isArray().withMessage('Social connections must be an array'),
  body('graphConnections.businessConnections').isArray().withMessage('Business connections must be an array'),
  body('graphConnections.guarantorRelations').isArray().withMessage('Guarantor relations must be an array')
];

const validateBatchApplicants = [
  body('applicants').isArray({ min: 1, max: 50 }).withMessage('Applicants must be an array with 1-50 items'),
  body('applicants.*.id').notEmpty().withMessage('Each applicant must have an ID'),
  body('applicants.*.personalInfo.age').isInt({ min: 18, max: 100 }).withMessage('Each applicant age must be between 18 and 100'),
  body('applicants.*.personalInfo.income').isFloat({ min: 0 }).withMessage('Each applicant income must be positive'),
  body('applicants.*.financialHistory.creditScore').isInt({ min: 300, max: 850 }).withMessage('Each credit score must be between 300 and 850')
];

/**
 * @route POST /api/v1/credit-scoring/assess
 * @desc Assess credit risk for a single applicant using federated graph neural networks
 * @access Private
 */
router.post('/assess', requireAuth, validateCreditApplicant, creditScoringController.assessCreditRisk);

/**
 * @route POST /api/v1/credit-scoring/batch-assess
 * @desc Batch assess credit risk for multiple applicants
 * @access Private
 */
router.post('/batch-assess', requireAuth, validateBatchApplicants, creditScoringController.batchAssessment);

/**
 * @route GET /api/v1/credit-scoring/privacy-metrics
 * @desc Get privacy metrics for the federated learning system
 * @access Private
 */
router.get('/privacy-metrics', requireAuth, creditScoringController.getPrivacyMetrics);

/**
 * @route GET /api/v1/credit-scoring/health
 * @desc Get system health and model status
 * @access Private
 */
router.get('/health', requireAuth, creditScoringController.getSystemHealth);

export default router;
