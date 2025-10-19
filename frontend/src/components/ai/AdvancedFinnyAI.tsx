'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, Send, X, Mic, MicOff, Brain, TrendingUp, TrendingDown, 
  Target, PieChart, BarChart3, DollarSign, Lightbulb, AlertTriangle,
  CheckCircle, Info, Zap, ArrowRight
} from 'lucide-react'
import type { Transaction, Account, Investment, Goal as GoalType, Budget } from '@/lib/supabase'

interface Message {
  id: string
  type: 'user' | 'finny'
  content: string
  timestamp: Date
  suggestions?: string[]
  insights?: AIInsight[]
}

interface AIInsight {
  type: 'recommendation' | 'alert' | 'opportunity' | 'achievement'
  title: string
  description: string
  action?: string
  priority: 'high' | 'medium' | 'low'
}

interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netWorth: number
  savingsRate: number
  topSpendingCategories: { category: string; amount: number }[]
  monthlyTrend: { month: string; income: number; expenses: number }[]
}

interface UserData {
  transactions: Transaction[]
  accounts: Account[]
  investments: Investment[]
  goals: GoalType[]
  budgets: Budget[]
  financialSummary: FinancialSummary
}

interface AdvancedFinnyAIProps {
  onClose: () => void
  userData: UserData
}

