'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Brain, 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  Crown,
  ChevronDown,
  Globe,
  Star
} from 'lucide-react'

export default function PremiumNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    {
      name: 'Platform',
      href: '/dashboard',
      dropdown: [
        { name: 'Personal Finance', href: '/dashboard/personal-finance', icon: Brain, description: 'AI-powered personal finance management' },
        { name: 'Investment Intelligence', href: '/dashboard/portfolio', icon: Zap, description: 'Smart investment strategies' },
        { name: 'Wealth Analytics', href: '/dashboard/ai-analysis', icon: Sparkles, description: 'Advanced wealth insights' }
      ]
    },
    {
      name: 'Solutions',
      href: '#solutions',
      dropdown: [
        { name: 'For Individuals', href: '/dashboard/personal-finance', icon: Star, description: 'Personal wealth management' },
        { name: 'For Families', href: '/dashboard/portfolio', icon: Shield, description: 'Family financial planning' },
        { name: 'For Advisors', href: '/dashboard/ai-insights', icon: Crown, description: 'Professional tools' }
      ]
    },
    { name: 'Portfolio', href: '/dashboard/portfolio' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' }
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-black/90 backdrop-blur-xl border-b border-purple-500/20 shadow-lg' 
            : 'bg-black/20 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Premium Logo */}
            <motion.div 
              className="flex items-center space-x-3 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push('/')}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-slate-950 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  DhanAi
                </h1>
                <p className="text-xs text-purple-300 font-medium tracking-wide">INTELLIGENT FINANCE</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors duration-300 font-medium group"
                    onClick={(e) => {
                      // Check if user is trying to access dashboard routes
                      if (item.href.startsWith('/dashboard')) {
                        e.preventDefault()
                        // Redirect to signup with return URL
                        router.push(`/auth/signup?returnUrl=${encodeURIComponent(item.href)}`)
                      }
                    }}
                  >
                    <span>{item.name}</span>
                    {item.dropdown && (
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    )}
                  </Link>

                  {/* Premium Dropdown */}
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
                      >
                        <div className="p-2">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="flex items-start space-x-3 p-4 rounded-xl hover:bg-slate-800/50 transition-all duration-300 group"
                              onClick={(e) => {
                                // Check if user is trying to access dashboard routes
                                if (dropdownItem.href.startsWith('/dashboard')) {
                                  e.preventDefault()
                                  // Redirect to signup with return URL
                                  router.push(`/auth/signup?returnUrl=${encodeURIComponent(dropdownItem.href)}`)
                                }
                              }}
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                                <dropdownItem.icon className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                                  {dropdownItem.name}
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">
                                  {dropdownItem.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Premium CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/login"
                  className="px-4 xl:px-6 py-2.5 text-slate-300 hover:text-white transition-colors duration-300 font-medium border border-slate-600/50 hover:border-slate-500 rounded-lg text-sm xl:text-base"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/signup"
                  className="relative px-4 xl:px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-semibold rounded-lg overflow-hidden group shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-1 xl:space-x-2">
                    <span className="text-sm xl:text-base">Start Free Trial</span>
                    <Crown className="w-3 h-3 xl:w-4 xl:h-4 flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/50"
            >
              <div className="container mx-auto px-6 py-6">
                <div className="space-y-4">
                  {navigationItems.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className="block text-slate-300 hover:text-white transition-colors font-medium py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      {item.dropdown && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="flex items-center space-x-3 text-slate-400 hover:text-emerald-400 transition-colors py-2"
                              onClick={(e) => {
                                setIsMobileMenuOpen(false)
                                // Check if user is trying to access dashboard routes
                                if (dropdownItem.href.startsWith('/dashboard')) {
                                  e.preventDefault()
                                  // Redirect to signup with return URL
                                  router.push(`/auth/signup?returnUrl=${encodeURIComponent(dropdownItem.href)}`)
                                }
                              }}
                            >
                              <dropdownItem.icon className="w-4 h-4" />
                              <span className="text-sm">{dropdownItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-slate-800/50 space-y-4">
                    <Link
                      href="/auth/login"
                      className="block w-full px-6 py-3 text-slate-300 hover:text-white transition-colors font-medium border border-slate-600/50 hover:border-slate-500 rounded-xl text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl text-center shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>Start Free Trial</span>
                      <Crown className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  )
}
