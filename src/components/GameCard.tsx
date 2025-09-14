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
  className?: string
}

export function GameCard({ game, className }: GameCardProps) {
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
          'bg-card/50 border-border/30 hover:border-accent/40 smooth-transition cursor-pointer card-hover',
          isExpanded && 'border-accent/50 bg-card/80',
          className
        )}
        onClick={handleExpandToggle}
      >
        <CardContent className="p-3">
          {/* Mobile Layout - Optimized */}
          <div className="lg:hidden">
            {/* Game Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-muted/40">
                  {game.leagueId}
                </Badge>
                {game.status === 'live' && (
                  <Badge className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border-red-400/30 animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={10} />
                {formatTime(game.startTime)}
              </div>
            </div>

            {/* Teams Row */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="text-center flex-1">
                <div className="text-sm font-semibold">{game.awayTeam.shortName}</div>
                <div className="text-xs text-muted-foreground">({game.awayTeam.record})</div>
              </div>
              <span className="text-xs text-muted-foreground font-medium px-2">@</span>
              <div className="text-center flex-1">
                <div className="text-sm font-semibold">{game.homeTeam.shortName}</div>
                <div className="text-xs text-muted-foreground">({game.homeTeam.record})</div>
              </div>
            </div>

            {/* Betting Options - Compact 3-column Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Spread */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium">SPREAD</div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition p-1"
                    onClick={(e) => handleBetClick(e, 'spread', 'away', game.odds.spread.away.odds, game.odds.spread.away.line || 0)}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium text-xs">{game.awayTeam.shortName}</span>
                      <span className="text-xs">{`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition p-1"
                    onClick={(e) => handleBetClick(e, 'spread', 'home', game.odds.spread.home.odds, game.odds.spread.home.line || 0)}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium text-xs">{game.homeTeam.shortName}</span>
                      <span className="text-xs">{`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium">TOTAL</div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition p-1"
                    onClick={(e) => handleBetClick(e, 'total', 'over', game.odds.total.over?.odds || -110, game.odds.total.over?.line || 47.5)}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium text-xs">O</span>
                      <span className="text-xs">{formatTotalLine(game.odds.total.over?.line || 47.5)}</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition p-1"
                    onClick={(e) => handleBetClick(e, 'total', 'under', game.odds.total.under?.odds || -110, game.odds.total.under?.line || 47.5)}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium text-xs">U</span>
                      <span className="text-xs">{formatTotalLine(game.odds.total.under?.line || 47.5)}</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Moneyline */}
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground text-center font-medium">ML</div>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition p-1"
                    onClick={(e) => handleBetClick(e, 'moneyline', 'away', game.odds.moneyline.away.odds)}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium text-xs">{game.awayTeam.shortName}</span>
                      <span className="text-xs">{formatOdds(game.odds.moneyline.away.odds)}</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition p-1"
                    onClick={(e) => handleBetClick(e, 'moneyline', 'home', game.odds.moneyline.home.odds)}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-medium text-xs">{game.homeTeam.shortName}</span>
                      <span className="text-xs">{formatOdds(game.odds.moneyline.home.odds)}</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Compact Horizontal */}
          <div className="hidden lg:flex items-center justify-between py-2">
            {/* Game Info - Left */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-muted/40">
                  {game.leagueId}
                </Badge>
                {game.status === 'live' && (
                  <Badge className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border-red-400/30 animate-pulse">
                    LIVE
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={10} />
                  {formatTime(game.startTime)}
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center gap-2 text-sm">
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

            {/* Betting Options - Right */}
            <div className="flex items-center gap-4">
              {/* Spread */}
              <div className="flex flex-col gap-1 items-center">
                <div className="text-xs text-muted-foreground font-medium">SPREAD</div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition"
                    onClick={(e) => handleBetClick(e, 'spread', 'away', game.odds.spread.away.odds, game.odds.spread.away.line || 0)}
                  >
                    {game.awayTeam.shortName} {`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition"
                    onClick={(e) => handleBetClick(e, 'spread', 'home', game.odds.spread.home.odds, game.odds.spread.home.line || 0)}
                  >
                    {game.homeTeam.shortName} {`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="flex flex-col gap-1 items-center">
                <div className="text-xs text-muted-foreground font-medium">TOTAL</div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition"
                    onClick={(e) => handleBetClick(e, 'total', 'over', game.odds.total.over?.odds || -110, game.odds.total.over?.line || 47.5)}
                  >
                    O {formatTotalLine(game.odds.total.over?.line || 47.5)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition"
                    onClick={(e) => handleBetClick(e, 'total', 'under', game.odds.total.under?.odds || -110, game.odds.total.under?.line || 47.5)}
                  >
                    U {formatTotalLine(game.odds.total.under?.line || 47.5)}
                  </Button>
                </div>
              </div>

              {/* Moneyline */}
              <div className="flex flex-col gap-1 items-center">
                <div className="text-xs text-muted-foreground font-medium">ML</div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition"
                    onClick={(e) => handleBetClick(e, 'moneyline', 'away', game.odds.moneyline.away.odds)}
                  >
                    {game.awayTeam.shortName} {formatOdds(game.odds.moneyline.away.odds)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 smooth-transition"
                    onClick={(e) => handleBetClick(e, 'moneyline', 'home', game.odds.moneyline.home.odds)}
                  >
                    {game.homeTeam.shortName} {formatOdds(game.odds.moneyline.home.odds)}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Player Props */}
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