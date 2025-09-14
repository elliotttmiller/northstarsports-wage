import React, { useState } from 'react';
import { useBetSlip } from '@/context/BetSlipContext';
import { useNavigation } from '@/context/NavigationContext';
import { formatOdds } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash, X, Target, Stack, TrendUp, Calculator } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SmoothScrollContainer } from '@/components/VirtualScrolling';

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
      toast.success(`${betSlip.betType === 'single' ? 'Bets' : 'Parlay'} placed successfully!`);
      clearBetSlip();
      handleClose();
    } catch (error) {
      toast.error('Failed to place bet. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  const formatBetDescription = (bet: any) => {
    const { type, value } = bet;
    switch (type) {
      case 'spread':
        return `${bet.team} ${value > 0 ? '+' : ''}${value}`;
      case 'moneyline':
        return bet.team;
      case 'over_under':
        return `${value > bet.game.total ? 'Over' : 'Under'} ${bet.game.total}`;
      default:
        return `${bet.team} ${type}`;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="fixed inset-0 z-50 w-screen h-screen max-w-none bg-background/98 backdrop-blur-xl border-0 rounded-none flex flex-col overflow-hidden"
        onInteractOutside={handleClose}
      >
        <DialogHeader className="flex-shrink-0 border-b border-border/60 p-4 bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center w-8 h-8 bg-accent/15 rounded-lg border border-accent/30"
              >
                <Calculator size={16} className="text-accent" />
              </motion.div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Bet Slip {betSlip.bets.length > 0 && `(${betSlip.bets.length})`}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {betSlip.bets.length === 0 ? 'No bets selected' : `${betSlip.betType === 'single' ? 'Individual' : 'Parlay'} betting`}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {betSlip.bets.length > 1 && (
                <Tabs 
                  value={betSlip.betType} 
                  onValueChange={setBetType}
                  className="w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2 h-8 bg-secondary/60 backdrop-blur-sm">
                    <TabsTrigger value="single" className="text-xs px-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                      Single
                    </TabsTrigger>
                    <TabsTrigger value="parlay" className="text-xs px-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                      Parlay
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <SmoothScrollContainer className="flex-1 px-4 seamless-scroll">
          <motion.div 
            className="py-4 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {betSlip.bets.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/30 rounded-2xl flex items-center justify-center mb-6 border border-accent/20"
                >
                  <Target size={32} className="text-accent" />
                </motion.div>
                <motion.h3 
                  className="text-xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  Ready to Bet
                </motion.h3>
                <motion.p 
                  className="text-muted-foreground text-sm max-w-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  Add some bets by tapping odds on any game to get started
                </motion.p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {betSlip.betType === 'single' ? (
                  <AnimatePresence mode="wait">
                    {betSlip.bets.map((bet, index) => (
                      <motion.div 
                        key={bet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="border-border/50 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm hover:border-accent/30 transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-sm font-semibold">
                                  {formatBetDescription(bet)}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium mt-1">
                                  {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 font-mono text-xs">
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
                                  step="0.5"
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
                              <div>
                                <div className="text-sm font-medium">{formatBetDescription(bet)}</div>
                                <div className="text-xs text-muted-foreground font-medium">
                                  {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
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
                              step="0.5"
                              value={betSlip.bets[0]?.stake || ''}
                              onChange={(e) => betSlip.bets[0] && handleStakeChange(betSlip.bets[0].id, e.target.value)}
                              className="w-28 h-9 text-sm bg-background/60 backdrop-blur-sm border-border/60 focus:border-accent/50"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Total Payout:</span>
                            <span className="font-bold text-emerald-400">
                              ${betSlip.totalPayout.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </SmoothScrollContainer>

        {/* Bet Slip Summary - Enhanced mobile-first design */}
        {betSlip.bets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border-t border-border/30 p-4 bg-gradient-to-t from-card/90 to-card/60 backdrop-blur-xl flex-shrink-0"
          >
            <div className="space-y-4">
              <div className="space-y-2 bg-gradient-to-r from-secondary/10 to-secondary/20 rounded-xl p-3 border border-border/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Total Stake:</span>
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
                <Button 
                  onClick={handlePlaceBet}
                  disabled={isPlacing || betSlip.totalStake === 0}
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-base rounded-xl"
                >
                  {isPlacing ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                      />
                      <span>Placing Bet...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrendUp size={18} />
                      <span>Place {betSlip.betType === 'single' ? 'Bets' : 'Parlay'}</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};