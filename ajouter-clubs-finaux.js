const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ajouterClubsManuellement() {
  console.log('🇸🇳 AJOUT RAPIDE DES CLUBS SÉNÉGALAIS RÉELS');
  console.log('=========================================');

  try {
    // Supprimer tous les clubs sauf HOF 221 (si on veut restart clean)
    console.log('🗑️  Nettoyage des anciens clubs...');
    await prisma.leagueMatch.deleteMany({});
    
    const deleteCount = await prisma.leagueClub.deleteMany({
      where: {
        NOT: {
          eaClubId: '40142' // Garder HOF 221
        }
      }
    });
    console.log(`   ✅ ${deleteCount.count} anciens clubs supprimés`);

    // Ajouter les nouveaux clubs avec vos EA Club IDs
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

    console.log('🏆 Ajout des nouveaux clubs...');
    for (const club of nouveauxClubs) {
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
      
      console.log(`   ✅ ${club.name} ajouté (EA ID: ${club.eaClubId})`);
    }

    // Vérification finale
    const totalClubs = await prisma.leagueClub.findMany({
      select: { name: true, eaClubId: true, active: true },
      orderBy: { name: 'asc' }
    });

    console.log('');
    console.log('📊 CLUBS EN LIGUE :');
    totalClubs.forEach((club, index) => {
      console.log(`   ${index + 1}. ${club.name} → EA ID: ${club.eaClubId} ${club.active ? '✅' : '❌'}`);
    });

    console.log('');
    console.log('🎉 SUCCÈS ! TOUS VOS CLUBS SONT PRÊTS !');
    console.log('');
    console.log('🎯 PROCHAINE ÉTAPE : SYNC DES MATCHS RÉELS');
    console.log('1. 🌐 Allez sur : http://localhost:3000/admin');
    console.log('2. 🔄 Cliquez "Sync Manuel"');
    console.log('3. ⚽ Découvrez vos VRAIES données EA Sports !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ajouterClubsManuellement();
