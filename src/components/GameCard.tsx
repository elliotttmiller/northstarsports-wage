import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useEffect } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getCategorizedPlayerProps, PropCategory } from '@/services/mockApi'
import { Clock, CaretDown, Star, Heart, Football } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PlayerPropsSection } from '@/components/PlayerPropsSection'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: Game
  variant?: 'mobile' | 'desktop'
  className?: string
  showFavorites?: boolean
  onFavoriteToggle?: (gameId: string) => void
}

export function GameCard({ 
  game, 
  variant = 'mobile',
  className,
  showFavorites = false,
  onFavoriteToggle
}: GameCardProps) {
  const { addBet } = useBetSlip()
  const [isExpanded, setIsExpanded] = useState(false)
  const [propCategories, setPropCategories] = useState<PropCategory[]>([])
  const [propsLoading, setPropsLoading] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

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
      position: 'bottom-center'
    })
  }, [addBet, game])

  const handleExpandToggle = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
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
    
    setIsExpanded(!isExpanded)
  }, [isExpanded, propCategories.length, game.id])

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteToggle?.(game.id)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites', {
      duration: 1000,
      position: 'bottom-center'
    })
  }, [isFavorited, game.id, onFavoriteToggle])

  if (variant === 'mobile') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full"
      >
        <Card className={cn(
          'bg-card border-border/40 hover:border-accent/30 transition-all duration-200 overflow-hidden',
          isExpanded && 'border-accent/50 shadow-lg',
          className
        )}>
          <CardContent className="p-4">
            {/* Header - Mobile */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                  {game.leagueId}
                </Badge>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(game.startTime)}
                </div>
                {game.status === 'live' && (
                  <Badge className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border-red-400/30">
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

            {/* Teams Header - Mobile */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3">
                <div className="text-right">
                  <div className="font-semibold text-base">{game.awayTeam.shortName}</div>
                  <div className="text-xs text-muted-foreground">{game.awayTeam.record}</div>
                </div>
                <div className="text-sm text-muted-foreground font-medium px-2">@</div>
                <div className="text-left">
                  <div className="font-semibold text-base">{game.homeTeam.shortName}</div>
                  <div className="text-xs text-muted-foreground">{game.homeTeam.record}</div>
                </div>
              </div>
            </div>

            {/* Main Betting Options - Mobile */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {/* Spread */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-semibold">SPREAD</div>
                <Button
                  variant="outline"
                  className="w-full h-12 flex flex-col items-center justify-center bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'spread', 'away',
                    game.odds.spread.away.odds,
                    game.odds.spread.away.line || 0
                  )}
                >
                  <div className="text-xs font-bold">{game.awayTeam.shortName}</div>
                  <div className="text-xs">{`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}</div>
                  <div className="text-xs text-muted-foreground">{formatOdds(game.odds.spread.away.odds)}</div>
                </Button>
              </div>

              {/* Total */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-semibold">TOTAL</div>
                <Button
                  variant="outline"
                  className="w-full h-12 flex flex-col items-center justify-center bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'total', 'over',
                    game.odds.total.over?.odds || -110,
                    game.odds.total.over?.line || 47.5
                  )}
                >
                  <div className="text-xs font-bold">O</div>
                  <div className="text-xs">{formatTotalLine(game.odds.total.over?.line || 47.5)}</div>
                  <div className="text-xs text-muted-foreground">{formatOdds(game.odds.total.over?.odds || -110)}</div>
                </Button>
              </div>

              {/* Moneyline */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-semibold">ML</div>
                <Button
                  variant="outline"
                  className="w-full h-12 flex flex-col items-center justify-center bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'moneyline', 'away',
                    game.odds.moneyline.away.odds
                  )}
                >
                  <div className="text-xs font-bold">{game.awayTeam.shortName}</div>
                  <div className="text-xs">{formatOdds(game.odds.moneyline.away.odds)}</div>
                </Button>
              </div>
            </div>

            {/* Expand Toggle */}
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

            {/* Expanded Content - Mobile */}
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
                  
                  {/* Additional Main Betting Options */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Home Spread */}
                    <Button
                      variant="outline"
                      className="h-10 flex flex-col items-center justify-center bg-muted/20 border-border/60 hover:bg-accent/10"
                      onClick={(e) => handleBetClick(
                        e, 'spread', 'home',
                        game.odds.spread.home.odds,
                        game.odds.spread.home.line || 0
                      )}
                    >
                      <div className="text-xs font-bold">{game.homeTeam.shortName}</div>
                      <div className="text-xs">{`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}</div>
                      <div className="text-xs text-muted-foreground">{formatOdds(game.odds.spread.home.odds)}</div>
                    </Button>

                    {/* Under */}
                    <Button
                      variant="outline"
                      className="h-10 flex flex-col items-center justify-center bg-muted/20 border-border/60 hover:bg-accent/10"
                      onClick={(e) => handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.line || 47.5
                      )}
                    >
                      <div className="text-xs font-bold">U</div>
                      <div className="text-xs">{formatTotalLine(game.odds.total.under?.line || 47.5)}</div>
                      <div className="text-xs text-muted-foreground">{formatOdds(game.odds.total.under?.odds || -110)}</div>
                    </Button>

                    {/* Home ML */}
                    <Button
                      variant="outline"
                      className="h-10 flex flex-col items-center justify-center bg-muted/20 border-border/60 hover:bg-accent/10"
                      onClick={(e) => handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                      )}
                    >
                      <div className="text-xs font-bold">{game.homeTeam.shortName}</div>
                      <div className="text-xs">{formatOdds(game.odds.moneyline.home.odds)}</div>
                    </Button>
                  </div>

                  <Separator className="my-3" />
                  <PlayerPropsSection
                    categories={propCategories}
                    game={game}
                    isLoading={propsLoading}
                    compact={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Desktop Layout
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      <Card className={cn(
        'bg-card border-border/40 hover:border-accent/30 transition-all duration-200 overflow-hidden',
        isExpanded && 'border-accent/50 shadow-lg',
        className
      )}>
        <CardContent className="p-4">
          {/* Header - Desktop */}
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
                <Badge className="text-xs px-3 py-1 bg-red-500/20 text-red-400 border-red-400/30">
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

          {/* Main Betting Grid - Desktop */}
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
              <div className="text-xs text-muted-foreground text-center mb-2 font-semibold">SPREAD</div>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'spread', 'away',
                    game.odds.spread.away.odds,
                    game.odds.spread.away.line || 0
                  )}
                >
                  {`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`} ({formatOdds(game.odds.spread.away.odds)})
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'spread', 'home',
                    game.odds.spread.home.odds,
                    game.odds.spread.home.line || 0
                  )}
                >
                  {`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`} ({formatOdds(game.odds.spread.home.odds)})
                </Button>
              </div>
            </div>

            {/* Total Column */}
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground text-center mb-2 font-semibold">TOTAL</div>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'total', 'over',
                    game.odds.total.over?.odds || -110,
                    game.odds.total.over?.line || 47.5
                  )}
                >
                  O {formatTotalLine(game.odds.total.over?.line || 47.5)} ({formatOdds(game.odds.total.over?.odds || -110)})
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'total', 'under',
                    game.odds.total.under?.odds || -110,
                    game.odds.total.under?.line || 47.5
                  )}
                >
                  U {formatTotalLine(game.odds.total.under?.line || 47.5)} ({formatOdds(game.odds.total.under?.odds || -110)})
                </Button>
              </div>
            </div>

            {/* Moneyline Column */}
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground text-center mb-2 font-semibold">MONEYLINE</div>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/10"
                  onClick={(e) => handleBetClick(
                    e, 'moneyline', 'away',
                    game.odds.moneyline.away.odds
                  )}
                >
                  {formatOdds(game.odds.moneyline.away.odds)}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/10"
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

          {/* Expanded Content - Desktop */}
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
                  compact={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}