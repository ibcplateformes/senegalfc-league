#!/bin/bash

echo "🏆 SenegalFC League - Vérification de l'installation"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de vérification
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 est installé${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 n'est pas installé${NC}"
        return 1
    fi
}

# Vérification des prérequis
echo "🔍 Vérification des prérequis:"
echo ""

check_command node
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "   ${BLUE}Version Node.js: $NODE_VERSION${NC}"
fi

check_command npm
NPM_VERSION=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "   ${BLUE}Version npm: $NPM_VERSION${NC}"
fi

echo ""

# Vérification des fichiers
echo "📁 Vérification des fichiers:"
echo ""

files_to_check=(
    "package.json"
    "prisma/schema.prisma"
    ".env"
    "app/page.tsx"
    "app/admin/page.tsx"
    "lib/prisma.ts"
    "lib/ea-sports.ts"
    "scripts/setup.js"
)

all_files_ok=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file manquant${NC}"
        all_files_ok=false
    fi
done

echo ""

# Vérification des dépendances
echo "📦 Vérification des dépendances:"
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules présent${NC}"
    
    # Vérifier quelques packages clés
    key_packages=("next" "prisma" "@prisma/client" "eafc-clubs-api" "lucide-react")
    
    for package in "${key_packages[@]}"; do
        if [ -d "node_modules/$package" ]; then
            echo -e "${GREEN}✅ $package installé${NC}"
        else
            echo -e "${YELLOW}⚠️  $package manquant${NC}"
        fi
    done
else
    echo -e "${RED}❌ node_modules manquant - Lancez: npm install${NC}"
    all_files_ok=false
fi

echo ""

# Vérification de la base de données
echo "🗄️  Vérification de la configuration:"
echo ""

if grep -q "DATABASE_URL" .env; then
    db_url=$(grep "DATABASE_URL" .env | cut -d '=' -f2- | tr -d '"')
    if [[ $db_url == "postgresql://"* ]]; then
        echo -e "${GREEN}✅ DATABASE_URL configurée (PostgreSQL)${NC}"
    else
        echo -e "${YELLOW}⚠️  DATABASE_URL à configurer dans .env${NC}"
    fi
else
    echo -e "${RED}❌ DATABASE_URL manquante dans .env${NC}"
fi

echo ""

# Suggestions de prochaines étapes
echo "🚀 Prochaines étapes:"
echo ""

if [ "$all_files_ok" = true ]; then
    echo -e "${BLUE}1. Configurez votre DATABASE_URL dans .env${NC}"
    echo -e "${BLUE}2. Lancez: npx prisma db push${NC}" 
    echo -e "${BLUE}3. Lancez: node scripts/setup.js${NC}"
    echo -e "${BLUE}4. Lancez: npm run dev${NC}"
    echo -e "${BLUE}5. Ouvrez: http://localhost:3000${NC}"
    echo ""
    echo -e "${GREEN}🎉 Votre installation semble correcte !${NC}"
else
    echo -e "${RED}❌ Certains fichiers manquent. Vérifiez l'installation.${NC}"
    echo -e "${YELLOW}💡 Conseil: Assurez-vous d'avoir cloné tout le projet${NC}"
fi

echo ""
echo "📚 Documentation complète: README.md"
echo "🐛 En cas de problème: Vérifiez les logs dans la console"
echo ""
echo "=================================================="
echo "🇸🇳 SenegalFC League • 2025 • Made with ⚽"