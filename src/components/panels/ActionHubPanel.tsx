import { useState } from 'react';
import { useBetSlip } from '@/context/BetSlipContext';
import { formatOdds } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash, Calculator, Target, Stack, TrendUp } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SmoothScrollContainer } from '@/components/VirtualScrolling';

export const ActionHubPanel = () => {
  const { betSlip, removeBet, updateStake, setBetType, clearBetSlip } = useBetSlip();
  const [isPlacing, setIsPlacing] = useState(false);

  const handleStakeChange = (betId: string, value: string) => {
    const stake = parseFloat(value) || 0;
    if (stake >= 0) {
      updateStake(betId, stake);
    }
  };

  const handlePlaceBet = async () => {
    if (betSlip.bets.length === 0) {
      toast.error('No bets selected');
      return;
    }

    if (betSlip.totalStake === 0) {
      toast.error('Please enter stake amounts');
      return;
    }

    setIsPlacing(true);
    
    // Simulate placing bet
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${betSlip.betType === 'single' ? 'Bets' : 'Parlay'} placed! Potential payout: $${betSlip.totalPayout.toFixed(2)}`);
      clearBetSlip();
    } catch (error) {
      toast.error('Failed to place bet. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  const formatBetDescription = (bet: any) => {
    const { game, betType, selection, line, playerProp } = bet;
    
    switch (betType) {
      case 'spread':
        const team = selection === 'home' ? game.homeTeam : game.awayTeam;
        return `${team.shortName} ${line}`;
      case 'moneyline':
        const mlTeam = selection === 'home' ? game.homeTeam : game.awayTeam;
        return `${mlTeam.shortName} Win`;
      case 'total':
        return `${selection === 'over' ? 'Over' : 'Under'} ${line}`;
      case 'player_prop':
        if (playerProp) {
          return `${playerProp.playerName} ${playerProp.statType} ${selection === 'over' ? 'Over' : 'Under'} ${line}`;
        }
        return 'Player Prop';
      default:
        return 'Unknown bet';
    }
  };

  if (betSlip.bets.length === 0) {
    return (
      <div className="h-full bg-card flex flex-col overflow-hidden">
        <motion.div 
          className="p-4 border-b border-border flex-shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-accent" />
            <h2 className="text-lg font-semibold text-card-foreground">Bet Slip</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Build your perfect bet</p>
        </motion.div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div 
            className="text-center max-w-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent/20 to-accent/40 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Calculator size={32} className="text-accent" />
            </motion.div>
            <h3 className="font-semibold text-card-foreground mb-3 text-lg">Build Your Bet</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Click on odds in the games to create single bets or combine them into a parlay.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <Target size={14} className="text-accent" />
                </div>
                <span className="text-muted-foreground">Single bets win independently</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <Stack size={14} className="text-accent" />
                </div>
                <span className="text-muted-foreground">Parlays multiply your winnings</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card flex flex-col overflow-hidden">
      <motion.div 
        className="p-4 border-b border-border flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-accent" />
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Bet Slip</h2>
              <p className="text-sm text-muted-foreground">
                {betSlip.bets.length} selection{betSlip.bets.length > 1 ? 's' : ''} • {betSlip.betType === 'single' ? 'Single Bets' : 'Parlay'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearBetSlip}
            className="text-destructive hover:text-destructive"
          >
            Clear All
          </Button>
        </div>
      </motion.div>

      <SmoothScrollContainer className="flex-1" showScrollbar={false}>
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="mb-4">
              <Tabs value={betSlip.betType} onValueChange={(value) => setBetType(value as 'single' | 'parlay')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <Target size={14} />
                    Single Bets
                  </TabsTrigger>
                  <TabsTrigger value="parlay" className="flex items-center gap-2">
                    <Stack size={14} />
                    Parlay
                    {betSlip.bets.length > 1 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {betSlip.bets.length}x
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {betSlip.betType === 'single' ? (
                      <>
                        <Target size={12} />
                        <span>Each bet wins independently</span>
                      </>
                    ) : (
                      <>
                        <Stack size={12} />
                        <span>All selections must win for payout</span>
                      </>
                    )}
                  </div>
                </div>
              </Tabs>
            </div>

            <div className="space-y-3">
              {betSlip.betType === 'single' ? (
                <AnimatePresence mode="popLayout">
                  {betSlip.bets.map((bet, index) => (
                    <motion.div
                      key={bet.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                      layout
                      whileHover={{ y: -2 }}
                    >
                      <Card className="relative border-border/50 hover:border-accent/50 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium">
                                {formatBetDescription(bet)}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">
                                {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {formatOdds(bet.odds)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBet(bet.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-muted-foreground">Stake:</label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={bet.stake || ''}
                                onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                                className="w-20 h-7 text-xs"
                                placeholder="0.00"
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">To Win:</span>
                              <span className="font-medium text-accent">
                                ${(bet.potentialPayout - bet.stake).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-accent/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Stack size={16} />
                          Parlay ({betSlip.bets.length} picks)
                        </CardTitle>
                        <Badge variant="outline" className="border-accent/30 text-accent">
                          {formatOdds(betSlip.totalOdds)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {betSlip.bets.map((bet, index) => (
                        <motion.div 
                          key={bet.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border/50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ x: 2 }}
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">{formatBetDescription(bet)}</div>
                            <div className="text-xs text-muted-foreground">
                              {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {formatOdds(bet.odds)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBet(bet.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash size={12} />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      
                      <Separator />
                      
                      <div className="space-y-3 bg-secondary/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-card-foreground">Total Stake:</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={betSlip.bets[0]?.stake || ''}
                            onChange={(e) => betSlip.bets[0] && handleStakeChange(betSlip.bets[0].id, e.target.value)}
                            className="w-24 h-8 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Parlay Odds:</span>
                          <span className="font-medium text-accent">{formatOdds(betSlip.totalOdds)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </SmoothScrollContainer>

      {/* Bet Slip Summary - Fixed at bottom */}
      <motion.div 
        className="border-t border-border p-4 bg-card/95 backdrop-blur-sm flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Stake:</span>
            <span className="font-semibold text-card-foreground">${betSlip.totalStake.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Potential Payout:</span>
            <span className="font-semibold text-accent">${betSlip.totalPayout.toFixed(2)}</span>
          </div>
          {betSlip.totalPayout > betSlip.totalStake && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profit:</span>
              <span className="font-medium text-[color:var(--color-win)]">
                +${(betSlip.totalPayout - betSlip.totalStake).toFixed(2)}
              </span>
            </div>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handlePlaceBet}
              disabled={isPlacing || betSlip.totalStake === 0}
              className="w-full"
              size="lg"
            >
              {isPlacing ? 'Placing Bet...' : (
                <div className="flex items-center gap-2">
                  <TrendUp size={16} />
                  Place {betSlip.betType === 'single' ? 'Bets' : 'Parlay'}
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};