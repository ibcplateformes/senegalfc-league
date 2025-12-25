import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchClubMatches, ClubMatchData, findInterClubMatch } from '@/lib/ea-sports';
import type { SyncResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔄 Début de la synchronisation manuelle EA Sports...');
  
  try {
    // Récupérer tous les clubs actifs
    const activeClubs = await prisma.leagueClub.findMany({
      where: { active: true }
    });
    
    if (activeClubs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun club actif trouvé'
      }, { status: 400 });
    }
    
    console.log(`📋 ${activeClubs.length} clubs actifs à synchroniser`);
    
    const syncResults: SyncResponse = {
      scannedClubs: activeClubs.length,
      newMatches: 0,
      leagueMatchesDetected: 0,
      errors: [],
      lastSync: new Date()
    };
    
    // Récupérer les matchs de chaque club
    const clubMatches = new Map<string, ClubMatchData[]>();
    
    for (const club of activeClubs) {
      try {
        console.log(`⚽ Récupération des matchs pour ${club.name} (${club.eaClubId})`);
        
        const matches = await fetchClubMatches(club.eaClubId, club.platform, 10);
        clubMatches.set(club.id, matches);
        
        syncResults.newMatches += matches.length;
        
        console.log(`✅ ${matches.length} matchs récupérés pour ${club.name}`);
      } catch (error) {
        const errorMsg = `Erreur récupération ${club.name}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        syncResults.errors.push(errorMsg);
      }
    }
    
    // Détecter les matchs inter-clubs
    const detectedMatches = [];
    
    for (let i = 0; i < activeClubs.length; i++) {
      const club1 = activeClubs[i];
      const club1Matches = clubMatches.get(club1.id) || [];
      
      for (let j = i + 1; j < activeClubs.length; j++) {
        const club2 = activeClubs[j];
        const club2Matches = clubMatches.get(club2.id) || [];
        
        // Chercher si ces deux clubs se sont affrontés
        const interClubMatch = findInterClubMatch(
          club1Matches, 
          club2Matches, 
          club1.name, 
          club2.name
        );
        
        if (interClubMatch) {
          console.log(`🎯 Match inter-clubs détecté: ${club1.name} vs ${club2.name}`);
          
          // Vérifier si ce match n'existe pas déjà en base
          const existingMatch = await prisma.leagueMatch.findFirst({
            where: {
              OR: [
                {
                  homeClubId: club1.id,
                  awayClubId: club2.id,
                  playedAt: {
                    gte: new Date(interClubMatch.date.getTime() - 60000), // ±1 minute
                    lte: new Date(interClubMatch.date.getTime() + 60000)
                  }
                },
                {
                  homeClubId: club2.id,
                  awayClubId: club1.id,
                  playedAt: {
                    gte: new Date(interClubMatch.date.getTime() - 60000),
                    lte: new Date(interClubMatch.date.getTime() + 60000)
                  }
                }
              ]
            }
          });
          
          if (!existingMatch) {
            detectedMatches.push({
              homeClubId: club1.id,
              awayClubId: club2.id,
              homeScore: interClubMatch.scoreFor,
              awayScore: interClubMatch.scoreAgainst,
              playedAt: interClubMatch.date,
              eaMatchId: interClubMatch.id,
              validated: false // Les admins devront valider
            });
            
            syncResults.leagueMatchesDetected++;
          } else {
            console.log(`ℹ️  Match déjà en base: ${club1.name} vs ${club2.name}`);
          }
        }
      }
    }
    
    // Sauvegarder les nouveaux matchs détectés
    if (detectedMatches.length > 0) {
      await prisma.leagueMatch.createMany({
        data: detectedMatches
      });
      
      console.log(`💾 ${detectedMatches.length} nouveaux matchs sauvegardés`);
    }
    
    // Mettre à jour la date de dernière sync
    await prisma.leagueConfig.upsert({
      where: { id: 'default' },
      update: { lastSync: syncResults.lastSync },
      create: {
        id: 'default',
        leagueName: 'Ligue Sénégalaise FC',
        season: '2025',
        lastSync: syncResults.lastSync
      }
    });
    
    console.log('🏁 Synchronisation terminée avec succès !');
    console.log(`📊 Résumé: ${syncResults.scannedClubs} clubs scannés, ${syncResults.leagueMatchesDetected} matchs de ligue détectés`);
    
    return NextResponse.json({
      success: true,
      data: syncResults,
      message: `Synchronisation terminée ! ${syncResults.leagueMatchesDetected} nouveaux matchs de ligue détectés.`
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation EA Sports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la synchronisation EA Sports',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}