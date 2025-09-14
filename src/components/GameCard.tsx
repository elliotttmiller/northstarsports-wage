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
    if (e) e.stopPropagation()
    if (!isExpanded && playerProps.length === 0) {
      setPropsLoading(true)
      try {
        const props = await getPlayerProps(game.id)
        setPlayerProps(props)
      } catch (error) {
        console.error('Failed to load player props:', error)
      } finally {
        setPropsLoading(false)
      }
    }
    setIsExpanded(!isExpanded)
  }

  const handleCardClick = () => {
    if (!compact) {
      handleExpandToggle()
    }
  }

  const getStatIcon = (category: string) => {
    switch (category) {
      case 'passing': return <Target className="w-3 h-3" />
      case 'rushing': return <TrendUp className="w-3 h-3" />
      case 'receiving': return <Users className="w-3 h-3" />
      case 'scoring': return <Trophy className="w-3 h-3" />
      default: return <Target className="w-3 h-3" />
    }
  }

  const groupedProps = playerProps.reduce((acc, prop) => {
    if (!acc[prop.category]) {
      acc[prop.category] = []
    }
    acc[prop.category].push(prop)
    return acc
  }, {} as Record<string, PlayerProp[]>)

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <Card className="hover:shadow-sm transition-all duration-200 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-3">
            {/* Header with time and status - Very compact */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  {formatTime(game.startTime)}
                </span>
              </div>
              {game.status === 'live' && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5 animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            
            {/* Teams and matchup - Single line layout */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex-1 text-right pr-2">
                <div className="text-sm font-semibold text-foreground truncate">
                  {game.awayTeam.shortName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {game.awayTeam.record}
                </div>
              </div>
              <div className="px-2">
                <span className="text-xs text-muted-foreground">@</span>
              </div>
              <div className="flex-1 text-left pl-2">
                <div className="text-sm font-semibold text-foreground truncate">
                  {game.homeTeam.shortName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {game.homeTeam.record}
                </div>
              </div>
            </div>

            {/* Betting Lines - Horizontal layout */}
            <div className="grid grid-cols-6 gap-1 mb-2">
              {/* Spread */}
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground text-center mb-1 font-medium">
                  SPREAD
                </div>
                <div className="grid grid-cols-2 gap-0.5">
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
                      <div className="font-semibold leading-3">{game.odds.spread.away.line}</div>
                      <div className="text-xs text-muted-foreground leading-3">
                        {formatOdds(game.odds.spread.away.odds)}
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                    onClick={(e) => {
                      handleBetClick(
                        e, 'spread', 'home', 
                        game.odds.spread.home.odds, 
                        game.odds.spread.home.line
                      )
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold text-foreground leading-3">{game.homeTeam.shortName}</div>
                      <div className="text-xs font-bold text-foreground leading-3">{game.homeTeam.shortName}</div>
                      <div className="text-xs text-muted-foreground leading-3">
                      <div className="text-xs text-muted-foreground leading-3">
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
                <div className="grid grid-cols-2 gap-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                      e.stopPropagation()
                      e.stopPropagation()
                        e, 'total', 'over',
                        game.odds.total.over?.odds || -110,
                        game.odds.total.over?.line
                      )
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold text-foreground leading-3">OVER</div>
                      <div className="text-xs font-bold text-foreground leading-3">OVER</div>
                        {formatTotalLine(game.odds.total.over?.line || 45.5)}
                        {formatTotalLine(game.odds.total.over?.line || 45.5)}
                      <div className="text-xs text-muted-foreground leading-3">
                      <div className="text-xs text-muted-foreground leading-3">
                        {formatOdds(game.odds.total.over?.odds || -110)}
                      </div>
                  </Button>
                  <Button
                  <Button
                    variant="outline"
                    size="sm"g-accent hover:text-accent-foreground transition-colors"
                    className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                      e.stopPropagation()
                      handleBetClick(
                        e, 'total', 'under',
                        game.odds.total.under?.odds || -110,
                        game.odds.total.under?.odds || -110,
                      )
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold text-foreground leading-3">UNDER</div>
                      <div className="text-xs font-bold text-foreground leading-3">UNDER</div>
                        {formatTotalLine(game.odds.total.under?.line || 45.5)}
                      </div>
                      <div className="text-xs text-muted-foreground leading-3">
                      <div className="text-xs text-muted-foreground leading-3">
                        {formatOdds(game.odds.total.under?.odds || -110)}
                      </div>
                  </Button>
                  </Button>
              </div>

              {/* Moneyline */}
              {/* Moneyline */}
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground text-center mb-1 font-medium">
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'away',
                        game.odds.moneyline.away.odds
                      )
                    }}
                  >
                  >
                    <div className="text-center">v>
                      <div className="text-xs font-bold text-foreground leading-3">{game.awayTeam.shortName}</div>
                      <div className="text-xs font-semibold leading-3">
                        {formatOdds(game.odds.moneyline.away.odds)}
                      </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    className="h-10 p-0.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBetClick(
                        e, 'moneyline', 'home',
                        game.odds.moneyline.home.odds
                    }}
                  >
                    <div className="text-center">
                    <div className="text-center">v>
                      <div className="text-xs font-bold text-foreground leading-3">{game.homeTeam.shortName}</div>
                      <div className="text-xs font-semibold leading-3">
                        {formatOdds(game.odds.moneyline.home.odds)}
                      </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Expand indicator */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {isExpanded ? (
                {isExpanded ? (
                  <>
                    <CaretUp className="w-3 h-3" />
                    <span>Tap to collapse</span>
                  </>
                  <>
                    <CaretDown className="w-3 h-3" />
                    <span>Tap for player props</span>
                  </>
                )}
              </div>
            </div>

            {/* Expanded Player Props for Mobile */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <Separator className="my-3" />
                  
                  {propsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent mx-auto"></div>
                      <p className="text-xs text-muted-foreground mt-2">Loading props...</p>
                    </div>
                  ) : playerProps.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No player props available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <h4 className="text-sm font-semibold text-foreground">Player Props</h4>
                      </div>
                      
                      {Object.entries(groupedProps).map(([category, props]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            {getStatIcon(category)}
                            <h5 className="text-xs font-semibold text-foreground capitalize">
                              {category}
                            </h5>
                          </div>
                          <div className="space-y-2">
                            {props.slice(0, 4).map((prop) => (
                              <div key={prop.id} className="bg-muted/30 border border-border/50 rounded-lg p-2.5">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-foreground truncate">
                                      {prop.playerName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {prop.statType}
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="text-xs font-semibold px-2">
                                    {prop.line}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handlePlayerPropClick(e, prop, 'over')
                                    }}
                                  >
                                    Over {formatOdds(prop.overOdds)}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handlePlayerPropClick(e, prop, 'under')
                                    }}
                                  >
                                    Under {formatOdds(prop.underOdds)}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Optimized desktop card - click to expand, no props button
  return (
    <motion.div
      layout
      className="cursor-pointer"
      onClick={handleCardClick}
    >
      <Card className={`hover:shadow-lg transition-all duration-200 border-border bg-card ${isExpanded ? 'ring-1 ring-accent' : ''}`}>
        <CardContent className="p-3">
          {/* Header - Simplified */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatTime(game.startTime)}
              </span>
              {game.status === 'live' && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  LIVE
                </Badge>
              )}
              {game.status === 'finished' && (
                <Badge variant="secondary" className="text-xs">FINAL</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {isExpanded ? 'Click to collapse' : 'Click to expand'}
            </div>
          </div>
          
          {/* Compact Team Matchup */}
          <div className="grid grid-cols-5 gap-3 items-center mb-3">
            <div className="col-span-2 text-right">
              <div className="text-base font-semibold text-foreground truncate">
                {game.awayTeam.shortName}
              </div>
              <div className="text-xs text-muted-foreground">
                {game.awayTeam.record}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-muted-foreground">@</div>
            </div>

            <div className="col-span-2 text-left">
              <div className="text-base font-semibold text-foreground truncate">
                {game.homeTeam.shortName}
              </div>
              <div className="text-xs text-muted-foreground">
                {game.homeTeam.record}
              </div>
            </div>
          </div>

          {/* Compact Betting Lines */}
          <div className="grid grid-cols-6 gap-2">
            {/* Spread */}
            <div className="col-span-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground text-center">
                SPREAD
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'spread', 'away',
                    game.odds.spread.away.odds,
                    game.odds.spread.away.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs font-medium">{game.odds.spread.away.line}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatOdds(game.odds.spread.away.odds)}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'spread', 'home',
                    game.odds.spread.home.odds,
                    game.odds.spread.home.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs font-medium">{game.odds.spread.home.line}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatOdds(game.odds.spread.home.odds)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="col-span-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground text-center">
                TOTAL
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'total', 'over',
                    game.odds.total.over?.odds || -110,
                    game.odds.total.over?.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">O</div>
                    <div className="text-xs font-medium">{formatTotalLine(game.odds.total.over?.line || 45.5)}</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'total', 'under',
                    game.odds.total.under?.odds || -110,
                    game.odds.total.under?.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">U</div>
                    <div className="text-xs font-medium">{formatTotalLine(game.odds.total.under?.line || 45.5)}</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Moneyline */}
            <div className="col-span-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground text-center">
                MONEYLINE
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'moneyline', 'away',
                    game.odds.moneyline.away.odds
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs font-medium">{formatOdds(game.odds.moneyline.away.odds)}</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'moneyline', 'home',
                    game.odds.moneyline.home.odds
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs font-medium">{formatOdds(game.odds.moneyline.home.odds)}</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Expandable Player Props */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Separator className="my-3" />
                
                {propsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                  </div>
                ) : playerProps.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No player props available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Player Props
                    </h4>
                    {Object.entries(groupedProps).map(([category, props]) => (
                      <div key={category} className="space-y-2">
                        <h5 className="text-xs font-medium text-muted-foreground capitalize flex items-center gap-1">
                          {getStatIcon(category)}
                          {category}
                        </h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {props.slice(0, 4).map((prop) => (
                            <div key={prop.id} className="border border-border rounded-md p-2">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <div className="text-xs font-medium text-foreground truncate">
                                    {prop.playerName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {prop.statType}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {prop.line}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs hover:bg-accent hover:text-accent-foreground"
                                  onClick={(e) => handlePlayerPropClick(e, prop, 'over')}
                                >
                                  O {formatOdds(prop.overOdds)}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs hover:bg-accent hover:text-accent-foreground"
                                  onClick={(e) => handlePlayerPropClick(e, prop, 'under')}
                                >
                                  U {formatOdds(prop.underOdds)}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}