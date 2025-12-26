#!/usr/bin/env node

const fetch = require('node-fetch');

// Configuration
const CLUB_ID = '40142'; // HOF 221
const PLATFORM = 'common-gen5'; // PS5

console.log('🔍 === EXPLORATION API EA SPORTS FC 25 ===');
console.log(`🎮 Club: ${CLUB_ID} | Plateforme: ${PLATFORM}`);
console.log('');

// Headers standard pour EA Sports
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.ea.com/',
  'Origin': 'https://www.ea.com'
};

// Liste des endpoints à tester
const endpoints = [
  {
    name: '📋 Club Info (Original)',
    url: `https://proclubs.ea.com/api/fc/clubs/info?clubIds=${CLUB_ID}&platform=${PLATFORM}`,
    description: 'Informations de base du club'
  },
  {
    name: '👥 Club Members (Original)', 
    url: `https://proclubs.ea.com/api/fc/clubs/memberStats?clubIds=${CLUB_ID}&platform=${PLATFORM}`,
    description: 'Statistiques des membres du club'
  },
  {
    name: '⚽ Club Matches (Original)',
    url: `https://proclubs.ea.com/api/fc/clubs/matches?platform=${PLATFORM}&clubIds=${CLUB_ID}`,
    description: 'Matchs récents du club'
  },
  {
    name: '🆕 Club Details (v1)',
    url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}?platform=${PLATFORM}`,
    description: 'Détails du club (nouveau format)'
  },
  {
    name: '📊 Club Stats (v1)', 
    url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/stats?platform=${PLATFORM}`,
    description: 'Statistiques complètes du club'
  },
  {
    name: '👥 Club Members (v1)',
    url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/members?platform=${PLATFORM}`,
    description: 'Liste des membres (nouveau format)'
  },
  {
    name: '⚽ Club Matches (v1)',
    url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/matches?platform=${PLATFORM}`,
    description: 'Matchs du club (nouveau format)'
  },
  {
    name: '🏆 Club Season Stats',
    url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/seasonStats?platform=${PLATFORM}`,
    description: 'Statistiques de la saison'
  },
  {
    name: '🎯 Club Player Stats',
    url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/playerStats?platform=${PLATFORM}`,
    description: 'Statistiques individuelles des joueurs'
  },
  {
    name: '📈 Club Leaderboard',
    url: `https://proclubs.ea.com/api/fc/clubs/${CLUB_ID}/leaderboard?platform=${PLATFORM}`,
    description: 'Classements et performances'
  }
];

async function testEndpoint(endpoint) {
  console.log(`🧪 Test: ${endpoint.name}`);
  console.log(`   ${endpoint.description}`);
  console.log(`   URL: ${endpoint.url}`);
  
  try {
    const response = await fetch(endpoint.url, { 
      headers,
      timeout: 10000
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`   Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        console.log(`   ✅ SUCCÈS - Données JSON reçues`);
        console.log(`   Type: ${Array.isArray(data) ? `Array[${data.length}]` : typeof data}`);
        
        if (typeof data === 'object' && data !== null) {
          const keys = Array.isArray(data) 
            ? (data.length > 0 ? Object.keys(data[0]) : [])
            : Object.keys(data);
          console.log(`   Clés: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}`);
          
          // Afficher un échantillon des données
          const sample = JSON.stringify(data, null, 2);
          if (sample.length > 500) {
            console.log(`   Échantillon:\n${sample.substring(0, 500)}...`);
          } else {
            console.log(`   Données:\n${sample}`);
          }
          
          // Détecter des données importantes
          const dataStr = JSON.stringify(data).toLowerCase();
          const hasMatchData = dataStr.includes('match') || dataStr.includes('game') || dataStr.includes('fixture');
          const hasPlayerData = dataStr.includes('player') || dataStr.includes('member') || dataStr.includes('stat');
          const hasGoalsData = dataStr.includes('goal') || dataStr.includes('assist');
          
          if (hasMatchData) console.log(`   🎯 Contient des données de MATCHS`);
          if (hasPlayerData) console.log(`   👥 Contient des données de JOUEURS`);
          if (hasGoalsData) console.log(`   ⚽ Contient des données de BUTS/PASSES`);
          
        } else {
          console.log(`   Données simples: ${data}`);
        }
      } else {
        const text = await response.text();
        console.log(`   ⚠️  Réponse non-JSON: ${text.substring(0, 200)}...`);
      }
    } else {
      console.log(`   ❌ ÉCHEC - ${response.status}`);
      if (response.status === 404) {
        console.log(`   Endpoint non trouvé`);
      } else if (response.status === 400) {
        console.log(`   Paramètres invalides`);
      } else if (response.status === 403) {
        console.log(`   Accès refusé`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ ERREUR: ${error.message}`);
  }
  
  console.log('');
}

async function exploreAPI() {
  console.log('🚀 Démarrage de l\'exploration...\n');
  
  let successCount = 0;
  let matchEndpoints = [];
  let playerEndpoints = [];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🏁 === EXPLORATION TERMINÉE ===');
  console.log(`📊 ${successCount} endpoints fonctionnels sur ${endpoints.length} testés`);
  
  if (matchEndpoints.length > 0) {
    console.log(`⚽ Endpoints avec données de matchs: ${matchEndpoints.join(', ')}`);
  }
  
  if (playerEndpoints.length > 0) {
    console.log(`👥 Endpoints avec données de joueurs: ${playerEndpoints.join(', ')}`);
  }
  
  if (successCount === 0) {
    console.log('❌ Aucun endpoint fonctionnel trouvé');
    console.log('💡 L\'API EA Sports a peut-être complètement changé');
  } else {
    console.log('✅ Des endpoints fonctionnels ont été trouvés !');
    console.log('🔧 Utilisez ces données pour mettre à jour votre implémentation');
  }
}

// Lancer l'exploration
exploreAPI().catch(console.error);
