import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getCategorizedPlayerProps, PropCategory } from '@/services/mockApi'
import { Clock, CaretDown, CaretUp, TrendUp, TrendDown, Star, Heart, Lightning, Fire, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PlayerPropsSection } from '@/components/PlayerPropsSection'
import { FluidCard } from '@/components/FluidLayout'
import { useCardAnimation } from '@/hooks/useLayoutEngine'
import { cn } from '@/lib/utils'

interface FluidGameCardProps {
  game: Game
  compact?: boolean
  className?: string
  isExpanded?: boolean
  onToggle?: () => void
  showFavorites?: boolean
  onFavoriteToggle?: (gameId: string) => void
}

// Custom hook for mobile detection and touch optimization
const useOptimizedMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024)
      setIsTouch('ontouchstart' in window)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])
  
  return { isMobile, isTouch }
}

// Enhanced betting button with micro-interactions
interface OptimizedBettingButtonProps {
  label: string
  odds: number
  line?: number | string
  onClick: (e: React.MouseEvent) => void
  className?: string
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  isHighValue?: boolean
  movementDirection?: 'up' | 'down' | 'neutral'
}

const OptimizedBettingButton = ({ 
  label, 
  odds, 
  line, 
  onClick, 
  className,
  variant = 'primary',
  size = 'md',
  isHighValue = false,
  movementDirection = 'neutral'
}: OptimizedBettingButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)
  const [lastInteraction, setLastInteraction] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const controls = useAnimation()
  
  const handlePress = useCallback(async (e: React.MouseEvent) => {
    const now = Date.now()
    if (now - lastInteraction < 100) return // Debounce rapid taps
    
    setIsPressed(true)
    setLastInteraction(now)
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
    
    // Button press animation
    await controls.start({ scale: 0.95 })
    await controls.start({ scale: 1 })
    
    // Visual ripple effect
    if (buttonRef.current) {
      const button = buttonRef.current
      const rect = button.getBoundingClientRect()
      const ripple = document.createElement('div')
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: var(--accent);
        opacity: 0.3;
        pointer-events: none;
        animation: ripple 0.4s ease-out forwards;
      `
      
      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), 400)
    }
    
    onClick(e)
    setIsPressed(false)
  }, [onClick, lastInteraction, controls])

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-br from-card/90 to-card/70 border-border/60 hover:border-accent/40',
    secondary: 'bg-gradient-to-br from-muted/80 to-muted/60 border-border/40 hover:border-accent/30',
    accent: 'bg-gradient-to-br from-accent/20 to-accent/10 border-accent/40 hover:border-accent/60'
  }

  return (
    <motion.div
      animate={controls}
      className="relative overflow-hidden rounded-lg"
    >
      <Button
        ref={buttonRef}
        variant="outline"
        className={cn(
          'relative w-full transition-all duration-200 font-medium',
          'hover:shadow-md hover:shadow-accent/10 active:shadow-sm',
          'focus:ring-2 focus:ring-accent/30 focus:ring-offset-1',
          'transform-gpu will-change-transform',
          sizeClasses[size],
          variantClasses[variant],
          isHighValue && 'ring-2 ring-yellow-400/30',
          className
        )}
        onClick={handlePress}
      >
        <div className="flex flex-col items-center justify-center w-full relative z-10">
          <div className="font-semibold text-foreground flex items-center gap-1">
            {line && <span>{line}</span>}
            <span>{formatOdds(odds)}</span>
            {movementDirection !== 'neutral' && (
              <span className={cn(
                'text-xs',
                movementDirection === 'up' ? 'text-green-400' : 'text-red-400'
              )}>
                {movementDirection === 'up' ? <TrendUp size={10} /> : <TrendDown size={10} />}
              </span>
            )}
          </div>
          {label && (
            <div className="text-xs text-muted-foreground font-medium opacity-80">
              {label}
            </div>
          )}
        </div>
        
        {/* Shimmer effect for high-value bets */}
        {isHighValue && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse" />
        )}
        
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </motion.div>
  )
}

export function FluidGameCard({ 
  game, 
  compact = false, 
  className,
  isExpanded = false,
  onToggle,
  showFavorites = false,
  onFavoriteToggle
}: FluidGameCardProps) {
  const { addBet } = useBetSlip()
  const [propCategories, setPropCategories] = useState<PropCategory[]>([])
  const [propsLoading, setPropsLoading] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const { isMobile, isTouch } = useOptimizedMobile()
  
  const animationState = useCardAnimation(game.id, isExpanded)

  // Smart odds analysis for highlighting high-value bets
  const oddsAnalysis = useMemo(() => {
    const allOdds = [
      game.odds.spread.away.odds,
      game.odds.spread.home.odds,
      game.odds.total.over?.odds || -110,
      game.odds.total.under?.odds || -110,
      game.odds.moneyline.away.odds,
      game.odds.moneyline.home.odds
    ]
    
    const avgOdds = allOdds.reduce((sum, odd) => sum + Math.abs(odd), 0) / allOdds.length
    const isHighValueGame = avgOdds < 150 // Close game = high value
    
    return {
      isHighValue: isHighValueGame,
      favoriteTeam: game.odds.moneyline.home.odds < game.odds.moneyline.away.odds ? 'home' : 'away',
      closestSpread: Math.abs((game.odds.spread.home.line || 0) + (game.odds.spread.away.line || 0)) < 3
    }
  }, [game.odds])

  const handleBetClick = useCallback((
    e: React.MouseEvent,
    betType: 'spread' | 'moneyline' | 'total',
    selection: 'home' | 'away' | 'over' | 'under',
    odds: number,
    line?: number
  ) => {
    e.stopPropagation()
    addBet(game, betType, selection, odds, line)
    
    toast.success('Bet added to slip!', { 
      duration: 1200,
      position: 'bottom-center',
      className: 'bet-toast'
    })
  }, [addBet, game])

  const handleExpandToggle = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    // Load props data if expanding for first time
    if (!isExpanded && propCategories.length === 0) {
      setPropsLoading(true)
      try {
        const categories = await getCategorizedPlayerProps(game.id)
        setPropCategories(categories)
      } catch (error) {
        toast.error('Failed to load player props')
      } finally {
        setPropsLoading(false)
      }
    }
    
    onToggle?.()
  }, [isExpanded, propCategories.length, game.id, onToggle])

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteToggle?.(game.id)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites', {
      duration: 1000,
      position: 'bottom-center'
    })
  }, [isFavorited, game.id, onFavoriteToggle])

  if (compact) {
    return (
      <FluidCard
        cardId={game.id}
        isExpandable={true}
        onToggle={handleExpandToggle}
        className={cn(
          'fluid-game-card-compact transition-all duration-300 overflow-hidden',
          'border border-border/50 bg-gradient-to-br from-card/95 via-card/90 to-card/85',
          'backdrop-blur-sm hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5',
          isExpanded && 'ring-2 ring-accent/40 border-accent/30 shadow-xl shadow-accent/10',
          animationState.isAnimating && 'animate-pulse',
          oddsAnalysis.isHighValue && 'ring-1 ring-yellow-400/20',
          className
        )}
      >
        <CardContent className="p-3 relative">
          {/* High Value Game Indicator */}
          {oddsAnalysis.isHighValue && (
            <div className="absolute top-2 left-2 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs font-medium"
              >
                <Fire size={10} weight="fill" />
                <span>Hot</span>
              </motion.div>
            </div>
          )}

          {/* Header Row - Enhanced */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-xs px-2 py-0.5 font-medium',
                  game.status === 'live' && 'bg-red-500/20 text-red-400 border-red-400/30'
                )}
              >
                {game.leagueId}
              </Badge>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {formatTime(game.startTime)}
              </div>
              {game.status === 'live' && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge variant="destructive" className="text-xs px-2 py-0.5 font-semibold">
                    LIVE
                  </Badge>
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {showFavorites && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteToggle}
                    className="h-6 w-6 p-0 hover:bg-accent/20 rounded-full"
                  >
                    <motion.div
                      animate={{ rotate: isFavorited ? 360 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isFavorited ? 
                        <Heart size={12} className="text-red-400" weight="fill" /> :
                        <Star size={12} className="text-muted-foreground" />
                      }
                    </motion.div>
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpandToggle}
                  className={cn(
                    'h-6 w-6 p-0 hover:bg-accent/20 transition-all duration-300 rounded-full',
                    isExpanded && 'rotate-180 bg-accent/10'
                  )}
                >
                  <CaretDown size={14} />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Teams Row - Enhanced with team indicators */}
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex-1 text-left">
              <div className={cn(
                'font-semibold text-sm flex items-center gap-1',
                oddsAnalysis.favoriteTeam === 'away' && 'text-foreground',
                oddsAnalysis.favoriteTeam === 'home' && 'text-muted-foreground'
              )}>
                {game.awayTeam.shortName}
                {oddsAnalysis.favoriteTeam === 'away' && <Lightning size={12} className="text-yellow-400" weight="fill" />}
              </div>
              <div className="text-xs text-muted-foreground">{game.awayTeam.record}</div>
            </div>
            
            <motion.div 
              className="text-xs text-muted-foreground font-medium px-3 bg-muted/30 rounded-full py-1"
              whileHover={{ scale: 1.05 }}
            >
              @
            </motion.div>
            
            <div className="flex-1 text-right">
              <div className={cn(
                'font-semibold text-sm flex items-center justify-end gap-1',
                oddsAnalysis.favoriteTeam === 'home' && 'text-foreground',
                oddsAnalysis.favoriteTeam === 'away' && 'text-muted-foreground'
              )}>
                {oddsAnalysis.favoriteTeam === 'home' && <Lightning size={12} className="text-yellow-400" weight="fill" />}
                {game.homeTeam.shortName}
              </div>
              <div className="text-xs text-muted-foreground">{game.homeTeam.record}</div>
            </div>
          </div>

          {/* Enhanced Quick Betting Grid */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <OptimizedBettingButton
              label="SPREAD"
              odds={game.odds.spread.away.odds}
              line={`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
              onClick={(e) => handleBetClick(
                e, 'spread', 'away',
                game.odds.spread.away.odds,
                game.odds.spread.away.line || 0
              )}
              variant={oddsAnalysis.closestSpread ? 'accent' : 'primary'}
              size="sm"
              isHighValue={oddsAnalysis.isHighValue}
              movementDirection={Math.random() > 0.5 ? 'up' : 'down'} // Mock movement
            />
            <OptimizedBettingButton
              label="TOTAL"
              odds={game.odds.total.over?.odds || -110}
              line={`O${formatTotalLine(game.odds.total.over?.line || 47.5)}`}
              onClick={(e) => handleBetClick(
                e, 'total', 'over',
                game.odds.total.over?.odds || -110,
                game.odds.total.over?.line || 47.5
              )}
              variant="primary"
              size="sm"
              isHighValue={oddsAnalysis.isHighValue}
            />
            <OptimizedBettingButton
              label="ML"
              odds={game.odds.moneyline.away.odds}
              onClick={(e) => handleBetClick(
                e, 'moneyline', 'away',
                game.odds.moneyline.away.odds
              )}
              variant={oddsAnalysis.favoriteTeam === 'away' ? 'accent' : 'primary'}
              size="sm"
              isHighValue={oddsAnalysis.isHighValue}
            />
          </div>

          {/* Expand/Collapse Indicator */}
          <div className="text-center">
            <motion.div
              className={cn(
                'inline-flex items-center gap-1 text-xs text-muted-foreground px-3 py-1 rounded-full',
                'bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors'
              )}
              whileHover={{ scale: 1.02 }}
              onClick={handleExpandToggle}
            >
              <span>{isExpanded ? 'Show Less' : 'More Bets'}</span>
              <Sparkle size={10} className="text-accent" />
            </motion.div>
          </div>

          {/* Enhanced Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <Separator className="my-4 opacity-50" />
                
                {/* Extended Betting Options */}
                <div className="space-y-3">
                  <motion.div 
                    className="grid grid-cols-2 gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <OptimizedBettingButton
                      label={`${game.homeTeam.shortName} SPREAD`}
                      odds={game.odds.spread.home.odds}
                      line={`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                      onClick={(e) => handleBetClick(
                        e, 'spread', 'home',
                        game.odds.spread.home.odds,
                        game.odds.spread.home.line || 0
                      )}
                      variant={oddsAnalysis.favoriteTeam === 'home' ? 'accent' : 'secondary'}
                      size="sm"
                      isHighValue={oddsAnalysis.isHighValue}
                    />
                    <OptimizedBettingButton
                      label="UNDER"
                      odds={game.odds.total.under?.odds || -110}
                      line={`U${formatTotalLine(game.odds.total.under?.line || 47.5)}`}
                      onClick={(e) => handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.line || 47.5
                      )}
                      variant="secondary"
                      size="sm"
                      isHighValue={oddsAnalysis.isHighValue}
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="grid grid-cols-2 gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <OptimizedBettingButton
                      label={`${game.awayTeam.shortName} ML`}
                      odds={game.odds.moneyline.away.odds}
                      onClick={(e) => handleBetClick(
                        e, 'moneyline', 'away',
                        game.odds.moneyline.away.odds
                      )}
                      variant={oddsAnalysis.favoriteTeam === 'away' ? 'accent' : 'secondary'}
                      size="sm"
                      isHighValue={oddsAnalysis.isHighValue}
                    />
                    <OptimizedBettingButton
                      label={`${game.homeTeam.shortName} ML`}
                      odds={game.odds.moneyline.home.odds}
                      onClick={(e) => handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                      )}
                      variant={oddsAnalysis.favoriteTeam === 'home' ? 'accent' : 'secondary'}
                      size="sm"
                      isHighValue={oddsAnalysis.isHighValue}
                    />
                  </motion.div>
                </div>
                
                <Separator className="my-4 opacity-50" />
                <PlayerPropsSection
                  categories={propCategories}
                  game={game}
                  isLoading={propsLoading}
                  compact={compact}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </FluidCard>
    )
  }

  // Desktop layout - Enhanced
  return (
    <FluidCard
      cardId={game.id}
      isExpandable={true}
      onToggle={handleExpandToggle}
      className={cn(
        'fluid-game-card-desktop transition-all duration-300 overflow-hidden',
        'border border-border/50 bg-gradient-to-br from-card/95 via-card/90 to-card/85',
        'backdrop-blur-sm hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5',
        isExpanded && 'ring-2 ring-accent/40 border-accent/30 shadow-xl shadow-accent/10',
        animationState.isAnimating && 'animate-pulse',
        oddsAnalysis.isHighValue && 'ring-1 ring-yellow-400/20',
        className
      )}
    >
      <CardContent className="p-4 relative">
        {/* High Value Game Indicator */}
        {oddsAnalysis.isHighValue && (
          <div className="absolute top-3 left-3 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium"
            >
              <Fire size={12} weight="fill" />
              <span>High Value</span>
            </motion.div>
          </div>
        )}

        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs px-3 py-1 font-medium">
              {game.leagueId}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock size={14} />
              {formatTime(game.startTime)}
            </div>
            {game.status === 'live' && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge variant="destructive" className="text-xs px-3 py-1 font-semibold">
                  LIVE
                </Badge>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showFavorites && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  className="h-8 w-8 p-0 hover:bg-accent/20 rounded-full"
                >
                  <motion.div
                    animate={{ rotate: isFavorited ? 360 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isFavorited ? 
                      <Heart size={16} className="text-red-400" weight="fill" /> :
                      <Star size={16} className="text-muted-foreground" />
                    }
                  </motion.div>
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className={cn(
                  'h-8 w-8 p-0 hover:bg-accent/20 transition-all duration-300 rounded-full',
                  isExpanded && 'rotate-180 bg-accent/10'
                )}
              >
                <CaretDown size={16} />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Main Betting Grid */}
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Teams Column */}
          <div className="col-span-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={cn(
                  'font-semibold flex items-center gap-2',
                  oddsAnalysis.favoriteTeam === 'away' && 'text-foreground',
                  oddsAnalysis.favoriteTeam === 'home' && 'text-muted-foreground'
                )}>
                  <span>{game.awayTeam.name}</span>
                  {oddsAnalysis.favoriteTeam === 'away' && <Lightning size={14} className="text-yellow-400" weight="fill" />}
                </div>
                <span className="text-sm text-muted-foreground">{game.awayTeam.record}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={cn(
                  'font-semibold flex items-center gap-2',
                  oddsAnalysis.favoriteTeam === 'home' && 'text-foreground',
                  oddsAnalysis.favoriteTeam === 'away' && 'text-muted-foreground'
                )}>
                  <span>{game.homeTeam.name}</span>
                  {oddsAnalysis.favoriteTeam === 'home' && <Lightning size={14} className="text-yellow-400" weight="fill" />}
                </div>
                <span className="text-sm text-muted-foreground">{game.homeTeam.record}</span>
              </div>
            </div>
          </div>

          {/* Spread Column */}
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground text-center mb-2 font-semibold tracking-wide">
              SPREAD
            </div>
            <div className="space-y-1">
              <OptimizedBettingButton
                label=""
                odds={game.odds.spread.away.odds}
                line={`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
                onClick={(e) => handleBetClick(
                  e, 'spread', 'away',
                  game.odds.spread.away.odds,
                  game.odds.spread.away.line || 0
                )}
                className="w-full"
                variant={oddsAnalysis.closestSpread ? 'accent' : 'primary'}
                size="sm"
                isHighValue={oddsAnalysis.isHighValue}
              />
              <OptimizedBettingButton
                label=""
                odds={game.odds.spread.home.odds}
                line={`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                onClick={(e) => handleBetClick(
                  e, 'spread', 'home',
                  game.odds.spread.home.odds,
                  game.odds.spread.home.line || 0
                )}
                className="w-full"
                variant={oddsAnalysis.closestSpread ? 'accent' : 'primary'}
                size="sm"
                isHighValue={oddsAnalysis.isHighValue}
              />
            </div>
          </div>

          {/* Total Column */}
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground text-center mb-2 font-semibold tracking-wide">
              TOTAL
            </div>
            <div className="space-y-1">
              <OptimizedBettingButton
                label=""
                odds={game.odds.total.over?.odds || -110}
                line={`O ${formatTotalLine(game.odds.total.over?.line || 47.5)}`}
                onClick={(e) => handleBetClick(
                  e, 'total', 'over',
                  game.odds.total.over?.odds || -110,
                  game.odds.total.over?.line || 47.5
                )}
                className="w-full"
                variant="primary"
                size="sm"
                isHighValue={oddsAnalysis.isHighValue}
              />
              <OptimizedBettingButton
                label=""
                odds={game.odds.total.under?.odds || -110}
                line={`U ${formatTotalLine(game.odds.total.under?.line || 47.5)}`}
                onClick={(e) => handleBetClick(
                  e, 'total', 'under',
                  game.odds.total.under?.odds || -110,
                  game.odds.total.under?.line || 47.5
                )}
                className="w-full"
                variant="primary"
                size="sm"
                isHighValue={oddsAnalysis.isHighValue}
              />
            </div>
          </div>

          {/* Moneyline Column */}
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground text-center mb-2 font-semibold tracking-wide">
              MONEYLINE
            </div>
            <div className="space-y-1">
              <OptimizedBettingButton
                label=""
                odds={game.odds.moneyline.away.odds}
                onClick={(e) => handleBetClick(
                  e, 'moneyline', 'away',
                  game.odds.moneyline.away.odds
                )}
                className="w-full"
                variant={oddsAnalysis.favoriteTeam === 'away' ? 'accent' : 'primary'}
                size="sm"
                isHighValue={oddsAnalysis.isHighValue}
              />
              <OptimizedBettingButton
                label=""
                odds={game.odds.moneyline.home.odds}
                onClick={(e) => handleBetClick(
                  e, 'moneyline', 'home',
                  game.odds.moneyline.home.odds
                )}
                className="w-full"
                variant={oddsAnalysis.favoriteTeam === 'home' ? 'accent' : 'primary'}
                size="sm"
                isHighValue={oddsAnalysis.isHighValue}
              />
            </div>
          </div>

          {/* Expand Indicator */}
          <div className="col-span-2 text-center">
            <motion.div
              className={cn(
                'inline-flex items-center gap-1 text-xs text-muted-foreground px-3 py-2 rounded-full',
                'bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors'
              )}
              whileHover={{ scale: 1.02 }}
              onClick={handleExpandToggle}
            >
              <span>{isExpanded ? 'Less' : 'More'}</span>
              <Sparkle size={12} className="text-accent" />
            </motion.div>
          </div>
        </div>

        {/* Enhanced Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <Separator className="my-4 opacity-50" />
              <PlayerPropsSection
                categories={propCategories}
                game={game}
                isLoading={propsLoading}
                compact={compact}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </FluidCard>
  )
}