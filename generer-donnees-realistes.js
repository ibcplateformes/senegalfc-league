// Système de génération de données réalistes pour vos clubs
console.log('🎯 GÉNÉRATION DE DONNÉES RÉALISTES POUR VOS CLUBS');

// Vos vrais clubs sénégalais avec leurs EA Club IDs
const vraisClubs = [
  { id: '40142', nom: 'HOF 221', niveau: 'elite' },
  { id: '24000', nom: 'Lions de Dakar', niveau: 'fort' },
  { id: '29739', nom: 'Eagles de Thiès', niveau: 'moyen' },
  { id: '460504', nom: 'Téranga FC', niveau: 'moyen' },
  { id: '46871', nom: 'Warriors de Kaolack', niveau: 'faible' },
  { id: '1039553', nom: 'Stars de Ziguinchor', niveau: 'faible' }
];

// Fonction pour générer des stats réalistes
function genererStatsRealistesClub(club) {
  const niveaux = {
    'elite': { winRate: 0.7, goalsPerGame: 2.5, concededPerGame: 1.2 },
    'fort': { winRate: 0.6, goalsPerGame: 2.1, concededPerGame: 1.5 },
    'moyen': { winRate: 0.4, goalsPerGame: 1.6, concededPerGame: 1.8 },
    'faible': { winRate: 0.25, goalsPerGame: 1.2, concededPerGame: 2.2 }
  };
  
  const niveau = niveaux[club.niveau];
  const matchsJoues = Math.floor(Math.random() * 8) + 5; // 5-12 matchs
  
  const victoires = Math.floor(matchsJoues * niveau.winRate);
  const nuls = Math.floor((matchsJoues - victoires) * 0.3);
  const defaites = matchsJoues - victoires - nuls;
  
  const butsMarques = Math.floor(matchsJoues * niveau.goalsPerGame);
  const butsEncaisses = Math.floor(matchsJoues * niveau.concededPerGame);
  
  return {
    id: club.id,
    nom: club.nom,
    matchsJoues,
    victoires,
    nuls,
    defaites,
    butsMarques,
    butsEncaisses,
    points: (victoires * 3) + nuls,
    stats: {
      winRate: Math.round((victoires / matchsJoues) * 100),
      goalsPerGame: Math.round((butsMarques / matchsJoues) * 10) / 10,
      concededPerGame: Math.round((butsEncaisses / matchsJoues) * 10) / 10
    }
  };
}

// Fonction pour générer des matchs réalistes entre clubs
function genererMatchsEntreClubs(clubs) {
  const matchs = [];
  const maintenant = new Date();
  
  for (let i = 0; i < clubs.length; i++) {
    for (let j = i + 1; j < clubs.length; j++) {
      const club1 = clubs[i];
      const club2 = clubs[j];
      
      // Probabilité de match entre ces clubs (plus élevée si niveaux similaires)
      if (Math.random() > 0.3) { // 70% de chance qu'ils se soient affrontés
        
        const scoreClub1 = Math.floor(Math.random() * 4); // 0-3 buts
        const scoreClub2 = Math.floor(Math.random() * 4);
        
        // Ajuster selon le niveau
        const bonusClub1 = club1.niveau === 'elite' ? 1 : club1.niveau === 'fort' ? 0.5 : 0;
        const bonusClub2 = club2.niveau === 'elite' ? 1 : club2.niveau === 'fort' ? 0.5 : 0;
        
        const scoreFinal1 = Math.min(5, scoreClub1 + Math.floor(bonusClub1));
        const scoreFinal2 = Math.min(5, scoreClub2 + Math.floor(bonusClub2));
        
        // Date aléatoire dans les 30 derniers jours
        const joursEcoules = Math.floor(Math.random() * 30);
        const dateMatch = new Date(maintenant.getTime() - (joursEcoules * 24 * 60 * 60 * 1000));
        
        matchs.push({
          homeClub: club1.nom,
          homeClubId: club1.id,
          awayClub: club2.nom,
          awayClubId: club2.id,
          homeScore: scoreFinal1,
          awayScore: scoreFinal2,
          date: dateMatch,
          competition: 'Ligue Sénégalaise FC',
          matchId: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }
  }
  
  return matchs;
}

// Générer les données pour tous vos clubs
console.log('📊 Génération des stats réalistes...');
const statsClubs = vraisClubs.map(genererStatsRealistesClub);

console.log('\n🏆 STATS GÉNÉRÉES POUR VOS CLUBS :');
console.log('================================');
statsClubs.forEach((club, index) => {
  console.log(`\n${index + 1}. ${club.nom} (EA ID: ${club.id})`);
  console.log(`   📊 ${club.matchsJoues} matchs | ${club.victoires}V ${club.nuls}N ${club.defaites}D`);
  console.log(`   ⚽ ${club.butsMarques} BP | ${club.butsEncaisses} BC | ${club.points} pts`);
  console.log(`   📈 ${club.stats.winRate}% victoires | ${club.stats.goalsPerGame} buts/match`);
});

// Générer les matchs entre vos clubs
console.log('\n⚽ MATCHS GÉNÉRÉS ENTRE VOS CLUBS :');
console.log('==================================');
const matchsEntreClubs = genererMatchsEntreClubs(vraisClubs);

matchsEntreClubs.forEach((match, index) => {
  console.log(`\n${index + 1}. ${match.homeClub} ${match.homeScore} - ${match.awayScore} ${match.awayClub}`);
  console.log(`   📅 ${match.date.toLocaleDateString('fr-FR')}`);
  console.log(`   🆔 Match ID: ${match.matchId}`);
});

console.log('\n🎉 SYSTÈME DE DONNÉES RÉALISTES CRÉÉ !');
console.log('=====================================');
console.log('✅ 6 clubs avec stats réalistes basées sur leurs niveaux');
console.log(`✅ ${matchsEntreClubs.length} matchs générés entre vos clubs`);
console.log('✅ Dates réalistes (30 derniers jours)');
console.log('✅ Scores cohérents selon les niveaux des clubs');

console.log('\n🚀 PROCHAINE ÉTAPE : IMPORT EN BASE');
console.log('Voulez-vous importer ces données réalistes dans votre ligue ?');
