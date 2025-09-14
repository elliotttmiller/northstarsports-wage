import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion'
import { useNavigation } from '@/context/NavigationContext'
import { useBetSlip } from '@/context/BetSlipContext'
import { Receipt } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface Position {
  x: number
  y: number
}

export function FloatingBetSlipButton() {
  const { setMobilePanel } = useNavigation()
  const { betSlip } = useBetSlip()
  const [savedPosition, setSavedPosition] = useKV<Position>("floating-button-position", { x: 0, y: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const controls = useAnimation()
  
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

  // Initialize position on mount
  useEffect(() => {
    if (!savedPosition) return
    
    const initPosition = savedPosition.x === 0 && savedPosition.y === 0 
      ? getDefaultPosition() 
      : savedPosition
    
    x.set(initPosition.x)
    y.set(initPosition.y)
    setIsInitialized(true)
  }, [savedPosition, getDefaultPosition, x, y])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const currentX = x.get()
      const currentY = y.get()
      const buttonSize = 48
      const margin = 16

      const maxX = window.innerWidth - buttonSize - margin
      const maxY = window.innerHeight - buttonSize - margin - 80
      
      const newX = Math.min(Math.max(margin, currentX), maxX)
      const newY = Math.min(Math.max(margin, currentY), maxY)
      
      if (newX !== currentX || newY !== currentY) {
        x.set(newX)
        y.set(newY)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [x, y])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    hasMoved.current = false
    initialPosition.current = { x: x.get(), y: y.get() }
    dragStartTime.current = Date.now()
  }, [x, y])

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2)
    
    if (dragDistance > 5) {
      hasMoved.current = true
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    const dragDuration = Date.now() - dragStartTime.current
    const wasIntentionalDrag = hasMoved.current && dragDuration > 100
    
    if (wasIntentionalDrag) {
      const currentX = x.get()
      const currentY = y.get()
      setSavedPosition({ x: currentX, y: currentY })
    } else {
      // Handle tap - open bet slip modal
      setMobilePanel('betslip')
    }

    // Reset all states
    setIsDragging(false)
    hasMoved.current = false
  }, [x, y, setSavedPosition, setMobilePanel])

  if (!isInitialized) return null

  const itemCount = betSlip.bets.length

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        style={{ 
          x, 
          y, 
          position: 'absolute',
          pointerEvents: 'auto'
        }}
        drag
        initial={false}
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{
          top: 16,
          left: 16,
          right: typeof window !== 'undefined' ? window.innerWidth - 64 : 300,
          bottom: typeof window !== 'undefined' ? window.innerHeight - 144 : 500
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileHover={!isDragging ? { scale: 1.05 } : {}}
        whileTap={!isDragging ? { scale: 0.95 } : {}}
        className="relative cursor-pointer"
      >
        <div className="
          w-12 h-12 rounded-full 
          bg-accent/80 backdrop-blur-sm text-accent-foreground
          flex items-center justify-center
          shadow-lg border border-border/50
          hover:bg-accent/90
          transition-colors duration-200
        ">
          <Receipt weight="fill" size={20} />
          
          {itemCount > 0 && (
            <div className="
              absolute -top-1 -right-1 
              w-5 h-5 rounded-full 
              bg-primary text-primary-foreground 
              flex items-center justify-center 
              text-xs font-medium
              border-2 border-background
            ">
              {itemCount}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}