'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, Stars, Environment } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Portfolio data
const portfolioData = [
  { name: 'AAPL', value: 450000, sector: 'Technology', color: '#00d4ff', return: 12.5 },
  { name: 'GOOGL', value: 380000, sector: 'Technology', color: '#ff6b00', return: 8.3 },
  { name: 'MSFT', value: 420000, sector: 'Technology', color: '#00ff88', return: 15.2 },
  { name: 'TSLA', value: 320000, sector: 'Automotive', color: '#ff0080', return: -5.1 },
  { name: 'AMZN', value: 510000, sector: 'E-commerce', color: '#8000ff', return: 22.7 },
  { name: 'NVDA', value: 290000, sector: 'Technology', color: '#ff4000', return: 45.2 },
  { name: 'META', value: 230000, sector: 'Social Media', color: '#00ffff', return: -8.4 },
  { name: 'NFLX', value: 180000, sector: 'Entertainment', color: '#ffff00', return: 18.9 }
]

// Interactive Data Sphere Component
function DataSphere({ 
  position, 
  data, 
  onClick, 
  isSelected 
}: { 
  position: [number, number, number]
  data: typeof portfolioData[0]
  onClick: () => void
  isSelected: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textRef = useRef<THREE.Group>(null)
  
  // Calculate sphere size based on portfolio value
  const radius = Math.max(0.3, (data.value / 500000) * 0.8)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      
      if (isSelected) {
        meshRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
    
    if (textRef.current) {
      textRef.current.lookAt(state.camera.position)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        {/* Main Sphere */}
        <mesh 
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={data.color}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.8}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Glow Effect */}
        <mesh>
          <sphereGeometry args={[radius * 1.2, 32, 32]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Orbit Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 1.6, 32]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Stock Symbol Text */}
        <group ref={textRef} position={[0, radius + 0.3, 0]}>
          <Text
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {data.name}
          </Text>
        </group>
        
        {/* Value Text */}
        <group ref={textRef} position={[0, -radius - 0.3, 0]}>
          <Text
            fontSize={0.1}
            color={data.return >= 0 ? '#10b981' : '#ef4444'}
            anchorX="center"
            anchorY="middle"
          >
            {data.return >= 0 ? '+' : ''}{data.return.toFixed(1)}%
          </Text>
        </group>
        
        {/* Point Light */}
        <pointLight
          color={data.color}
          intensity={isSelected ? 2 : 1}
          distance={5}
        />
      </group>
    </Float>
  )
}

// Simplified connection effects without complex geometry

// Main 3D Scene
function Scene() {
  const [selectedSphere, setSelectedSphere] = useState<number | null>(null)
  
  const spherePositions = useMemo(() => {
    return portfolioData.map((_, index) => {
      const angle = (index / portfolioData.length) * Math.PI * 2
      const radius = 3
      return [
        Math.cos(angle) * radius,
        Math.sin(index * 0.3) * 2,
        Math.sin(angle) * radius
      ] as [number, number, number]
    })
  }, [])

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Environment preset="night" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {portfolioData.map((data, index) => (
        <DataSphere
          key={data.name}
          position={spherePositions[index]}
          data={data}
          onClick={() => setSelectedSphere(selectedSphere === index ? null : index)}
          isSelected={selectedSphere === index}
        />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
        maxDistance={15}
        minDistance={5}
      />
    </>
  )
}

export default function Portfolio3D() {
  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [8, 5, 8], fov: 75 }}
        className="w-full h-full"
      >
        <Scene />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 glass rounded-xl p-4 max-w-sm">
        <h4 className="text-lg font-semibold text-white mb-2">Portfolio Universe</h4>
        <p className="text-gray-300 text-sm mb-3">
          Interactive 3D visualization of your investment portfolio. 
          Click on spheres to explore individual assets.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-xs text-gray-300">Positive Returns</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-xs text-gray-300">Negative Returns</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-400 animate-pulse"></div>
            <span className="text-xs text-gray-300">Size = Portfolio Weight</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 glass rounded-xl p-4">
        <div className="text-white text-sm space-y-1">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>👆 Click spheres to select</div>
        </div>
      </div>
      
      {/* Performance Summary */}
      <motion.div 
        className="absolute top-4 right-4 glass rounded-xl p-4 max-w-xs"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <h4 className="text-lg font-semibold text-white mb-3">Portfolio Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Total Value</span>
            <span className="text-white font-semibold">$2.78M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Total Return</span>
            <span className="text-green-400 font-semibold">+14.2%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Best Performer</span>
            <span className="text-accent-400 font-semibold">NVDA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Diversification</span>
            <span className="text-primary-400 font-semibold">8 Assets</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
