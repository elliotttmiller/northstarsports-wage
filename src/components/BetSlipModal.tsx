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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash, X, Target, Stack, TrendUp, Calculator } from '@phosphor-icons/react';
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
    <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
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
        <h3 className="font-semibold text-foreground mb-3 text-lg">Build Your Bet</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Select odds from games to create single bets or combine them into a parlay for bigger payouts.
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
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 flex flex-col gap-0 border-border/50 shadow-2xl backdrop-blur-xl bg-card/98 [&>button]:hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-10 duration-300">
        <DialogHeader className="p-4 pb-3 border-b border-border/60 flex-shrink-0 bg-gradient-to-r from-card/90 to-card backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 ring-1 ring-accent/20">
                <Calculator size={22} className="text-accent" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold tracking-tight">Bet Slip</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {betSlip.bets.length > 0 
                    ? `${betSlip.bets.length} selection${betSlip.bets.length > 1 ? 's' : ''} • ${betSlip.betType === 'single' ? 'Single Bets' : 'Parlay'}`
                    : 'Build your perfect bet'
                  }
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {betSlip.bets.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearBetSlip}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3 transition-all rounded-lg"
                  >
                    <span className="text-xs font-medium">Clear All</span>
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 hover:bg-accent/10 rounded-lg"
                >
                  <X size={16} />
                </Button>
              </motion.div>
            </div>
          </div>
        </DialogHeader>

        {betSlip.bets.length === 0 ? (
          <EmptyBetSlip />
        ) : (
          <>
            <ScrollArea className="flex-1 max-h-[55vh]">
              <div className="px-4 py-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="mb-4">
                    <Tabs value={betSlip.betType} onValueChange={(value) => setBetType(value as 'single' | 'parlay')}>
                      <TabsList className="grid w-full grid-cols-2 bg-secondary/40 backdrop-blur-sm">
                        <TabsTrigger value="single" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                          <Target size={14} />
                          <span className="font-medium">Single Bets</span>
                        </TabsTrigger>
                        <TabsTrigger value="parlay" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                          <Stack size={14} />
                          <span className="font-medium">Parlay</span>
                          {betSlip.bets.length > 1 && (
                            <Badge variant="secondary" className="ml-1 text-xs bg-accent/20 text-accent border-accent/30">
                              {betSlip.bets.length}x
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-4 p-3 bg-gradient-to-r from-secondary/20 to-secondary/30 rounded-xl border border-border/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {betSlip.betType === 'single' ? (
                            <>
                              <Target size={12} className="text-accent" />
                              <span className="font-medium">Each bet wins independently</span>
                            </>
                          ) : (
                            <>
                              <Stack size={12} className="text-accent" />
                              <span className="font-medium">All selections must win for payout</span>
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
                            <Card className="relative border-border/40 hover:border-accent/40 transition-all duration-200 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-sm font-semibold tracking-tight">
                                      {formatBetDescription(bet)}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                                      {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="font-mono text-xs border-accent/30 text-accent bg-accent/10">
                                      {formatOdds(bet.odds)}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeBet(bet.id)}
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                      <Trash size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs text-muted-foreground font-medium">Stake:</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={bet.stake || ''}
                                      onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                                      className="w-24 h-8 text-xs bg-background/50 backdrop-blur-sm border-border/60 focus:border-accent/50"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-xs bg-secondary/20 rounded-lg p-2">
                                    <span className="text-muted-foreground font-medium">To Win:</span>
                                    <span className="font-semibold text-emerald-400">
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
                        <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 backdrop-blur-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                                <Stack size={16} className="text-accent" />
                                Parlay ({betSlip.bets.length} picks)
                              </CardTitle>
                              <Badge variant="outline" className="border-accent/40 text-accent bg-accent/10 font-mono">
                                {formatOdds(betSlip.totalOdds)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              {betSlip.bets.map((bet, index) => (
                                <motion.div 
                                  key={bet.id} 
                                  className="flex items-center justify-between p-3 bg-card/60 backdrop-blur-sm rounded-lg border border-border/40 hover:border-accent/30 transition-colors"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  whileHover={{ x: 2 }}
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{formatBetDescription(bet)}</div>
                                    <div className="text-xs text-muted-foreground font-medium">
                                      {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs font-mono border-accent/30 text-accent bg-accent/10">
                                      {formatOdds(bet.odds)}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeBet(bet.id)}
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                                    >
                                      <Trash size={12} />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            
                            <Separator className="opacity-60" />
                            
                            <div className="space-y-3 bg-gradient-to-r from-secondary/20 to-secondary/30 rounded-xl p-4 border border-border/50">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-foreground">Total Stake:</label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={betSlip.bets[0]?.stake || ''}
                                  onChange={(e) => betSlip.bets[0] && handleStakeChange(betSlip.bets[0].id, e.target.value)}
                                  className="w-28 h-9 text-sm bg-background/60 backdrop-blur-sm border-border/60 focus:border-accent/50"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="flex items-center justify-between text-sm">
                              </div>
                            </div>
                              </div>
                            </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </ScrollArea>

            {/* Bet Slip Summary - Enhanced mobile-first design */}
            <motion.div 
            {/* Bet Slip Summary - Enhanced mobile-first design */}
              initial={{ opacity: 0, y: 20 }}
              className="border-t border-border/60 p-4 bg-gradient-to-t from-card/98 to-card/95 backdrop-blur-xl flex-shrink-0"
              transition={{ duration: 0.4, delay: 0.2 }}
              animate={{ opacity: 1, y: 0 }}
              <div className="space-y-4">
                <div className="space-y-2 bg-gradient-to-r from-secondary/10 to-secondary/20 rounded-xl p-3 border border-border/30">
                    <span className="font-bold text-foreground">${betSlip.totalStake.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Potential Payout:</span>
                    <span className="font-bold text-accent">${betSlip.totalPayout.toFixed(2)}</span>
                  </div>
                  {betSlip.totalPayout > betSlip.totalStake && (
                    <motion.div 
                      className="flex items-center justify-between text-xs pt-2 border-t border-border/20"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <span className="text-muted-foreground font-medium">Profit:</span>
                      <span className="font-bold text-emerald-400">
                        +${(betSlip.totalPayout - betSlip.totalStake).toFixed(2)}
                      </span>
                    </motion.div>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                <motion.div
                    onClick={handlePlaceBet}
                    disabled={isPlacing || betSlip.totalStake === 0}
                >d text-base rounded-xl"
                  <Button 
                    onClick={handlePlaceBet}
                    disabled={isPlacing || betSlip.totalStake === 0}
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-base rounded-xl"
                        <motion.div
                          className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                          animate={{ rotate: 360 }}
                      <div className="flex items-center gap-3">
                        />
                          className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                      </div>
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      <div className="flex items-center gap-2">
                        <span>Placing Bet...</span>
                        <span>Place {betSlip.betType === 'single' ? 'Bets' : 'Parlay'}</span>
                      </div>
                    )}
                        <TrendUp size={18} />
                        <span>Place {betSlip.betType === 'single' ? 'Bets' : 'Parlay'}</span>
              </div>
            </motion.div>
                  </Button>
                </motion.div>
      </DialogContent>
    </Dialog>
  );
};