import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Récupérer tous les joueurs ou filtrer par club
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const position = searchParams.get('position');
    
    let where: any = {};
    
    if (clubId) {
      where.clubId = clubId;
    }
    
    if (position) {
      where.position = position;
    }
    
    const players = await prisma.player.findMany({
      where,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            eaClubId: true
          }
        }
      },
      orderBy: [
        { club: { name: 'asc' } },
        { position: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log(`✅ ${players.length} joueurs récupérés`);
    
    return NextResponse.json({
      success: true,
      data: players
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération joueurs:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des joueurs'
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau joueur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      clubId, 
      name, 
      position, 
      number, 
      eaPlayerId 
    } = body;
    
    // Validation des champs requis
    if (!clubId || !name || !position) {
      return NextResponse.json({
        success: false,
        error: 'Club, nom et position sont obligatoires'
      }, { status: 400 });
    }
    
    // Vérifier que le club existe
    const club = await prisma.leagueClub.findUnique({
      where: { id: clubId }
    });
    
    if (!club) {
      return NextResponse.json({
        success: false,
        error: 'Club introuvable'
      }, { status: 404 });
    }
    
    // Vérifier l'unicité du numéro dans le club (si fourni)
    if (number) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          clubId: clubId,
          number: number
        }
      });
      
      if (existingPlayer) {
        return NextResponse.json({
          success: false,
          error: `Le numéro ${number} est déjà utilisé dans ce club`
        }, { status: 400 });
      }
    }
    
    // Créer le joueur
    const player = await prisma.player.create({
      data: {
        clubId,
        name,
        position,
        number,
        eaPlayerId
      },
      include: {
        club: {
          select: {
            name: true,
            eaClubId: true
          }
        }
      }
    });
    
    console.log(`✅ Joueur créé: ${player.name} (${player.club.name})`);
    
    return NextResponse.json({
      success: true,
      data: player,
      message: `Joueur "${player.name}" ajouté à ${player.club.name}`
    });
    
  } catch (error) {
    console.error('❌ Erreur création joueur:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création du joueur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}