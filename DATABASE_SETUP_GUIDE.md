# DhanAillytics Database Setup Guide

## 🎯 Database Integration - Step 2 Completed ✅

### What We've Accomplished

Your **Database Integration** (Step 2 of your roadmap) is now **COMPLETE** with the following enhancements:

#### ✅ Enhanced Database Models
- **User Model**: Complete authentication, preferences, subscription management
- **Portfolio Model**: Holdings, performance metrics, risk calculations
- **MarketData Model**: Real-time price tracking, historical data, technical indicators
- **Transaction Model**: Complex order execution, P&L tracking, performance analytics
- **AIInsights Model**: ML predictions, recommendations, sentiment analysis
- **Alert Model**: Price/news/technical alerts with conditions
- **NewsArticle Model**: Financial news with sentiment scoring
- **Watchlist Model**: User-customized stock tracking

#### ✅ Database Management Tools
1. **Migration System** (`src/utils/migrations.ts`)
2. **Seeding System** (`src/utils/seed.ts`)
3. **Health Check System** (`src/utils/healthCheck.ts`)

#### ✅ Production-Ready Features
- Comprehensive indexing for performance
- Data validation and integrity checks
- Automatic data cleanup (TTL indexes)
- Connection pooling and error handling
- Migration versioning system
- Health monitoring and reporting

---

## 🚀 Quick Setup Instructions

### Prerequisites

1. **Install MongoDB**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb

   # Or download from https://www.mongodb.com/try/download/community
   ```

2. **Install Redis** (Optional but recommended)
   ```bash
   # Windows (using Chocolatey)
   choco install redis-64
   ```

### Database Setup Commands

```bash
# 1. Setup database with migrations and initial data
npm run db:setup

# 2. Check migration status
npm run migrate:status

# 3. Run health check
npm run health:check

# 4. Reset database (drops all data)
npm run db:reset
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run migrate` | Run pending database migrations |
| `npm run migrate:status` | Show migration status |
| `npm run migrate:rollback <version>` | Rollback specific migration |
| `npm run seed` | Populate database with sample data |
| `npm run seed:drop` | Drop all collections and reseed |
| `npm run seed:users` | Seed users only |
| `npm run seed:market` | Seed market data only |
| `npm run seed:portfolios` | Seed portfolios only |
| `npm run health:check` | Run full database health report |
| `npm run health:integrity` | Check data integrity only |
| `npm run db:setup` | Complete setup (migrate + seed) |
| `npm run db:reset` | Complete reset (drop + migrate + seed) |

---

## 📊 Database Schema Overview

### Core Collections

#### Users Collection
```typescript
interface IUser {
  email: string;
  password: string; // Hashed with bcrypt
  firstName: string;
  lastName: string;
  role: 'user' | 'premium' | 'admin' | 'analyst';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: { email: boolean; push: boolean; sms: boolean };
    dashboard: { defaultView: string; refreshInterval: number };
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    investmentGoals: string[];
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  };
}
```

#### Portfolios Collection
```typescript
interface IPortfolio {
  userId: ObjectId;
  name: string;
  description?: string;
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  holdings: IHolding[];
  performance: IPerformanceMetric[];
  riskMetrics: IRiskMetrics;
}
```

#### MarketData Collection
```typescript
interface IMarketData {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity' | 'forex';
  price: number;
  previousClose: number;
  change: number;
  changePercentage: number;
  volume: number;
  marketCap?: number;
  priceHistory: IPricePoint[];
  // ... technical indicators
}
```

#### Transactions Collection
```typescript
interface ITransaction {
  userId: ObjectId;
  portfolioId: ObjectId;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend' | 'split';
  orderType: 'market' | 'limit' | 'stop_loss' | 'bracket';
  quantity: number;
  price: number;
  totalAmount: number;
  fees: IFeeStructure;
  status: 'pending' | 'partially_filled' | 'filled' | 'cancelled';
  executionDetails: IExecutionDetails[];
  // ... advanced trading features
}
```

---

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dhanaillytics
MONGODB_URI_TEST=mongodb://localhost:27017/dhanaillytics_test

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# API Keys (for production)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
OPENAI_API_KEY=your_openai_key
```

---

## 🧪 Testing the Setup

### 1. Start MongoDB
```bash
# Windows Service
net start MongoDB

# Or manually
mongod --dbpath "C:\data\db"
```

### 2. Run Migrations
```bash
npm run migrate:status
npm run migrate
```

### 3. Seed Sample Data
```bash
npm run seed
```

### 4. Health Check
```bash
npm run health:check
```

Expected output:
```
=== DATABASE HEALTH REPORT ===

📊 DATABASE STATUS: HEALTHY
   Connection State: Connected
   Response Time: 45ms

📁 COLLECTIONS:
   users: 3 documents, 5 indexes
   portfolios: 3 documents, 6 indexes
   marketdatas: 9 documents, 8 indexes
   transactions: 0 documents, 10 indexes

⚡ PERFORMANCE:
   Uptime: 2 hours
   Memory Usage: {"resident":64,"virtual":1024,"mapped":512}
   Connection Pool Size: 1

🔒 DATA INTEGRITY: VALID

✅ Database is healthy with no issues detected!
```

---

## 🚀 Next Steps

With **Step 2: Database Integration** completed, you're ready for:

### Step 3: Real Financial Data Integration
- Alpha Vantage API integration
- Finnhub API integration
- Real-time WebSocket data feeds
- Data synchronization services

### Step 4: User Authentication System
- JWT-based authentication (already implemented)
- OAuth integrations
- Password reset flows
- Email verification

### Step 5: AI Model Implementation
- OpenAI integration for insights
- Sentiment analysis pipeline
- Technical indicator calculations
- Portfolio optimization algorithms

---

## 📝 Sample Data Included

When you run `npm run seed`, you'll get:

- **3 Test Users** (admin, demo, regular user)
- **9 Market Data Records** (AAPL, GOOGL, MSFT, AMZN, TSLA, SPY, QQQ, BTC, ETH)
- **3 Sample Portfolios** with holdings
- **30 Days of Price History** for each instrument
- **Realistic Performance Metrics**

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB service
Get-Service -Name MongoDB

# Start MongoDB service
net start MongoDB

# Check if port 27017 is in use
netstat -an | findstr 27017
```

### Migration Issues
```bash
# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:rollback <version>

# Reset migrations (careful!)
npm run db:reset
```

### Data Issues
```bash
# Check data integrity
npm run health:integrity

# Full health report
npm run health:check
```

---

## ✅ Summary

Your **Database Integration (Step 2)** is now **PRODUCTION-READY** with:

- ✅ **8 Comprehensive Models** with full relationships
- ✅ **Advanced Migration System** with versioning
- ✅ **Intelligent Seeding** with realistic sample data
- ✅ **Health Monitoring** and integrity checks
- ✅ **Performance Optimizations** with proper indexing
- ✅ **Production Safeguards** and error handling

**Ready to proceed to Step 3: Real Financial Data Integration!** 🚀
