import mongoose from 'mongoose';
import { logger } from './logger';

// MongoDB connection configuration
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  constructor() {
    this.setupMongooseEvents();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private setupMongooseEvents(): void {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      this.isConnected = false;
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  public async connect(): Promise<void> {
    try {
      const mongoUri = process.env.NODE_ENV === 'test' 
        ? process.env.MONGODB_URI_TEST 
        : process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      logger.info('Connecting to MongoDB...');
      await mongoose.connect(mongoUri, mongooseOptions);
      
      // Enable mongoose debugging in development
      if (process.env.NODE_ENV === 'development') {
        mongoose.set('debug', true);
      }

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public isHealthy(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnectionStatus(): string {
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
      4: 'Invalid credentials',
    };
    
    return states[mongoose.connection.readyState as keyof typeof states] || 'Unknown';
  }

  private async gracefulShutdown(): Promise<void> {
    try {
      logger.info('Shutting down MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  // Database utilities
  public async dropDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop database in production environment');
    }
    
    try {
      await mongoose.connection.dropDatabase();
      logger.info('Database dropped successfully');
    } catch (error) {
      logger.error('Error dropping database:', error);
      throw error;
    }
  }

  public async createIndexes(): Promise<void> {
    try {
      logger.info('Creating database indexes...');
      
      // You can add specific index creation logic here
      // Example:
      // await User.createIndexes();
      // await Portfolio.createIndexes();
      
      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating indexes:', error);
      throw error;
    }
  }
}

export const database = Database.getInstance();
export default database;
