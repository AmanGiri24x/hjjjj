'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { TrendingUp, TrendingDown, Info, Star, Bookmark } from 'lucide-react'

interface PlanetData {
  id: string
  symbol: string
  name: string
  sector: string
  color: string
  size: number
  orbitRadius: number
  orbitSpeed: number
  price: number
  change: number
  changePercent: number
  marketCap: number
  volume: number
}

interface CompanyDetails {
  symbol: string
  name: string
  sector: string
  industry?: string
  description?: string
  website?: string
  marketCap: number
  price: number
  change: number
  changePercent: number
  volume: number
  peRatio?: number
  dividendYield?: number
  high52w?: number
  low52w?: number
  beta?: number
}

// Planet component that orbits around the center
function Planet({ 
  planet, 
  onClick, 
  isSelected, 
  savedStocks, 
  onSave 
}: { 
  planet: PlanetData
  onClick: (planet: PlanetData) => void
  isSelected: boolean
  savedStocks: Set<string>
  onSave: (symbol: string) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2)

  useFrame((state, delta) => {
    // Orbit around center
    setAngle(prev => prev + planet.orbitSpeed * delta)
    
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angle) * planet.orbitRadius
      meshRef.current.position.z = Math.sin(angle) * planet.orbitRadius
      
      // Rotate the planet
      meshRef.current.rotation.y += delta * 0.5
      
      // Hover effect
      if (hovered || isSelected) {
        meshRef.current.scale.setScalar(1.2)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  const isSaved = savedStocks.has(planet.symbol)
  const isPositive = planet.changePercent >= 0

  return (
    <group>
      {/* Planet */}
      <mesh
        ref={meshRef}
        onClick={() => onClick(planet)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial 
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={hovered || isSelected ? 0.3 : 0.1}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Orbit trail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.orbitRadius - 0.1, planet.orbitRadius + 0.1, 64]} />
        <meshBasicMaterial 
          color={planet.color} 
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Company name label */}
      {(hovered || isSelected) && (
        <Html position={[Math.cos(angle) * planet.orbitRadius, planet.size + 2, Math.sin(angle) * planet.orbitRadius]}>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2">
              <span className="font-bold">{planet.symbol}</span>
              {isSaved && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
            </div>
            <div className="text-xs text-gray-300">{planet.name}</div>
            <div className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              ₹{planet.price.toFixed(2)} ({isPositive ? '+' : ''}{planet.changePercent.toFixed(2)}%)
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Central sun representing the market
function CentralSun() {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshStandardMaterial 
        color="#FFD700"
        emissive="#FFA500"
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.8}
      />
      <Html position={[0, 10, 0]}>
        <div className="text-center">
          <div className="text-white font-bold text-lg">NSE/BSE</div>
          <div className="text-yellow-400 text-sm">Indian Market</div>
        </div>
      </Html>
    </mesh>
  )
}

// Company details modal
function CompanyModal({ 
  company, 
  onClose, 
  onSave, 
  isSaved 
}: { 
  company: CompanyDetails | null
  onClose: () => void
  onSave: (symbol: string) => void
  isSaved: boolean
}) {
  if (!company) return null

  const isPositive = company.changePercent >= 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{company.name}</h2>
            <div className="flex items-center space-x-4">
              <span className="text-primary-400 font-medium">{company.symbol}</span>
              <span className="text-gray-400">{company.sector}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSave(company.symbol)}
              className={`p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-white/10 text-gray-400 hover:text-yellow-400'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="text-gray-400 text-sm">Current Price</div>
            <div className="text-white font-bold text-xl">₹{company.price.toFixed(2)}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-gray-400 text-sm">Change</div>
            <div className={`font-bold text-lg flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {isPositive ? '+' : ''}₹{company.change.toFixed(2)}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-gray-400 text-sm">Change %</div>
            <div className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{company.changePercent.toFixed(2)}%
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-gray-400 text-sm">Volume</div>
            <div className="text-white font-bold">{(company.volume / 1000000).toFixed(2)}M</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="text-gray-400 text-sm">Market Cap</div>
            <div className="text-white font-medium">₹{(company.marketCap / 10000000).toFixed(0)}Cr</div>
          </div>
          {company.peRatio && (
            <div className="glass rounded-xl p-4">
              <div className="text-gray-400 text-sm">P/E Ratio</div>
              <div className="text-white font-medium">{company.peRatio.toFixed(2)}</div>
            </div>
          )}
          {company.dividendYield && (
            <div className="glass rounded-xl p-4">
              <div className="text-gray-400 text-sm">Dividend Yield</div>
              <div className="text-white font-medium">{(company.dividendYield * 100).toFixed(2)}%</div>
            </div>
          )}
          {company.high52w && (
            <div className="glass rounded-xl p-4">
              <div className="text-gray-400 text-sm">52W High</div>
              <div className="text-white font-medium">₹{company.high52w.toFixed(2)}</div>
            </div>
          )}
          {company.low52w && (
            <div className="glass rounded-xl p-4">
              <div className="text-gray-400 text-sm">52W Low</div>
              <div className="text-white font-medium">₹{company.low52w.toFixed(2)}</div>
            </div>
          )}
          {company.beta && (
            <div className="glass rounded-xl p-4">
              <div className="text-gray-400 text-sm">Beta</div>
              <div className="text-white font-medium">{company.beta.toFixed(2)}</div>
            </div>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">About</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {company.description.length > 300 
                ? `${company.description.substring(0, 300)}...` 
                : company.description
              }
            </p>
          </div>
        )}

        {/* Website Link */}
        {company.website && (
          <div className="mt-4">
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Info className="w-4 h-4 mr-2" />
              Visit Website
            </a>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Portfolio3D() {
  const [planets, setPlanets] = useState<PlanetData[]>([])
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null)
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedStocks, setSavedStocks] = useState<Set<string>>(new Set())

  // Fetch 3D visualization data
  const fetch3DData = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/indian-market/3d-data')
      const data = await response.json()
      
      if (data.success) {
        setPlanets(data.planets)
      }
    } catch (error) {
      console.error('Failed to fetch 3D data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch company details
  const fetchCompanyDetails = async (symbol: string) => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/indian-market/company/${symbol}`)
      const data = await response.json()
      
      if (data.success) {
        setCompanyDetails(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch company details:', error)
    }
  }

  useEffect(() => {
    fetch3DData()
    const interval = setInterval(fetch3DData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handlePlanetClick = (planet: PlanetData) => {
    setSelectedPlanet(planet)
    fetchCompanyDetails(planet.symbol)
  }

  const handleSaveStock = (symbol: string) => {
    setSavedStocks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(symbol)) {
        newSet.delete(symbol)
      } else {
        newSet.add(symbol)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] glass rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading 3D Portfolio Universe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] glass rounded-2xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={1} />
        <pointLight position={[50, 50, 50]} intensity={0.5} />
        
        <CentralSun />
        
        {planets.map((planet) => (
          <Planet
            key={planet.id}
            planet={planet}
            onClick={handlePlanetClick}
            isSelected={selectedPlanet?.id === planet.id}
            savedStocks={savedStocks}
            onSave={handleSaveStock}
          />
        ))}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={30}
          maxDistance={200}
        />
      </Canvas>

      {/* Controls */}
      <div className="absolute top-4 left-4 glass rounded-lg p-3">
        <h3 className="text-white font-semibold mb-2">3D Portfolio Universe</h3>
        <p className="text-gray-300 text-sm">Click planets to explore companies</p>
        <p className="text-gray-400 text-xs mt-1">Drag to rotate • Scroll to zoom</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 glass rounded-lg p-3 max-w-xs">
        <h4 className="text-white font-semibold mb-2">Sectors</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-gray-300">Oil & Gas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-teal-400"></div>
            <span className="text-gray-300">IT Services</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-gray-300">Banking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-300">FMCG</span>
          </div>
        </div>
      </div>

      {/* Saved Stocks Counter */}
      {savedStocks.size > 0 && (
        <div className="absolute bottom-4 right-4 glass rounded-lg p-3">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{savedStocks.size} Saved</span>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      <CompanyModal
        company={companyDetails}
        onClose={() => {
          setSelectedPlanet(null)
          setCompanyDetails(null)
        }}
        onSave={handleSaveStock}
        isSaved={companyDetails ? savedStocks.has(companyDetails.symbol) : false}
      />
    </div>
  )
}
