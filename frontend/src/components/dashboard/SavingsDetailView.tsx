'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Target, Calendar } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface SavingsData {
  month: string
  savings: number
  expenses: number
  goal: number
}

export default function SavingsDetailView({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme()
  
  const savingsData: SavingsData[] = [
    { month: 'Jan', savings: 15000, expenses: 12000, goal: 20000 },
    { month: 'Feb', savings: 18000, expenses: 11000, goal: 20000 },
    { month: 'Mar', savings: 22000, expenses: 13000, goal: 20000 },
    { month: 'Apr', savings: 19000, expenses: 14000, goal: 20000 },
    { month: 'May', savings: 25000, expenses: 12000, goal: 20000 },
    { month: 'Jun', savings: 21000, expenses: 15000, goal: 20000 },
    { month: 'Jul', savings: 28000, expenses: 13000, goal: 20000 },
    { month: 'Aug', savings: 24000, expenses: 11000, goal: 20000 },
    { month: 'Sep', savings: 30000, expenses: 12000, goal: 20000 }
  ]

  const chartData = {
    labels: savingsData.map(d => d.month),
    datasets: [
      {
        label: 'Savings',
        data: savingsData.map(d => d.savings),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Expenses',
        data: savingsData.map(d => d.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#ffffff' : '#000000'
        }
      },
      title: {
        display: true,
        text: 'Savings vs Expenses Trend',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      }
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#000000'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        }
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#000000'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        }
      }
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'} hover:scale-105 transition-all`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Savings
          </h1>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm mb-6`}
        >
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-green-900/30 border-green-500/20' : 'bg-green-100 border-green-200'} border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>This Month</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ₹1,354.00
            </div>
            <div className="text-green-500 text-sm">+5.00%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-blue-900/30 border-blue-500/20' : 'bg-blue-100 border-blue-200'} border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Last Month</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ₹1,200.00
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-purple-900/30 border-purple-500/20' : 'bg-purple-100 border-purple-200'} border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Goal</span>
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ₹2,000.00
            </div>
            <div className="text-purple-500 text-sm">67% achieved</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-orange-900/30 border-orange-500/20' : 'bg-orange-100 border-orange-200'} border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Avg Monthly</span>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ₹1,277.00
            </div>
          </motion.div>
        </div>

        {/* Monthly Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Monthly Breakdown
            </h3>
            <button className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:scale-105 transition-all`}>
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {savingsData.slice(-3).reverse().map((data, index) => (
              <div key={data.month} className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    <span className="text-white font-semibold">{data.month.charAt(0)}</span>
                  </div>
                  <div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {data.month}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Savings vs Goal
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ₹{data.savings.toLocaleString()}
                  </div>
                  <div className={`text-sm ${data.savings >= data.goal ? 'text-green-500' : 'text-orange-500'}`}>
                    {((data.savings / data.goal) * 100).toFixed(0)}% of goal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
