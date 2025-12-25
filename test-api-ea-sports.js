// Test direct des EA Club IDs pour diagnostiquer le problème
const clubIds = [
  { id: '40142', nom: 'HOF 221' },
  { id: '24000', nom: 'Lions de Dakar' },
  { id: '29739', nom: 'Eagles de Thiès' },
  { id: '460504', nom: 'Téranga FC' },
  { id: '46871', nom: 'Warriors de Kaolack' },
  { id: '1039553', nom: 'Stars de Ziguinchor' }
];

async function testerAPIDirecte() {
  console.log('🧪 TEST DIRECT API EA SPORTS FC');
  console.log('===============================');
  console.log('');

  try {
    // Test 1: Vérifier si la lib est bien installée
    console.log('📦 Test 1: Vérification de la lib eafc-clubs-api...');
    
    const { EAFCClubs } = require('eafc-clubs-api');
    const eafc = new EAFCClubs();
    
    console.log('   ✅ Lib chargée avec succès');
    console.log('');

    // Test 2: Tester chaque Club ID sur différentes plateformes
    console.log('🎮 Test 2: Test des EA Club IDs...');
    
    const plateformes = [
      { code: 'common-gen5', nom: 'PlayStation 5' },
      { code: 'common-gen4', nom: 'PlayStation 4' }, 
      { code: 'pc', nom: 'PC' },
      { code: 'xbox', nom: 'Xbox' }
    ];

    for (const club of clubIds) {
      console.log(`\n🏆 Test du club: ${club.nom} (ID: ${club.id})`);
      
      let clubTrouve = false;
      
      for (const plateforme of plateformes) {
        try {
          console.log(`   🔍 Test ${plateforme.nom}...`);
          
          const clubInfo = await eafc.getClubInfo(club.id, plateforme.code);
          
          if (clubInfo && clubInfo.name) {
            console.log(`   ✅ TROUVÉ sur ${plateforme.nom} !`);
            console.log(`      📛 Nom: ${clubInfo.name}`);
            console.log(`      🆔 ID: ${clubInfo.clubId || club.id}`);
            console.log(`      🎮 Plateforme: ${plateforme.nom}`);
            
            // Tester récupération des matchs
            try {
              const matches = await eafc.getClubMatches(club.id, plateforme.code, { limit: 3 });
              console.log(`      ⚽ Matchs récents: ${matches?.length || 0}`);
              
              if (matches && matches.length > 0) {
                console.log(`      🎯 Dernier match: ${JSON.stringify(matches[0], null, 2)}`);
              }
            } catch (matchError) {
              console.log(`      ❌ Erreur récupération matchs: ${matchError.message}`);
            }
            
            clubTrouve = true;
            break; // On a trouvé le club, on passe au suivant
          }
        } catch (error) {
          console.log(`   ❌ Pas trouvé sur ${plateforme.nom}: ${error.message}`);
        }
      }
      
      if (!clubTrouve) {
        console.log(`   🚨 CLUB NON TROUVÉ sur aucune plateforme !`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('');
    console.log('🔧 SOLUTIONS POSSIBLES :');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. L\'API EA Sports peut être temporairement indisponible');
    console.log('3. Les EA Club IDs peuvent être incorrects');
    console.log('4. Les clubs peuvent être sur d\'autres plateformes');
  }

  console.log('');
  console.log('📋 RÉSUMÉ DU DIAGNOSTIC :');
  console.log('=========================');
  console.log('Si aucun club n\'est trouvé, alors :');
  console.log('• Les EA Club IDs ne sont pas valides');
  console.log('• Ou l\'API EA Sports a des problèmes');
  console.log('• Ou les clubs sont sur d\'autres plateformes');
  console.log('');
  console.log('Si des clubs sont trouvés, alors la sync devrait fonctionner !');
}

// Lancer le test
testerAPIDirecte()
  .then(() => {
    console.log('');
    console.log('🎯 Test terminé !');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
