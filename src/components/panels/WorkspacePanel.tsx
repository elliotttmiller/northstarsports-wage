import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { Game } from '@/types';
import { getGamesPaginated, formatOdds, PaginatedResponse } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useInfiniteScroll, useSmoothScroll } from '@/hooks/useInfiniteScroll';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CaretUp } from '@phosphor-icons/react';
import { InfiniteScrollContainer, SmoothScrollContainer } from '@/components/VirtualScrolling';

export const WorkspacePanel = () => {
  const { navigation } = useNavigation();
  const { addBet } = useBetSlip();
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
      const response = await getGamesPaginated(navigation.selectedLeague, page, 5);
      
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleBetClick = (
    game: Game, 
    betType: 'spread' | 'moneyline' | 'total',
    selection: 'home' | 'away' | 'over' | 'under',
    odds: number,
    line?: number
  ) => {
    addBet(game, betType, selection, odds, line);
    toast.success('Bet added to slip!', {
      duration: 2000,
    });
  };

  const handleScrollToTop = () => {
    if (scrollContainerRef) {
      scrollToTop(scrollContainerRef);
    }
  };

  const renderGameCard = (game: Game, index: number) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.02, 0.2),
        ease: [0.4, 0.0, 0.2, 1]
      }}
      whileHover={{ y: -2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg hover:border-accent/20 transition-all duration-300">
        <CardContent className="p-0">
          {/* Game Header */}
          <div className="p-4 bg-card border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-card-foreground">
                    {game.awayTeam.shortName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {game.awayTeam.record}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">@</div>
                <div className="text-center">
                  <div className="text-sm font-medium text-card-foreground">
                    {game.homeTeam.shortName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {game.homeTeam.record}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-card-foreground">
                  {formatDate(game.startTime)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  game.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                  game.status === 'finished' ? 'bg-gray-500 text-white' :
                  'bg-accent text-accent-foreground'
                }`}>
                  {game.status === 'live' ? 'LIVE' :
                   game.status === 'finished' ? 'FINAL' : 'UPCOMING'}
                </div>
              </div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Spread */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-card-foreground">Spread</h4>
                <div className="space-y-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handleBetClick(
                        game, 'spread', 'away', 
                        game.odds.spread.away.odds, 
                        game.odds.spread.away.line
                      )}
                    >
                      <span>{game.awayTeam.shortName} {game.odds.spread.away.line}</span>
                      <span>{formatOdds(game.odds.spread.away.odds)}</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handleBetClick(
                        game, 'spread', 'home', 
                        game.odds.spread.home.odds, 
                        game.odds.spread.home.line
                      )}
                    >
                      <span>{game.homeTeam.shortName} {game.odds.spread.home.line}</span>
                      <span>{formatOdds(game.odds.spread.home.odds)}</span>
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Moneyline */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-card-foreground">Moneyline</h4>
                <div className="space-y-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handleBetClick(
                        game, 'moneyline', 'away', 
                        game.odds.moneyline.away.odds
                      )}
                    >
                      <span>{game.awayTeam.shortName}</span>
                      <span>{formatOdds(game.odds.moneyline.away.odds)}</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handleBetClick(
                        game, 'moneyline', 'home', 
                        game.odds.moneyline.home.odds
                      )}
                    >
                      <span>{game.homeTeam.shortName}</span>
                      <span>{formatOdds(game.odds.moneyline.home.odds)}</span>
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Total */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-card-foreground">Total</h4>
                <div className="space-y-1">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handleBetClick(
                        game, 'total', 'over', 
                        game.odds.total.over?.odds || -110, 
                        game.odds.total.over?.line
                      )}
                    >
                      <span>Over {game.odds.total.over?.line}</span>
                      <span>{formatOdds(game.odds.total.over?.odds || -110)}</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handleBetClick(
                        game, 'total', 'under', 
                        game.odds.total.under?.odds || -110, 
                        game.odds.total.under?.line
                      )}
                    >
                      <span>Under {game.odds.total.under?.line}</span>
                      <span>{formatOdds(game.odds.total.under?.odds || -110)}</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (initialLoading) {
    return <SkeletonLoader type="games" count={4} />;
  }

  if (!navigation.selectedLeague || games.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-foreground mb-2">Select a League</h3>
          <p className="text-muted-foreground">Choose a sport and league from the navigation panel to view games and place bets.</p>
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
        className="flex-1 p-4"
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