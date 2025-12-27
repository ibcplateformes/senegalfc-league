// 🔥 IMPLÉMENTATION RÉELLE EA SPORTS API
const { EAFCApiService } = require('eafc-clubs-api');

export interface ClubMatchData {
  id?: string;
  matchId?: string;
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  date: Date;
  result: 'win' | 'draw' | 'loss';
  competition?: string;
  myScore?: number;
  opponentScore?: number;
}

export interface ClubInfoData {
  id: string;
  name: string;
  platform: string;
  teamId?: number;
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

let apiInstance: any = null;

function getEAAPI() {
  if (!apiInstance) {
    apiInstance = new EAFCApiService();
  }
  return apiInstance;
}

function mapPlatform(platform: string): string {
  const PLATFORM_MAP: { [key: string]: string } = {
    'ps5': 'common-gen5',
    'ps4': 'common-gen4', 
    'xboxseriesxs': 'common-gen5',
    'xboxone': 'common-gen4',
    'pc': 'common-gen5',
  };
  return PLATFORM_MAP[platform.toLowerCase()] || 'common-gen5';
}

export async function fetchClubInfo(clubId: string, platform: string): Promise<ClubInfoData | null> {
  console.log(`🔍 [EA-API] Récupération infos club: ${clubId} (${platform})`);
  
  try {
    const api = getEAAPI();
    const mappedPlatform = mapPlatform(platform);
    
    const response = await api.clubInfo({
      clubIds: clubId,
      platform: mappedPlatform
    });
    
    const clubInfo = response[clubId];
    
    if (!clubInfo) {
      return null;
    }
    
    console.log(`✅ [EA-API] Club trouvé: "${clubInfo.name}"`);
    
    return {
      id: clubInfo.clubId.toString(),
      name: clubInfo.name,
      platform: platform,
      teamId: clubInfo.teamId
    };
    
  } catch (error: any) {
    console.error(`❌ [EA-API] Erreur récupération club ${clubId}:`, error.message);
    return null;
  }
}

export async function fetchClubMatches(clubId: string, platform: string, limit: number = 10): Promise<ClubMatchData[]> {
  console.log(`⚽ [EA-API] Récupération matchs club: ${clubId} (${platform})`);
  
  try {
    const api = getEAAPI();
    const mappedPlatform = mapPlatform(platform);
    
    const matches = await api.matchesStats({
      clubIds: clubId,
      platform: mappedPlatform,
      matchType: 'leagueMatch'
    });
    
    if (!Array.isArray(matches) || matches.length === 0) {
      return [];
    }
    
    const convertedMatches: ClubMatchData[] = matches.slice(0, limit).map((match: any) => {
      const clubIds = Object.keys(match.clubs || {});
      const opponentId = clubIds.find(id => id !== clubId);
      
      if (!opponentId) {
        return null;
      }

      const myClub = match.clubs[clubId];
      const opponentClub = match.clubs[opponentId];

      const scoreFor = parseInt(myClub?.goals || '0');
      const scoreAgainst = parseInt(opponentClub?.goals || '0');

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
        myScore: scoreFor,
        opponentScore: scoreAgainst,
        result,
        date: new Date(match.timestamp * 1000),
        competition: 'League'
      };
    }).filter(Boolean) as ClubMatchData[];

    console.log(`✅ [EA-API] ${convertedMatches.length} matchs convertis avec succès`);
    return convertedMatches;

  } catch (error: any) {
    console.error(`❌ [EA-API] Erreur récupération matchs ${clubId}:`, error.message);
    return [];
  }
}

