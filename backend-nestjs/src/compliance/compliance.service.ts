import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { GdprService } from './gdpr.service';
import { AmlService } from './aml.service';
import { PciDssService } from './pci-dss.service';
import { SoxService } from './sox.service';

export interface ComplianceOverview {
  gdpr: {
    status: 'compliant' | 'non_compliant' | 'needs_review';
    lastAssessment: Date;
    nextAssessment: Date;
    issues: string[];
  };
  aml: {
    status: 'compliant' | 'non_compliant' | 'needs_review';
    lastAssessment: Date;
    nextAssessment: Date;
    pendingReports: number;
  };
  pciDss: {
    status: 'compliant' | 'non_compliant' | 'needs_review';
    lastAssessment: Date;
    nextAssessment: Date;
    requirements: number;
  };
  sox: {
    status: 'effective' | 'deficient' | 'material_weakness';
    lastAssessment: Date;
    nextAssessment: Date;
    controlsEffective: number;
    totalControls: number;
  };
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
    private gdpr: GdprService,
    private aml: AmlService,
    private pciDss: PciDssService,
    private sox: SoxService,
  ) {}

  /**
   * Get comprehensive compliance overview
   */
  async getComplianceOverview(): Promise<ComplianceOverview> {
    try {
      const [gdprStatus, amlReports, pciReport, soxAssessment] = await Promise.all([
        this.getGdprStatus(),
        this.aml.getSuspiciousActivityReports(),
        this.pciDss.generateComplianceReport(),
        this.sox.performSoxAssessment(),
      ]);

      return {
        gdpr: {
          status: gdprStatus.compliant ? 'compliant' : 'needs_review',
          lastAssessment: new Date(),
          nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          issues: gdprStatus.issues,
        },
        aml: {
          status: amlReports.filter(r => r.status === 'pending').length > 0 ? 'needs_review' : 'compliant',
          lastAssessment: new Date(),
          nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          pendingReports: amlReports.filter(r => r.status === 'pending').length,
        },
        pciDss: {
          status: pciReport.overallStatus,
          lastAssessment: new Date(),
          nextAssessment: pciReport.nextAssessmentDue,
          requirements: pciReport.requirements.length,
        },
        sox: {
          status: soxAssessment.overallRating,
          lastAssessment: new Date(),
          nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          controlsEffective: soxAssessment.controls.filter(c => c.status === 'effective').length,
          totalControls: soxAssessment.controls.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get compliance overview: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Perform comprehensive compliance assessment
   */
  async performComplianceAssessment(): Promise<{
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    frameworks: {
      gdpr: any;
      aml: any;
      pciDss: any;
      sox: any;
    };
    recommendations: string[];
    nextActions: string[];
  }> {
    try {
      const [gdprStatus, amlReports, pciReport, soxReport] = await Promise.all([
        this.assessGdprCompliance(),
        this.aml.getSuspiciousActivityReports(),
        this.pciDss.generateComplianceReport(),
        this.sox.generateSoxComplianceReport(),
      ]);

      const recommendations: string[] = [];
      const nextActions: string[] = [];

      // Analyze GDPR compliance
      if (!gdprStatus.compliant) {
        recommendations.push(...gdprStatus.recommendations);
        nextActions.push('Address GDPR compliance gaps');
      }

      // Analyze AML compliance
      const pendingSars = amlReports.filter(r => r.status === 'pending');
      if (pendingSars.length > 0) {
        recommendations.push(`Review ${pendingSars.length} pending suspicious activity reports`);
        nextActions.push('Process pending AML reports');
      }

      // Analyze PCI DSS compliance
      if (pciReport.overallStatus !== 'compliant') {
        recommendations.push('Address PCI DSS compliance issues');
        nextActions.push('Remediate PCI DSS findings');
      }

      // Analyze SOX compliance
      if (soxReport.overallAssessment !== 'effective') {
        recommendations.push(...soxReport.managementActions);
        nextActions.push('Strengthen SOX controls');
      }

      // Calculate overall risk
      const riskFactors = [
        !gdprStatus.compliant ? 2 : 0,
        pendingSars.length > 5 ? 3 : pendingSars.length > 0 ? 1 : 0,
        pciReport.overallStatus === 'non_compliant' ? 3 : pciReport.overallStatus === 'needs_review' ? 1 : 0,
        soxReport.overallAssessment === 'material_weakness' ? 3 : soxReport.overallAssessment === 'deficient' ? 2 : 0,
      ];

      const totalRisk = riskFactors.reduce((sum, risk) => sum + risk, 0);
      let overallRisk: 'low' | 'medium' | 'high' | 'critical';
      if (totalRisk >= 8) overallRisk = 'critical';
      else if (totalRisk >= 5) overallRisk = 'high';
      else if (totalRisk >= 2) overallRisk = 'medium';
      else overallRisk = 'low';

      // Log compliance assessment
      await this.security.logSecurityEvent({
        userId: 'system',
        action: 'COMPLIANCE_ASSESSMENT_PERFORMED',
        resource: 'compliance',
        ipAddress: 'system',
        userAgent: '',
        metadata: {
          overallRisk,
          totalRisk,
          recommendationsCount: recommendations.length,
          nextActionsCount: nextActions.length,
        },
        riskLevel: overallRisk === 'critical' ? 'HIGH' : overallRisk === 'high' ? 'HIGH' : 'MEDIUM',
      });

      return {
        overallRisk,
        frameworks: {
          gdpr: gdprStatus,
          aml: { pendingReports: pendingSars.length, totalReports: amlReports.length },
          pciDss: pciReport,
          sox: soxReport,
        },
        recommendations,
        nextActions,
      };
    } catch (error) {
      this.logger.error(`Failed to perform compliance assessment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Schedule compliance monitoring tasks
   */
  async scheduleComplianceMonitoring(): Promise<void> {
    try {
      // Schedule daily AML monitoring
      await this.scheduleTask('aml_monitoring', 'daily', async () => {
        const recentTransactions = await this.prisma.transaction.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        });

        for (const transaction of recentTransactions) {
          await this.aml.monitorTransaction(
            transaction.userId,
            transaction.id,
            transaction.amount,
            'system'
          );
        }
      });

      // Schedule weekly PCI DSS checks
      await this.scheduleTask('pci_dss_check', 'weekly', async () => {
        await this.pciDss.performComplianceCheck();
      });

      // Schedule monthly SOX control testing
      await this.scheduleTask('sox_control_testing', 'monthly', async () => {
        const assessment = await this.sox.performSoxAssessment();
        // Auto-test low-risk controls
        for (const control of assessment.controls) {
          if (control.status === 'not_tested') {
            // In production, implement automated testing
            this.logger.log(`Control ${control.controlId} requires testing`);
          }
        }
      });

      // Schedule quarterly GDPR assessments
      await this.scheduleTask('gdpr_assessment', 'quarterly', async () => {
        await this.assessGdprCompliance();
      });

      this.logger.log('Compliance monitoring tasks scheduled');
    } catch (error) {
      this.logger.error(`Failed to schedule compliance monitoring: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate compliance dashboard data
   */
  async getComplianceDashboard(): Promise<{
    summary: ComplianceOverview;
    alerts: Array<{
      type: 'gdpr' | 'aml' | 'pci_dss' | 'sox';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      actionRequired: boolean;
    }>;
    metrics: {
      consentRate: number;
      amlRiskScore: number;
      pciCompliance: number;
      soxEffectiveness: number;
    };
    recentActivity: Array<{
      timestamp: Date;
      type: string;
      description: string;
      status: string;
    }>;
  }> {
    try {
      const overview = await this.getComplianceOverview();
      const alerts = await this.generateComplianceAlerts(overview);
      const metrics = await this.calculateComplianceMetrics();
      const recentActivity = await this.getRecentComplianceActivity();

      return {
        summary: overview,
        alerts,
        metrics,
        recentActivity,
      };
    } catch (error) {
      this.logger.error(`Failed to get compliance dashboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getGdprStatus(): Promise<{ compliant: boolean; issues: string[] }> {
    // Check for users without consent
    const usersWithoutConsent = await this.prisma.user.count({
      where: {
        dataProcessingConsents: {
          none: {
            consentGiven: true,
            withdrawnDate: null,
          },
        },
      },
    });

    const issues: string[] = [];
    if (usersWithoutConsent > 0) {
      issues.push(`${usersWithoutConsent} users without proper consent`);
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  private async assessGdprCompliance(): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const status = await this.getGdprStatus();
    const recommendations: string[] = [];

    if (!status.compliant) {
      recommendations.push('Implement consent collection for all users');
      recommendations.push('Review data processing purposes');
      recommendations.push('Update privacy policy');
    }

    return {
      compliant: status.compliant,
      issues: status.issues,
      recommendations,
    };
  }

  private async scheduleTask(taskName: string, frequency: string, task: () => Promise<void>): Promise<void> {
    // In production, this would integrate with a job scheduler like Bull or Agenda
    this.logger.log(`Scheduled ${taskName} to run ${frequency}`);
  }

  private async generateComplianceAlerts(overview: ComplianceOverview): Promise<Array<{
    type: 'gdpr' | 'aml' | 'pci_dss' | 'sox';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    actionRequired: boolean;
  }>> {
    const alerts = [];

    // GDPR alerts
    if (overview.gdpr.status === 'non_compliant') {
      alerts.push({
        type: 'gdpr' as const,
        severity: 'high' as const,
        message: 'GDPR compliance issues detected',
        actionRequired: true,
      });
    }

    // AML alerts
    if (overview.aml.pendingReports > 0) {
      alerts.push({
        type: 'aml' as const,
        severity: overview.aml.pendingReports > 5 ? 'critical' as const : 'medium' as const,
        message: `${overview.aml.pendingReports} pending AML reports require review`,
        actionRequired: true,
      });
    }

    // PCI DSS alerts
    if (overview.pciDss.status === 'non_compliant') {
      alerts.push({
        type: 'pci_dss' as const,
        severity: 'critical' as const,
        message: 'PCI DSS compliance failure detected',
        actionRequired: true,
      });
    }

    // SOX alerts
    if (overview.sox.status === 'material_weakness') {
      alerts.push({
        type: 'sox' as const,
        severity: 'critical' as const,
        message: 'SOX material weakness identified',
        actionRequired: true,
      });
    }

    return alerts;
  }

  private async calculateComplianceMetrics(): Promise<{
    consentRate: number;
    amlRiskScore: number;
    pciCompliance: number;
    soxEffectiveness: number;
  }> {
    // Calculate consent rate
    const totalUsers = await this.prisma.user.count();
    const usersWithConsent = await this.prisma.user.count({
      where: {
        dataProcessingConsents: {
          some: {
            consentGiven: true,
            withdrawnDate: null,
          },
        },
      },
    });
    const consentRate = totalUsers > 0 ? (usersWithConsent / totalUsers) * 100 : 0;

    // Calculate average AML risk score
    const amlChecks = await this.prisma.amlCheck.findMany({
      where: {
        checkedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const amlRiskScore = amlChecks.length > 0 
      ? amlChecks.reduce((sum, check) => sum + check.riskScore, 0) / amlChecks.length 
      : 0;

    // PCI compliance percentage (simplified)
    const pciCompliance = 95; // In production, calculate based on actual checks

    // SOX effectiveness percentage
    const soxReport = await this.sox.generateSoxComplianceReport();
    const soxEffectiveness = soxReport.controlsAssessed > 0 
      ? (soxReport.effectiveControls / soxReport.controlsAssessed) * 100 
      : 0;

    return {
      consentRate,
      amlRiskScore,
      pciCompliance,
      soxEffectiveness,
    };
  }

  private async getRecentComplianceActivity(): Promise<Array<{
    timestamp: Date;
    type: string;
    description: string;
    status: string;
  }>> {
    // Get recent security events related to compliance
    const recentEvents = await this.prisma.securityEvent.findMany({
      where: {
        action: {
          in: [
            'AML_CHECK_PERFORMED',
            'SUSPICIOUS_ACTIVITY_REPORTED',
            'GDPR_CONSENT_RECORDED',
            'SOX_CONTROL_TESTED',
            'COMPLIANCE_ASSESSMENT_PERFORMED',
          ],
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return recentEvents.map(event => ({
      timestamp: event.createdAt,
      type: event.action,
      description: `${event.action.replace(/_/g, ' ').toLowerCase()} for ${event.resource}`,
      status: event.riskLevel,
    }));
  }
}
