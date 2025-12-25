const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Joueurs de test pour chaque club sénégalais
const testPlayers = {
  // HOF 221 (Chelsea-themed) - Formation 4-3-3
  'HOF 221': [
    { name: 'Kepa Mendy', position: 'GK', number: 1 },
    { name: 'Thiago Silva', position: 'DEF', number: 6 },
    { name: 'Kalidou Koulibaly', position: 'DEF', number: 26 },
    { name: 'Ben Chilwell', position: 'DEF', number: 21 },
    { name: 'Reece James', position: 'DEF', number: 24 },
    { name: 'N\'Golo Kanté', position: 'MID', number: 7 },
    { name: 'Mateo Kovačić', position: 'MID', number: 8 },
    { name: 'Mason Mount', position: 'MID', number: 19 },
    { name: 'Raheem Sterling', position: 'ATT', number: 17 },
    { name: 'Kai Havertz', position: 'ATT', number: 29 },
    { name: 'Timo Werner', position: 'ATT', number: 11 }
  ],

  // BUUR MFC - Formation 4-2-3-1
  'BUUR MFC': [
    { name: 'Édouard Mendy', position: 'GK', number: 16 },
    { name: 'Pape Abou Cissé', position: 'DEF', number: 4 },
    { name: 'Moussa Wagué', position: 'DEF', number: 2 },
    { name: 'Saliou Ciss', position: 'DEF', number: 14 },
    { name: 'Bouna Sarr', position: 'DEF', number: 20 },
    { name: 'Idrissa Gueye', position: 'MID', number: 5 },
    { name: 'Cheikhou Kouyaté', position: 'MID', number: 8 },
    { name: 'Ismaïla Sarr', position: 'MID', number: 18 },
    { name: 'Krepin Diatta', position: 'MID', number: 15 },
    { name: 'Sadio Mané', position: 'ATT', number: 10 },
    { name: 'Boulaye Dia', position: 'ATT', number: 9 }
  ],

  // NEK BI - Formation 3-5-2  
  'NEK BI': [
    { name: 'Alioune Badara Faty', position: 'GK', number: 1 },
    { name: 'Youssouf Sabaly', position: 'DEF', number: 12 },
    { name: 'Abdou Diallo', position: 'DEF', number: 22 },
    { name: 'Formose Mendy', position: 'DEF', number: 3 },
    { name: 'Fodé Ballo-Touré', position: 'MID', number: 18 },
    { name: 'Pape Matar Sarr', position: 'MID', number: 26 },
    { name: 'Nampalys Mendy', position: 'MID', number: 6 },
    { name: 'Moussa Niakhaté', position: 'MID', number: 19 },
    { name: 'Papa Gueye', position: 'MID', number: 21 },
    { name: 'Famara Diédhiou', position: 'ATT', number: 9 },
    { name: 'Habib Diallo', position: 'ATT', number: 25 }
  ]
};

async function addTestPlayers() {
  try {
    console.log('🚀 Ajout de joueurs de test...');

    // Récupérer tous les clubs
    const clubs = await prisma.leagueClub.findMany();
    console.log(`📋 ${clubs.length} clubs trouvés`);

    let totalPlayersAdded = 0;

    for (const club of clubs) {
      console.log(`\n⚽ Traitement du club: ${club.name}`);

      // Vérifier si des joueurs de test existent pour ce club
      const playersData = testPlayers[club.name];
      
      if (!playersData) {
        console.log(`ℹ️  Pas de joueurs de test définis pour ${club.name}`);
        continue;
      }

      // Vérifier si le club a déjà des joueurs
      const existingPlayersCount = await prisma.player.count({
        where: { clubId: club.id }
      });

      if (existingPlayersCount > 0) {
        console.log(`ℹ️  ${club.name} a déjà ${existingPlayersCount} joueur(s), ignoré`);
        continue;
      }

      // Ajouter les joueurs
      for (const playerData of playersData) {
        try {
          // Générer quelques stats aléatoires pour rendre les données intéressantes
          const randomStats = {
            goals: Math.floor(Math.random() * 8), // 0-7 buts
            assists: Math.floor(Math.random() * 6), // 0-5 passes D
            matchesPlayed: Math.floor(Math.random() * 5) + 1, // 1-5 matchs
            averageRating: parseFloat((Math.random() * 2 + 7).toFixed(1)), // 7.0-9.0
            yellowCards: Math.floor(Math.random() * 3), // 0-2 cartons jaunes
          };

          const player = await prisma.player.create({
            data: {
              clubId: club.id,
              name: playerData.name,
              position: playerData.position,
              number: playerData.number,
              
              // Stats générées aléatoirement
              matchesPlayed: randomStats.matchesPlayed,
              minutesPlayed: randomStats.matchesPlayed * 90,
              goals: randomStats.goals,
              assists: randomStats.assists,
              averageRating: randomStats.averageRating,
              yellowCards: randomStats.yellowCards,
              
              // Stats spécifiques par position
              ...(playerData.position === 'GK' ? {
                saves: Math.floor(Math.random() * 15) + 5, // 5-19 arrêts
                goalsConceded: Math.floor(Math.random() * 4), // 0-3 buts encaissés
                cleanSheets: Math.floor(Math.random() * 3) + 1, // 1-3 clean sheets
              } : {}),
              
              ...(playerData.position === 'DEF' ? {
                tackles: Math.floor(Math.random() * 10) + 5, // 5-14 tacles
                interceptions: Math.floor(Math.random() * 8) + 3, // 3-10 interceptions
                clearances: Math.floor(Math.random() * 12) + 8, // 8-19 dégagements
              } : {}),
              
              ...(playerData.position === 'MID' ? {
                shots: Math.floor(Math.random() * 8) + 2, // 2-9 tirs
                shotsOnTarget: Math.floor(Math.random() * 4) + 1, // 1-4 tirs cadrés
                dribbles: Math.floor(Math.random() * 6) + 3, // 3-8 dribbles
              } : {}),
              
              ...(playerData.position === 'ATT' ? {
                shots: Math.floor(Math.random() * 12) + 5, // 5-16 tirs
                shotsOnTarget: Math.floor(Math.random() * 8) + 3, // 3-10 tirs cadrés
                dribbles: Math.floor(Math.random() * 8) + 4, // 4-11 dribbles
              } : {})
            }
          });

          console.log(`  ✅ ${playerData.name} (${playerData.position}) ajouté`);
          totalPlayersAdded++;

        } catch (error) {
          console.error(`  ❌ Erreur ajout ${playerData.name}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Ajout terminé ! ${totalPlayersAdded} joueurs ajoutés au total.`);

    // Afficher un résumé par club
    console.log('\n📊 Résumé par club:');
    for (const club of clubs) {
      const playerCount = await prisma.player.count({
        where: { clubId: club.id }
      });
      console.log(`  ${club.name}: ${playerCount} joueurs`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des joueurs de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
addTestPlayers();