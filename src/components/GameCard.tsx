import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Game } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { getPlayerProps, PlayerProp } from '@/services/mockApi'
import { Clock, Trophy, CaretDown, CaretUp, Target, TrendUp, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GameCardProps {
  game: Game
  compact?: boolean
}

export function GameCard({ game, compact = false }: GameCardProps) {
  const { addBet } = useBetSlip()
  const [isExpanded, setIsExpanded] = useState(false)
  const [playerProps, setPlayerProps] = useState<PlayerProp[]>([])
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

  const handlePlayerPropClick = (
    e: React.MouseEvent,
    prop: PlayerProp,
    selection: 'over' | 'under'
  ) => {
    e.stopPropagation()
    const odds = selection === 'over' ? prop.overOdds : prop.underOdds
    addBet(game, 'player_prop', selection, odds, prop.line, prop)
    toast.success(`${prop.playerName} ${prop.statType} ${selection} added!`, {
      duration: 1500,
    })
  }

  const handleExpandToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    if (!isExpanded && playerProps.length === 0) {
      setPropsLoading(true)
      try {
        const props = await getPlayerProps(game.id)
        setPlayerProps(props)
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
      <Card className="bg-card hover:bg-card/80 transition-colors cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium">{game.homeTeam.name} vs {game.awayTeam.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {formatTime(game.startTime)}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {game.leagueId}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="bg-card hover:bg-card/80 transition-all duration-200 cursor-pointer" onClick={handleExpandToggle}>
        <CardContent className="p-4">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {game.leagueId}
              </Badge>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {formatTime(game.startTime)}
              </div>
              {game.status === 'live' && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </Button>
            </div>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="font-medium text-sm">{game.awayTeam.name}</div>
              <div className="text-xs text-muted-foreground">{game.awayTeam.record}</div>
            </div>
            <div className="text-center text-xs text-muted-foreground self-center">
              VS
            </div>
            <div className="text-center">
              <div className="font-medium text-sm">{game.homeTeam.name}</div>
              <div className="text-xs text-muted-foreground">{game.homeTeam.record}</div>
            </div>
          </div>

          {/* Betting Lines */}
          <div className="grid grid-cols-6 gap-2 text-xs">
            {/* Spread */}
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground text-center mb-1 font-medium">
                SPREAD
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBetClick(
                      e, 'spread', 'away',
                      game.odds.spread.away.odds,
                      game.odds.spread.away.line
                    )
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground leading-3">{game.awayTeam.shortName}</div>
                    <div className="font-semibold leading-3">
                      {game.odds.spread.away.line && game.odds.spread.away.line > 0 ? '+' : ''}{game.odds.spread.away.line || 0}
                    </div>
                    <div className="text-xs text-muted-foreground leading-3">
                      {formatOdds(game.odds.spread.away.odds)}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBetClick(
                      e, 'spread', 'home',
                      game.odds.spread.home.odds,
                      game.odds.spread.home.line
                    )
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground leading-3">{game.homeTeam.shortName}</div>
                    <div className="font-semibold leading-3">
                      {game.odds.spread.home.line && game.odds.spread.home.line > 0 ? '+' : ''}{game.odds.spread.home.line || 0}
                    </div>
                    <div className="text-xs text-muted-foreground leading-3">
                      {formatOdds(game.odds.spread.home.odds)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground text-center mb-1 font-medium">
                TOTAL
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBetClick(
                      e, 'total', 'over',
                      game.odds.total.over?.odds || -110,
                      game.odds.total.over?.line
                    )
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground leading-3">OVER</div>
                    <div className="font-semibold leading-3">
                      {formatTotalLine(game.odds.total.over?.line || 45.5)}
                    </div>
                    <div className="text-xs text-muted-foreground leading-3">
                      {formatOdds(game.odds.total.over?.odds || -110)}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBetClick(
                      e, 'total', 'under',
                      game.odds.total.under?.odds || -110,
                      game.odds.total.under?.line
                    )
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground leading-3">UNDER</div>
                    <div className="font-semibold leading-3">
                      {formatTotalLine(game.odds.total.under?.line || 45.5)}
                    </div>
                    <div className="text-xs text-muted-foreground leading-3">
                      {formatOdds(game.odds.total.under?.odds || -110)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Moneyline */}
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground text-center mb-1 font-medium">
                MONEYLINE
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBetClick(
                      e, 'moneyline', 'away',
                      game.odds.moneyline.away.odds
                    )
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground leading-3">{game.awayTeam.shortName}</div>
                    <div className="text-xs font-semibold leading-3">
                      {formatOdds(game.odds.moneyline.away.odds)}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBetClick(
                      e, 'moneyline', 'home',
                      game.odds.moneyline.home.odds
                    )
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground leading-3">{game.homeTeam.shortName}</div>
                    <div className="text-xs font-semibold leading-3">
                      {formatOdds(game.odds.moneyline.home.odds)}
                    </div>
                  </div>
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
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    <h4 className="font-medium text-sm">Player Props</h4>
                  </div>

                  {propsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : playerProps.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto virtual-scrollbar scroll-smooth">
                      {playerProps.map((prop) => (
                        <div
                          key={`${prop.playerId}-${prop.statType}`}
                          className="bg-muted/50 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium text-sm">{prop.playerName}</div>
                              <div className="text-xs text-muted-foreground">
                                {prop.statType} • Line: {formatTotalLine(prop.line)}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {prop.position}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs hover:bg-accent hover:text-accent-foreground"
                              onClick={(e) => handlePlayerPropClick(e, prop, 'over')}
                            >
                              <div className="text-center">
                                <div>OVER {formatTotalLine(prop.line)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatOdds(prop.overOdds)}
                                </div>
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs hover:bg-accent hover:text-accent-foreground"
                              onClick={(e) => handlePlayerPropClick(e, prop, 'under')}
                            >
                              <div className="text-center">
                                <div>UNDER {formatTotalLine(prop.line)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatOdds(prop.underOdds)}
                                </div>
                              </div>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No player props available
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}