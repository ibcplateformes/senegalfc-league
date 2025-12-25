const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ajouterClubsSenegalais() {
  console.log('🇸🇳 AJOUT AUTOMATIQUE DES CLUBS SÉNÉGALAIS');
  console.log('===========================================');
  console.log('');

  // Les vrais EA Club IDs sénégalais
  const nouveauxClubs = [
    {
      name: 'Lions de Dakar',
      eaClubId: '24000',
      platform: 'ps5',
      active: true
    },
    {
      name: 'Eagles de Thiès', 
      eaClubId: '29739',
      platform: 'ps5',
      active: true
    },
    {
      name: 'Téranga FC',
      eaClubId: '460504', 
      platform: 'ps5',
      active: true
    },
    {
      name: 'Warriors de Kaolack',
      eaClubId: '46871',
      platform: 'ps5', 
      active: true
    },
    {
      name: 'Stars de Ziguinchor',
      eaClubId: '1039553',
      platform: 'ps5',
      active: true
    }
  ];

  try {
    // Supprimer les anciens clubs de test (garder HOF 221)
    console.log('🗑️  Suppression des clubs de test...');
    const deleteResult = await prisma.leagueMatch.deleteMany({});
    console.log(`   ✅ ${deleteResult.count} matchs supprimés`);
    
    const deleteClubs = await prisma.leagueClub.deleteMany({
      where: {
        NOT: {
          eaClubId: '40142' // Garder HOF 221
        }
      }
    });
    console.log(`   ✅ ${deleteClubs.count} clubs de test supprimés`);

    // Ajouter les nouveaux clubs sénégalais
    console.log('');
    console.log('🏆 Ajout des clubs sénégalais...');
    
    for (const club of nouveauxClubs) {
      console.log(`📌 Ajout de: ${club.name} (ID: ${club.eaClubId})`);
      
      const nouveauClub = await prisma.leagueClub.create({
        data: {
          name: club.name,
          eaClubId: club.eaClubId,
          platform: club.platform,
          active: club.active,
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0
        }
      });
      
      console.log(`   ✅ Créé avec succès !`);
    }

    // Vérification
    console.log('');
    console.log('📊 VÉRIFICATION DES CLUBS :');
    const tousLesClubs = await prisma.leagueClub.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log(`   🏟️  ${tousLesClubs.length} clubs au total :`);
    tousLesClubs.forEach((club, index) => {
      console.log(`      ${index + 1}. ${club.name} → ID: ${club.eaClubId} (${club.active ? '✅' : '❌'})`);
    });

    console.log('');
    console.log('🎉 SUCCÈS ! Tous les clubs sénégalais sont ajoutés !');
    console.log('');
    console.log('🎯 PROCHAINES ÉTAPES :');
    console.log('1. 🌐 Ouvrez : http://localhost:3000/admin');
    console.log('2. 🔄 Cliquez "Sync Manuel"'); 
    console.log('3. ⏳ Attendez la synchronisation...');
    console.log('4. 🎮 Vérifiez les VRAIS matchs détectés !');
    console.log('5. ✅ Validez les matchs dans "Gestion des Matchs"');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ajouterClubsSenegalais();
