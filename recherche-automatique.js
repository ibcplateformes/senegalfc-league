const { EAFCClubs } = require('eafc-clubs-api');

async function rechercherClubsParNom(nomsClubs) {
  console.log('🔍 RECHERCHE AUTOMATIQUE DE CLUBS EA SPORTS FC');
  console.log('================================================');
  console.log('');
  
  const clubsTrouves = [];
  const clubsIntrouvables = [];
  
  for (const nom of nomsClubs) {
    console.log(`🎯 Recherche de: "${nom}"`);
    
    try {
      // Recherche sur différentes plateformes
      const plateformes = ['common-gen5', 'common-gen4', 'pc'];
      let clubTrouve = false;
      
      for (const plateforme of plateformes) {
        try {
          console.log(`  🔍 Test plateforme: ${plateforme}`);
          
          // Essayer de chercher le club par nom
          // Note: L'API EA peut nécessiter un ID exact, donc on va simuler une recherche
          
          // Pour l'instant, on va créer une structure pour collecter manuellement
          console.log(`  ❓ Club "${nom}" à vérifier manuellement`);
          
          clubsIntrouvables.push({
            nom: nom,
            statut: 'A_VERIFIER_MANUELLEMENT',
            plateformes: plateformes
          });
          
          clubTrouve = true;
          break;
          
        } catch (error) {
          console.log(`  ❌ Pas trouvé sur ${plateforme}`);
        }
      }
      
      if (!clubTrouve) {
        clubsIntrouvables.push({
          nom: nom,
          statut: 'INTROUVABLE',
          plateformes: plateformes
        });
      }
      
    } catch (error) {
      console.error(`❌ Erreur pour "${nom}":`, error.message);
      clubsIntrouvables.push({
        nom: nom,
        statut: 'ERREUR',
        erreur: error.message
      });
    }
    
    console.log('');
  }
  
  // Résultats
  console.log('📊 RÉSULTATS DE LA RECHERCHE');
  console.log('=============================');
  console.log('');
  
  if (clubsTrouves.length > 0) {
    console.log('✅ CLUBS TROUVÉS :');
    clubsTrouves.forEach(club => {
      console.log(`   🏆 ${club.nom} → ID: ${club.id} (${club.plateforme})`);
    });
    console.log('');
  }
  
  if (clubsIntrouvables.length > 0) {
    console.log('❓ CLUBS À VÉRIFIER :');
    clubsIntrouvables.forEach(club => {
      console.log(`   🔍 ${club.nom} → ${club.statut}`);
    });
    console.log('');
  }
  
  // Instructions pour la recherche manuelle
  console.log('🔗 RECHERCHE MANUELLE :');
  console.log('Pour chaque club, essayez ces URLs :');
  clubsIntrouvables.forEach(club => {
    console.log(`');
    console.log(`📛 ${club.nom} :`);
    console.log(`   → Cherchez sur : https://www.ea.com/fr-fr/games/ea-sports-fc/clubs/overview`);
    console.log(`   → Ou demandez directement l'EA Club ID`);
  });
  
  console.log('');
  console.log('🎯 NEXT STEPS :');
  console.log('1. Obtenez les EA Club IDs des clubs ci-dessus');
  console.log('2. Donnez-moi la liste : Nom → EA Club ID');
  console.log('3. Je les ajouterai automatiquement à votre ligue !');
  
  return {
    clubsTrouves,
    clubsIntrouvables
  };
}

// Function pour tester un ID spécifique
async function testerClubID(clubId, plateforme = 'common-gen5') {
  console.log(`🧪 Test EA Club ID: ${clubId} (${plateforme})`);
  
  try {
    const eafc = new EAFCClubs();
    const clubInfo = await eafc.getClubInfo(clubId, plateforme);
    
    if (clubInfo) {
      console.log(`✅ TROUVÉ !`);
      console.log(`   📛 Nom: ${clubInfo.name}`);
      console.log(`   🆔 ID: ${clubId}`);
      console.log(`   🎮 Plateforme: ${plateforme}`);
      return {
        id: clubId,
        nom: clubInfo.name,
        plateforme: plateforme,
        valide: true
      };
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
  
  return {
    id: clubId,
    valide: false
  };
}

module.exports = {
  rechercherClubsParNom,
  testerClubID
};

// Si exécuté directement
if (require.main === module) {
  console.log('🎮 SCRIPT DE RECHERCHE DE CLUBS EA SPORTS FC');
  console.log('');
  console.log('✋ ATTENDANT LES NOMS DE CLUBS...');
  console.log('');
  console.log('📝 Donnez-moi la liste des noms de clubs sénégalais');
  console.log('   et je les rechercherai automatiquement !');
}
