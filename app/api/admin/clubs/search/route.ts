import { NextRequest, NextResponse } from 'next/server';
import { fetchClubInfo } from '@/lib/ea-sports';

export const dynamic = 'force-dynamic';

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
      // Recherche par EA Club ID avec nouvelle API ClubStats Pro
      console.log(`🆔 Recherche par ID: ${query}`);
      
      try {
        // Utiliser les plateformes supportées
        const plateformes = [
          { platform: 'ps5', name: 'PlayStation 5' },
          { platform: 'ps4', name: 'PlayStation 4' },
          { platform: 'pc', name: 'PC' }
        ];
        
        for (const plat of plateformes) {
          try {
            console.log(`  🎮 Test ${plat.name} (${plat.platform})...`);
            
            // Utiliser notre nouvelle API ClubStats Pro
            const clubInfo = await fetchClubInfo(query.trim(), plat.platform);
            
            console.log(`  📊 Résultat API pour ${plat.name}:`, clubInfo);
            
            if (clubInfo && clubInfo.name && clubInfo.name.trim().length > 0 && clubInfo.name !== `Club ${query}`) {
              console.log(`✅ Club trouvé sur ${plat.name}: "${clubInfo.name}" (ID: ${clubInfo.id})`);
              
              return NextResponse.json({
                success: true,
                message: `Club trouvé: "${clubInfo.name}" sur ${plat.name}`,
                data: {
                  name: clubInfo.name.trim(),
                  eaClubId: clubInfo.id.toString(),
                  platform: plat.platform,
                  found: true,
                  source: 'ea_sports_api_clubstats_pro',
                  detectedPlatform: plat.name,
                  debugInfo: `Found using ClubStats Pro API`
                }
              });
            } else {
              console.log(`  ❌ Club non trouvé ou nom invalide sur ${plat.name}`);
            }
            
          } catch (platError: any) {
            console.log(`  ❌ Erreur ${plat.name}:`, platError.message);
            
            if (platError.message?.includes('fetch failed')) {
              console.log(`    🌐 Serveurs EA Sports inaccessibles pour ${plat.name}`);
            } else if (platError.message?.includes('not found')) {
              console.log(`    🔍 Club ${query} non trouvé sur ${plat.name}`);
            } else {
              console.log(`    🔧 Erreur générique pour ${plat.name}: ${platError.message}`);
            }
            
            continue; // Essayer la plateforme suivante
          }
        }
        
        // Si non trouvé sur toutes les plateformes
        console.log(`❌ Club ID ${query} introuvable sur toutes les plateformes (PS5, PS4, PC)`);
        
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
            testedPlatforms: ['PlayStation 5', 'PlayStation 4', 'PC'],
            debugInfo: 'ClubStats Pro API accessible but no club found on any platform'
          }
        });
        
      } catch (apiError: any) {
        console.error(`❌ Erreur API ClubStats Pro générale:`, apiError);
        
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
            errorType: apiError.message?.includes('fetch failed') ? 'network' : 'api'
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

  } catch (error: any) {
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
