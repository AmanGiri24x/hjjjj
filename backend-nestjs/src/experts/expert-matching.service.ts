import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface ExpertMatch {
  expertId: string;
  matchScore: number;
  availability: 'immediate' | 'within_hour' | 'within_day' | 'scheduled';
  estimatedCost: number;
  specialtyMatch: number;
  languageMatch: boolean;
  ratingMatch: number;
  experienceMatch: number;
  reasonsForMatch: string[];
}

@Injectable()
export class ExpertMatchingService {
  private readonly logger = new Logger(ExpertMatchingService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private monitoringService: MonitoringService,
  ) {}

  async findBestMatches(userId: string, requirements: any): Promise<ExpertMatch[]> {
    try {
      const startTime = Date.now();
      
      // Get user profile for personalized matching
      const userProfile = await this.getUserProfile(userId);
      
      // Get all available experts
      const availableExperts = await this.getAvailableExperts();
      
      // Calculate match scores for each expert
      const matches: ExpertMatch[] = [];
      
      for (const expert of availableExperts) {
        const matchScore = await this.calculateMatchScore(expert, requirements, userProfile);
        
        if (matchScore.totalScore > 0.3) { // Only include matches above 30%
          matches.push({
            expertId: expert.id,
            matchScore: matchScore.totalScore,
            availability: this.determineAvailability(expert),
            estimatedCost: this.calculateEstimatedCost(expert, requirements),
            specialtyMatch: matchScore.specialtyScore,
            languageMatch: matchScore.languageMatch,
            ratingMatch: matchScore.ratingScore,
            experienceMatch: matchScore.experienceScore,
            reasonsForMatch: matchScore.reasons,
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      // Log matching performance
      const duration = Date.now() - startTime;
      await this.monitoringService.recordMetric('expert_matching_duration', duration);
      await this.monitoringService.recordMetric('expert_matches_found', matches.length);

      this.logger.log(`Found ${matches.length} expert matches for user ${userId} in ${duration}ms`);

      return matches.slice(0, 10); // Return top 10 matches
    } catch (error) {
      this.logger.error(`Failed to find expert matches: ${error.message}`);
      await this.monitoringService.recordError('expert_matching_failed', error);
      throw error;
    }
  }

  async notifyMatchingExperts(requestId: string, matches: ExpertMatch[]): Promise<void> {
    try {
      const request = await this.getExpertRequest(requestId);
      
      for (const match of matches.slice(0, 5)) { // Notify top 5 matches
        const expert = await this.getExpertById(match.expertId);
        
        await this.notificationsService.sendNotification({
          userId: expert.userId,
          type: 'expert_consultation_request',
          title: 'New Consultation Request',
          message: `New ${request.category} consultation request (${request.urgency} priority) - Match Score: ${Math.round(match.matchScore * 100)}%`,
          data: {
            requestId,
            category: request.category,
            urgency: request.urgency,
            budget: request.budget,
            matchScore: match.matchScore,
            estimatedCost: match.estimatedCost,
          },
          priority: this.getNotificationPriority(request.urgency),
        });

        // Send email notification for high-priority requests
        if (request.urgency === 'high' || request.urgency === 'critical') {
          await this.notificationsService.sendEmail({
            to: expert.email,
            subject: `Urgent Consultation Request - ${request.category}`,
            template: 'expert_urgent_request',
            data: {
              expertName: expert.name,
              category: request.category,
              urgency: request.urgency,
              budget: request.budget,
              description: request.description,
              requestId,
            },
          });
        }
      }

      this.logger.log(`Notified ${matches.length} experts for request ${requestId}`);
    } catch (error) {
      this.logger.error(`Failed to notify matching experts: ${error.message}`);
      throw error;
    }
  }

  async notifyEmergencyRequest(requestId: string): Promise<void> {
    try {
      const request = await this.getExpertRequest(requestId);
      const allExperts = await this.getAllExperts();

      // Send immediate notifications to all experts
      const notifications = allExperts.map(expert => 
        this.notificationsService.sendNotification({
          userId: expert.userId,
          type: 'emergency_consultation',
          title: '🚨 EMERGENCY CONSULTATION REQUEST',
          message: `URGENT: ${request.description}`,
          data: {
            requestId,
            category: request.category,
            budget: request.budget,
            isEmergency: true,
          },
          priority: 'critical',
        })
      );

      await Promise.all(notifications);

      // Send SMS to top-rated experts if available
      const topExperts = allExperts
        .filter(expert => expert.rating >= 4.5)
        .slice(0, 3);

      for (const expert of topExperts) {
        if (expert.phone) {
          await this.notificationsService.sendSMS({
            to: expert.phone,
            message: `EMERGENCY consultation request on DhanAi. Budget: $${request.budget}. Login to respond immediately.`,
          });
        }
      }

      this.logger.log(`Emergency notification sent to ${allExperts.length} experts`);
    } catch (error) {
      this.logger.error(`Failed to notify emergency request: ${error.message}`);
      throw error;
    }
  }

  private async calculateMatchScore(expert: any, requirements: any, userProfile: any): Promise<any> {
    const scores = {
      specialtyScore: 0,
      languageMatch: false,
      ratingScore: 0,
      experienceScore: 0,
      availabilityScore: 0,
      budgetScore: 0,
      reasons: [] as string[],
    };

    // Specialty matching (40% weight)
    if (expert.specialties.includes(requirements.category)) {
      scores.specialtyScore = 1.0;
      scores.reasons.push(`Expert in ${requirements.category}`);
    } else {
      // Check for related specialties
      const relatedMatch = this.findRelatedSpecialty(expert.specialties, requirements.category);
      if (relatedMatch) {
        scores.specialtyScore = 0.7;
        scores.reasons.push(`Experience in related area: ${relatedMatch}`);
      }
    }

    // Language matching (10% weight)
    const preferredLanguage = requirements.preferredLanguage || userProfile.preferredLanguage || 'en';
    if (expert.languages.includes(preferredLanguage)) {
      scores.languageMatch = true;
      scores.reasons.push(`Speaks ${preferredLanguage}`);
    }

    // Rating score (20% weight)
    scores.ratingScore = Math.min(expert.rating / 5.0, 1.0);
    if (expert.rating >= 4.5) {
      scores.reasons.push(`Highly rated (${expert.rating}/5)`);
    }

    // Experience score (15% weight)
    scores.experienceScore = Math.min(expert.yearsOfExperience / 10, 1.0);
    if (expert.yearsOfExperience >= 10) {
      scores.reasons.push(`${expert.yearsOfExperience}+ years experience`);
    }

    // Availability score (10% weight)
    const availability = this.checkAvailability(expert, requirements.preferredTime);
    scores.availabilityScore = availability.score;
    if (availability.score > 0.8) {
      scores.reasons.push('Available immediately');
    }

    // Budget compatibility (5% weight)
    if (expert.hourlyRate <= requirements.budget) {
      scores.budgetScore = 1.0;
      scores.reasons.push('Within budget');
    } else if (expert.hourlyRate <= requirements.budget * 1.2) {
      scores.budgetScore = 0.7;
      scores.reasons.push('Slightly above budget');
    }

    // Calculate weighted total score
    const totalScore = (
      scores.specialtyScore * 0.4 +
      (scores.languageMatch ? 1 : 0) * 0.1 +
      scores.ratingScore * 0.2 +
      scores.experienceScore * 0.15 +
      scores.availabilityScore * 0.1 +
      scores.budgetScore * 0.05
    );

    return {
      ...scores,
      totalScore,
    };
  }

  private findRelatedSpecialty(expertSpecialties: string[], requestedCategory: string): string | null {
    const relatedCategories = {
      'trading': ['investment', 'general'],
      'investment': ['trading', 'retirement', 'general'],
      'retirement': ['investment', 'tax', 'general'],
      'tax': ['retirement', 'general'],
      'insurance': ['general'],
      'general': ['trading', 'investment', 'retirement', 'tax', 'insurance'],
    };

    const related = relatedCategories[requestedCategory] || [];
    return expertSpecialties.find(specialty => related.includes(specialty)) || null;
  }

  private checkAvailability(expert: any, preferredTime?: string): { score: number; available: boolean } {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Check if expert is currently online
    if (expert.isOnline) {
      return { score: 1.0, available: true };
    }

    // Check working hours
    const schedule = expert.availability || {};
    const todaySchedule = schedule[this.getDayName(currentDay)];
    
    if (todaySchedule && this.isWithinWorkingHours(currentHour, todaySchedule)) {
      return { score: 0.8, available: true };
    }

    // Check if available within 24 hours
    if (this.hasAvailabilityWithin24Hours(expert, now)) {
      return { score: 0.6, available: true };
    }

    return { score: 0.2, available: false };
  }

  private getDayName(dayIndex: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  }

  private isWithinWorkingHours(currentHour: number, schedule: any): boolean {
    if (!schedule.start || !schedule.end) return false;
    
    const startHour = parseInt(schedule.start.split(':')[0]);
    const endHour = parseInt(schedule.end.split(':')[0]);
    
    return currentHour >= startHour && currentHour <= endHour;
  }

  private hasAvailabilityWithin24Hours(expert: any, fromTime: Date): boolean {
    // Simplified check - in real implementation, would check detailed calendar
    return expert.availability && Object.keys(expert.availability).length > 0;
  }

  private determineAvailability(expert: any): 'immediate' | 'within_hour' | 'within_day' | 'scheduled' {
    if (expert.isOnline) return 'immediate';
    
    const availability = this.checkAvailability(expert);
    if (availability.score >= 0.8) return 'within_hour';
    if (availability.score >= 0.6) return 'within_day';
    
    return 'scheduled';
  }

  private calculateEstimatedCost(expert: any, requirements: any): number {
    const baseRate = expert.hourlyRate;
    const estimatedDuration = this.estimateConsultationDuration(requirements.category, requirements.urgency);
    
    let cost = baseRate * estimatedDuration;
    
    // Apply urgency multiplier
    if (requirements.urgency === 'critical') cost *= 1.5;
    else if (requirements.urgency === 'high') cost *= 1.2;
    
    return Math.round(cost);
  }

  private estimateConsultationDuration(category: string, urgency: string): number {
    const baseDurations = {
      'trading': 0.5, // 30 minutes
      'investment': 1.0, // 1 hour
      'retirement': 1.5, // 1.5 hours
      'tax': 1.0, // 1 hour
      'insurance': 0.75, // 45 minutes
      'general': 0.5, // 30 minutes
    };

    let duration = baseDurations[category] || 0.5;
    
    // Adjust for urgency
    if (urgency === 'critical') duration *= 0.5; // Quick emergency consultation
    else if (urgency === 'low') duration *= 1.5; // More thorough discussion
    
    return duration;
  }

  private getNotificationPriority(urgency: string): 'low' | 'medium' | 'high' | 'critical' {
    const priorityMap = {
      'low': 'low' as const,
      'medium': 'medium' as const,
      'high': 'high' as const,
      'critical': 'critical' as const,
    };
    
    return priorityMap[urgency] || 'medium';
  }

  private async getUserProfile(userId: string): Promise<any> {
    // In real implementation, fetch from database
    return {
      preferredLanguage: 'en',
      timezone: 'UTC',
      previousConsultations: [],
    };
  }

  private async getAvailableExperts(): Promise<any[]> {
    // In real implementation, fetch from database with availability filter
    return [
      {
        id: 'exp_001',
        userId: 'user_exp_001',
        name: 'Sarah Johnson',
        email: 'sarah@experts.com',
        phone: '+1234567890',
        specialties: ['trading', 'investment'],
        languages: ['en', 'es'],
        rating: 4.8,
        yearsOfExperience: 12,
        hourlyRate: 150,
        isOnline: true,
        availability: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
        },
      },
      // More experts would be loaded from database
    ];
  }

  private async getAllExperts(): Promise<any[]> {
    // In real implementation, fetch all experts from database
    return this.getAvailableExperts();
  }

  private async getExpertRequest(requestId: string): Promise<any> {
    // In real implementation, fetch from database
    return {
      id: requestId,
      userId: 'user_123',
      category: 'trading',
      urgency: 'high',
      budget: 200,
      description: 'Need help with portfolio rebalancing',
    };
  }

  private async getExpertById(expertId: string): Promise<any> {
    const experts = await this.getAvailableExperts();
    return experts.find(expert => expert.id === expertId);
  }
}
