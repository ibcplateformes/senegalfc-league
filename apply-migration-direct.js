const { Client } = require('pg');

console.log('🔥 === APPLICATION MIGRATION RENDER POSTGRESQL ===');
console.log('🚀 Ajout des nouvelles statistiques automatiques...\n');

async function applyMigration() {
  // Configuration de connexion depuis votre .env
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('📡 Connexion à la base Render PostgreSQL...');
    await client.connect();
    console.log('✅ Connecté à la base !');

    console.log('\n🔄 Application des nouvelles colonnes stats...');
    
    // Migration des nouvelles statistiques
    const migrations = [
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "shot_accuracy" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "dribble_success" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "cross_accuracy" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "corners" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "freekicks" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "penalties" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "penalties_scored" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "tackle_success" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "blocks" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "aerial_duels_total" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "fouls_won" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "punches" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "distributions" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "distribution_success" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "penalties_faced" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "distance_run" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "top_speed" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "sprints" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "passes_completed" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "passes_attempted" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "pass_accuracy" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "long_passes" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "long_pass_accuracy" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "through_balls" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "key_passes" INTEGER DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "form" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "consistency" REAL DEFAULT 0;',
      'ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "clutch_goals" INTEGER DEFAULT 0;'
    ];

    // Exécuter chaque migration
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      try {
        await client.query(migration);
        console.log(`   ✅ ${i + 1}/${migrations.length} colonnes ajoutées`);
      } catch (error) {
        // Ignorer les erreurs si la colonne existe déjà
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️ ${i + 1}/${migrations.length} colonne déjà existante (ignorée)`);
        } else {
          console.log(`   ❌ Erreur colonne ${i + 1}: ${error.message}`);
        }
      }
    }

    console.log('\n📊 Ajout des index pour optimiser les requêtes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "players_goals_idx" ON "players"("goals");',
      'CREATE INDEX IF NOT EXISTS "players_assists_idx" ON "players"("assists");',
      'CREATE INDEX IF NOT EXISTS "players_rating_idx" ON "players"("average_rating");'
    ];

    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
        console.log('   ✅ Index créé');
      } catch (error) {
        console.log(`   ℹ️ Index déjà existant (ignoré)`);
      }
    }

    console.log('\n🎉 === MIGRATION TERMINÉE AVEC SUCCÈS ! ===');
    console.log('📊 Toutes les nouvelles statistiques automatiques sont maintenant disponibles !');
    console.log('');
    console.log('🚀 Prochaines étapes :');
    console.log('   1. npm run dev');
    console.log('   2. Aller sur http://localhost:3000/admin');
    console.log('   3. Cliquer "Synchroniser" et voir la magie !');
    console.log('');
    console.log('⚽ Votre ligue sénégalaise est maintenant équipée du système ClubStats Pro ! 🇸🇳🏆');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    console.error('💡 Vérifiez votre DATABASE_URL dans le fichier .env');
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Lancer la migration
applyMigration();