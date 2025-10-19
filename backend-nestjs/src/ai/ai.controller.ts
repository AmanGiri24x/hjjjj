import { Controller, Post, Get, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService, AiRequest, AiResponse } from './ai.service';
import { ModelService } from './model.service';
import { RagService } from './rag.service';
import { InsightsService } from './insights.service';
import { PredictionService } from './prediction.service';

@ApiTags('AI Services')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(
    private aiService: AiService,
    private modelService: ModelService,
    private ragService: RagService,
    private insightsService: InsightsService,
    private predictionService: PredictionService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI financial advisor' })
  @ApiResponse({ status: 200, description: 'AI response generated successfully' })
  async chat(@Request() req, @Body() body: { query: string; sessionId?: string; context?: any }): Promise<AiResponse> {
    const aiRequest: AiRequest = {
      userId: req.user.id,
      type: 'chat',
      query: body.query,
      context: body.context,
      sessionId: body.sessionId,
    };

    return this.aiService.processAiRequest(aiRequest);
  }

  @Post('insights')
  @ApiOperation({ summary: 'Generate financial insights' })
  @ApiResponse({ status: 200, description: 'Financial insights generated successfully' })
  async generateInsights(@Request() req, @Body() body: { context?: any }): Promise<AiResponse> {
    const aiRequest: AiRequest = {
      userId: req.user.id,
      type: 'insights',
      query: 'Generate financial insights for my portfolio',
      context: body.context,
    };

    return this.aiService.processAiRequest(aiRequest);
  }

  @Post('predict')
  @ApiOperation({ summary: 'Generate ML predictions' })
  @ApiResponse({ status: 200, description: 'Predictions generated successfully' })
  async generatePrediction(
    @Request() req,
    @Body() body: { 
      predictionType: string; 
      timeframe?: string; 
      context?: any 
    }
  ): Promise<AiResponse> {
    const aiRequest: AiRequest = {
      userId: req.user.id,
      type: 'prediction',
      query: `Generate ${body.predictionType} prediction`,
      context: {
        predictionType: body.predictionType,
        timeframe: body.timeframe || '1Y',
        ...body.context,
      },
    };

    return this.aiService.processAiRequest(aiRequest);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Comprehensive financial analysis' })
  @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
  async comprehensiveAnalysis(@Request() req, @Body() body: { context?: any }): Promise<AiResponse> {
    const aiRequest: AiRequest = {
      userId: req.user.id,
      type: 'analysis',
      query: 'Perform comprehensive financial analysis',
      context: body.context,
    };

    return this.aiService.processAiRequest(aiRequest);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI interaction history' })
  @ApiResponse({ status: 200, description: 'AI history retrieved successfully' })
  async getHistory(
    @Request() req,
    @Query('limit') limit?: string
  ): Promise<any[]> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.aiService.getAiHistory(req.user.id, limitNum);
  }

  @Get('usage-stats')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics retrieved successfully' })
  async getUsageStats(@Request() req): Promise<any> {
    return this.aiService.getAiUsageStats(req.user.id);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get available ML models' })
  @ApiResponse({ status: 200, description: 'Available models retrieved successfully' })
  async getAvailableModels(): Promise<any[]> {
    return this.modelService.getAvailableModels();
  }

  @Get('models/metrics')
  @ApiOperation({ summary: 'Get ML model performance metrics' })
  @ApiResponse({ status: 200, description: 'Model metrics retrieved successfully' })
  async getModelMetrics(@Query('modelId') modelId?: string): Promise<any[]> {
    return this.modelService.getModelMetrics(modelId);
  }

  @Get('models/health')
  @ApiOperation({ summary: 'Check ML model health status' })
  @ApiResponse({ status: 200, description: 'Model health status retrieved successfully' })
  async checkModelHealth(): Promise<{ [modelId: string]: boolean }> {
    return this.modelService.healthCheck();
  }

  @Post('models/:modelId/invoke')
  @ApiOperation({ summary: 'Invoke specific ML model' })
  @ApiResponse({ status: 200, description: 'Model invoked successfully' })
  async invokeModel(
    @Request() req,
    @Param('modelId') modelId: string,
    @Body() body: { input: any; parameters?: any; context?: any }
  ): Promise<any> {
    return this.modelService.invokeModel({
      modelId,
      userId: req.user.id,
      input: body.input,
      parameters: body.parameters,
      context: body.context,
    });
  }

  @Get('knowledge')
  @ApiOperation({ summary: 'Get knowledge base documents' })
  @ApiResponse({ status: 200, description: 'Knowledge documents retrieved successfully' })
  async getKnowledgeDocuments(@Query('category') category?: string): Promise<any[]> {
    return this.ragService.getKnowledgeDocuments(category);
  }

  @Post('knowledge')
  @ApiOperation({ summary: 'Add document to knowledge base' })
  @ApiResponse({ status: 201, description: 'Knowledge document added successfully' })
  async addKnowledgeDocument(
    @Body() body: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      metadata?: any;
    }
  ): Promise<{ id: string }> {
    const id = await this.ragService.addKnowledgeDocument(body);
    return { id };
  }

  @Post('rag/query')
  @ApiOperation({ summary: 'Query knowledge base with RAG' })
  @ApiResponse({ status: 200, description: 'RAG response generated successfully' })
  async queryKnowledgeBase(
    @Request() req,
    @Body() body: {
      query: string;
      context?: any;
      sessionId?: string;
      maxSources?: number;
      confidenceThreshold?: number;
    }
  ): Promise<any> {
    return this.ragService.generateResponse(
      body.query,
      req.user.id,
      body.context,
      body.sessionId
    );
  }

  @Get('insights/detailed')
  @ApiOperation({ summary: 'Get detailed financial insights' })
  @ApiResponse({ status: 200, description: 'Detailed insights retrieved successfully' })
  async getDetailedInsights(@Request() req, @Query('context') context?: string): Promise<any[]> {
    const contextObj = context ? JSON.parse(context) : undefined;
    return this.insightsService.generateInsights(req.user.id, contextObj);
  }

  @Post('predictions/portfolio')
  @ApiOperation({ summary: 'Generate portfolio performance prediction' })
  @ApiResponse({ status: 200, description: 'Portfolio prediction generated successfully' })
  async predictPortfolioPerformance(
    @Request() req,
    @Body() body: { timeframe?: string; context?: any }
  ): Promise<any> {
    return this.predictionService.generatePrediction(
      req.user.id,
      'portfolio_performance',
      body.context,
      body.timeframe || '1Y'
    );
  }

  @Post('predictions/market')
  @ApiOperation({ summary: 'Generate market trend prediction' })
  @ApiResponse({ status: 200, description: 'Market prediction generated successfully' })
  async predictMarketTrend(
    @Request() req,
    @Body() body: { timeframe?: string; context?: any }
  ): Promise<any> {
    return this.predictionService.generatePrediction(
      req.user.id,
      'market_trend',
      body.context,
      body.timeframe || '1Y'
    );
  }

  @Post('predictions/risk')
  @ApiOperation({ summary: 'Generate risk assessment prediction' })
  @ApiResponse({ status: 200, description: 'Risk prediction generated successfully' })
  async predictRisk(
    @Request() req,
    @Body() body: { timeframe?: string; context?: any }
  ): Promise<any> {
    return this.predictionService.generatePrediction(
      req.user.id,
      'risk_assessment',
      body.context,
      body.timeframe || '1Y'
    );
  }

  @Post('predictions/goal')
  @ApiOperation({ summary: 'Generate goal achievement probability' })
  @ApiResponse({ status: 200, description: 'Goal prediction generated successfully' })
  async predictGoalAchievement(
    @Request() req,
    @Body() body: { 
      goalAmount: number;
      monthlyContribution?: number;
      timeframe?: string;
      context?: any;
    }
  ): Promise<any> {
    return this.predictionService.generatePrediction(
      req.user.id,
      'goal_probability',
      {
        goalAmount: body.goalAmount,
        monthlyContribution: body.monthlyContribution || 0,
        ...body.context,
      },
      body.timeframe || '5Y'
    );
  }

  @Post('predictions/volatility')
  @ApiOperation({ summary: 'Generate volatility forecast' })
  @ApiResponse({ status: 200, description: 'Volatility prediction generated successfully' })
  async predictVolatility(
    @Request() req,
    @Body() body: { timeframe?: string; context?: any }
  ): Promise<any> {
    return this.predictionService.generatePrediction(
      req.user.id,
      'volatility_forecast',
      body.context,
      body.timeframe || '6M'
    );
  }

  @Post('predictions/sectors')
  @ApiOperation({ summary: 'Generate sector rotation prediction' })
  @ApiResponse({ status: 200, description: 'Sector prediction generated successfully' })
  async predictSectorRotation(
    @Request() req,
    @Body() body: { timeframe?: string; context?: any }
  ): Promise<any> {
    return this.predictionService.generatePrediction(
      req.user.id,
      'sector_rotation',
      body.context,
      body.timeframe || '1Y'
    );
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get AI dashboard data' })
  @ApiResponse({ status: 200, description: 'AI dashboard data retrieved successfully' })
  async getDashboardData(@Request() req): Promise<any> {
    const [usageStats, modelMetrics, recentInsights] = await Promise.all([
      this.aiService.getAiUsageStats(req.user.id),
      this.modelService.getModelMetrics(),
      this.insightsService.generateInsights(req.user.id).then(insights => insights.slice(0, 5)),
    ]);

    return {
      usage: usageStats,
      models: modelMetrics,
      recentInsights,
      timestamp: new Date(),
    };
  }
}
