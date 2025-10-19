'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  DollarSign,
  Target,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Brain,
  Lightbulb
} from 'lucide-react'
import realFinancialService from '@/lib/services/realFinancialService'

interface FinnyMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  recommendations?: any[]
  actionItems?: string[]
  personalizedInsights?: any[]
  riskAssessment?: any
}

interface QuickPrompt {
  id: string
  text: string
  icon: React.ElementType
  category: 'analysis' | 'planning' | 'investment' | 'general'
}

export default function EnhancedFinnyChat() {
  const [messages, setMessages] = useState<FinnyMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [financialData, setFinancialData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts: QuickPrompt[] = [
    {
      id: 'analyze-spending',
      text: 'Analyze my spending patterns',
      icon: TrendingUp,
      category: 'analysis'
    },
    {
      id: 'investment-advice',
      text: 'What should I invest in?',
      icon: DollarSign,
      category: 'investment'
    },
    {
      id: 'savings-goal',
      text: 'Help me plan my savings goals',
      icon: Target,
      category: 'planning'
    },
    {
      id: 'budget-tips',
      text: 'Give me budgeting tips',
      icon: Lightbulb,
      category: 'general'
    }
  ]

  useEffect(() => {
    loadFinancialData()
    initializeChat()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadFinancialData = async () => {
    try {
      const summary = await realFinancialService.getFinancialSummary()
      setFinancialData(summary)
    } catch (error) {
      console.error('Failed to load financial data:', error)
    }
  }

  const initializeChat = () => {
    const welcomeMessage: FinnyMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm Finny, your AI financial advisor. I can help you with:\n\n• Analyzing your real spending patterns\n• Investment recommendations based on your data\n• Personalized budgeting advice\n• Financial goal planning\n\nWhat would you like to know about your finances?`,
      timestamp: new Date(),
      confidence: 1.0
    }
    setMessages([welcomeMessage])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: FinnyMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Get enhanced AI response with real financial context
      const aiResponse = await getEnhancedFinnyResponse(content)
      
      const assistantMessage: FinnyMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        confidence: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        actionItems: aiResponse.actionItems,
        personalizedInsights: aiResponse.personalizedInsights,
        riskAssessment: aiResponse.riskAssessment
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to get Finny response:', error)
      
      const errorMessage: FinnyMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or ask a different question.',
        timestamp: new Date(),
        confidence: 0.1
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getEnhancedFinnyResponse = async (message: string) => {
    // Enhanced AI response with real financial data context
    const contextualPrompt = await buildContextualPrompt(message)
    
    // Simulate enhanced AI response (replace with actual API call)
    return generateSmartResponse(message, contextualPrompt)
  }

  const buildContextualPrompt = async (message: string) => {
    let context = `User's Financial Context:\n`
    
    if (financialData) {
      context += `- Total Income: ₹${financialData.totalIncome || 0}\n`
      context += `- Total Expenses: ₹${financialData.totalExpenses || 0}\n`
      context += `- Net Savings: ₹${financialData.netSavings || 0}\n`
      context += `- Monthly Income: ₹${financialData.monthlyIncome || 0}\n`
      context += `- Monthly Expenses: ₹${financialData.monthlyExpenses || 0}\n`
      
      if (financialData.topCategories && financialData.topCategories.length > 0) {
        context += `- Top Spending Categories: ${financialData.topCategories.map((c: any) => `${c.category} (₹${c.amount})`).join(', ')}\n`
      }
    }
    
    context += `\nUser Question: ${message}\n\nProvide personalized financial advice based on their actual data.`
    return context
  }

  const generateSmartResponse = (message: string, context: string) => {
    const lowerMessage = message.toLowerCase()
    
    // Analyze spending patterns
    if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      return {
        content: generateSpendingAnalysis(),
        confidence: 0.9,
        recommendations: generateSpendingRecommendations(),
        actionItems: ['Review monthly expenses', 'Set category budgets', 'Track daily spending'],
        personalizedInsights: generateSpendingInsights()
      }
    }
    
    // Investment advice
    if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return {
        content: generateInvestmentAdvice(),
        confidence: 0.85,
        recommendations: generateInvestmentRecommendations(),
        actionItems: ['Start SIP', 'Diversify portfolio', 'Review risk tolerance'],
        riskAssessment: { level: 'medium', score: 0.6 }
      }
    }
    
    // Savings and goals
    if (lowerMessage.includes('save') || lowerMessage.includes('goal')) {
      return {
        content: generateSavingsAdvice(),
        confidence: 0.88,
        recommendations: generateSavingsRecommendations(),
        actionItems: ['Set emergency fund target', 'Automate savings', 'Track progress monthly']
      }
    }
    
    // Budget advice
    if (lowerMessage.includes('budget')) {
      return {
        content: generateBudgetAdvice(),
        confidence: 0.92,
        recommendations: generateBudgetRecommendations(),
        actionItems: ['Use 50/30/20 rule', 'Track expenses daily', 'Review budget monthly']
      }
    }
    
    // Default response
    return {
      content: generateGeneralAdvice(message),
      confidence: 0.75,
      recommendations: [],
      actionItems: ['Ask specific questions about spending, investing, or budgeting']
    }
  }

  const generateSpendingAnalysis = () => {
    if (!financialData) return "I'd love to analyze your spending, but I need access to your financial data first."
    
    const savingsRate = ((financialData.netSavings / financialData.totalIncome) * 100).toFixed(1)
    const topCategory = financialData.topCategories?.[0]
    
    return `Based on your actual financial data:

💰 **Spending Overview:**
• Total monthly expenses: ₹${financialData.monthlyExpenses?.toLocaleString() || 0}
• Savings rate: ${savingsRate}% ${parseFloat(savingsRate) >= 20 ? '✅ Great!' : '⚠️ Could improve'}
• Top spending category: ${topCategory?.category || 'Unknown'} (₹${topCategory?.amount?.toLocaleString() || 0})

📊 **Analysis:**
${parseFloat(savingsRate) < 10 ? 
  '🔴 Your savings rate is below 10%. Consider reducing expenses or increasing income.' :
  parseFloat(savingsRate) < 20 ?
  '🟡 Your savings rate is decent but could be better. Aim for 20%+.' :
  '🟢 Excellent savings rate! You\'re on track for financial success.'
}

The 50/30/20 rule suggests: 50% needs, 30% wants, 20% savings. You're currently saving ${savingsRate}%.`
  }

  const generateSpendingRecommendations = () => {
    if (!financialData?.topCategories) return []
    
    return financialData.topCategories.slice(0, 3).map((category: any) => ({
      title: `Optimize ${category.category} Spending`,
      description: `Currently ₹${category.amount.toLocaleString()} (${category.percentage.toFixed(1)}%). Consider reducing by 10-15%.`,
      priority: category.percentage > 30 ? 'high' : 'medium'
    }))
  }

  const generateSpendingInsights = () => {
    if (!financialData) return []
    
    return [
      {
        type: 'trend',
        title: 'Spending Pattern',
        content: `Your monthly expenses are ₹${financialData.monthlyExpenses?.toLocaleString()}, which is ${
          (financialData.monthlyExpenses / financialData.monthlyIncome * 100).toFixed(1)
        }% of your income.`
      }
    ]
  }

  const generateInvestmentAdvice = () => {
    const availableSavings = financialData?.netSavings || 0
    
    return `Based on your financial profile:

💼 **Investment Strategy:**
• Available for investment: ₹${availableSavings.toLocaleString()}
• Recommended allocation: 
  - Emergency fund (6 months expenses): ₹${((financialData?.monthlyExpenses || 0) * 6).toLocaleString()}
  - Equity (60%): ₹${(availableSavings * 0.6).toLocaleString()}
  - Debt (30%): ₹${(availableSavings * 0.3).toLocaleString()}
  - Gold/Others (10%): ₹${(availableSavings * 0.1).toLocaleString()}

🎯 **Recommendations:**
• Start with index funds for equity exposure
• Consider ELSS for tax benefits under 80C
• Build emergency fund first if not done
• Use SIP for disciplined investing

⚠️ **Risk Note:** Investments are subject to market risks. Start small and increase gradually.`
  }

  const generateInvestmentRecommendations = () => [
    {
      title: 'Start SIP in Index Funds',
      description: 'Low-cost, diversified exposure to market',
      priority: 'high'
    },
    {
      title: 'Build Emergency Fund',
      description: '6 months of expenses in liquid funds',
      priority: 'high'
    },
    {
      title: 'Tax-Saving Investments',
      description: 'ELSS, PPF, or NSC for 80C benefits',
      priority: 'medium'
    }
  ]

  const generateSavingsAdvice = () => {
    const currentSavings = financialData?.netSavings || 0
    const monthlyIncome = financialData?.monthlyIncome || 0
    const targetSavings = monthlyIncome * 0.2
    
    return `💰 **Savings Analysis:**
• Current monthly savings: ₹${currentSavings.toLocaleString()}
• Target (20% of income): ₹${targetSavings.toLocaleString()}
• Gap: ₹${(targetSavings - currentSavings).toLocaleString()}

🎯 **Goal Setting:**
• Emergency fund target: ₹${((financialData?.monthlyExpenses || 0) * 6).toLocaleString()}
• Annual savings target: ₹${(targetSavings * 12).toLocaleString()}

📈 **Action Plan:**
1. Automate savings on salary day
2. Use the "pay yourself first" principle
3. Set up separate savings accounts for different goals
4. Review and adjust monthly`
  }

  const generateSavingsRecommendations = () => [
    {
      title: 'Automate Savings',
      description: 'Set up automatic transfer on salary day',
      priority: 'high'
    },
    {
      title: 'Emergency Fund',
      description: 'Build 6 months of expenses as priority',
      priority: 'high'
    }
  ]

  const generateBudgetAdvice = () => {
    return `📊 **Smart Budgeting Strategy:**

🏠 **50/30/20 Rule:**
• 50% Needs (rent, groceries, utilities)
• 30% Wants (entertainment, dining out)
• 20% Savings & Investments

💡 **Budgeting Tips:**
• Track every expense for 30 days
• Use envelope method for categories
• Review and adjust monthly
• Set alerts for overspending

📱 **Tools:**
• Use expense tracking apps
• Set up category-wise budgets
• Monitor spending weekly`
  }

  const generateBudgetRecommendations = () => [
    {
      title: 'Track Daily Expenses',
      description: 'Monitor spending in real-time',
      priority: 'high'
    },
    {
      title: 'Set Category Limits',
      description: 'Allocate specific amounts per category',
      priority: 'medium'
    }
  ]

  const generateGeneralAdvice = (message: string) => {
    return `I'm here to help with your finances! I can provide personalized advice on:

💰 **Spending Analysis** - Review your expense patterns
📈 **Investment Planning** - Build a diversified portfolio  
🎯 **Goal Setting** - Plan for your financial objectives
📊 **Budgeting** - Create sustainable spending plans

Ask me specific questions like:
• "How can I reduce my expenses?"
• "Where should I invest ₹10,000?"
• "Help me plan for retirement"
• "What's my ideal budget allocation?"

What would you like to explore?`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    sendMessage(prompt.text)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Finny AI</h3>
            <p className="text-sm text-gray-500">Your Personal Financial Advisor</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-gray-500"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Finny is thinking...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 border-t bg-white/50">
          <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt) => {
              const IconComponent = prompt.icon as React.ComponentType<{ className?: string }>;
              return (
                <button
                  key={prompt.id}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="flex items-center space-x-2 p-3 bg-white rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <IconComponent className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">{prompt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Finny about your finances..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

const MessageBubble = ({ message }: { message: FinnyMessage }) => {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
        }`}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>
        
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border shadow-sm'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {!isUser && message.confidence && (
            <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
              <Brain className="w-3 h-3" />
              <span>Confidence: {Math.round(message.confidence * 100)}%</span>
            </div>
          )}
          
          {!isUser && message.recommendations && message.recommendations.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-2">💡 Recommendations</div>
              <div className="space-y-2">
                {message.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-blue-700">{rec.title}</div>
                    <div className="text-blue-600">{rec.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isUser && message.actionItems && message.actionItems.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-2">✅ Action Items</div>
              <div className="space-y-1">
                {message.actionItems.map((item, index) => (
                  <div key={index} className="text-sm text-green-700">• {item}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
