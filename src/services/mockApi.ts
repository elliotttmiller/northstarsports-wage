import { Sport, League, Game, Team, PlayerProp, PropCategory } from '@/types';

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
  try {
    const games: Game[] = [];
    const now = new Date();
    
    // Ensure we have a valid date
    if (isNaN(now.getTime())) {
      console.error('Invalid date in generateGames');
      return [];
    }
    
    for (let i = 0; i < 8; i++) {
      const gameDate = new Date(now.getTime() + (i - 2) * 24 * 60 * 60 * 1000);
      
      // Validate the generated date
      if (isNaN(gameDate.getTime())) {
        console.error('Invalid game date generated for index', i);
        continue;
      }
      
      const homeTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
      let awayTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
      while (awayTeamId === homeTeamId) {
        awayTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
      }
      
      const status = i < 2 ? 'finished' : i === 2 ? 'live' : 'upcoming';
      
      const currentTime = new Date();
      
      const venues = [
        'MetLife Stadium', 'Lambeau Field', 'AT&T Stadium', 'Arrowhead Stadium',
        'Soldier Field', 'Gillette Stadium', 'M&T Bank Stadium', 'Hard Rock Stadium',
        'Crypto.com Arena', 'TD Garden', 'Chase Center', 'Ball Arena',
        'Madison Square Garden', 'TD Garden', 'FLA Live Arena', 'Rogers Place'
      ];
      
      games.push({
        id: `${leagueId}-game-${i}`,
        leagueId,
        homeTeam: teams[homeTeamId],
        awayTeam: teams[awayTeamId],
        startTime: gameDate,
        status,
        venue: venues[Math.floor(Math.random() * venues.length)],
        odds: {
          spread: {
            home: { odds: -110, line: Math.random() > 0.5 ? -3.5 : 3.5, lastUpdated: currentTime },
            away: { odds: -110, line: Math.random() > 0.5 ? 3.5 : -3.5, lastUpdated: currentTime }
          },
          moneyline: {
            home: { odds: Math.floor(Math.random() * 200) - 200, lastUpdated: currentTime },
            away: { odds: Math.floor(Math.random() * 200) + 100, lastUpdated: currentTime }
          },
          total: {
            home: { odds: -110, lastUpdated: currentTime },
            away: { odds: -110, lastUpdated: currentTime },
            over: { odds: -110, line: Math.floor(45 + Math.random() * 15) + 0.5, lastUpdated: currentTime },
            under: { odds: -110, line: Math.floor(45 + Math.random() * 15) + 0.5, lastUpdated: currentTime }
          }
        }
      });
    }
    
    return games;
  } catch (error) {
    console.error('Error generating games:', error);
    return [];
  }
};

// Mock sports data with error handling for dates
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
].map(sport => ({
  ...sport,
  leagues: sport.leagues.map(league => ({
    ...league,
    games: league.games.filter(game => game && game.startTime instanceof Date && !isNaN(game.startTime.getTime()))
  }))
}));

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
    
    // Validate base date
    if (isNaN(gameDate.getTime())) {
      console.error('Invalid base date in pagination');
      continue;
    }
    
    gameDate.setDate(gameDate.getDate() + Math.floor(i / baseGames.length));
    
    // Validate modified date
    if (isNaN(gameDate.getTime())) {
      console.error('Invalid modified date in pagination for index', i);
      continue;
    }
    
    extendedGames.push({
      ...baseGame,
      id: `${baseGame.id}-extended-${i}`,
      startTime: gameDate,
      status: i < 10 ? 'finished' : i < 15 ? 'live' : 'upcoming',
      venue: baseGame.venue || 'TBD'
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
          
          // Validate base date
          if (isNaN(gameDate.getTime())) {
            console.error('Invalid base date in game reconstruction');
            return null;
          }
          
          gameDate.setDate(gameDate.getDate() + Math.floor(index / league.games.length));
          
          // Validate modified date
          if (isNaN(gameDate.getTime())) {
            console.error('Invalid modified date in game reconstruction');
            return null;
          }
          
          return {
            ...baseGame,
            id: gameId,
            startTime: gameDate,
            status: index < 10 ? 'finished' : index < 15 ? 'live' : 'upcoming',
            venue: baseGame.venue || 'TBD'
          };
        }
      }
    }
  }
  
  return null;
};

