# Federated Graph Neural Networks for Credit Scoring

## 🧠 Overview

This implementation represents a novel approach to credit risk assessment that combines three cutting-edge technologies:

1. **Federated Learning** - Privacy-preserving collaborative machine learning
2. **Graph Neural Networks** - Advanced network analysis for relationship modeling
3. **Explainable AI** - Transparent and interpretable decision making

## 🎯 Research Significance

This system addresses critical gaps in financial technology:

- **Privacy Preservation**: Enables banks to collaborate on credit models without sharing sensitive customer data
- **Network Effects**: Captures complex relationships between applicants, guarantors, and business connections
- **Regulatory Compliance**: Provides explainable decisions required by financial regulations
- **Cross-Institutional Learning**: Improves model accuracy through federated collaboration

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bank A        │    │   Bank B        │    │   Bank C        │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Local Graph  │ │    │ │Local Graph  │ │    │ │Local Graph  │ │
│ │   GNN       │ │    │ │   GNN       │ │    │ │   GNN       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │    │        │        │
└────────┼────────┘    └────────┼────────┘    └────────┼────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌─────────────────┐
                    │ Federated       │
                    │ Aggregation     │
                    │ Server          │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │Global Model │ │
                    │ │Privacy      │ │
                    │ │Engine       │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## 🔬 Technical Components

### 1. Graph Neural Network (GNN)

**Purpose**: Captures complex relationships in financial networks

**How it works**:
- Creates graph representation of applicants and their connections
- Uses message passing to aggregate information from neighbors
- Generates embeddings that capture network effects

```typescript
// Node types in the graph
interface GraphNode {
  id: string
  nodeType: 'applicant' | 'guarantor' | 'business' | 'bank'
  features: number[]        // Financial features
  embeddings?: number[]     // Learned representations
}

// Relationships between nodes
interface GraphEdge {
  source: string
  target: string
  edgeType: 'guarantee' | 'business_relation' | 'social_connection'
  weight: number           // Relationship strength
  timestamp: Date
}
```

**GNN Process**:
1. **Node Initialization**: Convert applicant data to feature vectors
2. **Message Passing**: Aggregate information from connected nodes
3. **Neural Transformation**: Apply learned transformations to embeddings
4. **Multi-layer Processing**: Repeat for multiple GNN layers

### 2. Federated Learning

**Purpose**: Enable collaborative learning while preserving privacy

**Key Features**:
- **Local Training**: Each bank trains on their own data
- **Gradient Sharing**: Only model updates are shared, not raw data
- **Differential Privacy**: Mathematical privacy guarantees
- **Secure Aggregation**: Encrypted communication between participants

**Federated Process**:
```
1. Initialize Global Model
2. For each federated round:
   a. Distribute global model to all banks
   b. Each bank trains locally on their graph data
   c. Compute local gradients with differential privacy
   d. Send encrypted gradients to aggregation server
   e. Server aggregates gradients and updates global model
   f. Repeat until convergence
```

### 3. Differential Privacy

**Purpose**: Provide mathematical guarantees that individual data cannot be inferred

**Implementation**:
- **Laplace Mechanism**: Adds calibrated noise to gradients
- **Privacy Budget (ε)**: Controls privacy-utility tradeoff
- **Composition Tracking**: Monitors cumulative privacy loss

```typescript
// Privacy parameters
interface PrivacyMetrics {
  differentialPrivacyEpsilon: number    // Privacy budget (lower = more private)
  informationLeakage: number           // Estimated data exposure
  membershipInferenceRisk: number      // Risk of identifying participants
  reconstructionError: number          // Model accuracy impact
}
```

### 4. Explainable AI

**Purpose**: Provide transparent, interpretable credit decisions

**Explanation Methods**:
- **Node Importance**: Which connections most influence the decision
- **Edge Importance**: Which relationships are most significant
- **Feature Importance**: Which applicant attributes matter most
- **Local Explanations**: Decision reasoning for individual cases
- **Global Patterns**: Overall model behavior insights

