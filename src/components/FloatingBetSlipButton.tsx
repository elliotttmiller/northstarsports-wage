import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion'
import { useBetSlip } from '@/context/BetSlipContext'
import { useNavigation } from '@/context/NavigationContext'
import { useKV } from '@github/spark/hooks'
import { Plus } from '@phosphor-icons/react'

interface Position {
  x: number
  y: number
}

export const FloatingBetSlipButton = () => {
  const { betSlip } = useBetSlip()
  const { navigation, setMobilePanel } = useNavigation()
  const [savedPosition, setSavedPosition] = useKV<Position>('floating-button-position', { x: 0, y: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const controls = useAnimation()
  
  const hasMoved = useRef(false)
  const dragStartTime = useRef(0)
  const totalDragDistance = useRef(0)
  const initialPosition = useRef<Position>({ x: 0, y: 0 })
  
  const isModalOpen = navigation.mobilePanel === 'betslip'
  
  // Initialize position
  const getDefaultPosition = useCallback(() => {
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
    if (typeof window === 'undefined') return
    
    const initPosition = (!savedPosition || (savedPosition.x === 0 && savedPosition.y === 0))
      ? getDefaultPosition() 
      : savedPosition
    
    x.set(initPosition.x)
    y.set(initPosition.y)
    setIsInitialized(true)
  }, [savedPosition, x, y, getDefaultPosition])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      const currentX = x.get()
      const currentY = y.get()
      const buttonSize = 48
      const margin = 16
      
      // Ensure button stays within new viewport bounds
      const maxX = window.innerWidth - buttonSize - margin
      const maxY = window.innerHeight - buttonSize - margin - 80
      
      const newX = Math.min(Math.max(margin, currentX), maxX)
      const newY = Math.min(Math.max(margin, currentY), maxY)
      
      if (newX !== currentX || newY !== currentY) {
        x.set(newX)
        y.set(newY)
        setSavedPosition({ x: newX, y: newY })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [x, y, setSavedPosition, isInitialized])

  const handleDragStart = () => {
    if (!isInitialized) return
    dragStartTime.current = Date.now()
    hasMoved.current = false
    totalDragDistance.current = 0
    initialPosition.current = { x: x.get(), y: y.get() }
    setIsDragging(false)
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isInitialized) return
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2)
    totalDragDistance.current = dragDistance
    
    // Only start visual dragging state after significant movement
    if (dragDistance > 8 && !hasMoved.current) {
      hasMoved.current = true
      setIsDragging(true)
    }
  }

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isInitialized) return
    const dragDuration = Date.now() - dragStartTime.current
    const totalDistance = totalDragDistance.current
    
    // Determine if this was an intentional drag or just a tap
    const wasIntentionalDrag = totalDistance > 12 || (dragDuration > 150 && totalDistance > 6)
    
    if (wasIntentionalDrag && hasMoved.current) {
      // Handle drag - save new position
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
    totalDragDistance.current = 0
  }

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
        {betSlip.bets.length > 0 && (
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
            {betSlip.bets.length}
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