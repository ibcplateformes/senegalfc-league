import { NextResponse } from 'next/server';
import { getLeagueStats } from '@/lib/ranking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getLeagueStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques' 
      },
      { status: 500 }
    );
  }
}