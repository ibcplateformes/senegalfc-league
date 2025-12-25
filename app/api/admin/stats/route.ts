import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalClubs,
      activeClubs,
      totalMatches,
      validatedMatches,
      pendingMatches,
      config
    ] = await Promise.all([
      prisma.leagueClub.count(),
      prisma.leagueClub.count({ where: { active: true } }),
      prisma.leagueMatch.count(),
      prisma.leagueMatch.count({ where: { validated: true } }),
      prisma.leagueMatch.count({ where: { validated: false } }),
      prisma.leagueConfig.findFirst()
    ]);

    const stats = {
      totalClubs,
      activeClubs,
      totalMatches,
      validatedMatches,
      pendingMatches,
      lastSync: config?.lastSync?.toISOString() || null
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur récupération stats admin:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques' 
      },
      { status: 500 }
    );
  }
}