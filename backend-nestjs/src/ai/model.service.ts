import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface ModelConfig {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'recommendation';
  endpoint: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  timeout: number;
  retries: number;
  enabled: boolean;
}

export interface ModelRequest {
  modelId: string;
  input: any;
  parameters?: any;
  userId: string;
  context?: any;
}

export interface ModelResponse {
  id: string;
  modelId: string;
  output: any;
  confidence: number;
  processingTime: number;
  metadata: any;
  timestamp: Date;
}

export interface ModelMetrics {
  modelId: string;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  averageConfidence: number;
  errorRate: number;
  lastUsed: Date;
}

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);
  private models: Map<string, ModelConfig> = new Map();
  private modelCache: Map<string, any> = new Map();

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
  ) {
    this.initializeModels();
  }

  private initializeModels(): void {
    // Initialize default models
    const defaultModels: ModelConfig[] = [
      {
        id: 'portfolio-analyzer',
        name: 'Portfolio Risk Analyzer',
        version: '1.0.0',
        type: 'classification',
        endpoint: process.env.ML_SERVICE_URL + '/portfolio/analyze',
        timeout: 30000,
        retries: 3,
        enabled: true,
      },
      {
        id: 'market-predictor',
        name: 'Market Trend Predictor',
        version: '1.0.0',
        type: 'regression',
        endpoint: process.env.ML_SERVICE_URL + '/market/predict',
        timeout: 45000,
        retries: 2,
        enabled: true,
      },
      {
        id: 'risk-scorer',
        name: 'Risk Scoring Model',
        version: '1.0.0',
        type: 'classification',
        endpoint: process.env.ML_SERVICE_URL + '/risk/score',
        timeout: 15000,
        retries: 3,
        enabled: true,
      },
      {
        id: 'financial-advisor',
        name: 'Financial Advisory LLM',
        version: '1.0.0',
        type: 'nlp',
        endpoint: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
        apiKey: process.env.OPENAI_API_KEY,
        maxTokens: 2000,
        temperature: 0.7,
        timeout: 30000,
        retries: 2,
        enabled: true,
      },
      {
        id: 'goal-optimizer',
        name: 'Financial Goal Optimizer',
        version: '1.0.0',
        type: 'recommendation',
        endpoint: process.env.ML_SERVICE_URL + '/goals/optimize',
        timeout: 20000,
        retries: 3,
        enabled: true,
      },
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });

    this.logger.log(`Initialized ${defaultModels.length} ML models`);
  }

  async invokeModel(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    
    try {
      // Validate user access
      await this.securityService.validateUserAccess(request.userId, 'ml_models');

      // Get model configuration
      const model = this.models.get(request.modelId);
      if (!model) {
        throw new Error(`Model not found: ${request.modelId}`);
      }

      if (!model.enabled) {
        throw new Error(`Model is disabled: ${request.modelId}`);
      }

      // Validate and sanitize input
      const sanitizedInput = await this.sanitizeInput(request.input, model.type);

      // Check cache for recent similar requests
      const cacheKey = this.generateCacheKey(request.modelId, sanitizedInput);
      const cachedResult = this.modelCache.get(cacheKey);
      
      if (cachedResult && this.isCacheValid(cachedResult.timestamp)) {
        this.logger.debug(`Cache hit for model ${request.modelId}`);
        return cachedResult.response;
      }

      // Invoke the model
      const response = await this.callModelEndpoint(model, sanitizedInput, request.parameters);

      const modelResponse: ModelResponse = {
        id: this.generateId(),
        modelId: request.modelId,
        output: response.output,
        confidence: response.confidence || 0.8,
        processingTime: Date.now() - startTime,
        metadata: {
          modelVersion: model.version,
          parameters: request.parameters,
          cacheHit: false,
          ...response.metadata,
        },
        timestamp: new Date(),
      };

      // Cache the result
      this.modelCache.set(cacheKey, {
        response: modelResponse,
        timestamp: Date.now(),
      });

      // Log the model usage
      await this.logModelUsage(request, modelResponse);

      // Record metrics
      await this.recordModelMetrics(request.modelId, modelResponse);

      return modelResponse;

    } catch (error) {
      this.logger.error(`Model invocation failed: ${error.message}`, error.stack);
      
      await this.monitoringService.logError({
        level: 'error',
        message: `Model invocation failed: ${error.message}`,
        context: 'model_service',
        userId: request.userId,
        metadata: { 
          modelId: request.modelId,
          processingTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  private async callModelEndpoint(
    model: ModelConfig,
    input: any,
    parameters?: any
  ): Promise<any> {
    const requestBody = {
      input,
      parameters: parameters || {},
      model_config: {
        temperature: model.temperature,
        max_tokens: model.maxTokens,
      },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'DhanAi-ML-Client/1.0.0',
    };

    if (model.apiKey) {
      headers['Authorization'] = `Bearer ${model.apiKey}`;
    }

    let lastError: Error;
    
    for (let attempt = 1; attempt <= model.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), model.timeout);

        const response = await fetch(model.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Validate response structure
        if (!result.output) {
          throw new Error('Invalid model response: missing output field');
        }

        return result;

      } catch (error) {
        lastError = error;
        this.logger.warn(`Model call attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < model.retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private async sanitizeInput(input: any, modelType: string): Promise<any> {
    // Remove sensitive information and validate input structure
    const sanitized = JSON.parse(JSON.stringify(input));

    // Remove PII and sensitive fields
    const sensitiveFields = ['ssn', 'tax_id', 'account_number', 'routing_number', 'password'];
    
    const removeSensitiveData = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(removeSensitiveData);
      }

      const cleaned = { ...obj };
      sensitiveFields.forEach(field => {
        delete cleaned[field];
      });

      Object.keys(cleaned).forEach(key => {
        cleaned[key] = removeSensitiveData(cleaned[key]);
      });

      return cleaned;
    };

    return removeSensitiveData(sanitized);
  }

  async getModelMetrics(modelId?: string): Promise<ModelMetrics[]> {
    try {
      const whereClause = modelId ? { modelId } : {};
      
      const usage = await this.prisma.modelUsage.groupBy({
        by: ['modelId'],
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        _count: {
          id: true,
        },
        _avg: {
          processingTime: true,
          confidence: true,
        },
      });

      const errors = await this.prisma.modelUsage.groupBy({
        by: ['modelId'],
        where: {
          ...whereClause,
          success: false,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          id: true,
        },
      });

      const lastUsed = await this.prisma.modelUsage.groupBy({
        by: ['modelId'],
        where: whereClause,
        _max: {
          createdAt: true,
        },
      });

      const errorMap = new Map(errors.map(e => [e.modelId, e._count.id]));
      const lastUsedMap = new Map(lastUsed.map(l => [l.modelId, l._max.createdAt]));

      return usage.map(u => ({
        modelId: u.modelId,
        totalRequests: u._count.id,
        successRate: ((u._count.id - (errorMap.get(u.modelId) || 0)) / u._count.id) * 100,
        averageLatency: u._avg.processingTime || 0,
        averageConfidence: u._avg.confidence || 0,
        errorRate: ((errorMap.get(u.modelId) || 0) / u._count.id) * 100,
        lastUsed: lastUsedMap.get(u.modelId) || new Date(),
      }));

    } catch (error) {
      this.logger.error(`Failed to get model metrics: ${error.message}`);
      throw error;
    }
  }

  async getAvailableModels(): Promise<ModelConfig[]> {
    return Array.from(this.models.values()).filter(model => model.enabled);
  }

  async updateModelConfig(modelId: string, config: Partial<ModelConfig>): Promise<void> {
    const existingModel = this.models.get(modelId);
    if (!existingModel) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const updatedModel = { ...existingModel, ...config };
    this.models.set(modelId, updatedModel);

    this.logger.log(`Updated configuration for model: ${modelId}`);
  }

  async healthCheck(): Promise<{ [modelId: string]: boolean }> {
    const results: { [modelId: string]: boolean } = {};
    
    for (const [modelId, model] of this.models.entries()) {
      if (!model.enabled) {
        results[modelId] = false;
        continue;
      }

      try {
        // Simple health check request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${model.endpoint}/health`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        results[modelId] = response.ok;

      } catch (error) {
        this.logger.warn(`Health check failed for model ${modelId}: ${error.message}`);
        results[modelId] = false;
      }
    }

    return results;
  }

  private async logModelUsage(request: ModelRequest, response: ModelResponse): Promise<void> {
    try {
      await this.prisma.modelUsage.create({
        data: {
          id: response.id,
          modelId: request.modelId,
          userId: request.userId,
          processingTime: response.processingTime,
          confidence: response.confidence,
          success: true,
          metadata: {
            inputSize: JSON.stringify(request.input).length,
            outputSize: JSON.stringify(response.output).length,
            parameters: request.parameters,
            context: request.context,
          },
          createdAt: response.timestamp,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log model usage: ${error.message}`);
    }
  }

  private async recordModelMetrics(modelId: string, response: ModelResponse): Promise<void> {
    await this.monitoringService.recordMetric('model_request_duration', response.processingTime, {
      modelId,
    });

    await this.monitoringService.recordMetric('model_confidence', response.confidence, {
      modelId,
    });
  }

  private generateCacheKey(modelId: string, input: any): string {
    const inputHash = this.hashObject(input);
    return `${modelId}:${inputHash}`;
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private isCacheValid(timestamp: number): boolean {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    return Date.now() - timestamp < maxAge;
  }

  private generateId(): string {
    return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
