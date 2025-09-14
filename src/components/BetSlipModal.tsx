import React, { useState } from 'react';
import { useBetSlip } from '@/context/BetSlipContext';
import { useNavigation } from '@/context/NavigationContext';
import { formatOdds } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const BetSlipModal = () => {
  const { betSlip, removeBet, updateStake, setBetType, clearBetSlip } = useBetSlip();
  const { navigation, setMobilePanel } = useNavigation();
  const [isPlacing, setIsPlacing] = useState(false);

  const isOpen = navigation.mobilePanel === 'betslip';

  const handleClose = () => {
    setMobilePanel(null);
  };

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
      handleClose(); // Close modal after successful bet
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

  const EmptyBetSlip = () => (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Trash size={24} className="text-muted-foreground" />
        </motion.div>
        <h3 className="font-medium text-foreground mb-2">No Bets Selected</h3>
        <p className="text-sm text-muted-foreground">
          Click on odds in the games to add bets to your slip.
        </p>
      </motion.div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md max-h-[85vh] p-0 flex flex-col gap-0 border-border/50 shadow-2xl [&>button]:hidden">
        <DialogHeader className="p-4 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">Bet Slip</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {betSlip.bets.length > 0 
                  ? `${betSlip.bets.length} selection${betSlip.bets.length > 1 ? 's' : ''}`
                  : 'No selections yet'
                }
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              {betSlip.bets.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearBetSlip}
                  className="text-destructive hover:text-destructive h-8 px-2"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {betSlip.bets.length === 0 ? (
          <EmptyBetSlip />
        ) : (
          <>
            <ScrollArea className="flex-1 max-h-[50vh]">
              <div className="px-4 py-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Tabs value={betSlip.betType} onValueChange={(value) => setBetType(value as 'single' | 'parlay')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="single">Single Bets</TabsTrigger>
                      <TabsTrigger value="parlay">Parlay</TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="space-y-3">
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
                                    <span className="font-medium text-foreground">
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

                    <TabsContent value="parlay">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Parlay ({betSlip.bets.length} picks)</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {betSlip.bets.map((bet, index) => (
                              <motion.div 
                                key={bet.id} 
                                className="flex items-center justify-between p-2 bg-muted rounded-md"
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
                              </motion.div>
                            ))}
                            
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="flex items-center justify-between">
                                <label className="text-sm text-foreground">Stake:</label>
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
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>
            </ScrollArea>

            {/* Bet Slip Summary - Fixed at bottom */}
            <motion.div 
              className="border-t border-border p-4 bg-background flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Stake:</span>
                  <span className="font-semibold text-foreground">${betSlip.totalStake.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Potential Payout:</span>
                  <span className="font-semibold text-accent">${betSlip.totalPayout.toFixed(2)}</span>
                </div>
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
                    {isPlacing ? 'Placing Bet...' : 'Place Bet'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};