import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { KycService, KycSubmissionDto } from './kyc.service';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit KYC information and documents' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documents', 10))
  async submitKyc(
    @Request() req: any,
    @Body() kycData: KycSubmissionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user.id;

    // Organize files by field name
    const documents = {
      idFrontImage: files.find(f => f.fieldname === 'idFrontImage'),
      idBackImage: files.find(f => f.fieldname === 'idBackImage'),
      selfieImage: files.find(f => f.fieldname === 'selfieImage'),
      addressProofImage: files.find(f => f.fieldname === 'addressProofImage'),
    };

    return this.kycService.submitKyc(userId, kycData, documents);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get KYC verification status' })
  async getKycStatus(@Request() req: any) {
    const userId = req.user.id;
    return this.kycService.getKycStatus(userId);
  }

  @Put('review/:kycId')
  @ApiOperation({ summary: 'Review KYC submission (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'compliance')
  async reviewKyc(
    @Param('kycId') kycId: string,
    @Request() req: any,
    @Body() reviewData: { decision: 'APPROVED' | 'REJECTED'; notes?: string },
  ) {
    const reviewerId = req.user.id;
    return this.kycService.reviewKyc(
      kycId,
      reviewerId,
      reviewData.decision,
      reviewData.notes,
    );
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending KYC submissions (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'compliance')
  async getPendingKyc() {
    // Implementation for getting pending KYC submissions
    return { message: 'Pending KYC submissions endpoint' };
  }
}
