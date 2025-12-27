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

export async function POST() {
  console.log('🚀 === RÉCUPÉRATION EA MATCH IDs AVEC VRAIE LIBRAIRIE ===');
  
  try {
    const api = new EAFCApiService();
    
    // Récupérer tous les matchs validés sans EA Match ID
    const matchesWithoutEaId = await prisma.leagueMatch.findMany({
      where: { 
        validated: true,
        eaMatchId: null 
      },
      include: {
        homeClub: true,
        awayClub: true
      },
      orderBy: { playedAt: 'desc' }
    });
    
    if (matchesWithoutEaId.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tous les matchs validés ont déjà un EA Match ID !',
        data: { fixed: 0, total: 0 }
      });
    }
    
    console.log(`📋 ${matchesWithoutEaId.length} matchs sans EA Match ID trouvés`);
    
    let fixed = 0;
    const results = [];
    
    for (const match of matchesWithoutEaId) {
      try {
        console.log(`🔍 Recherche pour: ${match.homeClub.name} vs ${match.awayClub.name}`);
        console.log(`📅 Date: ${match.playedAt.toLocaleString()}`);
        console.log(`⚽ Score DB: ${match.homeScore}-${match.awayScore}`);
        
        // Récupérer les matchs EA Sports pour le club à domicile
        const homeClubPlatform = PLATFORM_MAP[match.homeClub.platform] || 'common-gen5';
        
        console.log(`🔍 Récupération matchs pour ${match.homeClub.name} (EA Club ID: ${match.homeClub.eaClubId})`);
        
        let homeMatches;
        try {
          homeMatches = await api.matchesStats({
            clubIds: match.homeClub.eaClubId,
            platform: homeClubPlatform,
            matchType: 'leagueMatch'
          });
          
          console.log(`✅ ${homeMatches?.length || 0} matchs récupérés pour ${match.homeClub.name}`);
        } catch (error) {
          console.error(`❌ Erreur récupération matchs pour ${match.homeClub.name}:`, error);
          
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'error',
            error: `Impossible de récupérer les matchs EA Sports: ${error}`
          });
          continue;
        }
        
        if (!homeMatches || homeMatches.length === 0) {
          console.log(`⚠️ Aucun match trouvé dans l'API EA Sports pour ${match.homeClub.name}`);
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'no_matches_found'
          });
          continue;
        }
        
        // Chercher un match correspondant par score et date
        let foundMatch = null;
        let matchDate = new Date(match.playedAt);
        
        console.log(`🔍 Recherche dans ${homeMatches.length} matchs EA...`);
        
        for (const eaMatch of homeMatches) {
          if (!eaMatch.clubs || !eaMatch.matchId) continue;
          
          const eaMatchDate = new Date(eaMatch.timestamp * 1000);
          const clubIds = Object.keys(eaMatch.clubs);
          
          // Vérifier si c'est un match avec exactement 2 clubs
          if (clubIds.length !== 2) continue;
          
          // Identifier les clubs dans le match EA
          const homeClubInEa = eaMatch.clubs[match.homeClub.eaClubId];
          const opponentClubId = clubIds.find(id => id !== match.homeClub.eaClubId);
          const opponentClubInEa = opponentClubId ? eaMatch.clubs[opponentClubId] : null;
          
          if (!homeClubInEa || !opponentClubInEa) continue;
          
          // Récupérer les scores EA
          const eaHomeScore = parseInt(homeClubInEa.goals || '0');
          const eaAwayScore = parseInt(opponentClubInEa.goals || '0');
          
          // Vérifier si les scores correspondent EXACTEMENT
          const scoresMatch = (eaHomeScore === match.homeScore && eaAwayScore === match.awayScore);
          
          // Vérifier si les dates sont proches (± 2 jours pour flexibilité)
          const dateDiff = Math.abs(eaMatchDate.getTime() - matchDate.getTime());
          const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
          const datesClose = dateDiff <= twoDaysMs;
          
          console.log(`🔍 Match EA analysé:`);
          console.log(`   Score EA: ${eaHomeScore}-${eaAwayScore} vs DB: ${match.homeScore}-${match.awayScore}`);
          console.log(`   Date EA: ${eaMatchDate.toLocaleString()} vs DB: ${matchDate.toLocaleString()}`);
          console.log(`   Écart: ${Math.round(dateDiff / (1000 * 60 * 60))}h`);
          console.log(`   Scores correspondent: ${scoresMatch}`);
          console.log(`   Dates proches: ${datesClose}`);
          
          if (scoresMatch && datesClose) {
            foundMatch = {
              matchId: eaMatch.matchId,
              homeScore: eaHomeScore,
              awayScore: eaAwayScore,
              date: eaMatchDate,
              opponentName: opponentClubInEa.details?.name || opponentClubInEa.name || 'Inconnu',
              opponentClubId: opponentClubId
            };
            console.log(`✅ MATCH TROUVÉ ! EA Match ID: ${foundMatch.matchId}`);
            break;
          }
        }
        
        if (foundMatch) {
          // Mettre à jour le match avec l'EA Match ID
          await prisma.leagueMatch.update({
            where: { id: match.id },
            data: { eaMatchId: foundMatch.matchId }
          });
          
          console.log(`🎉 EA Match ID ajouté en base: ${foundMatch.matchId}`);
          
          fixed++;
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            eaMatchId: foundMatch.matchId,
            status: 'fixed',
            details: {
              dbScore: `${match.homeScore}-${match.awayScore}`,
              eaScore: `${foundMatch.homeScore}-${foundMatch.awayScore}`,
              dbDate: match.playedAt.toLocaleString(),
              eaDate: foundMatch.date.toLocaleString(),
              opponentName: foundMatch.opponentName,
              opponentClubId: foundMatch.opponentClubId
            }
          });
        } else {
          console.log(`❌ Aucun match correspondant trouvé`);
          
          // Afficher quelques matchs EA pour debug
          console.log(`🔍 Debug - Premiers matchs EA trouvés:`);
          homeMatches.slice(0, 3).forEach((eaMatch: any, index: number) => {
            if (eaMatch.clubs && eaMatch.timestamp) {
              const clubIds = Object.keys(eaMatch.clubs);
              const homeClubInEa = eaMatch.clubs[match.homeClub.eaClubId];
              const opponentClubId = clubIds.find(id => id !== match.homeClub.eaClubId);
              const opponentClubInEa = opponentClubId ? eaMatch.clubs[opponentClubId] : null;
              
              if (homeClubInEa && opponentClubInEa) {
                const eaDate = new Date(eaMatch.timestamp * 1000);
                console.log(`   ${index + 1}. Score: ${homeClubInEa.goals}-${opponentClubInEa.goals}, Date: ${eaDate.toLocaleString()}, Adversaire: ${opponentClubInEa.details?.name || 'Inconnu'}`);
              }
            }
          });
          
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'not_found',
            details: {
              searchedScore: `${match.homeScore}-${match.awayScore}`,
              searchedDate: match.playedAt.toLocaleString(),
              eaMatchesFound: homeMatches.length
            }
          });
        }
        
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
    
    console.log(`🏁 Récupération terminée: ${fixed}/${matchesWithoutEaId.length} EA Match IDs récupérés`);
    
    return NextResponse.json({
      success: true,
      message: `Récupération terminée ! ${fixed}/${matchesWithoutEaId.length} EA Match IDs récupérés.`,
      data: {
        fixed,
        total: matchesWithoutEaId.length,
        results
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération EA Match IDs:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des EA Match IDs',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}