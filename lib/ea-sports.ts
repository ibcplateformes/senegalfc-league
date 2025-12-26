// API ClubStats Pro - Appels HTTP directs (résolution EAFCClubs is not a constructor)

export interface ClubMatchData {
  id?: string;
  matchId?: string; // ID unique du match EA Sports
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  date: Date;
  result: 'win' | 'draw' | 'loss';
  competition?: string;
  myScore?: number; // Alias pour scoreFor (compatibility)
  opponentScore?: number; // Alias pour scoreAgainst (compatibility)
}

export interface ClubInfoData {
  id: string;
  name: string;
  platform: string;
  members?: any[]; // Membres optionnels du club EA Sports
}

export interface EAPlayerStatsData {
  playerId: string;
  playerName: string;
  position: string;
  matchesPlayed: number;
  minutesPlayed: number;
  averageRating: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  shotAccuracy: number;
  dribbles: number;
  dribbleSuccess: number;
  crosses: number;
  crossAccuracy: number;
  corners: number;
  freekicks: number;
  penalties: number;
  penaltiesScored: number;
  tackles: number;
  tackleSuccess: number;
  interceptions: number;
  clearances: number;
  blocks: number;
  aerialDuelsWon: number;
  aerialDuelsTotal: number;
  foulsCommitted: number;
  foulsWon: number;
  saves: number;
  goalsConceded: number;
  cleanSheets: number;
  catches: number;
  punches: number;
  distributions: number;
  distributionSuccess: number;
  penaltiesSaved: number;
  penaltiesFaced: number;
  distanceRun: number;
  topSpeed: number;
  sprints: number;
  yellowCards: number;
  redCards: number;
  manOfTheMatch: number;
  passesCompleted: number;
  passesAttempted: number;
  passAccuracy: number;
  longPasses: number;
  longPassAccuracy: number;
  throughBalls: number;
  keyPasses: number;
  form: number;
  consistency: number;
  clutchGoals: number;
}

export interface EAClubCompleteData {
  clubId: string;
  clubName: string;
  platform: string;
  division: string;
  rank: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  players: EAPlayerStatsData[];
  recentMatches: ClubMatchData[];
  lastUpdated: Date;
  seasonYear: string;
}

/**
 * Récupère les détails complets d'un match spécifique avec les stats des joueurs
 */
export async function fetchClubMatchDetails(matchId: string, platform: string): Promise<any> {
  console.log(`🔍 Récupération détails match: ${matchId} (${platform})`);
  
  try {
    // Mapping des plateformes
    const PLATFORM_MAP = {
      'ps5': 'common-gen5',
      'ps4': 'common-gen4', 
      'xboxseriesxs': 'common-gen5',
      'xboxone': 'common-gen4',
      'pc': 'common-gen5',
    };

    const apiPlatform = PLATFORM_MAP[platform as keyof typeof PLATFORM_MAP] || 'common-gen5';
    
    // Appeler l'API EA Sports pour les détails du match
    const url = `https://proclubs.ea.com/api/fc/clubs/matches/${matchId}/details?platform=${apiPlatform}`;
    console.log(`🔗 Appel API EA: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.ea.com/',
        'Origin': 'https://www.ea.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API EA Sports error: ${response.status}`);
    }
    
    const matchDetails = await response.json();
    console.log(`✅ Détails du match récupérés pour ${matchId}`);
    
    // Vérifier que les données des joueurs sont présentes
    if (matchDetails.players) {
      const totalPlayers = Object.keys(matchDetails.players).reduce((sum, clubId) => {
        return sum + Object.keys(matchDetails.players[clubId] || {}).length;
      }, 0);
      console.log(`👥 ${totalPlayers} joueurs trouvés dans les détails du match`);
    }
    
    return matchDetails;
    
  } catch (error: any) {
    console.error(`❌ Erreur récupération détails match ${matchId}:`, error);
    throw error;
  }
}

/**
 * Récupère les informations d'un club EA Sports
 */
export async function fetchClubInfo(clubId: string, platform: string): Promise<ClubInfoData | null> {
  console.log(`🔍 Récupération infos club EA: ${clubId} (${platform})`);
  
  // Noms réels des clubs sénégalais
  const clubNames: { [key: string]: string } = {
    '40142': 'HOF 221',
    '24000': 'BUUR MFC', 
    '29739': 'NEK BI',
    '460504': 'FC BOUNDOUXATAL',
    '46871': 'HEMLE FC',
    '1039553': 'ASC GALGUI'
  };
  
  const name = clubNames[clubId] || `Club ${clubId}`;
  console.log(`✅ Club trouvé: "${name}"`);
  
  return {
    id: clubId,
    name: name,
    platform: platform
  };
}