// Generate mock player props
const generatePlayerProps = (gameId: string): PlayerProp[] => {
  const props: PlayerProp[] = [];
  
  // Mock players and their stats
  const mockPlayers = [
    { name: 'Patrick Mahomes', position: 'QB', team: 'home', categories: ['passing', 'rushing', 'scoring'] },
    { name: 'Josh Allen', position: 'QB', team: 'away', categories: ['passing', 'rushing', 'scoring'] },
    { name: 'Travis Kelce', position: 'TE', team: 'home', categories: ['receiving', 'scoring'] },
    { name: 'Stefon Diggs', position: 'WR', team: 'away', categories: ['receiving', 'scoring'] },
    { name: 'Clyde Edwards-Helaire', position: 'RB', team: 'home', categories: ['rushing', 'receiving', 'scoring'] },
    { name: 'James Cook', position: 'RB', team: 'away', categories: ['rushing', 'receiving', 'scoring'] },
    { name: 'Harrison Butker', position: 'K', team: 'home', categories: ['kicking'] },
    { name: 'Tyler Bass', position: 'K', team: 'away', categories: ['kicking'] }
  ];

  const statsByCategory = {
    passing: [
      { name: 'Passing Yards', baseRange: [250, 350] },
      { name: 'TD Passes', baseRange: [1.5, 3.5] },
      { name: 'Completions', baseRange: [20.5, 30.5] },
      { name: 'Pass Attempts', baseRange: [30.5, 45.5] },
      { name: 'Longest Completion', baseRange: [25.5, 45.5] },
      { name: 'Interceptions', baseRange: [0.5, 1.5] }
    ],
    rushing: [
      { name: 'Rushing Yards', baseRange: [35.5, 95.5] },
      { name: 'Rush Attempts', baseRange: [15.5, 23.5] },
      { name: 'Rushing TDs', baseRange: [0.5, 1.5] },
      { name: 'Longest Rush', baseRange: [12.5, 25.5] },
      { name: 'Rushing 1st Downs', baseRange: [3.5, 8.5] }
    ],
    receiving: [
      { name: 'Receiving Yards', baseRange: [65.5, 125.5] },
      { name: 'Receptions', baseRange: [5.5, 9.5] },
      { name: 'Receiving TDs', baseRange: [0.5, 1.5] },
      { name: 'Longest Reception', baseRange: [18.5, 35.5] },
      { name: 'Receiving 1st Downs', baseRange: [3.5, 6.5] }
    ],
    scoring: [
      { name: 'Anytime TD', baseRange: [0.5, 0.5] },
      { name: 'First TD', baseRange: [0.5, 0.5] },
      { name: 'Last TD', baseRange: [0.5, 0.5] },
      { name: 'Total TDs', baseRange: [0.5, 2.5] }
    ],
    kicking: [
      { name: 'Field Goals Made', baseRange: [1.5, 3.5] },
      { name: 'Extra Points Made', baseRange: [2.5, 4.5] },
      { name: 'Longest Field Goal', baseRange: [42.5, 52.5] },
      { name: 'Total Kicking Points', baseRange: [7.5, 12.5] }
    ]
  };

  mockPlayers.forEach((player, playerIndex) => {
    player.categories.forEach(category => {
      const categoryStats = statsByCategory[category as keyof typeof statsByCategory];
      
      categoryStats.forEach((stat, statIndex) => {
        let line = stat.baseRange[0] + Math.random() * (stat.baseRange[1] - stat.baseRange[0]);
        
        // Adjust line based on position for certain stats
        if (stat.name === 'Rushing Yards' && player.position === 'QB') {
          line = 35.5 + Math.random() * 20;
        }
        if (stat.name === 'Rush Attempts' && player.position === 'QB') {
          line = 5.5 + Math.random() * 3;
        }

        // Round to appropriate decimal places
        if (stat.name.includes('TD') || stat.name.includes('Attempts') || stat.name.includes('Completions') || stat.name.includes('Receptions')) {
          line = Math.round(line * 2) / 2; // Round to nearest 0.5
        } else {
          line = Math.round(line * 2) / 2; // Round to nearest 0.5
        }

        props.push({
          id: `${gameId}-prop-${playerIndex}-${statIndex}`,
          playerId: `player-${playerIndex}`,
          playerName: player.name,
          position: player.position,
          category: category as any,
          statType: stat.name,
          line,
          overOdds: -110 + Math.floor(Math.random() * 40) - 20,
          underOdds: -110 + Math.floor(Math.random() * 40) - 20,
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

// Get categorized player props for a game
export const getCategorizedPlayerProps = async (gameId: string): Promise<PropCategory[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const allProps = generatePlayerProps(gameId);
  
  // Group props by category
  const categoryMap: Record<string, PlayerProp[]> = {};
  
  allProps.forEach(prop => {
    if (!categoryMap[prop.category]) {
      categoryMap[prop.category] = [];
    }
    categoryMap[prop.category].push(prop);
  });
  
  // Create category objects with friendly names
  const categories: PropCategory[] = [];
  
  const categoryNames = {
    passing: 'Passing',
    rushing: 'Rushing', 
    receiving: 'Receiving',
    scoring: 'Scoring',
    kicking: 'Kicking',
    defense: 'Defense'
  };
  
  Object.entries(categoryMap).forEach(([key, props]) => {
    categories.push({
      name: categoryNames[key as keyof typeof categoryNames] || key,
      key,
      props: props.sort((a, b) => a.playerName.localeCompare(b.playerName))
    });
  });
  
  // Sort categories by priority
  const categoryOrder = ['passing', 'rushing', 'receiving', 'scoring', 'kicking', 'defense'];
  categories.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.key);
    const bIndex = categoryOrder.indexOf(b.key);
    return aIndex - bIndex;
  });
  
  return categories;
};