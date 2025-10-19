import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';

export interface SoxControl {
  controlId: string;
  controlName: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  owner: string;
  status: 'effective' | 'deficient' | 'not_tested';
  lastTested: Date;
  nextTestDue: Date;
  evidence: string[];
}

export interface FinancialReport {
  reportId: string;
  reportType: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity_statement';
  period: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
  createdAt: Date;
  status: 'draft' | 'under_review' | 'approved' | 'filed';
}

@Injectable()
export class SoxService {
  private readonly logger = new Logger(SoxService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
  ) {}

  /**
   * Perform SOX compliance assessment
   */
  async performSoxAssessment(): Promise<{
    overallRating: 'effective' | 'deficient' | 'material_weakness';
    controls: SoxControl[];
    deficiencies: string[];
    recommendations: string[];
  }> {
    try {
      const controls = await this.getSoxControls();
      const deficiencies: string[] = [];
      const recommendations: string[] = [];

      // Assess each control
      for (const control of controls) {
        if (control.status === 'deficient') {
          deficiencies.push(`Control ${control.controlId}: ${control.controlName} is deficient`);
          recommendations.push(`Remediate control ${control.controlId} immediately`);
        } else if (control.status === 'not_tested') {
          deficiencies.push(`Control ${control.controlId}: ${control.controlName} has not been tested`);
          recommendations.push(`Schedule testing for control ${control.controlId}`);
        }
      }

      // Determine overall rating
      const deficientControls = controls.filter(c => c.status === 'deficient').length;
      const totalControls = controls.length;
      
      let overallRating: 'effective' | 'deficient' | 'material_weakness';
      if (deficientControls === 0) {
        overallRating = 'effective';
      } else if (deficientControls / totalControls > 0.2) {
        overallRating = 'material_weakness';
      } else {
        overallRating = 'deficient';
      }

      // Log assessment
      await this.security.logSecurityEvent({
        userId: 'system',
        action: 'SOX_ASSESSMENT_PERFORMED',
        resource: 'sox_compliance',
        ipAddress: 'system',
        userAgent: '',
        metadata: {
          overallRating,
          totalControls,
          deficientControls,
          deficienciesCount: deficiencies.length,
        },
        riskLevel: overallRating === 'material_weakness' ? 'HIGH' : 'MEDIUM',
      });

      return {
        overallRating,
        controls,
        deficiencies,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Failed to perform SOX assessment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get SOX controls
   */
  private async getSoxControls(): Promise<SoxControl[]> {
    // In production, these would come from a database
    return [
      {
        controlId: 'ITGC-001',
        controlName: 'User Access Management',
        description: 'Ensure appropriate user access to financial systems',
        frequency: 'quarterly',
        owner: 'IT Security Team',
        status: 'effective',
        lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextTestDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        evidence: ['Access review reports', 'User provisioning logs'],
      },
      {
        controlId: 'ITGC-002',
        controlName: 'Change Management',
        description: 'Control changes to financial systems and applications',
        frequency: 'monthly',
        owner: 'Development Team',
        status: 'effective',
        lastTested: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextTestDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        evidence: ['Change approval forms', 'Deployment logs'],
      },
      {
        controlId: 'ITGC-003',
        controlName: 'Data Backup and Recovery',
        description: 'Ensure financial data is backed up and recoverable',
        frequency: 'monthly',
        owner: 'Infrastructure Team',
        status: 'effective',
        lastTested: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        nextTestDue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        evidence: ['Backup logs', 'Recovery test results'],
      },
      {
        controlId: 'AC-001',
        controlName: 'Revenue Recognition',
        description: 'Ensure revenue is recognized in accordance with accounting standards',
        frequency: 'monthly',
        owner: 'Finance Team',
        status: 'effective',
        lastTested: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        nextTestDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        evidence: ['Revenue reports', 'Contract reviews'],
      },
      {
        controlId: 'AC-002',
        controlName: 'Financial Close Process',
        description: 'Ensure timely and accurate financial reporting',
        frequency: 'monthly',
        owner: 'Accounting Team',
        status: 'effective',
        lastTested: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        nextTestDue: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        evidence: ['Close checklists', 'Journal entry approvals'],
      },
    ];
  }

  /**
   * Test SOX control
   */
  async testSoxControl(controlId: string, testerId: string, testResults: {
    status: SoxControl['status'];
    findings: string[];
    evidence: string[];
  }): Promise<void> {
    try {
      // In production, this would update the control in database
      await this.prisma.soxControl.upsert({
        where: { controlId },
        update: {
          status: testResults.status,
          lastTested: new Date(),
          nextTestDue: this.calculateNextTestDue(controlId),
          findings: testResults.findings,
          evidence: testResults.evidence,
          testedBy: testerId,
        },
        create: {
          controlId,
          status: testResults.status,
          lastTested: new Date(),
          nextTestDue: this.calculateNextTestDue(controlId),
          findings: testResults.findings,
          evidence: testResults.evidence,
          testedBy: testerId,
        },
      });

      // Log control testing
      await this.security.logSecurityEvent({
        userId: testerId,
        action: 'SOX_CONTROL_TESTED',
        resource: 'sox_control',
        ipAddress: 'system',
        userAgent: '',
        metadata: {
          controlId,
          status: testResults.status,
          findingsCount: testResults.findings.length,
        },
        riskLevel: testResults.status === 'deficient' ? 'HIGH' : 'LOW',
      });

      this.logger.log(`SOX control ${controlId} tested by ${testerId}: ${testResults.status}`);
    } catch (error) {
      this.logger.error(`Failed to test SOX control: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate financial report with SOX compliance
   */
  async generateFinancialReport(reportData: {
    reportType: FinancialReport['reportType'];
    period: string;
    preparedBy: string;
    data: any;
  }): Promise<FinancialReport> {
    try {
      const report = await this.prisma.financialReport.create({
        data: {
          reportType: reportData.reportType,
          period: reportData.period,
          preparedBy: reportData.preparedBy,
          status: 'draft',
          data: reportData.data,
        },
      });

      // Log report generation
      await this.security.logSecurityEvent({
        userId: reportData.preparedBy,
        action: 'FINANCIAL_REPORT_GENERATED',
        resource: 'financial_report',
        ipAddress: 'system',
        userAgent: '',
        metadata: {
          reportId: report.id,
          reportType: reportData.reportType,
          period: reportData.period,
        },
        riskLevel: 'MEDIUM',
      });

      return {
        reportId: report.id,
        reportType: report.reportType as FinancialReport['reportType'],
        period: report.period,
        preparedBy: report.preparedBy,
        reviewedBy: report.reviewedBy,
        approvedBy: report.approvedBy,
        createdAt: report.createdAt,
        status: report.status as FinancialReport['status'],
      };
    } catch (error) {
      this.logger.error(`Failed to generate financial report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Approve financial report
   */
  async approveFinancialReport(reportId: string, approvedBy: string, comments?: string): Promise<void> {
    try {
      await this.prisma.financialReport.update({
        where: { id: reportId },
        data: {
          approvedBy,
          status: 'approved',
          approvedAt: new Date(),
          approvalComments: comments,
        },
      });

      // Log report approval
      await this.security.logSecurityEvent({
        userId: approvedBy,
        action: 'FINANCIAL_REPORT_APPROVED',
        resource: 'financial_report',
        ipAddress: 'system',
        userAgent: '',
        metadata: {
          reportId,
          approvedBy,
        },
        riskLevel: 'MEDIUM',
      });

      this.logger.log(`Financial report ${reportId} approved by ${approvedBy}`);
    } catch (error) {
      this.logger.error(`Failed to approve financial report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Monitor financial data integrity
   */
  async monitorDataIntegrity(): Promise<{
    status: 'clean' | 'issues_found';
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check for data consistency
      const inconsistencies = await this.checkDataConsistency();
      if (inconsistencies.length > 0) {
        issues.push(...inconsistencies);
        recommendations.push('Review and correct data inconsistencies');
      }

      // Check for unauthorized changes
      const unauthorizedChanges = await this.checkUnauthorizedChanges();
      if (unauthorizedChanges.length > 0) {
        issues.push(...unauthorizedChanges);
        recommendations.push('Investigate unauthorized data changes');
      }

      // Check for missing audit trails
      const missingAudits = await this.checkMissingAuditTrails();
      if (missingAudits.length > 0) {
        issues.push(...missingAudits);
        recommendations.push('Ensure all financial transactions have audit trails');
      }

      return {
        status: issues.length === 0 ? 'clean' : 'issues_found',
        issues,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Failed to monitor data integrity: ${error.message}`, error.stack);
      throw error;
    }
  }

  private calculateNextTestDue(controlId: string): Date {
    // In production, this would be based on control frequency
    const nextTest = new Date();
    nextTest.setMonth(nextTest.getMonth() + 1); // Default to monthly
    return nextTest;
  }

  private async checkDataConsistency(): Promise<string[]> {
    // In production, this would check for data inconsistencies
    return [];
  }

  private async checkUnauthorizedChanges(): Promise<string[]> {
    // In production, this would check for unauthorized changes
    return [];
  }

  private async checkMissingAuditTrails(): Promise<string[]> {
    // In production, this would check for missing audit trails
    return [];
  }

  /**
   * Generate SOX compliance report
   */
  async generateSoxComplianceReport(): Promise<{
    reportDate: Date;
    overallAssessment: string;
    controlsAssessed: number;
    effectiveControls: number;
    deficientControls: number;
    materialWeaknesses: number;
    keyFindings: string[];
    managementActions: string[];
  }> {
    try {
      const assessment = await this.performSoxAssessment();
      
      const effectiveControls = assessment.controls.filter(c => c.status === 'effective').length;
      const deficientControls = assessment.controls.filter(c => c.status === 'deficient').length;
      const materialWeaknesses = assessment.overallRating === 'material_weakness' ? 1 : 0;

      return {
        reportDate: new Date(),
        overallAssessment: assessment.overallRating,
        controlsAssessed: assessment.controls.length,
        effectiveControls,
        deficientControls,
        materialWeaknesses,
        keyFindings: assessment.deficiencies,
        managementActions: assessment.recommendations,
      };
    } catch (error) {
      this.logger.error(`Failed to generate SOX compliance report: ${error.message}`, error.stack);
      throw error;
    }
  }
}
