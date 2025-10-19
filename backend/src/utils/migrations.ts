import mongoose from 'mongoose';
import { logger } from '../config/logger';
import { database } from '../config/database';

interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
});

const MigrationModel = mongoose.model('Migration', migrationSchema);

class MigrationRunner {
  private migrations: Migration[] = [
    {
      version: '1.0.0',
      description: 'Initial database setup',
      up: async () => {
        logger.info('   Creating initial indexes...');
        
        // User indexes
        await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
        await mongoose.connection.collection('users').createIndex({ role: 1 });
        await mongoose.connection.collection('users').createIndex({ 'subscription.plan': 1 });
        await mongoose.connection.collection('users').createIndex({ isEmailVerified: 1 });
        await mongoose.connection.collection('users').createIndex({ createdAt: -1 });
        
        // Portfolio indexes
        await mongoose.connection.collection('portfolios').createIndex({ userId: 1 });
        await mongoose.connection.collection('portfolios').createIndex({ userId: 1, name: 1 }, { unique: true });
        await mongoose.connection.collection('portfolios').createIndex({ 'holdings.symbol': 1 });
        await mongoose.connection.collection('portfolios').createIndex({ totalValue: -1 });
        await mongoose.connection.collection('portfolios').createIndex({ createdAt: -1 });
        
        // Market data indexes
        await mongoose.connection.collection('marketdatas').createIndex({ symbol: 1 }, { unique: true });
        await mongoose.connection.collection('marketdatas').createIndex({ symbol: 1, timestamp: -1 });
        await mongoose.connection.collection('marketdatas').createIndex({ type: 1, sector: 1 });
        await mongoose.connection.collection('marketdatas').createIndex({ exchange: 1, type: 1 });
        await mongoose.connection.collection('marketdatas').createIndex({ changePercentage: -1 });
        await mongoose.connection.collection('marketdatas').createIndex({ volume: -1 });
        await mongoose.connection.collection('marketdatas').createIndex({ marketCap: -1 });
        
        // TTL index for market data (auto-delete after 30 days)
        await mongoose.connection.collection('marketdatas').createIndex(
          { timestamp: 1 }, 
          { expireAfterSeconds: 30 * 24 * 60 * 60 }
        );
        
        logger.info('   Initial indexes created successfully');
      },
      down: async () => {
        logger.info('   Dropping initial indexes...');
        // Drop indexes if needed for rollback
      },
    },
    
    {
      version: '1.1.0',
      description: 'Add transaction collection indexes',
      up: async () => {
        logger.info('   Creating transaction indexes...');
        
        await mongoose.connection.collection('transactions').createIndex({ userId: 1, createdAt: -1 });
        await mongoose.connection.collection('transactions').createIndex({ portfolioId: 1, symbol: 1, createdAt: -1 });
        await mongoose.connection.collection('transactions').createIndex({ symbol: 1, type: 1, createdAt: -1 });
        await mongoose.connection.collection('transactions').createIndex({ status: 1, createdAt: -1 });
        await mongoose.connection.collection('transactions').createIndex({ source: 1, createdAt: -1 });
        await mongoose.connection.collection('transactions').createIndex({ exchange: 1, currency: 1, createdAt: -1 });
        await mongoose.connection.collection('transactions').createIndex({ validTill: 1, status: 1 });
        await mongoose.connection.collection('transactions').createIndex({ 'executionDetails.executedAt': -1 });
        await mongoose.connection.collection('transactions').createIndex({ isSimulated: 1, userId: 1, createdAt: -1 });
        
        // Compound indexes for complex queries
        await mongoose.connection.collection('transactions').createIndex({
          userId: 1,
          symbol: 1,
          type: 1,
          status: 1,
          createdAt: -1,
        });
        
        await mongoose.connection.collection('transactions').createIndex({
          portfolioId: 1,
          status: 1,
          isActive: 1,
          createdAt: -1,
        });
        
        // TTL index for expired transactions
        await mongoose.connection.collection('transactions').createIndex(
          { validTill: 1 },
          { 
            expireAfterSeconds: 0,
            partialFilterExpression: { 
              status: { $in: ['expired', 'cancelled'] },
              isActive: false 
            }
          }
        );
        
        logger.info('   Transaction indexes created successfully');
      },
      down: async () => {
        logger.info('   Dropping transaction indexes...');
        // Implementation for rollback
      },
    },
    
    {
      version: '1.2.0',
      description: 'Add AI insights and alerts indexes',
      up: async () => {
        logger.info('   Creating AI insights and alerts indexes...');
        
        // AI Insights indexes
        await mongoose.connection.collection('aiinsights').createIndex({ userId: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ symbol: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ type: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ modelName: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ confidence: -1 });
        await mongoose.connection.collection('aiinsights').createIndex({ validUntil: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ isActive: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ marketRegime: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ tags: 1 });
        await mongoose.connection.collection('aiinsights').createIndex({ createdAt: -1 });
        
        // TTL index for expired insights
        await mongoose.connection.collection('aiinsights').createIndex(
          { validUntil: 1 },
          { expireAfterSeconds: 0 }
        );
        
        // Alerts indexes
        await mongoose.connection.collection('alerts').createIndex({ userId: 1 });
        await mongoose.connection.collection('alerts').createIndex({ symbol: 1 });
        await mongoose.connection.collection('alerts').createIndex({ type: 1 });
        await mongoose.connection.collection('alerts').createIndex({ isActive: 1 });
        await mongoose.connection.collection('alerts').createIndex({ isTriggered: 1 });
        await mongoose.connection.collection('alerts').createIndex({ triggeredAt: -1 });
        await mongoose.connection.collection('alerts').createIndex({ createdAt: -1 });
        
        // Compound indexes
        await mongoose.connection.collection('alerts').createIndex({
          userId: 1,
          isActive: 1,
          isTriggered: 1,
        });
        
        logger.info('   AI insights and alerts indexes created successfully');
      },
      down: async () => {
        logger.info('   Dropping AI insights and alerts indexes...');
      },
    },
    
    {
      version: '1.3.0',
      description: 'Add news articles and watchlist indexes',
      up: async () => {
        logger.info('   Creating news articles and watchlist indexes...');
        
        // News articles indexes
        await mongoose.connection.collection('newsarticles').createIndex({ symbols: 1 });
        await mongoose.connection.collection('newsarticles').createIndex({ source: 1 });
        await mongoose.connection.collection('newsarticles').createIndex({ category: 1 });
        await mongoose.connection.collection('newsarticles').createIndex({ publishedAt: -1 });
        await mongoose.connection.collection('newsarticles').createIndex({ sentiment: 1 });
        await mongoose.connection.collection('newsarticles').createIndex({ relevanceScore: -1 });
        await mongoose.connection.collection('newsarticles').createIndex({ createdAt: -1 });
        
        // Text search index for news
        await mongoose.connection.collection('newsarticles').createIndex({
          title: 'text',
          summary: 'text',
          content: 'text',
        });
        
        // Compound indexes for news
        await mongoose.connection.collection('newsarticles').createIndex({
          symbols: 1,
          publishedAt: -1,
          relevanceScore: -1,
        });
        
        // TTL index for old news (delete after 90 days)
        await mongoose.connection.collection('newsarticles').createIndex(
          { publishedAt: 1 },
          { expireAfterSeconds: 90 * 24 * 60 * 60 }
        );
        
        // Watchlist indexes
        await mongoose.connection.collection('watchlists').createIndex({ userId: 1 });
        await mongoose.connection.collection('watchlists').createIndex({ userId: 1, name: 1 }, { unique: true });
        await mongoose.connection.collection('watchlists').createIndex({ symbols: 1 });
        await mongoose.connection.collection('watchlists').createIndex({ isDefault: 1 });
        await mongoose.connection.collection('watchlists').createIndex({ createdAt: -1 });
        
        logger.info('   News articles and watchlist indexes created successfully');
      },
      down: async () => {
        logger.info('   Dropping news articles and watchlist indexes...');
      },
    },
    
    {
      version: '1.4.0',
      description: 'Add performance optimization indexes',
      up: async () => {
        logger.info('   Creating performance optimization indexes...');
        
        // Additional portfolio performance indexes
        await mongoose.connection.collection('portfolios').createIndex({
          userId: 1,
          totalValue: -1,
          'riskMetrics.riskScore': 1,
        });
        
        // Market data trending stocks index
        await mongoose.connection.collection('marketdatas').createIndex({
          type: 1,
          changePercentage: -1,
          volume: -1,
          timestamp: -1,
        });
        
        // User activity tracking
        await mongoose.connection.collection('users').createIndex({
          lastLogin: -1,
          role: 1,
          'subscription.status': 1,
        });
        
        // Transaction performance analysis
        await mongoose.connection.collection('transactions').createIndex({
          userId: 1,
          status: 1,
          'metadata.performance.realizedPnL': -1,
          createdAt: -1,
        });
        
        logger.info('   Performance optimization indexes created successfully');
      },
      down: async () => {
        logger.info('   Dropping performance optimization indexes...');
      },
    },
  ];

