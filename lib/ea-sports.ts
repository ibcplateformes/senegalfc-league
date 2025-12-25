import { EAFCClubs } from 'eafc-clubs-api';

export interface ClubMatchData {
  id?: string;
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  date: Date;
  result: 'win' | 'draw' | 'loss';
  competition?: string;
}

export interface ClubInfoData {
  id: string;
  name: string;
  platform: string;
}

/**
 * Récupère les informations d'un club EA Sports
 */
export async function fetchClubInfo(clubId: string, platform: string): Promise<ClubInfoData | null> {
  try {
    console.log(`🔍 Récupération infos club EA: ${clubId} (${platform})`);
    
    const eafc = new EAFCClubs();
    const clubData = await eafc.getClubInfo(clubId, platform);
    
    if (!clubData) {
      console.log(`❌ Club non trouvé: ${clubId}`);
      return null;
    }
    
    return {
      id: clubData.clubId || clubId,
      name: clubData.name || 'Club inconnu',
      platform: platform
    };
  } catch (error) {
    console.error(`❌ Erreur récupération club ${clubId}:`, error);
    return null;
  }
}

/**
 * Récupère les derniers matchs d'un club EA Sports
 */
export async function fetchClubMatches(clubId: string, platform: string, limit: number = 10): Promise<ClubMatchData[]> {
  try {
    console.log(`⚽ Récupération matchs club EA: ${clubId} (${platform}) - ${limit} derniers`);
    
    const eafc = new EAFCClubs();
    const matchesData = await eafc.getClubMatches(clubId, platform, { limit });
    
    if (!matchesData || !Array.isArray(matchesData)) {
      console.log(`❌ Aucun match trouvé pour: ${clubId}`);
      return [];
    }
    
    const matches: ClubMatchData[] = matchesData.map((match: any) => {
      const scoreFor = match.clubs?.[clubId]?.score || match.scoreFor || 0;
      const scoreAgainst = match.clubs ? 
        Object.values(match.clubs).find((club: any) => club.clubId !== clubId)?.score || 0 :
        match.scoreAgainst || 0;
      
      let result: 'win' | 'draw' | 'loss' = 'loss';
      if (scoreFor > scoreAgainst) result = 'win';
      else if (scoreFor === scoreAgainst) result = 'draw';
      
      return {
        id: match.matchId || match.id,
        opponent: match.opponent || 'Adversaire inconnu',
        scoreFor,
        scoreAgainst,
        date: new Date(match.timestamp || match.date || Date.now()),
        result,
        competition: match.competition || 'Amical'
      };
    });
    
    console.log(`✅ ${matches.length} matchs récupérés pour ${clubId}`);
    return matches;
  } catch (error) {
    console.error(`❌ Erreur récupération matchs ${clubId}:`, error);
    return [];
  }
}

/**
 * Détermine si deux clubs se sont affrontés récemment
 */
export function findInterClubMatch(
  club1Matches: ClubMatchData[], 
  club2Matches: ClubMatchData[],
  club1Name: string,
  club2Name: string
): ClubMatchData | null {
  
  // Chercher dans les matchs du club 1 si l'adversaire correspond au club 2
  for (const match of club1Matches) {
    if (
      match.opponent.toLowerCase().includes(club2Name.toLowerCase()) ||
      club2Name.toLowerCase().includes(match.opponent.toLowerCase())
    ) {
      return match;
    }
  }
  
  // Chercher dans les matchs du club 2 si l'adversaire correspond au club 1
  for (const match of club2Matches) {
    if (
      match.opponent.toLowerCase().includes(club1Name.toLowerCase()) ||
      club1Name.toLowerCase().includes(match.opponent.toLowerCase())
    ) {
      // Inverser les scores car on regarde du point de vue du club 2
      return {
        ...match,
        scoreFor: match.scoreAgainst,
        scoreAgainst: match.scoreFor,
        result: match.result === 'win' ? 'loss' : match.result === 'loss' ? 'win' : 'draw'
      };
    }
  }
  
  return null;
}

/**
 * Vérifie si un club existe et est accessible via l'API EA
 */
export async function validateClub(clubId: string, platform: string): Promise<boolean> {
  const clubInfo = await fetchClubInfo(clubId, platform);
  return clubInfo !== null;
}