import { Router, Request, Response } from 'express';
import { database } from '../config/database';
import { redisClient } from '../config/redis';
import { IApiResponse } from '../types';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  const response: IApiResponse = {
    success: true,
    message: 'DhanAillytics API is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.API_VERSION || 'v1',
    },
  };

  res.json(response);
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  const checks = {
    database: false,
    redis: false,
    memory: {
      used: process.memoryUsage(),
      free: false,
    },
    uptime: process.uptime(),
  };

  // Check database
  try {
    checks.database = database.isHealthy();
  } catch (error) {
    checks.database = false;
  }

  // Check Redis
  try {
    checks.redis = redisClient.isHealthy();
  } catch (error) {
    checks.redis = false;
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  checks.memory.free = memUsage.heapUsed < memUsage.heapTotal * 0.9;

  const isHealthy = checks.database && checks.redis && checks.memory.free;

  const response: IApiResponse = {
    success: isHealthy,
    message: isHealthy ? 'All systems operational' : 'Some systems are down',
    data: {
      checks,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(isHealthy ? 200 : 503).json(response);
});

export default router;
