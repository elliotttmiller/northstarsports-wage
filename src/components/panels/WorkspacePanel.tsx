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

  if (initialLoading) {
    return <SkeletonLoader type="games" count={4} />;
  }

  if (!navigation.selectedLeague || games.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Select a League</h3>
          <p className="text-muted-foreground">Choose a sport and league from the navigation panel to view games and place bets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background relative">
      <motion.div 
        className="p-4 border-b border-border bg-card flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Games</h2>
            <p className="text-sm text-muted-foreground">
              {pagination ? `${pagination.total} games available` : 'Loading games...'}
            </p>
          </div>
          {games.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleScrollToTop}
              className="opacity-70 hover:opacity-100"
            >
              <CaretUp size={16} />
            </Button>
          )}
        </div>
      </motion.div>

      <div 
        ref={setScrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.1, 0.5) }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
                      </div>
                    </div>

                    {/* Moneyline */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-card-foreground">Moneyline</h4>
                      <div className="space-y-1">
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
                      </div>
                    </div>

                    {/* Total */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-card-foreground">Total</h4>
                      <div className="space-y-1">
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
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Loading indicator for pagination */}
        {loading && (
          <div className="py-4">
            <SkeletonLoader type="games" count={2} />
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-4" />

        {/* End of results indicator */}
        {pagination && !pagination.hasNextPage && games.length > 0 && (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              You've reached the end of the games list
            </div>
          </div>
        )}
      </div>
    </div>
  );
};