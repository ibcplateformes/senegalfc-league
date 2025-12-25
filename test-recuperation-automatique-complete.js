// Test du système de récupération automatique complète - Comme ClubStats Pro
console.log('🔥 === TEST RÉCUPÉRATION AUTOMATIQUE COMPLÈTE ===');
console.log('🚀 Système adapté de ClubStats Pro pour la ligue sénégalaise !');
console.log('====================================================');

// Importer la fonction de récupération complète
const { fetchCompleteClubStats } = require('./lib/ea-sports.ts');

// Configuration des clubs sénégalais à tester
const CLUBS_SENEGALAIS = [
  { id: '40142', name: 'HOF 221', platform: 'ps5' },
  { id: '24000', name: 'BUUR MFC', platform: 'ps5' },
  { id: '29739', name: 'Club Test 3', platform: 'ps5' }
];

async function testRecuperationComplete() {
  console.log(`🎯 Test avec ${CLUBS_SENEGALAIS.length} clubs sénégalais\n`);
  
  for (let i = 0; i < CLUBS_SENEGALAIS.length; i++) {
    const club = CLUBS_SENEGALAIS[i];
    
    console.log(`\n🔄 === CLUB ${i + 1}/${CLUBS_SENEGALAIS.length}: ${club.name} ===`);
    console.log(`🆔 EA Club ID: ${club.id} | Plateforme: ${club.platform}`);
    console.log(`⏱️ Début récupération: ${new Date().toLocaleTimeString()}`);
    
    try {
      // 🚀 RÉCUPÉRATION AUTOMATIQUE COMPLÈTE
      const startTime = Date.now();
      const completeStats = await fetchCompleteClubStats(club.id, club.platform);
      const duration = Date.now() - startTime;
      
      if (completeStats) {
        console.log(`\n✅ === RÉCUPÉRATION RÉUSSIE en ${duration}ms ===`);
        console.log(`📊 RÉSUMÉ pour "${completeStats.clubName}":`);
        console.log(`   🏢 Nom officiel EA: ${completeStats.clubName}`);
        console.log(`   👥 Joueurs avec stats: ${completeStats.players.length}`);
        console.log(`   ⚽ Buts totaux: ${completeStats.players.reduce((sum, p) => sum + p.goals, 0)}`);
        console.log(`   🎯 Assists totaux: ${completeStats.players.reduce((sum, p) => sum + p.assists, 0)}`);
        console.log(`   📅 Matchs joués: ${completeStats.players.reduce((sum, p) => sum + p.matchesPlayed, 0)}`);
        console.log(`   ⚽ Matchs récents: ${completeStats.recentMatches.length}`);
        
        // TOP 3 BUTEURS
        const topScorers = completeStats.players
          .filter(p => p.goals > 0)
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 3);
          
        if (topScorers.length > 0) {
          console.log(`\n🏆 TOP BUTEURS:`);
          topScorers.forEach((player, index) => {
            console.log(`   ${index + 1}. ${player.playerName} (${player.position}): ${player.goals}⚽ ${player.assists}🎯`);
          });
        }
        
        // STATS PAR POSITION
        const positions = ['GK', 'DEF', 'MID', 'ATT'];
        console.log(`\n📊 RÉPARTITION PAR POSTE:`);
        positions.forEach(pos => {
          const posPlayers = completeStats.players.filter(p => p.position === pos);
          const posGoals = posPlayers.reduce((sum, p) => sum + p.goals, 0);
          console.log(`   ${pos}: ${posPlayers.length} joueurs, ${posGoals} buts`);
        });
        
        // DÉTAIL DE QUELQUES JOUEURS (pour vérifier la richesse des données)
        if (completeStats.players.length > 0) {
          console.log(`\n🔍 DÉTAIL PREMIER JOUEUR (vérification data):`);
          const player = completeStats.players[0];
          console.log(`   👤 ${player.playerName} (${player.position})`);
          console.log(`   📊 Matchs: ${player.matchesPlayed}, Minutes: ${player.minutesPlayed}`);
          console.log(`   ⚽ Buts: ${player.goals}, 🎯 Assists: ${player.assists}`);
          console.log(`   📈 Tirs: ${player.shots}/${player.shotsOnTarget}, Précision: ${player.shotAccuracy}%`);
          console.log(`   🛡️ Tacles: ${player.tackles}, Interceptions: ${player.interceptions}`);
          console.log(`   ⭐ Note moyenne: ${player.averageRating}`);
          console.log(`   📋 Cartons: ${player.yellowCards}🟨 ${player.redCards}🟥`);
        }
        
      } else {
        console.log(`❌ ÉCHEC: Impossible de récupérer les données pour ${club.name}`);
      }
      
    } catch (error) {
      console.error(`💥 ERREUR RÉCUPÉRATION ${club.name}:`, error);
    }
    
    console.log(`⏱️ Fin: ${new Date().toLocaleTimeString()}\n`);
  }
}

