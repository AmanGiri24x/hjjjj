# DhanAillytics Setup Requirements

## 🛠 System Requirements & Installation Guide

This document provides comprehensive setup requirements and installation instructions for the DhanAillytics platform.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Environment](#development-environment)
3. [Production Environment](#production-environment)
4. [Database Setup](#database-setup)
5. [External Services](#external-services)
6. [Environment Variables](#environment-variables)
7. [Installation Steps](#installation-steps)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

---

## 💻 System Requirements

### Minimum Hardware Requirements

#### Development Environment
- **CPU**: 4 cores, 2.5 GHz
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
- **Network**: Broadband internet connection

#### Production Environment
- **CPU**: 8 cores, 3.0 GHz (per instance)
- **RAM**: 32 GB (per instance)
- **Storage**: 500 GB SSD (with backup)
- **Network**: High-speed internet with redundancy

### Operating System Support
- **Linux**: Ubuntu 20.04+, CentOS 8+, RHEL 8+
- **macOS**: 11.0+ (Big Sur)
- **Windows**: Windows 10/11 with WSL2

### Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

---

## 🔧 Development Environment

### Required Software

#### Node.js & npm
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v18.x.x
npm --version   # Should be 8.x.x
```

#### PostgreSQL Database
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows (using Chocolatey)
choco install postgresql
```

#### Redis Cache
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis
brew services start redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

#### Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Python 3.11+
```bash
# Ubuntu/Debian
sudo apt install python3.11 python3.11-pip python3.11-venv

# macOS
brew install python@3.11

# Windows
# Download from https://www.python.org/downloads/
```

#### Git Version Control
```bash
# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# Windows
# Download from https://git-scm.com/download/win
```

### Development Tools

#### Code Editors
- **VS Code**: Recommended with extensions
  - TypeScript and JavaScript Language Features
  - Prisma
  - ESLint
  - Prettier
  - Docker
  - Python

#### Database Tools
- **pgAdmin 4**: PostgreSQL administration
- **Redis Desktop Manager**: Redis GUI client
- **Prisma Studio**: Database browser

#### API Testing
- **Postman**: API testing and documentation
- **Insomnia**: Alternative API client
- **Thunder Client**: VS Code extension

---

## 🏭 Production Environment

### Infrastructure Requirements

#### Application Servers
- **Kubernetes Cluster**: 3+ nodes
- **Load Balancer**: NGINX or AWS ALB
- **Container Registry**: Docker Hub or AWS ECR
- **Orchestration**: Kubernetes or Docker Swarm

#### Database Infrastructure
- **Primary Database**: PostgreSQL 14+ with replication
- **Cache Layer**: Redis Cluster
- **Backup Solution**: Automated daily backups
- **Monitoring**: Database performance monitoring

#### Security Infrastructure
- **SSL/TLS Certificates**: Let's Encrypt or commercial
- **Web Application Firewall**: CloudFlare or AWS WAF
- **VPN Access**: Secure admin access
- **Secrets Management**: HashiCorp Vault or AWS Secrets Manager

### Cloud Provider Options

#### AWS (Recommended)
- **Compute**: EKS (Kubernetes) or ECS
- **Database**: RDS PostgreSQL with Multi-AZ
- **Cache**: ElastiCache Redis
- **Storage**: S3 for file storage
- **CDN**: CloudFront
- **Monitoring**: CloudWatch

#### Google Cloud Platform
- **Compute**: GKE (Kubernetes)
- **Database**: Cloud SQL PostgreSQL
- **Cache**: Memorystore Redis
- **Storage**: Cloud Storage
- **CDN**: Cloud CDN
- **Monitoring**: Cloud Monitoring

#### Microsoft Azure
- **Compute**: AKS (Kubernetes)
- **Database**: Azure Database for PostgreSQL
- **Cache**: Azure Cache for Redis
- **Storage**: Blob Storage
- **CDN**: Azure CDN
- **Monitoring**: Azure Monitor

---

## 🗄 Database Setup

### PostgreSQL Configuration

#### Installation & Initial Setup
```bash
# Create database user
sudo -u postgres createuser --interactive dhanai_user

# Create databases
sudo -u postgres createdb dhanaillytics_dev
sudo -u postgres createdb dhanaillytics_test
sudo -u postgres createdb dhanaillytics_prod

# Set password
sudo -u postgres psql
ALTER USER dhanai_user PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE dhanaillytics_dev TO dhanai_user;
GRANT ALL PRIVILEGES ON DATABASE dhanaillytics_test TO dhanai_user;
GRANT ALL PRIVILEGES ON DATABASE dhanaillytics_prod TO dhanai_user;
```

#### Performance Tuning
```sql
-- postgresql.conf optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Backup Configuration
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U dhanai_user -h localhost dhanaillytics_prod > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Redis Configuration

#### Installation & Setup
```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Key configurations
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### Security Configuration
```bash
# Set password
requirepass your_redis_password_here

# Bind to specific interface
bind 127.0.0.1

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
```

---

## 🌐 External Services

### Required Third-Party Services

#### Financial Data APIs
- **Alpha Vantage**: Stock market data
  - API Key required
  - Rate limits: 5 calls/minute (free), 500 calls/minute (premium)
  - Cost: Free tier available, premium from $49.99/month

- **IEX Cloud**: Financial data and market information
  - API Key required
  - Rate limits: 100 calls/day (free), unlimited (paid)
  - Cost: Free tier available, paid plans from $9/month

#### Payment Processing
- **Stripe**: Payment processing and billing
  - Account setup required
  - Webhook endpoints needed
  - PCI DSS compliance required
  - Cost: 2.9% + 30¢ per transaction

- **Razorpay** (Alternative): Payment processing for India
  - Account setup required
  - KYC verification needed
  - Cost: 2% per transaction

#### AI/ML Services
- **Google Gemini API**: Advanced AI capabilities
  - API Key required
  - Rate limits: Varies by plan
  - Cost: Pay-per-use pricing

- **OpenAI API** (Alternative): GPT models
  - API Key required
  - Rate limits: Varies by model
  - Cost: Token-based pricing

#### Authentication Services
- **Auth0** (Optional): Identity management
  - Account setup required
  - Social login providers
  - Cost: Free for up to 7,000 active users

#### KYC/AML Services
- **Jumio**: Identity verification
  - Account setup and integration
  - Document verification API
  - Cost: Per verification pricing

- **Onfido** (Alternative): Identity verification
  - Account setup required
  - Real-time verification
  - Cost: Per check pricing

#### Communication Services
- **Twilio**: SMS and voice communications
  - Account setup required
  - Phone number provisioning
  - Cost: Pay-per-use

- **SendGrid**: Email delivery service
  - Account setup required
  - Email templates and analytics
  - Cost: Free tier available

#### Monitoring & Analytics
- **Sentry**: Error tracking and performance monitoring
  - Account setup required
  - SDK integration
  - Cost: Free tier available

- **New Relic**: Application performance monitoring
  - Account setup required
  - Agent installation
  - Cost: Free tier available

---

## 🔐 Environment Variables

### Backend Environment Variables (.env)

```bash
# Database Configuration
DATABASE_URL="postgresql://dhanai_user:password@localhost:5432/dhanaillytics_dev"
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-here"
REFRESH_TOKEN_EXPIRES_IN="30d"

# API Keys
GEMINI_API_KEY="your-gemini-api-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
IEX_CLOUD_API_KEY="your-iex-cloud-key"

# Payment Processing
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# External Services
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
SENDGRID_API_KEY="your_sendgrid_api_key"

# KYC Services
JUMIO_API_TOKEN="your_jumio_api_token"
JUMIO_API_SECRET="your_jumio_api_secret"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"
CORS_ORIGIN="http://localhost:3000,https://app.dhanaillytics.com"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# Monitoring
SENTRY_DSN="your_sentry_dsn"
NEW_RELIC_LICENSE_KEY="your_new_relic_key"

# File Storage
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET="dhanaillytics-documents"
AWS_REGION="us-east-1"

# Environment
NODE_ENV="development"
PORT="5000"
LOG_LEVEL="debug"
```

### Frontend Environment Variables (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_WS_URL="ws://localhost:5000"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Payment Processing (Public Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_public_key"

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"

# Feature Flags
NEXT_PUBLIC_ENABLE_FINNY_AI="true"
NEXT_PUBLIC_ENABLE_EXPERT_CONSULTATION="true"
NEXT_PUBLIC_ENABLE_REVOLUTIONARY_FEATURES="true"

# Environment
NEXT_PUBLIC_ENV="development"
```

### Python Services Environment Variables

```bash
# API Configuration
FASTAPI_HOST="0.0.0.0"
FASTAPI_PORT="8001"

# Database
DATABASE_URL="postgresql://dhanai_user:password@localhost:5432/dhanaillytics_dev"

# ML Models
MODEL_PATH="/app/models"
HUGGINGFACE_API_KEY="your_huggingface_key"

# External APIs
ALPHA_VANTAGE_API_KEY="your_alpha_vantage_key"
GEMINI_API_KEY="your_gemini_api_key"

# Monitoring
SENTRY_DSN="your_sentry_dsn"
LOG_LEVEL="INFO"
```

---

## 📦 Installation Steps

### Step 1: Repository Setup

```bash
# Clone repository
git clone https://github.com/your-org/DhanAillytics.git
cd DhanAillytics

# Create environment files
cp backend-nestjs/.env.example backend-nestjs/.env
cp frontend/.env.example frontend/.env.local
cp python-services/.env.example python-services/.env

# Edit environment files with your configuration
nano backend-nestjs/.env
nano frontend/.env.local
nano python-services/.env
```

### Step 2: Database Setup

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d postgres redis

# Wait for services to be ready
sleep 10

# Run database migrations
cd backend-nestjs
npm install
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### Step 3: Backend Setup

```bash
# Install dependencies
cd backend-nestjs
npm install

# Build the application
npm run build

# Start development server
npm run start:dev
```

### Step 4: Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Build the application
npm run build

# Start development server
npm run dev
```

### Step 5: Python Services Setup

```bash
# Create virtual environment
cd python-services
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Step 6: Verification

```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend
curl http://localhost:3000

# Check Python services
curl http://localhost:8001/health

# Run test suite
cd backend-nestjs && npm test
cd frontend && npm test
cd python-services && pytest
```

---

## ✅ Verification

### Health Checks

#### Backend API Health Check
```bash
curl -X GET http://localhost:5000/health
# Expected response:
{
  "status": "ok",
  "timestamp": "2024-09-16T00:38:25.000Z",
  "uptime": 12345,
  "database": "connected",
  "redis": "connected",
  "version": "2.0.0"
}
```

#### Frontend Health Check
```bash
curl -X GET http://localhost:3000/api/health
# Expected response:
{
  "status": "ok",
  "timestamp": "2024-09-16T00:38:25.000Z",
  "version": "2.0.0"
}
```

#### Database Connection Test
```bash
cd backend-nestjs
npx prisma studio
# Should open Prisma Studio at http://localhost:5555
```

#### Redis Connection Test
```bash
redis-cli ping
# Expected response: PONG
```

### Functional Tests

#### Authentication Test
```bash
# Register new user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

#### AI Services Test
```bash
# Test Finny AI
curl -X POST http://localhost:5000/finny/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message":"What should I invest in?"}'
```

#### Expert Services Test
```bash
# Get available experts
curl -X GET http://localhost:5000/experts/available \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process
kill -9 PID
```

#### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U dhanai_user -d dhanaillytics_dev -h localhost
```

#### Redis Connection Failed
```bash
# Check Redis status
sudo systemctl status redis

# Restart Redis
sudo systemctl restart redis

# Test connection
redis-cli ping
```

#### npm Install Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Python Dependencies Issues
```bash
# Upgrade pip
pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# Use conda if pip fails
conda install --file requirements.txt
```

### Performance Issues

#### Slow Database Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### High Memory Usage
```bash
# Monitor memory usage
htop
free -h

# Check Node.js memory usage
node --max-old-space-size=4096 app.js

# Monitor Docker containers
docker stats
```

#### Network Issues
```bash
# Check network connectivity
ping google.com
curl -I https://api.example.com

# Check DNS resolution
nslookup api.example.com

# Test specific ports
telnet localhost 5432
telnet localhost 6379
```

### Log Analysis

#### Backend Logs
```bash
# View application logs
tail -f backend-nestjs/logs/application.log

# View error logs
tail -f backend-nestjs/logs/error.log

# Search for specific errors
grep "ERROR" backend-nestjs/logs/application.log
```

#### Database Logs
```bash
# PostgreSQL logs (Ubuntu)
tail -f /var/log/postgresql/postgresql-14-main.log

# Redis logs
tail -f /var/log/redis/redis-server.log
```

#### System Logs
```bash
# System messages
tail -f /var/log/syslog

# Application-specific logs
journalctl -u dhanaillytics-backend -f
```

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Security scanning completed
- [ ] Performance testing passed
- [ ] Disaster recovery plan tested

### Deployment Commands

```bash
# Build production images
docker build -t dhanaillytics/backend:v2.0.0 backend-nestjs/
docker build -t dhanaillytics/frontend:v2.0.0 frontend/

# Deploy to Kubernetes
kubectl apply -f k8s/production/

# Verify deployment
kubectl get pods
kubectl get services
kubectl get ingress
```

### Post-deployment Verification

```bash
# Health checks
curl https://api.dhanaillytics.com/health
curl https://app.dhanaillytics.com/api/health

# SSL certificate check
openssl s_client -connect api.dhanaillytics.com:443

# Performance test
ab -n 1000 -c 10 https://api.dhanaillytics.com/health
```

---

## 📞 Support

### Getting Help

- **Documentation**: Check this guide and other docs
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: Ask questions and share solutions
- **Email Support**: tech-support@dhanaillytics.com

### Reporting Issues

When reporting issues, please include:
- Operating system and version
- Node.js and npm versions
- Error messages and stack traces
- Steps to reproduce the issue
- Expected vs actual behavior

---

*This setup guide is regularly updated with new requirements and improvements. Last updated: September 2024*

**Version 2.0.0** | **© 2024 DhanAillytics Inc.** | **All Rights Reserved**
