import { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PropCategory } from '@/types'
import { Game } from '@/types'
import { Target, MagnifyingGlass, SortAscending, Funnel, Sparkle } from '@phosphor-icons/react'
import { PropCategorySection } from './PropCategorySection'
import { usePlayerProps } from '@/hooks/usePlayerProps'
import { cn } from '@/lib/utils'

interface PlayerPropsContainerProps {
  categories: PropCategory[]
  game: Game
  isLoading: boolean
  compact?: boolean
  className?: string
}

type SortOption = 'default' | 'alphabetical' | 'mostProps' | 'popular'
type FilterOption = 'all' | 'passing' | 'rushing' | 'receiving' | 'scoring'

export function PlayerPropsContainer({ 
  categories, 
  game, 
  isLoading, 
  compact = false,
  className 
}: PlayerPropsContainerProps) {
  const { stats, sortCategories, filterProps } = usePlayerProps(categories)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['popular']))
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Apply filters and sorting
  let processedCategories = categories
  
  // Apply search filter
  if (searchTerm) {
    processedCategories = filterProps(searchTerm)
  }
  
  // Apply category filter
  if (filterBy !== 'all') {
    processedCategories = processedCategories.filter(category => category.key === filterBy)
  }
  
  // Apply sorting - create a local sort function
  const applySorting = (cats: PropCategory[], sortOption: SortOption): PropCategory[] => {
    switch (sortOption) {
      case 'alphabetical':
        return [...cats].sort((a, b) => a.name.localeCompare(b.name))
      case 'mostProps':
        return [...cats].sort((a, b) => b.props.length - a.props.length)
      case 'popular':
        return [...cats].sort((a, b) => {
          if (a.key === 'popular') return -1
          if (b.key === 'popular') return 1
          return 0
        })
      default:
        return cats
    }
  }
  
  processedCategories = applySorting(processedCategories, sortBy)
  
  // Calculate total props from processed categories
  const totalProps = processedCategories.reduce((sum, cat) => sum + cat.props.length, 0)

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

  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(processedCategories.map(cat => cat.key)))
  }, [processedCategories])

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set())
  }, [])

  if (isLoading) {
    return (
      <Card className={cn('bg-card/50 border-border/30', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target size={20} className="text-accent" />
            <h4 className="font-bold text-lg">Player Props</h4>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="rounded-full h-8 w-8 border-3 border-accent border-t-transparent animate-spin" />
                <div className="absolute inset-0 rounded-full h-8 w-8 border-3 border-accent/30" />
              </div>
              <p className="text-sm text-muted-foreground">Loading player props...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (processedCategories.length === 0) {
    const isEmpty = categories.length === 0
    
    return (
      <Card className={cn('bg-card/50 border-border/30', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target size={20} className="text-accent" />
            <h4 className="font-bold text-lg">Player Props</h4>
          </div>
          
          <div className="text-center py-12">
            <div className="mb-4">
              <Target size={48} className="mx-auto text-muted-foreground/50" />
            </div>
            <h5 className="font-semibold text-foreground mb-2">
              {isEmpty ? 'No Player Props Available' : 'No Results Found'}
            </h5>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isEmpty 
                ? 'Player props for this game are not currently available. Check back later for updates.'
                : searchTerm 
                  ? `No props found matching "${searchTerm}". Try adjusting your search or filters.`
                  : 'No props match your current filters. Try adjusting your filter settings.'
              }
            </p>
            
            {!isEmpty && (searchTerm || filterBy !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('')
                  setFilterBy('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-card/50 border-border/30 overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-card/50 to-card/80 border-b border-border/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Target size={20} className="text-accent" />
                <Sparkle size={12} className="absolute -top-1 -right-1 text-accent animate-pulse" />
              </div>
              <h4 className="font-bold text-lg">Player Props</h4>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-accent/10 text-accent border-accent/20 font-medium"
              >
                {totalProps} props
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 px-2"
              >
                <Funnel size={16} />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={cn(
            'space-y-3 overflow-hidden transition-all duration-300',
            showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          )}>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search players or stats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-background/50 border-border/50 focus:border-accent/50"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={expandAll}
                  className="h-8 px-3 text-xs"
                >
                  Expand All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={collapseAll}
                  className="h-8 px-3 text-xs"
                >
                  Collapse All
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <SortAscending size={14} className="text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs bg-background/50 border border-border/50 rounded px-2 py-1 focus:border-accent/50"
                >
                  <option value="default">Default</option>
                  <option value="popular">Popular First</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="mostProps">Most Props</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className={cn(
          'p-6 space-y-4 max-h-[70vh] overflow-y-auto seamless-scroll',
          compact && 'p-4 max-h-80'
        )}>
          {processedCategories.map((category, index) => (
            <div
              key={category.key}
              className="animate-in slide-in-from-bottom duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PropCategorySection
                category={category}
                game={game}
                isExpanded={expandedCategories.has(category.key)}
                onToggle={() => toggleCategory(category.key)}
                compact={compact}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}