import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 === TEST DIRECT API EA SPORTS ===');
    
    const CLUB_ID = '40142'; // HOF 221
    const PLATFORM = 'common-gen5'; // PS5
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://www.ea.com/',
      'Origin': 'https://www.ea.com'
    };
    
    const results: any = {
      clubId: CLUB_ID,
      platform: PLATFORM,
      tests: []
    };
    
    // Test des endpoints principaux
    const endpoints = [
      {
        name: 'Club Info (Fonctionne)',
        url: `https://proclubs.ea.com/api/fc/clubs/info?clubIds=${CLUB_ID}&platform=${PLATFORM}`,
        expected: 'Info du club HOF 221'
      },
      {
        name: 'Club Members Stats (404 attendu)',
        url: `https://proclubs.ea.com/api/fc/clubs/memberStats?clubIds=${CLUB_ID}&platform=${PLATFORM}`,
        expected: 'Probablement 404'
      },
      {
        name: 'Club Matches (400 attendu)',
        url: `https://proclubs.ea.com/api/fc/clubs/matches?platform=${PLATFORM}&clubIds=${CLUB_ID}`,
        expected: 'Probablement 400'
      },
      {
        name: 'NEW: Club Details',
        url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}?platform=${PLATFORM}`,
        expected: 'Nouveau endpoint à tester'
      },
      {
        name: 'NEW: Club Members',
        url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/members?platform=${PLATFORM}`,
        expected: 'Nouveau endpoint à tester'
      },
      {
        name: 'NEW: Club Matches',
        url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/matches?platform=${PLATFORM}`,
        expected: 'Nouveau endpoint à tester'
      },
      {
        name: 'NEW: Club Stats',
        url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/stats?platform=${PLATFORM}`,
        expected: 'Nouveau endpoint à tester'
      },
      {
        name: 'NEW: Player Stats',
        url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/playerStats?platform=${PLATFORM}`,
        expected: 'Nouveau endpoint à tester'
      }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🧪 Test: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      try {
        const response = await fetch(endpoint.url, { 
          headers,
          // Timeout de 5 secondes
          signal: AbortSignal.timeout(5000)
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        let data = null;
        let hasData = false;
        let dataType = 'unknown';
        let dataKeys: string[] = [];
        let sample = '';
        
        if (response.ok) {
          try {
            data = await response.json();
            hasData = !!data;
            
            if (typeof data === 'object' && data !== null) {
              if (Array.isArray(data)) {
                dataType = `Array[${data.length}]`;
                dataKeys = data.length > 0 ? Object.keys(data[0] || {}) : [];
              } else {
                dataType = 'Object';
                dataKeys = Object.keys(data);
              }
              
              // Chercher des données importantes
              const dataStr = JSON.stringify(data).toLowerCase();
              const hasMatches = dataStr.includes('match') || dataStr.includes('game');
              const hasPlayers = dataStr.includes('player') || dataStr.includes('member');
              const hasGoals = dataStr.includes('goal') || dataStr.includes('assist');
              const hasStats = dataStr.includes('stat') || dataStr.includes('rating');
              
              let flags = [];
              if (hasMatches) flags.push('🎯 MATCHS');
              if (hasPlayers) flags.push('👥 JOUEURS');
              if (hasGoals) flags.push('⚽ BUTS/PASSES');
              if (hasStats) flags.push('📊 STATS');
              
              sample = JSON.stringify(data).substring(0, 300) + '...';
              
              console.log(`   ✅ SUCCÈS - ${dataType}`);
              console.log(`   Clés: ${dataKeys.slice(0, 8).join(', ')}${dataKeys.length > 8 ? '...' : ''}`);
              if (flags.length > 0) {
                console.log(`   Contenu: ${flags.join(', ')}`);
              }
              
            } else {
              sample = String(data);
              console.log(`   ✅ Données simples: ${sample}`);
            }
            
          } catch (jsonError) {
            console.log(`   ⚠️  Réponse non-JSON`);
          }
          
        } else {
          console.log(`   ❌ Échec: ${response.status}`);
        }
        
        results.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          expected: endpoint.expected,
          status: response.status,
          success: response.ok,
          hasData,
          dataType,
          dataKeys,
          sample: sample.substring(0, 200)
        });
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error}`);
        results.tests.push({
          name: endpoint.name,
          url: endpoint.url,
          expected: endpoint.expected,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Network error'
        });
      }
    }
    
    // Résumé
    const successful = results.tests.filter((t: any) => t.success);
    const withData = results.tests.filter((t: any) => t.success && t.hasData);
    
    console.log(`\n🏁 Résumé: ${successful.length}/${results.tests.length} endpoints réussis`);
    console.log(`📊 ${withData.length} avec des données`);
    
    const workingEndpoints = withData.map((t: any) => ({
      name: t.name,
      url: t.url,
      dataType: t.dataType,
      dataKeys: t.dataKeys.slice(0, 5)
    }));
    
    return NextResponse.json({
      success: true,
      message: `Test terminé: ${successful.length}/${results.tests.length} endpoints fonctionnels`,
      data: {
        ...results,
        summary: {
          total: results.tests.length,
          successful: successful.length,
          withData: withData.length,
          workingEndpoints
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test direct API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du test direct de l\'API EA Sports',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