  async runMigrations() {
    try {
      logger.info('🔄 Starting database migrations...');

      // Connect to database
      await database.connect();

      // Get applied migrations
      const appliedMigrations = await MigrationModel.find().sort({ version: 1 });
      const appliedVersions = appliedMigrations.map(m => m.version);

      // Filter pending migrations
      const pendingMigrations = this.migrations.filter(
        migration => !appliedVersions.includes(migration.version)
      );

      if (pendingMigrations.length === 0) {
        logger.info('✅ No pending migrations');
        return;
      }

      logger.info(`📦 Found ${pendingMigrations.length} pending migrations`);

      // Run pending migrations
      for (const migration of pendingMigrations) {
        logger.info(`⬆️  Applying migration ${migration.version}: ${migration.description}`);
        
        try {
          await migration.up();
          
          // Record migration as applied
          await new MigrationModel({
            version: migration.version,
            description: migration.description,
          }).save();
          
          logger.info(`✅ Migration ${migration.version} applied successfully`);
        } catch (error) {
          logger.error(`❌ Migration ${migration.version} failed:`, error);
          throw error;
        }
      }

      logger.info('🎉 All migrations completed successfully');
    } catch (error) {
      logger.error('❌ Migration process failed:', error);
      throw error;
    }
  }

  async rollbackMigration(version: string) {
    try {
      logger.info(`⬇️  Rolling back migration ${version}...`);

      // Connect to database
      await database.connect();

      // Find migration
      const migration = this.migrations.find(m => m.version === version);
      if (!migration) {
        throw new Error(`Migration ${version} not found`);
      }

      // Check if migration is applied
      const appliedMigration = await MigrationModel.findOne({ version });
      if (!appliedMigration) {
        throw new Error(`Migration ${version} is not applied`);
      }

      // Run rollback
      await migration.down();

      // Remove migration record
      await MigrationModel.deleteOne({ version });

      logger.info(`✅ Migration ${version} rolled back successfully`);
    } catch (error) {
      logger.error(`❌ Migration rollback failed:`, error);
      throw error;
    }
  }

