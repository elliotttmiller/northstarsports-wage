// Core data types for the wagering application
export interface Sport {
  id: string;
  name: string;
  icon: string;
  leagues: League[];
}

export interface League {
  id: string;
  name: string;
  sportId: string;
  games: Game[];
}

export interface Game {
  id: string;
  leagueId: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: Date;
  status: 'upcoming' | 'live' | 'finished';
  odds: GameOdds;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  record?: string;
}

export interface GameOdds {
  spread: BetOption;
  moneyline: BetOption;
  total: BetOption;
}

export interface BetOption {
  home: OddsData;
  away: OddsData;
  over?: OddsData;
  under?: OddsData;
}

export interface OddsData {
  odds: number; // American odds format
  line?: number; // spread or total line
  lastUpdated: Date;
}

export interface Bet {
  id: string;
  gameId: string;
  betType: 'spread' | 'moneyline' | 'total';
  selection: 'home' | 'away' | 'over' | 'under';
  odds: number;
  line?: number;
  stake: number;
  potentialPayout: number;
  game: Game;
}

export interface BetSlip {
  bets: Bet[];
  betType: 'single' | 'parlay';
  totalStake: number;
  totalPayout: number;
  totalOdds: number;
}

export interface NavigationState {
  selectedSport: string | null;
  selectedLeague: string | null;
  mobilePanel: 'navigation' | 'workspace' | 'betslip' | null;
}

export interface AppState {
  navigation: NavigationState;
  betSlip: BetSlip;
  sports: Sport[];
  isLoading: boolean;
}