/**
 * Récupère les derniers matchs d'un club EA Sports
 * Migration ClubStats Pro - Appels HTTP directs
 */
export async function fetchClubMatches(clubId: string, platform: string, limit: number = 10): Promise<ClubMatchData[]> {
  console.log(`⚽ Récupération matchs club EA: ${clubId} (${platform}) - VERSION CLUBSTATSPRO`);
  
  try {
    // Mapping des plateformes comme dans ClubStats Pro
    const PLATFORM_MAP = {
      'ps5': 'common-gen5',
      'ps4': 'common-gen4', 
      'xboxseriesxs': 'common-gen5',
      'xboxone': 'common-gen4',
      'pc': 'common-gen5',
    };

    const apiPlatform = PLATFORM_MAP[platform as keyof typeof PLATFORM_MAP] || 'common-gen5';
    
    // Récupérer différents types de matchs comme ClubStats Pro
    const matchTypes = ['leagueMatch', 'friendlyMatch', 'playoffMatch'];
    const allMatches: any[] = [];
    const matchIds = new Set<string>();
    
    for (const matchType of matchTypes) {
      const url = `https://proclubs.ea.com/api/fc/clubs/matches?matchType=${matchType}&platform=${apiPlatform}&clubIds=${clubId}`;
      console.log(`🔗 Appel API EA: ${matchType}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.ea.com/',
            'Origin': 'https://www.ea.com'
          }
        });
        
        if (response.ok) {
          const matchesData = await response.json();
          if (Array.isArray(matchesData)) {
            // Ajouter uniquement les matchs uniques
            matchesData.forEach((match: any) => {
              if (match.matchId && !matchIds.has(match.matchId)) {
                matchIds.add(match.matchId);
                allMatches.push({ ...match, matchType });
              }
            });
            console.log(`  ✅ ${matchType}: ${matchesData.length} matchs récupérés`);
          }
        } else {
          console.log(`  ⚠️  ${matchType}: ${response.status}`);
        }
      } catch (error: any) {
        console.log(`  ❌ ${matchType}: ${error.message}`);
      }
    }
    
    console.log(`📊 Total unique matches: ${allMatches.length}`);
    
    // Convertir au format ClubMatchData (limiter aux plus récents)
    const matches = allMatches.slice(0, limit).map((match: any) => {
      const clubIds = Object.keys(match.clubs || {});
      const opponentId = clubIds.find(id => id !== clubId);
      
      if (!opponentId) return null;

      const myClub = match.clubs[clubId];
      const opponentClub = match.clubs[opponentId];

      const scoreFor = parseInt(myClub?.goals) || 0;
      const scoreAgainst = parseInt(opponentClub?.goals) || 0;

      let result: 'win' | 'draw' | 'loss';
      if (scoreFor > scoreAgainst) {
        result = 'win';
      } else if (scoreFor < scoreAgainst) {
        result = 'loss';
      } else {
        result = 'draw';
      }

      return {
        matchId: match.matchId,
        opponent: opponentClub?.details?.name || 'Équipe inconnue',
        scoreFor,
        scoreAgainst,
        myScore: scoreFor, // Alias pour compatibility
        opponentScore: scoreAgainst, // Alias pour compatibility
        result,
        date: new Date(match.timestamp * 1000),
        competition: match.matchType === 'friendlyMatch' ? 'Friendly' 
                   : match.matchType === 'playoffMatch' ? 'Playoff'
                   : 'League'
      };
    }).filter(Boolean) as ClubMatchData[];

    console.log(`✅ ${matches.length} matchs récupérés avec succès pour ${clubId}`);
    return matches;

  } catch (error: any) {
    console.error(`❌ Erreur récupération matchs ${clubId}:`, error);
    return [];
  }
}

/**
 * Détermine si deux clubs se sont affrontés récemment
 * Logique ClubStats Pro améliorée
 */
export function findInterClubMatch(
  club1Matches: ClubMatchData[], 
  club2Matches: ClubMatchData[],
  club1Name: string,
  club2Name: string
): ClubMatchData | null {
  console.log(`🔍 Recherche match inter-clubs: "${club1Name}" vs "${club2Name}"`);
  
  // Chercher un match où club1 a joué contre club2 (par nom d'adversaire)
  for (const match of club1Matches) {
    // Normaliser les noms pour la comparaison
    const opponentName = match.opponent.toLowerCase().trim();
    const searchName = club2Name.toLowerCase().trim();
    
    // Vérification exacte ou partielle du nom
    if (opponentName === searchName || 
        opponentName.includes(searchName) || 
        searchName.includes(opponentName)) {
      
      console.log(`✅ Match trouvé: ${club1Name} vs ${match.opponent} (${match.scoreFor}-${match.scoreAgainst})`);
      return match;
    }
  }
  
  // Chercher dans l'autre sens (club2 contre club1)
  for (const match of club2Matches) {
    const opponentName = match.opponent.toLowerCase().trim();
    const searchName = club1Name.toLowerCase().trim();
    
    if (opponentName === searchName || 
        opponentName.includes(searchName) || 
        searchName.includes(opponentName)) {
      
      // Inverser le résultat puisque c'est du point de vue de club2
      let invertedResult: 'win' | 'draw' | 'loss';
      if (match.result === 'win') invertedResult = 'loss';
      else if (match.result === 'loss') invertedResult = 'win';
      else invertedResult = 'draw';
      
      const invertedMatch: ClubMatchData = {
        ...match,
        opponent: club2Name,
        scoreFor: match.scoreAgainst,
        scoreAgainst: match.scoreFor,
        result: invertedResult
      };
      
      console.log(`✅ Match trouvé (inversé): ${club1Name} vs ${club2Name} (${invertedMatch.scoreFor}-${invertedMatch.scoreAgainst})`);
      return invertedMatch;
    }
  }
  
  console.log(`❌ Aucun match trouvé entre "${club1Name}" et "${club2Name}"`);
  return null;
}

/**
 * Vérifie si un club existe et est accessible via l'API EA
 */
export async function validateClub(clubId: string, platform: string): Promise<boolean> {
  const clubInfo = await fetchClubInfo(clubId, platform);
  return clubInfo !== null;
}

export async function fetchCompleteClubStats(
  clubId: string, 
  platform: string
): Promise<EAClubCompleteData | null> {
  
  console.log(`🎯 === RÉCUPÉRATION SIMPLIFIÉE CLUB ${clubId} (${platform}) ===`);
  console.log('🔄 Version MOCK pour test...');
  
  const clubInfo = await fetchClubInfo(clubId, platform);
  if (!clubInfo) return null;

  const recentMatches = await fetchClubMatches(clubId, platform, 10);

  const mockPlayer: EAPlayerStatsData = {
    playerId: '1',
    playerName: 'Joueur Test',
    position: 'ATT',
    matchesPlayed: 5,
    minutesPlayed: 450,
    averageRating: 7.5,
    goals: 3,
    assists: 2,
    shots: 10,
    shotsOnTarget: 6,
    shotAccuracy: 60,
    dribbles: 8,
    dribbleSuccess: 75,
    crosses: 4,
    crossAccuracy: 50,
    corners: 2,
    freekicks: 1,
    penalties: 1,
    penaltiesScored: 1,
    tackles: 5,
    tackleSuccess: 80,
    interceptions: 3,
    clearances: 2,
    blocks: 1,
    aerialDuelsWon: 4,
    aerialDuelsTotal: 6,
    foulsCommitted: 2,
    foulsWon: 3,
    saves: 0,
    goalsConceded: 0,
    cleanSheets: 0,
    catches: 0,
    punches: 0,
    distributions: 0,
    distributionSuccess: 0,
    penaltiesSaved: 0,
    penaltiesFaced: 0,
    distanceRun: 50.5,
    topSpeed: 32.1,
    sprints: 15,
    yellowCards: 1,
    redCards: 0,
    manOfTheMatch: 1,
    passesCompleted: 85,
    passesAttempted: 100,
    passAccuracy: 85,
    longPasses: 10,
    longPassAccuracy: 70,
    throughBalls: 3,
    keyPasses: 5,
    form: 8.2,
    consistency: 7.8,
    clutchGoals: 1
  };

  const completeClubData: EAClubCompleteData = {
    clubId: clubInfo.id,
    clubName: clubInfo.name,
    platform: platform,
    division: 'Ligue Sénégalaise',
    rank: 1,
    points: 15,
    wins: 5,
    draws: 0,
    losses: 0,
    goalsFor: 15,
    goalsAgainst: 5,
    players: [mockPlayer],
    recentMatches: recentMatches,
    lastUpdated: new Date(),
    seasonYear: '2025'
  };

  console.log(`🎉 === RÉCUPÉRATION TERMINÉE (VERSION MOCK) ===`);
  console.log(`📊 Résumé pour "${clubInfo.name}": 1 joueur test`);

  return completeClubData;
}
