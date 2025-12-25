import { NextResponse } from 'next/server';
import { getLeagueRanking } from '@/lib/ranking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ranking = await getLeagueRanking();
    
    return NextResponse.json({
      success: true,
      data: ranking
    });
  } catch (error) {
    console.error('Erreur récupération classement:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du classement' 
      },
      { status: 500 }
    );
  }
}