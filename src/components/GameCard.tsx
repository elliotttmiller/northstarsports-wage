import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Game } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters'
import { Clock, Trophy } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GameCardProps {
  game: Game
  compact?: boolean
}

export function GameCard({ game, compact = false }: GameCardProps) {
  const navigate = useNavigate()
  const { addBet } = useBetSlip()

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

  const handleGameClick = () => {
    navigate(`/games/${game.id}`)
  }

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleGameClick}
        className="cursor-pointer"
      >
        <Card className="hover:shadow-md transition-all duration-200 border-border bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatTime(game.startTime)}
                </span>
                {game.status === 'live' && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5 animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent"
                onClick={handleGameClick}
              >
                <Trophy className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Teams */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">
                  {game.awayTeam.shortName}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {game.awayTeam.record}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">
                  {game.homeTeam.shortName}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {game.homeTeam.record}
                </span>
              </div>
            </div>

            {/* Quick bet buttons */}
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => handleBetClick(
                  e, 'spread', 'away', 
                  game.odds.spread.away.odds, 
                  game.odds.spread.away.line
                )}
              >
                {game.odds.spread.away.line}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => handleBetClick(
                  e, 'total', 'over',
                  game.odds.total.over?.odds || -110,
                  game.odds.total.over?.line
                )}
              >
                O{formatTotalLine(game.odds.total.over?.line || 45.5)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => handleBetClick(
                  e, 'moneyline', 'away',
                  game.odds.moneyline.away.odds
                )}
              >
                {formatOdds(game.odds.moneyline.away.odds)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Full size card for desktop/detailed view
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleGameClick}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatTime(game.startTime)}
              </span>
              {game.status === 'live' && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
              {game.status === 'finished' && (
                <Badge variant="secondary">FINAL</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-accent"
              onClick={handleGameClick}
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
          
          {/* Team Matchup */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-4">
            <div className="text-center lg:text-right">
              <div className="text-lg font-bold text-foreground">
                {game.awayTeam.shortName}
              </div>
              <div className="text-sm text-muted-foreground">
                {game.awayTeam.record}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">vs</div>
              <div className="text-xs font-medium text-muted-foreground">
                {game.venue || 'TBD'}
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="text-lg font-bold text-foreground">
                {game.homeTeam.shortName}
              </div>
              <div className="text-sm text-muted-foreground">
                {game.homeTeam.record}
              </div>
            </div>
          </div>

          {/* Betting Lines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Spread */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground text-center">
                SPREAD
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'spread', 'away',
                    game.odds.spread.away.odds,
                    game.odds.spread.away.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">{game.awayTeam.shortName}</div>
                    <div className="font-medium">{game.odds.spread.away.line}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatOdds(game.odds.spread.away.odds)}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'spread', 'home',
                    game.odds.spread.home.odds,
                    game.odds.spread.home.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">{game.homeTeam.shortName}</div>
                    <div className="font-medium">{game.odds.spread.home.line}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatOdds(game.odds.spread.home.odds)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground text-center">
                TOTAL
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'total', 'over',
                    game.odds.total.over?.odds || -110,
                    game.odds.total.over?.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">Over</div>
                    <div className="font-medium">{formatTotalLine(game.odds.total.over?.line || 45.5)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatOdds(game.odds.total.over?.odds || -110)}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'total', 'under',
                    game.odds.total.under?.odds || -110,
                    game.odds.total.under?.line
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">Under</div>
                    <div className="font-medium">{formatTotalLine(game.odds.total.under?.line || 45.5)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatOdds(game.odds.total.under?.odds || -110)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Moneyline */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground text-center">
                MONEYLINE
              </div>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'moneyline', 'away',
                    game.odds.moneyline.away.odds
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">{game.awayTeam.shortName}</div>
                    <div className="font-medium">{formatOdds(game.odds.moneyline.away.odds)}</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={(e) => handleBetClick(
                    e, 'moneyline', 'home',
                    game.odds.moneyline.home.odds
                  )}
                >
                  <div className="text-center w-full">
                    <div className="text-xs">{game.homeTeam.shortName}</div>
                    <div className="font-medium">{formatOdds(game.odds.moneyline.home.odds)}</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}