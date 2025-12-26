import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchClubMatchDetails } from '@/lib/ea-sports';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    
    console.log(`🔄 Synchronisation des stats joueurs pour le match ${matchId}...`);
    
    // Récupérer le match validé
    const match = await prisma.leagueMatch.findUnique({
      where: { id: matchId, validated: true },
      include: {
        homeClub: true,
        awayClub: true
      }
    });
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match non trouvé ou non validé' },
        { status: 404 }
      );
    }
    
    console.log(`⚽ Match trouvé: ${match.homeClub.name} vs ${match.awayClub.name}`);
    
    if (!match.eaMatchId) {
      return NextResponse.json(
        { success: false, error: 'Pas d\'ID EA Sports pour ce match' },
        { status: 400 }
      );
    }
    
    // Récupérer les détails du match depuis l'API EA Sports
    let matchDetails;
    try {
      matchDetails = await fetchClubMatchDetails(match.eaMatchId, match.homeClub.platform);
      console.log(`✅ Détails du match récupérés depuis EA Sports`);
    } catch (error) {
      console.error('❌ Erreur récupération détails match:', error);
      return NextResponse.json(
        { success: false, error: 'Impossible de récupérer les détails du match depuis EA Sports' },
        { status: 500 }
      );
    }
    
    let playersUpdated = 0;
    let playersCreated = 0;
    
    // Traiter les joueurs des deux clubs
    const clubs = [
      { dbClub: match.homeClub, eaClubId: match.homeClub.eaClubId },
      { dbClub: match.awayClub, eaClubId: match.awayClub.eaClubId }
    ];
    
    for (const { dbClub, eaClubId } of clubs) {
      if (!matchDetails.players?.[eaClubId]) {
        console.log(`⚠️  Pas de données joueurs pour ${dbClub.name} (${eaClubId})`);
        continue;
      }
      
      const clubPlayers = matchDetails.players[eaClubId];
      console.log(`👥 ${Object.keys(clubPlayers).length} joueurs trouvés pour ${dbClub.name}`);
      
      for (const [eaPlayerId, playerStats] of Object.entries(clubPlayers)) {
        const stats: any = playerStats;
        
        // Chercher ou créer le joueur
        let player = await prisma.player.findFirst({
          where: {
            OR: [
              { eaPlayerId: eaPlayerId },
              { 
                name: stats.playername || stats.name,
                clubId: dbClub.id 
              }
            ]
          }
        });
        
        const playerData = {
          name: stats.playername || stats.name || `Joueur ${eaPlayerId}`,
          position: stats.position || 'ATT',
          eaPlayerId: eaPlayerId,
          clubId: dbClub.id,
          
          // Mise à jour des stats cumulées
          matchesPlayed: { increment: 1 },
          goals: { increment: stats.goals || 0 },
          assists: { increment: stats.assists || 0 },
          shots: { increment: stats.shots || 0 },
          shotsOnTarget: { increment: stats.shotsontarget || 0 },
          dribbles: { increment: stats.dribbles || 0 },
          crosses: { increment: stats.crosses || 0 },
          tackles: { increment: stats.tackles || 0 },
          interceptions: { increment: stats.interceptions || 0 },
          clearances: { increment: stats.clearances || 0 },
          aerialDuelsWon: { increment: stats.aerialduelsWon || 0 },
          foulsCommitted: { increment: stats.foulscommitted || 0 },
          saves: { increment: stats.saves || 0 },
          goalsConceded: { increment: stats.goalsconceded || 0 },
          cleanSheets: { increment: (stats.goalsconceded === 0 && stats.position === 'GK') ? 1 : 0 },
          catches: { increment: stats.catches || 0 },
          penaltiesSaved: { increment: stats.penaltiesSaved || 0 },
          yellowCards: { increment: stats.redcards === 1 ? 1 : 0 },
          redCards: { increment: stats.redcards === 2 ? 1 : 0 },
          manOfTheMatch: { increment: stats.mom ? 1 : 0 },
          
          // Recalculer la moyenne des notes
          averageRating: stats.rating ? {
            set: player 
              ? (player.averageRating * player.matchesPlayed + stats.rating) / (player.matchesPlayed + 1)
              : stats.rating
          } : undefined
        };
        
        if (player) {
          await prisma.player.update({
            where: { id: player.id },
            data: playerData
          });
          playersUpdated++;
          console.log(`📝 Stats mises à jour pour ${stats.playername}`);
        } else {
          // Convertir les increments en valeurs directes pour la création
          const createData = {
            ...playerData,
            matchesPlayed: 1,
            goals: stats.goals || 0,
            assists: stats.assists || 0,
            shots: stats.shots || 0,
            shotsOnTarget: stats.shotsontarget || 0,
            dribbles: stats.dribbles || 0,
            crosses: stats.crosses || 0,
            tackles: stats.tackles || 0,
            interceptions: stats.interceptions || 0,
            clearances: stats.clearances || 0,
            aerialDuelsWon: stats.aerialduelsWon || 0,
            foulsCommitted: stats.foulscommitted || 0,
            saves: stats.saves || 0,
            goalsConceded: stats.goalsconceded || 0,
            cleanSheets: (stats.goalsconceded === 0 && stats.position === 'GK') ? 1 : 0,
            catches: stats.catches || 0,
            penaltiesSaved: stats.penaltiesSaved || 0,
            yellowCards: stats.redcards === 1 ? 1 : 0,
            redCards: stats.redcards === 2 ? 1 : 0,
            manOfTheMatch: stats.mom ? 1 : 0,
            averageRating: stats.rating || 0
          };
          
          player = await prisma.player.create({
            data: createData
          });
          playersCreated++;
          console.log(`✨ Nouveau joueur créé: ${stats.playername}`);
        }
        
        // Créer l'entrée des stats du match
        await prisma.playerMatchStats.create({
          data: {
            playerId: player.id,
            matchId: match.id,
            minutesPlayed: stats.minutesplayed || 90,
            rating: stats.rating || null,
            starter: true, // Assumé pour le moment
            goals: stats.goals || 0,
            assists: stats.assists || 0,
            shots: stats.shots || 0,
            shotsOnTarget: stats.shotsontarget || 0,
            dribbles: stats.dribbles || 0,
            crosses: stats.crosses || 0,
            tackles: stats.tackles || 0,
            interceptions: stats.interceptions || 0,
            clearances: stats.clearances || 0,
            aerialDuelsWon: stats.aerialduelsWon || 0,
            foulsCommitted: stats.foulscommitted || 0,
            saves: stats.saves || 0,
            goalsConceded: stats.goalsconceded || 0,
            cleanSheet: stats.goalsconceded === 0 && stats.position === 'GK',
            catches: stats.catches || 0,
            yellowCard: stats.redcards === 1,
            redCard: stats.redcards === 2,
            manOfTheMatch: stats.mom || false
          }
        });
      }
    }
    
    console.log(`🏁 Synchronisation terminée: ${playersCreated} créés, ${playersUpdated} mis à jour`);
    
    return NextResponse.json({
      success: true,
      message: `Stats synchronisées ! ${playersCreated} joueurs créés, ${playersUpdated} mis à jour.`,
      data: {
        playersCreated,
        playersUpdated,
        matchId: match.id
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation stats joueurs:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la synchronisation des stats joueurs',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
