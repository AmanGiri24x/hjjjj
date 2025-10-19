import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('database.url'),
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    // Log database queries in development
    if (this.configService.get('nodeEnv') === 'development') {
      this.$on('query', (e) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    this.$on('error', (e) => {
      this.logger.error('Database error:', e);
    });

    this.$on('info', (e) => {
      this.logger.log('Database info:', e);
    });

    this.$on('warn', (e) => {
      this.logger.warn('Database warning:', e);
    });

    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  async enableShutdownHooks(app: any) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    
    this.logger.log(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  }

  // Get database statistics
  async getDatabaseStats() {
    const [userCount, transactionCount, accountCount] = await Promise.all([
      this.user.count(),
      this.transaction.count(),
      this.financialAccount.count(),
    ]);

    return {
      users: userCount,
      transactions: transactionCount,
      accounts: accountCount,
      timestamp: new Date().toISOString(),
    };
  }
}
