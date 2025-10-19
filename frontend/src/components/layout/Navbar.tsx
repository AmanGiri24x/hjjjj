'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, TrendingUp, Bot, Settings, User, LogIn, Brain } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const guestNavItems = [
  { name: 'Finance AI', href: '#finance-ai', icon: Bot },
  { name: 'Trading', href: '#trading-platform', icon: TrendingUp },
  { name: 'Features', href: '#features', icon: Settings },
  { name: 'Solutions', href: '#solutions', icon: Zap },
]

const userNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
  { name: 'Portfolios', href: '/dashboard/portfolios', icon: Zap },
  { name: 'AI Insights', href: '/dashboard/insights', icon: Bot },
  { name: 'Credit Scoring', href: '/dashboard/credit-scoring', icon: Brain },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const navItems = isAuthenticated ? userNavItems : guestNavItems

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      // Update active section based on scroll position (only for guest nav)
      if (!isAuthenticated) {
        const sections = navItems.map(item => item.href.substring(1))
        const currentSection = sections.find(section => {
          const element = document.getElementById(section)
          if (element) {
            const rect = element.getBoundingClientRect()
            return rect.top <= 100 && rect.bottom >= 100
          }
          return false
        })
        
        setActiveSection(currentSection || '')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAuthenticated, navItems])

  const handleNavigation = (href: string) => {
    if (isAuthenticated) {
      // For authenticated users, navigate to the actual page
      router.push(href)
    } else {
      // For guest users, scroll to section on landing page
      const element = document.getElementById(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DhanAillytics
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    (isAuthenticated && window.location.pathname === item.href) ||
                    (!isAuthenticated && activeSection === item.href.substring(1))
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-primary-700">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user?.first_name}</span>
                </div>
                <Link href="/dashboard">
                  <motion.button
                    className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-lg font-medium neon-blue hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dashboard
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    className="px-4 py-2 text-primary-700 hover:text-primary-800 border border-primary-200/50 rounded-lg hover:bg-primary-100/20 transition-all duration-200 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-lg font-medium neon-blue hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary-700 hover:text-primary-800 p-2 rounded-lg hover:bg-primary-100/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/30 backdrop-blur-xl border-t border-primary-200/30"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
                    (isAuthenticated && window.location.pathname === item.href) ||
                    (!isAuthenticated && activeSection === item.href.substring(1))
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                      : 'text-primary-700 hover:text-primary-800 hover:bg-primary-100/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.button>
              ))}
              {!isAuthenticated && (
                <Link href="/signup">
                  <motion.button
                    className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-3 rounded-lg font-medium mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
