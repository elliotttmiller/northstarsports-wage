import React, { useState } from 'react';
import { useBetSlip } from '@/context/BetSlipContext';
import { formatOdds } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
      toast.success(`Bet placed! Potential payout: $${betSlip.totalPayout.toFixed(2)}`);
      clearBetSlip();
    } catch (error) {
      toast.error('Failed to place bet. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  const formatBetDescription = (bet: any) => {
    const { game, betType, selection, line } = bet;
    
    switch (betType) {
      case 'spread':
        const team = selection === 'home' ? game.homeTeam : game.awayTeam;
        return `${team.shortName} ${line}`;
      case 'moneyline':
        const mlTeam = selection === 'home' ? game.homeTeam : game.awayTeam;
        return `${mlTeam.shortName} Win`;
      case 'total':
        return `${selection === 'over' ? 'Over' : 'Under'} ${line}`;
      default:
        return 'Unknown bet';
    }
  };

  if (betSlip.bets.length === 0) {
    return (
      <div className="h-full bg-card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-card-foreground">Bet Slip</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Trash size={24} className="text-muted-foreground" />
            </div>
            <h3 className="font-medium text-card-foreground mb-2">No Bets Selected</h3>
            <p className="text-sm text-muted-foreground">
              Click on odds in the games panel to add bets to your slip.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Bet Slip</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearBetSlip}
            className="text-destructive hover:text-destructive"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          <Tabs value={betSlip.betType} onValueChange={(value) => setBetType(value as 'single' | 'parlay')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Bets</TabsTrigger>
              <TabsTrigger value="parlay">Parlay</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {betSlip.bets.map((bet, index) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    layout
                  >
                    <Card className="relative">
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
                            <span className="text-sm font-medium">{formatOdds(bet.odds)}</span>
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
                            <span className="font-medium text-card-foreground">
                              ${(bet.potentialPayout - bet.stake).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="parlay" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parlay ({betSlip.bets.length} picks)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {betSlip.bets.map((bet, index) => (
                    <div key={bet.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{formatBetDescription(bet)}</div>
                        <div className="text-xs text-muted-foreground">
                          {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{formatOdds(bet.odds)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBet(bet.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-card-foreground">Stake:</label>
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
                      <span className="font-medium">{formatOdds(betSlip.totalOdds)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bet Slip Summary - Fixed at bottom */}
      <div className="border-t border-border p-4 bg-card flex-shrink-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Stake:</span>
            <span className="font-semibold text-card-foreground">${betSlip.totalStake.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Potential Payout:</span>
            <span className="font-semibold text-accent">${betSlip.totalPayout.toFixed(2)}</span>
          </div>
          <Button 
            onClick={handlePlaceBet}
            disabled={isPlacing || betSlip.totalStake === 0}
            className="w-full"
            size="lg"
          >
            {isPlacing ? 'Placing Bet...' : 'Place Bet'}
          </Button>
        </div>
      </div>
    </div>
  );
};