import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game, PropCategory } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getCategorizedPlayerProps } from '@/services/mockApi'
import { Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PlayerPropsSection } from '@/components/PlayerPropsSection'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: Game
  className?: string
  compact?: boolean
}

export function GameCard({ game, className, compact = false }: GameCardProps) {
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
          {/* Mobile Layout - Clean and Compact */}
          <div className="lg:hidden space-y-3">
            {/* Game Header - Clean */}
            <div className="flex items-center justify-between">
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
                <Clock size={12} />
                {formatTime(game.startTime)}
              </div>
            </div>

            {/* Teams and Basic Bets */}
            <div className="space-y-2">
              {/* Away Team Row */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{game.awayTeam.shortName}</div>
                  <div className="text-xs text-muted-foreground">({game.awayTeam.record})</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => handleBetClick(e, 'spread', 'away', game.odds.spread.away.odds, game.odds.spread.away.line || 0)}
                  >
                    {`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => handleBetClick(e, 'total', 'over', game.odds.total.over?.odds || -110, game.odds.total.over?.line || 47.5)}
                  >
                    O {formatTotalLine(game.odds.total.over?.line || 47.5)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => handleBetClick(e, 'moneyline', 'away', game.odds.moneyline.away.odds)}
                  >
                    {formatOdds(game.odds.moneyline.away.odds)}
                  </Button>
                </div>
              </div>

              {/* Home Team Row */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{game.homeTeam.shortName}</div>
                  <div className="text-xs text-muted-foreground">({game.homeTeam.record})</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => handleBetClick(e, 'spread', 'home', game.odds.spread.home.odds, game.odds.spread.home.line || 0)}
                  >
                    {`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => handleBetClick(e, 'total', 'under', game.odds.total.under?.odds || -110, game.odds.total.under?.line || 47.5)}
                  >
                    U {formatTotalLine(game.odds.total.under?.line || 47.5)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                    onClick={(e) => handleBetClick(e, 'moneyline', 'home', game.odds.moneyline.home.odds)}
                  >
                    {formatOdds(game.odds.moneyline.home.odds)}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Compact Row */}
          <div className="hidden lg:flex items-center justify-between py-2">
            {/* Game Info */}
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
                  <Clock size={12} />
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

            {/* Betting Options - Compact */}
            <div className="flex items-center gap-3">
              {/* Spread */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => handleBetClick(e, 'spread', 'away', game.odds.spread.away.odds, game.odds.spread.away.line || 0)}
                >
                  {game.awayTeam.shortName} {`${(game.odds.spread.away.line || 0) > 0 ? '+' : ''}${game.odds.spread.away.line || 0}`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => handleBetClick(e, 'spread', 'home', game.odds.spread.home.odds, game.odds.spread.home.line || 0)}
                >
                  {game.homeTeam.shortName} {`${(game.odds.spread.home.line || 0) > 0 ? '+' : ''}${game.odds.spread.home.line || 0}`}
                </Button>
              </div>

              {/* Total */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => handleBetClick(e, 'total', 'over', game.odds.total.over?.odds || -110, game.odds.total.over?.line || 47.5)}
                >
                  O {formatTotalLine(game.odds.total.over?.line || 47.5)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => handleBetClick(e, 'total', 'under', game.odds.total.under?.odds || -110, game.odds.total.under?.line || 47.5)}
                >
                  U {formatTotalLine(game.odds.total.under?.line || 47.5)}
                </Button>
              </div>

              {/* Moneyline */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => handleBetClick(e, 'moneyline', 'away', game.odds.moneyline.away.odds)}
                >
                  {game.awayTeam.shortName} {formatOdds(game.odds.moneyline.away.odds)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-muted/20 border-border/60 hover:bg-accent/20 transition-colors"
                  onClick={(e) => handleBetClick(e, 'moneyline', 'home', game.odds.moneyline.home.odds)}
                >
                  {game.homeTeam.shortName} {formatOdds(game.odds.moneyline.home.odds)}
                </Button>
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
                  compact={compact}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}