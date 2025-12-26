import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { clubId, platform } = await request.json();
    
    if (!clubId) {
      return NextResponse.json(
        { success: false, error: 'Club ID requis' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 === EXPLORATION ENDPOINTS EA FC 25 POUR CLUB ${clubId} ===`);
    
    // Mapping des plateformes
    const PLATFORM_MAP = {
      'ps5': 'common-gen5',
      'ps4': 'common-gen4', 
      'xboxseriesxs': 'common-gen5',
      'xboxone': 'common-gen4',
      'pc': 'common-gen5',
    };
    
    const apiPlatform = PLATFORM_MAP[platform as keyof typeof PLATFORM_MAP] || 'common-gen5';
    console.log(`🎮 Platform: ${platform} → ${apiPlatform}`);
    
    const results: any = {
      clubId,
      platform: apiPlatform,
      tests: []
    };
    
    // Headers communs
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://www.ea.com/',
      'Origin': 'https://www.ea.com'
    };
    
    // 🧪 NOUVEAUX ENDPOINTS EA FC 25 À TESTER
    const endpointsToTest = [
      {
        name: 'Club Details (v1)',
        url: `https://proclubs.ea.com/api/fc/clubs/${clubId}?platform=${apiPlatform}`
      },
      {
        name: 'Club Stats (v1)', 
        url: `https://proclubs.ea.com/api/fc/clubs/${clubId}/stats?platform=${apiPlatform}`
      },
      {
        name: 'Club Members (v1)',
        url: `https://proclubs.ea.com/api/fc/clubs/${clubId}/members?platform=${apiPlatform}`
      },
      {
        name: 'Club Matches (v1)',
        url: `https://proclubs.ea.com/api/fc/clubs/${clubId}/matches?platform=${apiPlatform}`
      },
      {
        name: 'Club Matches (v2)',
        url: `https://proclubs.ea.com/api/fc/matches?clubId=${clubId}&platform=${apiPlatform}`
      },
      {
        name: 'Club Leaderboard',
        url: `https://proclubs.ea.com/api/fc/clubs/${clubId}/leaderboard?platform=${apiPlatform}`
      },
      {
        name: 'Club Season Stats',
        url: `https://proclubs.ea.com/api/fc/clubs/${clubId}/seasonStats?platform=${apiPlatform}`
      },
      {
        name: 'Club Player Stats',
        url: `https://proclubs.ea.com/api/fc/clubs/${clubId}/playerStats?platform=${apiPlatform}`
      },
      {
        name: 'EA FC API v2',
        url: `https://proclubs.ea.com/api/v2/fc/clubs?clubIds=${clubId}&platform=${apiPlatform}`
      },
      {
        name: 'EA FC Data API',
        url: `https://data.ea.com/api/fc/clubs/${clubId}?platform=${apiPlatform}`
      },
      {
        name: 'EA Sports FC API',
        url: `https://eafc.ea.com/api/clubs/${clubId}?platform=${apiPlatform}`
      },
      {
        name: 'Pro Clubs Dashboard',
        url: `https://proclubs.ea.com/api/dashboard/clubs/${clubId}?platform=${apiPlatform}`
      }
    ];

    // Tester tous les endpoints
    for (const endpoint of endpointsToTest) {
      console.log(`🧪 Test: ${endpoint.name}...`);
      
      try {
        const response = await fetch(endpoint.url, { 
          headers,
          // Ajouter un timeout pour éviter les blocages
          signal: AbortSignal.timeout(10000)
        });
        
        let data = null;
        let hasData = false;
        let dataKeys: string[] = [];
        let sample = null;
        let isArray = false;
        let arrayLength = 0;
        
        if (response.ok) {
          try {
            data = await response.json();
            hasData = !!data;
            
            if (typeof data === 'object' && data !== null) {
              if (Array.isArray(data)) {
                isArray = true;
                arrayLength = data.length;
                dataKeys = arrayLength > 0 ? Object.keys(data[0] || {}) : [];
              } else {
                dataKeys = Object.keys(data);
              }
              sample = JSON.stringify(data).substring(0, 300) + '...';
            } else {
              sample = String(data);
            }
          } catch (jsonError) {
            // Pas du JSON, peut-être du HTML ou autre
            const textData = await response.text();
            sample = textData.substring(0, 200) + '...';
            hasData = textData.length > 0;
          }
        }
        
        results.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          success: response.ok,
          hasData,
          dataKeys,
          sample,
          isArray,
          arrayLength
        });
        
        console.log(`  ${response.ok ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
        if (response.ok && hasData) {
          console.log(`    📊 ${isArray ? `Array[${arrayLength}]` : 'Object'} - Keys: ${dataKeys.join(', ')}`);
        }
        
      } catch (error) {
        results.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Network error'
        });
        console.log(`  ❌ ${endpoint.name}: ${error}`);
      }
      
      // Pause entre les requêtes pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`🏁 === EXPLORATION TERMINÉE ===`);
    
    // Analyser les résultats
    const successfulTests = results.tests.filter((t: any) => t.success && t.hasData);
    const potentialMatches = successfulTests.filter((t: any) => 
      t.name.toLowerCase().includes('match') || 
      t.dataKeys.some((key: string) => 
        key.toLowerCase().includes('match') || 
        key.toLowerCase().includes('game') ||
        key.toLowerCase().includes('fixture')
      )
    );
    
    const potentialPlayers = successfulTests.filter((t: any) => 
      t.name.toLowerCase().includes('member') || 
      t.name.toLowerCase().includes('player') ||
      t.name.toLowerCase().includes('stat') ||
      t.dataKeys.some((key: string) => 
        key.toLowerCase().includes('player') || 
        key.toLowerCase().includes('member') ||
        key.toLowerCase().includes('stat')
      )
    );
    
    const summary = {
      total: results.tests.length,
      successful: successfulTests.length,
      failed: results.tests.length - successfulTests.length,
      potentialMatches: potentialMatches.length,
      potentialPlayers: potentialPlayers.length,
      workingEndpoints: successfulTests.map((t: any) => ({
        name: t.name,
        url: t.url,
        hasData: t.hasData,
        dataKeys: t.dataKeys,
        type: t.isArray ? `Array[${t.arrayLength}]` : 'Object'
      }))
    };
    
    console.log(`📊 Résumé: ${summary.successful}/${summary.total} endpoints fonctionnels`);
    console.log(`⚽ Endpoints potentiels pour les matchs: ${summary.potentialMatches}`);
    console.log(`👥 Endpoints potentiels pour les joueurs: ${summary.potentialPlayers}`);
    
    return NextResponse.json({
      success: true,
      message: `Exploration terminée: ${summary.successful}/${summary.total} endpoints fonctionnels trouvés`,
      data: {
        ...results,
        summary,
        recommendations: {
          bestMatchEndpoints: potentialMatches,
          bestPlayerEndpoints: potentialPlayers,
          nextSteps: summary.successful > 0 ? 
            'Des endpoints fonctionnels trouvés ! Examinez les données pour implémenter la synchronisation.' :
            'Aucun endpoint fonctionnel trouvé. L\'API EA Sports a peut-être complètement changé.'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur exploration API EA FC 25:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'exploration des endpoints EA FC 25',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
