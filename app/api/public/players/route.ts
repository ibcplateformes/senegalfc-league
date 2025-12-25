import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stat = searchParams.get('stat') || 'goals'; // goals, assists, saves, rating
    const limit = parseInt(searchParams.get('limit') || '10');
    const position = searchParams.get('position'); // GK, DEF, MID, ATT
    
    console.log(`📊 Récupération du top ${limit} ${stat}${position ? ` (${position})` : ''}`);
    
    let orderBy: any = { [stat]: 'desc' };
    let where: any = {
      club: { active: true }, // Seulement les joueurs des clubs actifs
      matchesPlayed: { gt: 0 } // Seulement les joueurs ayant joué
    };
    
    // Filtre par position si spécifié
    if (position) {
      where.position = position;
    }
    
    // Ajustements pour certaines stats
    if (stat === 'rating') {
      orderBy = { averageRating: 'desc' };
      where.averageRating = { gt: 0 };
    }
    
    const players = await prisma.player.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        club: {
          select: {
            name: true
          }
        }
      }
    });
    
    const formattedPlayers = players.map((player, index) => ({
      position: index + 1,
      id: player.id,
      name: player.name,
      clubName: player.club.name,
      playerPosition: player.position,
      matchesPlayed: player.matchesPlayed,
      value: stat === 'rating' ? player.averageRating : (player as any)[stat],
      
      // Stats principales pour l'affichage
      goals: player.goals,
      assists: player.assists,
      averageRating: player.averageRating,
      saves: player.saves,
      cleanSheets: player.cleanSheets
    }));
    
    console.log(`✅ ${formattedPlayers.length} joueurs récupérés pour le top ${stat}`);
    
    return NextResponse.json({
      success: true,
      data: formattedPlayers,
      meta: {
        stat,
        limit,
        position,
        total: formattedPlayers.length
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération top players:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques joueurs',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}