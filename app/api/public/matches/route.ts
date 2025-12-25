import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const matches = await prisma.leagueMatch.findMany({
      where: { validated: true },
      orderBy: { playedAt: 'desc' },
      take: Math.min(limit, 20), // Max 20 matchs
      include: {
        homeClub: {
          select: { name: true }
        },
        awayClub: {
          select: { name: true }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Erreur récupération matchs:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des matchs' 
      },
      { status: 500 }
    );
  }
}