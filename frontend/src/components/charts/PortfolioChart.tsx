'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'

// Mock portfolio performance data
const generatePortfolioData = (days: number) => {
  const data = []
  const startValue = 100000
  let currentValue = startValue
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    
    // Simulate market movements with some volatility
    const change = (Math.random() - 0.5) * 0.03 // ±1.5% daily change
    currentValue *= (1 + change)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue),
      change: change * 100,
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
  }
  
  return data
}

const timeRanges = [
  { label: '7D', value: 7 },
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1Y', value: 365 },
  { label: 'All', value: 1000 }
]

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const value = payload[0].value
    const isPositive = value > (payload[0].payload.previousValue || value)
    
    return (
      <div className="glass rounded-lg p-4 border border-primary-500/30">
        <p className="text-gray-300 text-sm mb-2">{data.displayDate}</p>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-primary-400" />
          <span className="text-white font-bold">${value.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
          </span>
        </div>
      </div>
    )
  }
  return null
}

export default function PortfolioChart() {
  const [selectedRange, setSelectedRange] = useState(30)
  const [chartType, setChartType] = useState<'line' | 'area'>('area')
  
  const data = generatePortfolioData(selectedRange)
  const currentValue = data[data.length - 1]?.value || 0
  const startValue = data[0]?.value || 0
  const totalReturn = currentValue - startValue
  const totalReturnPercent = ((totalReturn / startValue) * 100)
  
  return (
    <div className="glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Portfolio Performance</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">${currentValue.toLocaleString()}</span>
              <div className={`flex items-center space-x-1 ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalReturn >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {totalReturn >= 0 ? '+' : ''}${Math.abs(totalReturn).toLocaleString()} ({totalReturnPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChartType('area')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'area' 
                ? 'bg-primary-500 text-white' 
                : 'bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-4 h-4 bg-current opacity-60" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'line' 
                ? 'bg-primary-500 text-white' 
                : 'bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-center space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {timeRanges.map((range) => (
          <motion.button
            key={range.value}
            onClick={() => setSelectedRange(range.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedRange === range.value
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {range.label}
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#9ca3af"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                dot={false}
                activeDot={{ r: 4, stroke: '#06b6d4', strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#9ca3af"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Best Day</p>
          <p className="text-green-400 font-bold">+$2,341</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Worst Day</p>
          <p className="text-red-400 font-bold">-$1,205</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Volatility</p>
          <p className="text-white font-bold">1.8%</p>
        </div>
      </div>
    </div>
  )
}
