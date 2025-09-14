import React, { ReactNode, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLayoutEngine } from '@/hooks/useLayoutEngine'
import { cn } from '@/lib/utils'

interface FluidLayoutProps {
  children: ReactNode
  itemIds: string[]
  className?: string
  enableVirtualization?: boolean
  compactMode?: boolean
  onCardToggle?: (cardId: string) => void
}

interface FluidCardProps {
  cardId: string
  children: ReactNode
  className?: string
  isExpandable?: boolean
  onToggle?: () => void
}

// Main fluid layout container
export const FluidLayout = forwardRef<HTMLDivElement, FluidLayoutProps>(
  ({ children, itemIds, className, enableVirtualization = true, compactMode = false, onCardToggle }, ref) => {
    const {
      containerRef,
      containerHeight,
      cardStates,
      visibleCardIds,
      viewport,
      layoutConfig,
      toggleCard,
      getCardStyle,
      isCalculating
    } = useLayoutEngine(itemIds, {
      virtualization: { enabled: enableVirtualization, overscan: 3, threshold: 20 }
    })

    const handleCardToggle = (cardId: string) => {
      toggleCard(cardId)
      onCardToggle?.(cardId)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full overflow-auto scrollbar-thin',
          'scroll-smooth overscroll-contain',
          className
        )}
      >
        <div
          ref={containerRef}
          className="relative w-full transition-all duration-300"
          style={{ 
            height: containerHeight,
            minHeight: '100%'
          }}
        >
          {/* Loading overlay during calculations */}
          <AnimatePresence>
            {isCalculating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Render visible cards */}
          <AnimatePresence mode="popLayout">
            {React.Children.map(children, (child, index) => {
              const cardId = itemIds[index]
              const cardState = cardStates.get(cardId)
              
              // Skip non-visible cards when virtualization is enabled
              if (enableVirtualization && !visibleCardIds.includes(cardId)) {
                return null
              }

              if (!cardState) return null

              const style = getCardStyle(cardId)

              return (
                <motion.div
                  key={cardId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: cardState.opacity,
                    scale: cardState.scale,
                    x: cardState.x,
                    y: cardState.y
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    layout: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
                  }}
                  style={{
                    ...style,
                    position: 'absolute'
                  }}
                  className={cn(
                    'fluid-card',
                    cardState.isExpanded && 'fluid-card-expanded',
                    viewport.isMobile && 'fluid-card-mobile'
                  )}
                  onClick={() => handleCardToggle(cardId)}
                >
                  {child}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Scroll indicators for mobile */}
          {viewport.isMobile && containerHeight > viewport.height && (
            <div className="fixed top-4 right-4 z-30 pointer-events-none">
              <div className="bg-card/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-muted-foreground">
                {Math.round((viewport.scrollTop / (containerHeight - viewport.height)) * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

FluidLayout.displayName = 'FluidLayout'

// Individual card wrapper component with autonomous behavior
export const FluidCard = forwardRef<HTMLDivElement, FluidCardProps>(
  ({ cardId, children, className, isExpandable = false, onToggle }, ref) => {
    return (
      <motion.div
        ref={ref}
        layout
        className={cn(
          'fluid-card-inner relative w-full h-full',
          'bg-card border border-border rounded-lg overflow-hidden',
          'transition-all duration-300 ease-out',
          'hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5',
          'focus-within:ring-2 focus-within:ring-accent/50 focus-within:ring-offset-2',
          isExpandable && 'cursor-pointer',
          className
        )}
        whileHover={isExpandable ? { 
          scale: 1.005, 
          boxShadow: '0 8px 24px oklch(from var(--accent) l c h / 0.12)'
        } : undefined}
        whileTap={isExpandable ? { scale: 0.998 } : undefined}
        onClick={onToggle}
        role={isExpandable ? 'button' : undefined}
        tabIndex={isExpandable ? 0 : undefined}
        onKeyDown={isExpandable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle?.()
          }
        } : undefined}
      >
        {children}
        
        {/* Subtle expand indicator for expandable cards */}
        {isExpandable && (
          <div className="absolute bottom-2 right-2 opacity-30 hover:opacity-60 transition-opacity pointer-events-none">
            <div className="w-4 h-4 bg-accent/20 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-accent/60 rounded-full" />
            </div>
          </div>
        )}
      </motion.div>
    )
  }
)

FluidCard.displayName = 'FluidCard'

// Specialized game card layout component
export interface GameCardLayoutProps {
  games: any[]
  onGameToggle?: (gameId: string) => void
  onBetClick?: (gameId: string, betType: string, selection: string) => void
  className?: string
  compactMode?: boolean
}

export const GameCardLayout: React.FC<GameCardLayoutProps> = ({
  games,
  onGameToggle,
  onBetClick,
  className,
  compactMode = false
}) => {
  const gameIds = games.map(game => game.id)

  return (
    <FluidLayout
      itemIds={gameIds}
      enableVirtualization={games.length > 20}
      compactMode={compactMode}
      onCardToggle={onGameToggle}
      className={cn(
        'game-card-layout',
        compactMode && 'game-card-layout-compact',
        className
      )}
    >
      {games.map((game) => (
        <FluidCard
          key={game.id}
          cardId={game.id}
          isExpandable={true}
          className={cn(
            'game-card-wrapper',
            compactMode && 'game-card-wrapper-compact'
          )}
        >
          {/* Game card content will be passed here */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">{game.awayTeam?.name} @ {game.homeTeam?.name}</div>
              <div className="text-xs text-muted-foreground">{game.startTime}</div>
            </div>
            
            {/* Betting options grid */}
            <div className="grid grid-cols-3 gap-2">
              <button
                className="p-2 text-xs bg-muted/50 hover:bg-accent/10 rounded border transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onBetClick?.(game.id, 'spread', 'away')
                }}
              >
                Spread
              </button>
              <button
                className="p-2 text-xs bg-muted/50 hover:bg-accent/10 rounded border transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onBetClick?.(game.id, 'total', 'over')
                }}
              >
                Total
              </button>
              <button
                className="p-2 text-xs bg-muted/50 hover:bg-accent/10 rounded border transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onBetClick?.(game.id, 'moneyline', 'away')
                }}
              >
                Moneyline
              </button>
            </div>
          </div>
        </FluidCard>
      ))}
    </FluidLayout>
  )
}

