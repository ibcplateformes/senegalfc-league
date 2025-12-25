#!/bin/bash

echo "🔥 === MIGRATION RENDER POSTGRESQL - ClubStats Pro Style ==="
echo "🚀 Application des nouvelles statistiques automatiques"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis le répertoire racine du projet"
    exit 1
fi

echo "📋 1. Vérification de la configuration..."

# Vérifier que Prisma est installé
if ! command -v npx >/dev/null 2>&1; then
    echo "❌ Erreur: Node.js/npm n'est pas installé"
    exit 1
fi

echo "✅ Node.js et npm sont disponibles"

# Vérifier le fichier .env
if [ ! -f ".env" ]; then
    echo "❌ Erreur: Fichier .env non trouvé"
    echo "💡 Créez un fichier .env avec votre DATABASE_URL Render"
    echo "   DATABASE_URL=\"postgresql://username:password@hostname:port/database\""
    exit 1
fi

echo "✅ Fichier .env trouvé"

echo ""
echo "🗄️ 2. Application de la migration..."

# Générer le client Prisma
echo "🔄 Génération du client Prisma..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la génération du client Prisma"
    exit 1
fi

echo "✅ Client Prisma généré"

# Appliquer les migrations Prisma existantes
echo "🔄 Application des migrations Prisma..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'application des migrations Prisma"
    echo "💡 Vérifiez votre DATABASE_URL dans le fichier .env"
    exit 1
fi

echo "✅ Migrations Prisma appliquées"

# Appliquer notre migration personnalisée pour les nouvelles stats
echo "🔄 Application de la migration des statistiques étendues..."

# Utiliser Prisma pour exécuter notre SQL personnalisé
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function applyCustomMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Lecture du fichier de migration...');
    const migrationSQL = fs.readFileSync('migration-render-postgresql.sql', 'utf8');
    
    console.log('🔄 Exécution de la migration personnalisée...');
    await prisma.\$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Migration des statistiques étendues appliquée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

applyCustomMigration();
"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'application de la migration personnalisée"
    exit 1
fi

echo ""
echo "🎉 === MIGRATION TERMINÉE AVEC SUCCÈS ! ==="
echo ""
echo "📊 Statistiques automatiques configurées:"
echo "   ⚽ Stats offensives: buts, assists, tirs, précision, dribbles..."
echo "   🛡️ Stats défensives: tacles, interceptions, dégagements..."
echo "   🥅 Stats gardien: arrêts, clean sheets, sorties..."
echo "   📈 Stats avancées: passes, physique, forme, consistance..."
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Configurer votre DATABASE_URL avec vos identifiants Render"
echo "   2. Déployer sur Render avec les variables d'environnement"
echo "   3. Tester la synchronisation automatique"
echo ""
echo "🔧 Commandes utiles:"
echo "   npm run dev                    # Démarrer en développement"
echo "   npm run build                  # Construire pour production"
echo "   npx prisma studio             # Visualiser la base de données"
echo ""
echo "✨ Votre système est maintenant prêt pour la récupération automatique !"
echo "   Comme ClubStats Pro mais pour votre ligue sénégalaise ! 🇸🇳⚽"