export async function fetchPlayerStats(clubId: string, platform: string): Promise<EAPlayerStatsData[]> {
  console.log(`👥 [EA-API] Récupération stats joueurs club: ${clubId}`);
  
  try {
    const api = getEAAPI();
    const mappedPlatform = mapPlatform(platform);
    
    const memberStats = await api.memberCareerStats({
      clubId: clubId,
      platform: mappedPlatform
    });
    
    if (!memberStats || !memberStats.members) {
      return [];
    }
    
    const players: EAPlayerStatsData[] = Object.values(memberStats.members).map((member: any, index: number) => {
      return {
        playerId: member.playerId || index.toString(),
        playerName: member.name || 'Joueur inconnu',
        position: member.favoritePosition || 'UNK',
        matchesPlayed: parseInt(member.gamesPlayed || '0'),
        minutesPlayed: 0,
        averageRating: parseFloat(member.ratingAve || '0'),
        goals: parseInt(member.goals || '0'),
        assists: parseInt(member.assists || '0'),
        shots: 0, shotsOnTarget: 0, shotAccuracy: 0, dribbles: 0, dribbleSuccess: 0,
        crosses: 0, crossAccuracy: 0, corners: 0, freekicks: 0, penalties: 0,
        penaltiesScored: 0, tackles: 0, tackleSuccess: 0, interceptions: 0,
        clearances: 0, blocks: 0, aerialDuelsWon: 0, aerialDuelsTotal: 0,
        foulsCommitted: 0, foulsWon: 0, saves: 0, goalsConceded: 0, cleanSheets: 0,
        catches: 0, punches: 0, distributions: 0, distributionSuccess: 0,
        penaltiesSaved: 0, penaltiesFaced: 0, distanceRun: 0, topSpeed: 0,
        sprints: 0, yellowCards: 0, redCards: 0,
        manOfTheMatch: parseInt(member.manOfTheMatch || '0'),
        passesCompleted: 0, passesAttempted: 0, passAccuracy: 0, longPasses: 0,
        longPassAccuracy: 0, throughBalls: 0, keyPasses: 0, form: 0,
        consistency: 0, clutchGoals: 0
      };
    });
    
    console.log(`✅ [EA-API] ${players.length} joueurs convertis avec succès`);
    return players;
    
  } catch (error: any) {
    console.error(`❌ [EA-API] Erreur récupération stats joueurs:`, error.message);
    return [];
  }
}

export async function fetchCompleteClubStats(clubId: string, platform: string): Promise<EAClubCompleteData | null> {
  try {
    const clubInfo = await fetchClubInfo(clubId, platform);
    if (!clubInfo) return null;

    const recentMatches = await fetchClubMatches(clubId, platform, 10);
    const players = await fetchPlayerStats(clubId, platform);

    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    
    recentMatches.forEach(match => {
      if (match.result === 'win') wins++;
      else if (match.result === 'draw') draws++;
      else if (match.result === 'loss') losses++;
      
      goalsFor += match.scoreFor;
      goalsAgainst += match.scoreAgainst;
    });

    return {
      clubId: clubInfo.id,
      clubName: clubInfo.name,
      platform: platform,
      division: 'Ligue Sénégalaise',
      rank: 1,
      points: (wins * 3) + draws,
      wins, draws, losses, goalsFor, goalsAgainst,
      players,
      recentMatches,
      lastUpdated: new Date(),
      seasonYear: '2025'
    };
  } catch (error: any) {
    console.error(`❌ [EA-API] Erreur récupération complète:`, error.message);
    return null;
  }
}

export function findInterClubMatch(
  club1Matches: ClubMatchData[], 
  club2Matches: ClubMatchData[],
  club1Name: string,
  club2Name: string
): ClubMatchData | null {
  
  for (const match of club1Matches) {
    const opponentName = match.opponent.toLowerCase().trim();
    const searchName = club2Name.toLowerCase().trim();
    
    if (opponentName === searchName || 
        opponentName.includes(searchName) || 
        searchName.includes(opponentName)) {
      return match;
    }
  }
  
  return null;
}

export async function validateClub(clubId: string, platform: string): Promise<boolean> {
  const clubInfo = await fetchClubInfo(clubId, platform);
  return clubInfo !== null;
}
