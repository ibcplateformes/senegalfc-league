#!/usr/bin/env node

console.log('🧪 === TEST DIRECT LIBRAIRIE EA SPORTS ===');
console.log('⏳ Chargement de eafc-clubs-api...');

async function testEASportsAPI() {
  try {
    const { EAFCApiService } = require('eafc-clubs-api');
    const api = new EAFCApiService();
    
    const CLUB_ID = '40142'; // HOF 221
    const PLATFORM = 'common-gen5'; // PS5
    
    console.log(`🎮 Test pour club ${CLUB_ID} sur ${PLATFORM}`);
    
    const results = {
      clubId: CLUB_ID,
      platform: PLATFORM,
      tests: []
    };
    
    // Test 1: Club Info
    console.log('\n1️⃣  Test Club Info...');
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
      
      console.log(`   ${clubInfo ? '✅ Succès' : '❌ Échec'}: ${clubInfo?.name || 'Pas de données'}`);
    } catch (error) {
      results.tests.push({
        name: 'Club Info',
        success: false,
        error: error.message
      });
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    // Test 2: Member Stats
    console.log('\n2️⃣  Test Member Stats...');
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
      
      console.log(`   ${hasMembers ? '✅ Succès' : '❌ Échec'}: ${memberCount} membres trouvés`);
    } catch (error) {
      results.tests.push({
        name: 'Member Stats',
        success: false,
        error: error.message
      });
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    // Test 3: Matches
    console.log('\n3️⃣  Test Matches...');
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
            timestamp: matches[0]?.timestamp
          }
        } : null
      });
      
      console.log(`   ${hasMatches ? '✅ Succès' : '❌ Échec'}: ${hasMatches ? matches.length : 0} matchs trouvés`);
    } catch (error) {
      results.tests.push({
        name: 'Matches',
        success: false,
        error: error.message
      });
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    const successfulTests = results.tests.filter(t => t.success);
    const summary = {
      total: results.tests.length,
      successful: successfulTests.length,
      failed: results.tests.length - successfulTests.length
    };
    
    console.log(`\n🎉 === RÉSULTATS FINAUX ===`);
    console.log(`✅ Tests réussis: ${summary.successful}/${summary.total}`);
    console.log(`❌ Tests échoués: ${summary.failed}/${summary.total}`);
    
    if (summary.successful >= 2) {
      console.log(`\n🔥 🎉 EXCELLENTE NOUVELLE !`);
      console.log(`La vraie librairie EA Sports fonctionne !`);
      console.log(`Vos stats de joueurs peuvent maintenant être synchronisées !`);
    } else {
      console.log(`\n⚠️  Problème détecté avec la librairie EA Sports`);
    }
    
    console.log(`\n📊 JSON Détaillé:`);
    console.log(JSON.stringify({
      success: summary.successful >= 2,
      message: `Tests EA Sports: ${summary.successful}/${summary.total} réussis`,
      data: { ...results, summary }
    }, null, 2));
    
  } catch (error) {
    console.error(`\n❌ Erreur critique:`, error.message);
  }
}

testEASportsAPI();
