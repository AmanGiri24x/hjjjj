import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { PaymentsService } from '../payments/payments.service';

export interface ExpertSession {
  id: string;
  requestId: string;
  expertId: string;
  userId: string;
  sessionType: 'chat' | 'video' | 'phone';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  cost: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  summary?: string;
  actionItems?: string[];
  rating?: number;
  feedback?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ExpertSessionService {
  private readonly logger = new Logger(ExpertSessionService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private monitoringService: MonitoringService,
    private paymentsService: PaymentsService,
  ) {}

  async startSession(sessionId: string, userId: string, sessionType: 'chat' | 'video' | 'phone'): Promise<any> {
    try {
      const session = await this.getSessionById(sessionId);
      
      // Validate user access
      if (session.userId !== userId) {
        throw new Error('Unauthorized access to session');
      }

      // Validate session status
      if (session.status !== 'scheduled') {
        throw new Error(`Cannot start session with status: ${session.status}`);
      }

      // Process payment if not already paid
      if (session.paymentStatus !== 'paid') {
        await this.processSessionPayment(session);
      }

      // Update session status
      const updatedSession = await this.updateSession(sessionId, {
        status: 'active',
        sessionType,
        startTime: new Date(),
      });

      // Initialize session infrastructure based on type
      const sessionData = await this.initializeSessionInfrastructure(updatedSession);

      // Notify expert that session has started
      await this.notifySessionStart(updatedSession);

      // Start session monitoring
      await this.startSessionMonitoring(sessionId);

      this.logger.log(`Session ${sessionId} started successfully`);

      return {
        session: updatedSession,
        sessionData,
        message: 'Session started successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to start session ${sessionId}: ${error.message}`);
      await this.monitoringService.recordError('session_start_failed', error);
      throw error;
    }
  }

  async endSession(sessionId: string, userId: string, summary?: string, actionItems?: string[]): Promise<any> {
    try {
      const session = await this.getSessionById(sessionId);
      
      // Validate user access
      if (session.userId !== userId) {
        throw new Error('Unauthorized access to session');
      }

      // Validate session status
      if (session.status !== 'active') {
        throw new Error(`Cannot end session with status: ${session.status}`);
      }

      const endTime = new Date();
      const duration = session.startTime ? 
        Math.round((endTime.getTime() - session.startTime.getTime()) / 1000 / 60) : 0; // Duration in minutes

      // Update session
      const updatedSession = await this.updateSession(sessionId, {
        status: 'completed',
        endTime,
        duration,
        summary,
        actionItems,
      });

      // Generate session transcript and recording if applicable
      await this.processSessionRecording(updatedSession);

      // Calculate final cost based on actual duration
      const finalCost = await this.calculateFinalCost(updatedSession);
      if (finalCost !== session.cost) {
        await this.adjustSessionPayment(sessionId, finalCost);
      }

      // Send session completion notifications
      await this.notifySessionCompletion(updatedSession);

      // Generate session report
      const sessionReport = await this.generateSessionReport(updatedSession);

      // Stop session monitoring
      await this.stopSessionMonitoring(sessionId);

      this.logger.log(`Session ${sessionId} ended successfully. Duration: ${duration} minutes`);

      return {
        session: updatedSession,
        sessionReport,
        finalCost,
        message: 'Session completed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to end session ${sessionId}: ${error.message}`);
      await this.monitoringService.recordError('session_end_failed', error);
      throw error;
    }
  }

  async scheduleSession(requestId: string, expertId: string, scheduledTime: Date): Promise<string> {
    try {
      const request = await this.getExpertRequest(requestId);
      const expert = await this.getExpertById(expertId);

      // Validate expert availability
      await this.validateExpertAvailability(expertId, scheduledTime);

      // Calculate session cost
      const estimatedCost = await this.calculateSessionCost(expert, request);

      // Create session
      const session: ExpertSession = {
        id: this.generateSessionId(),
        requestId,
        expertId,
        userId: request.userId,
        sessionType: 'chat', // Default, can be changed when starting
        status: 'scheduled',
        cost: estimatedCost,
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.saveSession(session);

      // Send confirmation notifications
      await this.notifySessionScheduled(session, expert, request);

      // Create calendar events
      await this.createCalendarEvents(session, expert, request);

      this.logger.log(`Session ${session.id} scheduled for ${scheduledTime}`);

      return session.id;
    } catch (error) {
      this.logger.error(`Failed to schedule session: ${error.message}`);
      throw error;
    }
  }

  async cancelSession(sessionId: string, userId: string, reason?: string): Promise<void> {
    try {
      const session = await this.getSessionById(sessionId);
      
      // Validate user access
      if (session.userId !== userId) {
        throw new Error('Unauthorized access to session');
      }

      // Update session status
      await this.updateSession(sessionId, {
        status: 'cancelled',
        summary: reason ? `Cancelled: ${reason}` : 'Cancelled by user',
      });

      // Process refund if applicable
      if (session.paymentStatus === 'paid') {
        await this.processSessionRefund(session, reason);
      }

      // Notify expert of cancellation
      await this.notifySessionCancellation(session, reason);

      // Update expert availability
      await this.updateExpertAvailability(session.expertId, session.startTime, 'available');

      this.logger.log(`Session ${sessionId} cancelled by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  async getSessionMetrics(sessionId: string): Promise<any> {
    try {
      const session = await this.getSessionById(sessionId);
      
      return {
        sessionId,
        duration: session.duration || 0,
        cost: session.cost,
        rating: session.rating,
        status: session.status,
        sessionType: session.sessionType,
        expertUtilization: await this.calculateExpertUtilization(session.expertId),
        userSatisfaction: session.rating ? session.rating / 5 : null,
        responseTime: await this.calculateResponseTime(session),
        completionRate: session.status === 'completed' ? 1 : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get session metrics: ${error.message}`);
      throw error;
    }
  }

  private async initializeSessionInfrastructure(session: ExpertSession): Promise<any> {
    const sessionData: any = {
      sessionId: session.id,
      sessionType: session.sessionType,
    };

    switch (session.sessionType) {
      case 'video':
        // Initialize video conferencing
        sessionData.videoRoom = await this.createVideoRoom(session.id);
        sessionData.recordingEnabled = true;
        break;
        
      case 'phone':
        // Initialize phone bridge
        sessionData.phoneNumber = await this.createPhoneBridge(session.id);
        sessionData.recordingEnabled = true;
        break;
        
      case 'chat':
        // Initialize chat room
        sessionData.chatRoom = await this.createChatRoom(session.id);
        sessionData.transcriptEnabled = true;
        break;
    }

    return sessionData;
  }

  private async createVideoRoom(sessionId: string): Promise<any> {
    // Integration with video conferencing service (e.g., Zoom, WebRTC)
    return {
      roomId: `video_${sessionId}`,
      joinUrl: `https://video.dhanai.com/room/${sessionId}`,
      moderatorPin: this.generatePin(),
      participantPin: this.generatePin(),
    };
  }

  private async createPhoneBridge(sessionId: string): Promise<any> {
    // Integration with telephony service (e.g., Twilio)
    return {
      bridgeNumber: '+1-800-DHANAI-1',
      conferenceId: sessionId.slice(-6),
      moderatorPin: this.generatePin(),
      participantPin: this.generatePin(),
    };
  }

  private async createChatRoom(sessionId: string): Promise<any> {
    // Initialize real-time chat
    return {
      roomId: `chat_${sessionId}`,
      websocketUrl: `wss://chat.dhanai.com/session/${sessionId}`,
      encryptionKey: this.generateEncryptionKey(),
    };
  }

  private async processSessionPayment(session: ExpertSession): Promise<void> {
    try {
      const paymentResult = await this.paymentsService.processPayment({
        userId: session.userId,
        amount: session.cost,
        currency: 'USD',
        description: `Expert consultation session ${session.id}`,
        metadata: {
          sessionId: session.id,
          expertId: session.expertId,
          type: 'expert_consultation',
        },
      });

      if (paymentResult.success) {
        await this.updateSession(session.id, {
          paymentStatus: 'paid',
        });
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      this.logger.error(`Payment processing failed for session ${session.id}: ${error.message}`);
      throw error;
    }
  }

  private async processSessionRecording(session: ExpertSession): Promise<void> {
    if (session.sessionType === 'chat') {
      // Generate chat transcript
      session.transcriptUrl = await this.generateChatTranscript(session.id);
    } else {
      // Process audio/video recording
      session.recordingUrl = await this.processRecording(session.id);
      session.transcriptUrl = await this.generateTranscript(session.recordingUrl);
    }

    await this.updateSession(session.id, {
      recordingUrl: session.recordingUrl,
      transcriptUrl: session.transcriptUrl,
    });
  }

  private async calculateFinalCost(session: ExpertSession): Promise<number> {
    const expert = await this.getExpertById(session.expertId);
    const actualDuration = session.duration || 0;
    
    // Calculate cost based on actual duration (minimum 15 minutes)
    const billableDuration = Math.max(actualDuration, 15);
    const hourlyRate = expert.hourlyRate;
    
    return Math.round((billableDuration / 60) * hourlyRate);
  }

  private async adjustSessionPayment(sessionId: string, finalCost: number): Promise<void> {
    const session = await this.getSessionById(sessionId);
    const difference = finalCost - session.cost;

    if (difference > 0) {
      // Charge additional amount
      await this.paymentsService.processPayment({
        userId: session.userId,
        amount: difference,
        currency: 'USD',
        description: `Additional charges for session ${sessionId}`,
      });
    } else if (difference < 0) {
      // Issue partial refund
      await this.paymentsService.processRefund({
        userId: session.userId,
        amount: Math.abs(difference),
        reason: 'Session ended early',
        sessionId,
      });
    }

    await this.updateSession(sessionId, { cost: finalCost });
  }

  private async notifySessionStart(session: ExpertSession): Promise<void> {
    const expert = await this.getExpertById(session.expertId);
    
    await this.notificationsService.sendNotification({
      userId: expert.userId,
      type: 'session_started',
      title: 'Session Started',
      message: `Your consultation session has started`,
      data: { sessionId: session.id },
    });
  }

  private async notifySessionCompletion(session: ExpertSession): Promise<void> {
    // Notify user
    await this.notificationsService.sendNotification({
      userId: session.userId,
      type: 'session_completed',
      title: 'Session Completed',
      message: 'Your expert consultation has been completed. Please rate your experience.',
      data: { sessionId: session.id },
    });

    // Notify expert
    const expert = await this.getExpertById(session.expertId);
    await this.notificationsService.sendNotification({
      userId: expert.userId,
      type: 'session_completed',
      title: 'Session Completed',
      message: `Consultation session completed. Duration: ${session.duration} minutes`,
      data: { sessionId: session.id },
    });
  }

  private async notifySessionScheduled(session: ExpertSession, expert: any, request: any): Promise<void> {
    // Notify user
    await this.notificationsService.sendNotification({
      userId: session.userId,
      type: 'session_scheduled',
      title: 'Session Scheduled',
      message: `Your consultation with ${expert.name} has been scheduled`,
      data: { sessionId: session.id, expertName: expert.name },
    });

    // Notify expert
    await this.notificationsService.sendNotification({
      userId: expert.userId,
      type: 'session_scheduled',
      title: 'New Session Scheduled',
      message: `New consultation session scheduled`,
      data: { sessionId: session.id },
    });
  }

  private async notifySessionCancellation(session: ExpertSession, reason?: string): Promise<void> {
    const expert = await this.getExpertById(session.expertId);
    
    await this.notificationsService.sendNotification({
      userId: expert.userId,
      type: 'session_cancelled',
      title: 'Session Cancelled',
      message: `Consultation session has been cancelled${reason ? `: ${reason}` : ''}`,
      data: { sessionId: session.id },
    });
  }

  private async generateSessionReport(session: ExpertSession): Promise<any> {
    const expert = await this.getExpertById(session.expertId);
    
    return {
      sessionId: session.id,
      expertName: expert.name,
      duration: session.duration,
      cost: session.cost,
      summary: session.summary,
      actionItems: session.actionItems || [],
      recordingUrl: session.recordingUrl,
      transcriptUrl: session.transcriptUrl,
      nextSteps: await this.generateNextSteps(session),
      followUpRecommendations: await this.generateFollowUpRecommendations(session),
    };
  }

  private async startSessionMonitoring(sessionId: string): Promise<void> {
    // Start monitoring session quality, duration, etc.
    await this.monitoringService.recordMetric('active_sessions', 1);
  }

  private async stopSessionMonitoring(sessionId: string): Promise<void> {
    // Stop monitoring and record final metrics
    await this.monitoringService.recordMetric('active_sessions', -1);
    await this.monitoringService.recordMetric('completed_sessions', 1);
  }

  // Helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePin(): string {
    return Math.random().toString().slice(2, 8);
  }

  private generateEncryptionKey(): string {
    return Math.random().toString(36).substr(2, 32);
  }

  private async getSessionById(sessionId: string): Promise<ExpertSession> {
    // In real implementation, fetch from database
    return {} as ExpertSession;
  }

  private async updateSession(sessionId: string, updates: Partial<ExpertSession>): Promise<ExpertSession> {
    // In real implementation, update in database
    return {} as ExpertSession;
  }

  private async saveSession(session: ExpertSession): Promise<void> {
    // In real implementation, save to database
  }

  private async getExpertRequest(requestId: string): Promise<any> {
    // In real implementation, fetch from database
    return {};
  }

  private async getExpertById(expertId: string): Promise<any> {
    // In real implementation, fetch from database
    return { hourlyRate: 150, name: 'Expert Name', userId: 'expert_user_id' };
  }

  private async validateExpertAvailability(expertId: string, scheduledTime: Date): Promise<boolean> {
    // In real implementation, check expert calendar
    return true;
  }

  private async calculateSessionCost(expert: any, request: any): Promise<number> {
    return expert.hourlyRate;
  }

  private async createCalendarEvents(session: ExpertSession, expert: any, request: any): Promise<void> {
    // In real implementation, create calendar events for both parties
  }

  private async processSessionRefund(session: ExpertSession, reason?: string): Promise<void> {
    // In real implementation, process refund through payment service
  }

  private async updateExpertAvailability(expertId: string, time: Date, status: string): Promise<void> {
    // In real implementation, update expert availability
  }

  private async calculateExpertUtilization(expertId: string): Promise<number> {
    return 0.75; // 75% utilization
  }

  private async calculateResponseTime(session: ExpertSession): Promise<number> {
    return 300; // 5 minutes average response time
  }

  private async generateChatTranscript(sessionId: string): Promise<string> {
    return `https://transcripts.dhanai.com/${sessionId}.txt`;
  }

  private async processRecording(sessionId: string): Promise<string> {
    return `https://recordings.dhanai.com/${sessionId}.mp4`;
  }

  private async generateTranscript(recordingUrl: string): Promise<string> {
    return `https://transcripts.dhanai.com/${recordingUrl.split('/').pop()}.txt`;
  }

  private async generateNextSteps(session: ExpertSession): Promise<string[]> {
    return [
      'Review session recording and notes',
      'Implement discussed strategies',
      'Schedule follow-up if needed',
    ];
  }

  private async generateFollowUpRecommendations(session: ExpertSession): Promise<string[]> {
    return [
      'Monitor portfolio performance',
      'Review recommendations in 30 days',
      'Consider additional expert consultation for complex topics',
    ];
  }
}
