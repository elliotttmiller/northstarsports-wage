import { Sport, League, Game, Team } from '@/types';

// Mock team data
const teams: Record<string, Team> = {
  // NFL Teams
  'chiefs': { id: 'chiefs', name: 'Kansas City Chiefs', shortName: 'KC', logo: '', record: '11-1' },
  'bills': { id: 'bills', name: 'Buffalo Bills', shortName: 'BUF', logo: '', record: '10-2' },
  'dolphins': { id: 'dolphins', name: 'Miami Dolphins', shortName: 'MIA', logo: '', record: '8-4' },
  'ravens': { id: 'ravens', name: 'Baltimore Ravens', shortName: 'BAL', logo: '', record: '9-3' },
  
  // NBA Teams
  'lakers': { id: 'lakers', name: 'Los Angeles Lakers', shortName: 'LAL', logo: '', record: '15-10' },
  'celtics': { id: 'celtics', name: 'Boston Celtics', shortName: 'BOS', logo: '', record: '18-7' },
  'warriors': { id: 'warriors', name: 'Golden State Warriors', shortName: 'GSW', logo: '', record: '12-13' },
  'nuggets': { id: 'nuggets', name: 'Denver Nuggets', shortName: 'DEN', logo: '', record: '14-11' },
  
  // NHL Teams
  'rangers': { id: 'rangers', name: 'New York Rangers', shortName: 'NYR', logo: '', record: '15-8-1' },
  'bruins': { id: 'bruins', name: 'Boston Bruins', shortName: 'BOS', logo: '', record: '13-10-3' },
  'panthers': { id: 'panthers', name: 'Florida Panthers', shortName: 'FLA', logo: '', record: '16-9-1' },
  'oilers': { id: 'oilers', name: 'Edmonton Oilers', shortName: 'EDM', logo: '', record: '16-10-2' }
};

// Generate mock games
const generateGames = (leagueId: string, teamIds: string[]): Game[] => {
  const games: Game[] = [];
  const now = new Date();
  
  for (let i = 0; i < 8; i++) {
    const gameDate = new Date(now.getTime() + (i - 2) * 24 * 60 * 60 * 1000);
    const homeTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
    let awayTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
    while (awayTeamId === homeTeamId) {
      awayTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
    }
    
    const status = i < 2 ? 'finished' : i === 2 ? 'live' : 'upcoming';
    
    games.push({
      id: `${leagueId}-game-${i}`,
      leagueId,
      homeTeam: teams[homeTeamId],
      awayTeam: teams[awayTeamId],
      startTime: gameDate,
      status,
      odds: {
        spread: {
          home: { odds: -110, line: Math.random() > 0.5 ? -3.5 : 3.5, lastUpdated: new Date() },
          away: { odds: -110, line: Math.random() > 0.5 ? 3.5 : -3.5, lastUpdated: new Date() }
        },
        moneyline: {
          home: { odds: Math.floor(Math.random() * 200) - 200, lastUpdated: new Date() },
          away: { odds: Math.floor(Math.random() * 200) + 100, lastUpdated: new Date() }
        },
        total: {
          home: { odds: -110, lastUpdated: new Date() },
          away: { odds: -110, lastUpdated: new Date() },
          over: { odds: -110, line: Math.floor(45 + Math.random() * 15) + 0.5, lastUpdated: new Date() },
          under: { odds: -110, line: Math.floor(45 + Math.random() * 15) + 0.5, lastUpdated: new Date() }
        }
      }
    });
  }
  
  return games;
};

// Mock sports data
export const mockSports: Sport[] = [
  {
    id: 'nfl',
    name: 'NFL',
    icon: '',
    leagues: [
      {
        id: 'nfl-regular',
        name: 'NFL Regular Season',
        sportId: 'nfl',
        games: generateGames('nfl-regular', ['chiefs', 'bills', 'dolphins', 'ravens'])
      }
    ]
  },
  {
    id: 'nba',
    name: 'NBA',
    icon: '',
    leagues: [
      {
        id: 'nba-regular',
        name: 'NBA Regular Season',
        sportId: 'nba',
        games: generateGames('nba-regular', ['lakers', 'celtics', 'warriors', 'nuggets'])
      }
    ]
  },
  {
    id: 'nhl',
    name: 'NHL',
    icon: '',
    leagues: [
      {
        id: 'nhl-regular',
        name: 'NHL Regular Season',
        sportId: 'nhl',
        games: generateGames('nhl-regular', ['rangers', 'bruins', 'panthers', 'oilers'])
      }
    ]
  }
];

// API simulation functions
export const getSports = async (): Promise<Sport[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSports;
};

export const getSport = async (sportId: string): Promise<Sport | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockSports.find(sport => sport.id === sportId);
};

export const getLeague = async (leagueId: string): Promise<League | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  for (const sport of mockSports) {
    const league = sport.leagues.find(l => l.id === leagueId);
    if (league) return league;
  }
  return undefined;
};

export const getGame = async (gameId: string): Promise<Game | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  for (const sport of mockSports) {
    for (const league of sport.leagues) {
      const game = league.games.find(g => g.id === gameId);
      if (game) return game;
    }
  }
  return undefined;
};

// Helper function to calculate odds
export const calculatePayout = (stake: number, odds: number): number => {
  if (odds > 0) {
    return stake * (odds / 100);
  } else {
    return stake * (100 / Math.abs(odds));
  }
};

