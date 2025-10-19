import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { StripeService, CreatePaymentIntentDto, CreateCustomerDto, CreateSubscriptionDto } from './stripe.service';
import Stripe from 'stripe';

export interface PaymentRecord {
  id: string;
  userId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
    private stripe: StripeService,
  ) {}

  /**
   * Create payment intent and store record
   */
  async createPayment(userId: string, data: CreatePaymentIntentDto, ipAddress: string): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    paymentRecord: PaymentRecord;
  }> {
    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripe.createPaymentIntent(userId, data, ipAddress);

      // Store payment record in database
      const paymentRecord = await this.prisma.payment.create({
        data: {
          userId,
          stripePaymentIntentId: paymentIntent.id,
          amount: data.amount,
          currency: data.currency,
          status: paymentIntent.status,
          description: data.metadata?.description,
          metadata: data.metadata,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_PAYMENT',
        resource: 'payment',
        ipAddress,
        userAgent: '',
        metadata: {
          paymentId: paymentRecord.id,
          paymentIntentId: paymentIntent.id,
          amount: data.amount,
          currency: data.currency,
        },
        riskLevel: 'MEDIUM',
      });

      return {
        paymentIntent,
        paymentRecord: this.mapPaymentRecord(paymentRecord),
      };
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create or retrieve customer
   */
  async createOrRetrieveCustomer(userId: string, data: CreateCustomerDto, ipAddress: string): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { userId },
      });

      if (existingCustomer) {
        return await this.stripe.retrieveCustomer(existingCustomer.stripeCustomerId);
      }

      // Create new customer
      const customer = await this.stripe.createCustomer(userId, data, ipAddress);

      // Store customer record
      await this.prisma.customer.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          metadata: data.metadata,
        },
      });

      return customer;
    } catch (error) {
      this.logger.error(`Failed to create/retrieve customer: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(userId: string, data: CreateSubscriptionDto, ipAddress: string): Promise<{
    subscription: Stripe.Subscription;
    subscriptionRecord: SubscriptionRecord;
  }> {
    try {
      // Create Stripe subscription
      const subscription = await this.stripe.createSubscription(userId, data, ipAddress);

      // Store subscription record
      const subscriptionRecord = await this.prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: data.customerId,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          metadata: data.metadata,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_SUBSCRIPTION',
        resource: 'subscription',
        ipAddress,
        userAgent: '',
        metadata: {
          subscriptionId: subscriptionRecord.id,
          stripeSubscriptionId: subscription.id,
          customerId: data.customerId,
        },
        riskLevel: 'MEDIUM',
      });

      return {
        subscription,
        subscriptionRecord: this.mapSubscriptionRecord(subscriptionRecord),
      };
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, subscriptionId: string, ipAddress: string): Promise<SubscriptionRecord> {
    try {
      // Find subscription record
      const subscriptionRecord = await this.prisma.subscription.findFirst({
        where: { id: subscriptionId, userId },
      });

      if (!subscriptionRecord) {
        throw new NotFoundException('Subscription not found');
      }

      // Cancel Stripe subscription
      const canceledSubscription = await this.stripe.cancelSubscription(
        userId,
        subscriptionRecord.stripeSubscriptionId,
        ipAddress
      );

      // Update subscription record
      const updatedRecord = await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: canceledSubscription.status,
          cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        },
      });

      return this.mapSubscriptionRecord(updatedRecord);
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId: string, limit: number = 50, offset: number = 0): Promise<PaymentRecord[]> {
    try {
      const payments = await this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return payments.map(this.mapPaymentRecord);
    } catch (error) {
      this.logger.error(`Failed to get user payments: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<SubscriptionRecord[]> {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return subscriptions.map(this.mapSubscriptionRecord);
    } catch (error) {
      this.logger.error(`Failed to get user subscriptions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update payment status from webhook
   */
  async updatePaymentStatus(stripePaymentIntentId: string, status: string, metadata?: any): Promise<PaymentRecord | null> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { stripePaymentIntentId },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for Stripe payment intent: ${stripePaymentIntentId}`);
        return null;
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          metadata: metadata ? { ...payment.metadata, ...metadata } : payment.metadata,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId: payment.userId,
        action: 'UPDATE_PAYMENT_STATUS',
        resource: 'payment',
        ipAddress: 'webhook',
        userAgent: 'stripe-webhook',
        metadata: {
          paymentId: payment.id,
          stripePaymentIntentId,
          oldStatus: payment.status,
          newStatus: status,
        },
        riskLevel: 'LOW',
      });

      return this.mapPaymentRecord(updatedPayment);
    } catch (error) {
      this.logger.error(`Failed to update payment status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update subscription status from webhook
   */
  async updateSubscriptionStatus(stripeSubscriptionId: string, status: string, metadata?: any): Promise<SubscriptionRecord | null> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { stripeSubscriptionId },
      });

      if (!subscription) {
        this.logger.warn(`Subscription not found for Stripe subscription: ${stripeSubscriptionId}`);
        return null;
      }

      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status,
          metadata: metadata ? { ...subscription.metadata, ...metadata } : subscription.metadata,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId: subscription.userId,
        action: 'UPDATE_SUBSCRIPTION_STATUS',
        resource: 'subscription',
        ipAddress: 'webhook',
        userAgent: 'stripe-webhook',
        metadata: {
          subscriptionId: subscription.id,
          stripeSubscriptionId,
          oldStatus: subscription.status,
          newStatus: status,
        },
        riskLevel: 'LOW',
      });

      return this.mapSubscriptionRecord(updatedSubscription);
    } catch (error) {
      this.logger.error(`Failed to update subscription status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(userId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    averageAmount: number;
    monthlyRevenue: { month: string; amount: number }[];
  }> {
    try {
      const payments = await this.prisma.payment.findMany({
        where: { userId },
      });

      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const successfulPayments = payments.filter(p => p.status === 'succeeded').length;
      const failedPayments = payments.filter(p => p.status === 'failed').length;
      const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

      // Calculate monthly revenue for the last 12 months
      const monthlyRevenue = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthPayments = payments.filter(p => 
          p.createdAt >= date && 
          p.createdAt < nextDate && 
          p.status === 'succeeded'
        );
        
        const amount = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
        monthlyRevenue.push({
          month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          amount,
        });
      }

      return {
        totalPayments,
        totalAmount,
        successfulPayments,
        failedPayments,
        averageAmount,
        monthlyRevenue,
      };
    } catch (error) {
      this.logger.error(`Failed to get payment analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapPaymentRecord(dbPayment: any): PaymentRecord {
    return {
      id: dbPayment.id,
      userId: dbPayment.userId,
      stripePaymentIntentId: dbPayment.stripePaymentIntentId,
      amount: dbPayment.amount,
      currency: dbPayment.currency,
      status: dbPayment.status,
      description: dbPayment.description,
      metadata: dbPayment.metadata,
      createdAt: dbPayment.createdAt,
      updatedAt: dbPayment.updatedAt,
    };
  }

  private mapSubscriptionRecord(dbSubscription: any): SubscriptionRecord {
    return {
      id: dbSubscription.id,
      userId: dbSubscription.userId,
      stripeSubscriptionId: dbSubscription.stripeSubscriptionId,
      stripeCustomerId: dbSubscription.stripeCustomerId,
      status: dbSubscription.status,
      currentPeriodStart: dbSubscription.currentPeriodStart,
      currentPeriodEnd: dbSubscription.currentPeriodEnd,
      cancelAtPeriodEnd: dbSubscription.cancelAtPeriodEnd,
      metadata: dbSubscription.metadata,
      createdAt: dbSubscription.createdAt,
      updatedAt: dbSubscription.updatedAt,
    };
  }
}
