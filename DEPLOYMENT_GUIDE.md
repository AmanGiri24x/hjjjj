# 🚀 DhanAillytics Deployment Guide

This guide covers all deployment options for your DhanAillytics full-stack application.

## 📋 Pre-Deployment Checklist

✅ **Project Structure**: Frontend + Backend integrated  
✅ **Build Artifacts**: Both frontend (.next) and backend (dist) are built  
✅ **Dependencies**: All npm packages installed  
✅ **Environment Files**: Created for both frontend and backend  
✅ **Docker Configuration**: Dockerfiles and docker-compose.yml ready  
✅ **Deployment Scripts**: PowerShell and Bash scripts available  

## 🎯 Deployment Options

### 1. **Quick Cloud Deployment (Recommended)**

#### **Frontend - Vercel (Free)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

**Environment Variables to Set in Vercel:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend-url.railway.app
NEXT_PUBLIC_APP_ENV=production
```

#### **Backend - Railway (Free Tier Available)**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Set environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhanaillytics
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_characters
CORS_ORIGIN=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
ALPHA_VANTAGE_API_KEY=your_api_key
FINNHUB_API_KEY=your_api_key
```

#### **Database - MongoDB Atlas (Free)**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI in backend environment

### 2. **Docker Deployment**

#### **Local Docker Development**
```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

#### **Production Docker Deployment**
```bash
# Build production images
docker build -t dhanaillytics-backend ./backend
docker build -t dhanaillytics-frontend ./frontend

# Push to registry (DockerHub/AWS ECR/etc.)
docker tag dhanaillytics-backend your-username/dhanaillytics-backend:latest
docker push your-username/dhanaillytics-backend:latest
```

### 3. **Traditional VPS Deployment**

#### **Setup on Ubuntu/Debian VPS**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Clone and setup project
git clone https://github.com/your-username/DhanAillytics.git
cd DhanAillytics

# Deploy backend
cd backend
npm ci --production
npm run build
pm2 start dist/server.js --name dhanaillytics-backend

# Deploy frontend
cd ../frontend
npm ci --production
npm run build
pm2 start npm --name dhanaillytics-frontend -- start

# Save PM2 processes
pm2 save
pm2 startup
```

## 🔧 Environment Configuration

### **Frontend Environment Variables**
```env
# Production Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
NEXT_PUBLIC_APP_NAME=DhanAillytics
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
```

### **Backend Environment Variables**
```env
# Production Backend (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhanaillytics
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_characters
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
NEWS_API_KEY=your_news_api_key
OPENAI_API_KEY=your_openai_key

# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@dhanaillytics.com
```

## 🔍 Health Checks & Monitoring

### **Backend Health Check**
```bash
curl https://your-backend-url.com/api/v1/health
```

### **Frontend Health Check**
```bash
curl https://your-frontend-url.com/api/health
```

## 🚀 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy DhanAillytics

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Build backend
        run: cd backend && npm run build
      - name: Deploy to Railway
        uses: railway/gh-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Build frontend
        run: cd frontend && npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🔒 Security Checklist

- [ ] Environment variables secured in deployment platform
- [ ] JWT secrets are strong (32+ characters)
- [ ] CORS origins configured correctly
- [ ] HTTPS enabled for production
- [ ] Database connection secured
- [ ] API rate limiting enabled
- [ ] File upload restrictions configured

## 📊 Performance Optimization

### **Backend Optimizations**
- Enable compression middleware
- Use Redis for caching
- Database indexing
- Connection pooling

### **Frontend Optimizations**
- Next.js Image optimization
- Bundle analyzer
- Code splitting
- Static generation where possible

## 🔧 Troubleshooting

### **Common Issues**

1. **CORS Errors**
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend URL matches exactly

2. **Database Connection Failed**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript errors

4. **Environment Variables Not Loading**
   - Ensure .env files are properly named
   - Check platform-specific env var syntax
   - Verify secrets are set in deployment platform

## 📞 Deployment Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test API endpoints manually
4. Check database connectivity

## 🎉 Go Live Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed with health check passing
- [ ] Database connected and seeded
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring/analytics setup
- [ ] Backup strategy implemented

---

**🚀 Your DhanAillytics app is now ready for deployment!**

Choose your preferred deployment method and follow the steps above. The easiest path is Vercel + Railway + MongoDB Atlas for a completely serverless deployment.
