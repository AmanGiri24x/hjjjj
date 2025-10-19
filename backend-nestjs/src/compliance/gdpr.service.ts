import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { EncryptionService } from '../security/encryption.service';

export interface DataProcessingConsent {
  userId: string;
  purpose: string;
  consentGiven: boolean;
  consentDate: Date;
  ipAddress: string;
  userAgent: string;
  withdrawnDate?: Date;
}

export interface DataExportRequest {
  userId: string;
  requestType: 'export' | 'deletion';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
}

@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
    private encryption: EncryptionService,
  ) {}

  /**
   * Record user consent for data processing
   */
  async recordConsent(data: DataProcessingConsent): Promise<void> {
    try {
      await this.prisma.dataProcessingConsent.create({
        data: {
          userId: data.userId,
          purpose: data.purpose,
          consentGiven: data.consentGiven,
          consentDate: data.consentDate,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      await this.security.logSecurityEvent({
        userId: data.userId,
        action: 'RECORD_GDPR_CONSENT',
        resource: 'consent',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: {
          purpose: data.purpose,
          consentGiven: data.consentGiven,
        },
        riskLevel: 'LOW',
      });

      this.logger.log(`GDPR consent recorded for user ${data.userId}: ${data.purpose}`);
    } catch (error) {
      this.logger.error(`Failed to record GDPR consent: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Withdraw consent for data processing
   */
  async withdrawConsent(userId: string, purpose: string, ipAddress: string, userAgent: string): Promise<void> {
    try {
      await this.prisma.dataProcessingConsent.updateMany({
        where: {
          userId,
          purpose,
          consentGiven: true,
          withdrawnDate: null,
        },
        data: {
          consentGiven: false,
          withdrawnDate: new Date(),
        },
      });

      await this.security.logSecurityEvent({
        userId,
        action: 'WITHDRAW_GDPR_CONSENT',
        resource: 'consent',
        ipAddress,
        userAgent,
        metadata: {
          purpose,
        },
        riskLevel: 'MEDIUM',
      });

      this.logger.log(`GDPR consent withdrawn for user ${userId}: ${purpose}`);
    } catch (error) {
      this.logger.error(`Failed to withdraw GDPR consent: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if user has given consent for specific purpose
   */
  async hasConsent(userId: string, purpose: string): Promise<boolean> {
    try {
      const consent = await this.prisma.dataProcessingConsent.findFirst({
        where: {
          userId,
          purpose,
          consentGiven: true,
          withdrawnDate: null,
        },
        orderBy: {
          consentDate: 'desc',
        },
      });

      return !!consent;
    } catch (error) {
      this.logger.error(`Failed to check GDPR consent: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Export all user data (GDPR Article 20 - Right to data portability)
   */
  async exportUserData(userId: string, ipAddress: string): Promise<DataExportRequest> {
    try {
      const exportRequest = await this.prisma.dataExportRequest.create({
        data: {
          userId,
          requestType: 'export',
          status: 'pending',
          requestedAt: new Date(),
        },
      });

      // Process export asynchronously
      this.processDataExport(userId, exportRequest.id);

      await this.security.logSecurityEvent({
        userId,
        action: 'REQUEST_DATA_EXPORT',
        resource: 'data_export',
        ipAddress,
        userAgent: '',
        metadata: {
          requestId: exportRequest.id,
        },
        riskLevel: 'MEDIUM',
      });

      return {
        userId,
        requestType: 'export',
        status: 'pending',
        requestedAt: exportRequest.requestedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create data export request: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete all user data (GDPR Article 17 - Right to erasure)
   */
  async deleteUserData(userId: string, ipAddress: string): Promise<DataExportRequest> {
    try {
      const deletionRequest = await this.prisma.dataExportRequest.create({
        data: {
          userId,
          requestType: 'deletion',
          status: 'pending',
          requestedAt: new Date(),
        },
      });

      // Process deletion asynchronously
      this.processDataDeletion(userId, deletionRequest.id);

      await this.security.logSecurityEvent({
        userId,
        action: 'REQUEST_DATA_DELETION',
        resource: 'data_deletion',
        ipAddress,
        userAgent: '',
        metadata: {
          requestId: deletionRequest.id,
        },
        riskLevel: 'HIGH',
      });

      return {
        userId,
        requestType: 'deletion',
        status: 'pending',
        requestedAt: deletionRequest.requestedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create data deletion request: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's consent history
   */
  async getConsentHistory(userId: string): Promise<DataProcessingConsent[]> {
    try {
      const consents = await this.prisma.dataProcessingConsent.findMany({
        where: { userId },
        orderBy: { consentDate: 'desc' },
      });

      return consents.map(consent => ({
        userId: consent.userId,
        purpose: consent.purpose,
        consentGiven: consent.consentGiven,
        consentDate: consent.consentDate,
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent,
        withdrawnDate: consent.withdrawnDate,
      }));
    } catch (error) {
      this.logger.error(`Failed to get consent history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process data export asynchronously
   */
  private async processDataExport(userId: string, requestId: string): Promise<void> {
    try {
      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: { status: 'processing' },
      });

      // Collect all user data
      const userData = await this.collectUserData(userId);
      
      // Generate export file (JSON format)
      const exportData = JSON.stringify(userData, null, 2);
      
      // In production, you would upload this to secure cloud storage
      // and provide a time-limited download URL
      const downloadUrl = await this.generateSecureDownloadUrl(exportData, userId);

      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          downloadUrl,
        },
      });

      this.logger.log(`Data export completed for user ${userId}`);
    } catch (error) {
      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: { status: 'failed' },
      });

      this.logger.error(`Failed to process data export: ${error.message}`, error.stack);
    }
  }

  /**
   * Process data deletion asynchronously
   */
  private async processDataDeletion(userId: string, requestId: string): Promise<void> {
    try {
      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: { status: 'processing' },
      });

      // Delete user data from all tables
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.deleteMany({ where: { userId } });
        await tx.budget.deleteMany({ where: { userId } });
        await tx.goal.deleteMany({ where: { userId } });
        await tx.payment.deleteMany({ where: { userId } });
        await tx.subscription.deleteMany({ where: { userId } });
        await tx.customer.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.notification.deleteMany({ where: { userId } });
        await tx.insight.deleteMany({ where: { userId } });
        await tx.dataProcessingConsent.deleteMany({ where: { userId } });
        await tx.user.delete({ where: { id: userId } });
      });

      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      this.logger.log(`Data deletion completed for user ${userId}`);
    } catch (error) {
      await this.prisma.dataExportRequest.update({
        where: { id: requestId },
        data: { status: 'failed' },
      });

      this.logger.error(`Failed to process data deletion: ${error.message}`, error.stack);
    }
  }

  /**
   * Collect all user data for export
   */
  private async collectUserData(userId: string): Promise<any> {
    const [
      user,
      transactions,
      budgets,
      goals,
      payments,
      subscriptions,
      consents,
    ] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.transaction.findMany({ where: { userId } }),
      this.prisma.budget.findMany({ where: { userId } }),
      this.prisma.goal.findMany({ where: { userId } }),
      this.prisma.payment.findMany({ where: { userId } }),
      this.prisma.subscription.findMany({ where: { userId } }),
      this.prisma.dataProcessingConsent.findMany({ where: { userId } }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      userId,
      personalData: {
        profile: user,
        consents,
      },
      financialData: {
        transactions,
        budgets,
        goals,
      },
      paymentData: {
        payments,
        subscriptions,
      },
    };
  }

  /**
   * Generate secure download URL for exported data
   */
  private async generateSecureDownloadUrl(data: string, userId: string): Promise<string> {
    // In production, implement secure file storage and time-limited URLs
    // For now, return a placeholder URL
    return `https://secure-downloads.dhanai.com/exports/${userId}/${Date.now()}.json`;
  }

  /**
   * Validate data processing lawful basis
   */
  async validateProcessingBasis(userId: string, purpose: string): Promise<{
    isValid: boolean;
    basis: string;
    requiresConsent: boolean;
  }> {
    const processingBases = {
      'essential_services': { basis: 'contract', requiresConsent: false },
      'marketing': { basis: 'consent', requiresConsent: true },
      'analytics': { basis: 'legitimate_interest', requiresConsent: false },
      'personalization': { basis: 'consent', requiresConsent: true },
      'security': { basis: 'vital_interests', requiresConsent: false },
      'compliance': { basis: 'legal_obligation', requiresConsent: false },
    };

    const basisInfo = processingBases[purpose];
    if (!basisInfo) {
      return { isValid: false, basis: 'unknown', requiresConsent: true };
    }

    if (basisInfo.requiresConsent) {
      const hasConsent = await this.hasConsent(userId, purpose);
      return {
        isValid: hasConsent,
        basis: basisInfo.basis,
        requiresConsent: true,
      };
    }

    return {
      isValid: true,
      basis: basisInfo.basis,
      requiresConsent: false,
    };
  }
}
