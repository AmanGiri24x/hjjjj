const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DhanAillytics API is running',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'DhanAillytics API is healthy',
    timestamp: new Date().toISOString(),
    version: 'v1',
    environment: 'development',
  });
});

// AI Health check
app.get('/api/v1/ai/health', (req, res) => {
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

// AI Status
app.get('/api/v1/ai/status', (req, res) => {
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

// AI Capabilities
app.get('/api/v1/ai/capabilities', (req, res) => {
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

// AI Sentiment Analysis
app.post('/api/v1/ai/sentiment', (req, res) => {
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

// AI Technical Analysis
app.post('/api/v1/ai/technical/analyze', (req, res) => {
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

// AI Price Prediction
app.post('/api/v1/ai/price/predict', (req, res) => {
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

// News Analysis
app.post('/api/v1/ai/news/analyze', (req, res) => {
  const { articles, symbol, sector } = req.body;
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'News analysis completed',
      data: {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        result: {
          overallSentiment: 'positive',
          sentimentScore: 0.68,
          marketImpact: 'medium',
          keyThemes: ['earnings', 'growth', 'expansion'],
          summary: 'Recent news shows positive sentiment with focus on company growth and market expansion opportunities.',
          articles: articles ? articles.map((_, idx) => ({
            index: idx,
            sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
            score: 0.3 + Math.random() * 0.6,
            relevance: 0.5 + Math.random() * 0.5,
          })) : [],
        },
        confidence: 0.73,
        provider: 'openai',
        processingTime: 1800 + Math.random() * 1000,
        cached: false,
      },
    });
  }, 1000 + Math.random() * 1500);
});

// Risk Assessment
app.post('/api/v1/ai/risk/assess', (req, res) => {
  const { data, type, timeframe } = req.body;
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Risk assessment completed',
      data: {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        result: {
          riskLevel: 'medium',
          riskScore: 0.65,
          factors: [
            { name: 'Market Volatility', impact: 'high', weight: 0.3 },
            { name: 'Sector Performance', impact: 'medium', weight: 0.25 },
            { name: 'Company Fundamentals', impact: 'low', weight: 0.2 },
            { name: 'Economic Indicators', impact: 'medium', weight: 0.25 },
          ],
          recommendations: [
            'Monitor market volatility closely',
            'Consider diversification within the sector',
            'Keep position sizes moderate'
          ],
          timeHorizon: timeframe || '6M',
          confidence: 0.75,
        },
        confidence: 0.75,
        provider: 'technical',
        processingTime: 650 + Math.random() * 300,
        cached: false,
      },
    });
  }, 600 + Math.random() * 800);
});

// Portfolio Analysis
app.post('/api/v1/ai/portfolio/analyze', (req, res) => {
  const { portfolio, timeframe, includeNews, includeRisk, includePredictions } = req.body;
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Portfolio analysis completed',
      data: {
        portfolioId: portfolio?.id || 'demo-portfolio',
        timestamp: new Date().toISOString(),
        analyses: {
          technical: {
            result: {
              recommendation: {
                action: 'hold',
                reasoning: 'Mixed signals across portfolio holdings with balanced risk-reward profile.',
              },
              diversification: 0.72,
              volatility: 'moderate',
              beta: 1.15,
            },
            confidence: 0.68,
            provider: 'technical',
          },
          risk: includeRisk !== false ? {
            result: {
              riskLevel: 'medium',
              portfolioRisk: 0.58,
              recommendations: [
                'Consider rebalancing towards defensive assets',
                'Monitor high-volatility positions',
              ],
            },
            confidence: 0.71,
            provider: 'technical',
          } : undefined,
          predictions: includePredictions !== false ? {
            AAPL: {
              result: { predictions: [{ date: '2024-08-13', price: 155.20, confidence: 0.8 }] },
              confidence: 0.8,
              provider: 'technical',
            },
            GOOGL: {
              result: { predictions: [{ date: '2024-08-13', price: 142.80, confidence: 0.75 }] },
              confidence: 0.75,
              provider: 'technical',
            },
          } : undefined,
        },
        summary: {
          overallRisk: 'medium',
          sentiment: 'neutral',
          technicalOutlook: 'hold',
          recommendations: [
            'Consider rebalancing towards defensive assets',
            'Monitor high-volatility positions',
            'Mixed signals across portfolio holdings with balanced risk-reward profile.',
          ],
          predictionConfidence: 0.775,
        },
      },
    });
  }, 2000 + Math.random() * 2000);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 DhanAillytics API server running on port ' + port);
  console.log('📊 Environment: development');
  console.log('🔗 API Base URL: http://localhost:' + port + '/api/v1');
  console.log('🤖 AI Services: Mock implementation running');
  console.log('✅ Server ready for frontend connection!');
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /api/v1/health - Health check');
  console.log('  GET  /api/v1/ai/health - AI health check');
  console.log('  GET  /api/v1/ai/status - AI service status');
  console.log('  GET  /api/v1/ai/capabilities - AI capabilities');
  console.log('  POST /api/v1/ai/sentiment - Sentiment analysis');
  console.log('  POST /api/v1/ai/technical/analyze - Technical analysis');
  console.log('  POST /api/v1/ai/price/predict - Price prediction');
  console.log('  POST /api/v1/ai/news/analyze - News analysis');
  console.log('  POST /api/v1/ai/risk/assess - Risk assessment');
  console.log('  POST /api/v1/ai/portfolio/analyze - Portfolio analysis');
  console.log('');
});
