# DhanAillytics - AI-Powered Financial Analytics Platform

A futuristic, AI-powered financial analytics and wealth management platform featuring world-class 3D UI and smooth animations.

## 🚀 Features

- **3D Data Visualization**: Immersive 3D portfolio visualization with interactive data spheres
- **AI-Powered Insights**: Machine learning-driven market analysis and investment recommendations
- **Real-time Analytics**: Live financial data processing with sub-millisecond latency
- **Responsive Design**: Fully responsive across all devices with glass morphism UI
- **Futuristic Interface**: Cyber-themed design with neon effects and smooth animations
- **Advanced Charts**: Interactive financial charts and performance metrics

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for Three.js
- **Lucide React** - Modern icon library
- **Zustand** - State management
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Socket.io** - Real-time communication

## 📁 Project Structure

```
DhanAillytics/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # Reusable components
│   │   │   ├── 3d/         # Three.js components
│   │   │   ├── charts/     # Chart components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── sections/   # Page sections
│   │   │   └── ui/         # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   └── dist/               # Compiled JavaScript
└── shared/                 # Shared types and utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmanGiri24x/hjjjj.git
   cd hjjjj
   ```

   📖 **For detailed setup instructions, see [SETUP_FOR_FRIEND.md](SETUP_FOR_FRIEND.md)**

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend-nestjs
   npm install
   ```

4. **Configure Environment Variables**
   - Create `.env` in `backend-nestjs/` (see SETUP_FOR_FRIEND.md)
   - Create `.env.local` in `frontend/` (see SETUP_FOR_FRIEND.md)

5. **Start Development Servers**
   
   Backend (in terminal 1):
   ```bash
   cd backend-nestjs
   npm run start:dev
   ```
   
   Frontend (in terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎨 Design System

### Colors
- **Primary**: Cyan/Blue (#06b6d4)
- **Secondary**: Slate (#64748b)
- **Accent**: Purple/Magenta (#d946ef)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Primary Font**: Inter
- **Monospace Font**: Fira Code

### Effects
- Glass morphism backgrounds
- Neon glow effects
- Smooth animations with Framer Motion
- 3D interactive elements

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in both frontend and backend directories:

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dhanaillytics
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway/Heroku)
```bash
cd backend
npm run build
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://dhanaillytics.vercel.app)
- [Documentation](https://docs.dhanaillytics.com)
- [API Reference](https://api.dhanaillytics.com/docs)

## 👥 Team

Built with ❤️ by the DhanAillytics team

---

**Note**: This is a demonstration project showcasing advanced web technologies. For production use, additional security measures, testing, and optimization would be required.
