# DhanAillytics Deployment Script for Windows PowerShell
# This script builds and prepares the application for deployment

param(
    [switch]$SkipBuild,
    [switch]$DockerBuild,
    [switch]$Help
)

# Colors for output
$Colors = @{
    Red = 'Red'
    Green = 'Green'
    Blue = 'Blue'
    Yellow = 'Yellow'
    Cyan = 'Cyan'
}

function Write-ColorOutput($Text, $Color = 'White') {
    Write-Host $Text -ForegroundColor $Color
}

function Write-Status($Message) {
    Write-ColorOutput "[INFO] $Message" $Colors.Blue
}

function Write-Success($Message) {
    Write-ColorOutput "[SUCCESS] $Message" $Colors.Green
}

function Write-Warning($Message) {
    Write-ColorOutput "[WARNING] $Message" $Colors.Yellow
}

function Write-Error($Message) {
    Write-ColorOutput "[ERROR] $Message" $Colors.Red
}

function Show-Help {
    Write-Host @"
DhanAillytics Deployment Script

Usage: .\deploy.ps1 [OPTIONS]

Options:
  -SkipBuild     Skip the build process
  -DockerBuild   Build using Docker
  -Help          Show this help message

Examples:
  .\deploy.ps1                 # Full build and deployment prep
  .\deploy.ps1 -DockerBuild    # Build using Docker
  .\deploy.ps1 -SkipBuild      # Skip build, just run checks

"@
}

function Test-Dependencies {
    Write-Status "Checking dependencies..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed or not in PATH!"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm found: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed or not in PATH!"
        exit 1
    }
    
    if ($DockerBuild) {
        try {
            $dockerVersion = docker --version
            Write-Success "Docker found: $dockerVersion"
        }
        catch {
            Write-Error "Docker is not installed or not running!"
            exit 1
        }
    }
}

function Build-Backend {
    Write-Status "Building backend..."
    Set-Location backend
    
    # Check for .env file
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found in backend directory"
        if (Test-Path ".env.example") {
            Write-Status "Copying .env.example to .env"
            Copy-Item ".env.example" ".env"
        }
    }
    
    Write-Status "Installing backend dependencies..."
    npm ci --only=production
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install backend dependencies"
        exit 1
    }
    
    Write-Status "Building backend TypeScript..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend build failed"
        exit 1
    }
    
    Write-Success "Backend built successfully"
    Set-Location ..
}

function Build-Frontend {
    Write-Status "Building frontend..."
    Set-Location frontend
    
    # Check for .env.local file
    if (-not (Test-Path ".env.local")) {
        Write-Warning ".env.local file not found in frontend directory"
        if (Test-Path ".env.example") {
            Write-Status "Creating .env.local from example"
            Copy-Item ".env.example" ".env.local"
        }
    }
    
    Write-Status "Installing frontend dependencies..."
    npm ci --only=production
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies"
        exit 1
    }
    
    Write-Status "Building Next.js application..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed"
        exit 1
    }
    
    Write-Success "Frontend built successfully"
    Set-Location ..
}

function Build-Docker {
    Write-Status "Building Docker containers..."
    
    try {
        Write-Status "Building backend Docker image..."
        docker build -t dhanaillytics-backend ./backend
        
        Write-Status "Building frontend Docker image..."
        docker build -t dhanaillytics-frontend ./frontend
        
        Write-Success "Docker images built successfully"
    }
    catch {
        Write-Error "Docker build failed: $_"
        exit 1
    }
}

function Test-BuildArtifacts {
    Write-Status "Running health checks..."
    
    # Check backend build
    if (Test-Path "backend\dist\server.js") {
        Write-Success "Backend build artifacts found"
    }
    else {
        Write-Error "Backend build artifacts not found"
        exit 1
    }
    
    # Check frontend build
    if (Test-Path "frontend\.next") {
        Write-Success "Frontend build artifacts found"
    }
    else {
        Write-Error "Frontend build artifacts not found"
        exit 1
    }
}

function New-DeploymentReport {
    Write-Status "Generating deployment report..."
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $report = @"
DhanAillytics Deployment Report
Generated: $timestamp

✅ Backend Status: READY
   - Build artifacts: backend\dist\
   - Main entry: backend\dist\server.js
   - Dependencies: Installed

✅ Frontend Status: READY
   - Build artifacts: frontend\.next\
   - Static files: frontend\public\
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

🔗 Deployment Platforms:
   - Frontend: Vercel, Netlify, AWS Amplify
   - Backend: Railway, Heroku, AWS, DigitalOcean
   - Database: MongoDB Atlas, AWS DocumentDB
   - Cache: Redis Cloud, AWS ElastiCache

📦 Docker Commands:
   - Build: docker-compose build
   - Run: docker-compose up -d
   - Stop: docker-compose down
"@
    
    $report | Out-File -FilePath "deployment-report.txt" -Encoding UTF8
    Write-Success "Deployment report generated: deployment-report.txt"
}

function Start-Deployment {
    Write-ColorOutput "======================================" $Colors.Cyan
    Write-ColorOutput "🎯 DhanAillytics Deployment Script" $Colors.Cyan
    Write-ColorOutput "======================================" $Colors.Cyan
    
    if ($Help) {
        Show-Help
        return
    }
    
    Test-Dependencies
    
    if ($DockerBuild) {
        Build-Docker
    }
    elseif (-not $SkipBuild) {
        Build-Backend
        Build-Frontend
        Test-BuildArtifacts
    }
    else {
        Write-Status "Skipping build process..."
        Test-BuildArtifacts
    }
    
    New-DeploymentReport
    
    Write-ColorOutput "======================================" $Colors.Cyan
    Write-Success "🎉 Deployment preparation complete!"
    Write-Status "Check deployment-report.txt for next steps"
    Write-ColorOutput "======================================" $Colors.Cyan
}

# Run the deployment process
Start-Deployment
