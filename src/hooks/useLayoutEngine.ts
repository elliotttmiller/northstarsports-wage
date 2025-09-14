import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'

// Layout preferences type
interface LayoutPreferences {
  compactMode: boolean
  animationsEnabled: boolean
  virtualScrollEnabled: boolean
}

// Layout engine configuration types
export interface LayoutConfig {
  desktop: {
    columns: number
    gap: number
    minCardHeight: number
    maxCardHeight: number
    cardAspectRatio: number
  }
  mobile: {
    columns: number
    gap: number
    minCardHeight: number
    maxCardHeight: number
    cardAspectRatio: number
  }
  virtualization: {
    enabled: boolean
    overscan: number
    threshold: number
  }
  animation: {
    duration: number
    easing: string
    stagger: number
  }
}

// Default layout configuration optimized for game cards
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  desktop: {
    columns: 1, // Single column for full-width cards
    gap: 16,
    minCardHeight: 120,
    maxCardHeight: 400,
    cardAspectRatio: 16 / 9
  },
  mobile: {
    columns: 1, // Single column for mobile
    gap: 12,
    minCardHeight: 280,
    maxCardHeight: 600,
    cardAspectRatio: 16 / 11
  },
  virtualization: {
    enabled: true,
    overscan: 3,
    threshold: 20
  },
  animation: {
    duration: 300,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    stagger: 50
  }
}

// Card position and state tracking
export interface CardState {
  id: string
  x: number
  y: number
  width: number
  height: number
  isVisible: boolean
  isExpanded: boolean
  zIndex: number
  opacity: number
  scale: number
}

// Viewport and scroll tracking
export interface ViewportState {
  width: number
  height: number
  scrollTop: number
  scrollLeft: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// Layout engine hook
export function useLayoutEngine(itemIds: string[], config?: Partial<LayoutConfig>) {
  const [layoutConfig] = useState<LayoutConfig>({ 
    ...DEFAULT_LAYOUT_CONFIG, 
    ...config 
  })
  
  // Persistent layout preferences
  const [layoutPrefs, setLayoutPrefs] = useKV<LayoutPreferences>('layout-preferences', {
    compactMode: false,
    animationsEnabled: true,
    virtualScrollEnabled: true
  })
  
  // Current viewport state
  const [viewport, setViewport] = useState<ViewportState>({
    width: 0,
    height: 0,
    scrollTop: 0,
    scrollLeft: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })
  
  // Card states map
  const [cardStates, setCardStates] = useState<Map<string, CardState>>(new Map())
  
  // Container reference for calculations
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Layout calculation state
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastCalculation, setLastCalculation] = useState<number>(0)
  