## 🚀 How to Use the System

### Backend API Endpoints

#### 1. Single Credit Assessment
```bash
POST /api/v1/credit-scoring/assess
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "id": "applicant_001",
  "personalInfo": {
    "age": 35,
    "income": 75000,
    "employmentYears": 8,
    "education": "Bachelor's Degree"
  },
  "financialHistory": {
    "creditScore": 720,
    "loanHistory": [
      {
        "amount": 25000,
        "duration": 36,
        "status": "paid",
        "timestamp": "2022-01-15T00:00:00.000Z"
      }
    ],
    "paymentBehavior": [
      {
        "onTimePayments": 24,
        "latePayments": 2,
        "averageDelay": 3
      }
    ]
  },
  "graphConnections": {
    "socialConnections": ["friend_001", "colleague_001"],
    "businessConnections": ["partner_001"],
    "guarantorRelations": ["guarantor_001"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Credit risk assessment completed successfully",
  "data": {
    "applicantId": "applicant_001",
    "creditScore": 0.23,
    "confidence": 0.87,
    "riskLevel": "LOW_RISK",
    "explanation": {
      "local": "Credit Risk: LOW (23.0%). Key factors: income (40.2%), creditScore (35.1%), employmentYears (18.7%). Graph analysis shows 4 connected entities influencing the decision.",
      "global": "Network analysis reveals 4 connected entities with average influence of 15.3%. Connection strength averages 62.5%.",
      "nodeImportance": {
        "guarantor_001": 0.45,
        "partner_001": 0.32,
        "friend_001": 0.18
      },
      "edgeImportance": {
        "applicant_001-guarantor_001": 1.0,
        "applicant_001-partner_001": 0.8
      },
      "featureImportance": {
        "income": 0.402,
        "creditScore": 0.351,
        "employmentYears": 0.187
      }
    },
    "timestamp": "2025-09-15T08:28:18.000Z"
  }
}
```

#### 2. Batch Assessment
```bash
POST /api/v1/credit-scoring/batch-assess
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "applicants": [
    { /* applicant 1 data */ },
    { /* applicant 2 data */ },
    { /* up to 50 applicants */ }
  ]
}
```

#### 3. Privacy Metrics
```bash
GET /api/v1/credit-scoring/privacy-metrics
Authorization: Bearer <your-jwt-token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "differentialPrivacyEpsilon": 0.1,
      "informationLeakage": 0.023,
      "membershipInferenceRisk": 0.045,
      "reconstructionError": 0.087
    }
  }
}
```

#### 4. System Health
```bash
GET /api/v1/credit-scoring/health
Authorization: Bearer <your-jwt-token>
```

### Frontend Usage

#### 1. Access the Interface
Navigate to `/dashboard/credit-scoring` in your DhanAillytics application.

#### 2. Credit Assessment Form
- Fill in applicant personal information
- Add financial history and loan records
- Define network connections (social, business, guarantors)
- Submit for AI analysis

