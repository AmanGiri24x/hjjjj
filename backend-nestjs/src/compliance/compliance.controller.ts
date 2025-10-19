import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComplianceService } from './compliance.service';
import { GdprService, DataProcessingConsent } from './gdpr.service';
import { AmlService } from './aml.service';
import { PciDssService } from './pci-dss.service';
import { SoxService } from './sox.service';

@ApiTags('compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ComplianceController {
  constructor(
    private readonly compliance: ComplianceService,
    private readonly gdpr: GdprService,
    private readonly aml: AmlService,
    private readonly pciDss: PciDssService,
    private readonly sox: SoxService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get compliance overview' })
  @ApiResponse({ status: 200, description: 'Compliance overview retrieved successfully' })
  async getComplianceOverview() {
    try {
      return await this.compliance.getComplianceOverview();
    } catch (error) {
      throw new HttpException(
        'Failed to get compliance overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get compliance dashboard data' })
  @ApiResponse({ status: 200, description: 'Compliance dashboard data retrieved successfully' })
  async getComplianceDashboard() {
    try {
      return await this.compliance.getComplianceDashboard();
    } catch (error) {
      throw new HttpException(
        'Failed to get compliance dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('assessment')
  @ApiOperation({ summary: 'Perform comprehensive compliance assessment' })
  @ApiResponse({ status: 200, description: 'Compliance assessment completed successfully' })
  async performComplianceAssessment() {
    try {
      return await this.compliance.performComplianceAssessment();
    } catch (error) {
      throw new HttpException(
        'Failed to perform compliance assessment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GDPR Endpoints
  @Post('gdpr/consent')
  @ApiOperation({ summary: 'Record GDPR consent' })
  @ApiResponse({ status: 201, description: 'Consent recorded successfully' })
  async recordGdprConsent(@Request() req, @Body() consentData: {
    purpose: string;
    consentGiven: boolean;
  }) {
    try {
      const consent: DataProcessingConsent = {
        userId: req.user.id,
        purpose: consentData.purpose,
        consentGiven: consentData.consentGiven,
        consentDate: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      };

      await this.gdpr.recordConsent(consent);
      return { message: 'Consent recorded successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to record consent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('gdpr/consent/:purpose/withdraw')
  @ApiOperation({ summary: 'Withdraw GDPR consent' })
  @ApiResponse({ status: 200, description: 'Consent withdrawn successfully' })
  async withdrawGdprConsent(@Request() req, @Param('purpose') purpose: string) {
    try {
      await this.gdpr.withdrawConsent(
        req.user.id,
        purpose,
        req.ip,
        req.headers['user-agent'] || '',
      );
      return { message: 'Consent withdrawn successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to withdraw consent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('gdpr/consent/history')
  @ApiOperation({ summary: 'Get user consent history' })
  @ApiResponse({ status: 200, description: 'Consent history retrieved successfully' })
  async getConsentHistory(@Request() req) {
    try {
      return await this.gdpr.getConsentHistory(req.user.id);
    } catch (error) {
      throw new HttpException(
        'Failed to get consent history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('gdpr/export')
  @ApiOperation({ summary: 'Request data export (GDPR Article 20)' })
  @ApiResponse({ status: 201, description: 'Data export request created successfully' })
  async requestDataExport(@Request() req) {
    try {
      return await this.gdpr.exportUserData(req.user.id, req.ip);
    } catch (error) {
      throw new HttpException(
        'Failed to request data export',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('gdpr/delete')
  @ApiOperation({ summary: 'Request data deletion (GDPR Article 17)' })
  @ApiResponse({ status: 201, description: 'Data deletion request created successfully' })
  async requestDataDeletion(@Request() req) {
    try {
      return await this.gdpr.deleteUserData(req.user.id, req.ip);
    } catch (error) {
      throw new HttpException(
        'Failed to request data deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // AML Endpoints
  @Post('aml/check')
  @ApiOperation({ summary: 'Perform AML check on user' })
  @ApiResponse({ status: 201, description: 'AML check completed successfully' })
  async performAmlCheck(@Request() req, @Body() checkData: {
    checkType: 'kyc' | 'transaction' | 'periodic' | 'suspicious_activity';
  }) {
    try {
      return await this.aml.performAmlCheck(req.user.id, checkData.checkType, req.ip);
    } catch (error) {
      throw new HttpException(
        'Failed to perform AML check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('aml/history')
  @ApiOperation({ summary: 'Get AML check history' })
  @ApiResponse({ status: 200, description: 'AML history retrieved successfully' })
  async getAmlHistory(@Request() req) {
    try {
      return await this.aml.getAmlHistory(req.user.id);
    } catch (error) {
      throw new HttpException(
        'Failed to get AML history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('aml/report')
  @ApiOperation({ summary: 'Create suspicious activity report' })
  @ApiResponse({ status: 201, description: 'Suspicious activity report created successfully' })
  async createSuspiciousActivityReport(@Request() req, @Body() reportData: {
    transactionId?: string;
    activityType: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }) {
    try {
      return await this.aml.createSuspiciousActivityReport({
        userId: req.user.id,
        transactionId: reportData.transactionId,
        activityType: reportData.activityType,
        description: reportData.description,
        riskLevel: reportData.riskLevel,
        reportedAt: new Date(),
        reportedBy: req.user.id,
        status: 'pending',
      });
    } catch (error) {
      throw new HttpException(
        'Failed to create suspicious activity report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('aml/reports')
  @ApiOperation({ summary: 'Get suspicious activity reports' })
  @ApiResponse({ status: 200, description: 'Suspicious activity reports retrieved successfully' })
  async getSuspiciousActivityReports(@Request() req) {
    try {
      // Only return user's own reports unless admin
      const userId = req.user.role === 'admin' ? undefined : req.user.id;
      return await this.aml.getSuspiciousActivityReports(userId);
    } catch (error) {
      throw new HttpException(
        'Failed to get suspicious activity reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // PCI DSS Endpoints
  @Post('pci-dss/check')
  @ApiOperation({ summary: 'Perform PCI DSS compliance check' })
  @ApiResponse({ status: 201, description: 'PCI DSS compliance check completed successfully' })
  async performPciDssCheck() {
    try {
      return await this.pciDss.performComplianceCheck();
    } catch (error) {
      throw new HttpException(
        'Failed to perform PCI DSS compliance check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pci-dss/report')
  @ApiOperation({ summary: 'Generate PCI DSS compliance report' })
  @ApiResponse({ status: 200, description: 'PCI DSS compliance report generated successfully' })
  async generatePciDssReport() {
    try {
      return await this.pciDss.generateComplianceReport();
    } catch (error) {
      throw new HttpException(
        'Failed to generate PCI DSS compliance report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('pci-dss/card-access')
  @ApiOperation({ summary: 'Log card data access' })
  @ApiResponse({ status: 201, description: 'Card data access logged successfully' })
  async logCardDataAccess(@Request() req, @Body() accessData: {
    accessType: 'view' | 'process' | 'store';
    cardLast4: string;
    purpose: string;
  }) {
    try {
      await this.pciDss.logCardDataAccess({
        userId: req.user.id,
        accessType: accessData.accessType,
        cardLast4: accessData.cardLast4,
        accessedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        purpose: accessData.purpose,
      });
      return { message: 'Card data access logged successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to log card data access',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // SOX Endpoints
  @Post('sox/assessment')
  @ApiOperation({ summary: 'Perform SOX compliance assessment' })
  @ApiResponse({ status: 201, description: 'SOX assessment completed successfully' })
  async performSoxAssessment() {
    try {
      return await this.sox.performSoxAssessment();
    } catch (error) {
      throw new HttpException(
        'Failed to perform SOX assessment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sox/control/:controlId/test')
  @ApiOperation({ summary: 'Test SOX control' })
  @ApiResponse({ status: 201, description: 'SOX control tested successfully' })
  async testSoxControl(@Request() req, @Param('controlId') controlId: string, @Body() testData: {
    status: 'effective' | 'deficient' | 'not_tested';
    findings: string[];
    evidence: string[];
  }) {
    try {
      await this.sox.testSoxControl(controlId, req.user.id, testData);
      return { message: 'SOX control tested successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to test SOX control',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sox/report')
  @ApiOperation({ summary: 'Generate SOX compliance report' })
  @ApiResponse({ status: 200, description: 'SOX compliance report generated successfully' })
  async generateSoxReport() {
    try {
      return await this.sox.generateSoxComplianceReport();
    } catch (error) {
      throw new HttpException(
        'Failed to generate SOX compliance report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sox/financial-report')
  @ApiOperation({ summary: 'Generate financial report' })
  @ApiResponse({ status: 201, description: 'Financial report generated successfully' })
  async generateFinancialReport(@Request() req, @Body() reportData: {
    reportType: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity_statement';
    period: string;
    data: any;
  }) {
    try {
      return await this.sox.generateFinancialReport({
        reportType: reportData.reportType,
        period: reportData.period,
        preparedBy: req.user.id,
        data: reportData.data,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to generate financial report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('sox/financial-report/:reportId/approve')
  @ApiOperation({ summary: 'Approve financial report' })
  @ApiResponse({ status: 200, description: 'Financial report approved successfully' })
  async approveFinancialReport(@Request() req, @Param('reportId') reportId: string, @Body() approvalData: {
    comments?: string;
  }) {
    try {
      await this.sox.approveFinancialReport(reportId, req.user.id, approvalData.comments);
      return { message: 'Financial report approved successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to approve financial report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sox/data-integrity')
  @ApiOperation({ summary: 'Monitor financial data integrity' })
  @ApiResponse({ status: 200, description: 'Data integrity monitoring completed successfully' })
  async monitorDataIntegrity() {
    try {
      return await this.sox.monitorDataIntegrity();
    } catch (error) {
      throw new HttpException(
        'Failed to monitor data integrity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