// Performance optimized card list for large datasets
export interface VirtualGameListProps {
  games: any[]
  itemHeight: number
  containerHeight: number
  onGameSelect?: (gameId: string) => void
  renderCard: (game: any, index: number) => ReactNode
  className?: string
}

export const VirtualGameList: React.FC<VirtualGameListProps> = ({
  games,
  itemHeight,
  containerHeight,
  onGameSelect,
  renderCard,
  className
}) => {
  const gameIds = games.map(game => game.id)
  
  const {
    containerRef,
    visibleCardIds,
    getCardStyle,
    viewport
  } = useLayoutEngine(gameIds, {
    virtualization: { enabled: true, overscan: 5, threshold: 50 },
    desktop: { 
      columns: 1, 
      gap: 8, 
      minCardHeight: itemHeight, 
      maxCardHeight: itemHeight,
      cardAspectRatio: 16 / 3
    },
    mobile: { 
      columns: 1, 
      gap: 8, 
      minCardHeight: itemHeight, 
      maxCardHeight: itemHeight,
      cardAspectRatio: 16 / 4
    }
  })

  return (
    <div
      ref={containerRef}
      className={cn(
        'virtual-game-list relative overflow-auto scrollbar-thin',
        className
      )}
      style={{ height: containerHeight }}
    >
      <div style={{ height: games.length * itemHeight, position: 'relative' }}>
        {visibleCardIds.map((gameId) => {
          const gameIndex = games.findIndex(game => game.id === gameId)
          if (gameIndex === -1) return null
          
          const game = games[gameIndex]
          const style = getCardStyle(gameId)
          
          return (
            <div
              key={gameId}
              style={style}
              className="absolute w-full"
              onClick={() => onGameSelect?.(gameId)}
            >
              {renderCard(game, gameIndex)}
            </div>
          )
        })}
      </div>
    </div>
  )
}