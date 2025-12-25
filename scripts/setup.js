const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de SenegalFC League...');

  // 1. Créer la configuration de base
  console.log('⚙️  Création de la configuration...');
  await prisma.leagueConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      leagueName: 'Ligue Sénégalaise FC',
      season: '2025',
      autoSync: true,
      syncInterval: 7200, // 2 heures
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0
    }
  });

  // 2. Créer quelques clubs de test
  console.log('🏟️  Création des clubs de test...');
  const clubs = [
    {
      name: 'HOF 221',
      eaClubId: '40142',
      platform: 'ps5',
      active: true
    },
    {
      name: 'Dakar FC',
      eaClubId: '12345',
      platform: 'ps5',
      active: true
    },
    {
      name: 'Thiès United',
      eaClubId: '23456',
      platform: 'ps5', 
      active: true
    },
    {
      name: 'Saint-Louis SC',
      eaClubId: '34567',
      platform: 'ps5',
      active: true
    },
    {
      name: 'Kaolack Warriors',
      eaClubId: '45678',
      platform: 'ps5',
      active: true
    },
    {
      name: 'Ziguinchor Stars',
      eaClubId: '56789',
      platform: 'ps5',
      active: true
    }
  ];

  const createdClubs = [];
  
  for (const clubData of clubs) {
    const club = await prisma.leagueClub.upsert({
      where: { eaClubId: clubData.eaClubId },
      update: {},
      create: clubData
    });
    createdClubs.push(club);
    console.log(`✅ Club créé: ${club.name} (${club.eaClubId})`);
  }

  // 3. Créer quelques matchs de test
  console.log('⚽ Création de matchs de test...');
  const testMatches = [
    {
      homeClubId: createdClubs[0].id, // HOF 221
      awayClubId: createdClubs[1].id, // Dakar FC
      homeScore: 3,
      awayScore: 1,
      playedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
      validated: true
    },
    {
      homeClubId: createdClubs[2].id, // Thiès United
      awayClubId: createdClubs[3].id, // Saint-Louis SC
      homeScore: 2,
      awayScore: 0,
      playedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Il y a 1 jour
      validated: true
    },
    {
      homeClubId: createdClubs[4].id, // Kaolack Warriors
      awayClubId: createdClubs[5].id, // Ziguinchor Stars
      homeScore: 1,
      awayScore: 3,
      playedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // Il y a 12h
      validated: false // En attente de validation
    }
  ];

  for (const matchData of testMatches) {
    await prisma.leagueMatch.create({ data: matchData });
    
    const homeClub = createdClubs.find(c => c.id === matchData.homeClubId);
    const awayClub = createdClubs.find(c => c.id === matchData.awayClubId);
    
    console.log(`⚽ Match créé: ${homeClub?.name} ${matchData.homeScore}-${matchData.awayScore} ${awayClub?.name} ${matchData.validated ? '✅' : '⏳'}`);
  }

  // 4. Recalculer les statistiques
  console.log('📊 Recalcul des statistiques...');
  
  // Fonction simple pour recalculer les stats (version simplifiée)
  for (const club of createdClubs) {
    const homeMatches = await prisma.leagueMatch.findMany({
      where: { homeClubId: club.id, validated: true }
    });
    
    const awayMatches = await prisma.leagueMatch.findMany({
      where: { awayClubId: club.id, validated: true }
    });
    
    let points = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    
    // Matchs à domicile
    homeMatches.forEach(match => {
      goalsFor += match.homeScore;
      goalsAgainst += match.awayScore;
      
      if (match.homeScore > match.awayScore) {
        wins++;
        points += 3;
      } else if (match.homeScore === match.awayScore) {
        draws++;
        points += 1;
      } else {
        losses++;
      }
    });
    
    // Matchs à l'extérieur
    awayMatches.forEach(match => {
      goalsFor += match.awayScore;
      goalsAgainst += match.homeScore;
      
      if (match.awayScore > match.homeScore) {
        wins++;
        points += 3;
      } else if (match.awayScore === match.homeScore) {
        draws++;
        points += 1;
      } else {
        losses++;
      }
    });
    
    await prisma.leagueClub.update({
      where: { id: club.id },
      data: {
        points,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst
      }
    });
    
    console.log(`📈 ${club.name}: ${points} pts (${wins}V ${draws}N ${losses}D)`);
  }

  // 5. Créer une annonce de bienvenue
  console.log('📢 Création de l\'annonce de bienvenue...');
  await prisma.announcement.create({
    data: {
      title: '🎉 Bienvenue dans la Ligue Sénégalaise FC !',
      content: `La Ligue Sénégalaise EA Sports FC est officiellement lancée ! 

Les clubs participants peuvent désormais suivre leur classement en temps réel. 

Les admins peuvent synchroniser automatiquement les résultats depuis EA Sports et gérer la compétition depuis le dashboard admin.

Que le meilleur club gagne ! 🏆`,
      type: 'important',
      published: true
    }
  });

  console.log('🏁 Setup terminé avec succès !');
  console.log('');
  console.log('📋 Récapitulatif:');
  console.log(`• ${clubs.length} clubs créés`);
  console.log(`• ${testMatches.length} matchs de test`);
  console.log(`• 1 annonce de bienvenue`);
  console.log(`• Configuration de base`);
  console.log('');
  console.log('🔗 Prochaines étapes:');
  console.log('1. Configurer DATABASE_URL dans .env');
  console.log('2. Lancer: npm run dev');
  console.log('3. Ouvrir: http://localhost:3000');
  console.log('4. Admin: http://localhost:3000/admin');
  console.log('');
  console.log('🎯 La ligue est prête ! ⚽');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du setup:', e);
    await prisma.$disconnect();
    process.exit(1);
  });