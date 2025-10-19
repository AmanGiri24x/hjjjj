# 🚀 DhanAillytics - Complete Setup Guide

This guide will help you clone and run DhanAillytics on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Python** (v3.8 or higher) - for AI services
   - Download from: https://www.python.org/
   - Verify installation: `python --version`

3. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **PostgreSQL** (v14 or higher) - for database
   - Download from: https://www.postgresql.org/download/
   - Or use Supabase (cloud PostgreSQL) - see below

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/AmanGiri24x/hjjjj.git
cd hjjjj
```

## 🗄️ Step 2: Database Setup

### Option A: Using Supabase (Recommended - Easier)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (URI format)
5. In Supabase SQL Editor, run the schema from `supabase_schema.sql`

### Option B: Using Local PostgreSQL

1. Install PostgreSQL
2. Create a new database:
   ```bash
   createdb dhanaillytics
   ```
3. Import the schema:
   ```bash
   psql -d dhanaillytics -f supabase_schema.sql
   ```

## ⚙️ Step 3: Backend Setup (NestJS)

1. Navigate to backend directory:
   ```bash
   cd backend-nestjs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in `backend-nestjs` directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/dhanaillytics
   # Or use your Supabase connection string:
   # DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Server
   PORT=3001
   NODE_ENV=development

   # CORS
   FRONTEND_URL=http://localhost:3000

   # AI Services (Optional - for AI features)
   OPENAI_API_KEY=your-openai-api-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. Start the backend:
   ```bash
   npm run start:dev
   ```

   The backend will run on http://localhost:3001

## 🎨 Step 4: Frontend Setup (Next.js)

1. Open a **new terminal** and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file in `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:3000

## 🐍 Step 5: Python AI Services (Optional)

If you want to use AI features:

1. Open a **new terminal** and navigate to python services:
   ```bash
   cd python-services
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   
   # Activate it:
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file in `python-services` directory:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   DATABASE_URL=your-database-url-here
   ```

5. Start the Python services:
   ```bash
   python main.py
   ```

## 🎉 Step 6: Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 🔑 Default Test Account

You can create a new account or use these test credentials (if seeded):
- Email: test@example.com
- Password: password123

## 📁 Project Structure

```
hjjjj/
├── frontend/              # Next.js frontend (Port 3000)
├── backend-nestjs/        # NestJS backend API (Port 3001)
├── python-services/       # Python AI services (Port 8000)
├── supabase_schema.sql    # Database schema
└── README.md              # Project documentation
```

## 🛠️ Common Issues & Solutions

### Issue: Port already in use
**Solution**: Change the port in `.env` files or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: Database connection failed
**Solution**: 
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Make sure database exists and schema is imported

### Issue: Module not found errors
**Solution**: Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Python dependencies fail to install
**Solution**: 
- Make sure you're in the virtual environment
- Try upgrading pip: `pip install --upgrade pip`
- Install dependencies one by one if needed

## 🚀 Production Build

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Backend
```bash
cd backend-nestjs
npm run build
npm run start:prod
```

## 📚 Additional Resources

- **Full Documentation**: See `COMPREHENSIVE_DOCUMENTATION.md`
- **Database Setup**: See `DATABASE_SETUP_GUIDE.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **User Manual**: See `USER_MANUAL.md`

## 💡 Tips

1. **Keep terminals open**: You need at least 2 terminals running (frontend + backend)
2. **Check logs**: If something doesn't work, check the terminal logs for errors
3. **Environment variables**: Make sure all `.env` files are created with correct values
4. **Database first**: Always set up the database before starting the backend
5. **Node version**: Use Node.js v18 or higher for best compatibility

## 🆘 Need Help?

If you encounter any issues:
1. Check the terminal logs for error messages
2. Verify all environment variables are set correctly
3. Make sure all prerequisites are installed
4. Check that all required ports are available
5. Reach out to the project maintainer

## 🎯 Quick Start Commands (Summary)

```bash
# 1. Clone
git clone https://github.com/AmanGiri24x/hjjjj.git
cd hjjjj

# 2. Backend
cd backend-nestjs
npm install
# Create .env file with DATABASE_URL and other configs
npm run start:dev

# 3. Frontend (new terminal)
cd frontend
npm install
# Create .env.local file
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

**Happy Coding! 🚀**

If you find this project useful, please give it a ⭐ on GitHub!
