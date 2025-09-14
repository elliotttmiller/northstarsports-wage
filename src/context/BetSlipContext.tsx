import { createContext, useContext, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';
import { Bet, BetSlip, Game, PlayerProp } from '@/types';
import { calculatePayout } from '@/services/mockApi';

interface BetSlipContextType {
  betSlip: BetSlip;
  addBet: (game: Game, betType: 'spread' | 'moneyline' | 'total' | 'player_prop', selection: 'home' | 'away' | 'over' | 'under', odds: number, line?: number, playerProp?: PlayerProp) => void;
  removeBet: (betId: string) => void;
  updateStake: (betId: string, stake: number) => void;
  setBetType: (betType: 'single' | 'parlay') => void;
  clearBetSlip: () => void;
}

export const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (context === undefined) {
    throw new Error('useBetSlip must be used within a BetSlipProvider. Make sure your component is wrapped in BetSlipProvider.');
  }
  return context;
};

interface BetSlipProviderProps {
  children: ReactNode;
}

const defaultBetSlip: BetSlip = {
  bets: [],
  betType: 'single',
  totalStake: 0,
  totalPayout: 0,
  totalOdds: 0
};

export const BetSlipProvider: React.FC<BetSlipProviderProps> = ({ children }) => {
  const [betSlip, setBetSlip] = useKV<BetSlip>('bet-slip', defaultBetSlip);

  const calculateBetSlipTotals = (bets: Bet[], betType: 'single' | 'parlay') => {
    if (bets.length === 0) {
      return { totalStake: 0, totalPayout: 0, totalOdds: 0 };
    }

    if (betType === 'single') {
      const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
      const totalPayout = bets.reduce((sum, bet) => sum + bet.potentialPayout, 0);
      return { totalStake, totalPayout, totalOdds: 0 };
    } else {
      // Parlay calculation
      const totalStake = bets.length > 0 ? bets[0].stake : 0;
      const combinedOdds = bets.reduce((odds, bet) => {
        const decimal = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
        return odds * decimal;
      }, 1);
      
      const americanOdds = combinedOdds >= 2 
        ? Math.round((combinedOdds - 1) * 100)
        : Math.round(-100 / (combinedOdds - 1));
      
      const totalPayout = totalStake + calculatePayout(totalStake, americanOdds);
      
      return { totalStake, totalPayout, totalOdds: americanOdds };
    }
  };

  const addBet = (
    game: Game, 
    betType: 'spread' | 'moneyline' | 'total' | 'player_prop', 
    selection: 'home' | 'away' | 'over' | 'under',
    odds: number,
    line?: number,
    playerProp?: PlayerProp
  ) => {
    const betId = playerProp 
      ? `${game.id}-${betType}-${playerProp.id}-${selection}`
      : `${game.id}-${betType}-${selection}`;
    
    setBetSlip(currentBetSlip => {
      if (!currentBetSlip) return defaultBetSlip;
      
      // Remove existing bet on same game/type if it exists (except for player props which can be multiple)
      let filteredBets = currentBetSlip.bets;
      if (betType !== 'player_prop') {
        filteredBets = currentBetSlip.bets.filter(
          bet => !(bet.gameId === game.id && bet.betType === betType)
        );
      } else {
        // For player props, remove only if it's the same prop
        filteredBets = currentBetSlip.bets.filter(
          bet => bet.id !== betId
        );
      }
      
      const newBet: Bet = {
        id: betId,
        gameId: game.id,
        betType,
        selection,
        odds,
        line,
        stake: 10, // Default stake
        potentialPayout: 10 + calculatePayout(10, odds),
        game,
        playerProp: playerProp ? {
          playerId: playerProp.playerId,
          playerName: playerProp.playerName,
          statType: playerProp.statType,
          category: playerProp.category
        } : undefined
      };

      const updatedBets = [...filteredBets, newBet];
      const totals = calculateBetSlipTotals(updatedBets, currentBetSlip.betType);

      return {
        ...currentBetSlip,
        bets: updatedBets,
        ...totals
      };
    });
  };

  const removeBet = (betId: string) => {
    setBetSlip(currentBetSlip => {
      if (!currentBetSlip) return defaultBetSlip;
      
      const updatedBets = currentBetSlip.bets.filter(bet => bet.id !== betId);
      const totals = calculateBetSlipTotals(updatedBets, currentBetSlip.betType);

      return {
        ...currentBetSlip,
        bets: updatedBets,
        ...totals
      };
    });
  };

  const updateStake = (betId: string, stake: number) => {
    setBetSlip(currentBetSlip => {
      if (!currentBetSlip) return defaultBetSlip;
      
      const updatedBets = currentBetSlip.bets.map(bet => {
        if (bet.id === betId) {
          return {
            ...bet,
            stake,
            potentialPayout: stake + calculatePayout(stake, bet.odds)
          };
        }
        return bet;
      });

      // For parlay, update all bets to have same stake
      if (currentBetSlip.betType === 'parlay') {
        updatedBets.forEach(bet => {
          bet.stake = stake;
          bet.potentialPayout = stake + calculatePayout(stake, bet.odds);
        });
      }

      const totals = calculateBetSlipTotals(updatedBets, currentBetSlip.betType);

      return {
        ...currentBetSlip,
        bets: updatedBets,
        ...totals
      };
    });
  };

  const setBetType = (betType: 'single' | 'parlay') => {
    setBetSlip(currentBetSlip => {
      if (!currentBetSlip) return defaultBetSlip;
      
      const totals = calculateBetSlipTotals(currentBetSlip.bets, betType);
      
      return {
        ...currentBetSlip,
        betType,
        ...totals
      };
    });
  };

  const clearBetSlip = () => {
    setBetSlip(defaultBetSlip);
  };

  const currentBetSlip = betSlip || defaultBetSlip;

  const value: BetSlipContextType = {
    betSlip: currentBetSlip,
    addBet,
    removeBet,
    updateStake,
    setBetType,
    clearBetSlip
  };

  return (
    <BetSlipContext.Provider value={value}>
      {children}
    </BetSlipContext.Provider>
  );
};