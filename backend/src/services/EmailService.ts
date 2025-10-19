import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { logger } from '../config/logger';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: Transporter;
  private fromEmail: string;
  private appName: string;
  private frontendUrl: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@dhanaillytics.com';
    this.appName = 'DhanAillytics';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    this.transporter = this.createTransporter();
  }

  private createTransporter(): Transporter {
    const emailConfig = this.getEmailConfig();
    
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    transporter.verify((error) => {
      if (error) {
        logger.error('Email service configuration error:', error);
      } else {
        logger.info('Email service is ready to send emails');
      }
    });

    return transporter;
  }

  private getEmailConfig(): EmailConfig {
    const provider = process.env.EMAIL_PROVIDER || 'smtp';

    switch (provider) {
      case 'gmail':
        return {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_APP_PASSWORD || '', // Use app-specific password
          },
        };

      case 'outlook':
        return {
          host: 'smtp.live.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASSWORD || '',
          },
        };

      case 'sendgrid':
        return {
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY || '',
          },
        };

      case 'mailgun':
        return {
          host: 'smtp.mailgun.org',
          port: 587,
          secure: false,
          auth: {
            user: process.env.MAILGUN_USERNAME || '',
            pass: process.env.MAILGUN_PASSWORD || '',
          },
        };

      default: // SMTP
        return {
          host: process.env.EMAIL_HOST || 'localhost',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASSWORD || '',
          },
        };
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      const mailOptions: SendMailOptions = {
        from: `${this.appName} <${this.fromEmail}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}:`, result.messageId);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;
    
    const template: EmailTemplate = {
      subject: `Welcome to ${this.appName}! Please verify your email`,
      text: `
        Hello ${firstName},

        Welcome to ${this.appName}! To complete your registration, please verify your email address by clicking the link below:

        ${verificationUrl}

        This link will expire in 24 hours.

        If you didn't create an account with ${this.appName}, please ignore this email.

        Best regards,
        The ${this.appName} Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.appName}</h1>
              <h2>Email Verification Required</h2>
            </div>
            <div class="content">
              <h3>Hello ${firstName}!</h3>
              <p>Welcome to <strong>${this.appName}</strong>! We're excited to have you on board.</p>
              <p>To complete your registration and start exploring our financial analytics platform, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              
              <div class="warning">
                <strong>Important:</strong> This verification link will expire in 24 hours.
              </div>
              
              <p>If you didn't create an account with ${this.appName}, please ignore this email.</p>
              
              <p>Best regards,<br>The ${this.appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2024 ${this.appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.sendEmail(email, template);
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    
    const template: EmailTemplate = {
      subject: `${this.appName} - Password Reset Request`,
      text: `
        Hello ${firstName},

        We received a request to reset your password for your ${this.appName} account.

        To reset your password, click the link below:

        ${resetUrl}

        This link will expire in 10 minutes for security reasons.

        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

        For security reasons, we recommend:
        - Using a strong, unique password
        - Enabling two-factor authentication
        - Never sharing your login credentials

        Best regards,
        The ${this.appName} Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .security-tips { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.appName}</h1>
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <h3>Hello ${firstName},</h3>
              <p>We received a request to reset your password for your <strong>${this.appName}</strong> account.</p>
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              
              <div class="warning">
                <strong>Security Notice:</strong> This reset link will expire in 10 minutes for security reasons.
              </div>
              
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <div class="security-tips">
                <strong>Security Recommendations:</strong>
                <ul>
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication</li>
                  <li>Never share your login credentials</li>
                  <li>Log out from shared devices</li>
                </ul>
              </div>
              
              <p>Best regards,<br>The ${this.appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>If you need help, contact our support team.</p>
              <p>&copy; 2024 ${this.appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.sendEmail(email, template);
  }

  async sendPasswordChangeNotification(email: string, firstName: string): Promise<void> {
    const template: EmailTemplate = {
      subject: `${this.appName} - Password Changed Successfully`,
      text: `
        Hello ${firstName},

        This is to confirm that your password has been changed successfully for your ${this.appName} account.

        If you made this change, no further action is required.

        If you didn't change your password, please:
        1. Log into your account immediately
        2. Change your password
        3. Enable two-factor authentication
        4. Contact our support team

        For your security, we've logged you out of all devices.

        Best regards,
        The ${this.appName} Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .alert { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.appName}</h1>
              <h2>Password Changed Successfully</h2>
            </div>
            <div class="content">
              <h3>Hello ${firstName},</h3>
              
              <div class="success">
                <strong>✅ Success:</strong> Your password has been changed successfully.
              </div>
              
              <p>This is to confirm that your password has been changed for your <strong>${this.appName}</strong> account.</p>
              
              <p><strong>If you made this change:</strong><br>
              No further action is required. Your account is secure.</p>
              
              <div class="alert">
                <strong>⚠️ If you didn't change your password:</strong>
                <ol>
                  <li>Log into your account immediately</li>
                  <li>Change your password</li>
                  <li>Enable two-factor authentication</li>
                  <li>Contact our support team</li>
                </ol>
              </div>
              
              <p><strong>Security Notice:</strong> For your security, we've logged you out of all devices. You'll need to log in again with your new password.</p>
              
              <p>Best regards,<br>The ${this.appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>If you need help, contact our support team immediately.</p>
              <p>&copy; 2024 ${this.appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.sendEmail(email, template);
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const template: EmailTemplate = {
      subject: `Welcome to ${this.appName}! 🎉`,
      text: `
        Hello ${firstName},

        Welcome to ${this.appName}!

        Your email has been verified and your account is now active. You can now access all features of our financial analytics platform.

        Getting Started:
        1. Complete your profile
        2. Connect your first portfolio
        3. Explore our analytics tools
        4. Set up alerts and notifications

        Need help? Our support team is here to assist you.

        Best regards,
        The ${this.appName} Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome to DhanAillytics</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .getting-started { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .step { margin: 10px 0; padding: 10px; background: white; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to ${this.appName}!</h1>
              <p>Your financial analytics journey starts here</p>
            </div>
            <div class="content">
              <h3>Hello ${firstName}!</h3>
              <p>Congratulations! Your email has been verified and your account is now active.</p>
              <p>You now have access to our comprehensive financial analytics platform that will help you make informed investment decisions.</p>
              
              <div class="getting-started">
                <h4>🚀 Getting Started:</h4>
                <div class="step">1. Complete your profile and preferences</div>
                <div class="step">2. Connect your first portfolio</div>
                <div class="step">3. Explore our powerful analytics tools</div>
                <div class="step">4. Set up alerts and notifications</div>
              </div>
              
              <p><strong>What you can do now:</strong></p>
              <ul>
                <li>Track your portfolio performance in real-time</li>
                <li>Analyze market trends and patterns</li>
                <li>Get AI-powered investment insights</li>
                <li>Set up custom alerts and notifications</li>
                <li>Access advanced charting tools</li>
              </ul>
              
              <p>Need help getting started? Our support team is here to assist you every step of the way.</p>
              
              <p>Happy investing!<br>The ${this.appName} Team</p>
            </div>
            <div class="footer">
              <p>Questions? Contact our support team anytime.</p>
              <p>&copy; 2024 ${this.appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.sendEmail(email, template);
  }

  async send2FAEnabledNotification(email: string, firstName: string): Promise<void> {
    const template: EmailTemplate = {
      subject: `${this.appName} - Two-Factor Authentication Enabled`,
      text: `
        Hello ${firstName},

        Two-factor authentication has been successfully enabled for your ${this.appName} account.

        Your account is now more secure! You'll need to provide a verification code from your authenticator app each time you log in.

        Make sure to save your backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app.

        If you didn't enable 2FA, please contact our support team immediately.

        Best regards,
        The ${this.appName} Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>2FA Enabled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 ${this.appName}</h1>
              <h2>Two-Factor Authentication Enabled</h2>
            </div>
            <div class="content">
              <h3>Hello ${firstName},</h3>
              
              <div class="success">
                <strong>✅ Success:</strong> Two-factor authentication has been successfully enabled for your account.
              </div>
              
              <p>Your <strong>${this.appName}</strong> account is now more secure! From now on, you'll need to provide a verification code from your authenticator app each time you log in.</p>
              
              <div class="warning">
                <strong>Important:</strong> Make sure to save your backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
              </div>
              
              <p><strong>What this means:</strong></p>
              <ul>
                <li>Your account has an extra layer of security</li>
                <li>You'll need your phone/authenticator app to log in</li>
                <li>Unauthorized access is much more difficult</li>
                <li>Your financial data is better protected</li>
              </ul>
              
              <p>If you didn't enable two-factor authentication, please contact our support team immediately.</p>
              
              <p>Best regards,<br>The ${this.appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated security notification.</p>
              <p>&copy; 2024 ${this.appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.sendEmail(email, template);
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email service test failed:', error);
      return false;
    }
  }
}

export default EmailService;
