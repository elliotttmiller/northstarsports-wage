import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getCategorizedPlayerProps, PropCategory } from '@/services/mockApi'
import { Clock, CaretDown, CaretUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PlayerPropsSection } from '@/components/PlayerPropsSection'

interface GameCardProps {
  game: Game
  compact?: boolean
}

export function GameCard({ game, compact = false }: GameCardProps) {
  const { addBet } = useBetSlip()
  const [isExpanded, setIsExpanded] = useState(false)
  const [propCategories, setPropCategories] = useState<PropCategory[]>([])
  const [propsLoading, setPropsLoading] = useState(false)

  const handleBetClick = (
    e: React.MouseEvent,
    betType: 'spread' | 'moneyline' | 'total',
    selection: 'home' | 'away' | 'over' | 'under',
    odds: number,
    line?: number
  ) => {
    e.stopPropagation()
    addBet(game, betType, selection, odds, line)
    toast.success('Bet added to slip!', { duration: 1500 })
  }

  const handleExpandToggle = async (e?: React.MouseEvent) => {
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
  }

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
        onClick={() => handleExpandToggle()}
      >
        <Card className="bg-card hover:bg-card/80 transition-all duration-200 overflow-hidden cursor-pointer">
          <CardContent className="p-3">
            {/* Game Header - Mobile Compact */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className="h-6 w-6 p-0 hover:bg-accent/20 transition-colors"
              >
                {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </Button>
            </div>

            {/* Teams - Mobile Layout */}
            <div className="flex items-center justify-between mb-3 text-sm">
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">{game.awayTeam.shortName}</div>
                <div className="text-xs text-muted-foreground">{game.awayTeam.record}</div>
              </div>
              <div className="text-xs text-muted-foreground font-medium px-3">
                @
              </div>
              <div className="flex-1 text-right">
                <div className="font-semibold text-sm">{game.homeTeam.shortName}</div>
                <div className="text-xs text-muted-foreground">{game.homeTeam.record}</div>
              </div>
            </div>

            {/* Mobile Betting Lines - Compact Front Display */}
            <div className="space-y-2">
              {/* Spread Row */}
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-xs text-muted-foreground text-center mb-1 font-semibold tracking-wide">
                  SPREAD
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 p-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'spread', 'away',
                        game.odds.spread.away.odds,
                        game.odds.spread.away.line
                      )
                    }}
                  >
                    <div className="text-center flex flex-col justify-center h-full w-full">
                      <div className="text-xs font-bold text-foreground">{game.awayTeam.shortName}</div>
                      <div className="font-semibold text-xs">
                        {game.odds.spread.away.line && game.odds.spread.away.line > 0 ? '+' : ''}{game.odds.spread.away.line || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatOdds(game.odds.spread.away.odds)}
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 p-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'spread', 'home',
                        game.odds.spread.home.odds,
                        game.odds.spread.home.line
                      )
                    }}
                  >
                    <div className="text-center flex flex-col justify-center h-full w-full">
                      <div className="text-xs font-bold text-foreground">{game.homeTeam.shortName}</div>
                      <div className="font-semibold text-xs">
                        {game.odds.spread.home.line && game.odds.spread.home.line > 0 ? '+' : ''}{game.odds.spread.home.line || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatOdds(game.odds.spread.home.odds)}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Total Row */}
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-xs text-muted-foreground text-center mb-1 font-semibold tracking-wide">
                  TOTAL
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 p-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'total', 'over',
                        game.odds.total.over?.odds || -110,
                        game.odds.total.over?.line
                      )
                    }}
                  >
                    <div className="text-center flex flex-col justify-center h-full w-full">
                      <div className="text-xs font-bold text-foreground">OVER</div>
                      <div className="font-semibold text-xs">
                        {formatTotalLine(game.odds.total.over?.line || 45.5)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatOdds(game.odds.total.over?.odds || -110)}
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 p-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.line
                      )
                    }}
                  >
                    <div className="text-center flex flex-col justify-center h-full w-full">
                      <div className="text-xs font-bold text-foreground">UNDER</div>
                      <div className="font-semibold text-xs">
                        {formatTotalLine(game.odds.total.under?.line || 45.5)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatOdds(game.odds.total.under?.odds || -110)}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Moneyline Row */}
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-xs text-muted-foreground text-center mb-1 font-semibold tracking-wide">
                  MONEYLINE
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 p-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'away',
                        game.odds.moneyline.away.odds
                      )
                    }}
                  >
                    <div className="text-center flex flex-col justify-center h-full w-full">
                      <div className="text-xs font-bold text-foreground mb-1">{game.awayTeam.shortName}</div>
                      <div className="text-xs font-semibold">
                        {formatOdds(game.odds.moneyline.away.odds)}
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 p-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                      )
                    }}
                  >
                    <div className="text-center flex flex-col justify-center h-full w-full">
                      <div className="text-xs font-bold text-foreground mb-1">{game.homeTeam.shortName}</div>
                      <div className="text-xs font-semibold">
                        {formatOdds(game.odds.moneyline.home.odds)}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Player Props - Mobile */}
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
      onClick={() => handleExpandToggle()}
    >
      <Card className="bg-card hover:bg-card/80 transition-all duration-200 overflow-hidden cursor-pointer">
        <CardContent className={`${compact ? 'p-3' : 'p-3'}`}>
          {/* Game Header - Compact for Desktop */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
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
            {!compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className="h-6 w-6 p-0 hover:bg-accent/20 transition-colors"
              >
                {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </Button>
            )}
          </div>

          {/* Teams - Compact Layout */}
          <div className={`flex items-center justify-between mb-2 ${compact ? 'text-sm' : ''}`}>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">{game.awayTeam.shortName}</div>
              <div className="text-xs text-muted-foreground">{game.awayTeam.record}</div>
            </div>
            <div className="text-xs text-muted-foreground font-medium px-3">
              @
            </div>
            <div className="flex-1 text-right">
              <div className="font-semibold text-sm">{game.homeTeam.shortName}</div>
              <div className="text-xs text-muted-foreground">{game.homeTeam.record}</div>
            </div>
          </div>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
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
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
}