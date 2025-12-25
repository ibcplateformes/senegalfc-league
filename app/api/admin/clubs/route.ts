import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Créer un nouveau club
export async function POST(request: NextRequest) {
  try {
    const { name, eaClubId, platform, active } = await request.json();
    
    console.log('📝 Création de club:', { name, eaClubId, platform, active });
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le nom du club est obligatoire' },
        { status: 400 }
      );
    }

    if (!eaClubId || !eaClubId.trim()) {
      return NextResponse.json(
        { success: false, message: 'L\'EA Club ID est obligatoire' },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(eaClubId.trim())) {
      return NextResponse.json(
        { success: false, message: 'L\'EA Club ID doit contenir uniquement des chiffres' },
        { status: 400 }
      );
    }

    // Vérifier si le club existe déjà
    const existingClub = await prisma.leagueClub.findFirst({
      where: {
        OR: [
          { eaClubId: eaClubId.trim() },
          { name: name.trim() }
        ]
      }
    });

    if (existingClub) {
      const duplicateField = existingClub.eaClubId === eaClubId.trim() ? 'EA Club ID' : 'nom';
      return NextResponse.json(
        { success: false, message: `Un club avec ce ${duplicateField} existe déjà` },
        { status: 409 }
      );
    }

    console.log(`✅ Création du club: ${name.trim()} (EA ID: ${eaClubId.trim()})`);

    // Créer le nouveau club
    const newClub = await prisma.leagueClub.create({
      data: {
        name: name.trim(),
        eaClubId: eaClubId.trim(),
        platform: platform || 'ps5',
        active: active !== undefined ? active : true,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0
      }
    });

    console.log(`   ✅ Club créé avec succès: ${newClub.id}`);

    return NextResponse.json({
      success: true,
      message: `Club "${newClub.name}" créé avec succès`,
      data: {
        id: newClub.id,
        name: newClub.name,
        eaClubId: newClub.eaClubId,
        platform: newClub.platform,
        active: newClub.active
      }
    });

  } catch (error) {
    console.error('❌ Erreur création club:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la création du club',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Récupérer tous les clubs
export async function GET(request: NextRequest) {
  try {
    const clubs = await prisma.leagueClub.findMany({
      orderBy: [
        { active: 'desc' },
        { points: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: clubs,
      count: clubs.length
    });

  } catch (error) {
    console.error('❌ Erreur récupération clubs:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la récupération des clubs',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}