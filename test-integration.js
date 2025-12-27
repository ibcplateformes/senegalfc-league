#!/usr/bin/env node

console.log('🚀 === TEST INTÉGRATION VRAIE API EA SPORTS ===');

async function testIntegration() {
  try {
    console.log('\n1️⃣  Test import librairie...');
    
    const { 
      fetchClubInfo, 
      fetchClubMatches, 
      fetchPlayerStats 
    } = require('./lib/ea-sports');
    
    console.log('   ✅ Import réussi depuis lib/ea-sports.ts');
    
    console.log('\n2️⃣  Test récupération infos club...');
    const clubInfo = await fetchClubInfo('40142', 'ps5');
    
    if (clubInfo && clubInfo.name === 'HOF 221') {
      console.log(`   ✅ Club récupéré: "${clubInfo.name}" (ID: ${clubInfo.id})`);
    } else {
      console.log('   ❌ Échec récupération club');
      return false;
    }
    
    console.log('\n3️⃣  Test récupération matchs...');
    const matches = await fetchClubMatches('40142', 'ps5', 3);
    
    if (matches && matches.length > 0) {
      console.log(`   ✅ ${matches.length} matchs récupérés`);
      console.log(`   📋 Exemple: vs ${matches[0].opponent}, EA ID: ${matches[0].matchId}`);
    } else {
      console.log('   ❌ Aucun match récupéré');
      return false;
    }
    
    console.log('\n4️⃣  Test récupération stats joueurs...');
    const players = await fetchPlayerStats('40142', 'ps5');
    
    if (players && players.length > 0) {
      console.log(`   ✅ ${players.length} joueurs récupérés`);
      console.log(`   👤 Exemple: "${players[0].playerName}" - ${players[0].goals} buts`);
    } else {
      console.log('   ❌ Aucune stats joueur récupérée');
      return false;
    }
    
    console.log('\n🎉 === SUCCÈS TOTAL ===');
    console.log('🔥 SenegalFC League utilise maintenant la vraie API EA Sports !');
    return true;
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    return false;
  }
}

testIntegration().then(success => {
  if (success) {
    console.log('\n🏆 READY TO DEPLOY! 🚀');
    process.exit(0);
  } else {
    console.log('\n💥 ÉCHEC - VÉRIFIEZ LES ERREURS');
    process.exit(1);
  }
});
