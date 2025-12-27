import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchClubInfo } from '@/lib/ea-sports';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = params.id;
    
    console.log(`👥 Récupération des joueurs pour le club ${clubId}...`);
    
    // Récupérer le club depuis la base
    const club = await prisma.leagueClub.findUnique({
      where: { id: clubId }
    });
    
    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`⚽ Club trouvé: ${club.name} (${club.eaClubId})`);
    
    // Récupérer les joueurs de la base de données
    const dbPlayers = await prisma.player.findMany({
      where: { clubId: club.id },
      orderBy: [
        { goals: 'desc' },
        { assists: 'desc' },
        { averageRating: 'desc' }
      ]
    });
    
    console.log(`📊 ${dbPlayers.length} joueurs trouvés en base pour ${club.name}`);
    
    // Récupérer les infos depuis l'API EA Sports pour avoir les joueurs actuels
    let eaClubInfo;
    try {
      eaClubInfo = await fetchClubInfo(club.eaClubId, club.platform);
      console.log(`✅ Infos EA Sports récupérées pour ${club.name}`);
    } catch (error) {
      console.error('❌ Erreur récupération EA Sports:', error);
      // Continuer avec juste les données de la base
      eaClubInfo = null;
    }
    
    // Formater les joueurs de la base avec les infos EA Sports si disponibles
    const formattedPlayers = dbPlayers.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      number: player.number,
      eaPlayerId: player.eaPlayerId,
      
      // Stats de saison
      matchesPlayed: player.matchesPlayed,
      minutesPlayed: player.minutesPlayed,
      
      // Stats offensives
      goals: player.goals,
      assists: player.assists,
      shots: player.shots,
      shotsOnTarget: player.shotsOnTarget,
      dribbles: player.dribbles,
      crosses: player.crosses,
      
      // Stats défensives
      tackles: player.tackles,
      interceptions: player.interceptions,
      clearances: player.clearances,
      aerialDuelsWon: player.aerialDuelsWon,
      foulsCommitted: player.foulsCommitted,
      
      // Stats gardien
      saves: player.saves,
      goalsConceded: player.goalsConceded,
      cleanSheets: player.cleanSheets,
      catches: player.catches,
      penaltiesSaved: player.penaltiesSaved,
      
      // Récompenses & discipline
      averageRating: player.averageRating,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
      manOfTheMatch: player.manOfTheMatch,
      
      // Métadonnées
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    }));
    
    // Ajouter les infos EA Sports si disponibles
    let eaPlayersInfo = null;
    // Note: La récupération des membres EA Sports nécessiterait un appel API séparé
    // L'objet eaClubInfo ne contient que les infos de base du club
    
    // Pour l'instant, nous n'avons que les infos de base du club depuis EA Sports
    // Dans une version future, on pourrait utiliser un autre endpoint pour récupérer les membres
    console.log('ℹ️ Récupération des membres EA Sports non implémentée pour ce endpoint');
    
    return NextResponse.json({
      success: true,
      data: {
        club: {
          id: club.id,
          name: club.name,
          eaClubId: club.eaClubId,
          platform: club.platform,
          active: club.active
        },
        players: formattedPlayers,
        eaMembers: eaPlayersInfo,
        stats: {
          totalPlayers: formattedPlayers.length,
          totalGoals: formattedPlayers.reduce((sum, p) => sum + p.goals, 0),
          totalAssists: formattedPlayers.reduce((sum, p) => sum + p.assists, 0),
          totalMatches: Math.max(...formattedPlayers.map(p => p.matchesPlayed), 0),
          avgRating: formattedPlayers.length > 0 
            ? formattedPlayers.reduce((sum, p) => sum + p.averageRating, 0) / formattedPlayers.length 
            : 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération joueurs club:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des joueurs du club',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
