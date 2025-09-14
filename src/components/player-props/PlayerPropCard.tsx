import { useCallback } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlayerProp } from '@/types'
import { Game } from '@/types'
import { formatOdds, formatTotalLine } from '@/lib/formatters'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PlayerPropCardProps {
  prop: PlayerProp
  game: Game
  compact?: boolean
  className?: string
}

interface PropBetButtonProps {
  prop: PlayerProp
  selection: 'over' | 'under'
  onClick: (e: React.MouseEvent) => void
  compact?: boolean
  isSelected?: boolean
}

const PropBetButton = ({ prop, selection, onClick, compact = false, isSelected = false }: PropBetButtonProps) => {
  const odds = selection === 'over' ? prop.overOdds : prop.underOdds
  const displayText = selection === 'over' ? 'O' : 'U'
  
  // Determine button variant based on odds and selection state
  const getButtonVariant = () => {
    if (isSelected) return 'default'
    if (odds > 0) return 'outline'
    return 'outline'
  }
  
  return (
    <Button
      variant={getButtonVariant()}
      size="sm"
      className={cn(
        'h-auto p-0 flex flex-col items-center relative overflow-hidden',
        'hover:shadow-lg transition-all duration-300 ease-out',
        'hover:transform hover:scale-[1.02] active:scale-95',
        compact ? 'min-h-[3rem]' : 'min-h-[3.5rem]',
        'group'
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 text-center w-full p-2">
        <div className={cn(
          'font-bold tracking-wide',
          compact ? 'text-sm' : 'text-base',
          'mb-1'
        )}>
          {displayText} {formatTotalLine(prop.line)}
        </div>
        <div className={cn(
          'font-medium opacity-90',
          compact ? 'text-xs' : 'text-sm',
          odds > 0 ? 'text-[color:var(--color-win)]' : 'text-[color:var(--color-loss)]'
        )}>
          {formatOdds(odds)}
        </div>
      </div>
    </Button>
  )
}

export function PlayerPropCard({ prop, game, compact = false, className }: PlayerPropCardProps) {
  const { addBet, betSlip } = useBetSlip()

  // Check if this prop is already in bet slip
  const isOverSelected = betSlip.bets.some(bet => 
    bet.betType === 'player_prop' && 
    bet.playerProp?.playerId === prop.playerId && 
    bet.selection === 'over'
  )
  
  const isUnderSelected = betSlip.bets.some(bet => 
    bet.betType === 'player_prop' && 
    bet.playerProp?.playerId === prop.playerId && 
    bet.selection === 'under'
  )

  const handlePlayerPropClick = useCallback((
    e: React.MouseEvent,
    selection: 'over' | 'under'
  ) => {
    e.stopPropagation()
    const odds = selection === 'over' ? prop.overOdds : prop.underOdds
    addBet(game, 'player_prop', selection, odds, prop.line, prop)
    
    // Professional haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 5, 15])
    }
    
    toast.success(
      `${prop.playerName} ${prop.statType} ${selection.toUpperCase()} ${formatTotalLine(prop.line)} added`, 
      {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: 'oklch(0.12 0.015 240)',
          border: '1px solid oklch(0.18 0.02 240)',
          color: 'oklch(0.88 0.005 240)'
        }
      }
    )
  }, [addBet, game, prop])

  return (
    <Card className={cn(
      'group/card bg-card/50 border-border/30 transition-all duration-300',
      'hover:bg-card/70 hover:border-accent/20 hover:shadow-lg',
      'hover:transform hover:translate-y-[-1px]',
      className
    )}>
      <CardContent className={cn(
        'p-0',
        compact ? 'p-3' : 'p-4'
      )}>
        {/* Player Header */}
        <div className={cn(
          'flex items-start justify-between mb-3',
          compact && 'mb-2'
        )}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h5 className={cn(
                'font-bold text-foreground truncate',
                compact ? 'text-sm' : 'text-base'
              )}>
                {prop.playerName}
              </h5>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-muted/50 border-border/50"
              >
                {prop.position}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant={prop.team === 'home' ? 'default' : 'secondary'} 
                className={cn(
                  'text-xs px-2 py-0.5 font-medium',
                  prop.team === 'home' 
                    ? 'bg-accent/20 text-accent border-accent/30' 
                    : 'bg-muted/50 text-muted-foreground border-border/50'
                )}
              >
                {prop.team === 'home' ? game.homeTeam.shortName : game.awayTeam.shortName}
              </Badge>
            </div>
            
            <p className={cn(
              'text-muted-foreground font-medium',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {prop.statType}
            </p>
          </div>
        </div>

        {/* Betting Grid */}
        <div className="grid grid-cols-2 gap-3">
          <PropBetButton
            prop={prop}
            selection="over"
            onClick={(e) => handlePlayerPropClick(e, 'over')}
            compact={compact}
            isSelected={isOverSelected}
          />
          <PropBetButton
            prop={prop}
            selection="under"
            onClick={(e) => handlePlayerPropClick(e, 'under')}
            compact={compact}
            isSelected={isUnderSelected}
          />
        </div>

        {/* Selection Indicator */}
        {(isOverSelected || isUnderSelected) && (
          <div className="mt-3 pt-3 border-t border-accent/20">
            <div className="flex items-center justify-center">
              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs font-medium">
                Added to Bet Slip
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}