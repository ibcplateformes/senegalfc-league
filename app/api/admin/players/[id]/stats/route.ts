import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    
    console.log(`📊 Récupération stats détaillées joueur: ${playerId}`);
    
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            eaClubId: true
          }
        }
      }
    });
    
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Joueur non trouvé' },
        { status: 404 }
      );
    }
    
    // Formater toutes les statistiques disponibles
    const detailedStats = {
      // Infos générales
      id: player.id,
      name: player.name,
      position: player.position,
      number: player.number,
      eaPlayerId: player.eaPlayerId,
      
      // Club
      club: {
        name: player.club.name,
        eaClubId: player.club.eaClubId
      },
      
      // Stats générales
      matchesPlayed: player.matchesPlayed || 0,
      minutesPlayed: player.minutesPlayed || 0,
      averageRating: player.averageRating || 0,
      
      // Stats offensives
      goals: player.goals || 0,
      assists: player.assists || 0,
      shots: player.shots || 0,
      shotsOnTarget: player.shotsOnTarget || 0,
      dribbles: player.dribbles || 0,
      crosses: player.crosses || 0,
      corners: 0, // Non défini dans Prisma
      freekicks: 0, // Non défini dans Prisma
      penalties: 0, // Non défini dans Prisma
      penaltiesScored: 0, // Non défini dans Prisma
      
      // Stats défensives
      tackles: player.tackles || 0,
      interceptions: player.interceptions || 0,
      clearances: player.clearances || 0,
      aerialDuelsWon: player.aerialDuelsWon || 0,
      foulsCommitted: player.foulsCommitted || 0,
      foulsWon: 0, // Non défini dans Prisma
      
      // Stats gardien
      saves: player.saves || 0,
      goalsConceded: player.goalsConceded || 0,
      cleanSheets: player.cleanSheets || 0,
      catches: player.catches || 0,
      penaltiesSaved: player.penaltiesSaved || 0,
      penaltiesFaced: 0, // Non défini dans Prisma
      
      // Cartons et récompenses
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
      manOfTheMatch: player.manOfTheMatch || 0,
      
      // Stats de passes
      passesCompleted: 0, // Non défini dans Prisma
      passesAttempted: 0, // Non défini dans Prisma
      longPasses: 0, // Non défini dans Prisma
      throughBalls: 0, // Non défini dans Prisma
      keyPasses: 0, // Non défini dans Prisma
      
      // Stats physiques
      distanceRun: 0, // Non défini dans Prisma
      topSpeed: 0, // Non défini dans Prisma
      sprints: 0, // Non défini dans Prisma
      
      // Stats de performance
      form: 0, // Non défini dans Prisma
      consistency: 0, // Non défini dans Prisma
      clutchGoals: 0 // Non défini dans Prisma
    };
    
    console.log(`✅ Stats détaillées récupérées pour ${player.name}`);
    
    return NextResponse.json({
      success: true,
      data: detailedStats
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération stats joueur:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
