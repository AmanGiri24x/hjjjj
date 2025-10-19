import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';

export interface AmlCheck {
  userId: string;
  checkType: 'kyc' | 'transaction' | 'periodic' | 'suspicious_activity';
  status: 'pending' | 'passed' | 'failed' | 'requires_review';
  riskScore: number;
  flags: string[];
  checkedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

export interface SuspiciousActivityReport {
  userId: string;
  transactionId?: string;
  activityType: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: Date;
  reportedBy: string;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
}

@Injectable()
export class AmlService {
  private readonly logger = new Logger(AmlService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
  ) {}

  /**
   * Perform AML check on user
   */
  async performAmlCheck(userId: string, checkType: AmlCheck['checkType'], ipAddress: string): Promise<AmlCheck> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 100,
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const riskAssessment = await this.calculateRiskScore(user, checkType);
      
      const amlCheck = await this.prisma.amlCheck.create({
        data: {
          userId,
          checkType,
          status: riskAssessment.status,
          riskScore: riskAssessment.score,
          flags: riskAssessment.flags,
          checkedAt: new Date(),
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'AML_CHECK_PERFORMED',
        resource: 'aml_check',
        ipAddress,
        userAgent: '',
        metadata: {
          checkId: amlCheck.id,
          checkType,
          riskScore: riskAssessment.score,
          status: riskAssessment.status,
          flags: riskAssessment.flags,
        },
        riskLevel: riskAssessment.score > 70 ? 'HIGH' : riskAssessment.score > 40 ? 'MEDIUM' : 'LOW',
      });

      // Auto-report if high risk
      if (riskAssessment.score > 80) {
        await this.createSuspiciousActivityReport({
          userId,
          activityType: 'high_risk_aml_score',
          description: `AML check resulted in high risk score: ${riskAssessment.score}`,
          riskLevel: 'critical',
          reportedAt: new Date(),
          reportedBy: 'system',
          status: 'pending',
        });
      }

      return {
        userId,
        checkType,
        status: amlCheck.status as AmlCheck['status'],
        riskScore: amlCheck.riskScore,
        flags: amlCheck.flags,
        checkedAt: amlCheck.checkedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to perform AML check: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate risk score based on various factors
   */
  private async calculateRiskScore(user: any, checkType: string): Promise<{
    score: number;
    status: AmlCheck['status'];
    flags: string[];
  }> {
    let score = 0;
    const flags: string[] = [];

    // Geographic risk factors
    if (this.isHighRiskCountry(user.country)) {
      score += 20;
      flags.push('high_risk_geography');
    }

    // Transaction pattern analysis
    const transactionRisk = this.analyzeTransactionPatterns(user.transactions);
    score += transactionRisk.score;
    flags.push(...transactionRisk.flags);

    // Identity verification status
    if (user.kycStatus !== 'verified') {
      score += 15;
      flags.push('kyc_not_verified');
    }

    // Account age risk
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) {
      score += 10;
      flags.push('new_account');
    }

    // Suspicious activity history
    const suspiciousReports = await this.prisma.suspiciousActivityReport.count({
      where: { userId: user.id, status: { not: 'false_positive' } },
    });
    if (suspiciousReports > 0) {
      score += suspiciousReports * 25;
      flags.push('previous_suspicious_activity');
    }

    // Determine status based on score
    let status: AmlCheck['status'];
    if (score >= 80) {
      status = 'failed';
    } else if (score >= 50) {
      status = 'requires_review';
    } else {
      status = 'passed';
    }

    return { score: Math.min(score, 100), status, flags };
  }

  /**
   * Analyze transaction patterns for suspicious activity
   */
  private analyzeTransactionPatterns(transactions: any[]): { score: number; flags: string[] } {
    let score = 0;
    const flags: string[] = [];

    if (!transactions || transactions.length === 0) {
      return { score: 0, flags: [] };
    }

    // Large transaction analysis
    const largeTransactions = transactions.filter(t => t.amount > 10000);
    if (largeTransactions.length > 5) {
      score += 20;
      flags.push('frequent_large_transactions');
    }

    // Rapid transaction frequency
    const recentTransactions = transactions.filter(t => 
      Date.now() - new Date(t.createdAt).getTime() < 24 * 60 * 60 * 1000
    );
    if (recentTransactions.length > 20) {
      score += 15;
      flags.push('high_frequency_transactions');
    }

    // Round number patterns (potential structuring)
    const roundAmounts = transactions.filter(t => t.amount % 1000 === 0);
    if (roundAmounts.length / transactions.length > 0.7) {
      score += 25;
      flags.push('suspicious_round_amounts');
    }

    // Unusual time patterns
    const nightTransactions = transactions.filter(t => {
      const hour = new Date(t.createdAt).getHours();
      return hour < 6 || hour > 22;
    });
    if (nightTransactions.length / transactions.length > 0.5) {
      score += 10;
      flags.push('unusual_transaction_times');
    }

    return { score, flags };
  }

  /**
   * Check if country is high risk for AML
   */
  private isHighRiskCountry(country: string): boolean {
    const highRiskCountries = [
      'AF', 'BY', 'MM', 'KP', 'IR', 'IQ', 'LB', 'LY', 'SO', 'SS', 'SD', 'SY', 'YE', 'ZW'
    ];
    return highRiskCountries.includes(country);
  }

  /**
   * Create suspicious activity report
   */
  async createSuspiciousActivityReport(data: SuspiciousActivityReport): Promise<SuspiciousActivityReport> {
    try {
      const report = await this.prisma.suspiciousActivityReport.create({
        data: {
          userId: data.userId,
          transactionId: data.transactionId,
          activityType: data.activityType,
          description: data.description,
          riskLevel: data.riskLevel,
          reportedAt: data.reportedAt,
          reportedBy: data.reportedBy,
          status: data.status,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId: data.userId,
        action: 'SUSPICIOUS_ACTIVITY_REPORTED',
        resource: 'sar',
        ipAddress: 'system',
        userAgent: '',
        metadata: {
          reportId: report.id,
          activityType: data.activityType,
          riskLevel: data.riskLevel,
        },
        riskLevel: 'HIGH',
      });

      this.logger.warn(`Suspicious activity reported for user ${data.userId}: ${data.activityType}`);

      return {
        userId: report.userId,
        transactionId: report.transactionId,
        activityType: report.activityType,
        description: report.description,
        riskLevel: report.riskLevel as SuspiciousActivityReport['riskLevel'],
        reportedAt: report.reportedAt,
        reportedBy: report.reportedBy,
        status: report.status as SuspiciousActivityReport['status'],
      };
    } catch (error) {
      this.logger.error(`Failed to create suspicious activity report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Monitor transaction for AML compliance
   */
  async monitorTransaction(userId: string, transactionId: string, amount: number, ipAddress: string): Promise<void> {
    try {
      // Check for large transaction reporting threshold
      if (amount >= 10000) {
        await this.createSuspiciousActivityReport({
          userId,
          transactionId,
          activityType: 'large_transaction',
          description: `Transaction amount ${amount} exceeds reporting threshold`,
          riskLevel: 'medium',
          reportedAt: new Date(),
          reportedBy: 'system',
          status: 'pending',
        });
      }

      // Check for structuring patterns
      const recentTransactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
      if (totalAmount > 10000 && recentTransactions.length > 5) {
        await this.createSuspiciousActivityReport({
          userId,
          transactionId,
          activityType: 'potential_structuring',
          description: `Multiple transactions totaling ${totalAmount} in 24 hours`,
          riskLevel: 'high',
          reportedAt: new Date(),
          reportedBy: 'system',
          status: 'pending',
        });
      }
    } catch (error) {
      this.logger.error(`Failed to monitor transaction: ${error.message}`, error.stack);
    }
  }

  /**
   * Get AML check history for user
   */
  async getAmlHistory(userId: string): Promise<AmlCheck[]> {
    try {
      const checks = await this.prisma.amlCheck.findMany({
        where: { userId },
        orderBy: { checkedAt: 'desc' },
      });

      return checks.map(check => ({
        userId: check.userId,
        checkType: check.checkType as AmlCheck['checkType'],
        status: check.status as AmlCheck['status'],
        riskScore: check.riskScore,
        flags: check.flags,
        checkedAt: check.checkedAt,
        reviewedBy: check.reviewedBy,
        reviewedAt: check.reviewedAt,
        notes: check.notes,
      }));
    } catch (error) {
      this.logger.error(`Failed to get AML history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get suspicious activity reports
   */
  async getSuspiciousActivityReports(userId?: string): Promise<SuspiciousActivityReport[]> {
    try {
      const reports = await this.prisma.suspiciousActivityReport.findMany({
        where: userId ? { userId } : {},
        orderBy: { reportedAt: 'desc' },
      });

      return reports.map(report => ({
        userId: report.userId,
        transactionId: report.transactionId,
        activityType: report.activityType,
        description: report.description,
        riskLevel: report.riskLevel as SuspiciousActivityReport['riskLevel'],
        reportedAt: report.reportedAt,
        reportedBy: report.reportedBy,
        status: report.status as SuspiciousActivityReport['status'],
      }));
    } catch (error) {
      this.logger.error(`Failed to get suspicious activity reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update suspicious activity report status
   */
  async updateSarStatus(
    reportId: string, 
    status: SuspiciousActivityReport['status'], 
    reviewedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      await this.prisma.suspiciousActivityReport.update({
        where: { id: reportId },
        data: {
          status,
          reviewedBy,
          reviewedAt: new Date(),
          notes,
        },
      });

      this.logger.log(`SAR ${reportId} status updated to ${status} by ${reviewedBy}`);
    } catch (error) {
      this.logger.error(`Failed to update SAR status: ${error.message}`, error.stack);
      throw error;
    }
  }
}
