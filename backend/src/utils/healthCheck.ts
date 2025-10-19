import mongoose from 'mongoose';
import { database } from '../config/database';
import { logger } from '../config/logger';
import { User } from '../models/User';
import { Portfolio } from '../models/Portfolio';
import { MarketData } from '../models/MarketData';
import { Transaction } from '../models/Transaction';

interface HealthMetrics {
  database: {
    status: string;
    connectionState: string;
    responseTime: number;
  };
  collections: {
    name: string;
    count: number;
    avgSize: number;
    indexes: number;
  }[];
  performance: {
    memoryUsage: any;
    uptime: number;
    connectionPoolSize: number;
  };
  issues: string[];
  recommendations: string[];
}

class DatabaseHealthCheck {
  async runHealthCheck(): Promise<HealthMetrics> {
    const startTime = Date.now();
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Connect if not already connected
      await database.connect();

      // Test database connectivity
      const dbStatus = await this.checkDatabaseStatus();
      const responseTime = Date.now() - startTime;

      // Check collections
      const collections = await this.checkCollections();

      // Check performance metrics
      const performance = await this.checkPerformance();

      // Check for potential issues
      await this.identifyIssues(collections, issues, recommendations);

      return {
        database: {
          status: dbStatus,
          connectionState: database.getConnectionStatus(),
          responseTime,
        },
        collections,
        performance,
        issues,
        recommendations,
      };
    } catch (error) {
      issues.push(`Database connection failed: ${error.message}`);
      
      return {
        database: {
          status: 'unhealthy',
          connectionState: 'disconnected',
          responseTime: Date.now() - startTime,
        },
        collections: [],
        performance: {
          memoryUsage: {},
          uptime: 0,
          connectionPoolSize: 0,
        },
        issues,
        recommendations: ['Check database connection and credentials'],
      };
    }
  }

  private async checkDatabaseStatus(): Promise<string> {
    try {
      // Simple ping test
      await mongoose.connection.db.admin().ping();
      
      if (database.isHealthy()) {
        return 'healthy';
      } else {
        return 'degraded';
      }
    } catch (error) {
      logger.error('Database ping failed:', error);
      return 'unhealthy';
    }
  }

  private async checkCollections(): Promise<HealthMetrics['collections']> {
    const collections = [];
    
    try {
      // Get collection stats
      const collectionNames = ['users', 'portfolios', 'marketdatas', 'transactions', 'aiinsights', 'alerts', 'newsarticles', 'watchlists'];
      
      for (const collectionName of collectionNames) {
        try {
          const collection = mongoose.connection.collection(collectionName);
          const stats = await collection.stats();
          const indexes = await collection.listIndexes().toArray();
          
          collections.push({
            name: collectionName,
            count: stats.count || 0,
            avgSize: Math.round((stats.size || 0) / Math.max(stats.count || 1, 1)),
            indexes: indexes.length,
          });
        } catch (error) {
          // Collection might not exist yet
          collections.push({
            name: collectionName,
            count: 0,
            avgSize: 0,
            indexes: 0,
          });
        }
      }
    } catch (error) {
      logger.error('Error checking collections:', error);
    }

    return collections;
  }

  private async checkPerformance(): Promise<HealthMetrics['performance']> {
    try {
      const adminDb = mongoose.connection.db.admin();
      
      // Get server status
      const serverStatus = await adminDb.serverStatus();
      
      return {
        memoryUsage: {
          resident: serverStatus.mem?.resident || 0,
          virtual: serverStatus.mem?.virtual || 0,
          mapped: serverStatus.mem?.mapped || 0,
        },
        uptime: serverStatus.uptime || 0,
        connectionPoolSize: mongoose.connections.length,
      };
    } catch (error) {
      logger.error('Error checking performance metrics:', error);
      return {
        memoryUsage: {},
        uptime: 0,
        connectionPoolSize: 0,
      };
    }
  }

  private async identifyIssues(
    collections: HealthMetrics['collections'], 
    issues: string[], 
    recommendations: string[]
  ): Promise<void> {
    // Check for missing indexes
    const criticalCollections = ['users', 'portfolios', 'marketdatas', 'transactions'];
    
    for (const collection of collections) {
      if (criticalCollections.includes(collection.name)) {
        if (collection.indexes < 3) {
          issues.push(`Collection '${collection.name}' has insufficient indexes (${collection.indexes})`);
          recommendations.push(`Add proper indexes to '${collection.name}' collection for better performance`);
        }
      }
      
      // Check for large collections without proper indexing
      if (collection.count > 10000 && collection.indexes < 5) {
        issues.push(`Large collection '${collection.name}' (${collection.count} documents) needs more indexes`);
        recommendations.push(`Consider adding compound indexes for frequently queried fields in '${collection.name}'`);
      }
    }

    // Check for empty critical collections in production
    if (process.env.NODE_ENV === 'production') {
      const usersCollection = collections.find(c => c.name === 'users');
      if (usersCollection && usersCollection.count === 0) {
        issues.push('No users found in production database');
        recommendations.push('Run database seeding to create initial users');
      }

      const marketDataCollection = collections.find(c => c.name === 'marketdatas');
      if (marketDataCollection && marketDataCollection.count < 10) {
        issues.push('Insufficient market data in database');
        recommendations.push('Import market data or check data feed connections');
      }
    }

    // Check connection pool
    if (mongoose.connections.length > 1) {
      issues.push('Multiple database connections detected');
      recommendations.push('Optimize database connection pooling');
    }
  }

  async checkDataIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check for orphaned portfolios
      const portfoliosWithoutUsers = await Portfolio.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: { user: { $size: 0 } }
        },
        {
          $count: 'count'
        }
      ]);

      if (portfoliosWithoutUsers.length > 0 && portfoliosWithoutUsers[0].count > 0) {
        issues.push(`Found ${portfoliosWithoutUsers[0].count} orphaned portfolios`);
      }

      // Check for transactions without portfolios
      const transactionsWithoutPortfolios = await Transaction.aggregate([
        {
          $lookup: {
            from: 'portfolios',
            localField: 'portfolioId',
            foreignField: '_id',
            as: 'portfolio'
          }
        },
        {
          $match: { portfolio: { $size: 0 } }
        },
        {
          $count: 'count'
        }
      ]);

      if (transactionsWithoutPortfolios.length > 0 && transactionsWithoutPortfolios[0].count > 0) {
        issues.push(`Found ${transactionsWithoutPortfolios[0].count} orphaned transactions`);
      }

      // Check for users with invalid email formats
      const usersWithInvalidEmails = await User.countDocuments({
        email: { $not: { $regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } }
      });

      if (usersWithInvalidEmails > 0) {
        issues.push(`Found ${usersWithInvalidEmails} users with invalid email formats`);
      }

      // Check for portfolios with negative total values
      const portfoliosWithNegativeValues = await Portfolio.countDocuments({
        totalValue: { $lt: 0 }
      });

      if (portfoliosWithNegativeValues > 0) {
        issues.push(`Found ${portfoliosWithNegativeValues} portfolios with negative total values`);
      }

      // Check for market data with invalid prices
      const invalidMarketData = await MarketData.countDocuments({
        $or: [
          { price: { $lte: 0 } },
          { previousClose: { $lte: 0 } },
          { high52Week: { $lte: 0 } },
          { low52Week: { $lte: 0 } }
        ]
      });

      if (invalidMarketData > 0) {
        issues.push(`Found ${invalidMarketData} market data records with invalid prices`);
      }

    } catch (error) {
      logger.error('Error checking data integrity:', error);
      issues.push(`Data integrity check failed: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  async generateReport(): Promise<string> {
    logger.info('🔍 Starting database health check...');
    
    const healthMetrics = await this.runHealthCheck();
    const integrityCheck = await this.checkDataIntegrity();

    let report = '\n=== DATABASE HEALTH REPORT ===\n\n';

    // Database Status
    report += `📊 DATABASE STATUS: ${healthMetrics.database.status.toUpperCase()}\n`;
    report += `   Connection State: ${healthMetrics.database.connectionState}\n`;
    report += `   Response Time: ${healthMetrics.database.responseTime}ms\n\n`;

    // Collections Summary
    report += '📁 COLLECTIONS:\n';
    healthMetrics.collections.forEach(collection => {
      report += `   ${collection.name}: ${collection.count} documents, ${collection.indexes} indexes\n`;
    });
    report += '\n';

    // Performance Metrics
    report += '⚡ PERFORMANCE:\n';
    report += `   Uptime: ${Math.round(healthMetrics.performance.uptime / 3600)} hours\n`;
    report += `   Memory Usage: ${JSON.stringify(healthMetrics.performance.memoryUsage)}\n`;
    report += `   Connection Pool Size: ${healthMetrics.performance.connectionPoolSize}\n\n`;

    // Data Integrity
    report += `🔒 DATA INTEGRITY: ${integrityCheck.valid ? 'VALID' : 'ISSUES FOUND'}\n`;
    if (!integrityCheck.valid) {
      integrityCheck.issues.forEach(issue => {
        report += `   ❌ ${issue}\n`;
      });
    }
    report += '\n';

    // Issues
    if (healthMetrics.issues.length > 0) {
      report += '⚠️  ISSUES FOUND:\n';
      healthMetrics.issues.forEach(issue => {
        report += `   ❌ ${issue}\n`;
      });
      report += '\n';
    }

    // Recommendations
    if (healthMetrics.recommendations.length > 0) {
      report += '💡 RECOMMENDATIONS:\n';
      healthMetrics.recommendations.forEach(recommendation => {
        report += `   ✨ ${recommendation}\n`;
      });
      report += '\n';
    }

    if (healthMetrics.issues.length === 0 && integrityCheck.valid) {
      report += '✅ Database is healthy with no issues detected!\n';
    }

    report += '\n=== END OF REPORT ===\n';

    logger.info(report);
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const healthCheck = new DatabaseHealthCheck();
  
  const command = process.argv[2];

  switch (command) {
    case 'report':
    case undefined:
      healthCheck.generateReport()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          logger.error('❌ Health check failed:', error);
          process.exit(1);
        });
      break;

    case 'integrity':
      healthCheck.checkDataIntegrity()
        .then((result) => {
          logger.info(`Data integrity: ${result.valid ? 'VALID' : 'ISSUES FOUND'}`);
          if (!result.valid) {
            result.issues.forEach(issue => logger.warn(`   ❌ ${issue}`));
          }
          process.exit(result.valid ? 0 : 1);
        })
        .catch((error) => {
          logger.error('❌ Integrity check failed:', error);
          process.exit(1);
        });
      break;

    default:
      logger.info('Available commands:');
      logger.info('  npm run health:check        - Run full health check report');
      logger.info('  npm run health:integrity    - Check data integrity only');
      process.exit(0);
  }
}

export default DatabaseHealthCheck;
