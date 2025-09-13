import { useNavigation } from '@/context/NavigationContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { List, ChartLine, Receipt } from '@phosphor-icons/react';

export const BottomNav = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const { betSlip } = useBetSlip();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around z-30">
      <button
        onClick={() => setMobilePanel(navigation.mobilePanel === 'navigation' ? null : 'navigation')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
          navigation.mobilePanel === 'navigation' 
            ? 'bg-accent text-accent-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <List size={20} />
        <span className="text-xs">Sports</span>
      </button>

      <button
        onClick={() => setMobilePanel('workspace')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
          navigation.mobilePanel === 'workspace' || !navigation.mobilePanel
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <ChartLine size={20} />
        <span className="text-xs">Games</span>
      </button>

      <button
        onClick={() => setMobilePanel(navigation.mobilePanel === 'betslip' ? null : 'betslip')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors relative ${
          navigation.mobilePanel === 'betslip'
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <div className="relative">
          <Receipt size={20} />
          {betSlip.bets.length > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-semibold">
              {betSlip.bets.length}
            </div>
          )}
        </div>
        <span className="text-xs">Bet Slip</span>
      </button>
    </nav>
  );
};