import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchClubMatchDetails } from '@/lib/ea-sports';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { matchId } = await request.json();
    
    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'Match ID requis' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 === TEST SYNCHRONISATION MATCH ${matchId} ===`);
    
    // Récupérer le match
    const match = await prisma.leagueMatch.findUnique({
      where: { id: matchId },
      include: {
        homeClub: true,
        awayClub: true
      }
    });
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`⚽ Match: ${match.homeClub.name} ${match.homeScore}-${match.awayScore} ${match.awayClub.name}`);
    console.log(`📅 Date: ${match.playedAt}`);
    console.log(`🆔 EA Match ID: ${match.eaMatchId || 'MANQUANT'}`);
    console.log(`✅ Validé: ${match.validated}`);
    
    if (!match.eaMatchId) {
      return NextResponse.json({
        success: false,
        error: 'Pas d\'ID EA Sports pour ce match',
        debug: {
          matchId: match.id,
          eaMatchId: match.eaMatchId,
          homeClub: match.homeClub.name,
          awayClub: match.awayClub.name
        }
      });
    }
    
    // Tester l'appel à l'API EA Sports
    console.log(`📡 Test appel API EA Sports...`);
    let matchDetails;
    
    try {
      matchDetails = await fetchClubMatchDetails(match.eaMatchId, match.homeClub.platform);
      console.log(`✅ Réponse API EA Sports reçue`);
      
      // Analyser les données reçues
      console.log('📊 Analyse des données:');
      console.log(`- Match ID: ${matchDetails.matchId || 'N/A'}`);
      console.log(`- Clubs disponibles: ${matchDetails.clubs ? Object.keys(matchDetails.clubs).length : 0}`);
      console.log(`- Joueurs disponibles: ${matchDetails.players ? 'OUI' : 'NON'}`);
      
      if (matchDetails.players) {
        const playersByClub = Object.keys(matchDetails.players);
        console.log(`- Clubs avec joueurs: ${playersByClub.join(', ')}`);
        
        for (const clubId of playersByClub) {
          const clubPlayers = matchDetails.players[clubId];
          const playerCount = Object.keys(clubPlayers).length;
          console.log(`  - Club ${clubId}: ${playerCount} joueurs`);
          
          if (playerCount > 0) {
            const firstPlayerId = Object.keys(clubPlayers)[0];
            const firstPlayer = clubPlayers[firstPlayerId];
            console.log(`    Exemple joueur: ${firstPlayer.playername || firstPlayer.name || firstPlayerId}`);
            console.log(`    Stats disponibles: goals=${firstPlayer.goals}, assists=${firstPlayer.assists}, position=${firstPlayer.position}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur API EA Sports:', error);
      
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'appel à l\'API EA Sports',
        debug: {
          matchId: match.id,
          eaMatchId: match.eaMatchId,
          platform: match.homeClub.platform,
          errorMessage: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      });
    }
    
    // Compter les joueurs existants pour ce match
    const existingPlayerStats = await prisma.playerMatchStats.count({
      where: { matchId: match.id }
    });
    
    console.log(`👥 Stats joueurs existantes pour ce match: ${existingPlayerStats}`);
    
    return NextResponse.json({
      success: true,
      message: 'Test réussi - API EA Sports accessible',
      debug: {
        match: {
          id: match.id,
          homeClub: match.homeClub.name,
          awayClub: match.awayClub.name,
          score: `${match.homeScore}-${match.awayScore}`,
          eaMatchId: match.eaMatchId,
          platform: match.homeClub.platform,
          validated: match.validated
        },
        eaApiResponse: {
          hasClubs: !!matchDetails?.clubs,
          hasPlayers: !!matchDetails?.players,
          clubsWithPlayers: matchDetails?.players ? Object.keys(matchDetails.players) : [],
          totalPlayersFound: matchDetails?.players ? 
            Object.values(matchDetails.players).reduce((sum: number, players: any) => 
              sum + Object.keys(players).length, 0
            ) : 0
        },
        existingPlayerStats
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test sync:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du test de synchronisation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
