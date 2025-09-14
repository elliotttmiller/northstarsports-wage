import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { Game } from '@/types';
import { getGamesPaginated, PaginatedResponse } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/GameCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useInfiniteScroll, useSmoothScroll } from '@/hooks/useInfiniteScroll';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CaretUp, SortAscending, Heart } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useKV } from '@github/spark/hooks';

// Interface for layout preferences
interface LayoutPreferences {
  viewMode: 'fluid' | 'compact' | 'list'
  sortBy: 'time' | 'popular' | 'odds'
  filterFavorites: boolean
  showExpanded: boolean
}

import { useIsMobile } from '@/hooks/use-mobile';

export const WorkspacePanel = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // State management
  const [games, setGames] = useState<Game[]>([]);
  const [expandedCards, setExpandedCards] = useKV<string[]>('expanded-game-cards', []);
  const [favoriteGames, setFavoriteGames] = useKV<string[]>('favorite-games', []);
  const [layoutPrefs, setLayoutPrefs] = useKV<LayoutPreferences>('workspace-layout-prefs', {
    viewMode: 'fluid',
    sortBy: 'time',
    filterFavorites: false,
    showExpanded: false
  });
  
  const [pagination, setPagination] = useState<PaginatedResponse<Game>['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);
  const { scrollToTop } = useSmoothScroll();

  const loadMoreRef = useInfiniteScroll({
    hasNextPage: pagination?.hasNextPage ?? false,
    isFetchingNextPage: loading,
    fetchNextPage: () => loadNextPage()
  });

  const loadGames = useCallback(async (page = 1, reset = false) => {
    if (!navigation.selectedLeague) return;

    if (reset) {
      setInitialLoading(true);
      setGames([]);
    } else {
      setLoading(true);
    }

    try {
      const response = await getGamesPaginated(navigation.selectedLeague, page, 12);
      
      if (reset) {
        setGames(response.data);
        setCurrentPage(1);
      } else {
        setGames(prevGames => [...prevGames, ...response.data]);
        setCurrentPage(page);
      }
      
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [navigation.selectedLeague]);

  const loadNextPage = useCallback(() => {
    if (pagination?.hasNextPage && !loading) {
      loadGames(currentPage + 1, false);
    }
  }, [pagination?.hasNextPage, loading, currentPage, loadGames]);

  useEffect(() => {
    if (navigation.selectedLeague) {
      loadGames(1, true);
    } else {
      setGames([]);
      setPagination(null);
    }
  }, [navigation.selectedLeague, loadGames]);

  // Game interaction handlers
  const handleGameToggle = useCallback((gameId: string) => {
    setExpandedCards((current) => {
      if (current?.includes(gameId)) {
        return current.filter(id => id !== gameId)
      }
      return [...(current || []), gameId]
    })
  }, [setExpandedCards])

  const handleFavoriteToggle = useCallback((gameId: string) => {
    setFavoriteGames((current) => {
      if (current?.includes(gameId)) {
        return current.filter(id => id !== gameId)
      }
      return [...(current || []), gameId]
    })
  }, [setFavoriteGames])

  // Sorting and filtering
  const processedGames = React.useMemo(() => {
    let processed = [...games]
    
    // Filter favorites if enabled
    if (layoutPrefs?.filterFavorites) {
      processed = processed.filter(game => favoriteGames?.includes(game.id))
    }
    
    // Sort games
    switch (layoutPrefs?.sortBy) {
      case 'time':
        processed.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        break
      case 'popular':
        // Mock popularity sorting - in real app this would be based on betting volume
        processed.sort((a, b) => (favoriteGames?.includes(b.id) ? 1 : 0) - (favoriteGames?.includes(a.id) ? 1 : 0))
        break
      case 'odds':
        // Sort by moneyline favorite
        processed.sort((a, b) => {
          const aFav = Math.min(a.odds.moneyline.home.odds, a.odds.moneyline.away.odds)
          const bFav = Math.min(b.odds.moneyline.home.odds, b.odds.moneyline.away.odds)
          return aFav - bFav
        })
        break
    }
    
    return processed
  }, [games, layoutPrefs, favoriteGames])

  const handleScrollToTop = () => {
    if (scrollContainerRef) {
      scrollToTop(scrollContainerRef);
    }
  };

  const gameIds = processedGames.map(game => game.id)

  if (initialLoading) {
    return <SkeletonLoader type="games" count={4} />;
  }

  if (!navigation.selectedLeague || games.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <motion.div 
          className="text-center px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-foreground mb-2">Select a League</h3>
          <p className="text-muted-foreground mb-4">Choose a sport and league to view games and place bets.</p>
          
          {/* Mobile-only: Show button to open sports navigation */}
          {isMobile && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={() => setMobilePanel('navigation')}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Browse Sports & Leagues
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background relative">
      {/* Header with controls */}
      <div className={cn(
        'flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm',
        isMobile ? 'p-3' : 'p-4'
      )}>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">
            {navigation.selectedLeague?.toUpperCase()} Games
          </h2>
          <div className="text-sm text-muted-foreground">
            ({processedGames.length})
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Favorites filter */}
          <Button
            variant={layoutPrefs?.filterFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setLayoutPrefs((current) => {
              const defaultPrefs: LayoutPreferences = {
                viewMode: 'fluid',
                sortBy: 'time',
                filterFavorites: false,
                showExpanded: false
              }
              return {
                ...(current || defaultPrefs),
                filterFavorites: !(current?.filterFavorites)
              }
            })}
            className="h-8"
          >
            <Heart size={14} weight={layoutPrefs?.filterFavorites ? "fill" : "regular"} />
            {!isMobile && <span className="ml-1">Favorites</span>}
          </Button>
          
          {/* Sort options */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const sortOptions = ['time', 'popular', 'odds'] as const
              const currentIndex = sortOptions.indexOf(layoutPrefs?.sortBy || 'time')
              const nextSort = sortOptions[(currentIndex + 1) % sortOptions.length]
              setLayoutPrefs((current) => {
                const defaultPrefs: LayoutPreferences = {
                  viewMode: 'fluid',
                  sortBy: 'time',
                  filterFavorites: false,
                  showExpanded: false
                }
                return {
                  ...(current || defaultPrefs),
                  sortBy: nextSort
                }
              })
            }}
            className="h-8"
          >
            <SortAscending size={14} />
            {!isMobile && (
              <span className="ml-1 capitalize">
                {layoutPrefs?.sortBy || 'time'}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Games Container */}
      <div className="flex-1 overflow-hidden">
        <div className={cn(
          'h-full seamless-scroll overflow-y-auto',
          isMobile ? 'p-3' : 'p-4'
        )}>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {processedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  variant={isMobile ? 'mobile' : 'desktop'}
                  showFavorites={true}
                  onFavoriteToggle={handleFavoriteToggle}
                  className={cn(
                    'game-card-item',
                    favoriteGames?.includes(game.id) && 'ring-1 ring-yellow-400/20'
                  )}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Load more trigger */}
          {pagination?.hasNextPage && !loading && (
            <div ref={loadMoreRef} className="h-20 w-full" />
          )}
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading more games...</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating Action Button - Scroll to top */}
      <AnimatePresence>
        {processedGames.length > 5 && (
          <motion.div
            className="fixed bottom-20 right-4 z-30 lg:bottom-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={handleScrollToTop}
              className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm"
            >
              <CaretUp size={16} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End of results indicator */}
      {pagination && !pagination.hasNextPage && processedGames.length > 0 && (
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm text-muted-foreground">
            You've reached the end of the games list
          </div>
        </motion.div>
      )}
    </div>
  );
};