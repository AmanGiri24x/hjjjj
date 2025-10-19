import mongoose from 'mongoose';
import { User } from '../models/User';
import { Portfolio } from '../models/Portfolio';
import { MarketData } from '../models/MarketData';
import { logger } from '../config/logger';
import { database } from '../config/database';

interface SeedOptions {
  users?: boolean;
  marketData?: boolean;
  portfolios?: boolean;
  drop?: boolean;
}

class DatabaseSeeder {
  async seed(options: SeedOptions = {}) {
    try {
      logger.info('🌱 Starting database seeding...');

      // Connect to database
      await database.connect();

      // Drop collections if requested
      if (options.drop) {
        await this.dropCollections();
      }

      // Create indexes
      await database.createIndexes();

      // Seed data
      if (options.users !== false) {
        await this.seedUsers();
      }

      if (options.marketData !== false) {
        await this.seedMarketData();
      }

      if (options.portfolios !== false) {
        await this.seedPortfolios();
      }

      logger.info('✅ Database seeding completed successfully');
    } catch (error) {
      logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async dropCollections() {
    logger.info('🗑️  Dropping existing collections...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      logger.info(`   Dropped collection: ${collection.name}`);
    }
  }

  private async seedUsers() {
    logger.info('👥 Seeding users...');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      logger.info('   Users already exist, skipping...');
      return;
    }

    const users = [
      {
        email: 'admin@dhanaillytics.com',
        password: 'admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isEmailVerified: true,
        preferences: {
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          dashboard: {
            defaultView: 'analytics',
            refreshInterval: 15,
          },
          riskTolerance: 'moderate',
          investmentGoals: ['growth', 'income'],
        },
        subscription: {
          plan: 'enterprise',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
      {
        email: 'demo@dhanaillytics.com',
        password: 'demo123!',
        firstName: 'Demo',
        lastName: 'User',
        role: 'premium',
        isEmailVerified: true,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          dashboard: {
            defaultView: 'portfolio',
            refreshInterval: 30,
          },
          riskTolerance: 'aggressive',
          investmentGoals: ['growth'],
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      {
        email: 'user@example.com',
        password: 'user123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isEmailVerified: false,
        preferences: {
          theme: 'auto',
          notifications: {
            email: true,
            push: false,
            sms: false,
          },
          dashboard: {
            defaultView: 'overview',
            refreshInterval: 60,
          },
          riskTolerance: 'conservative',
          investmentGoals: ['income', 'preservation'],
        },
        subscription: {
          plan: 'free',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      logger.info(`   Created user: ${user.email}`);
    }

    logger.info(`✅ Created ${users.length} users`);
  }

  private async seedMarketData() {
    logger.info('📈 Seeding market data...');

    const existingData = await MarketData.countDocuments();
    if (existingData > 0) {
      logger.info('   Market data already exists, skipping...');
      return;
    }

    // Popular stocks for seeding
    const stocksData = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        price: 175.43,
        previousClose: 173.25,
        volume: 45230000,
        marketCap: 2745000000000,
        high52Week: 198.23,
        low52Week: 124.17,
        dividend: 0.96,
        dividendYield: 0.55,
        pe: 28.5,
        eps: 6.16,
        beta: 1.29,
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        type: 'stock',
        price: 141.68,
        previousClose: 140.25,
        volume: 22150000,
        marketCap: 1789000000000,
        high52Week: 153.78,
        low52Week: 83.34,
        pe: 26.8,
        eps: 5.29,
        beta: 1.05,
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        type: 'stock',
        price: 415.26,
        previousClose: 412.78,
        volume: 18950000,
        marketCap: 3089000000000,
        high52Week: 468.35,
        low52Week: 309.45,
        dividend: 3.00,
        dividendYield: 0.72,
        pe: 34.2,
        eps: 12.14,
        beta: 0.89,
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        type: 'stock',
        price: 155.89,
        previousClose: 154.23,
        volume: 29870000,
        marketCap: 1625000000000,
        high52Week: 188.11,
        low52Week: 118.35,
        pe: 52.7,
        eps: 2.96,
        beta: 1.15,
        sector: 'Consumer Discretionary',
        exchange: 'NASDAQ',
        currency: 'USD',
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        type: 'stock',
        price: 248.42,
        previousClose: 245.67,
        volume: 41230000,
        marketCap: 789000000000,
        high52Week: 414.50,
        low52Week: 152.37,
        pe: 67.3,
        eps: 3.69,
        beta: 2.29,
        sector: 'Consumer Discretionary',
        exchange: 'NASDAQ',
        currency: 'USD',
      },
      // Add some ETFs
      {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        type: 'etf',
        price: 474.51,
        previousClose: 472.88,
        volume: 45120000,
        marketCap: 428000000000,
        high52Week: 485.73,
        low52Week: 365.52,
        dividend: 5.44,
        dividendYield: 1.15,
        beta: 1.0,
        sector: 'Financials',
        exchange: 'NYSE',
        currency: 'USD',
      },
      {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        type: 'etf',
        price: 391.25,
        previousClose: 388.91,
        volume: 35670000,
        marketCap: 178000000000,
        high52Week: 408.71,
        low52Week: 269.28,
        dividend: 2.15,
        dividendYield: 0.55,
        beta: 1.18,
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
      },
      // Add some crypto
      {
        symbol: 'BTCUSD',
        name: 'Bitcoin',
        type: 'crypto',
        price: 67845.23,
        previousClose: 66234.87,
        volume: 2450000000,
        marketCap: 1340000000000,
        high52Week: 73750.07,
        low52Week: 15476.65,
        beta: 1.85,
        sector: 'Cryptocurrency',
        exchange: 'CRYPTO',
        currency: 'USD',
      },
      {
        symbol: 'ETHUSD',
        name: 'Ethereum',
        type: 'crypto',
        price: 3867.42,
        previousClose: 3789.15,
        volume: 1230000000,
        marketCap: 465000000000,
        high52Week: 4878.26,
        low52Week: 896.11,
        beta: 1.92,
        sector: 'Cryptocurrency',
        exchange: 'CRYPTO',
        currency: 'USD',
      },
    ];

    for (const stockData of stocksData) {
      const marketData = new MarketData(stockData);
      
      // Generate some price history
      const priceHistory = this.generatePriceHistory(stockData.price, 30);
      marketData.priceHistory = priceHistory;
      
      await marketData.save();
      logger.info(`   Created market data for: ${stockData.symbol}`);
    }

    logger.info(`✅ Created market data for ${stocksData.length} instruments`);
  }

  private generatePriceHistory(currentPrice: number, days: number) {
    const history = [];
    let price = currentPrice * 0.95; // Start from 5% lower

    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Simulate realistic price movement
      const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
      price = price * (1 + change);

      const volume = Math.floor(Math.random() * 50000000) + 10000000;
      const volatility = 0.02; // 2% volatility

      const open = price * (1 + (Math.random() - 0.5) * volatility);
      const high = Math.max(open, price) * (1 + Math.random() * volatility);
      const low = Math.min(open, price) * (1 - Math.random() * volatility);

      history.push({
        timestamp: date,
        open,
        high,
        low,
        close: price,
        volume,
        adjustedClose: price,
      });
    }

    return history;
  }

  private async seedPortfolios() {
    logger.info('📊 Seeding portfolios...');

    const users = await User.find();
    if (users.length === 0) {
      logger.info('   No users found, skipping portfolio seeding...');
      return;
    }

    const marketData = await MarketData.find().limit(5);
    if (marketData.length === 0) {
      logger.info('   No market data found, skipping portfolio seeding...');
      return;
    }

    for (const user of users) {
      const existingPortfolios = await Portfolio.countDocuments({ userId: user._id });
      if (existingPortfolios > 0) {
        logger.info(`   Portfolios for ${user.email} already exist, skipping...`);
        continue;
      }

      // Create a default portfolio for each user
      const holdings = marketData.slice(0, 3).map((data, index) => ({
        symbol: data.symbol,
        name: data.name,
        type: data.type,
        quantity: (index + 1) * 10,
        averageCost: data.price * 0.95,
        currentPrice: data.price,
        marketValue: data.price * (index + 1) * 10,
        unrealizedGainLoss: data.price * (index + 1) * 10 - data.price * 0.95 * (index + 1) * 10,
        unrealizedGainLossPercentage: ((data.price - data.price * 0.95) / (data.price * 0.95)) * 100,
        weight: 0, // Will be calculated by pre-save hook
        sector: data.sector,
        exchange: data.exchange,
        currency: data.currency,
        lastUpdated: new Date(),
      }));

      const portfolio = new Portfolio({
        userId: user._id,
        name: `${user.firstName}'s Portfolio`,
        description: `Default portfolio for ${user.firstName} ${user.lastName}`,
        holdings,
        performance: [],
        riskMetrics: {
          volatility: 0.15,
          beta: 1.05,
          sharpeRatio: 1.2,
          maxDrawdown: -0.08,
          valueAtRisk: -0.05,
          conditionalValueAtRisk: -0.08,
          riskScore: 6.5,
          diversificationRatio: 0.75,
        },
      });

      await portfolio.save();
      logger.info(`   Created portfolio for: ${user.email}`);
    }

    logger.info(`✅ Created portfolios for ${users.length} users`);
  }
}

// CLI interface
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  
  const args = process.argv.slice(2);
  const options: SeedOptions = {};
  
  if (args.includes('--drop')) options.drop = true;
  if (args.includes('--users-only')) {
    options.users = true;
    options.marketData = false;
    options.portfolios = false;
  }
  if (args.includes('--market-data-only')) {
    options.users = false;
    options.marketData = true;
    options.portfolios = false;
  }
  if (args.includes('--portfolios-only')) {
    options.users = false;
    options.marketData = false;
    options.portfolios = true;
  }

  seeder.seed(options)
    .then(() => {
      logger.info('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export default DatabaseSeeder;
