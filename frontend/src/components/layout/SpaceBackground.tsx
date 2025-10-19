'use client'

import { useEffect, useRef } from 'react'

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Floating particles array
    const particles: Array<{
      x: number
      y: number
      size: number
      opacity: number
      speed: number
      direction: number
    }> = []

    // Create floating particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        direction: Math.random() * Math.PI * 2
      })
    }

    // Grid properties
    const gridSize = 60
    let gridOffset = 0

    // Animation loop
    const animate = () => {
      // Clear canvas with light background
      ctx.fillStyle = 'rgba(248, 250, 252, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.08)'
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = gridOffset; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = gridOffset; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Animate grid
      gridOffset += 0.1
      if (gridOffset >= gridSize) {
        gridOffset = 0
      }

      // Draw and animate particles
      particles.forEach(particle => {
        particle.x += Math.cos(particle.direction) * particle.speed
        particle.y += Math.sin(particle.direction) * particle.speed
        
        // Wrap around screen
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        if (particle.y < 0) particle.y = canvas.height

        // Create gradient for particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        gradient.addColorStop(0, `rgba(100, 116, 139, ${particle.opacity})`)
        gradient.addColorStop(1, 'rgba(100, 116, 139, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw subtle energy lines
      const time = Date.now() * 0.0005
      
      // Horizontal energy line
      const energyY = (Math.sin(time * 0.8) * 0.2 + 0.5) * canvas.height
      const gradient1 = ctx.createLinearGradient(0, energyY, canvas.width, energyY)
      gradient1.addColorStop(0, 'rgba(100, 116, 139, 0)')
      gradient1.addColorStop(0.5, 'rgba(100, 116, 139, 0.15)')
      gradient1.addColorStop(1, 'rgba(100, 116, 139, 0)')
      
      ctx.strokeStyle = gradient1
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, energyY)
      ctx.lineTo(canvas.width, energyY)
      ctx.stroke()

      // Vertical energy line
      const energyX = (Math.sin(time * 0.6) * 0.2 + 0.5) * canvas.width
      const gradient2 = ctx.createLinearGradient(energyX, 0, energyX, canvas.height)
      gradient2.addColorStop(0, 'rgba(217, 70, 239, 0)')
      gradient2.addColorStop(0.5, 'rgba(217, 70, 239, 0.1)')
      gradient2.addColorStop(1, 'rgba(217, 70, 239, 0)')
      
      ctx.strokeStyle = gradient2
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(energyX, 0)
      ctx.lineTo(energyX, canvas.height)
      ctx.stroke()

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(226, 232, 240, 0.95) 100%)'
      }}
    />
  )
}
