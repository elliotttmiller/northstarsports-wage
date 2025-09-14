import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useMotionValue, PanInfo } from 'framer-motion'
import { Plus } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { useNavigation } from '@/context/NavigationContext'
import { useBetSlip } from '@/context/BetSlipContext'

interface Position {
  x: number
  y: number
}

export function FloatingBetSlipButton() {
  const { navigation, setMobilePanel } = useNavigation()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [savedPosition, setSavedPosition] = useKV<Position>('floating-button-position', { x: 0, y: 0 })
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const dragStartTime = useRef(0)
  const initialPosition = useRef<Position>({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  
  const { betSlip } = useBetSlip()
  const isModalOpen = navigation.mobilePanel === 'betslip'

  // Initialize position
  const getDefaultPosition = useCallback((): Position => {
    const buttonSize = 48
    const margin = 16
    const safeWidth = typeof window !== 'undefined' ? window.innerWidth : 375
    const safeHeight = typeof window !== 'undefined' ? window.innerHeight : 667
    
    return {
      x: safeWidth - buttonSize - margin,
      y: safeHeight - buttonSize - margin - 80 // Account for bottom nav
    }
  }, [])

  // Initialize position on mount
  useEffect(() => {
    const defaultPos = getDefaultPosition()
    const initPosition = (savedPosition && savedPosition.x !== 0 && savedPosition.y !== 0) 
      ? savedPosition 
      : defaultPos
    
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
    
    setIsDragging(false)

    const wasIntentionalDrag = hasMoved.current && dragDuration > 100
    
    if (wasIntentionalDrag && savedPosition) {
      const currentX = x.get()
      const currentY = y.get()
      setSavedPosition({ x: currentX, y: currentY })
    } else {
      // Handle tap - open bet slip modal
      setMobilePanel(isModalOpen ? null : 'betslip')
    }

    // Reset all states
    hasMoved.current = false
  }, [x, y, setSavedPosition, setMobilePanel, isModalOpen, savedPosition])

  if (!isInitialized) return null

  return (
    <motion.div
      className="pointer-events-auto"
      style={{ 
        x, 
        y, 
        position: 'absolute',
        zIndex: 50
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        left: 16,
        right: typeof window !== 'undefined' ? window.innerWidth - 64 : 300,
        top: 16,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 144 : 500
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileHover={!isDragging ? { 
        scale: 1.05,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!isDragging ? { 
        scale: 0.95,
        transition: { duration: 0.15 }
      } : {}}
      initial={{ scale: 0, opacity: 0, rotate: -10 }}
      animate={{ 
        opacity: isModalOpen ? 0.3 : 0.9, 
        scale: 1, 
        rotate: 0
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            repeatDelay: 3
          }}
          className={`
            w-12 h-12 rounded-full shadow-lg cursor-pointer
            bg-accent text-accent-foreground
            flex items-center justify-center
            backdrop-blur-sm border border-accent/20
            ${isDragging ? 'shadow-2xl' : 'shadow-lg'}
          `}
        >
          <Plus 
            size={20} 
            weight="bold"
            className="transition-transform duration-200"
          />
        </motion.div>

        {/* Bet count badge */}
        {betSlip.bets && betSlip.bets.length > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{
              scale: 0,
              rotate: 180,
              transition: { duration: 0.2 }
            }}
            transition={{
              type: "spring", 
              damping: 25,
              stiffness: 400
            }}
            layoutId="bet-count"
            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-md"
          >
            {betSlip.bets?.length || 0}
          </motion.div>
        )}

        {/* Dragging ripple effect */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent/30"
            animate={{ 
              scale: [1, 2.5],
              opacity: [0.6, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </div>
    </motion.div>
  )
}