import { useState, useCallback } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { PropCategory, PlayerProp } from '@/services/mockApi'
import { Game } from '@/types'
import { formatOdds, formatTotalLine } from '@/lib/formatters'
import { CaretDown, Target, TrendUp, Football, Users, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PlayerPropsSectionProps {
  categories: PropCategory[]
  game: Game
  isLoading: boolean
  compact?: boolean
}

// Simple prop button without unnecessary effects
interface PropButtonProps {
  prop: PlayerProp
  selection: 'over' | 'under'
  onClick: (e: React.MouseEvent) => void
  compact?: boolean
}

const PropButton = ({ prop, selection, onClick, compact = false }: PropButtonProps) => {
  const odds = selection === 'over' ? prop.overOdds : prop.underOdds
  const displayText = selection === 'over' ? 'O' : 'U'
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        'h-auto p-2 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors',
        compact ? 'h-9 p-1.5' : 'h-11 p-2'
      )}
      onClick={onClick}
    >
      <div className="text-center w-full">
        <div className={cn(
          'font-semibold text-foreground',
          compact ? 'text-xs' : 'text-sm'
        )}>
          {displayText} {formatTotalLine(prop.line)}
        </div>
        <div className={cn(
          'text-muted-foreground mt-0.5',
          compact ? 'text-xs' : 'text-xs'
        )}>
          {formatOdds(odds)}
        </div>
      </div>
    </Button>
  )
}

export function PlayerPropsSection({ categories, game, isLoading, compact = false }: PlayerPropsSectionProps) {
  const { addBet } = useBetSlip()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['popular'])) // Default expand popular

  const handlePlayerPropClick = useCallback((
    e: React.MouseEvent,
    prop: PlayerProp,
    selection: 'over' | 'under'
  ) => {
    e.stopPropagation()
    const odds = selection === 'over' ? prop.overOdds : prop.underOdds
    addBet(game, 'player_prop', selection, odds, prop.line, prop)
    
    // Simple mobile feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
    
    toast.success(`${prop.playerName} ${prop.statType} ${selection} added!`, {
      duration: 1200,
      position: 'bottom-center'
    })
  }, [addBet, game])

  const toggleCategory = useCallback((categoryKey: string) => {
    setExpandedCategories(current => {
      const newSet = new Set(current)
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey)
      } else {
        newSet.add(categoryKey)
      }
      return newSet
    })
  }, [])

  const getCategoryIcon = useCallback((categoryKey: string) => {
    switch (categoryKey) {
      case 'passing':
        return <Football size={16} className="text-accent" />
      case 'rushing':
        return <TrendUp size={16} className="text-accent" />
      case 'receiving':
        return <Target size={16} className="text-accent" />
      case 'scoring':
        return <Star size={16} className="text-accent" />
      case 'kicking':
        return <Target size={16} className="text-accent" />
      default:
        return <Users size={16} className="text-accent" />
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent" />
          <h4 className="font-semibold text-sm">Player Props</h4>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="rounded-full h-6 w-6 border-2 border-accent border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent" />
          <h4 className="font-semibold text-sm">Player Props</h4>
        </div>
        <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg">
          No player props available for this game
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent" />
          <h4 className="font-semibold text-sm">Player Props</h4>
        </div>
        <div className="text-xs text-muted-foreground">
          {categories.reduce((sum, cat) => sum + cat.props.length, 0)} props
        </div>
      </div>

      <div className={cn(
        'space-y-3 scrollbar-hide scroll-smooth',
        compact ? 'max-h-80' : 'max-h-96',
        'overflow-y-auto pr-1'
      )}>
        {categories.map((category) => (
          <Card key={category.key} className="bg-muted/20 border-border/30">
            <CardContent className="p-3">
              {/* Category Header */}
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-2 hover:bg-muted/50 transition-colors rounded-lg"
                onClick={() => toggleCategory(category.key)}
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category.key)}
                  <span className="font-medium text-sm">{category.name}</span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-card/80 text-foreground border-border/40"
                  >
                    {category.props.length}
                  </Badge>
                </div>
                <CaretDown 
                  size={16} 
                  className={cn(
                    'transform transition-transform duration-200',
                    expandedCategories.has(category.key) && 'rotate-180'
                  )} 
                />
              </Button>

              {/* Category Props */}
              {expandedCategories.has(category.key) && (
                <div className="mt-3">
                  <Separator className="mb-3 opacity-30" />
                  <div className="space-y-3">
                    {category.props.map((prop) => (
                      <div
                        key={prop.id}
                        className={cn(
                          'bg-card/50 rounded-lg border border-border/30',
                          'hover:border-accent/20 transition-colors',
                          compact ? 'p-2' : 'p-3'
                        )}
                      >
                        {/* Player Info */}
                        <div className={cn(
                          'flex items-center justify-between',
                          compact ? 'mb-2' : 'mb-3'
                        )}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                'font-semibold',
                                compact ? 'text-xs' : 'text-sm'
                              )}>
                                {prop.playerName}
                              </span>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {prop.position}
                              </Badge>
                              <Badge 
                                variant={prop.team === 'home' ? 'default' : 'secondary'} 
                                className="text-xs px-2 py-0.5"
                              >
                                {prop.team === 'home' ? game.homeTeam.shortName : game.awayTeam.shortName}
                              </Badge>
                            </div>
                            <div className={cn(
                              'text-muted-foreground font-medium',
                              compact ? 'text-xs mt-0.5' : 'text-sm mt-1'
                            )}>
                              {prop.statType}
                            </div>
                          </div>
                        </div>

                        {/* Betting Options */}
                        <div className="grid grid-cols-2 gap-2">
                          <PropButton
                            prop={prop}
                            selection="over"
                            onClick={(e) => handlePlayerPropClick(e, prop, 'over')}
                            compact={compact}
                          />
                          <PropButton
                            prop={prop}
                            selection="under"
                            onClick={(e) => handlePlayerPropClick(e, prop, 'under')}
                            compact={compact}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}