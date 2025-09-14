import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/context/NavigationContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { Game } from '@/types';
import { getGamesPaginated, getPlayerProps, PaginatedResponse } from '@/services/mockApi';
import { PlayerProp } from '@/types'
import { formatOdds, formatTotalLine, formatTime } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { toast } from 'sonner';
import { 
  Target, 
  TrendUp, 
  Users, 
  Trophy, 
  Football, 
  Lightning,
  ArrowRight,
  Plus,
  Minus
} from '@phosphor-icons/react';

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

export const BuilderPage = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const { betSlip, addBet, removeBet, updateStake, setBetType } = useBetSlip();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [playerProps, setPlayerProps] = useState<PlayerProp[]>([]);
  const [loading, setLoading] = useState(false);
  const [propsLoading, setPropsLoading] = useState(false);
  
  const loadGames = async () => {
    if (!navigation.selectedLeague) return;
    setLoading(true);
    try {
      const response = await getGamesPaginated(navigation.selectedLeague, 1, 10);
      setGames(response.data);
    } catch (error) {
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerProps = async (gameId: string) => {
    setPropsLoading(true);
    try {
      const props = await getPlayerProps(gameId);
      setPlayerProps(props);
    } catch (error) {
      toast.error('Failed to load player props');
    } finally {
      setPropsLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [navigation.selectedLeague]);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    loadPlayerProps(game.id);
    setActiveTab('props');
  };

  const handleBetClick = (
    game: Game,
    betType: 'spread' | 'moneyline' | 'total',
    selection: 'home' | 'away' | 'over' | 'under',
    odds: number,
    line?: number
  ) => {
    addBet(game, betType, selection, odds, line);
    toast.success('Bet added to builder!', { duration: 1500 });
  };

  const handlePlayerPropClick = (prop: PlayerProp, selection: 'over' | 'under') => {
    if (!selectedGame) return;
    const odds = selection === 'over' ? prop.overOdds : prop.underOdds;
    addBet(selectedGame, 'player_prop', selection, odds, prop.line, prop);
    toast.success(`${prop.playerName} prop added to builder!`, { duration: 1500 });
  };

  const handleStakeChange = (betId: string, value: string) => {
    const stake = parseFloat(value) || 0;
    if (stake >= 0) {
      updateStake(betId, stake);
    }
  };

  const getStatIcon = (category: string) => {
    switch (category) {
      case 'passing': return <Target className="w-4 h-4" />;
      case 'rushing': return <TrendUp className="w-4 h-4" />;
      case 'receiving': return <Users className="w-4 h-4" />;
      case 'scoring': return <Trophy className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const renderBetSlipPreview = () => (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bet Builder</CardTitle>
          <Badge variant="outline" className="border-accent/30">
            {betSlip.bets.length} selection{betSlip.bets.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {betSlip.bets.length === 0 ? (
          <div className="text-center py-6">
            <Football className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select bets to build your slip
            </p>
          </div>
        ) : (
          <>
            <Tabs value={betSlip.betType} onValueChange={(value) => setBetType(value as 'single' | 'parlay')}>
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="single" className="text-xs">Single</TabsTrigger>
                <TabsTrigger value="parlay" className="text-xs">Parlay</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {betSlip.bets.map((bet) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-muted/50 rounded-lg p-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {bet.playerProp 
                            ? `${bet.playerProp.playerName} ${bet.playerProp.statType}`
                            : `${bet.game.awayTeam.shortName} @ ${bet.game.homeTeam.shortName}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatOdds(bet.odds)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBet(bet.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Stake:</span>
                <span className="font-medium">${betSlip.totalStake.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Potential Payout:</span>
                <span className="font-medium text-accent">${betSlip.totalPayout.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderGamesList = () => (
    <div className="space-y-4">
      {loading ? (
        <SkeletonLoader type="games" count={4} />
      ) : games.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select a league to view games</p>
          {isMobile && (
            <Button 
              onClick={() => setMobilePanel('navigation')}
              className="mt-4"
              variant="outline"
            >
              Browse Sports
            </Button>
          )}
        </div>
      ) : (
        games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-all duration-200 border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-sm">
                      {game.awayTeam.shortName} @ {game.homeTeam.shortName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(game.startTime)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {game.status === 'live' && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        LIVE
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGameSelect(game)}
                      className="text-xs hover:text-accent"
                    >
                      Props
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
                
                {/* Quick bet buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleBetClick(
                      game, 'spread', 'away', 
                      game.odds.spread.away.odds, 
                      game.odds.spread.away.line
                    )}
                  >
                    {game.awayTeam.shortName} {game.odds.spread.away.line}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleBetClick(
                      game, 'total', 'over',
                      game.odds.total.over?.odds || -110,
                      game.odds.total.over?.line
                    )}
                  >
                    O{formatTotalLine(game.odds.total.over?.line || 45.5)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleBetClick(
                      game, 'moneyline', 'away',
                      game.odds.moneyline.away.odds
                    )}
                  >
                    {formatOdds(game.odds.moneyline.away.odds)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderPlayerProps = () => {
    if (!selectedGame) {
      return (
        <div className="text-center py-8">
          <Football className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Select a game to view player props</p>
        </div>
      );
    }

    if (propsLoading) {
      return <SkeletonLoader type="games" count={3} />;
    }

    const groupedProps = playerProps.reduce((acc, prop) => {
      if (!acc[prop.category]) {
        acc[prop.category] = [];
      }
      acc[prop.category].push(prop);
      return acc;
    }, {} as Record<string, PlayerProp[]>);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {selectedGame.awayTeam.shortName} @ {selectedGame.homeTeam.shortName}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGame(null)}
            className="text-xs"
          >
            Back to Games
          </Button>
        </div>

        {Object.entries(groupedProps).map(([category, props]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base capitalize">
                {getStatIcon(category)}
                {category} Props
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {props.map((prop) => (
                <div key={prop.id} className="border border-border/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{prop.playerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {prop.position} • {prop.statType}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {prop.line}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handlePlayerPropClick(prop, 'over')}
                    >
                      <div className="text-center w-full">
                        <div className="text-xs text-muted-foreground">Over</div>
                        <div className="font-medium">{formatOdds(prop.overOdds)}</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handlePlayerPropClick(prop, 'under')}
                    >
                      <div className="text-center w-full">
                        <div className="text-xs text-muted-foreground">Under</div>
                        <div className="font-medium">{formatOdds(prop.underOdds)}</div>
                      </div>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Bet Builder</h1>
            <p className="text-sm text-muted-foreground">
              Create singles, parlays, and player props
            </p>
          </div>
          <Lightning className="w-6 h-6 text-accent" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="props" disabled={!selectedGame}>
                  Player Props
                  {selectedGame && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {selectedGame.awayTeam.shortName} @ {selectedGame.homeTeam.shortName}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 seamless-scroll p-4">
              <TabsContent value="games" className="mt-0">
                {renderGamesList()}
              </TabsContent>
              <TabsContent value="props" className="mt-0">
                {renderPlayerProps()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Bet Slip Preview - Desktop Only */}
        {!isMobile && (
          <div className="w-80 border-l border-border flex-shrink-0">
            <div className="p-4 h-full overflow-auto seamless-scroll">
              {renderBetSlipPreview()}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bet Slip Preview */}
      {isMobile && betSlip.bets.length > 0 && (
        <div className="flex-shrink-0 border-t border-border p-4">
          {renderBetSlipPreview()}
        </div>
      )}
    </div>
  );
};