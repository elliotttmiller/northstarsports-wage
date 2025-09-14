import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { PropCategory, PlayerProp } from '@/services/mockApi'
import { Game } from '@/types'
import { formatOdds, formatTotalLine } from '@/lib/formatters'
import { CaretDown, CaretUp, Target, TrendUp, Football, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PlayerPropsSectionProps {
  categories: PropCategory[]
  game: Game
  isLoading: boolean
  compact?: boolean
}

export function PlayerPropsSection({ categories, game, isLoading, compact = false }: PlayerPropsSectionProps) {
  const { addBet } = useBetSlip()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

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

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey)
    } else {
      newExpanded.add(categoryKey)
    }
    setExpandedCategories(newExpanded)
  }

  const getCategoryIcon = (categoryKey: string) => {
    switch (categoryKey) {
      case 'passing':
        return <Football size={16} className="text-primary" />
      case 'rushing':
        return <TrendUp size={16} className="text-primary" />
      case 'receiving':
        return <Target size={16} className="text-primary" />
      case 'scoring':
        return <Target size={16} className="text-primary" />
      case 'kicking':
        return <Target size={16} className="text-primary" />
      default:
        return <Users size={16} className="text-primary" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-primary" />
          <h4 className="font-medium text-sm">Player Props</h4>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-primary" />
          <h4 className="font-medium text-sm">Player Props</h4>
        </div>
        <div className="text-center py-8 text-sm text-muted-foreground">
          No player props available
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-primary" />
        <h4 className="font-medium text-sm">Player Props</h4>
      </div>

      <div className={`space-y-3 ${compact ? 'max-h-80' : 'max-h-96'} overflow-y-auto virtual-scrollbar scroll-smooth`}>
        {categories.map((category) => (
          <Card key={category.key} className="bg-muted/30 border-muted">
            <CardContent className="p-3">
              {/* Category Header */}
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-2 hover:bg-muted/50 transition-colors"
                onClick={() => toggleCategory(category.key)}
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category.key)}
                  <span className="font-medium text-sm">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.props.length}
                  </Badge>
                </div>
                {expandedCategories.has(category.key) ? 
                  <CaretUp size={16} /> : 
                  <CaretDown size={16} />
                }
              </Button>

              {/* Category Props */}
              <AnimatePresence>
                {expandedCategories.has(category.key) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      {category.props.map((prop) => (
                        <motion.div
                          key={prop.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`bg-card rounded-lg border border-border/50 ${
                            compact ? 'p-2' : 'p-3'
                          }`}
                        >
                          <div className={`flex items-center justify-between ${compact ? 'mb-1.5' : 'mb-2'}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                                  {prop.playerName}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {prop.position}
                                </Badge>
                                <Badge 
                                  variant={prop.team === 'home' ? 'default' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {prop.team === 'home' ? game.homeTeam.shortName : game.awayTeam.shortName}
                                </Badge>
                              </div>
                              <div className={`text-muted-foreground ${compact ? 'text-xs mt-0.5' : 'text-xs mt-1'}`}>
                                {prop.statType}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-auto p-2 text-xs hover:bg-accent hover:text-accent-foreground transition-colors ${
                                compact ? 'h-8 p-1.5' : 'h-auto p-2'
                              }`}
                              onClick={(e) => handlePlayerPropClick(e, prop, 'over')}
                            >
                              <div className="text-center w-full">
                                <div className={`font-semibold ${compact ? 'text-xs' : ''}`}>
                                  O {formatTotalLine(prop.line)}
                                </div>
                                <div className={`text-muted-foreground mt-0.5 ${compact ? 'text-xs' : 'text-xs'}`}>
                                  {formatOdds(prop.overOdds)}
                                </div>
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-auto p-2 text-xs hover:bg-accent hover:text-accent-foreground transition-colors ${
                                compact ? 'h-8 p-1.5' : 'h-auto p-2'
                              }`}
                              onClick={(e) => handlePlayerPropClick(e, prop, 'under')}
                            >
                              <div className="text-center w-full">
                                <div className={`font-semibold ${compact ? 'text-xs' : ''}`}>
                                  U {formatTotalLine(prop.line)}
                                </div>
                                <div className={`text-muted-foreground mt-0.5 ${compact ? 'text-xs' : 'text-xs'}`}>
                                  {formatOdds(prop.underOdds)}
                                </div>
                              </div>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}