import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validated = searchParams.get('validated');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const whereClause: any = {};
    
    if (validated === 'true') {
      whereClause.validated = true;
    } else if (validated === 'false') {
      whereClause.validated = false;
    }
    
    const matches = await prisma.leagueMatch.findMany({
      where: whereClause,
      orderBy: { detectedAt: 'desc' },
      take: Math.min(limit, 50),
      include: {
        homeClub: {
          select: { id: true, name: true }
        },
        awayClub: {
          select: { id: true, name: true }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Erreur récupération matchs admin:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des matchs' 
      },
      { status: 500 }
    );
  }
}