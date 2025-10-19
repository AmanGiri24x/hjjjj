import axios from 'axios';
import { CreditApplicant } from '../services/federatedGraphCreditScoring';

// Test utility for the Federated Graph Credit Scoring API
class CreditScoringAPITester {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = 'http://localhost:5000/api/v1') {
    this.baseURL = baseURL;
  }

  // Mock authentication (in real scenario, you'd get this from login)
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  // Create sample credit applicant data
  createSampleApplicant(id: string = 'test_001'): CreditApplicant {
    return {
      id,
      personalInfo: {
        age: 35,
        income: 75000,
        employmentYears: 8,
        education: 'Bachelor\'s Degree'
      },
      financialHistory: {
        creditScore: 720,
        loanHistory: [
          {
            amount: 25000,
            duration: 36,
            status: 'paid',
            timestamp: new Date('2022-01-15')
          },
          {
            amount: 15000,
            duration: 24,
            status: 'current',
            timestamp: new Date('2023-06-01')
          }
        ],
        paymentBehavior: [
          {
            onTimePayments: 24,
            latePayments: 2,
            averageDelay: 3
          }
        ]
      },
      graphConnections: {
        socialConnections: ['friend_001', 'friend_002', 'colleague_001'],
        businessConnections: ['business_partner_001', 'supplier_001'],
        guarantorRelations: ['guarantor_001']
      }
    };
  }

  // Test single credit assessment
  async testSingleAssessment(): Promise<void> {
    try {
      console.log('🧪 Testing Single Credit Assessment...');
      
      const applicant = this.createSampleApplicant();
      
      const response = await axios.post(
        `${this.baseURL}/credit-scoring/assess`,
        applicant,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
          }
        }
      );

      console.log('✅ Single Assessment Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error: any) {
      console.error('❌ Single Assessment Failed:');
      console.error(error.response?.data || error.message);
    }
  }

  // Test batch assessment
  async testBatchAssessment(): Promise<void> {
    try {
      console.log('🧪 Testing Batch Credit Assessment...');
      
      const applicants = [
        this.createSampleApplicant('batch_001'),
        this.createSampleApplicant('batch_002'),
        {
          ...this.createSampleApplicant('batch_003'),
          personalInfo: {
            age: 28,
            income: 45000,
            employmentYears: 3,
            education: 'High School'
          },
          financialHistory: {
            creditScore: 650,
            loanHistory: [],
            paymentBehavior: []
          }
        }
      ];
      
      const response = await axios.post(
        `${this.baseURL}/credit-scoring/batch-assess`,
        { applicants },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
          }
        }
      );

      console.log('✅ Batch Assessment Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error: any) {
      console.error('❌ Batch Assessment Failed:');
      console.error(error.response?.data || error.message);
    }
  }

  // Test privacy metrics
  async testPrivacyMetrics(): Promise<void> {
    try {
      console.log('🧪 Testing Privacy Metrics...');
      
      const response = await axios.get(
        `${this.baseURL}/credit-scoring/privacy-metrics`,
        {
          headers: {
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
          }
        }
      );

      console.log('✅ Privacy Metrics Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error: any) {
      console.error('❌ Privacy Metrics Failed:');
      console.error(error.response?.data || error.message);
    }
  }

  // Test system health
  async testSystemHealth(): Promise<void> {
    try {
      console.log('🧪 Testing System Health...');
      
      const response = await axios.get(
        `${this.baseURL}/credit-scoring/health`,
        {
          headers: {
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
          }
        }
      );

      console.log('✅ System Health Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error: any) {
      console.error('❌ System Health Failed:');
      console.error(error.response?.data || error.message);
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Federated Graph Credit Scoring API Tests...\n');
    
    await this.testSystemHealth();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await this.testPrivacyMetrics();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await this.testSingleAssessment();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await this.testBatchAssessment();
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('🏁 All tests completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new CreditScoringAPITester();
  
  // Note: In a real scenario, you'd authenticate first
  // tester.setAuthToken('your_jwt_token_here');
  
  tester.runAllTests().catch(console.error);
}

export default CreditScoringAPITester;
