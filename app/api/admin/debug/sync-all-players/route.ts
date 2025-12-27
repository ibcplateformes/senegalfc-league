import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const { EAFCApiService } = require('eafc-clubs-api');

// Mapping des plateformes
const PLATFORM_MAP: { [key: string]: string } = {
  'ps5': 'common-gen5',
  'ps4': 'common-gen4', 
  'xboxseriesxs': 'common-gen5',
  'xboxone': 'common-gen4',
  'pc': 'common-gen5',
};

// Mapping des positions EA Sports vers nos positions
const POSITION_MAP: { [key: string]: string } = {
  'forward': 'ATT',
  'midfielder': 'MIL', 
  'defender': 'DEF',
  'goalkeeper': 'GK'
};

export async function POST() {
  console.log('🚀 === SYNCHRONISATION COMPLÈTE AVEC VRAIE LIBRAIRIE ===');
  
  try {
    const api = new EAFCApiService();
    
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
        
        // Vérifier que le match a un EA Match ID (sécurité TypeScript)
        if (!match.eaMatchId) {
          console.log(`⚠️ Match sans EA Match ID, passage au suivant: ${match.homeClub.name} vs ${match.awayClub.name}`);
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'error',
            error: 'EA Match ID manquant'
          });
          continue;
        }
        
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
        
        // Récupérer les détails du match depuis l'API EA Sports avec la vraie librairie
        let eaMatches;
        const homeClubPlatform = PLATFORM_MAP[match.homeClub.platform] || 'common-gen5';
        
        try {
          // Chercher le match par son EA Match ID
          eaMatches = await api.matchesStats({
            clubIds: match.homeClub.eaClubId,
            platform: homeClubPlatform,
            matchType: 'leagueMatch'
          });
          
          console.log(`✅ ${eaMatches?.length || 0} matchs récupérés depuis EA Sports`);
        } catch (error) {
          console.error(`❌ Erreur récupération matchs EA Sports:`, error);
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'error',
            error: `Impossible de récupérer les matchs: ${error}`
          });
          continue;
        }
        
        // Trouver le match correspondant par EA Match ID
        const matchDetails = eaMatches?.find(eaMatch => eaMatch.matchId === match.eaMatchId);
        
        if (!matchDetails) {
          console.log(`❌ Match EA avec ID ${match.eaMatchId} non trouvé`);
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'error',
            error: `Match EA Sports non trouvé (ID: ${match.eaMatchId})`
          });
          continue;
        }
        
        console.log(`🎯 Match EA trouvé ! Traitement des joueurs...`);
        
        let playersCreated = 0;
        let playersUpdated = 0;
        
        // Traiter les joueurs des deux clubs
        if (!matchDetails.players) {
          console.log(`⚠️ Pas de données joueurs dans ce match`);
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'error',
            error: 'Aucune donnée joueur trouvée'
          });
          continue;
        }
        
        const clubs = [
          { dbClub: match.homeClub, eaClubId: match.homeClub.eaClubId },
          { dbClub: match.awayClub, eaClubId: match.awayClub.eaClubId }
        ];
        
        for (const { dbClub, eaClubId } of clubs) {
          if (!matchDetails.players[eaClubId]) {
            console.log(`⚠️ Pas de données joueurs pour ${dbClub.name} (${eaClubId})`);
            continue;
          }
          
          const clubPlayers = matchDetails.players[eaClubId];
          console.log(`👥 ${Object.keys(clubPlayers).length} joueurs trouvés pour ${dbClub.name}`);
          
          for (const [eaPlayerId, playerStats] of Object.entries(clubPlayers)) {
            const stats: any = playerStats;
            
            console.log(`🔍 Traitement joueur: ${stats.playername || 'Nom inconnu'} (${eaPlayerId})`);
            
            // Chercher ou créer le joueur
            let player = await prisma.player.findFirst({
              where: {
                OR: [
                  { eaPlayerId: eaPlayerId },
                  { 
                    name: stats.playername,
                    clubId: dbClub.id 
                  }
                ]
              }
            });
            
            const mappedPosition = POSITION_MAP[stats.pos] || 'ATT';
            
            // Convertir les stats string en numbers avec fallback
            const parseStatSafe = (value: any, defaultValue: number = 0): number => {
              if (value === null || value === undefined || value === '') return defaultValue;
              const parsed = parseInt(String(value));
              return isNaN(parsed) ? defaultValue : parsed;
            };
            
            const parseFloatSafe = (value: any, defaultValue: number = 0): number => {
              if (value === null || value === undefined || value === '') return defaultValue;
              const parsed = parseFloat(String(value));
              return isNaN(parsed) ? defaultValue : parsed;
            };
            
            // Extraction sécurisée de toutes les stats
            const playerMatchData = {
              goals: parseStatSafe(stats.goals),
              assists: parseStatSafe(stats.assists),
              shots: parseStatSafe(stats.shots),
              rating: parseFloatSafe(stats.rating),
              position: mappedPosition,
              minutesPlayed: parseStatSafe(stats.secondsPlayed || stats.gameTime, 90 * 60) / 60, // Conversion secondes -> minutes
              
              // Stats de passe
              passAttempts: parseStatSafe(stats.passattempts),
              passCompleted: parseStatSafe(stats.passesmade),
              
              // Stats défensives
              tackles: parseStatSafe(stats.tackleattempts),
              tacklesWon: parseStatSafe(stats.tacklesmade),
              interceptions: parseStatSafe(stats.interceptions),
              clearances: parseStatSafe(stats.clearances),
              
              // Stats gardien
              saves: parseStatSafe(stats.saves),
              goalsConceded: parseStatSafe(stats.goalsconceded),
              cleanSheet: parseStatSafe(stats.goalsconceded) === 0 && mappedPosition === 'GK',
              catches: parseStatSafe(stats.catches),
              
              // Cartons et autres
              yellowCards: parseStatSafe(stats.redcards) === 1 ? 1 : 0, // redcards=1 = jaune
              redCards: parseStatSafe(stats.redcards) === 2 ? 1 : 0,    // redcards=2 = rouge
              manOfTheMatch: parseStatSafe(stats.mom) === 1,
              
              // Stats supplémentaires disponibles
              foulsCommitted: parseStatSafe(stats.foulscommitted || stats.foulsCommitted),
              aerialDuelsWon: parseStatSafe(stats.aerialduelsWon || stats.aerialDuelsWon),
              dribbles: parseStatSafe(stats.dribbles),
              crosses: parseStatSafe(stats.crosses)
            };
            
            if (player) {
              // Mise à jour des stats cumulées
              const newMatchesPlayed = player.matchesPlayed + 1;
              const newAverageRating = player.averageRating > 0 && playerMatchData.rating > 0 ? 
                (player.averageRating * player.matchesPlayed + playerMatchData.rating) / newMatchesPlayed :
                playerMatchData.rating || player.averageRating;
              
              await prisma.player.update({
                where: { id: player.id },
                data: {
                  eaPlayerId: eaPlayerId,
                  name: stats.playername || player.name,
                  position: mappedPosition,
                  
                  // Mise à jour des stats cumulées
                  matchesPlayed: newMatchesPlayed,
                  goals: { increment: playerMatchData.goals },
                  assists: { increment: playerMatchData.assists },
                  shots: { increment: playerMatchData.shots },
                  shotsOnTarget: { increment: parseStatSafe(stats.shotsontarget) },
                  dribbles: { increment: playerMatchData.dribbles },
                  crosses: { increment: playerMatchData.crosses },
                  tackles: { increment: playerMatchData.tackles },
                  interceptions: { increment: parseStatSafe(stats.interceptions) },
                  clearances: { increment: parseStatSafe(stats.clearances) },
                  aerialDuelsWon: { increment: playerMatchData.aerialDuelsWon },
                  foulsCommitted: { increment: playerMatchData.foulsCommitted },
                  saves: { increment: playerMatchData.saves },
                  goalsConceded: { increment: playerMatchData.goalsConceded },
                  cleanSheets: { increment: playerMatchData.cleanSheet ? 1 : 0 },
                  catches: { increment: parseStatSafe(stats.catches) },
                  penaltiesSaved: { increment: parseStatSafe(stats.penaltiesSaved) },
                  yellowCards: { increment: playerMatchData.yellowCards },
                  redCards: { increment: playerMatchData.redCards },
                  manOfTheMatch: { increment: playerMatchData.manOfTheMatch ? 1 : 0 },
                  
                  // Recalculer la moyenne des notes
                  averageRating: newAverageRating
                }
              });
              playersUpdated++;
              console.log(`📝 Stats mises à jour pour ${stats.playername}`);
            } else {
              // Créer un nouveau joueur
              player = await prisma.player.create({
                data: {
                  name: stats.playername || `Joueur ${eaPlayerId}`,
                  position: mappedPosition,
                  eaPlayerId: eaPlayerId,
                  clubId: dbClub.id,
                  
                  // Stats initiales
                  matchesPlayed: 1,
                  goals: playerMatchData.goals,
                  assists: playerMatchData.assists,
                  shots: playerMatchData.shots,
                  shotsOnTarget: parseStatSafe(stats.shotsontarget),
                  dribbles: playerMatchData.dribbles,
                  crosses: playerMatchData.crosses,
                  tackles: playerMatchData.tackles,
                  interceptions: parseStatSafe(stats.interceptions),
                  clearances: parseStatSafe(stats.clearances),
                  aerialDuelsWon: playerMatchData.aerialDuelsWon,
                  foulsCommitted: playerMatchData.foulsCommitted,
                  saves: playerMatchData.saves,
                  goalsConceded: playerMatchData.goalsConceded,
                  cleanSheets: playerMatchData.cleanSheet ? 1 : 0,
                  catches: parseStatSafe(stats.catches),
                  penaltiesSaved: parseStatSafe(stats.penaltiesSaved),
                  yellowCards: playerMatchData.yellowCards,
                  redCards: playerMatchData.redCards,
                  manOfTheMatch: playerMatchData.manOfTheMatch ? 1 : 0,
                  averageRating: playerMatchData.rating || 0
                }
              });
              playersCreated++;
              console.log(`✨ Nouveau joueur créé: ${stats.playername}`);
            }
            
            // Créer l'entrée des stats du match avec TOUTES les données
            await prisma.playerMatchStats.create({
              data: {
                playerId: player.id,
                matchId: match.id,
                minutesPlayed: Math.round(playerMatchData.minutesPlayed),
                rating: playerMatchData.rating,
                starter: true, // On assume que tous les joueurs avec stats sont titulaires
                goals: playerMatchData.goals,
                assists: playerMatchData.assists,
                shots: playerMatchData.shots,
                shotsOnTarget: parseStatSafe(stats.shotsontarget),
                dribbles: playerMatchData.dribbles,
                crosses: playerMatchData.crosses,
                tackles: playerMatchData.tackles,
                interceptions: parseStatSafe(stats.interceptions),
                clearances: parseStatSafe(stats.clearances),
                aerialDuelsWon: playerMatchData.aerialDuelsWon,
                foulsCommitted: playerMatchData.foulsCommitted,
                saves: playerMatchData.saves,
                goalsConceded: playerMatchData.goalsConceded,
                cleanSheet: playerMatchData.cleanSheet,
                catches: parseStatSafe(stats.catches),
                yellowCard: playerMatchData.yellowCards > 0,
                redCard: playerMatchData.redCards > 0,
                manOfTheMatch: playerMatchData.manOfTheMatch
              }
            });
            
            console.log(`📊 Stats du match enregistrées pour ${stats.playername}`);
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