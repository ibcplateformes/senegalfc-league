const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🇸🇳 Configuration des VRAIS clubs sénégalais...');

  // Supprimer les clubs de test
  console.log('🗑️  Suppression des clubs de test...');
  await prisma.leagueMatch.deleteMany({});
  await prisma.leagueClub.deleteMany({});

  // Insérer les VRAIS clubs sénégalais
  console.log('🏆 Création des VRAIS clubs sénégalais...');
  
  const realClubs = [
    {
      name: 'HOF 221', // Le club principal de Diame
      eaClubId: '40142', // Vrai ID confirmé
      platform: 'ps5',
      active: true
    },
    // Ajouter ici les autres vrais clubs sénégalais
    // Les IDs ci-dessous sont des exemples - à remplacer par les vrais
    {
      name: 'Dakar Lions FC',
      eaClubId: 'ID_REEL_1', // À remplacer par le vrai ID
      platform: 'ps5',
      active: false // Inactif jusqu'à confirmation de l'ID
    },
    {
      name: 'Thiès Eagles', 
      eaClubId: 'ID_REEL_2', // À remplacer par le vrai ID
      platform: 'ps5',
      active: false
    },
    {
      name: 'Saint-Louis Téranga',
      eaClubId: 'ID_REEL_3', // À remplacer par le vrai ID
      platform: 'ps5', 
      active: false
    },
    {
      name: 'Kaolack United',
      eaClubId: 'ID_REEL_4', // À remplacer par le vrai ID
      platform: 'ps5',
      active: false
    },
    {
      name: 'Ziguinchor FC',
      eaClubId: 'ID_REEL_5', // À remplacer par le vrai ID
      platform: 'ps5',
      active: false
    }
  ];

  // Insérer chaque club
  for (const club of realClubs) {
    console.log(`📌 Création du club: ${club.name} (ID: ${club.eaClubId})`);
    await prisma.leagueClub.create({
      data: club
    });
  }

  console.log('✅ Configuration terminée !');
  console.log('');
  console.log('🎯 PROCHAINES ÉTAPES :');
  console.log('1. Obtenez les VRAIS EA Club IDs des autres clubs');
  console.log('2. Remplacez "ID_REEL_X" par les vrais IDs');
  console.log('3. Activez les clubs (active: true)');
  console.log('4. Lancez une sync pour tester');
  console.log('');
  console.log('🏆 Seul HOF 221 est actif pour le moment');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
