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
import { Clock, CaretDown, Star, Heart } from '@phosphor-icons/react'
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="w-full"
      >
        <Card 
          className={cn(
            'bg-card/50 border-border/30 hover:border-accent/40 transition-all duration-200 cursor-pointer',
            isExpanded && 'border-accent/50 bg-card/80',
            className
          )}
          onClick={handleExpandToggle}
        >
          <CardContent className="p-3">
            {/* Compact Header Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-muted/40">
                  {game.leagueId}
                </Badge>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />
                  {formatTime(game.startTime)}
                </div>
                {game.status === 'live' && (
                  <Badge className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border-red-400/30 animate-pulse">
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
                <CaretDown 
                  size={14} 
                  className={cn(
                    'text-muted-foreground transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                />
              </div>
            </div>

            {/* Slim Teams Row */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{game.awayTeam.shortName}</span>
                <span className="text-xs text-muted-foreground">({game.awayTeam.record})</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">@</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{game.homeTeam.shortName}</span>
                <span className="text-xs text-muted-foreground">({game.homeTeam.record})</span>
              </div>
            </div>

            {/* Thin Three-Column Betting Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Spread Column */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium">SPREAD</div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'spread', 'away',
                        game.odds.spread.away.odds,
                        game.odds.spread.away.line || 0
                      )
                    }}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium">{game.awayTeam.shortName}</span>
                      <span>{`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'spread', 'home',
                        game.odds.spread.home.odds,
                        game.odds.spread.home.line || 0
                      )
                    }}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium">{game.homeTeam.shortName}</span>
                      <span>{`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Total Column */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium">TOTAL</div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'total', 'over',
                        game.odds.total.over?.odds || -110,
                        game.odds.total.over?.line || 47.5
                      )
                    }}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium">O</span>
                      <span>{formatTotalLine(game.odds.total.over?.line || 47.5)}</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.line || 47.5
                      )
                    }}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium">U</span>
                      <span>{formatTotalLine(game.odds.total.under?.line || 47.5)}</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Moneyline Column */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium">ML</div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'away',
                        game.odds.moneyline.away.odds
                      )
                    }}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium">{game.awayTeam.shortName}</span>
                      <span>{formatOdds(game.odds.moneyline.away.odds)}</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                      )
                    }}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium">{game.homeTeam.shortName}</span>
                      <span>{formatOdds(game.odds.moneyline.home.odds)}</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Content - Mobile */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden mt-3"
                >
                  <Separator className="mb-3" />
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

  // Desktop Layout - Thin and Professional
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="w-full"
    >
      <Card 
        className={cn(
          'bg-card/50 border-border/30 hover:border-accent/40 transition-all duration-200 cursor-pointer',
          isExpanded && 'border-accent/50 bg-card/80',
          className
        )}
        onClick={handleExpandToggle}
      >
        <CardContent className="p-3">
          {/* Compact Header - Desktop */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs px-2 py-1 font-medium bg-muted/40">
                {game.leagueId}
              </Badge>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {formatTime(game.startTime)}
              </div>
              {game.status === 'live' && (
                <Badge className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border-red-400/30 animate-pulse">
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
                  className="h-7 w-7 p-0 hover:bg-accent/20"
                >
                  {isFavorited ? 
                </Button>
              )}
                  }
                </Button>
              )}
                  'text-muted-foreground transition-transform duration-200',
                  isExpanded && 'rotate-180'
                className={cn(
              />
                  isExpanded && 'rotate-180'
                )}

            </div>
          </div>
ondensed */}
            <div className="col-span-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{game.awayTeam.shortName}</span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{game.homeTeam.shortName}</span>
                </div>
                <div className="flex items-center justify-between">
            </div>

                </div> Column */}
              </div>
            </div>d text-center mb-1 font-medium">SPREAD</div>

            {/* Spread Column */}
                  variant="outline"
                  size="sm"
              <div className="grid grid-cols-2 gap-1">-2"
                <Button
                  variant="outline"
                    handleBetClick(
                      e, 'spread', 'away',
                      game.odds.spread.away.odds,
                      game.odds.spread.away.line || 0
                    handleBetClick(
                  }}
                >
                  {game.awayTeam.shortName} {`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
                </Button>
                <Button
                >
                  size="sm"
                </Button>bg-accent/20 transition-colors px-2"
                <Button
                  variant="outline"
                  size="sm"
                      e, 'spread', 'home',
                      game.odds.spread.home.odds,
                      game.odds.spread.home.line || 0
                    )
                  }}
                >
                  {game.homeTeam.shortName} {`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                </Button>
              </div>
                >

                </Button>
              </div>
            </div>b-1 font-medium">TOTAL</div>

            {/* Total Column */}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBetClick(
                      e, 'total', 'over',
                      game.odds.total.over?.odds || -110,
                      game.odds.total.over?.line || 47.5
                    )
                  }}
                >
                  O {formatTotalLine(game.odds.total.over?.line || 47.5)}
                </Button>
                <Button
                >
                  size="sm"
                </Button>order/60 hover:bg-accent/20 transition-colors"
                <Button
                  variant="outline"
                    handleBetClick(
                      e, 'total', 'under',
                      game.odds.total.under?.odds || -110,
                    e.stopPropagation()
                    )
                  }}
                >
                  U {formatTotalLine(game.odds.total.under?.line || 47.5)}
                </Button>
              </div>
                >

                </Button>
              </div>
            </div>nter mb-1 font-medium">MONEYLINE</div>
s-2 gap-1">
            {/* Moneyline Column */}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                <Button
                  variant="outline"
                    handleBetClick(
                      e, 'moneyline', 'away',
                      game.odds.moneyline.away.odds
                    )
                  }}
                >
                  {game.awayTeam.shortName} {formatOdds(game.odds.moneyline.away.odds)}
                    )
                  }}
                > variant="outline"
                  size="sm"
                </Button> border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                  size="sm"
                      e, 'moneyline', 'home',
                      game.odds.moneyline.home.odds
                    e.stopPropagation()
                  }}
                >
                  {game.homeTeam.shortName} {formatOdds(game.odds.moneyline.home.odds)}
                </Button>
                  }}
            </div>
          </div>

          {/* Expanded Content - Desktop */}
            </div>
          </div>

          {/* Expanded Content - Desktop */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden mt-3"
              >
                <Separator className="mb-3" />
                <PlayerPropsSection
                  categories={propCategories}
                  game={game}
                  isLoading={propsLoading}
                  compact={false}
                />
      </Card>
    </motion.div>
  )
}}