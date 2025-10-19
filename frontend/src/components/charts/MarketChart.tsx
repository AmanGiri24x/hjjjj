'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'

// Mock market data
const marketOverviewData = [
  { name: 'Technology', value: 28.5, change: 2.3, volume: 1200000, color: '#06b6d4' },
  { name: 'Healthcare', value: 15.2, change: 0.8, volume: 800000, color: '#8b5cf6' },
  { name: 'Financial', value: 12.8, change: -1.2, volume: 950000, color: '#10b981' },
  { name: 'Energy', value: 11.4, change: 3.5, volume: 600000, color: '#f59e0b' },
  { name: 'Consumer', value: 10.1, change: 1.1, volume: 750000, color: '#ef4444' },
  { name: 'Industrial', value: 8.3, change: -0.5, volume: 520000, color: '#ec4899' },
  { name: 'Materials', value: 7.2, change: 2.8, volume: 480000, color: '#14b8a6' },
  { name: 'Utilities', value: 6.5, change: 0.3, volume: 320000, color: '#84cc16' }
]

const volumeData = [
  { time: '9:30', volume: 1200, price: 4567 },
  { time: '10:00', volume: 1450, price: 4572 },
  { time: '10:30', volume: 1380, price: 4568 },
  { time: '11:00', volume: 1620, price: 4575 },
  { time: '11:30', volume: 1290, price: 4571 },
  { time: '12:00', volume: 1100, price: 4569 },
  { time: '12:30', volume: 1350, price: 4573 },
  { time: '13:00', volume: 1580, price: 4578 },
  { time: '13:30', volume: 1420, price: 4576 },
  { time: '14:00', volume: 1680, price: 4582 },
  { time: '14:30', volume: 1540, price: 4579 },
  { time: '15:00', volume: 1720, price: 4585 },
  { time: '15:30', volume: 1890, price: 4590 },
  { time: '16:00', volume: 2100, price: 4595 }
]

interface MarketTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const MarketTooltip = ({ active, payload, label }: MarketTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-4 border border-primary-500/30">
        <p className="text-gray-300 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-medium">
              {entry.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const SectorTooltip = ({ active, payload }: MarketTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="glass rounded-lg p-4 border border-primary-500/30">
        <p className="text-white font-bold mb-2">{data.name}</p>
        <div className="space-y-1">
          <p className="text-gray-300 text-sm">Weight: {data.value}%</p>
          <div className="flex items-center space-x-1">
            {data.change >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span className={`text-sm font-medium ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.change >= 0 ? '+' : ''}{data.change}%
            </span>
          </div>
          <p className="text-gray-300 text-sm">Volume: {data.volume.toLocaleString()}</p>
        </div>
      </div>
    )
  }
  return null
}

export default function MarketChart() {
  const [activeChart, setActiveChart] = useState<'sectors' | 'volume'>('sectors')

  return (
    <div className="space-y-6">
      {/* Market Overview Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Market Overview</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">S&P 500: 4,595.23</span>
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+28.12 (+0.62%)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Toggle */}
          <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
            <motion.button
              onClick={() => setActiveChart('sectors')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeChart === 'sectors'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sectors
            </motion.button>
            <motion.button
              onClick={() => setActiveChart('volume')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeChart === 'volume'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Volume
            </motion.button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'sectors' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={marketOverviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {marketOverviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<SectorTooltip />} />
                  </PieChart>
                </div>
                
                {/* Sector List */}
                <div className="space-y-3">
                  {marketOverviewData.map((sector, index) => (
                    <motion.div
                      key={sector.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: sector.color }}
                        />
                        <span className="text-white font-medium">{sector.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{sector.value}%</div>
                        <div className={`text-sm flex items-center space-x-1 ${
                          sector.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {sector.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{sector.change >= 0 ? '+' : ''}{sector.change}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <ComposedChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  stroke="#9ca3af"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                />
                <YAxis 
                  yAxisId="price"
                  orientation="right"
                  stroke="#06b6d4"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<MarketTooltip />} />
                <Bar 
                  yAxisId="volume"
                  dataKey="volume" 
                  fill="#06b6d4" 
                  fillOpacity={0.3} 
                  stroke="#06b6d4"
                  strokeWidth={1}
                />
                <Line 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="price" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-4 h-4 text-primary-400 mr-1" />
              <span className="text-gray-400 text-sm">Volume</span>
            </div>
            <p className="text-white font-bold">2.1B</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-gray-400 text-sm">Gainers</span>
            </div>
            <p className="text-green-400 font-bold">1,247</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              <span className="text-gray-400 text-sm">Decliners</span>
            </div>
            <p className="text-red-400 font-bold">982</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-gray-400 text-sm">Unchanged</span>
            </div>
            <p className="text-yellow-400 font-bold">321</p>
          </div>
        </div>
      </div>
    </div>
  )
}
