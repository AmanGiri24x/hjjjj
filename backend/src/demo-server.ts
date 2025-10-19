import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '5000');

// Basic middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
const apiVersion = process.env.API_VERSION || 'v1';
const baseRoute = '/api/v1';

// Health check route
app.get(`${baseRoute}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'DhanAillytics API is healthy',
    timestamp: new Date().toISOString(),
    version: apiVersion,
    environment: process.env.NODE_ENV,
  });
});

// AI Health check (mock for now)
app.get(`${baseRoute}/ai/health`, (req, res) => {
  res.json({
    success: true,
    message: 'AI service is healthy',
    data: {
      healthy: true,
      availableProviders: 2,
      totalProviders: 2,
      timestamp: new Date().toISOString(),
    },
  });
});

// AI Status (mock for now)
app.get(`${baseRoute}/ai/status`, (req, res) => {
  res.json({
    success: true,
    message: 'AI service status retrieved',
    data: {
      providers: {
        openai: {
          healthy: true,
          requests: 1247,
          errors: 3,
          avgResponseTime: 1250,
        },
        technical: {
          healthy: true,
          requests: 892,
          errors: 0,
          avgResponseTime: 85,
        },
      },
      caching: {
        enabled: true,
        hitRate: 0.73,
        size: 1524,
      },
      queueStatus: {
        pending: 0,
        processing: 2,
        completed: 2139,
      },
      availableProviders: 2,
      totalProviders: 2,
    },
  });
});

// AI Capabilities (mock for now)
app.get(`${baseRoute}/ai/capabilities`, (req, res) => {
  res.json({
    success: true,
    message: 'AI capabilities retrieved',
    data: {
      capabilities: {
        sentiment_analysis: ["openai"],
        news_analysis: ["openai"],
        technical_analysis: ["technical", "openai"],
        risk_assessment: ["openai", "technical"],
        price_prediction: ["technical", "openai"],
        anomaly_detection: ["technical"],
        financial_summarization: ["openai"],
      },
      supportedCapabilities: [
        "sentiment_analysis",
        "news_analysis", 
        "technical_analysis",
        "risk_assessment",
        "price_prediction",
        "anomaly_detection",
        "financial_summarization"
      ],
    },
  });
});

// Mock AI endpoints for demo
app.post(`${baseRoute}/ai/sentiment`, (req, res) => {
  const { text, context, priority } = req.body;
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Sentiment analysis completed',
      data: {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        result: {
          sentiment: 'positive',
          score: 0.75,
          confidence: 0.85,
          reasoning: 'The text contains positive language about market opportunities and growth potential.',
        },
        confidence: 0.85,
        provider: 'openai',
        processingTime: 1200 + Math.random() * 800,
        cached: false,
      },
    });
  }, 500 + Math.random() * 1000);
});

app.post(`${baseRoute}/ai/technical/analyze`, (req, res) => {
  const { priceData, timeframe, indicators } = req.body;
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Technical analysis completed',
      data: {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        result: {
          recommendation: {
            action: 'buy',
            strength: 'moderate',
            reasoning: 'Technical indicators show bullish momentum with RSI at 65 and MACD showing positive crossover.',
          },
          indicators: {
            rsi: 65.4,
            macd: {
              macd: 2.34,
              signal: 1.89,
              histogram: 0.45,
            },
            sma_20: 150.23,
            ema_12: 152.67,
            bollinger_bands: {
              upper: 165.50,
              middle: 150.25,
              lower: 135.00,
            },
          },
          support_resistance: {
            support: [145.20, 140.50, 135.75],
            resistance: [158.90, 163.25, 170.00],
          },
          patterns: ['ascending_triangle'],
          risk_level: 'medium',
        },
        confidence: 0.78,
        provider: 'technical',
        processingTime: 145 + Math.random() * 100,
        cached: false,
      },
    });
  }, 200 + Math.random() * 300);
});

app.post(`${baseRoute}/ai/price/predict`, (req, res) => {
  const { priceData, timeframe, method } = req.body;
  
  setTimeout(() => {
    const currentPrice = 152.45;
    const predictions = [];
    
    for (let i = 1; i <= 7; i++) {
      const variance = (Math.random() - 0.5) * 0.1;
      const trendFactor = 0.02 * i;
      const predictedPrice = currentPrice * (1 + trendFactor + variance);
      
      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: Math.round(predictedPrice * 100) / 100,
        confidence: Math.max(0.3, 0.9 - (i * 0.1)),
        range: {
          min: Math.round(predictedPrice * 0.95 * 100) / 100,
          max: Math.round(predictedPrice * 1.05 * 100) / 100,
        },
      });
    }
    
    res.json({
      success: true,
      message: 'Price prediction completed',
      data: {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        result: {
          predictions,
          method: method || 'linear_regression',
          accuracy_metrics: {
            mae: 2.45,
            rmse: 3.12,
            mape: 0.025,
          },
          trend: 'bullish',
          volatility: 'moderate',
        },
        confidence: 0.72,
        provider: 'technical',
        processingTime: 890 + Math.random() * 200,
        cached: false,
      },
    });
  }, 800 + Math.random() * 500);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DhanAillytics API is running',
    version: apiVersion,
    timestamp: new Date().toISOString(),
    docs: `${req.protocol}://${req.get('host')}${baseRoute}/docs`,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 DhanAillytics API server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${port}${baseRoute}`);
  console.log(`🤖 AI Services: Mock implementation running`);
  console.log(`✅ Server ready for frontend connection!`);
});

export default app;