#### 3. View Results
- **List View**: Overview of all assessments
- **Detailed View**: In-depth analysis with explanations
- **Privacy Metrics**: Monitor system privacy
- **System Health**: Check component status

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
FEDERATED_LEARNING_ENABLED=true
PRIVACY_EPSILON=0.1
GNN_EMBEDDING_DIM=128
GNN_LAYERS=3
AGGREGATION_SERVER_URL=https://federated-server.example.com
```

### Model Parameters
```typescript
// Configurable in federatedGraphCreditScoring.ts
const CONFIG = {
  embeddingDimension: 128,    // GNN embedding size
  gnnLayers: 3,              // Number of GNN layers
  privacyEpsilon: 0.1,       // Differential privacy budget
  learningRate: 0.001,       // Model training rate
  batchSize: 32,             // Training batch size
  federatedRounds: 100       // Number of federated rounds
}
```

## 📊 Understanding the Results

### Credit Score Interpretation
- **0.0 - 0.3**: Low Risk (Good creditworthiness)
- **0.4 - 0.6**: Medium Risk (Moderate creditworthiness)
- **0.7 - 1.0**: High Risk (Poor creditworthiness)

### Confidence Score
- **> 0.8**: High confidence in prediction
- **0.6 - 0.8**: Moderate confidence
- **< 0.6**: Low confidence (may need more data)

### Privacy Metrics
- **Epsilon (ε) < 0.1**: Excellent privacy protection
- **Epsilon 0.1 - 0.5**: Good privacy protection
- **Epsilon > 1.0**: Weak privacy protection

### Node Importance
Shows which connected entities (guarantors, business partners, etc.) most influence the credit decision.

### Feature Importance
Indicates which applicant attributes (income, credit score, employment) are most significant for the decision.

## 🔬 Research Applications

### Academic Publications
This implementation can support research in:
- **Federated Learning in Finance**
- **Graph Neural Networks for Credit Scoring**
- **Privacy-Preserving Machine Learning**
- **Explainable AI in Financial Services**

### Conference Submissions
Suitable for venues like:
- **NeurIPS** (Neural Information Processing Systems)
- **ICML** (International Conference on Machine Learning)
- **KDD** (Knowledge Discovery and Data Mining)
- **WWW** (World Wide Web Conference)
- **AAAI** (Association for the Advancement of Artificial Intelligence)

### Novel Contributions
1. **First implementation** combining federated learning + GNNs for credit scoring
2. **Privacy-preserving** cross-bank collaboration
3. **Explainable decisions** meeting regulatory requirements
4. **Real-world applicable** system with production-ready code

## 🛡️ Security Considerations

### Data Protection
- No raw customer data leaves individual banks
- All communications encrypted with TLS
- Differential privacy provides mathematical guarantees
- Secure multi-party computation for aggregation

### Compliance
- **GDPR**: Right to explanation through explainable AI
- **PCI DSS**: Secure handling of financial data
- **Basel III**: Risk assessment compliance
- **Fair Credit Reporting Act**: Transparent decision making

## 🚀 Deployment

### Development
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev

# Access at http://localhost:3000/dashboard/credit-scoring
```

### Production
```bash
# Build and deploy with Docker
docker-compose up -d

# Or deploy to cloud platforms
npm run build
npm run deploy
```

## 🤝 Contributing

### Adding New Features
1. Extend the `FederatedGraphCreditScoring` class
2. Add new API endpoints in `creditScoringController.ts`
3. Create corresponding frontend components
4. Update documentation

### Research Extensions
- **Quantum-Enhanced GNNs**: Integrate quantum computing
- **Multi-Modal Learning**: Add text/image data
- **Dynamic Graphs**: Handle time-evolving networks
- **Advanced Privacy**: Implement homomorphic encryption

## 📚 References

### Academic Papers
1. "Federated Learning: Challenges, Methods, and Future Directions" (Li et al., 2020)
2. "Graph Neural Networks: A Review of Methods and Applications" (Zhou et al., 2020)
3. "The Algorithmic Foundations of Differential Privacy" (Dwork & Roth, 2014)
4. "Explainable Artificial Intelligence (XAI): Concepts, Taxonomies, Opportunities and Challenges" (Arrieta et al., 2020)

### Technical Resources
- [Federated Learning Documentation](https://federated.withgoogle.com/)
- [PyTorch Geometric (GNN Library)](https://pytorch-geometric.readthedocs.io/)
- [Differential Privacy Library](https://github.com/google/differential-privacy)
- [SHAP (Explainable AI)](https://shap.readthedocs.io/)

## 📞 Support

For questions or issues:
1. Check the API documentation at `/api/v1/docs`
2. Review system health at `/dashboard/credit-scoring` → Health tab
3. Monitor privacy metrics for compliance
4. Contact the development team for advanced configurations

---

**Built with ❤️ for the future of privacy-preserving financial AI**