  async getMigrationStatus() {
    await database.connect();

    const appliedMigrations = await MigrationModel.find().sort({ version: 1 });
    const appliedVersions = appliedMigrations.map(m => m.version);

    logger.info('📊 Migration Status:');
    
    for (const migration of this.migrations) {
      const status = appliedVersions.includes(migration.version) ? '✅ Applied' : '⏳ Pending';
      logger.info(`   ${migration.version}: ${status} - ${migration.description}`);
    }

    return {
      total: this.migrations.length,
      applied: appliedMigrations.length,
      pending: this.migrations.length - appliedMigrations.length,
      migrations: this.migrations.map(m => ({
        version: m.version,
        description: m.description,
        applied: appliedVersions.includes(m.version),
        appliedAt: appliedMigrations.find(am => am.version === m.version)?.appliedAt,
      })),
    };
  }
}

// CLI interface
if (require.main === module) {
  const migrationRunner = new MigrationRunner();
  
  const command = process.argv[2];
  const version = process.argv[3];

  switch (command) {
    case 'up':
    case 'migrate':
      migrationRunner.runMigrations()
        .then(() => {
          logger.info('🎉 Migration process completed');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('❌ Migration process failed:', error);
          process.exit(1);
        });
      break;

    case 'down':
    case 'rollback':
      if (!version) {
        logger.error('❌ Version required for rollback');
        process.exit(1);
      }
      migrationRunner.rollbackMigration(version)
        .then(() => {
          logger.info('🎉 Rollback completed');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('❌ Rollback failed:', error);
          process.exit(1);
        });
      break;

    case 'status':
      migrationRunner.getMigrationStatus()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          logger.error('❌ Status check failed:', error);
          process.exit(1);
        });
      break;

    default:
      logger.info('Available commands:');
      logger.info('  npm run migrate up     - Run pending migrations');
      logger.info('  npm run migrate down <version> - Rollback specific migration');
      logger.info('  npm run migrate status  - Show migration status');
      process.exit(0);
  }
}

export default MigrationRunner;
