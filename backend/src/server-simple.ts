import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5001;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      backend: 'running',
      python: 'connected'
    }
  });
});

// Proxy routes to Python service
app.get('/api/v1/market/quote/:symbol', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/api/v1/market/quote/${req.params.symbol}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch market data', details: error.message });
  }
});

app.post('/api/v1/market/batch-quotes', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/v1/market/batch-quotes`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch batch quotes', details: error.message });
  }
});

app.get('/api/v1/market/historical/:symbol', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/api/v1/market/historical/${req.params.symbol}`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch historical data', details: error.message });
  }
});

app.post('/api/v1/portfolio/optimize', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/v1/portfolio/optimize`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to optimize portfolio', details: error.message });
  }
});

app.post('/api/v1/ai/generate-signals', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/v1/ai/generate-signals`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate AI signals', details: error.message });
  }
});

app.post('/api/v1/risk/calculate-var', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/v1/risk/calculate-var`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate VaR', details: error.message });
  }
});

// Simple auth endpoints (mock for now)
app.post('/api/auth/register', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Registration successful',
    user: {
      id: '1',
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login successful',
    token: 'mock-jwt-token',
    user: {
      id: '1',
      email: req.body.email,
      firstName: 'Demo',
      lastName: 'User'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'demo@dhanaillytics.com',
      firstName: 'Demo',
      lastName: 'User'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🔗 Python service URL: ${PYTHON_SERVICE_URL}`);
  console.log(`🌐 CORS enabled for: http://localhost:3002, http://localhost:3000`);
});

export default app;
