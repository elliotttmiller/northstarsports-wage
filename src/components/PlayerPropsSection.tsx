import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useMemo } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { PropCategory, PlayerProp } from '@/services/mockApi'
import { Game } from '@/types'
import { formatOdds, formatTotalLine } from '@/lib/formatters'
import { CaretDown, CaretUp, Target, TrendUp, Football, Users, Lightning, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PlayerPropsSectionProps {
  categories: PropCategory[]
  game: Game
  isLoading: boolean
  compact?: boolean
}

// Enhanced prop button with mobile optimizations
interface PropButtonProps {
  prop: PlayerProp
  selection: 'over' | 'under'
  onClick: (e: React.MouseEvent) => void
  compact?: boolean
  isHighlighted?: boolean
}

const PropButton = ({ prop, selection, onClick, compact = false, isHighlighted = false }: PropButtonProps) => {
  const odds = selection === 'over' ? prop.overOdds : prop.underOdds
  const displayText = selection === 'over' ? 'O' : 'U'
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'h-auto p-2 text-xs hover:bg-accent hover:text-accent-foreground transition-all duration-200',
          'bg-gradient-to-br from-muted/60 to-muted/40 border-border/60',
          'hover:border-accent/40 hover:shadow-sm hover:shadow-accent/10',
          'focus:ring-2 focus:ring-accent/30 focus:ring-offset-1',
          compact ? 'h-9 p-1.5' : 'h-11 p-2',
          isHighlighted && 'ring-2 ring-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5'
        )}
        onClick={onClick}
      >
        <div className="text-center w-full relative">
          <div className={cn(
            'font-semibold text-foreground flex items-center justify-center gap-1',
            compact ? 'text-xs' : 'text-sm'
          )}>
            <span>{displayText} {formatTotalLine(prop.line)}</span>
            {isHighlighted && <Lightning size={10} className="text-yellow-400" weight="fill" />}
          </div>
          <div className={cn(
            'text-muted-foreground mt-0.5',
            compact ? 'text-xs' : 'text-xs'
          )}>
            {formatOdds(odds)}
          </div>
        </div>
        
        {/* Subtle glow for highlighted props */}
        {isHighlighted && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-yellow-400/10 to-yellow-400/5 rounded-lg" />
        )}
      </Button>
    </motion.div>
  )
}

export function PlayerPropsSection({ categories, game, isLoading, compact = false }: PlayerPropsSectionProps) {
  const { addBet } = useBetSlip()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['popular'])) // Default expand popular

  // Analyze props to highlight high-value opportunities
  const propsAnalysis = useMemo(() => {
    const allProps = categories.flatMap(cat => cat.props)
    const highlightedProps = new Set<string>()
    
    allProps.forEach(prop => {
      // Highlight props with extreme odds (potential value)
      const avgOdds = (Math.abs(prop.overOdds) + Math.abs(prop.underOdds)) / 2
      if (avgOdds < 120 || avgOdds > 150) { // Close lines or extreme odds
        highlightedProps.add(prop.id)
      }
    })
    
    return { highlightedProps }
  }, [categories])

  const handlePlayerPropClick = useCallback((
    e: React.MouseEvent,
    prop: PlayerProp,
    selection: 'over' | 'under'
  ) => {
    e.stopPropagation()
    const odds = selection === 'over' ? prop.overOdds : prop.underOdds
    addBet(game, 'player_prop', selection, odds, prop.line, prop)
    
    // Enhanced mobile feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
    
    toast.success(`${prop.playerName} ${prop.statType} ${selection} added!`, {
      duration: 1200,
      position: 'bottom-center',
      className: 'bet-toast'
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
        return <Football size={16} className="text-accent" weight="duotone" />
      case 'rushing':
        return <TrendUp size={16} className="text-accent" weight="duotone" />
      case 'receiving':
        return <Target size={16} className="text-accent" weight="duotone" />
      case 'scoring':
        return <Star size={16} className="text-accent" weight="duotone" />
      case 'kicking':
        return <Target size={16} className="text-accent" weight="duotone" />
      default:
        return <Users size={16} className="text-accent" weight="duotone" />
    }
  }, [])

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent" weight="duotone" />
          <h4 className="font-semibold text-sm">Player Props</h4>
        </div>
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-6 w-6 border-2 border-accent border-t-transparent"
          />
        </div>
      </motion.div>
    )
  }

  if (categories.length === 0) {
    return (
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent" weight="duotone" />
          <h4 className="font-semibold text-sm">Player Props</h4>
        </div>
        <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg">
          No player props available for this game
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent" weight="duotone" />
          <h4 className="font-semibold text-sm">Player Props</h4>
          {propsAnalysis.highlightedProps.size > 0 && (
            <Badge variant="secondary" className="text-xs bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
              {propsAnalysis.highlightedProps.size} Hot
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {categories.reduce((sum, cat) => sum + cat.props.length, 0)} props
        </div>
      </div>

      <div className={cn(
        'space-y-3 virtual-scrollbar scroll-smooth',
        compact ? 'max-h-80' : 'max-h-96',
        'overflow-y-auto pr-1'
      )}>
        {categories.map((category, index) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-muted/20 border-border/30 overflow-hidden">
              <CardContent className="p-3">
                {/* Category Header */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
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
                      {category.props.some(prop => propsAnalysis.highlightedProps.has(prop.id)) && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lightning size={12} className="text-yellow-400" weight="fill" />
                        </motion.div>
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: expandedCategories.has(category.key) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CaretDown size={16} />
                    </motion.div>
                  </Button>
                </motion.div>

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
                      <Separator className="my-3 opacity-30" />
                      <div className="space-y-3">
                        {category.props.map((prop, propIndex) => (
                          <motion.div
                            key={prop.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: propIndex * 0.05 }}
                            className={cn(
                              'bg-card/50 rounded-lg border border-border/30 backdrop-blur-sm',
                              'hover:border-accent/20 transition-all duration-200',
                              compact ? 'p-2' : 'p-3',
                              propsAnalysis.highlightedProps.has(prop.id) && 'bg-gradient-to-r from-yellow-400/5 to-transparent border-yellow-400/20'
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
                                  {propsAnalysis.highlightedProps.has(prop.id) && (
                                    <Badge className="text-xs px-2 py-0.5 bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                                      Hot
                                    </Badge>
                                  )}
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
                                isHighlighted={propsAnalysis.highlightedProps.has(prop.id)}
                              />
                              <PropButton
                                prop={prop}
                                selection="under"
                                onClick={(e) => handlePlayerPropClick(e, prop, 'under')}
                                compact={compact}
                                isHighlighted={propsAnalysis.highlightedProps.has(prop.id)}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}