import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SecurityService } from '../security/security.service';

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
  paymentMethodTypes?: string[];
}

export interface CreateSubscriptionDto {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerDto {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private security: SecurityService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent(userId: string, data: CreatePaymentIntentDto, ipAddress: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        customer: data.customerId,
        metadata: {
          userId,
          ...data.metadata,
        },
        payment_method_types: data.paymentMethodTypes || ['card'],
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_PAYMENT_INTENT',
        resource: 'payment',
        ipAddress,
        userAgent: '',
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: data.amount,
          currency: data.currency,
        },
        riskLevel: 'MEDIUM',
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`, error.stack);
      throw new BadRequestException(`Payment intent creation failed: ${error.message}`);
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(userId: string, data: CreateCustomerDto, ipAddress: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: {
          userId,
          ...data.metadata,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_STRIPE_CUSTOMER',
        resource: 'customer',
        ipAddress,
        userAgent: '',
        metadata: {
          customerId: customer.id,
          email: data.email,
        },
        riskLevel: 'LOW',
      });

      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`, error.stack);
      throw new BadRequestException(`Customer creation failed: ${error.message}`);
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(userId: string, data: CreateSubscriptionDto, ipAddress: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        metadata: {
          userId,
          ...data.metadata,
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_SUBSCRIPTION',
        resource: 'subscription',
        ipAddress,
        userAgent: '',
        metadata: {
          subscriptionId: subscription.id,
          customerId: data.customerId,
          priceId: data.priceId,
        },
        riskLevel: 'MEDIUM',
      });

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Subscription creation failed: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, subscriptionId: string, ipAddress: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CANCEL_SUBSCRIPTION',
        resource: 'subscription',
        ipAddress,
        userAgent: '',
        metadata: {
          subscriptionId,
        },
        riskLevel: 'MEDIUM',
      });

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Subscription cancellation failed: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`, error.stack);
      throw new BadRequestException(`Payment intent retrieval failed: ${error.message}`);
    }
  }

  /**
   * Retrieve customer
   */
  async retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      this.logger.error(`Failed to retrieve customer: ${error.message}`, error.stack);
      throw new BadRequestException(`Customer retrieval failed: ${error.message}`);
    }
  }

  /**
   * List customer subscriptions
   */
  async listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
      });
      return subscriptions.data;
    } catch (error) {
      this.logger.error(`Failed to list subscriptions: ${error.message}`, error.stack);
      throw new BadRequestException(`Subscription listing failed: ${error.message}`);
    }
  }

  /**
   * Create setup intent for saving payment methods
   */
  async createSetupIntent(userId: string, customerId: string, ipAddress: string): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          userId,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_SETUP_INTENT',
        resource: 'payment_method',
        ipAddress,
        userAgent: '',
        metadata: {
          setupIntentId: setupIntent.id,
          customerId,
        },
        riskLevel: 'MEDIUM',
      });

      return setupIntent;
    } catch (error) {
      this.logger.error(`Failed to create setup intent: ${error.message}`, error.stack);
      throw new BadRequestException(`Setup intent creation failed: ${error.message}`);
    }
  }

  /**
   * List customer payment methods
   */
  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      this.logger.error(`Failed to list payment methods: ${error.message}`, error.stack);
      throw new BadRequestException(`Payment methods listing failed: ${error.message}`);
    }
  }

  /**
   * Detach payment method
   */
  async detachPaymentMethod(userId: string, paymentMethodId: string, ipAddress: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'DETACH_PAYMENT_METHOD',
        resource: 'payment_method',
        ipAddress,
        userAgent: '',
        metadata: {
          paymentMethodId,
        },
        riskLevel: 'MEDIUM',
      });

      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to detach payment method: ${error.message}`, error.stack);
      throw new BadRequestException(`Payment method detachment failed: ${error.message}`);
    }
  }

  /**
   * Construct webhook event from raw body and signature
   */
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is required');
      }

      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`, error.stack);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Get Stripe instance for advanced operations
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
