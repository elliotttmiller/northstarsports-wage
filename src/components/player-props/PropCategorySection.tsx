import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PropCategory } from '@/types'
import { Game } from '@/types'
import { CaretDown, Target, TrendUp, Football, Users, Star } from '@phosphor-icons/react'
import { PlayerPropCard } from './PlayerPropCard'
import { cn } from '@/lib/utils'

interface PropCategorySectionProps {
  category: PropCategory
  game: Game
  isExpanded: boolean
  onToggle: () => void
  compact?: boolean
}

const getCategoryIcon = (categoryKey: string, className?: string) => {
  const iconClass = cn('text-accent', className)
  
  switch (categoryKey) {
    case 'passing':
      return <Football size={18} className={iconClass} />
    case 'rushing':
      return <TrendUp size={18} className={iconClass} />
    case 'receiving':
      return <Target size={18} className={iconClass} />
    case 'scoring':
      return <Star size={18} className={iconClass} />
    case 'kicking':
      return <Target size={18} className={iconClass} />
    case 'popular':
      return <Star size={18} className={iconClass} />
    default:
      return <Users size={18} className={iconClass} />
  }
}

const getCategoryGradient = (categoryKey: string) => {
  switch (categoryKey) {
    case 'popular':
      return 'from-amber-500/10 to-orange-500/10 border-amber-500/20'
    case 'passing':
      return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
    case 'rushing':
      return 'from-[color:var(--color-win)]/10 to-[color:var(--color-win)]/20 border-[color:var(--color-win)]/20'
    case 'receiving':
      return 'from-purple-500/10 to-indigo-500/10 border-purple-500/20'
    case 'scoring':
      return 'from-red-500/10 to-pink-500/10 border-red-500/20'
    case 'kicking':
      return 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20'
    default:
      return 'from-slate-500/10 to-gray-500/10 border-slate-500/20'
  }
}

export function PropCategorySection({ 
  category, 
  game, 
  isExpanded, 
  onToggle, 
  compact = false 
}: PropCategorySectionProps) {
  
  return (
    <Card className={cn(
      'bg-gradient-to-r transition-all duration-300',
      getCategoryGradient(category.key),
      'hover:shadow-lg hover:transform hover:translate-y-[-1px]'
    )}>
      <CardContent className="p-0">
        {/* Category Header */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-between h-auto p-4 hover:bg-white/5 transition-all duration-200',
            'group/header rounded-lg',
            compact && 'p-3'
          )}
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {getCategoryIcon(category.key)}
              {/* Subtle glow effect */}
              <div className={cn(
                'absolute inset-0 blur-sm opacity-0 group-hover/header:opacity-50 transition-opacity duration-300',
                getCategoryIcon(category.key)?.props.className
              )} />
            </div>
            
            <div className="flex flex-col items-start">
              <span className={cn(
                'font-bold tracking-wide text-foreground',
                compact ? 'text-sm' : 'text-base'
              )}>
                {category.name}
              </span>
              {category.key === 'popular' && (
                <span className="text-xs text-amber-400 font-medium">
                  Most Selected
                </span>
              )}
            </div>
            
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs bg-card/60 text-foreground border-border/40 font-medium',
                'group-hover/header:bg-card/80 transition-colors duration-200'
              )}
            >
              {category.props.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Expansion indicator */}
            <div className={cn(
              'w-2 h-2 rounded-full bg-accent transition-all duration-200',
              isExpanded ? 'opacity-100 scale-100' : 'opacity-50 scale-75'
            )} />
            
            <CaretDown 
              size={18} 
              className={cn(
                'transform transition-transform duration-300 text-muted-foreground',
                'group-hover/header:text-foreground',
                isExpanded && 'rotate-180'
              )} 
            />
          </div>
        </Button>

        {/* Expanded Content */}
        <div className={cn(
          'overflow-hidden transition-all duration-500 ease-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="px-4 pb-4 space-y-3">
            {/* Separator line */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            
            {/* Props Grid */}
            <div className={cn(
              'grid gap-3',
              compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'
            )}>
              {category.props.map((prop, index) => (
                <div
                  key={prop.id}
                  className="animate-in slide-in-from-left duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PlayerPropCard
                    prop={prop}
                    game={game}
                    compact={compact}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
            
            {/* Category Stats */}
            {isExpanded && (
              <div className="mt-4 pt-3 border-t border-border/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {category.props.length} player prop{category.props.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    {category.key === 'popular' ? '⭐ Most popular' : `📊 ${category.name}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}