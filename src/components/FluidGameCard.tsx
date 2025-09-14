import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game, PropCategory } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getCategorizedPlayerProps } from '@/services/mockApi'
import { Clock, CaretDown, Star, Heart } from '@phosphor-icons/react'
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
          'fluid-game-card-compact transition-all duration-200 overflow-hidden',
          'border border-border/50 bg-card',
          'hover:border-accent/30 hover:shadow-sm',
          isExpanded && 'border-accent/30 shadow-md',
          className
        )}
      >
        <CardContent className="p-3 relative">
          {/* Header Row - Clean */}
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
                <Badge variant="destructive" className="text-xs px-2 py-0.5 font-semibold">
                  LIVE
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {showFavorites && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  className="h-6 w-6 p-0 hover:bg-accent/20"
                >
                  {isFavorited ? 
                    <Heart size={12} className="text-red-400" weight="fill" /> :
                    <Star size={12} className="text-muted-foreground" />
                  }
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className={cn(
                  'h-6 w-6 p-0 hover:bg-accent/20 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              >
                <CaretDown size={14} />
              </Button>
            </div>
          </div>

          {/* Teams Row - Clean */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">
                {game.awayTeam.shortName}
              </div>
              <div className="text-xs text-muted-foreground">{game.awayTeam.record}</div>
            </div>
            
            <div className="text-xs text-muted-foreground font-medium px-3">
              @
            </div>
            
            <div className="flex-1 text-right">
              <div className="font-semibold text-sm">
                {game.homeTeam.shortName}
              </div>
              <div className="text-xs text-muted-foreground">{game.homeTeam.record}</div>
            </div>
          </div>

          {/* Clean Betting Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-xs font-medium bg-card/50 border-border/60 hover:bg-accent/10"
              onClick={(e) => handleBetClick(
                e, 'spread', 'away',
                game.odds.spread.away.odds,
                game.odds.spread.away.line || 0
              )}
            >
              <div className="font-semibold">
                {`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatOdds(game.odds.spread.away.odds)}
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-xs font-medium bg-card/50 border-border/60 hover:bg-accent/10"
              onClick={(e) => handleBetClick(
                e, 'total', 'over',
                game.odds.total.over?.odds || -110,
                game.odds.total.over?.line || 47.5
              )}
            >
              <div className="font-semibold">
                {`O${formatTotalLine(game.odds.total.over?.line || 47.5)}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatOdds(game.odds.total.over?.odds || -110)}
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center text-xs font-medium bg-card/50 border-border/60 hover:bg-accent/10"
              onClick={(e) => handleBetClick(
                e, 'moneyline', 'away',
                game.odds.moneyline.away.odds
              )}
            >
              <div className="font-semibold">
                {formatOdds(game.odds.moneyline.away.odds)}
              </div>
              <div className="text-xs text-muted-foreground">
                ML
              </div>
            </Button>
          </div>

          {/* Clean Expand/Collapse */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleExpandToggle}
            >
              {isExpanded ? 'Show Less' : 'More Options'}
              <CaretDown size={12} className={cn('ml-1 transition-transform', isExpanded && 'rotate-180')} />
            </Button>
          </div>

          {/* Clean Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <Separator className="my-3" />
                
                {/* Additional Betting Options */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-10 flex flex-col items-center justify-center text-xs font-medium bg-card/50 border-border/60 hover:bg-accent/10"
                      onClick={(e) => handleBetClick(
                        e, 'spread', 'home',
                        game.odds.spread.home.odds,
                        game.odds.spread.home.line || 0
                      )}
                    >
                      <div className="font-semibold">
                        {`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatOdds(game.odds.spread.home.odds)}
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-10 flex flex-col items-center justify-center text-xs font-medium bg-card/50 border-border/60 hover:bg-accent/10"
                      onClick={(e) => handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.line || 47.5
                      )}
                    >
                      <div className="font-semibold">
                        {`U${formatTotalLine(game.odds.total.under?.line || 47.5)}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatOdds(game.odds.total.under?.odds || -110)}
                      </div>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-10 flex flex-col items-center justify-center text-xs font-medium bg-card/50 border-border/60 hover:bg-accent/10"
                      onClick={(e) => handleBetClick(
                        e, 'moneyline', 'away',
                        game.odds.moneyline.away.odds
                      )}
                    >
                      <div className="font-semibold">
                        {formatOdds(game.odds.moneyline.away.odds)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {game.awayTeam.shortName} ML
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-10 flex flex-col items-center justify-center text-xs font-medium bg-card/50 border-border/60 hover:bg-accent/10"
                      onClick={(e) => handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                      )}
                    >
                      <div className="font-semibold">
                        {formatOdds(game.odds.moneyline.home.odds)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {game.homeTeam.shortName} ML
                      </div>
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-3" />
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

  // Desktop layout - Clean
  return (
    <FluidCard
      cardId={game.id}
      isExpandable={true}
      onToggle={handleExpandToggle}
      className={cn(
        'fluid-game-card-desktop transition-all duration-200 overflow-hidden',
        'border border-border/50 bg-card',
        'hover:border-accent/30 hover:shadow-sm',
        isExpanded && 'border-accent/30 shadow-md',
        className
      )}
    >
      <CardContent className="p-4 relative">
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
              <Badge variant="destructive" className="text-xs px-3 py-1 font-semibold">
                LIVE
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showFavorites && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
                className="h-8 w-8 p-0 hover:bg-accent/20"
              >
                {isFavorited ? 
                  <Heart size={16} className="text-red-400" weight="fill" /> :
                  <Star size={16} className="text-muted-foreground" />
                }
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandToggle}
              className={cn(
                'h-8 w-8 p-0 hover:bg-accent/20 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            >
              <CaretDown size={16} />
            </Button>
          </div>
        </div>

        {/* Main Betting Grid */}
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Teams Column */}
          <div className="col-span-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  <span>{game.awayTeam.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{game.awayTeam.record}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  <span>{game.homeTeam.name}</span>
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
              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-card/50 border-border/60 hover:bg-accent/10"
                onClick={(e) => handleBetClick(
                  e, 'spread', 'away',
                  game.odds.spread.away.odds,
                  game.odds.spread.away.line || 0
                )}
              >
                <div className="flex items-center gap-1">
                  <span>{`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}</span>
                  <span className="text-muted-foreground">{formatOdds(game.odds.spread.away.odds)}</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-card/50 border-border/60 hover:bg-accent/10"
                onClick={(e) => handleBetClick(
                  e, 'spread', 'home',
                  game.odds.spread.home.odds,
                  game.odds.spread.home.line || 0
                )}
              >
                <div className="flex items-center gap-1">
                  <span>{`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}</span>
                  <span className="text-muted-foreground">{formatOdds(game.odds.spread.home.odds)}</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Total Column */}
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground text-center mb-2 font-semibold tracking-wide">
              TOTAL
            </div>
            <div className="space-y-1">
              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-card/50 border-border/60 hover:bg-accent/10"
                onClick={(e) => handleBetClick(
                  e, 'total', 'over',
                  game.odds.total.over?.odds || -110,
                  game.odds.total.over?.line || 47.5
                )}
              >
                <div className="flex items-center gap-1">
                  <span>{`O ${formatTotalLine(game.odds.total.over?.line || 47.5)}`}</span>
                  <span className="text-muted-foreground">{formatOdds(game.odds.total.over?.odds || -110)}</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-card/50 border-border/60 hover:bg-accent/10"
                onClick={(e) => handleBetClick(
                  e, 'total', 'under',
                  game.odds.total.under?.odds || -110,
                  game.odds.total.under?.line || 47.5
                )}
              >
                <div className="flex items-center gap-1">
                  <span>{`U ${formatTotalLine(game.odds.total.under?.line || 47.5)}`}</span>
                  <span className="text-muted-foreground">{formatOdds(game.odds.total.under?.odds || -110)}</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Moneyline Column */}
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground text-center mb-2 font-semibold tracking-wide">
              MONEYLINE
            </div>
            <div className="space-y-1">
              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-card/50 border-border/60 hover:bg-accent/10"
                onClick={(e) => handleBetClick(
                  e, 'moneyline', 'away',
                  game.odds.moneyline.away.odds
                )}
              >
                {formatOdds(game.odds.moneyline.away.odds)}
              </Button>
              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-card/50 border-border/60 hover:bg-accent/10"
                onClick={(e) => handleBetClick(
                  e, 'moneyline', 'home',
                  game.odds.moneyline.home.odds
                )}
              >
                {formatOdds(game.odds.moneyline.home.odds)}
              </Button>
            </div>
          </div>

          {/* Expand Indicator */}
          <div className="col-span-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleExpandToggle}
            >
              {isExpanded ? 'Less' : 'More'}
              <CaretDown size={12} className={cn('ml-1 transition-transform', isExpanded && 'rotate-180')} />
            </Button>
          </div>
        </div>

        {/* Clean Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <Separator className="my-4" />
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