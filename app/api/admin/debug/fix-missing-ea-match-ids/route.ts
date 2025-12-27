import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchClubMatches, findInterClubMatch } from '@/lib/ea-sports';

export const dynamic = 'force-dynamic';

export async function POST() {
  console.log('🔧 === RÉCUPÉRATION EA MATCH IDs MANQUANTS ===');
  
  try {
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
        console.log(`🔍 Recherche EA Match ID pour: ${match.homeClub.name} vs ${match.awayClub.name}`);
        
        // Récupérer les matchs EA Sports pour les deux clubs
        const homeMatches = await fetchClubMatches(
          match.homeClub.eaClubId, 
          match.homeClub.platform, 
          20 // Plus de matchs pour avoir plus de chances
        );
        
        const awayMatches = await fetchClubMatches(
          match.awayClub.eaClubId, 
          match.awayClub.platform, 
          20
        );
        
        console.log(`📊 ${homeMatches.length} matchs trouvés pour ${match.homeClub.name}`);
        console.log(`📊 ${awayMatches.length} matchs trouvés pour ${match.awayClub.name}`);
        
        // Chercher le match correspondant
        const foundMatch = findInterClubMatch(
          homeMatches,
          awayMatches,
          match.homeClub.name,
          match.awayClub.name
        );
        
        if (foundMatch) {
          // Vérifier que les scores correspondent
          const scoresMatch = (
            foundMatch.scoreFor === match.homeScore && 
            foundMatch.scoreAgainst === match.awayScore
          ) || (
            foundMatch.scoreFor === match.awayScore && 
            foundMatch.scoreAgainst === match.homeScore
          );
          
          // Vérifier que les dates sont proches (± 1 jour)
          const dateDiff = Math.abs(foundMatch.date.getTime() - match.playedAt.getTime());
          const oneDayMs = 24 * 60 * 60 * 1000;
          const datesClose = dateDiff <= oneDayMs;
          
          if (scoresMatch && datesClose) {
            // Mettre à jour le match avec l'EA Match ID
            await prisma.leagueMatch.update({
              where: { id: match.id },
              data: { eaMatchId: foundMatch.matchId }
            });
            
            console.log(`✅ EA Match ID trouvé et ajouté: ${foundMatch.matchId}`);
            
            fixed++;
            results.push({
              matchId: match.id,
              homeClub: match.homeClub.name,
              awayClub: match.awayClub.name,
              eaMatchId: foundMatch.matchId,
              status: 'fixed'
            });
          } else {
            console.log(`⚠️ Match trouvé mais scores/dates ne correspondent pas`);
            console.log(`  - Scores DB: ${match.homeScore}-${match.awayScore}`);
            console.log(`  - Scores EA: ${foundMatch.scoreFor}-${foundMatch.scoreAgainst}`);
            console.log(`  - Date DB: ${match.playedAt}`);
            console.log(`  - Date EA: ${foundMatch.date}`);
            
            results.push({
              matchId: match.id,
              homeClub: match.homeClub.name,
              awayClub: match.awayClub.name,
              status: 'found_but_mismatch',
              details: {
                dbScore: `${match.homeScore}-${match.awayScore}`,
                eaScore: `${foundMatch.scoreFor}-${foundMatch.scoreAgainst}`,
                dbDate: match.playedAt,
                eaDate: foundMatch.date
              }
            });
          }
        } else {
          console.log(`❌ Aucun match correspondant trouvé dans l'API EA Sports`);
          
          results.push({
            matchId: match.id,
            homeClub: match.homeClub.name,
            awayClub: match.awayClub.name,
            status: 'not_found'
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
