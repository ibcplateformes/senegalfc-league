import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { recalculateAllStats } from '@/lib/ranking';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { validated, notes } = await request.json();
    const matchId = params.id;
    
    // Valider que le match existe
    const existingMatch = await prisma.leagueMatch.findUnique({
      where: { id: matchId }
    });
    
    if (!existingMatch) {
      return NextResponse.json(
        { success: false, error: 'Match non trouvé' },
        { status: 404 }
      );
    }
    
    if (validated === false) {
      // Si rejeté, supprimer le match
      await prisma.leagueMatch.delete({
        where: { id: matchId }
      });
      
      console.log(`❌ Match ${matchId} rejeté et supprimé`);
    } else {
      // Si validé, mettre à jour
      await prisma.leagueMatch.update({
        where: { id: matchId },
        data: { 
          validated: true,
          notes: notes || null
        }
      });
      
      // Recalculer les stats des clubs impliqués
      await recalculateAllStats();
      
      console.log(`✅ Match ${matchId} validé`);
    }
    
    return NextResponse.json({
      success: true,
      message: validated ? 'Match validé avec succès' : 'Match rejeté et supprimé'
    });
    
  } catch (error) {
    console.error('Erreur validation match:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la validation du match' 
      },
      { status: 500 }
    );
  }
}