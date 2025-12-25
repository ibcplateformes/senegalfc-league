import { NextRequest, NextResponse } from 'next/server';
import { EAFCApiService } from 'eafc-clubs-api';

export async function POST(request: NextRequest) {
  try {
    const { query, type } = await request.json();
    
    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, message: 'Aucune recherche fournie' },
        { status: 400 }
      );
    }

    console.log(`🔍 Recherche club EA Sports: "${query}" (type: ${type})`);

    if (type === 'id') {
      // Recherche par EA Club ID avec vraie API et extraction corrigée
      console.log(`🆔 Recherche par ID: ${query}`);
      
      try {
        const eafc = new EAFCApiService();
        
        // Utiliser les VRAIES plateformes supportées par l'API
        const plateformes = [
          { platform: 'common-gen5', name: 'PlayStation 5', userCode: 'ps5' },
          { platform: 'common-gen4', name: 'PlayStation 4', userCode: 'ps4' },
          { platform: 'nx', name: 'Nintendo Switch', userCode: 'switch' }
        ];
        
        for (const plat of plateformes) {
          try {
            console.log(`  🎮 Test ${plat.name} (${plat.platform})...`);
            
            // Utiliser la vraie API avec le bon format
            const clubInfo = await eafc.clubInfo({
              clubIds: query.trim(),  // String, pas array
              platform: plat.platform
            });
            
            console.log(`  📊 Résultat API pour ${plat.name}:`, clubInfo);
            
            // 🔧 CORRECTION : Gérer le format RÉEL de l'API EA Sports
            if (clubInfo && typeof clubInfo === 'object') {
              
              let clubName = '';
              let clubId = query.trim();
              let detectedClubInfo = null;
              let extractionMethod = '';
              
              // 🎯 NOUVEAU : Format { "24000": { name: "BUUR MFC", clubId: 24000 } }
              if (clubInfo[query.trim()]) {
                // Format spécifique EA Sports : objet avec ID comme clé
                detectedClubInfo = clubInfo[query.trim()];
                clubName = detectedClubInfo.name || detectedClubInfo.clubName || '';
                clubId = detectedClubInfo.clubId || query.trim();
                extractionMethod = `EA Sports format key "${query.trim()}"`;
                console.log(`  🎯 Format EA Sports détecté: ID ${query} → "${clubName}"`);
              } else if (Array.isArray(clubInfo) && clubInfo.length > 0) {
                // Format array
                detectedClubInfo = clubInfo[0];
                clubName = detectedClubInfo.name || detectedClubInfo.clubName || '';
                clubId = detectedClubInfo.clubId || query.trim();
                extractionMethod = 'Array format';
                console.log(`  🎯 Format Array détecté: "${clubName}"`);
              } else if (clubInfo.name || clubInfo.clubName) {
                // Format objet direct
                detectedClubInfo = clubInfo;
                clubName = clubInfo.name || clubInfo.clubName || '';
                clubId = clubInfo.clubId || query.trim();
                extractionMethod = 'Direct object';
                console.log(`  🎯 Format Objet direct détecté: "${clubName}"`);
              } else {
                // Chercher dans toutes les propriétés pour un nom
                const keys = Object.keys(clubInfo);
                console.log(`  🔍 Recherche dans les clés: [${keys.join(', ')}]`);
                
                for (const key of keys) {
                  if (clubInfo[key] && typeof clubInfo[key] === 'object') {
                    const candidate = clubInfo[key];
                    if (candidate.name || candidate.clubName) {
                      detectedClubInfo = candidate;
                      clubName = candidate.name || candidate.clubName || '';
                      clubId = candidate.clubId || key;
                      extractionMethod = `Key search found "${key}"`;
                      console.log(`  🎯 Format clé "${key}" détecté: "${clubName}"`);
                      break;
                    }
                  }
                }
              }
              
              // Vérifier si on a trouvé un nom valide
              if (clubName && clubName.trim().length > 0 && clubName !== `Club ${query}`) {
                console.log(`✅ Club trouvé sur ${plat.name}: "${clubName}" (ID: ${clubId})`);
                
                return NextResponse.json({
                  success: true,
                  message: `Club trouvé: "${clubName}" sur ${plat.name}`,
                  data: {
                    name: clubName.trim(),
                    eaClubId: clubId.toString(),
                    platform: plat.userCode,
                    found: true,
                    source: 'ea_sports_api',
                    detectedPlatform: plat.name,
                    apiPlatform: plat.platform,
                    rawData: detectedClubInfo,
                    extractionMethod: extractionMethod,
                    debugInfo: `Found using ${extractionMethod}`
                  }
                });
              } else {
                console.log(`  ❌ Nom de club invalide ou vide: "${clubName}"`);
              }
            } else {
              console.log(`  ❌ Réponse API invalide ou vide`);
            }
            
          } catch (platError) {
            console.log(`  ❌ Erreur ${plat.name}:`, platError.message);
            
            if (platError.message.includes('fetch failed')) {
              console.log(`    🌐 Serveurs EA Sports inaccessibles pour ${plat.name}`);
            } else if (platError.message.includes('not found')) {
              console.log(`    🔍 Club ${query} non trouvé sur ${plat.name}`);
            } else if (platError.message.includes('validation')) {
              console.log(`    📝 Erreur de validation pour ${plat.name}: ${platError.message}`);
            } else if (platError.message.includes('Unexpected token')) {
              console.log(`    🔧 Erreur de format JSON pour ${plat.name} (serveur EA unstable)`);
            }
            
            continue; // Essayer la plateforme suivante
          }
        }
        
        // Si non trouvé sur toutes les plateformes mais API accessible
        console.log(`❌ Club ID ${query} introuvable sur toutes les plateformes (PS5, PS4, Switch)`);
        
        return NextResponse.json({
          success: false,
          message: `Club ID "${query}" non trouvé sur l'API EA Sports`,
          suggestion: 'Vérifiez l\'ID, ou continuez en mode manuel',
          data: {
            found: false,
            query: query.trim(),
            type: type,
            allowManual: true,
            proposedName: `Club ${query.trim()}`,
            apiAccessible: true,
            testedPlatforms: ['PlayStation 5', 'PlayStation 4', 'Nintendo Switch'],
            debugInfo: 'API accessible but no club found on any platform'
          }
        });
        
      } catch (apiError) {
        console.error(`❌ Erreur API EA Sports générale:`, apiError);
        
        // Mode dégradé - API inaccessible
        return NextResponse.json({
          success: false,
          message: 'API EA Sports temporairement indisponible',
          suggestion: 'Mode manuel activé - entrez le nom manuellement',
          data: {
            found: false,
            query: query.trim(),
            type: type,
            allowManual: true,
            proposedName: `Club EA ${query.trim()}`,
            apiError: true,
            errorMessage: apiError.message,
            errorType: apiError.message.includes('fetch failed') ? 'network' : 'api'
          }
        });
      }
    } else if (type === 'name') {
      // Recherche par nom
      console.log(`📛 Recherche par nom: ${query}`);
      
      return NextResponse.json({
        success: false,
        message: 'Recherche par nom non disponible avec cette API',
        suggestion: 'Utilisez l\'EA Club ID pour l\'auto-remplissage'
      });
    }

    // Fallback
    return NextResponse.json({
      success: false,
      message: 'Type de recherche non supporté',
      data: { found: false, query: query, type: type }
    });

  } catch (error) {
    console.error('❌ Erreur générale API recherche:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la recherche',
        suggestion: 'Continuez en mode manuel',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        data: {
          allowManual: true,
          proposedName: `Club Inconnu`
        }
      },
      { status: 500 }
    );
  }
}