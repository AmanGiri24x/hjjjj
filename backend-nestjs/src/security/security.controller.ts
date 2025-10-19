import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SecurityService } from './security.service';
import { AuditLogService } from './audit-log.service';
import { SessionService } from './session.service';

@ApiTags('Security')
@Controller('security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(
    private securityService: SecurityService,
    private auditLogService: AuditLogService,
    private sessionService: SessionService,
  ) {}

  @Post('validate-session')
  @ApiOperation({ summary: 'Validate current session' })
  @ApiResponse({ status: 200, description: 'Session validation result' })
  async validateSession(@Request() req: any) {
    const sessionId = req.headers['x-session-id'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (!sessionId) {
      throw new HttpException('Session ID required', HttpStatus.BAD_REQUEST);
    }

    const isValid = await this.securityService.validateSession(
      sessionId,
      req.user.sub,
      ipAddress
    );

    return {
      valid: isValid,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Secure logout with session cleanup' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req: any) {
    const sessionId = req.headers['x-session-id'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (sessionId) {
      await this.sessionService.invalidateSession(sessionId);
    }

    // Log security event
    await this.securityService.logSecurityEvent({
      userId: req.user.sub,
      action: 'LOGOUT',
      resource: 'session',
      ipAddress,
      userAgent: req.headers['user-agent'] || '',
      riskLevel: 'LOW',
    });

    return {
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout-all')
  @ApiOperation({ summary: 'Logout from all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions terminated' })
  async logoutAll(@Request() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await this.sessionService.invalidateAllUserSessions(req.user.sub);

    // Log security event
    await this.securityService.logSecurityEvent({
      userId: req.user.sub,
      action: 'LOGOUT_ALL',
      resource: 'session',
      ipAddress,
      userAgent: req.headers['user-agent'] || '',
      riskLevel: 'MEDIUM',
    });

    return {
      message: 'All sessions terminated',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get active sessions for current user' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getActiveSessions(@Request() req: any) {
    const sessions = await this.sessionService.getUserActiveSessions(req.user.sub);
    
    // Remove sensitive information before returning
    return sessions.map(session => ({
      id: session.id,
      ipAddress: this.maskIpAddress(session.ipAddress),
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      isCurrent: req.headers['x-session-id'] === session.id,
    }));
  }

  @Post('sessions/:sessionId/terminate')
  @ApiOperation({ summary: 'Terminate a specific session' })
  @ApiResponse({ status: 200, description: 'Session terminated' })
  async terminateSession(@Param('sessionId') sessionId: string, @Request() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Verify session belongs to current user
    const session = await this.sessionService.getSession(sessionId);
    if (!session || session.userId !== req.user.sub) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    await this.sessionService.invalidateSession(sessionId);

    // Log security event
    await this.securityService.logSecurityEvent({
      userId: req.user.sub,
      action: 'SESSION_TERMINATED',
      resource: 'session',
      ipAddress,
      userAgent: req.headers['user-agent'] || '',
      metadata: { terminatedSessionId: sessionId },
      riskLevel: 'MEDIUM',
    });

    return {
      message: 'Session terminated',
      sessionId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs for current user' })
  @ApiResponse({ status: 200, description: 'User audit logs' })
  async getAuditLogs(
    @Request() req: any,
    @Query('hours') hours: string = '24',
    @Query('limit') limit: string = '50'
  ) {
    const hoursBack = Math.min(parseInt(hours) || 24, 168); // Max 7 days
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 records
    
    const logs = await this.auditLogService.getRecentEvents(req.user.sub, hoursBack * 60);
    
    return {
      logs: logs.slice(0, limitNum).map(log => ({
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
        ipAddress: this.maskIpAddress(log.ipAddress),
        riskLevel: log.riskLevel,
        metadata: log.metadata,
      })),
      total: logs.length,
      timeframe: `${hoursBack} hours`,
    };
  }

  @Get('security-status')
  @ApiOperation({ summary: 'Get security status overview' })
  @ApiResponse({ status: 200, description: 'Security status information' })
  async getSecurityStatus(@Request() req: any) {
    const activeSessions = await this.sessionService.getUserActiveSessions(req.user.sub);
    const recentLogs = await this.auditLogService.getRecentEvents(req.user.sub, 24 * 60);
    const highRiskEvents = recentLogs.filter(log => 
      log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL'
    );

    return {
      activeSessions: activeSessions.length,
      recentActivity: recentLogs.length,
      highRiskEvents: highRiskEvents.length,
      lastLogin: recentLogs.find(log => log.action === 'LOGIN_SUCCESS')?.timestamp,
      securityScore: this.calculateSecurityScore(recentLogs, activeSessions),
      recommendations: this.getSecurityRecommendations(recentLogs, activeSessions),
    };
  }

  @Post('validate-password')
  @ApiOperation({ summary: 'Validate password strength' })
  @ApiResponse({ status: 200, description: 'Password validation result' })
  async validatePassword(@Body() body: { password: string }) {
    const validation = this.securityService.validatePasswordStrength(body.password);
    
    return {
      isValid: validation.isValid,
      score: validation.score,
      feedback: validation.feedback,
      strength: this.getPasswordStrengthLabel(validation.score),
    };
  }

  @Get('compliance-report')
  @UseGuards(RolesGuard)
  @Roles('admin', 'compliance')
  @ApiOperation({ summary: 'Generate compliance audit report' })
  @ApiResponse({ status: 200, description: 'Compliance audit report' })
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
    }

    const logs = await this.auditLogService.getComplianceReport(start, end, userId);
    
    return {
      reportPeriod: { startDate: start, endDate: end },
      totalEvents: logs.length,
      eventsByRisk: this.groupEventsByRisk(logs),
      eventsByAction: this.groupEventsByAction(logs),
      logs: logs.map(log => ({
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
        riskLevel: log.riskLevel,
        metadata: log.metadata,
      })),
    };
  }

  private maskIpAddress(ip: string): string {
    if (!ip) return 'Unknown';
    
    // IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.');
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    
    // IPv6
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return `${parts[0]}:${parts[1]}:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx`;
    }
    
    return 'Unknown';
  }

  private calculateSecurityScore(logs: any[], sessions: any[]): number {
    let score = 100;
    
    // Deduct points for high-risk events
    const highRiskEvents = logs.filter(log => 
      log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL'
    );
    score -= highRiskEvents.length * 10;
    
    // Deduct points for too many active sessions
    if (sessions.length > 3) {
      score -= (sessions.length - 3) * 5;
    }
    
    // Deduct points for failed login attempts
    const failedLogins = logs.filter(log => log.action === 'LOGIN_FAILED');
    score -= failedLogins.length * 5;
    
    return Math.max(score, 0);
  }

  private getSecurityRecommendations(logs: any[], sessions: any[]): string[] {
    const recommendations: string[] = [];
    
    if (sessions.length > 3) {
      recommendations.push('Consider terminating unused sessions');
    }
    
    const highRiskEvents = logs.filter(log => 
      log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL'
    );
    if (highRiskEvents.length > 0) {
      recommendations.push('Review recent high-risk security events');
    }
    
    const failedLogins = logs.filter(log => log.action === 'LOGIN_FAILED');
    if (failedLogins.length > 3) {
      recommendations.push('Consider enabling two-factor authentication');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Your account security looks good');
    }
    
    return recommendations;
  }

  private getPasswordStrengthLabel(score: number): string {
    if (score >= 6) return 'Very Strong';
    if (score >= 5) return 'Strong';
    if (score >= 4) return 'Good';
    if (score >= 3) return 'Fair';
    return 'Weak';
  }

  private groupEventsByRisk(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      acc[log.riskLevel] = (acc[log.riskLevel] || 0) + 1;
      return acc;
    }, {});
  }

  private groupEventsByAction(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});
  }
}
