import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBetSlip } from '@/context/BetSlipContext';
import { Game } from '@/types';
import { getGameById, getPlayerProps, PlayerProp } from '@/services/mockApi';
import { formatOdds, formatTotalLine, formatDateDetailed } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ArrowLeft, Trophy, Users, Target, TrendUp } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { addBet } = useBetSlip();
  const [game, setGame] = useState<Game | null>(null);
  const [playerProps, setPlayerProps] = useState<PlayerProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('main');

  useEffect(() => {
    if (!gameId) return;

    const loadGameData = async () => {
      setLoading(true);
      try {
        const [gameData, propsData] = await Promise.all([
          getGameById(gameId),
          getPlayerProps(gameId)
        ]);
        setGame(gameData);
        setPlayerProps(propsData);
      } catch (error) {
        console.error('Failed to load game data:', error);
        toast.error('Failed to load game details');
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [gameId]);

  const handleBetClick = (
    betType: 'spread' | 'moneyline' | 'total',
    selection: 'home' | 'away' | 'over' | 'under',
    odds: number,
    line?: number
  ) => {
    if (!game) return;
    addBet(game, betType, selection, odds, line);
    toast.success('Bet added to slip!', {
      duration: 2000,
    });
  };

  const handlePlayerPropClick = (prop: PlayerProp, selection: 'over' | 'under') => {
    if (!game) return;
    // Add player prop bet using the new signature
    const odds = selection === 'over' ? prop.overOdds : prop.underOdds;
    addBet(game, 'player_prop', selection, odds, prop.line, prop);
    toast.success(`${prop.playerName} ${prop.statType} ${selection} ${prop.line} added to slip!`, {
      duration: 2000,
    });
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

  if (loading) {
    return <SkeletonLoader type="games" count={1} />;
  }

  if (!game) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <motion.div 
          className="text-center px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-foreground mb-2">Game Not Found</h3>
          <p className="text-muted-foreground mb-4">The requested game could not be found.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  const groupedProps = playerProps.reduce((acc, prop) => {
    if (!acc[prop.category]) {
      acc[prop.category] = [];
    }
    acc[prop.category].push(prop);
    return acc;
  }, {} as Record<string, PlayerProp[]>);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 bg-card border-b border-border"
      >
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Badge
              variant={game.status === 'live' ? 'destructive' : 'secondary'}
              className={game.status === 'live' ? 'animate-pulse' : ''}
            >
              {game.status === 'live' ? 'LIVE' : 
               game.status === 'finished' ? 'FINAL' : 'UPCOMING'}
            </Badge>
          </div>

          {/* Team Matchup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-center md:text-right">
              <div className="text-2xl font-bold text-foreground mb-1">
                {game.awayTeam.shortName}
              </div>
              <div className="text-sm text-muted-foreground">
                {game.awayTeam.record}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">vs</div>
              <div className="text-sm font-medium text-foreground">
                {formatDateDetailed(game.startTime)}
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-foreground mb-1">
                {game.homeTeam.shortName}
              </div>
              <div className="text-sm text-muted-foreground">
                {game.homeTeam.record}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="main">Main Lines</TabsTrigger>
              <TabsTrigger value="props">Player Props</TabsTrigger>
              <TabsTrigger value="alt" className="hidden lg:block">Alt Lines</TabsTrigger>
              <TabsTrigger value="special" className="hidden lg:block">Specials</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto seamless-scroll p-4">
            <TabsContent value="main" className="mt-0 space-y-6">
              {/* Main Betting Lines */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spread */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Point Spread</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleBetClick(
                            'spread', 'away',
                            game.odds.spread.away.odds,
                            game.odds.spread.away.line
                          )}
                        >
                          <span className="font-medium">{game.awayTeam.shortName}</span>
                          <div className="text-right">
                            <div className="font-medium">{game.odds.spread.away.line}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatOdds(game.odds.spread.away.odds)}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleBetClick(
                            'spread', 'home',
                            game.odds.spread.home.odds,
                            game.odds.spread.home.line
                          )}
                        >
                          <span className="font-medium">{game.homeTeam.shortName}</span>
                          <div className="text-right">
                            <div className="font-medium">{game.odds.spread.home.line}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatOdds(game.odds.spread.home.odds)}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Moneyline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Moneyline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleBetClick(
                            'moneyline', 'away',
                            game.odds.moneyline.away.odds
                          )}
                        >
                          <span className="font-medium">{game.awayTeam.shortName}</span>
                          <span className="font-medium">{formatOdds(game.odds.moneyline.away.odds)}</span>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleBetClick(
                            'moneyline', 'home',
                            game.odds.moneyline.home.odds
                          )}
                        >
                          <span className="font-medium">{game.homeTeam.shortName}</span>
                          <span className="font-medium">{formatOdds(game.odds.moneyline.home.odds)}</span>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Total */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Total Points</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleBetClick(
                            'total', 'over',
                            game.odds.total.over?.odds || -110,
                            game.odds.total.over?.line
                          )}
                        >
                          <span className="font-medium">Over</span>
                          <div className="text-right">
                            <div className="font-medium">{formatTotalLine(game.odds.total.over?.line || 45.5)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatOdds(game.odds.total.over?.odds || -110)}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleBetClick(
                            'total', 'under',
                            game.odds.total.under?.odds || -110,
                            game.odds.total.under?.line
                          )}
                        >
                          <span className="font-medium">Under</span>
                          <div className="text-right">
                            <div className="font-medium">{formatTotalLine(game.odds.total.under?.line || 45.5)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatOdds(game.odds.total.under?.odds || -110)}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="props" className="mt-0">
              {Object.keys(groupedProps).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No player props available for this game.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedProps).map(([category, props], index) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg capitalize">
                            {getStatIcon(category)}
                            {category} Props
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {props.map((prop) => (
                              <div key={prop.id} className="border border-border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <div className="font-medium text-foreground">{prop.playerName}</div>
                                    <div className="text-sm text-muted-foreground">{prop.position} • {prop.statType}</div>
                                  </div>
                                  <Badge variant="outline">{prop.line}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full hover:bg-accent hover:text-accent-foreground transition-colors"
                                      onClick={() => handlePlayerPropClick(prop, 'over')}
                                    >
                                      <div className="text-center w-full">
                                        <div className="text-xs text-muted-foreground">Over</div>
                                        <div className="font-medium">{formatOdds(prop.overOdds)}</div>
                                      </div>
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full hover:bg-accent hover:text-accent-foreground transition-colors"
                                      onClick={() => handlePlayerPropClick(prop, 'under')}
                                    >
                                      <div className="text-center w-full">
                                        <div className="text-xs text-muted-foreground">Under</div>
                                        <div className="font-medium">{formatOdds(prop.underOdds)}</div>
                                      </div>
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="alt" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Alternative lines coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="special" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Special bets coming soon...</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}