import prisma from './prisma';

export interface ClubRanking {
  id: string;
  name: string;
  position: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  matchesPlayed: number;
}

/**
 * Calcule les statistiques d'un club basé sur ses matchs
 */
export async function calculateClubStats(clubId: string) {
  const homeMatches = await prisma.leagueMatch.findMany({
    where: { homeClubId: clubId, validated: true }
  });
  
  const awayMatches = await prisma.leagueMatch.findMany({
    where: { awayClubId: clubId, validated: true }
  });
  
  let points = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  
  // Configuration des points (peut être modifiée en base)
  const config = await prisma.leagueConfig.findFirst() || {
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0
  };
  
  // Calcul pour les matchs à domicile
  for (const match of homeMatches) {
    goalsFor += match.homeScore;
    goalsAgainst += match.awayScore;
    
    if (match.homeScore > match.awayScore) {
      wins++;
      points += config.pointsWin;
    } else if (match.homeScore === match.awayScore) {
      draws++;
      points += config.pointsDraw;
    } else {
      losses++;
      points += config.pointsLoss;
    }
  }
  
  // Calcul pour les matchs à l'extérieur
  for (const match of awayMatches) {
    goalsFor += match.awayScore;
    goalsAgainst += match.homeScore;
    
    if (match.awayScore > match.homeScore) {
      wins++;
      points += config.pointsWin;
    } else if (match.awayScore === match.homeScore) {
      draws++;
      points += config.pointsDraw;
    } else {
      losses++;
      points += config.pointsLoss;
    }
  }
  
  return {
    points,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    matchesPlayed: homeMatches.length + awayMatches.length
  };
}

/**
 * Met à jour les statistiques d'un club en base
 */
export async function updateClubStats(clubId: string) {
  const stats = await calculateClubStats(clubId);
  
  await prisma.leagueClub.update({
    where: { id: clubId },
    data: stats
  });
  
  return stats;
}

/**
 * Recalcule les statistiques de tous les clubs
 */
export async function recalculateAllStats() {
  console.log('🔄 Recalcul des statistiques de tous les clubs...');
  
  const clubs = await prisma.leagueClub.findMany({
    where: { active: true }
  });
  
  const updatedClubs = [];
  
  for (const club of clubs) {
    const stats = await updateClubStats(club.id);
    updatedClubs.push({
      clubId: club.id,
      clubName: club.name,
      stats
    });
  }
  
  console.log(`✅ ${updatedClubs.length} clubs mis à jour`);
  return updatedClubs;
}

/**
 * Récupère le classement complet de la ligue
 */
export async function getLeagueRanking(): Promise<ClubRanking[]> {
  const clubs = await prisma.leagueClub.findMany({
    where: { active: true },
    orderBy: [
      { points: 'desc' },
      { goalsFor: 'desc' }, // En cas d'égalité, différence de buts puis buts marqués
      { goalsAgainst: 'asc' }
    ]
  });
  
  return clubs.map((club, index) => ({
    id: club.id,
    name: club.name,
    position: index + 1,
    points: club.points,
    wins: club.wins,
    draws: club.draws,
    losses: club.losses,
    goalsFor: club.goalsFor,
    goalsAgainst: club.goalsAgainst,
    goalDifference: club.goalsFor - club.goalsAgainst,
    matchesPlayed: club.wins + club.draws + club.losses
  }));
}

/**
 * Ajoute des points bonus/malus à un club (action admin)
 */
export async function adjustClubPoints(clubId: string, adjustment: number, reason: string) {
  const club = await prisma.leagueClub.findUnique({
    where: { id: clubId }
  });
  
  if (!club) {
    throw new Error('Club non trouvé');
  }
  
  const newPoints = Math.max(0, club.points + adjustment); // Ne pas descendre en dessous de 0
  
  await prisma.leagueClub.update({
    where: { id: clubId },
    data: { points: newPoints }
  });
  
  // Log de l'ajustement (pour traçabilité)
  console.log(`⚖️ Ajustement de points: ${club.name} ${adjustment > 0 ? '+' : ''}${adjustment} points (${reason})`);
  
  return { oldPoints: club.points, newPoints, adjustment, reason };
}

/**
 * Statistiques générales de la ligue
 */
export async function getLeagueStats() {
  const totalClubs = await prisma.leagueClub.count({ where: { active: true } });
  const totalMatches = await prisma.leagueMatch.count({ where: { validated: true } });
  const pendingMatches = await prisma.leagueMatch.count({ where: { validated: false } });
  
  const lastMatch = await prisma.leagueMatch.findFirst({
    where: { validated: true },
    orderBy: { playedAt: 'desc' },
    include: {
      homeClub: true,
      awayClub: true
    }
  });
  
  const topScorer = await prisma.leagueClub.findFirst({
    where: { active: true },
    orderBy: { goalsFor: 'desc' }
  });
  
  return {
    totalClubs,
    totalMatches,
    pendingMatches,
    lastMatch: lastMatch ? {
      homeTeam: lastMatch.homeClub.name,
      awayTeam: lastMatch.awayClub.name,
      score: `${lastMatch.homeScore}-${lastMatch.awayScore}`,
      date: lastMatch.playedAt
    } : null,
    topScorer: topScorer ? {
      name: topScorer.name,
      goals: topScorer.goalsFor
    } : null
  };
}