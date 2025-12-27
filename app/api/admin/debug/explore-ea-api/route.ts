import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  console.log('🔍 === EXPLORATION COMPLÈTE API EA SPORTS ===');
  
  try {
    const body = await request.json();
    const clubId = body.clubId || '40142'; // HOF 221 par défaut
    const platform = body.platform || 'ps5';
    
    const api = new EAFCApiService();
    const mappedPlatform = PLATFORM_MAP[platform] || 'common-gen5';
    
    console.log(`🎯 Exploration pour Club ID: ${clubId}, Plateforme: ${mappedPlatform}`);
    
    const exploration: any = {
      clubId,
      platform: mappedPlatform,
      timestamp: new Date().toISOString(),
      data: {}
    };
    
    // 1. INFORMATIONS DU CLUB
    console.log('📋 1. Récupération des informations du club...');
    try {
      const clubInfo = await api.clubInfo({ 
        clubIds: clubId, 
        platform: mappedPlatform 
      });
      
      exploration.data.clubInfo = {
        success: true,
        data: clubInfo,
        raw: JSON.stringify(clubInfo, null, 2)
      };
      
      console.log(`✅ Club trouvé: ${clubInfo?.[clubId]?.name || 'Nom inconnu'}`);
    } catch (error) {
      exploration.data.clubInfo = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      console.error('❌ Erreur club info:', error);
    }
    
    // 2. MEMBRES/JOUEURS DU CLUB
    console.log('👥 2. Récupération des membres du club...');
    try {
      const memberStats = await api.memberStats({ 
        clubIds: clubId, 
        platform: mappedPlatform 
      });
      
      const memberCount = memberStats?.[clubId] ? Object.keys(memberStats[clubId]).length : 0;
      
      exploration.data.memberStats = {
        success: true,
        memberCount,
        data: memberStats,
        raw: JSON.stringify(memberStats, null, 2),
        // Afficher les 3 premiers joueurs pour voir la structure
        sample: memberStats?.[clubId] ? Object.entries(memberStats[clubId]).slice(0, 3) : []
      };
      
      console.log(`✅ ${memberCount} membres trouvés`);
    } catch (error) {
      exploration.data.memberStats = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      console.error('❌ Erreur member stats:', error);
    }
    
    // 3. MATCHS DU CLUB (le plus important !)
    console.log('⚽ 3. Récupération des matchs du club...');
    try {
      const matches = await api.matchesStats({
        clubIds: clubId,
        platform: mappedPlatform,
        matchType: 'leagueMatch'
      });
      
      exploration.data.matches = {
        success: true,
        matchCount: matches?.length || 0,
        data: matches,
        raw: JSON.stringify(matches, null, 2)
      };
      
      // Analyser la structure des matchs
      if (matches && matches.length > 0) {
        console.log(`✅ ${matches.length} matchs trouvés`);
        
        // Afficher la structure du premier match
        const firstMatch = matches[0];
        console.log('🔍 Structure du premier match:');
        console.log('- Match ID:', firstMatch.matchId);
        console.log('- Timestamp:', firstMatch.timestamp, '→', new Date(firstMatch.timestamp * 1000));
        console.log('- Clubs:', Object.keys(firstMatch.clubs || {}));
        
        // Analyser les clubs dans chaque match
        exploration.data.matchAnalysis = [];
        
        matches.slice(0, 5).forEach((match: any, index: number) => {
          if (match.clubs && match.timestamp) {
            const clubIds = Object.keys(match.clubs);
            const analysis: any = {
              index: index + 1,
              matchId: match.matchId,
              timestamp: match.timestamp,
              date: new Date(match.timestamp * 1000).toISOString(),
              clubCount: clubIds.length,
              clubs: {}
            };
            
            clubIds.forEach(id => {
              const clubData = match.clubs[id];
              analysis.clubs[id] = {
                name: clubData.details?.name || clubData.name || 'Nom inconnu',
                goals: clubData.goals || 0,
                result: clubData.result || 'inconnu'
              };
            });
            
            exploration.data.matchAnalysis.push(analysis);
            
            console.log(`📊 Match ${index + 1}: ${analysis.date} - ${Object.values(analysis.clubs).map((c: any) => `${c.name} (${c.goals})`).join(' vs ')}`);
          }
        });
        
      } else {
        console.log('⚠️ Aucun match trouvé');
      }
      
    } catch (error) {
      exploration.data.matches = {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      console.error('❌ Erreur matches:', error);
    }
    
    // 4. RÉSUMÉ POUR LE DEBUG
    exploration.summary = {
      clubInfoSuccess: exploration.data.clubInfo?.success || false,
      membersFound: exploration.data.memberStats?.memberCount || 0,
      matchesFound: exploration.data.matches?.matchCount || 0,
      canProceedWithMatching: exploration.data.matches?.success && exploration.data.matches?.matchCount > 0
    };
    
    console.log('📊 RÉSUMÉ DE L\\'EXPLORATION:');
    console.log(`- Club Info: ${exploration.summary.clubInfoSuccess ? '✅' : '❌'}`);
    console.log(`- Membres trouvés: ${exploration.summary.membersFound}`);
    console.log(`- Matchs trouvés: ${exploration.summary.matchesFound}`);
    console.log(`- Peut procéder au matching: ${exploration.summary.canProceedWithMatching ? '✅' : '❌'}`);
    
    return NextResponse.json({
      success: true,
      message: `Exploration terminée ! ${exploration.summary.matchesFound} matchs trouvés pour le club ${clubId}`,
      data: exploration
    });
    
  } catch (error) {
    console.error('❌ Erreur exploration API EA Sports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\\'exploration de l\\'API EA Sports',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
