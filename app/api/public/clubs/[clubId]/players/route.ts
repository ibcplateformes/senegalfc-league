import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const clubId = params.clubId;
    
    console.log(`👥 Récupération des joueurs du club ${clubId}`);
    
    // Vérifier que le club existe
    const club = await prisma.leagueClub.findUnique({
      where: { id: clubId }
    });
    
    if (!club) {
      return NextResponse.json({
        success: false,
        error: 'Club introuvable'
      }, { status: 404 });
    }
    
    // Récupérer les joueurs du club avec leurs stats
    const players = await prisma.player.findMany({
      where: { 
        clubId: clubId
      },
      orderBy: [
        { position: 'asc' }, // GK, DEF, MID, ATT
        { goals: 'desc' } // Puis par buts
      ],
      include: {
        matchStats: {
          where: {
            match: { validated: true }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // 5 derniers matchs
        }
      }
    });
    
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      number: player.number,
      
      // Stats de saison
      matchesPlayed: player.matchesPlayed,
      minutesPlayed: player.minutesPlayed,
      averageRating: player.averageRating,
      
      // Stats offensives
      goals: player.goals,
      assists: player.assists,
      shots: player.shots,
      shotsOnTarget: player.shotsOnTarget,
      
      // Stats défensives
      tackles: player.tackles,
      interceptions: player.interceptions,
      clearances: player.clearances,
      
      // Stats gardien
      saves: player.saves,
      goalsConceded: player.goalsConceded,
      cleanSheets: player.cleanSheets,
      
      // Divers
      yellowCards: player.yellowCards,
      redCards: player.redCards,
      manOfTheMatch: player.manOfTheMatch,
      
      // Derniers matchs
      recentMatches: player.matchStats.length
    }));
    
    // Grouper par position
    const playersByPosition = {
      GK: formattedPlayers.filter(p => p.position === 'GK'),
      DEF: formattedPlayers.filter(p => p.position === 'DEF'),
      MID: formattedPlayers.filter(p => p.position === 'MID'),
      ATT: formattedPlayers.filter(p => p.position === 'ATT')
    };
    
    console.log(`✅ ${formattedPlayers.length} joueurs récupérés pour ${club.name}`);
    
    return NextResponse.json({
      success: true,
      data: {
        club: {
          id: club.id,
          name: club.name,
          eaClubId: club.eaClubId
        },
        players: formattedPlayers,
        playersByPosition,
        stats: {
          totalPlayers: formattedPlayers.length,
          goalkeepers: playersByPosition.GK.length,
          defenders: playersByPosition.DEF.length,
          midfielders: playersByPosition.MID.length,
          attackers: playersByPosition.ATT.length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération joueurs du club:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des joueurs',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}