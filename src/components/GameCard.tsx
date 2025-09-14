import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getCategorizedPlayerProps } from '@/services/mockApi'
import { PropCategory } from '@/types'
import { Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PlayerPropsSection } from '@/components/PlayerPropsSection'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: Game
  variant?: 'mobile' | 'desktop'
  className?: string
}

export function GameCard({ 
  game, 
  variant = 'mobile',
  className
}: GameCardProps) {
  const { addBet } = useBetSlip()
  const [isExpanded, setIsExpanded] = useState(false)
  const [propCategories, setPropCategories] = useState<PropCategory[]>([])
  const [propsLoading, setPropsLoading] = useState(false)


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

  const handleExpandToggle = useCallback(async () => {
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
          <CardContent className="p-2.5">
            {/* League Badge */}
            <div className="flex items-center justify-center mb-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-muted/40">
                {game.leagueId}
              </Badge>
              {game.status === 'live' && (
                <Badge className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border-red-400/30 animate-pulse ml-2">
                  LIVE
                </Badge>
              )}
            </div>

            {/* Teams Row with Records */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-center">
                <div className="text-sm font-semibold">{game.awayTeam.shortName}</div>
                <div className="text-xs text-muted-foreground">({game.awayTeam.record})</div>
              </div>
              <span className="text-xs text-muted-foreground font-medium px-2">@</span>
              <div className="text-center">
                <div className="text-sm font-semibold">{game.homeTeam.shortName}</div>
                <div className="text-xs text-muted-foreground">({game.homeTeam.record})</div>
              </div>
            </div>

            {/* Three-Column Betting Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Spread Column */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium">SPREAD</div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
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
                    className="w-full h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
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

              {/* Total Column with Time */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(game.startTime)}
                  </div>
                  <div>TOTAL</div>
                </div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
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
                    className="w-full h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
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
                    className="w-full h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
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
                    className="w-full h-7 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
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
                  className="overflow-hidden mt-2"
                >
                  <Separator className="mb-2" />
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
          {/* Desktop Compact Layout */}
          <div className="flex items-center justify-between">
            {/* Left Side - Game Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs px-2 py-1 font-medium bg-muted/40">
                  {game.leagueId}
                </Badge>
                {game.status === 'live' && (
                  <Badge className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border-red-400/30 animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>

              {/* Teams with Records */}
              <div className="flex items-center gap-3 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{game.awayTeam.shortName}</div>
                  <div className="text-xs text-muted-foreground">({game.awayTeam.record})</div>
                </div>
                <span className="text-xs text-muted-foreground font-medium">@</span>
                <div className="text-center">
                  <div className="font-semibold">{game.homeTeam.shortName}</div>
                  <div className="text-xs text-muted-foreground">({game.homeTeam.record})</div>
                </div>
              </div>
            </div>

            {/* Right Side - Betting Options */}
            <div className="flex items-center gap-6">
              {/* Spread */}
              <div className="flex flex-col gap-1 items-center">
                <div className="text-xs text-muted-foreground font-medium">SPREAD</div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'spread', 'away',
                        game.odds.spread.away.odds,
                        game.odds.spread.away.line || 0
                      )
                    }}
                  >
                    {game.awayTeam.shortName} {`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'spread', 'home',
                        game.odds.spread.home.odds,
                        game.odds.spread.home.line || 0
                      )
                    }}
                  >
                    {game.homeTeam.shortName} {`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                  </Button>
                </div>
              </div>

              {/* Total with Time */}
              <div className="flex flex-col gap-1 items-center">
                <div className="text-xs text-muted-foreground font-medium flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(game.startTime)}
                  </div>
                  <div>TOTAL</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
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
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.line || 47.5
                      )
                    }}
                  >
                    U {formatTotalLine(game.odds.total.under?.line || 47.5)}
                  </Button>
                </div>
              </div>

              {/* Moneyline */}
              <div className="flex flex-col gap-1 items-center">
                <div className="text-xs text-muted-foreground font-medium">MONEYLINE</div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'away',
                        game.odds.moneyline.away.odds
                      )
                    }}
                  >
                    {game.awayTeam.shortName} {formatOdds(game.odds.moneyline.away.odds)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                      )
                    }}
                  >
                    {game.homeTeam.shortName} {formatOdds(game.odds.moneyline.home.odds)}
                  </Button>
                </div>
              </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}