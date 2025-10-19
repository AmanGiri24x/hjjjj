'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Lightbulb, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertCircle,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react'
import { useFinancial } from '@/contexts/FinancialContext'
import { useAuthStore } from '@/store/authStore'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
  insights?: {
    type: 'spending' | 'saving' | 'investment' | 'goal'
    data: any
  }
}

interface FinnyResponse {
  message: string
  suggestions?: string[]
  insights?: any
}

export default function WorkingFinnyChat({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore()
  const { financialData, transactions, goals } = useFinancial()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `Hello ${user?.first_name || 'there'}! I'm Finny, your AI financial advisor. I've analyzed your financial data and I'm here to help you make smarter money decisions. What would you like to know?`,
      timestamp: new Date(),
      suggestions: [
        'How can I improve my savings rate?',
        'What are my biggest spending categories?',
        'Should I invest more money?',
        'How am I progressing towards my goals?'
      ]
    }
    setMessages([welcomeMessage])
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateFinnyResponse = (userMessage: string): FinnyResponse => {
    const message = userMessage.toLowerCase()
    
    // Check if user has provided financial data
    if (!financialData || financialData.monthlyIncome === 0) {
      return {
        message: `I'd love to help you with that! However, I need some information about your finances first to give you personalized advice.

**To get started, please:**
• Complete your financial profile in the onboarding
• Add your monthly income and expenses
• Set up your financial goals

Once you've provided this information, I can give you specific, actionable advice based on your actual financial situation.

**In the meantime, here are some general tips:**
• Track all your expenses for a week to understand spending patterns
• Aim to save at least 20% of your income
• Build an emergency fund of 3-6 months of expenses
• Start investing early, even with small amounts

Would you like me to guide you through setting up your financial profile?`,
        suggestions: [
          'Help me set up my financial profile',
          'What information do you need from me?',
          'Give me general financial tips'
        ]
      }
    }
    
    // Savings-related responses (only if user has data)
    if (message.includes('saving') || message.includes('save')) {
      const savingsRate = (financialData.savings / financialData.monthlyIncome) * 100
      return {
        message: `Based on your current data, your savings rate is ${savingsRate.toFixed(1)}%. Here's what I recommend:

• **Increase automatic transfers**: Set up automatic transfers right after payday
• **50/30/20 rule**: Allocate 50% for needs, 30% for wants, and 20% for savings
• **Emergency fund priority**: Build 6 months of expenses (₹${(financialData.monthlyExpenses * 6).toLocaleString()}) in your emergency fund

Your current monthly surplus: ₹${(financialData.monthlyIncome - financialData.monthlyExpenses).toLocaleString()}

Would you like me to create a personalized savings plan for you?`,
        suggestions: [
          'Create a savings plan for me',
          'How to build emergency fund faster?',
          'Analyze my spending patterns'
        ]
      }
    }

    // Spending analysis
    if (message.includes('spending') || message.includes('expense')) {
      return {
        message: `I've analyzed your spending patterns. Here's what I found:

**Top Spending Categories:**
🍽️ **Food & Dining**: 25% (₹${financialData ? (financialData.monthlyExpenses * 0.25).toLocaleString() : '0'})
🚗 **Transportation**: 15% (₹${financialData ? (financialData.monthlyExpenses * 0.15).toLocaleString() : '0'})
🛍️ **Shopping**: 20% (₹${financialData ? (financialData.monthlyExpenses * 0.20).toLocaleString() : '0'})

**Key Insights:**
• Your food spending is 23% higher than last month
• Consider meal planning to reduce dining out costs
• Transportation costs can be optimized with carpooling or public transport

**Action Items:**
1. Set a dining out budget of ₹8,000/month
2. Try cooking at home 4 days a week
3. Use expense tracking apps for better visibility`,
        suggestions: [
          'Help me create a food budget',
          'Show transportation alternatives',
          'How to track expenses better?'
        ]
      }
    }

    // Investment advice
    if (message.includes('invest') || message.includes('investment')) {
      const investmentRatio = financialData ? (financialData.investments / financialData.netWorth) * 100 : 0
      return {
        message: `Your current investment allocation is ${investmentRatio.toFixed(1)}% of your net worth. Here's my analysis:

**Investment Recommendations:**
💼 **Equity (70%)**: ₹${financialData ? (financialData.netWorth * 0.7 * 0.3).toLocaleString() : '0'} in diversified mutual funds
🏛️ **Debt (20%)**: ₹${financialData ? (financialData.netWorth * 0.2 * 0.3).toLocaleString() : '0'} in bonds and FDs
🥇 **Gold (10%)**: ₹${financialData ? (financialData.netWorth * 0.1 * 0.3).toLocaleString() : '0'} for portfolio stability

**Next Steps:**
1. Start SIP of ₹15,000/month in large-cap funds
2. Increase equity allocation gradually
3. Consider tax-saving investments (ELSS)

**Expected Returns:** 12-15% annually with moderate risk`,
        suggestions: [
          'Recommend specific mutual funds',
          'How to start SIP investment?',
          'Explain tax-saving options'
        ]
      }
    }

    // Goals progress
    if (message.includes('goal') || message.includes('progress')) {
      const totalGoals = goals.length
      const completedGoals = goals.filter(g => (g.current_amount / g.target_amount) >= 1).length
      const avgProgress = goals.length > 0 ? goals.reduce((sum, goal) => sum + (goal.current_amount / goal.target_amount), 0) / goals.length * 100 : 0

      return {
        message: `Here's your goals progress summary:

**Overall Progress:** ${avgProgress.toFixed(1)}% average completion
**Active Goals:** ${totalGoals} total, ${completedGoals} completed

${goals.slice(0, 3).map(goal => {
  const progress = (goal.current_amount / goal.target_amount) * 100
  return `🎯 **${goal.name}**: ${progress.toFixed(1)}% complete (₹${goal.current_amount.toLocaleString()} / ₹${goal.target_amount.toLocaleString()})`
}).join('\n')}

**Recommendations:**
• Increase monthly allocation to reach goals faster
• Consider automating goal contributions
• Review and adjust target dates if needed

You're doing great! Keep up the momentum! 🚀`,
        suggestions: [
          'How to reach goals faster?',
          'Suggest goal optimization',
          'Add a new financial goal'
        ]
      }
    }

    // Budget help
    if (message.includes('budget')) {
      return {
        message: `Let me help you create an optimized budget based on your income of ₹${financialData ? financialData.monthlyIncome.toLocaleString() : '0'}:

**Recommended Budget Allocation:**
🏠 **Needs (50%)**: ₹${financialData ? (financialData.monthlyIncome * 0.5).toLocaleString() : '0'}
   - Rent, utilities, groceries, transport
   
🎯 **Wants (30%)**: ₹${financialData ? (financialData.monthlyIncome * 0.3).toLocaleString() : '0'}
   - Entertainment, dining out, shopping
   
💰 **Savings (20%)**: ₹${financialData ? (financialData.monthlyIncome * 0.2).toLocaleString() : '0'}
   - Emergency fund, investments, goals

**Current vs Recommended:**
- Your current expenses: ₹${financialData ? financialData.monthlyExpenses.toLocaleString() : '0'}
- Recommended expenses: ₹${financialData ? (financialData.monthlyIncome * 0.8).toLocaleString() : '0'}
- Potential savings increase: ₹${financialData ? Math.max(0, (financialData.monthlyIncome * 0.8) - financialData.monthlyExpenses).toLocaleString() : '0'}`,
        suggestions: [
          'Help me stick to this budget',
          'Create category-wise limits',
          'Set up budget alerts'
        ]
      }
    }

    // Default helpful response
    return {
      message: `I understand you're looking for financial guidance. Based on your profile, here are some key insights:

**Your Financial Snapshot:**
💰 Net Worth: ₹${financialData ? financialData.netWorth.toLocaleString() : '0'}
📈 Monthly Income: ₹${financialData ? financialData.monthlyIncome.toLocaleString() : '0'}
💸 Monthly Expenses: ₹${financialData ? financialData.monthlyExpenses.toLocaleString() : '0'}
🎯 Active Goals: ${goals.length}

**I can help you with:**
• Budgeting and expense optimization
• Investment planning and portfolio advice
• Savings strategies and emergency fund building
• Goal setting and achievement planning
• Spending analysis and insights

What specific area would you like to focus on?`,
      suggestions: [
        'Analyze my spending patterns',
        'Create an investment plan',
        'Help me save more money',
        'Review my financial goals'
      ]
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateFinnyResponse(inputMessage)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
      }

      recognition.start()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Finny AI</h2>
            <p className="text-sm text-gray-600">Your Personal Financial Advisor</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.type === 'user' ? 
                    <User className="w-4 h-4 text-white" /> : 
                    <Sparkles className="w-4 h-4 text-white" />
                  }
                </div>
                
                <div className={`rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white shadow-md border border-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {message.suggestions && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Suggested questions:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors border border-gray-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Finny anything about your finances..."
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            <button
              onClick={startListening}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
