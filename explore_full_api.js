const { EAFCApiService } = require('eafc-clubs-api');

async function exploreFullAPI() {
    console.log('🚀 === EXPLORATION COMPLÈTE API EA SPORTS ===\n');
    
    try {
        const api = new EAFCApiService();
        const clubId = '40142'; // HOF 221
        const platform = 'common-gen5';
        
        console.log('🎯 Club testé:', clubId, '(HOF 221)');
        console.log('🎮 Plateforme:', platform);
        console.log('=' .repeat(60));
        
        // 1. EXPLORATION DES MÉTHODES DISPONIBLES
        console.log('\n📚 1. MÉTHODES DISPONIBLES DANS L\'API:');
        console.log('=' .repeat(40));
        
        const apiMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(api))
            .filter(name => typeof api[name] === 'function' && name !== 'constructor');
        
        console.log('Méthodes trouvées:', apiMethods);
        console.log('Total:', apiMethods.length, 'méthodes disponibles\n');
        
        // 2. CLUB INFO - Structure complète
        console.log('📋 2. CLUB INFO - STRUCTURE COMPLÈTE:');
        console.log('=' .repeat(40));
        try {
            const clubInfo = await api.clubInfo({ clubIds: clubId, platform });
            console.log('✅ Club Info récupéré');
            console.log('�� Structure complète:');
            console.log(JSON.stringify(clubInfo, null, 2));
            console.log('\n🔍 Analyse de la structure:');
            if (clubInfo[clubId]) {
                console.log('- Propriétés du club:', Object.keys(clubInfo[clubId]));
                console.log('- Nom:', clubInfo[clubId].name);
                console.log('- Club ID:', clubInfo[clubId].clubId);
                console.log('- Region ID:', clubInfo[clubId].regionId);
                console.log('- Team ID:', clubInfo[clubId].teamId);
                if (clubInfo[clubId].customKit) {
                    console.log('- Kit personnalisé:', Object.keys(clubInfo[clubId].customKit));
                }
            }
        } catch (error) {
            console.log('❌ Erreur Club Info:', error.message);
        }
        
        // 3. MEMBER STATS - Structure complète
        console.log('\n\n👥 3. MEMBER STATS - STRUCTURE COMPLÈTE:');
        console.log('=' .repeat(40));
        try {
            const memberStats = await api.memberStats({ clubIds: clubId, platform });
            console.log('✅ Member Stats récupéré');
            
            if (memberStats[clubId]) {
                const members = Object.entries(memberStats[clubId]);
                console.log('👨‍💼 Nombre de membres:', members.length);
                
                if (members.length > 0) {
                    const [firstMemberId, firstMemberData] = members[0];
                    console.log('\n🔍 Structure du premier membre:');
                    console.log('- Member ID:', firstMemberId);
                    console.log('- Propriétés disponibles:', Object.keys(firstMemberData));
                    console.log('📄 Données complètes du premier membre:');
                    console.log(JSON.stringify(firstMemberData, null, 2));
                }
                
                console.log('\n📊 Résumé de tous les membres:');
                members.slice(0, 10).forEach(([memberId, memberData], index) => {
                    console.log(`${index + 1}. ${memberData.name || 'Nom inconnu'} (ID: ${memberId})`);
                    if (memberData.position) console.log(`   Position: ${memberData.position}`);
                    if (memberData.overallRating) console.log(`   Note: ${memberData.overallRating}`);
                });
                
                if (members.length > 10) {
                    console.log(`... et ${members.length - 10} autres membres`);
                }
            }
        } catch (error) {
            console.log('❌ Erreur Member Stats:', error.message);
        }
        
        // 4. MATCHES - Exploration complète
        console.log('\n\n⚽ 4. MATCHES - EXPLORATION COMPLÈTE:');
        console.log('=' .repeat(40));
        try {
            const matches = await api.matchesStats({ 
                clubIds: clubId, 
                platform,
                matchType: 'leagueMatch'
            });
            console.log('✅ Matches récupérés:', matches?.length || 0, 'matchs');
            
            if (matches && matches.length > 0) {
                const firstMatch = matches[0];
                
                console.log('\n🔍 STRUCTURE COMPLÈTE DU PREMIER MATCH:');
                console.log('- Propriétés principales:', Object.keys(firstMatch));
                console.log('📄 Match complet:');
                console.log(JSON.stringify(firstMatch, null, 2));
                
                console.log('\n🏆 ANALYSE DES CLUBS DANS LE MATCH:');
                if (firstMatch.clubs) {
                    Object.entries(firstMatch.clubs).forEach(([clubId, clubData]) => {
                        console.log(`\n--- Club ${clubId} ---`);
                        console.log('Propriétés:', Object.keys(clubData));
                        console.log('Données:', JSON.stringify(clubData, null, 2));
                    });
                }
                
                console.log('\n📊 RÉSUMÉ DE TOUS LES MATCHS TROUVÉS:');
                matches.forEach((match, index) => {
                    const date = new Date(match.timestamp * 1000);
                    console.log(`\n${index + 1}. Match ID: ${match.matchId}`);
                    console.log(`   Date: ${date.toLocaleString()}`);
                    console.log(`   Timestamp: ${match.timestamp}`);
                    
                    if (match.clubs) {
                        const clubIds = Object.keys(match.clubs);
                        console.log(`   Clubs (${clubIds.length}):`);
                        clubIds.forEach(id => {
                            const club = match.clubs[id];
                            console.log(`     ${id}: ${club.details?.name || club.name || 'Nom inconnu'} - ${club.goals || 0} buts`);
                        });
                    }
                });
            }
        } catch (error) {
            console.log('❌ Erreur Matches:', error.message);
        }
        
        // 5. AUTRES MÉTHODES POSSIBLES
        console.log('\n\n🔧 5. TEST D\'AUTRES MÉTHODES POSSIBLES:');
        console.log('=' .repeat(40));
        
        const methodsToTry = [
            'leaderboards',
            'seasonalStats', 
            'clubSeasonStats',
            'memberSeasonStats',
            'matchDetails',
            'careerStats'
        ];
        
        for (const method of methodsToTry) {
            if (typeof api[method] === 'function') {
                console.log(`\n🧪 Test de la méthode: ${method}`);
                try {
                    const result = await api[method]({ clubIds: clubId, platform });
                    console.log(`✅ ${method} fonctionne !`);
                    console.log('Type:', typeof result);
                    console.log('Structure:', Array.isArray(result) ? `Array[${result.length}]` : Object.keys(result));
                    if (result && typeof result === 'object') {
                        console.log('Premier élément/propriété:');
                        if (Array.isArray(result) && result.length > 0) {
                            console.log(JSON.stringify(result[0], null, 2));
                        } else {
                            const firstKey = Object.keys(result)[0];
                            if (firstKey) {
                                console.log(`${firstKey}:`, JSON.stringify(result[firstKey], null, 2));
                            }
                        }
                    }
                } catch (error) {
                    console.log(`❌ ${method} échoue:`, error.message);
                }
            } else {
                console.log(`⚠️ Méthode ${method} n'existe pas`);
            }
        }
        
        // 6. TEST AVEC DIFFÉRENTS PARAMÈTRES
        console.log('\n\n⚙️ 6. TEST AVEC DIFFÉRENTS PARAMÈTRES:');
        console.log('=' .repeat(40));
        
        const matchTypes = ['leagueMatch', 'seasonalMatch', 'friendlyMatch', 'cupMatch'];
        
        for (const matchType of matchTypes) {
            console.log(`\n🎮 Test matchType: ${matchType}`);
            try {
                const matches = await api.matchesStats({ 
                    clubIds: clubId, 
                    platform,
                    matchType: matchType
                });
                console.log(`✅ ${matchType}: ${matches?.length || 0} matchs trouvés`);
            } catch (error) {
                console.log(`❌ ${matchType}: ${error.message}`);
            }
        }
        
        // 7. EXPLORATION DE LA STRUCTURE D'UN MATCH DÉTAILLÉ
        console.log('\n\n🔍 7. EXPLORATION DÉTAILLÉE D\'UN MATCH:');
        console.log('=' .repeat(40));
        
        try {
            const matches = await api.matchesStats({ clubIds: clubId, platform, matchType: 'leagueMatch' });
            if (matches && matches.length > 0) {
                const match = matches[0]; // Le match HOF 221 vs TERAMO 1913
                console.log('🎯 Analyse du match HOF 221 vs TERAMO 1913');
                console.log('📊 Match ID:', match.matchId);
                console.log('📅 Date:', new Date(match.timestamp * 1000));
                
                // Explorer chaque propriété
                console.log('\n🧭 Exploration de toutes les propriétés:');
                Object.entries(match).forEach(([key, value]) => {
                    console.log(`\n${key}:`);
                    console.log('  Type:', typeof value);
                    if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value)) {
                            console.log(`  Array[${value.length}]`);
                            if (value.length > 0) {
                                console.log('  Premier élément:', JSON.stringify(value[0], null, 4));
                            }
                        } else {
                            console.log('  Propriétés:', Object.keys(value));
                            console.log('  Contenu:', JSON.stringify(value, null, 4));
                        }
                    } else {
                        console.log('  Valeur:', value);
                    }
                });
            }
        } catch (error) {
            console.log('❌ Erreur exploration détaillée:', error.message);
        }
        
        console.log('\n🎉 EXPLORATION TERMINÉE !');
        console.log('=' .repeat(60));
        
    } catch (error) {
        console.error('�� Erreur générale:', error);
    }
}

exploreFullAPI();
