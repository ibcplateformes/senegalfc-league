const { EAFCClubs } = require('eafc-clubs-api');

async function testerClubsSenegalais() {
  console.log('🇸🇳 TEST DES CLUBS SÉNÉGALAIS EA SPORTS FC');
  console.log('==========================================');
  console.log('');
  
  const clubIds = [
    '40142', // HOF 221 (déjà confirmé)
    '24000',
    '29739', 
    '460504',
    '46871',
    '1039553'
  ];
  
  const clubsValides = [];
  const clubsErreur = [];
  
  console.log(`🔍 Test de ${clubIds.length} clubs...`);
  console.log('');
  
  for (const clubId of clubIds) {
    console.log(`🎯 Test Club ID: ${clubId}`);
    
    try {
      const eafc = new EAFCClubs();
      const clubInfo = await eafc.getClubInfo(clubId, 'common-gen5');
      
      if (clubInfo && clubInfo.name) {
        console.log(`✅ TROUVÉ !`);
        console.log(`   📛 Nom: ${clubInfo.name}`);
        console.log(`   🆔 ID: ${clubId}`);
        console.log(`   🎮 Plateforme: PS5 (common-gen5)`);
        
        clubsValides.push({
          id: clubId,
          nom: clubInfo.name,
          plateforme: 'ps5',
          eaClubId: clubId,
          active: true
        });
        
      } else {
        console.log(`❌ Aucune info trouvée`);
        clubsErreur.push({
          id: clubId,
          erreur: 'Pas d\'info retournée'
        });
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
      clubsErreur.push({
        id: clubId,
        erreur: error.message
      });
    }
    
    console.log('');
    // Petite pause pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Résumé
  console.log('📊 RÉSULTATS FINAUX');
  console.log('===================');
  console.log('');
  
  if (clubsValides.length > 0) {
    console.log(`✅ ${clubsValides.length} CLUBS VALIDES :`);
    clubsValides.forEach((club, index) => {
      console.log(`   ${index + 1}. ${club.nom} → ID: ${club.id}`);
    });
    console.log('');
  }
  
  if (clubsErreur.length > 0) {
    console.log(`❌ ${clubsErreur.length} CLUBS AVEC ERREUR :`);
    clubsErreur.forEach((club, index) => {
      console.log(`   ${index + 1}. ID ${club.id} → ${club.erreur}`);
    });
    console.log('');
  }
  
  // Générer le script d'insertion
  if (clubsValides.length > 0) {
    console.log('🎯 SCRIPT D\'AJOUT À LA LIGUE :');
    console.log('==============================');
    console.log('');
    
    const insertScript = clubsValides.map(club => {
      return `{
  name: '${club.nom}',
  eaClubId: '${club.id}',
  platform: 'ps5',
  active: true
}`;
    }).join(',\n\n');
    
    console.log('Ajoutez ces clubs à votre ligue :');
    console.log('');
    console.log('[');
    console.log(insertScript);
    console.log(']');
  }
  
  return {
    clubsValides,
    clubsErreur
  };
}

// Test direct si exécuté
if (require.main === module) {
  testerClubsSenegalais()
    .then(resultats => {
      console.log('');
      console.log('🎉 Test terminé !');
      console.log(`✅ ${resultats.clubsValides.length} clubs prêts pour la ligue`);
    })
    .catch(error => {
      console.error('❌ Erreur générale:', error);
    });
}

module.exports = { testerClubsSenegalais };
