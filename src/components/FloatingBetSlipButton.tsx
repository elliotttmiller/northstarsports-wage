import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useAnimation } from 'framer-motion'
import { Receipt } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { useBetSlip } from '@/context/BetSlipContext'
import { cn } from '@/lib/utils'

interface Position {
  x: number
  y: number
}

interface FloatingBetSlipButtonProps {
  onToggle: () => void
}

export function FloatingBetSlipButton({ onToggle }: FloatingBetSlipButtonProps) {
  const { betSlip } = useBetSlip()
  const [savedPosition, setSavedPosition] = useKV<Position>('bet-slip-button-position', { x: 0, y: 0 })
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const controls = useAnimation()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const hasMoved = useRef(false)
  const initialPosition = useRef({ x: 0, y: 0 })
  const dragStartTime = useRef(0)

  const getDefaultPosition = useCallback(() => {
    const buttonSize = 48
    const margin = 16
    const safeWidth = window.innerWidth
    const safeHeight = window.innerHeight
    
    return {
      x: safeWidth - buttonSize - margin,
      y: safeHeight - buttonSize - margin - 80 // Account for bottom nav
    }
  }, [])

  // Initialize position
  useEffect(() => {
    if (typeof window === 'undefined') return

    const defaultPos = getDefaultPosition()
    const initialPos = savedPosition && savedPosition.x !== 0 && savedPosition.y !== 0 
      ? savedPosition 
      : defaultPos
    
    x.set(initialPos.x)
    y.set(initialPos.y)
    setIsInitialized(true)
  }, [savedPosition, getDefaultPosition, x, y])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isInitialized) return
      
      const currentX = x.get()
      const currentY = y.get()
      const buttonSize = 48
      const margin = 16
      const maxX = window.innerWidth - buttonSize - margin
      const maxY = window.innerHeight - buttonSize - margin - 80
      
      // Keep button within bounds
      if (currentX > maxX) {
        x.set(maxX)
      }
      if (currentY > maxY) {
        y.set(maxY)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [x, y, isInitialized])

  const handleDragStart = () => {
    setIsDragging(true)
    hasMoved.current = false
    dragStartTime.current = Date.now()
    initialPosition.current = { x: x.get(), y: y.get() }
  }

  const handleDrag = () => {
    const currentX = x.get()
    const currentY = y.get()
    
    const buttonSize = 48
    const margin = 16
    const maxX = window.innerWidth - buttonSize - margin
    const maxY = window.innerHeight - buttonSize - margin - 80
    
    // Constrain to viewport bounds
    if (currentX < margin) x.set(margin)
    if (currentX > maxX) x.set(maxX)
    if (currentY < margin) y.set(margin)
    if (currentY > maxY) y.set(maxY)
    
    // Track if user has moved significantly
    const deltaX = Math.abs(currentX - initialPosition.current.x)
    const deltaY = Math.abs(currentY - initialPosition.current.y)
    if (deltaX > 5 || deltaY > 5) {
      hasMoved.current = true
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    
    // Save position
    const finalPos = { x: x.get(), y: y.get() }
    setSavedPosition(finalPos)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Only trigger click if not dragged and drag was quick
    const dragDuration = Date.now() - dragStartTime.current
    if (!hasMoved.current && dragDuration < 300) {
      onToggle()
    }
  }

  if (!isInitialized) return null

  return (
    <motion.div
      className="fixed z-50 pointer-events-auto"
      style={{
        x,
        y,
        touchAction: 'none'
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileHover={!isDragging ? { scale: 1.05 } : {}}
      whileTap={!isDragging ? { scale: 0.95 } : {}}
      onClick={handleClick}
    >
      <div className={cn(
        "relative w-12 h-12 rounded-full flex items-center justify-center",
        "bg-accent/90 backdrop-blur-sm border border-accent/20",
        "shadow-lg transition-colors duration-200",
        "cursor-pointer select-none",
        isDragging && "cursor-grabbing scale-105"
      )}>
        <Receipt className="w-5 h-5 text-accent-foreground" weight="fill" />
        
        {betSlip.bets.length > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium">
            {betSlip.bets.length}
          </div>
        )}
      </div>
    </motion.div>
  )
}