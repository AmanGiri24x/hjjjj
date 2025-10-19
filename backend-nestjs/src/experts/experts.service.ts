import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface Expert {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalSessions: number;
  hourlyRate: number;
  availability: {
    timezone: string;
    schedule: { [day: string]: { start: string; end: string }[] };
  };
  credentials: string[];
  bio: string;
  profileImage: string;
  verified: boolean;
  languages: string[];
  responseTime: number; // Average response time in minutes
  successRate: number; // Percentage of successful sessions
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpertRequest {
  userId: string;
  category: 'trading' | 'investment' | 'retirement' | 'tax' | 'insurance' | 'general';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  preferredLanguage?: string;
  description: string;
  attachments?: string[];
  scheduledFor?: Date;
}

export interface ExpertSession {
  id: string;
  userId: string;
  expertId: string;
  category: string;
  status: 'pending' | 'matched' | 'active' | 'completed' | 'cancelled';
  sessionType: 'chat' | 'video' | 'phone';
  duration: number;
  cost: number;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  rating?: number;
  feedback?: string;
  summary?: string;
  actionItems?: string[];
  followUpRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ExpertsService {
  private readonly logger = new Logger(ExpertsService.name);

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
    private monitoringService: MonitoringService,
    private notificationsService: NotificationsService,
  ) {
    this.initializeExperts();
  }

  private async initializeExperts(): Promise<void> {
    try {
      // Check if experts already exist
      const existingExperts = await this.prisma.expert.count();
      if (existingExperts > 0) {
        this.logger.log(`Found ${existingExperts} existing experts`);
        return;
      }

      // Create initial expert profiles
      const experts = await this.createInitialExperts();
      this.logger.log(`Initialized ${experts.length} expert profiles`);
    } catch (error) {
      this.logger.error(`Failed to initialize experts: ${error.message}`);
    }
  }

  private async createInitialExperts(): Promise<Expert[]> {
    const expertData = [
      {
        name: 'Sarah Chen',
        title: 'Senior Trading Strategist',
        specialties: ['Day Trading', 'Options Trading', 'Technical Analysis', 'Risk Management'],
        experience: 12,
        rating: 4.9,
        totalSessions: 1247,
        hourlyRate: 250,
        availability: {
          timezone: 'EST',
          schedule: {
            monday: [{ start: '09:00', end: '17:00' }],
            tuesday: [{ start: '09:00', end: '17:00' }],
            wednesday: [{ start: '09:00', end: '17:00' }],
            thursday: [{ start: '09:00', end: '17:00' }],
            friday: [{ start: '09:00', end: '15:00' }],
          },
        },
        credentials: ['CFA', 'Series 7', 'Series 63', 'CMT'],
        bio: 'Former Goldman Sachs trader with 12+ years of experience in equity and derivatives markets. Specialized in developing systematic trading strategies and risk management frameworks.',
        profileImage: '/experts/sarah-chen.jpg',
        verified: true,
        languages: ['English', 'Mandarin'],
        responseTime: 15,
        successRate: 96,
      },
      {
        name: 'Michael Rodriguez',
        title: 'Investment Portfolio Manager',
        specialties: ['Portfolio Management', 'Asset Allocation', 'ESG Investing', 'Wealth Planning'],
        experience: 15,
        rating: 4.8,
        totalSessions: 892,
        hourlyRate: 300,
        availability: {
          timezone: 'PST',
          schedule: {
            monday: [{ start: '08:00', end: '16:00' }],
            tuesday: [{ start: '08:00', end: '16:00' }],
            wednesday: [{ start: '08:00', end: '16:00' }],
            thursday: [{ start: '08:00', end: '16:00' }],
            friday: [{ start: '08:00', end: '14:00' }],
          },
        },
        credentials: ['CFA', 'CAIA', 'CFP'],
        bio: 'Former Vanguard portfolio manager specializing in multi-asset strategies. Expert in building diversified portfolios for high-net-worth individuals and institutions.',
        profileImage: '/experts/michael-rodriguez.jpg',
        verified: true,
        languages: ['English', 'Spanish'],
        responseTime: 20,
        successRate: 94,
      },
      {
        name: 'Dr. Emily Watson',
        title: 'Retirement Planning Specialist',
        specialties: ['Retirement Planning', '401k Optimization', 'Social Security', 'Tax Planning'],
        experience: 18,
        rating: 4.9,
        totalSessions: 1156,
        hourlyRate: 200,
        availability: {
          timezone: 'CST',
          schedule: {
            monday: [{ start: '10:00', end: '18:00' }],
            tuesday: [{ start: '10:00', end: '18:00' }],
            wednesday: [{ start: '10:00', end: '18:00' }],
            thursday: [{ start: '10:00', end: '18:00' }],
            friday: [{ start: '10:00', end: '16:00' }],
          },
        },
        credentials: ['CFP', 'ChFC', 'RICP', 'PhD Finance'],
        bio: 'Certified Financial Planner with a PhD in Finance. Specialized in comprehensive retirement planning and tax-efficient withdrawal strategies.',
        profileImage: '/experts/emily-watson.jpg',
        verified: true,
        languages: ['English'],
        responseTime: 25,
        successRate: 98,
      },
      {
        name: 'David Kim',
        title: 'Cryptocurrency & DeFi Expert',
        specialties: ['Cryptocurrency', 'DeFi', 'Blockchain Analysis', 'Alternative Investments'],
        experience: 8,
        rating: 4.7,
        totalSessions: 634,
        hourlyRate: 180,
        availability: {
          timezone: 'PST',
          schedule: {
            monday: [{ start: '11:00', end: '19:00' }],
            tuesday: [{ start: '11:00', end: '19:00' }],
            wednesday: [{ start: '11:00', end: '19:00' }],
            thursday: [{ start: '11:00', end: '19:00' }],
            friday: [{ start: '11:00', end: '17:00' }],
            saturday: [{ start: '13:00', end: '17:00' }],
          },
        },
        credentials: ['CFA', 'Certified Bitcoin Professional', 'DeFi Specialist'],
        bio: 'Former Coinbase analyst and early crypto adopter. Expert in cryptocurrency markets, DeFi protocols, and blockchain technology integration.',
        profileImage: '/experts/david-kim.jpg',
        verified: true,
        languages: ['English', 'Korean'],
        responseTime: 30,
        successRate: 92,
      },
      {
        name: 'Jennifer Thompson',
        title: 'Tax Strategy Consultant',
        specialties: ['Tax Planning', 'Estate Planning', 'Business Tax', 'International Tax'],
        experience: 20,
        rating: 4.8,
        totalSessions: 978,
        hourlyRate: 275,
        availability: {
          timezone: 'EST',
          schedule: {
            monday: [{ start: '09:00', end: '17:00' }],
            tuesday: [{ start: '09:00', end: '17:00' }],
            wednesday: [{ start: '09:00', end: '17:00' }],
            thursday: [{ start: '09:00', end: '17:00' }],
            friday: [{ start: '09:00', end: '15:00' }],
          },
        },
        credentials: ['CPA', 'CFP', 'MST', 'EA'],
        bio: 'Former Big 4 tax partner with expertise in complex tax planning strategies. Specialized in high-net-worth individual and business tax optimization.',
        profileImage: '/experts/jennifer-thompson.jpg',
        verified: true,
        languages: ['English', 'French'],
        responseTime: 18,
        successRate: 97,
      },
    ];

    const createdExperts: Expert[] = [];

    for (const expertInfo of expertData) {
      try {
        const expert = await this.prisma.expert.create({
          data: {
            id: this.generateId(),
            ...expertInfo,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        createdExperts.push(expert as Expert);
      } catch (error) {
        this.logger.error(`Failed to create expert ${expertInfo.name}: ${error.message}`);
      }
    }

    return createdExperts;
  }

  async getAvailableExperts(
    category?: string,
    budget?: number,
    language?: string
  ): Promise<Expert[]> {
    try {
      const whereClause: any = {
        verified: true,
      };

      if (category) {
        whereClause.specialties = {
          has: category,
        };
      }

      if (budget) {
        whereClause.hourlyRate = {
          lte: budget,
        };
      }

      if (language) {
        whereClause.languages = {
          has: language,
        };
      }

      const experts = await this.prisma.expert.findMany({
        where: whereClause,
        orderBy: [
          { rating: 'desc' },
          { successRate: 'desc' },
          { responseTime: 'asc' },
        ],
      });

      return experts as Expert[];
    } catch (error) {
      this.logger.error(`Failed to get available experts: ${error.message}`);
      throw error;
    }
  }

  async getExpertById(expertId: string): Promise<Expert | null> {
    try {
      const expert = await this.prisma.expert.findUnique({
        where: { id: expertId },
      });

      return expert as Expert;
    } catch (error) {
      this.logger.error(`Failed to get expert by ID: ${error.message}`);
      throw error;
    }
  }

  async requestExpertConsultation(request: ExpertRequest): Promise<string> {
    const startTime = Date.now();

    try {
      // Validate user access
      await this.securityService.validateUserAccess(request.userId, 'expert_consultation');

      // Create expert request
      const expertRequest = await this.prisma.expertRequest.create({
        data: {
          id: this.generateId(),
          userId: request.userId,
          category: request.category,
          urgency: request.urgency,
          budget: request.budget,
          preferredLanguage: request.preferredLanguage,
          description: request.description,
          attachments: request.attachments || [],
          scheduledFor: request.scheduledFor,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Send notification to matching experts
      await this.notifyMatchingExperts(expertRequest.id, request);

      // Record metrics
      const processingTime = Date.now() - startTime;
      await this.monitoringService.recordMetric('expert_request_created', 1, {
        category: request.category,
        urgency: request.urgency,
        processingTime,
      });

      return expertRequest.id;

    } catch (error) {
      this.logger.error(`Failed to create expert request: ${error.message}`, error.stack);
      
      await this.monitoringService.logError({
        level: 'error',
        message: `Expert request failed: ${error.message}`,
        context: 'experts_service',
        userId: request.userId,
        metadata: { 
          category: request.category,
          processingTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  async getUserSessions(userId: string, limit = 20): Promise<ExpertSession[]> {
    try {
      await this.securityService.validateUserAccess(userId, 'expert_sessions');

      const sessions = await this.prisma.expertSession.findMany({
        where: { userId },
        include: {
          expert: {
            select: {
              name: true,
              title: true,
              profileImage: true,
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return sessions as ExpertSession[];
    } catch (error) {
      this.logger.error(`Failed to get user sessions: ${error.message}`);
      throw error;
    }
  }

  async getSessionById(sessionId: string, userId: string): Promise<ExpertSession | null> {
    try {
      await this.securityService.validateUserAccess(userId, 'expert_sessions');

      const session = await this.prisma.expertSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          expert: {
            select: {
              name: true,
              title: true,
              profileImage: true,
              specialties: true,
              credentials: true,
            },
          },
        },
      });

      return session as ExpertSession;
    } catch (error) {
      this.logger.error(`Failed to get session by ID: ${error.message}`);
      throw error;
    }
  }

  async rateExpert(
    sessionId: string,
    userId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    try {
      await this.securityService.validateUserAccess(userId, 'expert_sessions');

      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Update session with rating and feedback
      await this.prisma.expertSession.update({
        where: {
          id: sessionId,
          userId,
        },
        data: {
          rating,
          feedback,
          updatedAt: new Date(),
        },
      });

      // Update expert's overall rating
      await this.updateExpertRating(sessionId);

      this.logger.log(`Expert rated: ${rating} stars for session ${sessionId}`);

    } catch (error) {
      this.logger.error(`Failed to rate expert: ${error.message}`);
      throw error;
    }
  }

  async getExpertStats(): Promise<any> {
    try {
      const stats = await this.prisma.expert.aggregate({
        _count: {
          id: true,
        },
        _avg: {
          rating: true,
          hourlyRate: true,
          responseTime: true,
          successRate: true,
        },
      });

      const sessionStats = await this.prisma.expertSession.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      });

      const categoryStats = await this.prisma.expertRequest.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      return {
        totalExperts: stats._count.id,
        averageRating: stats._avg.rating,
        averageHourlyRate: stats._avg.hourlyRate,
        averageResponseTime: stats._avg.responseTime,
        averageSuccessRate: stats._avg.successRate,
        sessionsByStatus: sessionStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {}),
        popularCategories: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.id,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get expert stats: ${error.message}`);
      throw error;
    }
  }

  private async notifyMatchingExperts(requestId: string, request: ExpertRequest): Promise<void> {
    try {
      // Find matching experts based on category and availability
      const matchingExperts = await this.getAvailableExperts(
        request.category,
        request.budget,
        request.preferredLanguage
      );

      // Send notifications to top 3 matching experts
      const topExperts = matchingExperts.slice(0, 3);
      
      for (const expert of topExperts) {
        await this.notificationsService.sendNotification({
          userId: expert.id,
          type: 'expert_request',
          title: 'New Expert Consultation Request',
          message: `A client is looking for ${request.category} expertise. Budget: $${request.budget}/hour`,
          data: {
            requestId,
            category: request.category,
            urgency: request.urgency,
            budget: request.budget,
          },
        });
      }

      this.logger.log(`Notified ${topExperts.length} experts for request ${requestId}`);
    } catch (error) {
      this.logger.error(`Failed to notify matching experts: ${error.message}`);
    }
  }

  private async updateExpertRating(sessionId: string): Promise<void> {
    try {
      const session = await this.prisma.expertSession.findUnique({
        where: { id: sessionId },
        select: { expertId: true },
      });

      if (!session) return;

      // Calculate new average rating for the expert
      const ratings = await this.prisma.expertSession.findMany({
        where: {
          expertId: session.expertId,
          rating: { not: null },
        },
        select: { rating: true },
      });

      if (ratings.length === 0) return;

      const averageRating = ratings.reduce((sum, r) => sum + r.rating!, 0) / ratings.length;

      // Update expert's rating
      await this.prisma.expert.update({
        where: { id: session.expertId },
        data: {
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          totalSessions: ratings.length,
          updatedAt: new Date(),
        },
      });

    } catch (error) {
      this.logger.error(`Failed to update expert rating: ${error.message}`);
    }
  }

  private generateId(): string {
    return `expert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
