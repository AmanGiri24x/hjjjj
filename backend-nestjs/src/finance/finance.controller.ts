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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinanceService } from './finance.service';
import { TransactionService, CreateTransactionDto } from './transaction.service';
import { BudgetService } from './budget.service';
import { GoalService } from './goal.service';

@ApiTags('Finance')
@Controller('finance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(
    private financeService: FinanceService,
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private goalService: GoalService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get financial overview' })
  @ApiResponse({ status: 200, description: 'Financial overview data' })
  async getFinancialOverview(
    @Request() req: any,
    @Query('period') period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ) {
    const overview = await this.financeService.getFinancialOverview(req.user.sub, period);
    return {
      success: true,
      data: overview,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get AI-powered financial insights' })
  @ApiResponse({ status: 200, description: 'Financial insights and recommendations' })
  async getFinancialInsights(@Request() req: any) {
    const insights = await this.financeService.generateFinancialInsights(req.user.sub);
    return {
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health-score')
  @ApiOperation({ summary: 'Get financial health score' })
  @ApiResponse({ status: 200, description: 'Financial health score and breakdown' })
  async getFinancialHealthScore(@Request() req: any) {
    const healthScore = await this.financeService.getFinancialHealthScore(req.user.sub);
    return {
      success: true,
      data: healthScore,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async getTransactions(
    @Request() req: any,
    @Query('period') period: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    @Query('category') category?: string,
    @Query('type') type?: 'INCOME' | 'EXPENSE',
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0'
  ) {
    const transactions = await this.transactionService.getUserTransactions(
      req.user.sub,
      period,
      category,
      type,
      parseInt(limit),
      parseInt(offset)
    );

    return {
      success: true,
      data: transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: transactions.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  async createTransaction(@Request() req: any, @Body() data: CreateTransactionDto) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const transaction = await this.transactionService.createTransaction(req.user.sub, data, ipAddress);

    return {
      success: true,
      data: transaction,
      message: 'Transaction created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('transactions/:id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  async updateTransaction(
    @Request() req: any,
    @Param('id') transactionId: string,
    @Body() data: Partial<CreateTransactionDto>
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const transaction = await this.transactionService.updateTransaction(
      req.user.sub,
      transactionId,
      data,
      ipAddress
    );

    return {
      success: true,
      data: transaction,
      message: 'Transaction updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  async deleteTransaction(@Request() req: any, @Param('id') transactionId: string) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await this.transactionService.deleteTransaction(req.user.sub, transactionId, ipAddress);

    return {
      success: true,
      message: 'Transaction deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('transactions/analytics')
  @ApiOperation({ summary: 'Get transaction analytics' })
  @ApiResponse({ status: 200, description: 'Transaction analytics data' })
  async getTransactionAnalytics(
    @Request() req: any,
    @Query('period') period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ) {
    const analytics = await this.transactionService.getTransactionAnalytics(req.user.sub, period);

    return {
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('transactions/import')
  @ApiOperation({ summary: 'Import transactions from CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Transactions imported successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async importTransactions(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('CSV file is required', HttpStatus.BAD_REQUEST);
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new HttpException('Only CSV files are allowed', HttpStatus.BAD_REQUEST);
    }

    const csvData = file.buffer.toString('utf-8');
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    const result = await this.transactionService.importTransactions(req.user.sub, csvData, ipAddress);

    return {
      success: true,
      data: result,
      message: `Import completed: ${result.imported} successful, ${result.failed} failed`,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('transactions/recurring')
  @ApiOperation({ summary: 'Get recurring transactions' })
  @ApiResponse({ status: 200, description: 'List of recurring transactions' })
  async getRecurringTransactions(@Request() req: any) {
    const transactions = await this.transactionService.getRecurringTransactions(req.user.sub);

    return {
      success: true,
      data: transactions,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('budgets')
  @ApiOperation({ summary: 'Get user budgets' })
  @ApiResponse({ status: 200, description: 'List of budgets' })
  async getBudgets(@Request() req: any) {
    const budgets = await this.budgetService.getUserBudgets(req.user.sub);

    return {
      success: true,
      data: budgets,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('budgets')
  @ApiOperation({ summary: 'Create new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  async createBudget(@Request() req: any, @Body() data: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const budget = await this.budgetService.createBudget(req.user.sub, data, ipAddress);

    return {
      success: true,
      data: budget,
      message: 'Budget created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get user financial goals' })
  @ApiResponse({ status: 200, description: 'List of financial goals' })
  async getGoals(@Request() req: any) {
    const goals = await this.goalService.getUserGoals(req.user.sub);

    return {
      success: true,
      data: goals,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create new financial goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async createGoal(@Request() req: any, @Body() data: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const goal = await this.goalService.createGoal(req.user.sub, data, ipAddress);

    return {
      success: true,
      data: goal,
      message: 'Goal created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export financial data' })
  @ApiResponse({ status: 200, description: 'Financial data export' })
  async exportFinancialData(
    @Request() req: any,
    @Query('format') format: 'csv' | 'json' | 'pdf' = 'csv'
  ) {
    const exportData = await this.financeService.exportFinancialData(req.user.sub, format);

    return {
      success: true,
      data: exportData,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('validate-data')
  @ApiOperation({ summary: 'Validate financial data integrity' })
  @ApiResponse({ status: 200, description: 'Data validation results' })
  async validateDataIntegrity(@Request() req: any) {
    const validation = await this.financeService.validateDataIntegrity(req.user.sub);

    return {
      success: true,
      data: validation,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get available transaction categories' })
  @ApiResponse({ status: 200, description: 'List of transaction categories' })
  async getCategories() {
    const categories = [
      { id: 'housing', name: 'Housing', subcategories: ['Rent', 'Mortgage', 'Utilities', 'Maintenance'] },
      { id: 'transportation', name: 'Transportation', subcategories: ['Gas', 'Public Transit', 'Car Payment', 'Insurance'] },
      { id: 'food', name: 'Food', subcategories: ['Groceries', 'Dining Out', 'Coffee', 'Delivery'] },
      { id: 'shopping', name: 'Shopping', subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Personal Care'] },
      { id: 'entertainment', name: 'Entertainment', subcategories: ['Movies', 'Streaming', 'Games', 'Events'] },
      { id: 'healthcare', name: 'Healthcare', subcategories: ['Doctor', 'Pharmacy', 'Insurance', 'Dental'] },
      { id: 'education', name: 'Education', subcategories: ['Tuition', 'Books', 'Courses', 'Training'] },
      { id: 'travel', name: 'Travel', subcategories: ['Flights', 'Hotels', 'Vacation', 'Business Travel'] },
      { id: 'income', name: 'Income', subcategories: ['Salary', 'Freelance', 'Investment', 'Other Income'] },
      { id: 'investment', name: 'Investment', subcategories: ['Stocks', 'Bonds', 'Retirement', 'Real Estate'] },
      { id: 'other', name: 'Other', subcategories: ['Miscellaneous', 'Gifts', 'Donations', 'Fees'] },
    ];

    return {
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get user financial accounts' })
  @ApiResponse({ status: 200, description: 'List of financial accounts' })
  async getAccounts(@Request() req: any) {
    // This would typically come from a connected accounts service
    const accounts = [
      { id: '1', name: 'Primary Checking', type: 'checking', balance: 15420.30, currency: 'USD' },
      { id: '2', name: 'High Yield Savings', type: 'savings', balance: 32750.00, currency: 'USD' },
      { id: '3', name: 'Investment Portfolio', type: 'investment', balance: 45200.00, currency: 'USD' },
      { id: '4', name: 'Credit Card', type: 'credit', balance: -2173.20, currency: 'USD' },
    ];

    return {
      success: true,
      data: accounts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dashboard-data')
  @ApiOperation({ summary: 'Get comprehensive dashboard data' })
  @ApiResponse({ status: 200, description: 'Complete dashboard data' })
  async getDashboardData(@Request() req: any) {
    const [overview, insights, healthScore, recentTransactions] = await Promise.all([
      this.financeService.getFinancialOverview(req.user.sub),
      this.financeService.generateFinancialInsights(req.user.sub),
      this.financeService.getFinancialHealthScore(req.user.sub),
      this.transactionService.getUserTransactions(req.user.sub, 'monthly', undefined, undefined, 10),
    ]);

    return {
      success: true,
      data: {
        overview,
        insights,
        healthScore,
        recentTransactions,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
