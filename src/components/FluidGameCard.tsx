import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getCategorizedPlayerProps, PropCategory } from '@/services/mockApi'
import { Clock, CaretDown, CaretUp, TrendUp, TrendDown, Star, Heart } from '@phosphor-icons/react'
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
    
    // Haptic feedback for mobile
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50)
    }
    
    toast.success('Bet added to slip!', { 
      duration: 1500,
      position: 'bottom-center'
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
      duration: 1000
    })
  }, [isFavorited, game.id, onFavoriteToggle])

  // Determine odds movement indicators
  const getOddsMovement = (odds: number) => {
    // Mock logic - in real app this would compare to previous odds
    const change = Math.random() * 20 - 10
    return {
      direction: change > 0 ? 'up' : 'down',
      magnitude: Math.abs(change)
    }
  }

  const OddsButton = ({ 
    label, 
    odds, 
    line, 
    onClick, 
    className: buttonClassName 
  }: {
    label: string
    odds: number
    line?: number | string
    onClick: (e: React.MouseEvent) => void
    className?: string
  }) => {
    const movement = getOddsMovement(odds)
    
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        className={cn(
          'relative overflow-hidden group transition-all duration-200',
          'hover:bg-accent/10 hover:border-accent/50 hover:shadow-sm',
          'active:scale-[0.98] active:bg-accent/20',
          compact ? 'h-8 text-xs' : 'h-10 text-sm',
          buttonClassName
        )}
        onClick={onClick}
      >
        <div className="flex flex-col items-center justify-center w-full">
          <div className="font-semibold text-foreground">
            {line && `${line} `}
            {formatOdds(odds)}
          </div>
          {label && (
            <div className="text-xs text-muted-foreground font-medium">
              {label}
            </div>
          )}
        </div>
        
        {/* Subtle odds movement indicator */}
        <div className={cn(
          'absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity',
          movement.direction === 'up' ? 'text-green-400' : 'text-red-400'
        )}>
          {movement.direction === 'up' ? 
            <TrendUp size={10} /> : 
            <TrendDown size={10} />
          }
        </div>
        
        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    )
  }

  if (compact) {
    return (
      <FluidCard
        cardId={game.id}
        isExpandable={true}
        onToggle={handleExpandToggle}
        className={cn(
          'fluid-game-card-compact transition-all duration-300',
          isExpanded && 'ring-2 ring-accent/30',
          animationState.isAnimating && 'animate-pulse',
          className
        )}
      >
        <CardContent className="p-3">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                {game.leagueId}
              </Badge>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {formatTime(game.startTime)}
              </div>
              {game.status === 'live' && (
                <Badge variant="destructive" className="text-xs animate-pulse px-2 py-0.5">
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
                  'h-6 w-6 p-0 hover:bg-accent/20 transition-all duration-200',
                  isExpanded && 'rotate-180'
                )}
              >
                <CaretDown size={14} />
              </Button>
            </div>
          </div>

          {/* Teams Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">{game.awayTeam.shortName}</div>
              <div className="text-xs text-muted-foreground">{game.awayTeam.record}</div>
            </div>
            <div className="text-xs text-muted-foreground font-medium px-3">@</div>
            <div className="flex-1 text-right">
              <div className="font-semibold text-sm">{game.homeTeam.shortName}</div>
              <div className="text-xs text-muted-foreground">{game.homeTeam.record}</div>
            </div>
          </div>

          {/* Quick Betting Grid */}
          <div className="grid grid-cols-3 gap-2">
            <OddsButton
              label="SPREAD"
              odds={game.odds.spread.away.odds}
              line={`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
              onClick={(e) => handleBetClick(
                e, 'spread', 'away',
                game.odds.spread.away.odds,
                game.odds.spread.away.line || 0
              )}
            />
            <OddsButton
              label="TOTAL"
              odds={game.odds.total.over?.odds || -110}
              line={`O${formatTotalLine(game.odds.total.over?.line || 47.5)}`}
              onClick={(e) => handleBetClick(
                e, 'total', 'over',
                game.odds.total.over?.odds || -110,
                game.odds.total.over?.line || 47.5
              )}
            />
            <OddsButton
              label="ML"
              odds={game.odds.moneyline.away.odds}
              onClick={(e) => handleBetClick(
                e, 'moneyline', 'away',
                game.odds.moneyline.away.odds
              )}
            />
          </div>

          {/* Expanded Content */}
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
                
                {/* Extended Betting Options */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <OddsButton
                      label={`${game.homeTeam.shortName} SPREAD`}
                      odds={game.odds.spread.home.odds}
                      line={`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                      onClick={(e) => handleBetClick(
                        e, 'spread', 'home',
                        game.odds.spread.home.odds,
                        game.odds.spread.home.line || 0
                      )}
                    />
                    <OddsButton
                      label="UNDER"
                      odds={game.odds.total.under?.odds || -110}
                      line={`U${formatTotalLine(game.odds.total.under?.line || 47.5)}`}
                      onClick={(e) => handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.line || 47.5
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <OddsButton
                      label={`${game.awayTeam.shortName} ML`}
                      odds={game.odds.moneyline.away.odds}
                      onClick={(e) => handleBetClick(
                        e, 'moneyline', 'away',
                        game.odds.moneyline.away.odds
                      )}
                    />
                    <OddsButton
                      label={`${game.homeTeam.shortName} ML`}
                      odds={game.odds.moneyline.home.odds}
                      onClick={(e) => handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                      )}
                    />
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

  // Desktop layout
  return (
    <FluidCard
      cardId={game.id}
      isExpandable={true}
      onToggle={handleExpandToggle}
      className={cn(
        'fluid-game-card-desktop transition-all duration-300',
        isExpanded && 'ring-2 ring-accent/30 shadow-xl shadow-accent/10',
        animationState.isAnimating && 'animate-pulse',
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs px-3 py-1 font-medium">
              {game.leagueId}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock size={14} />
              {formatTime(game.startTime)}
            </div>
            {game.status === 'live' && (
              <Badge variant="destructive" className="text-xs animate-pulse px-3 py-1">
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
                'h-8 w-8 p-0 hover:bg-accent/20 transition-all duration-200',
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
                <span className="font-semibold">{game.awayTeam.name}</span>
                <span className="text-sm text-muted-foreground">{game.awayTeam.record}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{game.homeTeam.name}</span>
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
              <OddsButton
                label=""
                odds={game.odds.spread.away.odds}
                line={`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
                onClick={(e) => handleBetClick(
                  e, 'spread', 'away',
                  game.odds.spread.away.odds,
                  game.odds.spread.away.line || 0
                )}
                className="w-full"
              />
              <OddsButton
                label=""
                odds={game.odds.spread.home.odds}
                line={`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                onClick={(e) => handleBetClick(
                  e, 'spread', 'home',
                  game.odds.spread.home.odds,
                  game.odds.spread.home.line || 0
                )}
                className="w-full"
              />
            </div>
          </div>

          {/* Total Column */}
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground text-center mb-2 font-semibold tracking-wide">
              TOTAL
            </div>
            <div className="space-y-1">
              <OddsButton
                label=""
                odds={game.odds.total.over?.odds || -110}
                line={`O ${formatTotalLine(game.odds.total.over?.line || 47.5)}`}
                onClick={(e) => handleBetClick(
                  e, 'total', 'over',
                  game.odds.total.over?.odds || -110,
                  game.odds.total.over?.line || 47.5
                )}
                className="w-full"
              />
              <OddsButton
                label=""
                odds={game.odds.total.under?.odds || -110}
                line={`U ${formatTotalLine(game.odds.total.under?.line || 47.5)}`}
                onClick={(e) => handleBetClick(
                  e, 'total', 'under',
                  game.odds.total.under?.odds || -110,
                  game.odds.total.under?.line || 47.5
                )}
                className="w-full"
              />
            </div>
          </div>

          {/* Moneyline Column */}
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground text-center mb-2 font-semibold tracking-wide">
              MONEYLINE
            </div>
            <div className="space-y-1">
              <OddsButton
                label=""
                odds={game.odds.moneyline.away.odds}
                onClick={(e) => handleBetClick(
                  e, 'moneyline', 'away',
                  game.odds.moneyline.away.odds
                )}
                className="w-full"
              />
              <OddsButton
                label=""
                odds={game.odds.moneyline.home.odds}
                onClick={(e) => handleBetClick(
                  e, 'moneyline', 'home',
                  game.odds.moneyline.home.odds
                )}
                className="w-full"
              />
            </div>
          </div>

          {/* Expand Indicator */}
          <div className="col-span-2 text-center">
            <div className="text-xs text-muted-foreground">
              {isExpanded ? 'Less' : 'More'}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
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