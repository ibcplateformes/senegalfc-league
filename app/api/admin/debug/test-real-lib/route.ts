import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[DEBUG] === TEST NOUVELLE LIBRAIRIE EA SPORTS ===');
    
    const { EAFCApiService } = require('eafc-clubs-api');
    const api = new EAFCApiService();
    
    const CLUB_ID = '40142'; // HOF 221
    const PLATFORM = 'common-gen5'; // PS5
    
    console.log(`[DEBUG] Test pour club ${CLUB_ID} sur ${PLATFORM}`);
    
    const results: any = {
      clubId: CLUB_ID,
      platform: PLATFORM,
      tests: []
    };
    
    // Test 1: Club Info
    console.log('[1] Test Club Info...');
    try {
      const clubInfoResponse = await api.clubInfo({
        clubIds: CLUB_ID,
        platform: PLATFORM
      });
      
      const clubInfo = clubInfoResponse[CLUB_ID];
      results.tests.push({
        name: 'Club Info',
        success: !!clubInfo,
        data: clubInfo ? {
          name: clubInfo.name,
          clubId: clubInfo.clubId,
          teamId: clubInfo.teamId
        } : null
      });
      
      console.log(`   ${clubInfo ? '[SUCCESS]' : '[FAILED]'}: ${clubInfo?.name || 'Pas de données'}`);
    } catch (error) {
      results.tests.push({
        name: 'Club Info',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`   [ERROR]: ${error}`);
    }
    
    // Test 2: Member Stats
    console.log('[2] Test Member Stats...');
    try {
      const memberStats = await api.memberCareerStats({
        clubId: CLUB_ID,
        platform: PLATFORM
      });
      
      const hasMembers = memberStats && memberStats.members && Object.keys(memberStats.members).length > 0;
      const memberCount = hasMembers ? Object.keys(memberStats.members).length : 0;
      
      results.tests.push({
        name: 'Member Stats',
        success: hasMembers,
        data: hasMembers ? {
          memberCount,
          sampleMember: Object.values(memberStats.members)[0]
        } : null
      });
      
      console.log(`   ${hasMembers ? '[SUCCESS]' : '[FAILED]'}: ${memberCount} membres trouvés`);
    } catch (error) {
      results.tests.push({
        name: 'Member Stats',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`   [ERROR]: ${error}`);
    }
    
    // Test 3: Matches
    console.log('[3] Test Matches...');
    try {
      const matches = await api.matchesStats({
        clubIds: CLUB_ID,
        platform: PLATFORM,
        matchType: 'leagueMatch'
      });
      
      const hasMatches = Array.isArray(matches) && matches.length > 0;
      
      results.tests.push({
        name: 'Matches',
        success: hasMatches,
        data: hasMatches ? {
          matchCount: matches.length,
          sampleMatch: {
            matchId: matches[0]?.matchId,
            timestamp: matches[0]?.timestamp,
            clubs: Object.keys(matches[0]?.clubs || {})
          }
        } : null
      });
      
      console.log(`   ${hasMatches ? '[SUCCESS]' : '[FAILED]'}: ${hasMatches ? matches.length : 0} matchs trouvés`);
    } catch (error) {
      results.tests.push({
        name: 'Matches',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`   [ERROR]: ${error}`);
    }
    
    const successfulTests = results.tests.filter((t: any) => t.success);
    const summary = {
      total: results.tests.length,
      successful: successfulTests.length,
      failed: results.tests.length - successfulTests.length
    };
    
    console.log(`[RESULT] Test terminé: ${summary.successful}/${summary.total} tests réussis`);
    
    return NextResponse.json({
      success: summary.successful >= 2, // Au moins 2/3 tests doivent réussir
      message: `Tests EA Sports: ${summary.successful}/${summary.total} réussis`,
      data: {
        ...results,
        summary
      }
    });
    
  } catch (error) {
    console.error('[ERROR] Erreur test librairie EA Sports:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du test de la librairie EA Sports',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
