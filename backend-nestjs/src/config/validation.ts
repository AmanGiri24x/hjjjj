import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  API_VERSION: Joi.string().default('v1'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Email
  EMAIL_PROVIDER: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').default('smtp'),
  EMAIL_HOST: Joi.string().default('smtp.gmail.com'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(false),
  EMAIL_USER: Joi.string().allow('').default(''),
  EMAIL_PASSWORD: Joi.string().allow('').default(''),
  EMAIL_FROM: Joi.string().email().default('noreply@dhanai.com'),

  // AI/ML
  OPENAI_API_KEY: Joi.string().allow('').default(''),
  OPENAI_MODEL: Joi.string().default('gpt-4'),
  OPENAI_MAX_TOKENS: Joi.number().default(2048),
  OPENAI_TEMPERATURE: Joi.number().min(0).max(2).default(0.3),
  AI_CACHE_ENABLED: Joi.boolean().default(true),
  AI_CACHE_TTL: Joi.number().default(300),

  // Payments
  STRIPE_SECRET_KEY: Joi.string().allow('').default(''),
  STRIPE_PUBLISHABLE_KEY: Joi.string().allow('').default(''),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow('').default(''),

  // Security
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
  SESSION_SECRET: Joi.string().min(32).required(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // File upload
  MAX_FILE_SIZE: Joi.number().default(10485760),
  ALLOWED_FILE_TYPES: Joi.string().default('jpg,jpeg,png,pdf'),

  // External APIs
  ALPHA_VANTAGE_API_KEY: Joi.string().allow('').default(''),
  FINNHUB_API_KEY: Joi.string().allow('').default(''),
  NEWS_API_KEY: Joi.string().allow('').default(''),

  // Frontend
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
});
