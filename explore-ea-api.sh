#!/bin/bash

# Script d'exploration API EA Sports FC 25
# Usage: ./explore-ea-api.sh

CLUB_ID="40142"  # HOF 221
PLATFORM="common-gen5"  # PS5

echo "🔍 === EXPLORATION API EA SPORTS FC 25 ==="
echo "🎮 Club: $CLUB_ID | Plateforme: $PLATFORM"
echo ""

# Headers standard pour EA Sports
HEADERS=(
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  -H "Accept: application/json"
  -H "Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
  -H "Referer: https://www.ea.com/"
  -H "Origin: https://www.ea.com"
)

# Fonction pour tester un endpoint
test_endpoint() {
  local name="$1"
  local url="$2"
  local description="$3"
  
  echo "🧪 Test: $name"
  echo "   $description"
  echo "   URL: $url"
  
  # Faire la requête avec curl
  response=$(curl -s -w "HTTPSTATUS:%{http_code}" "${HEADERS[@]}" --max-time 10 "$url")
  
  # Extraire le code de statut
  http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
  body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*$//')
  
  echo "   Status: $http_code"
  
  if [ "$http_code" == "200" ]; then
    echo "   ✅ SUCCÈS - Données reçues"
    
    # Vérifier si c'est du JSON valide
    if echo "$body" | jq . > /dev/null 2>&1; then
      echo "   📊 Format JSON valide"
      
      # Analyser le contenu
      if echo "$body" | jq . | grep -q -i "match\|game\|fixture"; then
        echo "   🎯 Contient des données de MATCHS"
      fi
      
      if echo "$body" | jq . | grep -q -i "player\|member\|stat"; then
        echo "   👥 Contient des données de JOUEURS"
      fi
      
      if echo "$body" | jq . | grep -q -i "goal\|assist"; then
        echo "   ⚽ Contient des données de BUTS/PASSES"
      fi
      
      # Afficher les premières clés
      keys=$(echo "$body" | jq -r 'if type == "object" then keys | join(", ") elif type == "array" and length > 0 then .[0] | keys | join(", ") else "N/A" end' 2>/dev/null)
      if [ "$keys" != "N/A" ]; then
        echo "   Clés principales: $keys"
      fi
      
      # Afficher un échantillon (premiers 300 caractères)
      echo "   Échantillon:"
      echo "$body" | head -c 300 | sed 's/^/     /'
      echo "     ..."
      
    else
      echo "   ⚠️  Réponse non-JSON:"
      echo "$body" | head -c 200 | sed 's/^/     /'
    fi
    
  elif [ "$http_code" == "404" ]; then
    echo "   ❌ ÉCHEC - Endpoint non trouvé (404)"
  elif [ "$http_code" == "400" ]; then
    echo "   ❌ ÉCHEC - Paramètres invalides (400)"
  elif [ "$http_code" == "403" ]; then
    echo "   ❌ ÉCHEC - Accès refusé (403)"
  else
    echo "   ❌ ÉCHEC - Code $http_code"
  fi
  
  echo ""
}

# Vérifier que jq est installé
if ! command -v jq &> /dev/null; then
  echo "⚠️  Attention: jq n'est pas installé. L'analyse JSON sera limitée."
  echo "   Pour installer: brew install jq (macOS) ou apt install jq (Ubuntu)"
  echo ""
fi

echo "🚀 Démarrage de l'exploration..."
echo ""

# Tests des endpoints
test_endpoint "📋 Club Info (Original)" \
  "https://proclubs.ea.com/api/fc/clubs/info?clubIds=$CLUB_ID&platform=$PLATFORM" \
  "Informations de base du club"

test_endpoint "👥 Club Members (Original)" \
  "https://proclubs.ea.com/api/fc/clubs/memberStats?clubIds=$CLUB_ID&platform=$PLATFORM" \
  "Statistiques des membres du club"

test_endpoint "⚽ Club Matches (Original)" \
  "https://proclubs.ea.com/api/fc/clubs/matches?platform=$PLATFORM&clubIds=$CLUB_ID" \
  "Matchs récents du club"

test_endpoint "🆕 Club Details (v1)" \
  "https://proclubs.ea.com/api/fc/clubs/$CLUB_ID?platform=$PLATFORM" \
  "Détails du club (nouveau format)"

test_endpoint "📊 Club Stats (v1)" \
  "https://proclubs.ea.com/api/fc/clubs/$CLUB_ID/stats?platform=$PLATFORM" \
  "Statistiques complètes du club"

test_endpoint "👥 Club Members (v1)" \
  "https://proclubs.ea.com/api/fc/clubs/$CLUB_ID/members?platform=$PLATFORM" \
  "Liste des membres (nouveau format)"

test_endpoint "⚽ Club Matches (v1)" \
  "https://proclubs.ea.com/api/fc/clubs/$CLUB_ID/matches?platform=$PLATFORM" \
  "Matchs du club (nouveau format)"

test_endpoint "🏆 Club Season Stats" \
  "https://proclubs.ea.com/api/fc/clubs/$CLUB_ID/seasonStats?platform=$PLATFORM" \
  "Statistiques de la saison"

test_endpoint "🎯 Club Player Stats" \
  "https://proclubs.ea.com/api/fc/clubs/$CLUB_ID/playerStats?platform=$PLATFORM" \
  "Statistiques individuelles des joueurs"

test_endpoint "📈 Club Leaderboard" \
  "https://proclubs.ea.com/api/fc/clubs/$CLUB_ID/leaderboard?platform=$PLATFORM" \
  "Classements et performances"

echo "🏁 === EXPLORATION TERMINÉE ==="
echo ""
echo "💡 Conseils:"
echo "   - Les endpoints qui retournent du JSON avec un status 200 sont fonctionnels"
echo "   - Cherchez les endpoints qui contiennent 'données de MATCHS' ou 'données de JOUEURS'"
echo "   - Utilisez ces endpoints dans votre code pour récupérer les vraies données"
echo ""
echo "🔧 Pour tester d'autres clubs, modifiez CLUB_ID au début du script"
echo "🎮 Pour tester d'autres plateformes, modifiez PLATFORM (ps5=common-gen5, ps4=common-gen4, etc.)"
