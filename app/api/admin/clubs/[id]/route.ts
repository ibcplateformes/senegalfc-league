import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = params.id;
    
    if (!clubId) {
      return NextResponse.json(
        { success: false, message: 'ID du club manquant' },
        { status: 400 }
      );
    }

    console.log(`🗑️  Tentative suppression club ID: ${clubId}`);

    // Vérifier si le club existe
    const club = await prisma.leagueClub.findUnique({
      where: { id: clubId }
    });

    if (!club) {
      console.log(`❌ Club ${clubId} introuvable en base`);
      return NextResponse.json(
        { success: false, message: 'Club introuvable' },
        { status: 404 }
      );
    }

    console.log(`🎯 Club trouvé: ${club.name} (EA ID: ${club.eaClubId})`);

    // Supprimer les matchs liés au club
    console.log(`🔍 Recherche des matchs liés...`);
    const matchesDeleted = await prisma.leagueMatch.deleteMany({
      where: {
        OR: [
          { homeClubId: clubId },
          { awayClubId: clubId }
        ]
      }
    });

    console.log(`   ✅ ${matchesDeleted.count} matchs supprimés`);

    // Supprimer le club
    await prisma.leagueClub.delete({
      where: { id: clubId }
    });

    console.log(`   ✅ Club "${club.name}" supprimé avec succès`);

    return NextResponse.json({
      success: true,
      message: `Club "${club.name}" supprimé avec succès`,
      data: {
        clubId: clubId,
        clubName: club.name,
        eaClubId: club.eaClubId,
        matchesDeleted: matchesDeleted.count
      }
    });

  } catch (error) {
    console.error('❌ Erreur suppression club:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la suppression',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}