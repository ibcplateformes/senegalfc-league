import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchClubMatchDetails } from '@/lib/ea-sports';

export const dynamic = 'force-dynamic';

export async function POST() {
  console.log('🚀 === SYNCHRONISATION COMPLÈTE DES STATS JOUEURS ===');
  
  try {
    // Récupérer tous les matchs validés avec EA Match ID
    const matchesWithEaId = await prisma.leagueMatch.findMany({
      where: { 
        validated: true,
        eaMatchId: { not: null }
      },
      include: {
        homeClub: true,
        awayClub: true
      },
      orderBy: { playedAt: 'desc' }
    });
    
    if (matchesWithEaId.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Aucun match validé avec EA Match ID trouvé ! Exécutez d\'abord le script de récupération des EA Match IDs.',
        data: { processed: 0, playersCreated: 0, playersUpdated: 0 }
      });
    }
    
    console.log(`📋 ${matchesWithEaId.length} matchs avec EA Match ID à traiter`);
    
    let totalPlayersCreated = 0;
    let totalPlayersUpdated = 0;
    let matchesProcessed = 0;
    const results = [];
    
    for (const match of matchesWithEaId) {
      try {
        console.log(`⚽ Synchronisation: ${match.homeClub.name} vs ${match.awayClub.name}`);
        console.log(`🆔 EA Match ID: ${match.eaMatchId}`);
        
        // Vérifier si les stats de ce match ont déjà été synchronisées
        const existingStats = await prisma.playerMatchStats.count({
          where: { matchId: match.id }
        });
        
        if (existingStats > 0) {
          console.log(`ℹ️ Match déjà synchronisé (${existingStats} stats), passage au suivant`);
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'already_synced',
            existingStats
          });
          continue;
        }
        
        // Récupérer les détails du match depuis l'API EA Sports
        let matchDetails;
        try {
          matchDetails = await fetchClubMatchDetails(match.eaMatchId, match.homeClub.platform);
          console.log(`✅ Détails du match récupérés depuis EA Sports`);
        } catch (error) {
          console.error(`❌ Erreur récupération détails match:`, error);
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'error',
            error: `Impossible de récupérer les détails: ${error}`
          });
          continue;
        }
        
        let playersCreated = 0;
        let playersUpdated = 0;
        
        // Traiter les joueurs des deux clubs
        const clubs = [
          { dbClub: match.homeClub, eaClubId: match.homeClub.eaClubId },
          { dbClub: match.awayClub, eaClubId: match.awayClub.eaClubId }
        ];
        
        for (const { dbClub, eaClubId } of clubs) {
          if (!matchDetails.players?.[eaClubId]) {
            console.log(`⚠️ Pas de données joueurs pour ${dbClub.name} (${eaClubId})`);
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
            
            if (player) {
              // Mise à jour des stats cumulées
              await prisma.player.update({
                where: { id: player.id },
                data: {
                  eaPlayerId: eaPlayerId,
                  name: stats.playername || stats.name || player.name,
                  position: stats.position || player.position,
                  
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
                    set: (player.averageRating * player.matchesPlayed + stats.rating) / (player.matchesPlayed + 1)
                  } : undefined
                }
              });
              playersUpdated++;
              console.log(`📝 Stats mises à jour pour ${stats.playername || stats.name}`);
            } else {
              // Créer un nouveau joueur
              player = await prisma.player.create({
                data: {
                  name: stats.playername || stats.name || `Joueur ${eaPlayerId}`,
                  position: stats.position || 'ATT',
                  eaPlayerId: eaPlayerId,
                  clubId: dbClub.id,
                  
                  // Stats initiales
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
                }
              });
              playersCreated++;
              console.log(`✨ Nouveau joueur créé: ${stats.playername || stats.name}`);
            }
            
            // Créer l'entrée des stats du match
            await prisma.playerMatchStats.create({
              data: {
                playerId: player.id,
                matchId: match.id,
                minutesPlayed: stats.minutesplayed || 90,
                rating: stats.rating || null,
                starter: true,
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
        
        totalPlayersCreated += playersCreated;
        totalPlayersUpdated += playersUpdated;
        matchesProcessed++;
        
        console.log(`🏁 Match synchronisé: ${playersCreated} créés, ${playersUpdated} mis à jour`);
        
        results.push({
          matchId: match.id,
          homeClub: match.homeClub.name,
          awayClub: match.awayClub.name,
          eaMatchId: match.eaMatchId,
          status: 'synced',
          playersCreated,
          playersUpdated
        });
        
      } catch (error) {
        console.error(`❌ Erreur pour le match ${match.id}:`, error);
        
        results.push({
          matchId: match.id,
          homeClub: match.homeClub.name,
          awayClub: match.awayClub.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    console.log(`🏁 Synchronisation terminée: ${matchesProcessed} matchs traités`);
    console.log(`👥 Total joueurs: ${totalPlayersCreated} créés, ${totalPlayersUpdated} mis à jour`);
    
    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée ! ${matchesProcessed} matchs traités, ${totalPlayersCreated} joueurs créés, ${totalPlayersUpdated} mis à jour.`,
      data: {
        processed: matchesProcessed,
        total: matchesWithEaId.length,
        playersCreated: totalPlayersCreated,
        playersUpdated: totalPlayersUpdated,
        results
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation complète:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la synchronisation complète des stats joueurs',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
