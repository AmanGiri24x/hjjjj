'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Brain,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MessageSquare,
  BarChart3,
  Target,
  AlertCircle,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  recommendations?: any[];
  type?: 'chat' | 'insights' | 'prediction' | 'analysis';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  query: string;
  type: 'chat' | 'insights' | 'prediction' | 'analysis';
}

export default function AiChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'portfolio-analysis',
      label: 'Analyze my portfolio',
      icon: BarChart3,
      query: 'Please analyze my current portfolio and provide insights on diversification, risk, and performance.',
      type: 'insights',
    },
    {
      id: 'market-outlook',
      label: 'Market outlook',
      icon: TrendingUp,
      query: 'What is your outlook on the current market conditions and trends?',
      type: 'prediction',
    },
    {
      id: 'goal-planning',
      label: 'Goal planning',
      icon: Target,
      query: 'Help me plan and track my financial goals.',
      type: 'analysis',
    },
    {
      id: 'tax-optimization',
      label: 'Tax strategies',
      icon: Lightbulb,
      query: 'What tax optimization strategies should I consider for my investments?',
      type: 'insights',
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history on component mount
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/ai/history?limit=20', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const history = await response.json();
        const formattedMessages: Message[] = history.map((item: any) => [
          {
            id: `${item.id}_user`,
            role: 'user' as const,
            content: item.query,
            timestamp: new Date(item.createdAt),
            type: item.type,
          },
          {
            id: item.id,
            role: 'assistant' as const,
            content: item.response,
            timestamp: new Date(item.createdAt),
            confidence: item.confidence,
            type: item.type,
          },
        ]).flat();

        setMessages(formattedMessages.reverse());
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (content: string, type: 'chat' | 'insights' | 'prediction' | 'analysis' = 'chat') => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      type,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const endpoint = type === 'chat' ? '/api/ai/chat' : 
                     type === 'insights' ? '/api/ai/insights' :
                     type === 'prediction' ? '/api/ai/predict' : '/api/ai/analyze';

      const body = type === 'chat' ? 
        { query: content, sessionId } :
        type === 'prediction' ? 
          { predictionType: 'portfolio_performance', context: { query: content } } :
          { context: { query: content } };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const aiResponse = await response.json();

      const assistantMessage: Message = {
        id: aiResponse.id,
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(aiResponse.timestamp),
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        recommendations: aiResponse.recommendations,
        type,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
        confidence: 0,
        type,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.query, action.type);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
          }`}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>

          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {/* Message Metadata */}
            {!isUser && (
              <div className="mt-3 space-y-2">
                {/* Confidence Score */}
                {message.confidence !== undefined && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Brain className="h-3 w-3" />
                    <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <div className="font-medium mb-1">Sources:</div>
                    <div className="space-y-1">
                      {message.sources.map((source, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-sm font-medium text-blue-800 mb-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Recommendations</span>
                    </div>
                    <div className="space-y-2">
                      {message.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="text-sm text-blue-700">
                          <div className="font-medium">{rec.title}</div>
                          {rec.description && (
                            <div className="text-blue-600 mt-1">{rec.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy message"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Helpful"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Not helpful"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-400'
            }`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Financial Advisor</h1>
              <p className="text-sm text-gray-600">Your intelligent financial companion</p>
            </div>
          </div>
          <button
            onClick={loadChatHistory}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh chat"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to your AI Financial Advisor</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              I'm here to help you with portfolio analysis, market insights, financial planning, and investment strategies.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      {React.createElement(action.icon, { className: "h-5 w-5 text-blue-600" })}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{action.label}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {action.query.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="flex items-start space-x-3 max-w-4xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
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
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about your finances, investments, or market insights..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <span className="text-xs text-gray-400">
                {inputValue.length}/500
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        {/* Quick Action Buttons */}
        {messages.length > 0 && (
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-xs text-gray-500">Quick actions:</span>
            {quickActions.slice(0, 2).map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
