import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types';

// Export UserRole for convenience
export { UserRole };

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: String,
  avatar: String,
  dateOfBirth: Date,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'admin', 'analyst'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    select: false, // Don't include in queries by default
  },
  twoFactorBackupCodes: [{
    type: String,
    select: false,
  }],
  refreshTokens: [{
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    device: {
      userAgent: String,
      ip: String,
      platform: String,
    },
  }],
  socialAccounts: [{
    provider: {
      type: String,
      enum: ['google', 'github', 'linkedin', 'apple'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    email: String,
    username: String,
    avatar: String,
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  lastLogin: Date,
  lastActiveAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  deactivatedAt: Date,
  deactivationReason: String,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'portfolio', 'analytics'],
        default: 'overview',
      },
      refreshInterval: { type: Number, default: 30 },
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
    investmentGoals: [String],
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active',
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEnd: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'socialAccounts.provider': 1, 'socialAccounts.providerId': 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ lockUntil: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockoutTime = 2 * 60 * 60 * 1000; // 2 hours

  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we have reached max attempts and it's not locked already, lock it
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockoutTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Add refresh token
userSchema.methods.addRefreshToken = function(token: string, device: any) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
  
  this.refreshTokens.push({
    token,
    expiresAt,
    device,
  });
  
  // Keep only the last 5 tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function(token: string) {
  this.refreshTokens = this.refreshTokens.filter(
    (refreshToken: any) => refreshToken.token !== token
  );
};

// Clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter(
    (refreshToken: any) => refreshToken.expiresAt > new Date()
  );
};

// Connect social account
userSchema.methods.connectSocialAccount = function(provider: string, profile: any) {
  const existingAccount = this.socialAccounts.find(
    (account: any) => account.provider === provider
  );
  
  if (existingAccount) {
    existingAccount.providerId = profile.id;
    existingAccount.email = profile.email;
    existingAccount.username = profile.username;
    existingAccount.avatar = profile.avatar;
  } else {
    this.socialAccounts.push({
      provider,
      providerId: profile.id,
      email: profile.email,
      username: profile.username,
      avatar: profile.avatar,
    });
  }
};

// Disconnect social account
userSchema.methods.disconnectSocialAccount = function(provider: string) {
  this.socialAccounts = this.socialAccounts.filter(
    (account: any) => account.provider !== provider
  );
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
  return this.save();
};

// Clean expired tokens
userSchema.methods.cleanExpiredTokens = function() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((token: any) => token.expiresAt > now);
  return this.save();
};

// Static method for finding by password reset token
userSchema.statics.findByPasswordResetToken = function(token: string) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
};

// Deactivate account
userSchema.methods.deactivate = function(reason: string) {
  this.isActive = false;
  this.deactivatedAt = new Date();
  this.deactivationReason = reason;
  return this.save();
};

// Reactivate account
userSchema.methods.reactivate = function() {
  this.isActive = true;
  this.deactivatedAt = undefined;
  this.deactivationReason = undefined;
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findBySocialAccount = function(provider: string, providerId: string) {
  return this.findOne({
    'socialAccounts.provider': provider,
    'socialAccounts.providerId': providerId,
  });
};

userSchema.statics.findByEmailVerificationToken = function(token: string) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
};

userSchema.statics.findByPasswordResetToken = function(token: string) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
};

export const User = mongoose.model<IUser>('User', userSchema);
