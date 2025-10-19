import { Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SecurityService } from '../security/security.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private paymentsService: PaymentsService,
    private security: SecurityService,
  ) {}

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'setup_intent.succeeded':
          await this.handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
          break;

        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
          break;

        case 'payment_method.detached':
          await this.handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${event.type}`);
      }

      // Log webhook processing
      await this.security.logSecurityEvent({
        userId: 'system',
        action: 'PROCESS_WEBHOOK',
        resource: 'webhook',
        ipAddress: 'stripe',
        userAgent: 'stripe-webhook',
        metadata: {
          eventType: event.type,
          eventId: event.id,
          processed: true,
        },
        riskLevel: 'LOW',
      });

    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event.type}: ${error.message}`, error.stack);
      
      // Log webhook error
      await this.security.logSecurityEvent({
        userId: 'system',
        action: 'WEBHOOK_ERROR',
        resource: 'webhook',
        ipAddress: 'stripe',
        userAgent: 'stripe-webhook',
        metadata: {
          eventType: event.type,
          eventId: event.id,
          error: error.message,
        },
        riskLevel: 'HIGH',
      });

      throw error;
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.paymentsService.updatePaymentStatus(
      paymentIntent.id,
      'succeeded',
      {
        stripeEventType: 'payment_intent.succeeded',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }
    );

    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.paymentsService.updatePaymentStatus(
      paymentIntent.id,
      'failed',
      {
        stripeEventType: 'payment_intent.payment_failed',
        failureCode: paymentIntent.last_payment_error?.code,
        failureMessage: paymentIntent.last_payment_error?.message,
      }
    );

    this.logger.warn(`Payment intent failed: ${paymentIntent.id}`);
  }

  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.paymentsService.updatePaymentStatus(
      paymentIntent.id,
      'canceled',
      {
        stripeEventType: 'payment_intent.canceled',
        cancelationReason: paymentIntent.cancellation_reason,
      }
    );

    this.logger.log(`Payment intent canceled: ${paymentIntent.id}`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      await this.paymentsService.updateSubscriptionStatus(
        invoice.subscription as string,
        'active',
        {
          stripeEventType: 'invoice.payment_succeeded',
          invoiceId: invoice.id,
          amountPaid: invoice.amount_paid,
        }
      );

      this.logger.log(`Invoice payment succeeded for subscription: ${invoice.subscription}`);
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      await this.paymentsService.updateSubscriptionStatus(
        invoice.subscription as string,
        'past_due',
        {
          stripeEventType: 'invoice.payment_failed',
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count,
        }
      );

      this.logger.warn(`Invoice payment failed for subscription: ${invoice.subscription}`);
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription created: ${subscription.id}`);
    // Additional logic for subscription creation if needed
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    await this.paymentsService.updateSubscriptionStatus(
      subscription.id,
      subscription.status,
      {
        stripeEventType: 'customer.subscription.updated',
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    );

    this.logger.log(`Subscription updated: ${subscription.id}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await this.paymentsService.updateSubscriptionStatus(
      subscription.id,
      'canceled',
      {
        stripeEventType: 'customer.subscription.deleted',
        canceledAt: subscription.canceled_at,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    );

    this.logger.log(`Subscription deleted: ${subscription.id}`);
  }

  private async handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent): Promise<void> {
    const userId = setupIntent.metadata?.userId;
    
    if (userId) {
      await this.security.logSecurityEvent({
        userId,
        action: 'SETUP_INTENT_SUCCEEDED',
        resource: 'payment_method',
        ipAddress: 'stripe',
        userAgent: 'stripe-webhook',
        metadata: {
          setupIntentId: setupIntent.id,
          paymentMethodId: setupIntent.payment_method,
          customerId: setupIntent.customer,
        },
        riskLevel: 'LOW',
      });
    }

    this.logger.log(`Setup intent succeeded: ${setupIntent.id}`);
  }

  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    this.logger.log(`Payment method attached: ${paymentMethod.id} to customer: ${paymentMethod.customer}`);
  }

  private async handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    this.logger.log(`Payment method detached: ${paymentMethod.id}`);
  }
}
