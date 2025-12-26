#!/usr/bin/env node

// Test rapide de la nouvelle implémentation avec la vraie librairie
const { EAFCApiService } = require('eafc-clubs-api');

// Créer une instance du service pour test direct
const api = new EAFCApiService();

const PLATFORM_MAP = {
  'ps5': 'common-gen5',
  'ps4': 'common-gen4',
  'xboxseriesxs': 'common-gen5',
  'xboxone': 'common-gen4',
  'pc': 'common-gen5',
};

async function testNewImplementation() {
  console.log('🧪 === TEST NOUVELLE IMPLÉMENTATION EA SPORTS ===');
  console.log('📚 Utilise la vraie librairie eafc-clubs-api comme ClubStats Pro');
  console.log('');
  
  const CLUB_ID = '40142'; // HOF 221
  const PLATFORM = 'ps5';
  const apiPlatform = PLATFORM_MAP[PLATFORM];
  
  try {
    // Test 1: Infos du club
    console.log('1️⃣  Test récupération infos du club...');
    const clubInfoResponse = await api.clubInfo({
      clubIds: CLUB_ID,
      platform: apiPlatform
    });
    
    const clubInfo = clubInfoResponse[CLUB_ID];
    if (clubInfo) {
      console.log(`✅ Club trouvé: ${clubInfo.name}`);
      console.log(`   ID: ${CLUB_ID}`);
      console.log(`   Plateforme: ${PLATFORM} (${apiPlatform})`);
    } else {
      console.log('❌ Impossible de récupérer les infos du club');
    }
    console.log('');
    
    // Test 2: Stats des membres
    console.log('2️⃣  Test récupération stats des membres...');
    const memberStats = await api.memberCareerStats({
      clubId: CLUB_ID,
      platform: apiPlatform
    });
    
    if (memberStats && memberStats.members) {
      const members = Object.values(memberStats.members);
      console.log(`✅ ${members.length} membres trouvés`);
      
      // Afficher les top 3 buteurs
      const topScorers = members
        .filter(m => parseInt(m.goals) > 0)
        .sort((a, b) => parseInt(b.goals) - parseInt(a.goals))
        .slice(0, 3);
      
      if (topScorers.length > 0) {
        console.log('👥 Top buteurs:');
        topScorers.forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.name}: ${player.goals} buts, ${player.assists} passes`);
          console.log(`      Position: ${player.favoritePosition || 'N/A'}, Note: ${player.ratingAve || 0}`);
        });
      }
    } else {
      console.log('❌ Impossible de récupérer les stats des membres');
    }
    console.log('');
    
    // Test 3: Matchs du club
    console.log('3️⃣  Test récupération matchs du club...');
    const matches = await api.matchesStats({
      clubIds: CLUB_ID,
      platform: apiPlatform,
      matchType: 'leagueMatch'
    });
    
    if (Array.isArray(matches) && matches.length > 0) {
      console.log(`✅ ${matches.length} matchs récupérés`);
      
      console.log('⚽ Derniers matchs:');
      matches.slice(0, 3).forEach((match, index) => {
        const clubIds = Object.keys(match.clubs || {});
        const opponentId = clubIds.find(id => id !== CLUB_ID);
        const myClub = match.clubs[CLUB_ID];
        const opponentClub = match.clubs[opponentId];
        
        const myScore = myClub?.goals || 0;
        const opponentScore = opponentClub?.goals || 0;
        const opponentName = opponentClub?.details?.name || 'Unknown';
        
        console.log(`   ${index + 1}. vs ${opponentName}`);
        console.log(`      Score: ${myScore}-${opponentScore}`);
        console.log(`      Date: ${new Date(match.timestamp * 1000).toLocaleDateString('fr-FR')}`);
        console.log(`      Match ID: ${match.matchId}`);
      });
    } else {
      console.log('❌ Impossible de récupérer les matchs ou aucun match trouvé');
    }
    
    console.log('');
    console.log('🎉 === TEST TERMINÉ ===');
    
    // Résumé du succès
    const results = {
      clubInfo: !!clubInfo,
      members: memberStats && memberStats.members && Object.keys(memberStats.members).length > 0,
      matches: Array.isArray(matches) && matches.length > 0
    };
    
    const successCount = Object.values(results).filter(Boolean).length;
    console.log(`📊 Résultats: ${successCount}/3 tests réussis`);
    
    if (successCount >= 2) {
      console.log('✅ 🔥 LA VRAIE LIBRAIRIE FONCTIONNE ! Vous pouvez maintenant:');
      console.log('  1. Récupérer les infos des clubs sénégalais');
      console.log('  2. Synchroniser les stats des joueurs');
      console.log('  3. Récupérer l\'historique des matchs');
      console.log('');
      console.log('🚀 Prochaine étape: Déployez et testez la synchronisation dans SenegalFC League !');
    } else {
      console.log('⚠️  Certaines fonctions ne marchent pas encore. Vérifiez les erreurs ci-dessus.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('🔧 Vérifiez que la librairie eafc-clubs-api est bien installée:');
    console.error('   npm install eafc-clubs-api@1.2.0');
  }
}

// Lancer le test
testNewImplementation();
