#!/bin/bash

# DhanAillytics Deployment Script
# This script builds and prepares the application for deployment

set -e

echo "🚀 Starting DhanAillytics Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    cd backend
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found in backend directory"
        print_status "Copying .env.example to .env"
        cp .env.example .env
    fi
    
    print_status "Installing backend dependencies..."
    npm ci --only=production
    
    print_status "Building backend TypeScript..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Backend built successfully"
    else
        print_error "Backend build failed"
        exit 1
    fi
    
    cd ..
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found in frontend directory"
        print_status "Creating .env.local from example"
        cp .env.example .env.local
    fi
    
    print_status "Installing frontend dependencies..."
    npm ci --only=production
    
    print_status "Building Next.js application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend built successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Run health checks
health_check() {
    print_status "Running health checks..."
    
    # Check backend build
    if [ -f "backend/dist/server.js" ]; then
        print_success "Backend build artifacts found"
    else
        print_error "Backend build artifacts not found"
        exit 1
    fi
    
    # Check frontend build
    if [ -d "frontend/.next" ]; then
        print_success "Frontend build artifacts found"
    else
        print_error "Frontend build artifacts not found"
        exit 1
    fi
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    cat > deployment-report.txt << EOF
DhanAillytics Deployment Report
Generated: $(date)

✅ Backend Status: READY
   - Build artifacts: backend/dist/
   - Main entry: backend/dist/server.js
   - Dependencies: Installed

✅ Frontend Status: READY
   - Build artifacts: frontend/.next/
   - Static files: frontend/public/
   - Dependencies: Installed

🚀 Ready for Deployment:
   - Vercel (Frontend): Use 'vercel --prod'
   - Railway (Backend): Push to main branch
   - Docker: Use 'docker-compose up --build'

📋 Environment Variables Required:
   Backend:
   - NODE_ENV=production
   - MONGODB_URI=<your_mongodb_uri>
   - JWT_SECRET=<your_jwt_secret>
   - JWT_REFRESH_SECRET=<your_refresh_secret>
   
   Frontend:
   - NEXT_PUBLIC_API_URL=<your_backend_url>
   - NEXT_PUBLIC_WS_URL=<your_websocket_url>

🔗 Deployment URLs:
   - Frontend: Update in vercel.json
   - Backend: Update CORS_ORIGIN and FRONTEND_URL
EOF
    
    print_success "Deployment report generated: deployment-report.txt"
}

# Main deployment process
main() {
    echo "======================================"
    echo "🎯 DhanAillytics Deployment Script"
    echo "======================================"
    
    check_dependencies
    build_backend
    build_frontend
    health_check
    generate_report
    
    echo "======================================"
    print_success "🎉 Deployment preparation complete!"
    print_status "Check deployment-report.txt for next steps"
    echo "======================================"
}

# Run main function
main "$@"
