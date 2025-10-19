'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  ExternalLink, 
  Clock, 
  Zap, 
  Globe, 
  ArrowRight,
  Newspaper,
  DollarSign,
  Bitcoin,
  Building2,
  Sparkles,
  Eye,
  ChevronRight
} from 'lucide-react'

// Mock fintech news data (in production, this would come from a real API)
const mockNews = [
  {
    id: 1,
    title: "AI-Powered Trading Algorithms Show 300% Performance Boost",
    summary: "Revolutionary machine learning models are transforming algorithmic trading with unprecedented accuracy rates.",
    category: "AI & Trading",
    source: "FinTech Today",
    time: "2 hours ago",
    url: "https://example.com/ai-trading-boost",
    image: "/api/placeholder/400/200",
    trending: true,
    icon: Zap,
    color: "from-primary-500 to-primary-400"
  },
  {
    id: 2,
    title: "Quantum Computing Breakthrough in Risk Assessment",
    summary: "Major financial institutions adopt quantum algorithms for real-time portfolio risk analysis.",
    category: "Quantum Finance",
    source: "Quantum Finance Weekly",
    time: "4 hours ago",
    url: "https://example.com/quantum-risk",
    image: "/api/placeholder/400/200",
    trending: true,
    icon: Sparkles,
    color: "from-accent-500 to-accent-400"
  },
  {
    id: 3,
    title: "DeFi Protocols Reach $500B Total Value Locked",
    summary: "Decentralized finance ecosystem continues explosive growth with innovative yield farming strategies.",
    category: "DeFi",
    source: "Crypto Analytics",
    time: "6 hours ago",
    url: "https://example.com/defi-500b",
    image: "/api/placeholder/400/200",
    trending: false,
    icon: Bitcoin,
    color: "from-accent-500 to-accent-600"
  },
  {
    id: 4,
    title: "Central Banks Launch Digital Currency Pilots",
    summary: "Multiple countries accelerate CBDC development with blockchain-based monetary systems.",
    category: "CBDC",
    source: "Banking Innovation",
    time: "8 hours ago",
    url: "https://example.com/cbdc-pilots",
    image: "/api/placeholder/400/200",
    trending: false,
    icon: Building2,
    color: "from-primary-600 to-primary-700"
  },
  {
    id: 5,
    title: "Robo-Advisors Manage $2.5T in Global Assets",
    summary: "Automated investment platforms reach new milestone as retail investors embrace AI-driven portfolios.",
    category: "Robo-Advisory",
    source: "Investment Tech",
    time: "12 hours ago",
    url: "https://example.com/robo-advisors-2-5t",
    image: "/api/placeholder/400/200",
    trending: false,
    icon: TrendingUp,
    color: "from-primary-500 to-primary-600"
  },
  {
    id: 6,
    title: "Blockchain Identity Solutions Prevent $50M Fraud",
    summary: "Advanced cryptographic identity verification systems show remarkable success in fraud prevention.",
    category: "Blockchain Security",
    source: "Security Finance",
    time: "1 day ago",
    url: "https://example.com/blockchain-identity",
    image: "/api/placeholder/400/200",
    trending: false,
    icon: Globe,
    color: "from-accent-600 to-primary-500"
  }
]

const categories = [
  { name: "All", icon: Newspaper, active: true },
  { name: "AI & Trading", icon: Zap, active: false },
  { name: "DeFi", icon: Bitcoin, active: false },
  { name: "Quantum Finance", icon: Sparkles, active: false },
  { name: "CBDC", icon: Building2, active: false }
]

export default function FintechNews() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentNews, setCurrentNews] = useState(mockNews)
  const [featuredNews, setFeaturedNews] = useState(mockNews[0])
  const [isLoading, setIsLoading] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate featured news every 10 seconds
      setFeaturedNews(prev => {
        const currentIndex = mockNews.findIndex(news => news.id === prev.id)
        const nextIndex = (currentIndex + 1) % mockNews.length
        return mockNews[nextIndex]
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleCategoryChange = (category: string) => {
    setIsLoading(true)
    setSelectedCategory(category)
    
    setTimeout(() => {
      if (category === "All") {
        setCurrentNews(mockNews)
      } else {
        setCurrentNews(mockNews.filter(news => news.category === category))
      }
      setIsLoading(false)
    }, 500)
  }

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Light-themed overlay */}
      <div className="absolute inset-0 bg-white/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full px-6 py-3 mb-6"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(6, 182, 212, 0.3)",
                "0 0 40px rgba(6, 182, 212, 0.5)",
                "0 0 20px rgba(6, 182, 212, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">Live Updates</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            FinTech Pulse
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-primary-700 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Stay ahead with real-time financial technology news and market-moving developments
          </motion.p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white neon-primary'
                  : 'glass text-primary-700 hover:text-primary-800 hover:bg-primary-100/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Featured News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={featuredNews.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-3xl p-8 relative overflow-hidden cursor-pointer group"
              onClick={() => handleNewsClick(featuredNews.url)}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${featuredNews.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${featuredNews.color} rounded-xl flex items-center justify-center`}>
                      <featuredNews.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                      <p className="text-primary-600 text-sm mt-1">{featuredNews.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-primary-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{featuredNews.time}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-primary-800 mb-4 group-hover:text-primary-600 transition-colors">
                  {featuredNews.title}
                </h3>
                <p className="text-primary-700 text-lg mb-6 leading-relaxed">
                  {featuredNews.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-400 font-medium">{featuredNews.source}</span>
                  <div className="flex items-center space-x-2 text-primary-400 group-hover:translate-x-2 transition-transform">
                    <span className="font-medium">Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* News Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {currentNews.slice(1).map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass rounded-2xl p-6 cursor-pointer group hover:scale-105 transition-all duration-300 relative overflow-hidden"
                    onClick={() => handleNewsClick(news.url)}
                    whileHover={{ y: -5 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${news.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${news.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <news.icon className="w-5 h-5 text-white" />
                        </div>
                        {news.trending && (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>Trending</span>
                          </motion.div>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-bold text-primary-800 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {news.title}
                      </h4>
                      <p className="text-primary-700 text-sm mb-4 line-clamp-3">
                        {news.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-primary-600">
                        <span>{news.source}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{news.time}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end mt-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <motion.button
            className="group bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-4 rounded-xl font-semibold text-lg neon-primary flex items-center space-x-2 mx-auto relative overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Explore All News</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
