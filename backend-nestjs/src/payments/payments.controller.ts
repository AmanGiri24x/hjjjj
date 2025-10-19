import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Raw,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { StripeService, CreatePaymentIntentDto, CreateCustomerDto, CreateSubscriptionDto } from './stripe.service';
import { WebhookService } from './webhook.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private stripeService: StripeService,
    private webhookService: WebhookService,
  ) {}

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  async createPaymentIntent(@Request() req: any, @Body() data: CreatePaymentIntentDto) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await this.paymentsService.createPayment(req.user.sub, data, ipAddress);

    return {
      success: true,
      data: {
        clientSecret: result.paymentIntent.client_secret,
        paymentIntentId: result.paymentIntent.id,
        paymentRecord: result.paymentRecord,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('create-customer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or retrieve Stripe customer' })
  @ApiResponse({ status: 201, description: 'Customer created/retrieved successfully' })
  async createCustomer(@Request() req: any, @Body() data: CreateCustomerDto) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const customer = await this.paymentsService.createOrRetrieveCustomer(req.user.sub, data, ipAddress);

    return {
      success: true,
      data: {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createSubscription(@Request() req: any, @Body() data: CreateSubscriptionDto) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await this.paymentsService.createSubscription(req.user.sub, data, ipAddress);

    const latestInvoice = result.subscription.latest_invoice as any;
    const paymentIntent = latestInvoice?.payment_intent;

    return {
      success: true,
      data: {
        subscriptionId: result.subscription.id,
        clientSecret: paymentIntent?.client_secret,
        subscriptionRecord: result.subscriptionRecord,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  async cancelSubscription(@Request() req: any, @Param('id') subscriptionId: string) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const subscription = await this.paymentsService.cancelSubscription(req.user.sub, subscriptionId, ipAddress);

    return {
      success: true,
      data: subscription,
      message: 'Subscription canceled successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payments' })
  @ApiResponse({ status: 200, description: 'User payments retrieved successfully' })
  async getUserPayments(
    @Request() req: any,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0'
  ) {
    const payments = await this.paymentsService.getUserPayments(
      req.user.sub,
      parseInt(limit),
      parseInt(offset)
    );

    return {
      success: true,
      data: payments,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: payments.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'User subscriptions retrieved successfully' })
  async getUserSubscriptions(@Request() req: any) {
    const subscriptions = await this.paymentsService.getUserSubscriptions(req.user.sub);

    return {
      success: true,
      data: subscriptions,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('setup-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create setup intent for saving payment methods' })
  @ApiResponse({ status: 201, description: 'Setup intent created successfully' })
  async createSetupIntent(@Request() req: any, @Body() data: { customerId: string }) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const setupIntent = await this.stripeService.createSetupIntent(req.user.sub, data.customerId, ipAddress);

    return {
      success: true,
      data: {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('payment-methods/:customerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods(@Request() req: any, @Param('customerId') customerId: string) {
    const paymentMethods = await this.stripeService.listPaymentMethods(customerId);

    return {
      success: true,
      data: paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        } : null,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('payment-methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove payment method' })
  @ApiResponse({ status: 200, description: 'Payment method removed successfully' })
  async removePaymentMethod(@Request() req: any, @Param('id') paymentMethodId: string) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await this.stripeService.detachPaymentMethod(req.user.sub, paymentMethodId, ipAddress);

    return {
      success: true,
      message: 'Payment method removed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment analytics' })
  @ApiResponse({ status: 200, description: 'Payment analytics retrieved successfully' })
  async getPaymentAnalytics(@Request() req: any) {
    const analytics = await this.paymentsService.getPaymentAnalytics(req.user.sub);

    return {
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Raw() rawBody: Buffer,
    @Headers('stripe-signature') signature: string
  ) {
    try {
      const event = this.stripeService.constructWebhookEvent(rawBody, signature);
      await this.webhookService.handleWebhookEvent(event);

      return { received: true };
    } catch (error) {
      throw new HttpException('Webhook signature verification failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get subscription plans' })
  @ApiResponse({ status: 200, description: 'Subscription plans retrieved successfully' })
  async getSubscriptionPlans() {
    // This would typically come from your database or Stripe
    const plans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Basic financial tracking',
          'Monthly reports',
          'Email support',
          'Up to 3 accounts',
        ],
        stripePriceId: process.env.STRIPE_BASIC_PRICE_ID,
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Advanced financial analytics',
          'Real-time insights',
          'Priority support',
          'Unlimited accounts',
          'AI-powered recommendations',
          'Custom budgets and goals',
        ],
        stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 49.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Premium',
          'White-label solution',
          'API access',
          'Dedicated account manager',
          'Custom integrations',
          'Advanced security features',
        ],
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
      },
    ];

    return {
      success: true,
      data: plans,
      timestamp: new Date().toISOString(),
    };
  }
}
