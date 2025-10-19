'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Database,
  Zap
} from 'lucide-react'
import realFinancialService from '@/lib/services/realFinancialService'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function TestFinancialPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Database Connection', status: 'pending', message: 'Testing connection...' },
    { name: 'Database Initialization', status: 'pending', message: 'Setting up tables...' },
    { name: 'Add Sample Transaction', status: 'pending', message: 'Adding test expense...' },
    { name: 'Financial Summary', status: 'pending', message: 'Getting real data...' },
    { name: 'AI Analysis', status: 'pending', message: 'Testing AI insights...' },
    { name: 'Quick Expense', status: 'pending', message: 'Testing quick actions...' }
  ])
  
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState(0)

  const updateTest = (index: number, status: 'success' | 'error', message: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    setCurrentTest(0)

    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const })))

    try {
      // Test 1: Database Connection
      setCurrentTest(0)
      try {
        const connectionResult = await realFinancialService.testConnection()
        updateTest(0, 'success', 'Database connected successfully!', connectionResult)
      } catch (error) {
        updateTest(0, 'error', `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsRunning(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test 2: Database Initialization
      setCurrentTest(1)
      try {
        const initResult = await realFinancialService.initializeDatabase()
        updateTest(1, 'success', 'Database tables created successfully!', initResult)
      } catch (error) {
        updateTest(1, 'error', `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test 3: Add Sample Transaction
      setCurrentTest(2)
      try {
        const transactionResult = await realFinancialService.addTransaction({
          amount: 1000,
          description: 'Test Rent Payment',
          category: 'Housing',
          type: 'expense'
        })
        updateTest(2, 'success', 'Sample transaction added successfully!', transactionResult)
      } catch (error) {
        updateTest(2, 'error', `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test 4: Financial Summary
      setCurrentTest(3)
      try {
        const summaryResult = await realFinancialService.getFinancialSummary()
        updateTest(3, 'success', `Summary loaded: ₹${summaryResult.totalExpenses} expenses`, summaryResult)
      } catch (error) {
        updateTest(3, 'error', `Summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test 5: AI Analysis
      setCurrentTest(4)
      try {
        const aiResult = await realFinancialService.getAIAnalysis()
        updateTest(4, 'success', `AI insights generated: ${aiResult.spendingInsights?.length || 0} insights`, aiResult)
      } catch (error) {
        updateTest(4, 'error', `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test 6: Quick Expense
      setCurrentTest(5)
      try {
        const quickExpenseResult = await realFinancialService.addQuickExpense('groceries', 500)
        updateTest(5, 'success', 'Quick expense added successfully!', quickExpenseResult)
      } catch (error) {
        updateTest(5, 'error', `Quick expense failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

    } catch (error) {
      console.error('Test suite failed:', error)
    } finally {
      setIsRunning(false)
      setCurrentTest(-1)
    }
  }

  const getStatusIcon = (status: string, index: number) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-400" />
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-400" />
    if (isRunning && currentTest === index) return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
    return <AlertCircle className="w-5 h-5 text-gray-400" />
  }

  const getStatusColor = (status: string, index: number) => {
    if (status === 'success') return 'border-green-500/20 bg-green-500/10'
    if (status === 'error') return 'border-red-500/20 bg-red-500/10'
    if (isRunning && currentTest === index) return 'border-blue-500/20 bg-blue-500/10'
    return 'border-gray-700/50 bg-slate-800/50'
  }

  const allTestsPassed = tests.every(test => test.status === 'success')
  const hasErrors = tests.some(test => test.status === 'error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 DhanAillytics Financial System Test
          </h1>
          <p className="text-gray-400 text-lg">
            Testing your real financial tracking system with Supabase database
          </p>
        </motion.div>

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-8 py-4 rounded-xl font-semibold text-white transition-all ${
              isRunning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl hover:shadow-2xl'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Running Tests...
              </span>
            ) : (
              <span className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Run Financial System Tests
              </span>
            )}
          </button>
        </motion.div>

        {/* Test Results */}
        <div className="space-y-4 mb-8">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl border backdrop-blur-sm ${getStatusColor(test.status, index)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status, index)}
                  <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  test.status === 'success' ? 'bg-green-500/20 text-green-400' :
                  test.status === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {test.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{test.message}</p>
              {test.data && (
                <details className="mt-3">
                  <summary className="text-cyan-400 cursor-pointer text-sm">View Details</summary>
                  <pre className="mt-2 p-3 bg-slate-900/50 rounded-lg text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </motion.div>
          ))}
        </div>

        {/* Results Summary */}
        {!isRunning && tests.some(test => test.status !== 'pending') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border backdrop-blur-sm ${
              allTestsPassed 
                ? 'border-green-500/20 bg-green-500/10' 
                : hasErrors 
                ? 'border-red-500/20 bg-red-500/10'
                : 'border-yellow-500/20 bg-yellow-500/10'
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              {allTestsPassed ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : hasErrors ? (
                <XCircle className="w-8 h-8 text-red-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {allTestsPassed 
                    ? '🎉 All Tests Passed!' 
                    : hasErrors 
                    ? '❌ Some Tests Failed' 
                    : '⚠️ Tests Incomplete'
                  }
                </h3>
                <p className="text-gray-300">
                  {allTestsPassed 
                    ? 'Your real financial tracking system is working perfectly!' 
                    : hasErrors 
                    ? 'Please check the failed tests and fix the issues.' 
                    : 'Some tests are still pending.'
                  }
                </p>
              </div>
            </div>

            {allTestsPassed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <Database className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Database Ready</div>
                  <div className="text-gray-400 text-sm">Supabase connected</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Transactions Working</div>
                  <div className="text-gray-400 text-sm">Real money tracking</div>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">AI Analysis Ready</div>
                  <div className="text-gray-400 text-sm">Smart insights</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Next Steps */}
        {allTestsPassed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">🚀 Next Steps</h3>
            <div className="space-y-2 text-gray-300">
              <p>✅ Your real financial tracking system is now ready!</p>
              <p>✅ Go to the main dashboard to start tracking real transactions</p>
              <p>✅ Add your actual income and expenses</p>
              <p>✅ Get AI-powered insights based on your real spending</p>
              <p>✅ Set financial goals and track progress</p>
            </div>
            <div className="mt-4">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Go to Dashboard
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
