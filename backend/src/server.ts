import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Import configurations
import { logger, morganStream } from './config/logger';
import { database } from './config/database';
import { redisClient } from './config/redis';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requireAuth } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import portfolioRoutes from './routes/portfolio';
import marketDataRoutes from './routes/marketData';
import aiInsightsRoutes from './routes/aiInsights';
import alertsRoutes from './routes/alerts';
import watchlistRoutes from './routes/watchlist';
import transactionRoutes from './routes/transaction';
import financialDataRoutes from './routes/financialData';
import healthRoutes from './routes/health';
import aiRoutes from './routes/aiRoutes';
import creditScoringRoutes from './routes/creditScoring';
import pythonRoutes from './routes/python-simple';

// Load environment variables
dotenv.config();

class DhanAillyticsServer {
  private app: express.Application;
  private server: any;
  private io: Server | null = null;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000');
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.setupDatabase();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupWebSocket();
    this.start();
  }

  private async setupDatabase(): Promise<void> {
    try {
      await database.connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        logger.warn('Continuing without database in development mode');
      }
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
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

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Cookie parsing middleware
    this.app.use(cookieParser());

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use(morgan('combined', { stream: morganStream }));

    // Custom middleware for request ID
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = Math.random().toString(36).substring(7);
      res.setHeader('X-Request-ID', req.headers['x-request-id']);
      next();
    });
  }

  private setupRoutes(): void {
    const apiVersion = process.env.API_VERSION || 'v1';
    const baseRoute = `/api/${apiVersion}`;

    // Health check route (no authentication required)
    this.app.use(`${baseRoute}/health`, healthRoutes);

    // Public routes
    this.app.use(`${baseRoute}/auth`, authRoutes);

    // Protected routes (require authentication)
    this.app.use(`${baseRoute}/user`, requireAuth, userRoutes);
    this.app.use(`${baseRoute}/portfolio`, requireAuth, portfolioRoutes);
    this.app.use(`${baseRoute}/market-data`, requireAuth, marketDataRoutes);
    this.app.use(`${baseRoute}/ai-insights`, requireAuth, aiInsightsRoutes);
    this.app.use(`${baseRoute}/ai`, aiRoutes); // AI services with built-in auth
    this.app.use(`${baseRoute}/credit-scoring`, creditScoringRoutes); // Federated Graph Credit Scoring
    this.app.use(`${baseRoute}/alerts`, requireAuth, alertsRoutes);
    this.app.use(`${baseRoute}/watchlist`, requireAuth, watchlistRoutes);
    this.app.use(`${baseRoute}/transactions`, requireAuth, transactionRoutes);
    this.app.use(`${baseRoute}/financial-data`, financialDataRoutes);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'DhanAillytics API is running',
        version: apiVersion,
        timestamp: new Date().toISOString(),
        docs: `${req.protocol}://${req.get('host')}${baseRoute}/docs`,
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private setupWebSocket(): void {
    this.server = createServer(this.app);
    
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('subscribe', (data) => {
        const { channels } = data;
        if (Array.isArray(channels)) {
          channels.forEach(channel => {
            socket.join(channel);
            logger.debug(`Socket ${socket.id} joined channel: ${channel}`);
          });
        }
      });

      socket.on('unsubscribe', (data) => {
        const { channels } = data;
        if (Array.isArray(channels)) {
          channels.forEach(channel => {
            socket.leave(channel);
            logger.debug(`Socket ${socket.id} left channel: ${channel}`);
          });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  private start(): void {
    const server = this.server || this.app;
    
    server.listen(this.port, () => {
      logger.info(`🚀 DhanAillytics API server running on port ${this.port}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API Base URL: http://localhost:${this.port}/api/${process.env.API_VERSION || 'v1'}`);
      
      if (this.io) {
        logger.info(`🔌 WebSocket server running on port ${this.port}`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    // Close server
    if (this.server) {
      this.server.close(() => {
        logger.info('HTTP server closed');
      });
    }

    // Close WebSocket
    if (this.io) {
      this.io.close();
      logger.info('WebSocket server closed');
    }

    // Close database connections
    try {
      await database.disconnect();
      await redisClient.disconnect();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database connections:', error);
    }

    process.exit(0);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getIO(): Server | null {
    return this.io;
  }
}

// Start the server
const server = new DhanAillyticsServer();

export default server;
