# ✅ Clone and Run Checklist for Your Friend

## 📥 Step-by-Step Guide to Run DhanAillytics

### ✅ Step 1: Clone the Repository (2 minutes)

```bash
git clone https://github.com/AmanGiri24x/hjjjj.git
cd hjjjj
```

**What they get:**
- ✅ All source code
- ✅ Configuration files
- ✅ Database schema
- ✅ Documentation
- ❌ NO node_modules (will install next)
- ❌ NO .env files (will create next)

---

### ✅ Step 2: Install Node.js Dependencies (5-10 minutes)

#### Backend:
```bash
cd backend-nestjs
npm install
```

#### Frontend (open new terminal):
```bash
cd frontend
npm install
```

**What this does:**
- Downloads all npm packages (~1.5GB total)
- Creates node_modules folders
- Prepares the project to run

---

### ✅ Step 3: Setup Database (10 minutes)

#### Option A: Using Supabase (Easier - Recommended)

1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Go to SQL Editor
5. Copy contents of `supabase_schema.sql`
6. Run it in SQL Editor
7. Get connection string from Settings > Database

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL first
# Then create database:
createdb dhanaillytics

# Import schema:
psql -d dhanaillytics -f supabase_schema.sql
```

---

### ✅ Step 4: Create Environment Files (5 minutes)

#### Backend: Create `backend-nestjs/.env`

Copy from `backend-nestjs/.env.example` and fill in:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dhanaillytics
JWT_SECRET=any-random-secret-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `DATABASE_URL` with your actual database connection string!

#### Frontend: Create `frontend/.env.local`

Copy from `frontend/.env.example` and fill in:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

---

### ✅ Step 5: Run the Application (2 minutes)

#### Terminal 1 - Start Backend:
```bash
cd backend-nestjs
npm run start:dev
```

**Expected output:**
```
[Nest] Application successfully started
[Nest] Listening on port 3001
```

#### Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

---

### ✅ Step 6: Access the Application

Open browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

---

## 🎯 Quick Summary (Copy-Paste Commands)

```bash
# 1. Clone
git clone https://github.com/AmanGiri24x/hjjjj.git
cd hjjjj

# 2. Install Backend
cd backend-nestjs
npm install
# Create .env file here (copy from .env.example)

# 3. Install Frontend (new terminal)
cd frontend
npm install
# Create .env.local file here (copy from .env.example)

# 4. Setup database (use Supabase or local PostgreSQL)
# Run supabase_schema.sql

# 5. Start Backend (terminal 1)
cd backend-nestjs
npm run start:dev

# 6. Start Frontend (terminal 2)
cd frontend
npm run dev

# 7. Open http://localhost:3000
```

---

## ⏱️ Total Time Estimate

- **Clone**: 2 minutes
- **Install dependencies**: 10 minutes
- **Setup database**: 10 minutes
- **Create .env files**: 5 minutes
- **Start servers**: 2 minutes

**Total: ~30 minutes** (first time setup)

---

## 🔍 What Your Friend Needs Installed

### Required:
- ✅ **Node.js** (v18+): https://nodejs.org/
- ✅ **Git**: https://git-scm.com/
- ✅ **Database**: PostgreSQL OR Supabase account

### Optional (for AI features):
- **Python** (v3.8+): https://www.python.org/
- **OpenAI API Key**: https://platform.openai.com/
- **Gemini API Key**: https://makersuite.google.com/

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:3000
- [ ] No errors in terminal
- [ ] Can access the website
- [ ] Database connected (check backend logs)

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Database connection failed"
**Solution**: 
- Check DATABASE_URL in `.env`
- Verify database is running
- Test connection: `psql <DATABASE_URL>`

### Issue: "Module not found: Can't resolve..."
**Solution**: Make sure you ran `npm install` in BOTH frontend AND backend directories

---

## 📚 Additional Help

- **Detailed Setup**: See `SETUP_FOR_FRIEND.md`
- **Project Info**: See `README.md`
- **Database Setup**: See `DATABASE_SETUP_GUIDE.md`
- **User Manual**: See `USER_MANUAL.md`

---

## ✨ After Successful Setup

Your friend will have:
- ✅ Full working application
- ✅ Frontend with 3D visualizations
- ✅ Backend API with all features
- ✅ Database with proper schema
- ✅ AI features (if API keys provided)

---

## 🎉 That's It!

Once everything is running, your friend can:
- Create an account
- Add transactions
- View dashboard
- Use AI features
- Manage budgets
- Track expenses

**Repository**: https://github.com/AmanGiri24x/hjjjj

---

**Need help? Check the documentation files or create an issue on GitHub!**
