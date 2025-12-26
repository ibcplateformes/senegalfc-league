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
    
    console.log(`🧪 === TEST API EA SPORTS POUR CLUB ${clubId} ===`);
    
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
    
    // 🧪 TEST 1: Club Info
    console.log(`📋 Test 1: Club Info...`);
    const clubInfoUrl = `https://proclubs.ea.com/api/fc/clubs/info?clubIds=${clubId}&platform=${apiPlatform}`;
    try {
      const response = await fetch(clubInfoUrl, { headers });
      const data = response.ok ? await response.json() : null;
      
      results.tests.push({
        name: 'Club Info',
        url: clubInfoUrl,
        status: response.status,
        success: response.ok,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        sample: data ? JSON.stringify(data).substring(0, 200) + '...' : null
      });
      
      console.log(`  ${response.ok ? '✅' : '❌'} Status: ${response.status}`);
      if (data) console.log(`  📊 Keys: ${Object.keys(data).join(', ')}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Club Info',
        url: clubInfoUrl,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`  ❌ Erreur: ${error}`);
    }
    
    // 🧪 TEST 2: Club Members/Stats
    console.log(`👥 Test 2: Club Members...`);
    const membersUrl = `https://proclubs.ea.com/api/fc/clubs/memberStats?clubIds=${clubId}&platform=${apiPlatform}`;
    try {
      const response = await fetch(membersUrl, { headers });
      const data = response.ok ? await response.json() : null;
      
      results.tests.push({
        name: 'Club Members/Stats',
        url: membersUrl,
        status: response.status,
        success: response.ok,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        sample: data ? JSON.stringify(data).substring(0, 200) + '...' : null
      });
      
      console.log(`  ${response.ok ? '✅' : '❌'} Status: ${response.status}`);
      if (data) console.log(`  📊 Keys: ${Object.keys(data).join(', ')}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Club Members/Stats',
        url: membersUrl,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`  ❌ Erreur: ${error}`);
    }
    
    // 🧪 TEST 3: Club Matches
    console.log(`⚽ Test 3: Club Matches...`);
    const matchesUrl = `https://proclubs.ea.com/api/fc/clubs/matches?platform=${apiPlatform}&clubIds=${clubId}`;
    try {
      const response = await fetch(matchesUrl, { headers });
      const data = response.ok ? await response.json() : null;
      
      results.tests.push({
        name: 'Club Matches',
        url: matchesUrl,
        status: response.status,
        success: response.ok,
        hasData: !!data,
        isArray: Array.isArray(data),
        arrayLength: Array.isArray(data) ? data.length : 0,
        sample: data ? JSON.stringify(data).substring(0, 200) + '...' : null
      });
      
      console.log(`  ${response.ok ? '✅' : '❌'} Status: ${response.status}`);
      if (Array.isArray(data)) {
        console.log(`  📊 ${data.length} matchs trouvés`);
        if (data.length > 0) {
          console.log(`  🔍 Premier match: ${JSON.stringify(data[0]).substring(0, 100)}...`);
        }
      }
      
    } catch (error) {
      results.tests.push({
        name: 'Club Matches',
        url: matchesUrl,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`  ❌ Erreur: ${error}`);
    }
    
    // 🧪 TEST 4: Alternative Club Info endpoint
    console.log(`🔄 Test 4: Alternative Club Info...`);
    const altClubUrl = `https://proclubs.ea.com/api/fc/clubs?clubIds=${clubId}&platform=${apiPlatform}`;
    try {
      const response = await fetch(altClubUrl, { headers });
      const data = response.ok ? await response.json() : null;
      
      results.tests.push({
        name: 'Alternative Club Info',
        url: altClubUrl,
        status: response.status,
        success: response.ok,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        sample: data ? JSON.stringify(data).substring(0, 200) + '...' : null
      });
      
      console.log(`  ${response.ok ? '✅' : '❌'} Status: ${response.status}`);
      if (data) console.log(`  📊 Keys: ${Object.keys(data).join(', ')}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Alternative Club Info',
        url: altClubUrl,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`  ❌ Erreur: ${error}`);
    }
    
    // 🧪 TEST 5: Leaderboards (pour voir si l'API fonctionne en général)
    console.log(`🏆 Test 5: Leaderboards...`);
    const leaderboardUrl = `https://proclubs.ea.com/api/fc/leaderboards/clubs?platform=${apiPlatform}`;
    try {
      const response = await fetch(leaderboardUrl, { headers });
      const data = response.ok ? await response.json() : null;
      
      results.tests.push({
        name: 'Leaderboards',
        url: leaderboardUrl,
        status: response.status,
        success: response.ok,
        hasData: !!data,
        sample: data ? JSON.stringify(data).substring(0, 200) + '...' : null
      });
      
      console.log(`  ${response.ok ? '✅' : '❌'} Status: ${response.status}`);
      if (data) console.log(`  📊 Data type: ${typeof data}, is array: ${Array.isArray(data)}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Leaderboards',
        url: leaderboardUrl,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`  ❌ Erreur: ${error}`);
    }
    
    console.log(`🏁 === TESTS TERMINÉS ===`);
    
    // Résumé
    const successfulTests = results.tests.filter((t: any) => t.success);
    const summary = {
      total: results.tests.length,
      successful: successfulTests.length,
      failed: results.tests.length - successfulTests.length,
      workingEndpoints: successfulTests.map((t: any) => ({
        name: t.name,
        url: t.url,
        hasData: t.hasData
      }))
    };
    
    console.log(`📊 Résumé: ${summary.successful}/${summary.total} tests réussis`);
    
    return NextResponse.json({
      success: true,
      message: `Tests terminés: ${summary.successful}/${summary.total} endpoints fonctionnels`,
      data: {
        ...results,
        summary
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test API EA Sports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors des tests API EA Sports',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