// Pagination interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Paginate games for infinite scroll
export const getGamesPaginated = async (
  leagueId: string,
  page = 1,
  pageSize = 5
): Promise<PaginatedResponse<Game>> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  
  const league = await getLeague(leagueId);
  if (!league) {
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  // Simulate more games by duplicating and modifying existing games
  const baseGames = league.games;
  const extendedGames: Game[] = [];
  
  // Create 50 total games by cycling through base games
  for (let i = 0; i < 50; i++) {
    const baseGame = baseGames[i % baseGames.length];
    const gameDate = new Date();
    gameDate.setDate(gameDate.getDate() + Math.floor(i / baseGames.length));
    
    extendedGames.push({
      ...baseGame,
      id: `${baseGame.id}-extended-${i}`,
      startTime: gameDate,
      status: i < 10 ? 'finished' : i < 15 ? 'live' : 'upcoming'
    });
  }

  const total = extendedGames.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const data = extendedGames.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

// Get game by ID - enhanced version that works with extended games
export const getGameById = async (gameId: string): Promise<Game | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // First try to find in base games
  for (const sport of mockSports) {
    for (const league of sport.leagues) {
      const game = league.games.find(g => g.id === gameId);
      if (game) return game;
    }
  }
  
  // If not found, might be an extended game - reconstruct it
  if (gameId.includes('-extended-')) {
    const [baseId, , indexStr] = gameId.split('-extended-');
    const index = parseInt(indexStr);
    
    for (const sport of mockSports) {
      for (const league of sport.leagues) {
        const baseGame = league.games.find(g => g.id.startsWith(baseId));
        if (baseGame) {
          const gameDate = new Date();
          gameDate.setDate(gameDate.getDate() + Math.floor(index / league.games.length));
          
          return {
            ...baseGame,
            id: gameId,
            startTime: gameDate,
            status: index < 10 ? 'finished' : index < 15 ? 'live' : 'upcoming'
          };
        }
      }
    }
  }
  
  return null;
};

// Player props interface
export interface PlayerProp {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  category: 'passing' | 'rushing' | 'receiving' | 'scoring' | 'defense';
  statType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  team: 'home' | 'away';
}

// Generate mock player props
const generatePlayerProps = (gameId: string): PlayerProp[] => {
  const props: PlayerProp[] = [];
  
  // Mock players and their stats
  const mockPlayers = [
    { name: 'Patrick Mahomes', position: 'QB', team: 'home', categories: ['passing', 'rushing'] },
    { name: 'Josh Allen', position: 'QB', team: 'away', categories: ['passing', 'rushing'] },
    { name: 'Travis Kelce', position: 'TE', team: 'home', categories: ['receiving'] },
    { name: 'Stefon Diggs', position: 'WR', team: 'away', categories: ['receiving'] },
    { name: 'Clyde Edwards-Helaire', position: 'RB', team: 'home', categories: ['rushing', 'receiving'] },
    { name: 'James Cook', position: 'RB', team: 'away', categories: ['rushing', 'receiving'] }
  ];

  const passingStats = ['Passing Yards', 'TD Passes', 'Completions', 'Attempts'];
  const rushingStats = ['Rushing Yards', 'Rushing TDs', 'Rush Attempts'];
  const receivingStats = ['Receiving Yards', 'Receptions', 'Receiving TDs'];

  mockPlayers.forEach((player, playerIndex) => {
    player.categories.forEach(category => {
      let stats: string[] = [];
      switch (category) {
        case 'passing':
          stats = passingStats;
          break;
        case 'rushing':
          stats = rushingStats;
          break;
        case 'receiving':
          stats = receivingStats;
          break;
      }

      stats.forEach((stat, statIndex) => {
        let line = 0;
        switch (stat) {
          case 'Passing Yards':
            line = 250 + Math.floor(Math.random() * 100);
            break;
          case 'TD Passes':
            line = 1.5 + Math.floor(Math.random() * 2);
            break;
          case 'Completions':
            line = 20.5 + Math.floor(Math.random() * 10);
            break;
          case 'Attempts':
            line = 30.5 + Math.floor(Math.random() * 15);
            break;
          case 'Rushing Yards':
            line = player.position === 'QB' ? 35.5 + Math.floor(Math.random() * 20) : 75.5 + Math.floor(Math.random() * 40);
            break;
          case 'Rushing TDs':
            line = 0.5;
            break;
          case 'Rush Attempts':
            line = player.position === 'QB' ? 5.5 + Math.floor(Math.random() * 3) : 15.5 + Math.floor(Math.random() * 8);
            break;
          case 'Receiving Yards':
            line = 65.5 + Math.floor(Math.random() * 60);
            break;
          case 'Receptions':
            line = 5.5 + Math.floor(Math.random() * 4);
            break;
          case 'Receiving TDs':
            line = 0.5;
            break;
        }

        props.push({
          id: `${gameId}-prop-${playerIndex}-${statIndex}`,
          playerId: `player-${playerIndex}`,
          playerName: player.name,
          position: player.position,
          category: category as any,
          statType: stat,
          line,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          team: player.team as 'home' | 'away'
        });
      });
    });
  });

  return props;
};

// Get player props for a game
export const getPlayerProps = async (gameId: string): Promise<PlayerProp[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return generatePlayerProps(gameId);
};