'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  DollarSign,
  Target,
  Activity,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  gainLoss: number
  gainLossPercent: number
  weight: number
  sector: string
}

interface Portfolio {
  id: string
  name: string
  description: string
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  holdings: Holding[]
  createdAt: string
  lastUpdated: string
}

export default function PortfolioPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for demo
  useEffect(() => {
    const mockPortfolios: Portfolio[] = [
      {
        id: '1',
        name: 'Growth Portfolio',
        description: 'High-growth tech stocks and emerging markets',
        totalValue: 127543.50,
        totalGainLoss: 12754.30,
        totalGainLossPercent: 11.12,
        createdAt: '2024-01-15',
        lastUpdated: '2024-03-15',
        holdings: [
          {
            id: '1',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            quantity: 50,
            avgCost: 150.00,
            currentPrice: 175.50,
            marketValue: 8775.00,
            gainLoss: 1275.00,
            gainLossPercent: 17.00,
            weight: 6.88,
            sector: 'Technology'
          },
          {
            id: '2',
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            quantity: 25,
            avgCost: 120.00,
            currentPrice: 140.25,
            marketValue: 3506.25,
            gainLoss: 506.25,
            gainLossPercent: 16.88,
            weight: 2.75,
            sector: 'Technology'
          },
          {
            id: '3',
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            quantity: 30,
            avgCost: 200.00,
            currentPrice: 245.80,
            marketValue: 7374.00,
            gainLoss: 1374.00,
            gainLossPercent: 22.90,
            weight: 5.78,
            sector: 'Automotive'
          }
        ]
      },
      {
        id: '2',
        name: 'Dividend Income',
        description: 'Stable dividend-paying stocks for income generation',
        totalValue: 85420.75,
        totalGainLoss: 3421.50,
        totalGainLossPercent: 4.17,
        createdAt: '2024-02-01',
        lastUpdated: '2024-03-15',
        holdings: [
          {
            id: '4',
            symbol: 'JNJ',
            name: 'Johnson & Johnson',
            quantity: 100,
            avgCost: 160.00,
            currentPrice: 165.50,
            marketValue: 16550.00,
            gainLoss: 550.00,
            gainLossPercent: 3.44,
            weight: 19.38,
            sector: 'Healthcare'
          },
          {
            id: '5',
            symbol: 'KO',
            name: 'Coca-Cola Company',
            quantity: 200,
            avgCost: 55.00,
            currentPrice: 58.75,
            marketValue: 11750.00,
            gainLoss: 750.00,
            gainLossPercent: 6.82,
            weight: 13.76,
            sector: 'Consumer Staples'
          }
        ]
      }
    ]

    setTimeout(() => {
      setPortfolios(mockPortfolios)
      setSelectedPortfolio(mockPortfolios[0])
      setLoading(false)
    }, 1000)
  }, [])

  const refreshPrices = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const PortfolioCard = ({ portfolio }: { portfolio: Portfolio }) => (
    <motion.div
      onClick={() => setSelectedPortfolio(portfolio)}
      className={`glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
        selectedPortfolio?.id === portfolio.id ? 'ring-2 ring-cyan-400' : ''
      }`}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{portfolio.name}</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">{portfolio.description}</p>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Value</span>
          <span className="text-white font-bold">${portfolio.totalValue.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Gain/Loss</span>
          <div className={`flex items-center space-x-1 ${
            portfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {portfolio.totalGainLoss >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-bold">
              ${Math.abs(portfolio.totalGainLoss).toLocaleString()} 
              ({portfolio.totalGainLossPercent >= 0 ? '+' : ''}{portfolio.totalGainLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Holdings</span>
          <span className="text-white">{portfolio.holdings.length} positions</span>
        </div>
      </div>
    </motion.div>
  )

  const HoldingRow = ({ holding }: { holding: Holding }) => (
    <motion.tr
      className="border-b border-white/10 hover:bg-white/5 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <td className="py-4 px-6">
        <div>
          <div className="font-bold text-white">{holding.symbol}</div>
          <div className="text-sm text-gray-400">{holding.name}</div>
        </div>
      </td>
      <td className="py-4 px-6 text-white">{holding.quantity}</td>
      <td className="py-4 px-6 text-white">${holding.avgCost.toFixed(2)}</td>
      <td className="py-4 px-6 text-white">${holding.currentPrice.toFixed(2)}</td>
      <td className="py-4 px-6 text-white">${holding.marketValue.toLocaleString()}</td>
      <td className="py-4 px-6">
        <div className={`flex items-center space-x-1 ${
          holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {holding.gainLoss >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-bold">
            ${Math.abs(holding.gainLoss).toLocaleString()}
          </span>
        </div>
        <div className={`text-sm ${holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
        </div>
      </td>
      <td className="py-4 px-6 text-white">{holding.weight.toFixed(2)}%</td>
      <td className="py-4 px-6">
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
          {holding.sector}
        </span>
      </td>
    </motion.tr>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 cyber-grid flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-cyan-400/30 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Loading Portfolios</h2>
          <p className="text-gray-400">Fetching your investment data...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 cyber-grid">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Portfolio Management</h1>
              <p className="text-gray-400">Manage and track your investment portfolios</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={refreshPrices}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Prices</span>
              </motion.button>
              
              <motion.button
                onClick={() => router.push('/dashboard/portfolio/create')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-400 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-400/25 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>New Portfolio</span>
              </motion.button>
            </div>
          </div>

          {/* Portfolio Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioCard key={portfolio.id} portfolio={portfolio} />
            ))}
          </div>

          {/* Selected Portfolio Details */}
          {selectedPortfolio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedPortfolio.name}</h2>
                  <p className="text-gray-400">{selectedPortfolio.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    ${selectedPortfolio.totalValue.toLocaleString()}
                  </div>
                  <div className={`flex items-center justify-end space-x-1 ${
                    selectedPortfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedPortfolio.totalGainLoss >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="text-lg font-bold">
                      ${Math.abs(selectedPortfolio.totalGainLoss).toLocaleString()} 
                      ({selectedPortfolio.totalGainLossPercent >= 0 ? '+' : ''}{selectedPortfolio.totalGainLossPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Symbol</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Quantity</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Avg Cost</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Current Price</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Market Value</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Gain/Loss</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Weight</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Sector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPortfolio.holdings.map((holding) => (
                      <HoldingRow key={holding.id} holding={holding} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Portfolio Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                    <Target className="w-4 h-4" />
                    <span>Rebalance</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
                    <Zap className="w-4 h-4" />
                    <span>AI Optimize</span>
                  </button>
                </div>
                
                <div className="text-sm text-gray-400">
                  Last updated: {new Date(selectedPortfolio.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