export default function AdvancedFinnyAI({ onClose, userData }: AdvancedFinnyAIProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize with welcome message based on user data
    const welcomeMessage = generateWelcomeMessage()
    setMessages([welcomeMessage])
  }, [userData])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateWelcomeMessage = (): Message => {
    const { transactions, goals, financialSummary } = userData
    
    if (transactions.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'finny',
        content: `Hello! I'm Finny, your AI financial advisor. 🤖💰

I notice you're just getting started with DhanAi. I'm here to help you make smart financial decisions based on your real data.

**To get the most out of our conversation:**
• Add your income and expenses
• Set up your financial goals
• Connect your accounts

Once you have some data, I can provide personalized insights about your spending patterns, savings opportunities, and investment strategies.

What would you like to know about personal finance?`,
        timestamp: new Date(),
        suggestions: [
          'How do I start tracking my finances?',
          'What should my emergency fund be?',
          'Help me create a budget',
          'Investment basics for beginners'
        ]
      }
    }

    const insights = generateDataBasedInsights()
    
    return {
      id: Date.now().toString(),
      type: 'finny',
      content: `Welcome back! I've analyzed your financial data and have some insights for you. 📊

**Your Financial Snapshot:**
• Net Worth: ₹${financialSummary.netWorth.toLocaleString()}
• Savings Rate: ${financialSummary.savingsRate.toFixed(1)}%
• Active Goals: ${goals.length}
• Recent Transactions: ${transactions.length}

${insights.length > 0 ? '**Key Insights:**' : ''}
${insights.map(insight => `• ${insight.title}: ${insight.description}`).join('\n')}

What would you like to explore today?`,
      timestamp: new Date(),
      suggestions: [
        'Analyze my spending patterns',
        'How can I save more money?',
        'Review my financial goals',
        'Investment recommendations'
      ],
      insights
    }
  }

  const generateDataBasedInsights = (): AIInsight[] => {
    const insights: AIInsight[] = []
    const { transactions, financialSummary, goals } = userData

    // Savings rate analysis
    if (financialSummary.savingsRate < 20) {
      insights.push({
        type: 'recommendation',
        title: 'Low Savings Rate',
        description: `Your savings rate is ${financialSummary.savingsRate.toFixed(1)}%. Aim for 20-30% for better financial health.`,
        action: 'Create a savings plan',
        priority: 'high'
      })
    } else if (financialSummary.savingsRate > 30) {
      insights.push({
        type: 'achievement',
        title: 'Excellent Savings Rate',
        description: `Your ${financialSummary.savingsRate.toFixed(1)}% savings rate is outstanding! Consider investing the surplus.`,
        action: 'Explore investment options',
        priority: 'medium'
      })
    }

    // Spending analysis
    if (financialSummary.topSpendingCategories.length > 0) {
      const topCategory = financialSummary.topSpendingCategories[0]
      const percentage = (topCategory.amount / financialSummary.totalExpenses) * 100
      
      if (percentage > 40) {
        insights.push({
          type: 'alert',
          title: 'High Category Spending',
          description: `${topCategory.category} accounts for ${percentage.toFixed(1)}% of your expenses. Consider reviewing this area.`,
          action: 'Analyze spending breakdown',
          priority: 'medium'
        })
      }
    }

    // Goal progress analysis
    goals.forEach(goal => {
      const progress = (goal.current_amount / goal.target_amount) * 100
      if (progress > 80) {
        insights.push({
          type: 'achievement',
          title: 'Goal Almost Achieved',
          description: `You're ${progress.toFixed(1)}% towards your ${goal.name} goal!`,
          action: 'View goal details',
          priority: 'low'
        })
      }
    })

    return insights.slice(0, 3) // Limit to top 3 insights
  }

  const generateFinnyResponse = (userMessage: string): Message => {
    const message = userMessage.toLowerCase()
    const { transactions, financialSummary, goals } = userData

    // Check if user has data
    if (transactions.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'finny',
        content: `I'd love to help you with that! However, I need some financial data first to give you personalized advice.

**To get started:**
1. Add your income transactions
2. Record your expenses
3. Set up your financial goals

Once you have some data, I can provide specific insights about:
• Spending optimization
• Savings strategies
• Investment recommendations
• Goal achievement plans

Would you like me to guide you through setting up your financial profile?`,
        timestamp: new Date(),
        suggestions: [
          'How do I add transactions?',
          'What goals should I set?',
          'General financial tips',
          'Investment basics'
        ]
      }
    }

    // Spending analysis
    if (message.includes('spending') || message.includes('expense')) {
      const topCategories = financialSummary.topSpendingCategories.slice(0, 3)
      
      return {
        id: Date.now().toString(),
        type: 'finny',
        content: `I've analyzed your spending patterns! Here's what I found: 📊

**Your Top Spending Categories:**
${topCategories.map((cat, index) => 
  `${index + 1}. ${cat.category}: ₹${cat.amount.toLocaleString()} (${((cat.amount / financialSummary.totalExpenses) * 100).toFixed(1)}%)`
).join('\n')}

**Recommendations:**
• Review your ${topCategories[0]?.category} expenses for optimization opportunities
• Set monthly budgets for each category
• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings

**Quick Actions:**
• Create budgets for high-spending categories
• Set up spending alerts
• Track daily expenses for better awareness

Would you like me to help you create a budget plan?`,
        timestamp: new Date(),
        suggestions: [
          'Create a budget plan',
          'Set spending alerts',
          'Analyze specific category',
          'Monthly spending goals'
        ]
      }
    }

    // Savings analysis
    if (message.includes('saving') || message.includes('save')) {
      const monthlySavings = financialSummary.totalIncome - financialSummary.totalExpenses
      const emergencyFund = monthlySavings * 6
      
      return {
        id: Date.now().toString(),
        type: 'finny',
        content: `Let's boost your savings! Here's your current situation: 💰

**Current Savings Analysis:**
• Savings Rate: ${financialSummary.savingsRate.toFixed(1)}%
• Monthly Surplus: ₹${monthlySavings.toLocaleString()}
• Recommended Emergency Fund: ₹${emergencyFund.toLocaleString()}

**Savings Strategies:**
• **Automate savings**: Set up automatic transfers right after payday
• **50/30/20 rule**: Allocate 20% of income to savings
• **High-yield accounts**: Move savings to better-earning accounts
• **Expense optimization**: Review and cut unnecessary subscriptions

**Goal-based Savings:**
${goals.length > 0 ? goals.map(goal => 
  `• ${goal.name}: ₹${(goal.target_amount - goal.current_amount).toLocaleString()} remaining`
).join('\n') : '• Set specific savings goals for better motivation'}

Would you like me to create a personalized savings plan?`,
        timestamp: new Date(),
        suggestions: [
          'Create savings plan',
          'Emergency fund strategy',
          'Investment options',
          'Automate my savings'
        ]
      }
    }

    // Investment advice
    if (message.includes('invest') || message.includes('investment')) {
      return {
        id: Date.now().toString(),
        type: 'finny',
        content: `Great question! Let's explore investment opportunities based on your profile: 📈

**Your Investment Readiness:**
• Available for Investment: ₹${Math.max(0, (financialSummary.totalIncome - financialSummary.totalExpenses) * 0.7).toLocaleString()}
• Risk Capacity: ${financialSummary.savingsRate > 20 ? 'Moderate to High' : 'Conservative'}

**Recommended Investment Strategy:**
• **Emergency Fund First**: Ensure 6 months of expenses are saved
• **SIP in Mutual Funds**: Start with ₹5,000-10,000 monthly
• **Diversified Portfolio**: 60% equity, 30% debt, 10% gold
• **Tax-saving Investments**: ELSS, PPF, NSC for tax benefits

**Investment Options by Risk:**
• **Low Risk**: FDs, Government Bonds, Debt Funds
• **Medium Risk**: Balanced Mutual Funds, Blue-chip Stocks
• **High Risk**: Small-cap Funds, Individual Stocks, Crypto

**Next Steps:**
1. Complete your emergency fund
2. Start with index funds or balanced funds
3. Gradually increase SIP amounts
4. Review and rebalance quarterly

Would you like specific fund recommendations or help setting up SIPs?`,
        timestamp: new Date(),
        suggestions: [
          'Mutual fund recommendations',
          'How to start SIP?',
          'Tax-saving investments',
          'Portfolio allocation advice'
        ]
      }
    }

    // Goal analysis
    if (message.includes('goal') || message.includes('target')) {
      if (goals.length === 0) {
        return {
          id: Date.now().toString(),
          type: 'finny',
          content: `Setting financial goals is crucial for success! Let me help you get started: 🎯

**Why Goals Matter:**
• Provide direction and motivation
• Help prioritize spending decisions
• Make saving more purposeful
• Track progress over time

**Common Financial Goals:**
• **Emergency Fund**: 6 months of expenses
• **House Down Payment**: 20% of property value
• **Retirement**: 25x annual expenses
• **Vacation**: Specific amount and timeline
• **Education**: Children's education or skill development

**SMART Goal Framework:**
• **Specific**: Clear and well-defined
• **Measurable**: Quantifiable amount
• **Achievable**: Realistic based on income
• **Relevant**: Important to your life
• **Time-bound**: Clear deadline

**Recommended First Goals:**
1. Emergency Fund: ₹${(financialSummary.totalExpenses * 6).toLocaleString()}
2. Investment Goal: ₹1,00,000 in mutual funds
3. Vacation Fund: ₹50,000 for next year

Would you like help setting up your first financial goal?`,
          timestamp: new Date(),
          suggestions: [
            'Set emergency fund goal',
            'Plan for house purchase',
            'Retirement planning',
            'Create vacation fund'
          ]
        }
      } else {
        const activeGoals = goals.filter(g => g.status === 'active')
        return {
          id: Date.now().toString(),
          type: 'finny',
          content: `Let's review your financial goals progress: 🎯

**Your Active Goals:**
${activeGoals.map(goal => {
  const progress = (goal.current_amount / goal.target_amount) * 100
  const remaining = goal.target_amount - goal.current_amount
  const monthsLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
  const monthlyRequired = remaining / Math.max(1, monthsLeft)
  
  return `• **${goal.name}**
  Progress: ${progress.toFixed(1)}% (₹${goal.current_amount.toLocaleString()} / ₹${goal.target_amount.toLocaleString()})
  Remaining: ₹${remaining.toLocaleString()}
  Monthly needed: ₹${monthlyRequired.toLocaleString()}`
}).join('\n\n')}

**Goal Optimization Tips:**
• Automate goal contributions
• Review and adjust targets quarterly
• Celebrate milestones achieved
• Consider goal priority ranking

**Action Items:**
• Increase contributions to high-priority goals
• Set up automatic transfers
• Track progress weekly

Which goal would you like to focus on improving?`,
          timestamp: new Date(),
          suggestions: [
            'Optimize goal contributions',
            'Add new financial goal',
            'Adjust goal timelines',
            'Goal achievement strategies'
          ]
        }
      }
    }

    // Budget planning
    if (message.includes('budget') || message.includes('plan')) {
      return {
        id: Date.now().toString(),
        type: 'finny',
        content: `Let's create a smart budget based on your spending patterns! 📋

**Your Current Financial Flow:**
• Monthly Income: ₹${(financialSummary.totalIncome / Math.max(1, financialSummary.monthlyTrend.length)).toLocaleString()}
• Monthly Expenses: ₹${(financialSummary.totalExpenses / Math.max(1, financialSummary.monthlyTrend.length)).toLocaleString()}
• Current Savings Rate: ${financialSummary.savingsRate.toFixed(1)}%

**Recommended 50/30/20 Budget:**
• **Needs (50%)**: ₹${((financialSummary.totalIncome / Math.max(1, financialSummary.monthlyTrend.length)) * 0.5).toLocaleString()}
  - Rent, utilities, groceries, transportation
• **Wants (30%)**: ₹${((financialSummary.totalIncome / Math.max(1, financialSummary.monthlyTrend.length)) * 0.3).toLocaleString()}
  - Entertainment, dining out, hobbies
• **Savings (20%)**: ₹${((financialSummary.totalIncome / Math.max(1, financialSummary.monthlyTrend.length)) * 0.2).toLocaleString()}
  - Emergency fund, investments, goals

**Category-wise Budget Suggestions:**
${financialSummary.topSpendingCategories.slice(0, 3).map(cat => 
  `• ${cat.category}: ₹${Math.round(cat.amount * 0.9).toLocaleString()} (10% reduction)`
).join('\n')}

**Budget Success Tips:**
• Track expenses weekly
• Use envelope method for discretionary spending
• Review and adjust monthly
• Automate savings first

Would you like me to help set up specific category budgets?`,
        timestamp: new Date(),
        suggestions: [
          'Set category budgets',
          'Expense tracking tips',
          'Automate budget system',
          'Budget review schedule'
        ]
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'finny',
      content: `I'm here to help with your financial questions! Based on your data, I can assist with:

**Available Topics:**
• **Spending Analysis**: Review where your money goes
• **Savings Strategies**: Boost your savings rate
• **Investment Planning**: Grow your wealth
• **Goal Setting**: Achieve your financial dreams
• **Budget Creation**: Plan your monthly finances
• **Debt Management**: Optimize loan payments

**Quick Insights:**
• Your savings rate: ${financialSummary.savingsRate.toFixed(1)}%
• Top expense: ${financialSummary.topSpendingCategories[0]?.category || 'No data'}
• Active goals: ${goals.length}

What specific area would you like to explore?`,
      timestamp: new Date(),
      suggestions: [
        'Analyze my spending',
        'How to save more?',
        'Investment advice',
        'Budget planning'
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
      const finnyResponse = generateFinnyResponse(inputMessage)
      setMessages(prev => [...prev, finnyResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
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
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              message.type === 'user' 
                ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl' 
                : 'bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl shadow-md'
            } p-4`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Insights */}
              {message.insights && message.insights.length > 0 && (
                <div className="mt-4 space-y-2">
                  {message.insights.map((insight, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      insight.type === 'alert' ? 'bg-red-50 border-red-200' :
                      insight.type === 'achievement' ? 'bg-green-50 border-green-200' :
                      insight.type === 'opportunity' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {insight.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {insight.type === 'achievement' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-yellow-500" />}
                        {insight.type === 'recommendation' && <Info className="w-4 h-4 text-blue-500" />}
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.action && (
                        <button className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center space-x-1">
                          <span>{insight.action}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl shadow-md p-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">Finny is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Finny about your finances..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