  // Visible range for virtualization
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: itemIds.length })
  
  // Update viewport state
  const updateViewport = useCallback(() => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const scrollTop = containerRef.current.scrollTop
    const scrollLeft = containerRef.current.scrollLeft
    
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const isDesktop = width >= 1024
    
    setViewport({
      width,
      height,
      scrollTop,
      scrollLeft,
      isMobile,
      isTablet,
      isDesktop
    })
  }, [])
  
  // Calculate card positions and states
  const calculateLayout = useCallback(() => {
    if (!containerRef.current || itemIds.length === 0) return
    
    setIsCalculating(true)
    const startTime = performance.now()
    
    const { isMobile } = viewport
    const currentConfig = isMobile ? layoutConfig.mobile : layoutConfig.desktop
    const { columns, gap, minCardHeight } = currentConfig
    
    const containerWidth = viewport.width
    const cardWidth = (containerWidth - (gap * (columns - 1))) / columns
    
    const newCardStates = new Map<string, CardState>()
    let currentX = 0
    let currentY = 0
    let maxHeightInRow = 0
    let cardsInCurrentRow = 0
    
    itemIds.forEach((id, index) => {
      const existingState = cardStates.get(id)
      
      // Calculate card height (could be dynamic based on content)
      const cardHeight = existingState?.isExpanded 
        ? Math.max(minCardHeight * 1.5, minCardHeight)
        : minCardHeight
      
      // Check if we need to wrap to next row
      if (cardsInCurrentRow >= columns) {
        currentX = 0
        currentY += maxHeightInRow + gap
        maxHeightInRow = 0
        cardsInCurrentRow = 0
      }
      
      // Update max height for current row
      maxHeightInRow = Math.max(maxHeightInRow, cardHeight)
      
      // Determine visibility for virtualization
      const cardBottom = currentY + cardHeight
      const isVisible = layoutConfig.virtualization.enabled
        ? (cardBottom >= viewport.scrollTop - 200 && 
           currentY <= viewport.scrollTop + viewport.height + 200)
        : true
      
      const cardState: CardState = {
        id,
        x: currentX,
        y: currentY,
        width: cardWidth,
        height: cardHeight,
        isVisible,
        isExpanded: existingState?.isExpanded ?? false,
        zIndex: existingState?.isExpanded ? 10 : 1,
        opacity: isVisible ? 1 : 0,
        scale: existingState?.isExpanded ? 1.02 : 1
      }
      
      newCardStates.set(id, cardState)
      
      // Move to next position
      currentX += cardWidth + gap
      cardsInCurrentRow++
    })
    
    setCardStates(newCardStates)
    
    // Update visible range for virtualization
    if (layoutConfig.virtualization.enabled) {
      const visibleCards = Array.from(newCardStates.values())
        .filter(card => card.isVisible)
        .map(card => itemIds.indexOf(card.id))
      
      if (visibleCards.length > 0) {
        const start = Math.max(0, Math.min(...visibleCards) - layoutConfig.virtualization.overscan)
        const end = Math.min(itemIds.length, Math.max(...visibleCards) + layoutConfig.virtualization.overscan)
        setVisibleRange({ start, end })
      }
    }
    
    const endTime = performance.now()
    setLastCalculation(endTime - startTime)
    setIsCalculating(false)
  }, [viewport, itemIds, cardStates, layoutConfig])
  
  // Handle card expansion/collapse
  const toggleCard = useCallback((cardId: string) => {
    setCardStates(prev => {
      const newStates = new Map(prev)
      const cardState = newStates.get(cardId)
      
      if (cardState) {
        const isExpanding = !cardState.isExpanded
        
        newStates.set(cardId, {
          ...cardState,
          isExpanded: isExpanding,
          zIndex: isExpanding ? 10 : 1,
          scale: isExpanding ? 1.02 : 1
        })
      }
      
      return newStates
    })
    
    // Recalculate layout after state change
    setTimeout(calculateLayout, 0)
  }, [calculateLayout])
  
  // Scroll event handler with throttling
  const handleScroll = useCallback(() => {
    updateViewport()
  }, [updateViewport])
  
  // Resize event handler with debouncing
  const handleResize = useCallback(() => {
    updateViewport()
    setTimeout(calculateLayout, 100)
  }, [updateViewport, calculateLayout])
  
  // Get card style object for a given card
  const getCardStyle = useCallback((cardId: string) => {
    const cardState = cardStates.get(cardId)
    if (!cardState) return {}
    
    return {
      position: 'absolute' as const,
      left: cardState.x,
      top: cardState.y,
      width: cardState.width,
      height: cardState.height,
      zIndex: cardState.zIndex,
      opacity: cardState.opacity,
      transform: `scale(${cardState.scale})`,
      transition: (layoutPrefs?.animationsEnabled ?? true)
        ? `all ${layoutConfig.animation.duration}ms ${layoutConfig.animation.easing}`
        : 'none',
      willChange: (layoutPrefs?.animationsEnabled ?? true) ? 'transform, opacity, left, top' : 'auto'
    }
  }, [cardStates, layoutPrefs, layoutConfig.animation])
  
  // Calculate total container height
  const containerHeight = useMemo(() => {
    if (cardStates.size === 0) return 0
    
    const cards = Array.from(cardStates.values())
    return Math.max(...cards.map(card => card.y + card.height)) + 20
  }, [cardStates])
  
  // Get visible card IDs for rendering optimization
  const visibleCardIds = useMemo(() => {
    if (!layoutConfig.virtualization.enabled) return itemIds
    
    return itemIds.slice(visibleRange.start, visibleRange.end)
  }, [itemIds, visibleRange, layoutConfig.virtualization.enabled])
  
  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScrollThrottled = throttle(handleScroll, 16) // ~60fps
    const handleResizeDebounced = debounce(handleResize, 150)
    
    container.addEventListener('scroll', handleScrollThrottled, { passive: true })
    window.addEventListener('resize', handleResizeDebounced, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScrollThrottled)
      window.removeEventListener('resize', handleResizeDebounced)
    }
  }, [handleScroll, handleResize])
  
  // Initial viewport setup
  useEffect(() => {
    updateViewport()
  }, [updateViewport])
  
  // Recalculate when viewport or items change
  useEffect(() => {
    if (viewport.width > 0) {
      calculateLayout()
    }
  }, [viewport.width, viewport.height, itemIds.length, calculateLayout])
  
  return {
    containerRef,
    containerHeight,
    cardStates: cardStates,
    visibleCardIds,
    viewport,
    layoutConfig,
    layoutPrefs,
    setLayoutPrefs,
    toggleCard,
    getCardStyle,
    isCalculating,
    lastCalculation,
    updateLayout: calculateLayout
  }
}

// Utility functions
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }) as T
}

// Hook for individual card animations
export function useCardAnimation(cardId: string, isExpanded: boolean) {
  const [animationState, setAnimationState] = useState({
    isAnimating: false,
    phase: 'idle' as 'idle' | 'expanding' | 'collapsing'
  })
  
  useEffect(() => {
    if (isExpanded && animationState.phase !== 'expanding') {
      setAnimationState({ isAnimating: true, phase: 'expanding' })
      const timer = setTimeout(() => {
        setAnimationState({ isAnimating: false, phase: 'idle' })
      }, 300)
      return () => clearTimeout(timer)
    } else if (!isExpanded && animationState.phase !== 'collapsing') {
      setAnimationState({ isAnimating: true, phase: 'collapsing' })
      const timer = setTimeout(() => {
        setAnimationState({ isAnimating: false, phase: 'idle' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isExpanded, animationState.phase])
  
  return animationState
}