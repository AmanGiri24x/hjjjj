import { Controller, Post, Get, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpertsService, ExpertRequest } from './experts.service';
import { ExpertMatchingService } from './expert-matching.service';
import { ExpertSessionService } from './expert-session.service';

@ApiTags('Expert Consultation')
@Controller('experts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExpertsController {
  constructor(
    private expertsService: ExpertsService,
    private expertMatchingService: ExpertMatchingService,
    private expertSessionService: ExpertSessionService,
  ) {}

  @Get('available')
  @ApiOperation({ summary: 'Get available experts' })
  @ApiResponse({ status: 200, description: 'Available experts retrieved successfully' })
  async getAvailableExperts(
    @Query('category') category?: string,
    @Query('budget') budget?: string,
    @Query('language') language?: string
  ) {
    const budgetNum = budget ? parseFloat(budget) : undefined;
    return this.expertsService.getAvailableExperts(category, budgetNum, language);
  }

  @Get(':expertId')
  @ApiOperation({ summary: 'Get expert details' })
  @ApiResponse({ status: 200, description: 'Expert details retrieved successfully' })
  async getExpertById(@Param('expertId') expertId: string) {
    return this.expertsService.getExpertById(expertId);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request expert consultation' })
  @ApiResponse({ status: 201, description: 'Expert consultation requested successfully' })
  async requestConsultation(@Request() req, @Body() body: {
    category: 'trading' | 'investment' | 'retirement' | 'tax' | 'insurance' | 'general';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    budget: number;
    preferredLanguage?: string;
    description: string;
    attachments?: string[];
    scheduledFor?: string;
  }) {
    const request: ExpertRequest = {
      userId: req.user.id,
      category: body.category,
      urgency: body.urgency,
      budget: body.budget,
      preferredLanguage: body.preferredLanguage,
      description: body.description,
      attachments: body.attachments,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
    };

    const requestId = await this.expertsService.requestExpertConsultation(request);
    return { requestId };
  }

  @Get('sessions/my')
  @ApiOperation({ summary: 'Get user expert sessions' })
  @ApiResponse({ status: 200, description: 'User sessions retrieved successfully' })
  async getUserSessions(
    @Request() req,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.expertsService.getUserSessions(req.user.id, limitNum);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get session details' })
  @ApiResponse({ status: 200, description: 'Session details retrieved successfully' })
  async getSessionById(
    @Request() req,
    @Param('sessionId') sessionId: string
  ) {
    return this.expertsService.getSessionById(sessionId, req.user.id);
  }

  @Post('sessions/:sessionId/rate')
  @ApiOperation({ summary: 'Rate expert session' })
  @ApiResponse({ status: 200, description: 'Expert rated successfully' })
  async rateExpert(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() body: { rating: number; feedback?: string }
  ) {
    await this.expertsService.rateExpert(sessionId, req.user.id, body.rating, body.feedback);
    return { success: true };
  }

  @Post('match')
  @ApiOperation({ summary: 'Find matching experts' })
  @ApiResponse({ status: 200, description: 'Matching experts found successfully' })
  async findMatchingExperts(@Request() req, @Body() body: {
    requirements: string[];
    budget: number;
    urgency: string;
    preferredTime?: string;
  }) {
    return this.expertMatchingService.findBestMatches(req.user.id, body);
  }

  @Post('sessions/:sessionId/start')
  @ApiOperation({ summary: 'Start expert session' })
  @ApiResponse({ status: 200, description: 'Session started successfully' })
  async startSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() body: { sessionType: 'chat' | 'video' | 'phone' }
  ) {
    return this.expertSessionService.startSession(sessionId, req.user.id, body.sessionType);
  }

  @Post('sessions/:sessionId/end')
  @ApiOperation({ summary: 'End expert session' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  async endSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() body: { summary?: string; actionItems?: string[] }
  ) {
    return this.expertSessionService.endSession(sessionId, req.user.id, body.summary, body.actionItems);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get expert platform statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getExpertStats() {
    return this.expertsService.getExpertStats();
  }

  @Get('categories/popular')
  @ApiOperation({ summary: 'Get popular consultation categories' })
  @ApiResponse({ status: 200, description: 'Popular categories retrieved successfully' })
  async getPopularCategories() {
    const stats = await this.expertsService.getExpertStats();
    return stats.popularCategories;
  }

  @Post('emergency')
  @ApiOperation({ summary: 'Request emergency expert consultation' })
  @ApiResponse({ status: 201, description: 'Emergency consultation requested successfully' })
  async requestEmergencyConsultation(@Request() req, @Body() body: {
    issue: string;
    description: string;
    maxBudget: number;
  }) {
    const request: ExpertRequest = {
      userId: req.user.id,
      category: 'general',
      urgency: 'critical',
      budget: body.maxBudget,
      description: `EMERGENCY: ${body.issue} - ${body.description}`,
    };

    const requestId = await this.expertsService.requestExpertConsultation(request);
    
    // Immediately notify all available experts
    await this.expertMatchingService.notifyEmergencyRequest(requestId);
    
    return { requestId, message: 'Emergency request sent to all available experts' };
  }
}
