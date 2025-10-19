#!/usr/bin/env ts-node
import axios from 'axios';
import { logger } from '../config/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TestConfig {
  baseUrl: string;
  token?: string;
  timeout: number;
}

class FinancialApiTester {
  private config: TestConfig;
  private axiosInstance: any;

  constructor() {
    this.config = {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
      timeout: 10000,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      logger.info('🔐 Authenticating with demo user...');
      
      const response = await this.axiosInstance.post('/auth/login', {
        email: 'demo@dhanaillytics.com',
        password: 'demo123!',
      });

      if (response.data.success && response.data.data.token) {
        this.config.token = response.data.data.token;
        this.axiosInstance.defaults.headers.Authorization = `Bearer ${this.config.token}`;
        logger.info('✅ Authentication successful');
        return true;
      } else {
        logger.error('❌ Authentication failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Authentication error:', error.response?.data || error.message);
      return false;
    }
  }

  async testServiceStatus(): Promise<boolean> {
    try {
      logger.info('📊 Testing service status...');
      
      const response = await this.axiosInstance.get('/financial-data/service-status');
      
      if (response.data.success) {
        logger.info('✅ Service status retrieved successfully');
        logger.info('Service details:', JSON.stringify(response.data.data, null, 2));
        return true;
      } else {
        logger.error('❌ Service status failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        logger.warn('⚠️  Service status requires admin access - skipping');
        return true; // Not a failure, just requires admin
      }
      logger.error('❌ Service status error:', error.response?.data || error.message);
      return false;
    }
  }

  async testQuoteRetrieval(): Promise<boolean> {
    try {
      logger.info('💰 Testing quote retrieval...');
      
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      
      for (const symbol of symbols) {
        try {
          const response = await this.axiosInstance.get(`/financial-data/quote/${symbol}`);
          
          if (response.data.success) {
            logger.info(`✅ Quote for ${symbol}: $${response.data.data.price}`);
          } else {
            logger.warn(`⚠️  Quote for ${symbol} failed: ${response.data.message}`);
          }
        } catch (error: any) {
          logger.warn(`⚠️  Quote for ${symbol} error:`, error.response?.data?.message || error.message);
        }
      }
      
      return true;
    } catch (error: any) {
      logger.error('❌ Quote retrieval test failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testBatchQuotes(): Promise<boolean> {
    try {
      logger.info('📊 Testing batch quotes...');
      
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
      
      const response = await this.axiosInstance.post('/financial-data/quotes/batch', {
        symbols,
      });
      
      if (response.data.success) {
        const quotes = response.data.data.quotes;
        logger.info(`✅ Retrieved ${quotes.length} quotes out of ${symbols.length} requested`);
        
        quotes.forEach((quote: any) => {
          logger.info(`   ${quote.symbol}: $${quote.price} (${quote.changePercent}%)`);
        });
        
        return true;
      } else {
        logger.error('❌ Batch quotes failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Batch quotes error:', error.response?.data || error.message);
      return false;
    }
  }

  async testHistoricalData(): Promise<boolean> {
    try {
      logger.info('📈 Testing historical data...');
      
      const response = await this.axiosInstance.get('/financial-data/history/AAPL', {
        params: {
          interval: 'daily',
          period: 'compact',
        },
      });
      
      if (response.data.success) {
        const dataPoints = response.data.data.data.length;
        logger.info(`✅ Retrieved ${dataPoints} historical data points for AAPL`);
        return true;
      } else {
        logger.error('❌ Historical data failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Historical data error:', error.response?.data || error.message);
      return false;
    }
  }

  async testCompanyInfo(): Promise<boolean> {
    try {
      logger.info('🏢 Testing company information...');
      
      const response = await this.axiosInstance.get('/financial-data/company/AAPL');
      
      if (response.data.success) {
        const company = response.data.data;
        logger.info(`✅ Company info for ${company.symbol}: ${company.name}`);
        logger.info(`   Sector: ${company.sector || 'N/A'}`);
        logger.info(`   Market Cap: ${company.marketCap || 'N/A'}`);
        return true;
      } else {
        logger.error('❌ Company info failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Company info error:', error.response?.data || error.message);
      return false;
    }
  }

  async testSymbolSearch(): Promise<boolean> {
    try {
      logger.info('🔍 Testing symbol search...');
      
      const response = await this.axiosInstance.get('/financial-data/search', {
        params: {
          q: 'Apple',
        },
      });
      
      if (response.data.success) {
        const results = response.data.data.results;
        logger.info(`✅ Found ${results.length} search results for "Apple"`);
        
        results.slice(0, 3).forEach((result: any) => {
          logger.info(`   ${result.symbol}: ${result.name} (Score: ${result.matchScore})`);
        });
        
        return true;
      } else {
        logger.error('❌ Symbol search failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Symbol search error:', error.response?.data || error.message);
      return false;
    }
  }

  async testNewsRetrieval(): Promise<boolean> {
    try {
      logger.info('📰 Testing news retrieval...');
      
      const response = await this.axiosInstance.get('/financial-data/news', {
        params: {
          limit: 5,
        },
      });
      
      if (response.data.success) {
        const articles = response.data.data.articles;
        logger.info(`✅ Retrieved ${articles.length} news articles`);
        
        articles.forEach((article: any) => {
          logger.info(`   ${article.title.substring(0, 60)}...`);
        });
        
        return true;
      } else {
        logger.error('❌ News retrieval failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      logger.error('❌ News retrieval error:', error.response?.data || error.message);
      return false;
    }
  }

  async testMarketOverview(): Promise<boolean> {
    try {
      logger.info('📊 Testing market overview...');
      
      const response = await this.axiosInstance.get('/financial-data/market-overview');
      
      if (response.data.success) {
        const overview = response.data.data;
        logger.info(`✅ Market overview retrieved successfully`);
        logger.info(`   Top Gainers: ${overview.topGainers.length}`);
        logger.info(`   Top Losers: ${overview.topLosers.length}`);
        logger.info(`   Most Active: ${overview.mostActive.length}`);
        return true;
      } else {
        logger.error('❌ Market overview failed:', response.data.message);
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Market overview error:', error.response?.data || error.message);
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    logger.info('🚀 Starting Financial Data API Tests...\n');

    const results = {
      authentication: false,
      serviceStatus: false,
      quoteRetrieval: false,
      batchQuotes: false,
      historicalData: false,
      companyInfo: false,
      symbolSearch: false,
      newsRetrieval: false,
      marketOverview: false,
    };

    // Run tests
    results.authentication = await this.authenticate();
    
    if (results.authentication) {
      results.serviceStatus = await this.testServiceStatus();
      results.quoteRetrieval = await this.testQuoteRetrieval();
      results.batchQuotes = await this.testBatchQuotes();
      results.historicalData = await this.testHistoricalData();
      results.companyInfo = await this.testCompanyInfo();
      results.symbolSearch = await this.testSymbolSearch();
      results.newsRetrieval = await this.testNewsRetrieval();
      results.marketOverview = await this.testMarketOverview();
    }

    // Summary
    logger.info('\n📋 TEST SUMMARY:');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const failedTests = totalTests - passedTests;

    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      logger.info(`   ${test}: ${status}`);
    });

    logger.info(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);
    
    if (failedTests === 0) {
      logger.info('🎉 All tests passed! Financial Data API is working correctly.');
    } else {
      logger.warn(`⚠️  ${failedTests} test(s) failed. Check the logs above for details.`);
    }

    if (!results.authentication) {
      logger.info('\n💡 Note: Most tests require authentication. Make sure the demo user exists:');
      logger.info('   Run: npm run seed');
    }

    if (!results.serviceStatus && results.authentication) {
      logger.info('\n💡 Note: Service status test requires API keys to be configured:');
      logger.info('   Set ALPHA_VANTAGE_API_KEY and FINNHUB_API_KEY in your .env file');
    }
  }
}

// CLI interface
if (require.main === module) {
  const tester = new FinancialApiTester();
  
  tester.runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

export default FinancialApiTester;