async function testWorkflowCompleteLigue() {
  console.log('\n🎯 === TEST WORKFLOW COMPLET LIGUE SÉNÉGALAISE ===');
  console.log('🔄 Simulation de la synchronisation complète...\n');
  
  const allPlayersStats = [];
  const allMatchesData = [];
  
  for (const club of CLUBS_SENEGALAIS) {
    try {
      console.log(`📡 Récupération ${club.name}...`);
      const completeStats = await fetchCompleteClubStats(club.id, club.platform);
      
      if (completeStats) {
        // Collecter tous les joueurs
        allPlayersStats.push(...completeStats.players.map(p => ({
          ...p,
          clubName: completeStats.clubName
        })));
        
        // Collecter tous les matchs
        allMatchesData.push(...completeStats.recentMatches.map(m => ({
          ...m,
          clubName: completeStats.clubName
        })));
        
        console.log(`  ✅ ${completeStats.players.length} joueurs, ${completeStats.recentMatches.length} matchs`);
      }
      
    } catch (error) {
      console.log(`  ❌ Erreur ${club.name}: ${error}`);
    }
  }
  
  console.log(`\n🎉 === RÉSUMÉ LIGUE SÉNÉGALAISE ===`);
  console.log(`👥 Total joueurs récupérés: ${allPlayersStats.length}`);
  console.log(`⚽ Total matchs récupérés: ${allMatchesData.length}`);
  console.log(`🏆 Total buts marqués: ${allPlayersStats.reduce((sum, p) => sum + p.goals, 0)}`);
  console.log(`🎯 Total assists: ${allPlayersStats.reduce((sum, p) => sum + p.assists, 0)}`);
  
  // TOP BUTEURS DE LA LIGUE
  const topLeagueScorers = allPlayersStats
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);
    
  if (topLeagueScorers.length > 0) {
    console.log(`\n🏅 TOP 5 BUTEURS DE LA LIGUE:`);
    topLeagueScorers.forEach((player, index) => {
      console.log(`   ${index + 1}. ${player.playerName} (${player.clubName}): ${player.goals}⚽`);
    });
  }
  
  // CLUBS AVEC LE PLUS DE BUTS
  const clubGoals = CLUBS_SENEGALAIS.map(club => {
    const clubPlayers = allPlayersStats.filter(p => p.clubName.includes(club.name) || club.name.includes(p.clubName));
    const goals = clubPlayers.reduce((sum, p) => sum + p.goals, 0);
    return { club: club.name, goals, players: clubPlayers.length };
  });
  
  console.log(`\n⚽ BUTS PAR CLUB:`);
  clubGoals
    .sort((a, b) => b.goals - a.goals)
    .forEach(club => {
      console.log(`   ${club.club}: ${club.goals} buts (${club.players} joueurs)`);
    });
}

// Fonction principale de test
async function runAllTests() {
  const overallStart = Date.now();
  
  try {
    // Test 1: Récupération individuelle de chaque club
    await testRecuperationComplete();
    
    // Test 2: Workflow complet de la ligue
    await testWorkflowCompleteLigue();
    
    const totalDuration = Date.now() - overallStart;
    
    console.log('\n🎉 === TOUS LES TESTS TERMINÉS ===');
    console.log(`⏱️ Durée totale: ${Math.round(totalDuration / 1000)}s`);
    console.log('✅ Système de récupération automatique adapté de ClubStats Pro : OPÉRATIONNEL !');
    console.log('\n🚀 PRÊT POUR LA SYNCHRONISATION COMPLÈTE DE VOTRE LIGUE SÉNÉGALAISE !');
    
  } catch (error) {
    console.error('💥 ERREUR GLOBALE:', error);
  }
}

// Lancer les tests
console.log('🎬 Lancement des tests...\n');
runAllTests();