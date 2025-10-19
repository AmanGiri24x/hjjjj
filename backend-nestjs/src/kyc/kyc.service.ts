import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KycStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface KycSubmissionDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  phone: string;
  email: string;
  idType: string;
  idNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  employmentStatus: string;
  employer?: string;
  annualIncome: string;
  sourceOfFunds: string;
  isPoliticallyExposed: boolean;
  hasConvictions: boolean;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface KycDocuments {
  idFrontImage?: Express.Multer.File;
  idBackImage?: Express.Multer.File;
  selfieImage?: Express.Multer.File;
  addressProofImage?: Express.Multer.File;
}

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  async submitKyc(
    userId: string,
    kycData: KycSubmissionDto,
    documents: KycDocuments,
  ) {
    // Validate required fields
    this.validateKycData(kycData);
    this.validateDocuments(documents);

    // Encrypt sensitive data
    const encryptedSSN = this.encryptSensitiveData(kycData.ssn);
    const encryptedIdNumber = this.encryptSensitiveData(kycData.idNumber);

    // Check if user already has KYC submission
    const existingKyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (existingKyc && existingKyc.status === 'APPROVED') {
      throw new BadRequestException('KYC already approved for this user');
    }

    // Store document paths securely
    const documentPaths = await this.storeDocuments(userId, documents);

    // Create or update KYC record
    const kycRecord = await this.prisma.kycVerification.upsert({
      where: { userId },
      update: {
        firstName: kycData.firstName,
        lastName: kycData.lastName,
        dateOfBirth: new Date(kycData.dateOfBirth),
        ssnHash: encryptedSSN,
        phone: kycData.phone,
        email: kycData.email,
        idType: kycData.idType,
        idNumberHash: encryptedIdNumber,
        address: kycData.address,
        city: kycData.city,
        state: kycData.state,
        zipCode: kycData.zipCode,
        country: kycData.country,
        employmentStatus: kycData.employmentStatus,
        employer: kycData.employer,
        annualIncome: kycData.annualIncome,
        sourceOfFunds: kycData.sourceOfFunds,
        isPoliticallyExposed: kycData.isPoliticallyExposed,
        hasConvictions: kycData.hasConvictions,
        agreeToTerms: kycData.agreeToTerms,
        agreeToPrivacy: kycData.agreeToPrivacy,
        documentPaths: JSON.stringify(documentPaths),
        status: KycStatus.PENDING,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        firstName: kycData.firstName,
        lastName: kycData.lastName,
        dateOfBirth: new Date(kycData.dateOfBirth),
        ssnHash: encryptedSSN,
        phone: kycData.phone,
        email: kycData.email,
        idType: kycData.idType,
        idNumberHash: encryptedIdNumber,
        address: kycData.address,
        city: kycData.city,
        state: kycData.state,
        zipCode: kycData.zipCode,
        country: kycData.country,
        employmentStatus: kycData.employmentStatus,
        employer: kycData.employer,
        annualIncome: kycData.annualIncome,
        sourceOfFunds: kycData.sourceOfFunds,
        isPoliticallyExposed: kycData.isPoliticallyExposed,
        hasConvictions: kycData.hasConvictions,
        agreeToTerms: kycData.agreeToTerms,
        agreeToPrivacy: kycData.agreeToPrivacy,
        documentPaths: JSON.stringify(documentPaths),
        status: KycStatus.PENDING,
        submittedAt: new Date(),
      },
    });

    // Create audit log
    await this.createAuditLog(userId, 'KYC_SUBMITTED', {
      kycId: kycRecord.id,
      documentsUploaded: Object.keys(documentPaths).length,
    });

    // Trigger automated verification checks
    await this.performAutomatedChecks(kycRecord.id);

    return {
      id: kycRecord.id,
      status: kycRecord.status,
      submittedAt: kycRecord.submittedAt,
      message: 'KYC submission received. Review typically takes 1-3 business days.',
    };
  }

  async getKycStatus(userId: string) {
    const kycRecord = await this.prisma.kycVerification.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!kycRecord) {
      return { status: 'NOT_STARTED' };
    }

    return kycRecord;
  }

  async reviewKyc(
    kycId: string,
    reviewerId: string,
    decision: 'APPROVED' | 'REJECTED',
    notes?: string,
  ) {
    const kycRecord = await this.prisma.kycVerification.findUnique({
      where: { id: kycId },
    });

    if (!kycRecord) {
      throw new NotFoundException('KYC record not found');
    }

    const updatedKyc = await this.prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        status: decision === 'APPROVED' ? KycStatus.APPROVED : KycStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        rejectionReason: decision === 'REJECTED' ? notes : null,
        updatedAt: new Date(),
      },
    });

    // Update user verification status
    if (decision === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: kycRecord.userId },
        data: { isVerified: true },
      });
    }

    // Create audit log
    await this.createAuditLog(kycRecord.userId, `KYC_${decision}`, {
      kycId,
      reviewerId,
      notes,
    });

    return updatedKyc;
  }

  private validateKycData(data: KycSubmissionDto) {
    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'ssn',
      'phone',
      'email',
      'idType',
      'idNumber',
      'address',
      'city',
      'state',
      'zipCode',
      'country',
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof KycSubmissionDto]) {
        throw new BadRequestException(`${field} is required`);
      }
    }

    if (!data.agreeToTerms || !data.agreeToPrivacy) {
      throw new BadRequestException('Must agree to terms and privacy policy');
    }

    // Validate date of birth (must be 18+)
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      throw new BadRequestException('Must be 18 years or older');
    }

    // Validate SSN format (basic check)
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    if (!ssnRegex.test(data.ssn)) {
      throw new BadRequestException('Invalid SSN format');
    }
  }

  private validateDocuments(documents: KycDocuments) {
    const requiredDocs = ['idFrontImage', 'idBackImage', 'selfieImage'];
    
    for (const docType of requiredDocs) {
      if (!documents[docType as keyof KycDocuments]) {
        throw new BadRequestException(`${docType} is required`);
      }
    }
  }

  private async storeDocuments(
    userId: string,
    documents: KycDocuments,
  ): Promise<Record<string, string>> {
    const documentPaths: Record<string, string> = {};
    const uploadDir = path.join(process.cwd(), 'uploads', 'kyc', userId);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    for (const [key, file] of Object.entries(documents)) {
      if (file) {
        const filename = `${key}-${Date.now()}${path.extname(file.originalname)}`;
        const filepath = path.join(uploadDir, filename);
        
        await fs.writeFile(filepath, file.buffer);
        documentPaths[key] = filepath;
      }
    }

    return documentPaths;
  }

  private encryptSensitiveData(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-string', 'utf8');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private async createAuditLog(
    userId: string,
    action: string,
    metadata: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: JSON.stringify(metadata),
        ipAddress: '0.0.0.0', // Should be passed from request
        userAgent: 'system', // Should be passed from request
        timestamp: new Date(),
      },
    });
  }

  private async performAutomatedChecks(kycId: string) {
    // Implement automated verification checks
    // - Document authenticity verification
    // - Identity verification against databases
    // - AML screening
    // - Sanctions list checking
    
    // For now, just log that checks are initiated
    console.log(`Automated KYC checks initiated for ID: ${kycId}`);
    
    // In production, integrate with services like:
    // - Jumio for document verification
    // - LexisNexis for identity verification
    // - Thomson Reuters for sanctions screening
  }
}
