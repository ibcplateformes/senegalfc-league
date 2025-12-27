// 🔥 IMPLÉMENTATION RÉELLE EA SPORTS API (VERSION JS POUR TESTS)
const { EAFCApiService } = require('eafc-clubs-api');

let apiInstance = null;

function getEAAPI() {
  if (!apiInstance) {
    apiInstance = new EAFCApiService();
  }
  return apiInstance;
}

function mapPlatform(platform) {
  const PLATFORM_MAP = {
    'ps5': 'common-gen5',
    'ps4': 'common-gen4', 
    'xboxseriesxs': 'common-gen5',
    'xboxone': 'common-gen4',
    'pc': 'common-gen5',
  };
  return PLATFORM_MAP[platform.toLowerCase()] || 'common-gen5';
}

async function fetchClubInfo(clubId, platform) {
  console.log(`🔍 [EA-API] Récupération infos club: ${clubId} (${platform})`);
  
  try {
    const api = getEAAPI();
    const mappedPlatform = mapPlatform(platform);
    
    const response = await api.clubInfo({
      clubIds: clubId,
      platform: mappedPlatform
    });
    
    const clubInfo = response[clubId];
    
    if (!clubInfo) {
      return null;
    }
    
    console.log(`✅ [EA-API] Club trouvé: "${clubInfo.name}"`);
    
    return {
      id: clubInfo.clubId.toString(),
      name: clubInfo.name,
      platform: platform,
      teamId: clubInfo.teamId
    };
    
  } catch (error) {
    console.error(`❌ [EA-API] Erreur récupération club ${clubId}:`, error.message);
    return null;
  }
}

async function fetchClubMatches(clubId, platform, limit = 10) {
  console.log(`⚽ [EA-API] Récupération matchs club: ${clubId} (${platform})`);
  
  try {
    const api = getEAAPI();
    const mappedPlatform = mapPlatform(platform);
    
    const matches = await api.matchesStats({
      clubIds: clubId,
      platform: mappedPlatform,
      matchType: 'leagueMatch'
    });
    
    if (!Array.isArray(matches) || matches.length === 0) {
      return [];
    }
    
    const convertedMatches = matches.slice(0, limit).map((match) => {
      const clubIds = Object.keys(match.clubs || {});
      const opponentId = clubIds.find(id => id !== clubId);
      
      if (!opponentId) {
        return null;
      }

      const myClub = match.clubs[clubId];
      const opponentClub = match.clubs[opponentId];

      const scoreFor = parseInt(myClub?.goals || '0');
      const scoreAgainst = parseInt(opponentClub?.goals || '0');

      let result;
      if (scoreFor > scoreAgainst) {
        result = 'win';
      } else if (scoreFor < scoreAgainst) {
        result = 'loss';
      } else {
        result = 'draw';
      }

      return {
        matchId: match.matchId,
        opponent: opponentClub?.details?.name || 'Équipe inconnue',
        scoreFor,
        scoreAgainst,
        myScore: scoreFor,
        opponentScore: scoreAgainst,
        result,
        date: new Date(match.timestamp * 1000),
        competition: 'League'
      };
    }).filter(Boolean);

    console.log(`✅ [EA-API] ${convertedMatches.length} matchs convertis avec succès`);
    return convertedMatches;

  } catch (error) {
    console.error(`❌ [EA-API] Erreur récupération matchs ${clubId}:`, error.message);
    return [];
  }
}

async function fetchPlayerStats(clubId, platform) {
  console.log(`👥 [EA-API] Récupération stats joueurs club: ${clubId}`);
  
  try {
    const api = getEAAPI();
    const mappedPlatform = mapPlatform(platform);
    
    const memberStats = await api.memberCareerStats({
      clubId: clubId,
      platform: mappedPlatform
    });
    
    if (!memberStats || !memberStats.members) {
      return [];
    }
    
    const players = Object.values(memberStats.members).map((member, index) => {
      return {
        playerId: member.playerId || index.toString(),
        playerName: member.name || 'Joueur inconnu',
        position: member.favoritePosition || 'UNK',
        matchesPlayed: parseInt(member.gamesPlayed || '0'),
        minutesPlayed: 0,
        averageRating: parseFloat(member.ratingAve || '0'),
        goals: parseInt(member.goals || '0'),
        assists: parseInt(member.assists || '0'),
        manOfTheMatch: parseInt(member.manOfTheMatch || '0')
      };
    });
    
    console.log(`✅ [EA-API] ${players.length} joueurs convertis avec succès`);
    return players;
    
  } catch (error) {
    console.error(`❌ [EA-API] Erreur récupération stats joueurs:`, error.message);
    return [];
  }
}

module.exports = {
  fetchClubInfo,
  fetchClubMatches,
  fetchPlayerStats
};
