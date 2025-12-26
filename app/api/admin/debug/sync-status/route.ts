import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 === DIAGNOSTIC SYNCHRONISATION JOUEURS ===');
    
    // 1. Vérifier les matchs validés
    const validatedMatches = await prisma.leagueMatch.findMany({
      where: { validated: true },
      include: {
        homeClub: true,
        awayClub: true
      },
      orderBy: { playedAt: 'desc' }
    });
    
    console.log(`📊 ${validatedMatches.length} matchs validés trouvés`);
    
    // 2. Vérifier les joueurs existants
    const totalPlayers = await prisma.player.count();
    console.log(`👥 ${totalPlayers} joueurs en base`);
    
    // 3. Vérifier les stats de match des joueurs
    const matchStats = await prisma.playerMatchStats.count();
    console.log(`📈 ${matchStats} entrées de stats de match`);
    
    // 4. Détails des matchs validés
    const matchDetails = validatedMatches.map(match => ({
      id: match.id,
      homeClub: match.homeClub.name,
      awayClub: match.awayClub.name,
      score: `${match.homeScore}-${match.awayScore}`,
      eaMatchId: match.eaMatchId,
      hasEaMatchId: !!match.eaMatchId,
      playedAt: match.playedAt
    }));
    
    // 5. Vérifier les clubs et leurs IDs EA
    const clubs = await prisma.leagueClub.findMany({
      where: { active: true }
    });
    
    const clubDetails = clubs.map(club => ({
      name: club.name,
      eaClubId: club.eaClubId,
      platform: club.platform
    }));
    
    return NextResponse.json({
      success: true,
      diagnostic: {
        validatedMatches: validatedMatches.length,
        totalPlayers,
        matchStats,
        matchDetails,
        clubDetails,
        summary: {
          hasValidatedMatches: validatedMatches.length > 0,
          hasPlayers: totalPlayers > 0,
          hasMatchStats: matchStats > 0,
          allMatchesHaveEaId: validatedMatches.every(m => m.eaMatchId)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du diagnostic',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
