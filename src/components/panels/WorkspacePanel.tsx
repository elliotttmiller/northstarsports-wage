import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { Game } from '@/types';
import { getGamesPaginated, PaginatedResponse } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/GameCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useInfiniteScroll, useSmoothScroll } from '@/hooks/useInfiniteScroll';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CaretUp } from '@phosphor-icons/react';
import { InfiniteScrollContainer } from '@/components/VirtualScrolling';

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export const WorkspacePanel = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [games, setGames] = useState<Game[]>([]);
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
      const response = await getGamesPaginated(navigation.selectedLeague, page, 8);
      
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

  const handleScrollToTop = () => {
    if (scrollContainerRef) {
      scrollToTop(scrollContainerRef);
    }
  };

  const renderGameCard = (game: Game, index: number) => (
    <motion.div
      key={game.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.4, 0.0, 0.2, 1]
      }}
      className="mb-4"
    >
      <GameCard game={game} compact={isMobile} />
    </motion.div>
  );

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
      <InfiniteScrollContainer
        items={games}
        renderItem={renderGameCard}
        loadMore={loadNextPage}
        hasMore={pagination?.hasNextPage ?? false}
        loading={loading}
        className="flex-1 p-4 seamless-scroll"
        threshold={200}
      />

      {/* Scroll to top button */}
      {games.length > 0 && (
        <motion.div
          className="absolute top-4 right-4 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleScrollToTop}
              className="opacity-70 hover:opacity-100 shadow-lg"
            >
              <CaretUp size={16} />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* End of results indicator */}
      {pagination && !pagination.hasNextPage && games.length > 0 && (
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