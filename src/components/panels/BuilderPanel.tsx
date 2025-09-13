import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Stack, 
  User, 
  Plus, 
  Trash,
  TrendUp,
  CurrencyDollar,
  Calculator
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SmoothScrollContainer } from '@/components/VirtualScrolling';

type BetBuilderType = 'straight' | 'parlay' | 'props';

interface BetSelection {
  id: string;
  type: 'spread' | 'moneyline' | 'total' | 'prop';
  game: string;
  team: string;
  line?: string;
  odds: number;
  selection: string;
  propType?: string;
  player?: string;
}

export const BuilderPanel = () => {
  const [builderType, setBuilderType] = useState<BetBuilderType>('straight');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(0);

  const addSelection = (selection: BetSelection) => {
    if (builderType === 'straight' && selections.length >= 1) {
      toast.error('Straight bets can only have one selection');
      return;
    }
    
    setSelections(prev => [...prev, selection]);
    toast.success('Selection added to builder');
  };

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(sel => sel.id !== id));
  };

  const clearBuilder = () => {
    setSelections([]);
    setStake(0);
  };

  const calculatePayout = () => {
    if (selections.length === 0 || stake === 0) return 0;
    
    if (builderType === 'straight') {
      const odds = selections[0].odds;
      if (odds > 0) {
        return stake * (odds / 100);
      } else {
        return stake * (100 / Math.abs(odds));
      }
    } else {
      // Parlay calculation
      let multiplier = 1;
      selections.forEach(selection => {
        const odds = selection.odds;
        if (odds > 0) {
          multiplier *= (odds / 100) + 1;
        } else {
          multiplier *= (100 / Math.abs(odds)) + 1;
        }
      });
      return stake * (multiplier - 1);
    }
  };

  const builderTabs = [
    {
      value: 'straight',
      label: 'Straight',
      icon: Target,
      description: 'Single bet on one outcome'
    },
    {
      value: 'parlay',
      label: 'Parlay',
      icon: Stack,
      description: 'Multiple bets combined'
    },
    {
      value: 'props',
      label: 'Props',
      icon: User,
      description: 'Player & game props'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calculator size={20} className="text-accent" />
          Bet Builder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create straights, parlays, or prop bets
        </p>
      </CardHeader>

      <div className="flex-1 flex flex-col">
        {/* Builder Type Tabs */}
        <div className="p-4 border-b border-border">
          <Tabs value={builderType} onValueChange={(value) => setBuilderType(value as BetBuilderType)}>
            <TabsList className="grid w-full grid-cols-3 gap-1">
              {builderTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-col items-center space-y-1 p-3 text-xs"
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <div className="mt-3 text-center">
              <p className="text-sm text-muted-foreground">
                {builderTabs.find(tab => tab.value === builderType)?.description}
              </p>
            </div>
          </Tabs>
        </div>

        {/* Selections Area */}
        <SmoothScrollContainer className="flex-1 p-4">
          <div className="space-y-4">
            {/* Current Selections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">
                  Selections ({selections.length})
                  {builderType === 'straight' && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (max 1)
                    </span>
                  )}
                </Label>
                {selections.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearBuilder}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash size={14} />
                    Clear
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {selections.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8 border-2 border-dashed border-border rounded-lg"
                  >
                    <Plus size={32} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Add selections from games to build your bet
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {selections.map((selection, index) => (
                      <motion.div
                        key={selection.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {selection.type.toUpperCase()}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {selection.team}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {selection.game} • {selection.selection}
                                {selection.line && ` ${selection.line}`}
                              </p>
                              {selection.player && (
                                <p className="text-xs text-accent">
                                  {selection.player} - {selection.propType}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                {selection.odds > 0 ? '+' : ''}{selection.odds}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSelection(selection.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash size={12} />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Stake Input */}
            {selections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Separator />
                
                <div>
                  <Label htmlFor="stake" className="text-sm font-medium">
                    Stake Amount
                  </Label>
                  <div className="relative mt-1">
                    <CurrencyDollar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="stake"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      value={stake || ''}
                      onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Payout Calculation */}
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Potential Payout:</span>
                    <span className="font-medium text-accent">
                      ${(stake + calculatePayout()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Potential Profit:</span>
                    <span>${calculatePayout().toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </SmoothScrollContainer>

        {/* Action Buttons */}
        {selections.length > 0 && (
          <div className="p-4 border-t border-border bg-card/50">
            <div className="space-y-2">
              <Button 
                className="w-full" 
                disabled={stake === 0}
                onClick={() => {
                  toast.success(`${builderType.charAt(0).toUpperCase() + builderType.slice(1)} bet built!`);
                  clearBuilder();
                }}
              >
                <TrendUp size={16} className="mr-2" />
                Place {builderType.charAt(0).toUpperCase() + builderType.slice(1)}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={clearBuilder}
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};