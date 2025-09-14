import React, { useState, useEffect, useCallback } from 'react';
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
import { Trash, X, Target, Stack, TrendUp, Calculator, CheckCircle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SmoothScrollContainer } from '@/components/VirtualScrolling';

export const BetSlipModal = () => {
  const { betSlip, removeBet, updateStake, setBetType, clearBetSlip } = useBetSlip();
  const { navigation, setMobilePanel } = useNavigation();
  const [isPlacing, setIsPlacing] = useState(false);
  const [placementStage, setPlacementStage] = useState<'idle' | 'validating' | 'processing' | 'success'>('idle');

  const isOpen = navigation.mobilePanel === 'betslip';

  // Handle close with smooth animation reset
  const handleClose = useCallback(() => {
    if (isPlacing) return; // Prevent closing during bet placement
    setPlacementStage('idle');
    setMobilePanel(null);
  }, [setMobilePanel, isPlacing]);

  // Handle stake updates with validation
  const handleStakeChange = useCallback((betId: string, value: string) => {
    const stake = parseFloat(value) || 0;
    if (stake >= 0 && stake <= 10000) { // Max stake limit
      updateStake(betId, stake);
    }
  }, [updateStake]);

  // Enhanced bet placement with stages
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
    
    try {
      // Stage 1: Validation
      setPlacementStage('validating');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Stage 2: Processing
      setPlacementStage('processing');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Stage 3: Success
      setPlacementStage('success');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(
        `${betSlip.betType === 'single' ? 'Bets' : 'Parlay'} placed successfully! Good luck!`
      );
      
      clearBetSlip();
      
      // Delayed close for success animation
      setTimeout(() => {
        handleClose();
      }, 300);
      
    } catch (error) {
      toast.error('Failed to place bet. Please try again.');
      setPlacementStage('idle');
    } finally {
      setIsPlacing(false);
    }
  };

  // Enhanced bet description formatting
  const formatBetDescription = useCallback((bet: any) => {
    const { type, value, team } = bet;
    switch (type) {
      case 'spread':
        const spreadValue = parseFloat(value);
        return `${team} ${spreadValue > 0 ? '+' : ''}${spreadValue}`;
      case 'moneyline':
        return team;
      case 'over_under':
        return `${value > bet.game.total ? 'Over' : 'Under'} ${bet.game.total}`;
      case 'player_prop':
        return `${bet.playerName} ${bet.propType}`;
      default:
        return `${team} ${type}`;
    }
  }, []);

  // Keyboard handling for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPlacing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleClose, isPlacing]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="fixed inset-0 top-0 left-0 z-[60] w-full h-full max-w-none transform-none translate-x-0 translate-y-0 bg-background/96 backdrop-blur-2xl border-0 rounded-none flex flex-col overflow-hidden p-0 m-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          transform: 'none',
          maxWidth: 'none'
        }}
        onInteractOutside={(e) => {
          if (!isPlacing) handleClose();
          else e.preventDefault();
        }}
      >
        {/* Enhanced Header */}
        <DialogHeader className="flex-shrink-0 border-b border-border/40 p-4 bg-gradient-to-r from-card/90 to-card/80 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -12, scale: 0.8 }}
                animate={{ 
                  rotate: 0, 
                  scale: 1,
                  ...(placementStage === 'success' && { scale: [1, 1.2, 1] })
                }}
                transition={{ 
                  duration: 0.4,
                  ...(placementStage === 'success' && { 
                    repeat: 1,
                    repeatType: 'reverse',
                    duration: 0.6 
                  })
                }}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 ${
                  placementStage === 'success' 
                    ? 'bg-green-500/20 border-green-500/40' 
                    : betSlip.bets.length > 0
                      ? 'bg-accent/20 border-accent/40'
                      : 'bg-secondary/20 border-border/60'
                }`}
              >
                {placementStage === 'success' ? (
                  <CheckCircle size={20} className="text-green-400" weight="fill" />
                ) : (
                  <Calculator size={20} className="text-accent" />
                )}
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  Bet Slip 
                  {betSlip.bets.length > 0 && (
                    <motion.span
                      key={betSlip.bets.length}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-sm font-medium text-accent"
                    >
                      ({betSlip.bets.length})
                    </motion.span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {placementStage === 'success' 
                    ? 'Bet placed successfully!' 
                    : betSlip.bets.length === 0 
                      ? 'No bets selected' 
                      : `${betSlip.betType === 'single' ? 'Individual' : 'Parlay'} betting mode`
                  }
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {betSlip.bets.length > 1 && (
                <Tabs 
                  value={betSlip.betType} 
                  onValueChange={setBetType}
                  className="w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2 h-9 bg-secondary/50 backdrop-blur-sm border border-border/40">
                    <TabsTrigger 
                      value="single" 
                      className="text-sm px-4 font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-200"
                    >
                      Single
                    </TabsTrigger>
                    <TabsTrigger 
                      value="parlay" 
                      className="text-sm px-4 font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-200"
                    >
                      Parlay
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isPlacing}
                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all duration-200"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content Area with Enhanced Scrolling */}
        <SmoothScrollContainer className="flex-1 px-4 seamless-scroll">
          <motion.div 
            className="py-6 space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {betSlip.bets.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-20 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200 
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-accent/25 to-accent/35 rounded-3xl flex items-center justify-center mb-8 border border-accent/20 shadow-lg"
                >
                  <Target size={36} className="text-accent" weight="duotone" />
                </motion.div>
                <motion.h3 
                  className="text-2xl font-bold mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Ready to Bet
                </motion.h3>
                <motion.p 
                  className="text-muted-foreground text-base max-w-72 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  Browse games and tap odds to start building your perfect bet slip
                </motion.p>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {betSlip.betType === 'single' ? (
                  <AnimatePresence mode="popLayout">
                    {betSlip.bets.map((bet, index) => (
                      <motion.div 
                        key={bet.id}
                        layout
                        initial={{ opacity: 0, x: -30, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.9 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        <Card className="border-border/50 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-lg">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base font-bold text-foreground mb-1">
                                  {formatBetDescription(bet)}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground font-medium">
                                  {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                                </p>
                                {bet.game && bet.game.leagueId && (
                                  <p className="text-xs text-muted-foreground/80 mt-1">
                                    {bet.game.leagueId}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className="border-accent/40 text-accent bg-accent/15 font-mono text-sm px-3 py-1"
                                >
                                  {formatOdds(bet.odds)}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBet(bet.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/15 rounded-lg transition-all duration-200"
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-sm text-muted-foreground font-semibold">Stake:</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10000"
                                  step="1"
                                  value={bet.stake || ''}
                                  onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                                  className="w-28 h-9 text-sm bg-background/60 backdrop-blur-sm border-border/60 focus:border-accent/60 rounded-lg font-medium"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="flex items-center justify-between text-sm bg-gradient-to-r from-secondary/15 to-secondary/25 rounded-xl p-3 border border-border/30">
                                <span className="text-muted-foreground font-semibold">Potential Win:</span>
                                <span className="font-bold text-green-400 text-base">
                                  ${bet.stake > 0 ? (bet.potentialPayout - bet.stake).toFixed(2) : '0.00'}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="border-accent/40 bg-gradient-to-br from-accent/8 to-accent/15 backdrop-blur-sm shadow-lg">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-3 font-bold">
                            <motion.div
                              initial={{ rotate: -10 }}
                              animate={{ rotate: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Stack size={20} className="text-accent" />
                            </motion.div>
                            Parlay Bet ({betSlip.bets.length} picks)
                          </CardTitle>
                          <Badge 
                            variant="outline" 
                            className="border-accent/50 text-accent bg-accent/20 font-mono text-base px-4 py-2"
                          >
                            {formatOdds(betSlip.totalOdds)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="space-y-3">
                          <AnimatePresence>
                            {betSlip.bets.map((bet, index) => (
                              <motion.div 
                                key={bet.id}
                                layout
                                className="flex items-center justify-between p-4 bg-card/70 backdrop-blur-sm rounded-xl border border-border/40 hover:border-accent/40 transition-all duration-300"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                              >
                                <div className="flex-1">
                                  <div className="text-base font-semibold text-foreground mb-1">
                                    {formatBetDescription(bet)}
                                  </div>
                                  <div className="text-sm text-muted-foreground font-medium">
                                    {bet.game.awayTeam.shortName} @ {bet.game.homeTeam.shortName}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge 
                                    variant="outline" 
                                    className="text-sm font-mono border-accent/40 text-accent bg-accent/15 px-3 py-1"
                                  >
                                    {formatOdds(bet.odds)}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBet(bet.id)}
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/15 rounded-lg"
                                  >
                                    <Trash size={14} />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        <Separator className="opacity-40" />
                        <div className="space-y-4 bg-gradient-to-r from-secondary/20 to-secondary/30 rounded-2xl p-5 border border-border/50">
                          <div className="flex items-center justify-between">
                            <label className="text-base font-bold text-foreground">Total Stake:</label>
                            <Input
                              type="number"
                              min="0"
                              max="10000"
                              step="1"
                              value={betSlip.bets[0]?.stake || ''}
                              onChange={(e) => betSlip.bets[0] && handleStakeChange(betSlip.bets[0].id, e.target.value)}
                              className="w-32 h-10 text-base bg-background/70 backdrop-blur-sm border-border/60 focus:border-accent/60 rounded-lg font-semibold"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-center justify-between text-base">
                            <span className="text-muted-foreground font-semibold">Total Payout:</span>
                            <span className="font-bold text-green-400 text-xl">
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

        {/* Enhanced Summary & Place Bet Section */}
        {betSlip.bets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="border-t border-border/40 p-5 bg-gradient-to-t from-card/95 to-card/70 backdrop-blur-2xl flex-shrink-0"
          >
            <div className="space-y-5">
              {/* Summary Card */}
              <div className="space-y-3 bg-gradient-to-r from-secondary/15 to-secondary/25 rounded-2xl p-4 border border-border/40">
                <div className="flex items-center justify-between text-base">
                  <span className="text-muted-foreground font-semibold">Total Stake:</span>
                  <span className="font-bold text-foreground text-lg">
                    ${betSlip.totalStake.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-muted-foreground font-semibold">Potential Payout:</span>
                  <span className="font-bold text-accent text-lg">
                    ${betSlip.totalPayout.toFixed(2)}
                  </span>
                </div>
                {betSlip.totalPayout > betSlip.totalStake && (
                  <motion.div 
                    className="flex items-center justify-between text-base pt-2 border-t border-border/30"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <span className="text-muted-foreground font-semibold">Profit:</span>
                    <span className="font-bold text-green-400 text-lg">
                      +${(betSlip.totalPayout - betSlip.totalStake).toFixed(2)}
                    </span>
                  </motion.div>
                )}
              </div>
              
              {/* Place Bet Button with Enhanced States */}
              <motion.div
                whileHover={!isPlacing ? { scale: 1.02 } : {}}
                whileTap={!isPlacing ? { scale: 0.98 } : {}}
              >
                <Button 
                  onClick={handlePlaceBet}
                  disabled={isPlacing || betSlip.totalStake === 0}
                  className={`w-full h-14 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    placementStage === 'success'
                      ? 'bg-green-500 hover:bg-green-500 text-white'
                      : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  }`}
                >
                  {isPlacing ? (
                    <div className="flex items-center gap-3">
                      {placementStage === 'validating' && (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                          />
                          <span>Validating...</span>
                        </>
                      )}
                      {placementStage === 'processing' && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-6 h-6 bg-accent-foreground rounded-full"
                          />
                          <span>Processing Bet...</span>
                        </>
                      )}
                      {placementStage === 'success' && (
                        <>
                          <CheckCircle size={24} weight="fill" />
                          <span>Bet Placed!</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <TrendUp size={22} />
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