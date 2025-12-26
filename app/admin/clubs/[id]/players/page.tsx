'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  position: string;
  number: number | null;
  eaPlayerId: string | null;
  
  // Stats de saison
  matchesPlayed: number;
  minutesPlayed: number;
  
  // Stats offensives
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  dribbles: number;
  crosses: number;
  
  // Stats défensives
  tackles: number;
  interceptions: number;
  clearances: number;
  aerialDuelsWon: number;
  foulsCommitted: number;
  
  // Stats gardien
  saves: number;
  goalsConceded: number;
  cleanSheets: number;
  catches: number;
  penaltiesSaved: number;
  
  // Récompenses & discipline
  averageRating: number;
  yellowCards: number;
  redCards: number;
  manOfTheMatch: number;
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

interface ClubPlayerData {
  club: {
    id: string;
    name: string;
    eaClubId: string;
    platform: string;
    active: boolean;
  };
  players: Player[];
  eaMembers: any[] | null;
  stats: {
    totalPlayers: number;
    totalGoals: number;
    totalAssists: number;
    totalMatches: number;
    avgRating: number;
  };
}

export default function ClubPlayersPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  
  const [data, setData] = useState<ClubPlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (clubId) {
      fetchClubPlayers();
    }
  }, [clubId]);

  const fetchClubPlayers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/clubs/${clubId}/players`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des joueurs');
      }
    } catch (error) {
      console.error('Erreur chargement joueurs:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const syncPlayerStats = async () => {
    if (!data?.club) return;
    
    setSyncing(true);
    try {
      // Déclencher une synchronisation manuelle des joueurs
      console.log('Synchronisation des joueurs...');
      // Ici on pourrait appeler une API de sync spécifique si nécessaire
      await fetchClubPlayers(); // Pour l'instant, on recharge juste les données
    } catch (error) {
      console.error('Erreur sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getPositionIcon = (position: string) => {
    const icons: { [key: string]: string } = {
      'GK': '🥅',
      'DEF': '🛡️',
      'MID': '⚙️',
      'ATT': '⚽'
    };
    return icons[position] || '👤';
  };

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'GK': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'DEF': 'bg-blue-100 text-blue-800 border-blue-300',
      'MID': 'bg-green-100 text-green-800 border-green-300',
      'ATT': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[position] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : '-';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Chargement des joueurs...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
              Erreur de chargement
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={fetchClubPlayers}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🔄 Réessayer
              </button>
              <Link
                href="/admin/clubs"
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: '500',
                  display: 'inline-block'
                }}
              >
                ← Retour aux clubs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <Link 
                href="/admin/clubs"
                style={{ 
                  color: '#6b7280', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}
              >
                ← Retour aux clubs
              </Link>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                👥 Joueurs de {data.club.name}
              </h1>
              <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                Club ID: {data.club.eaClubId} • Plateforme: {data.club.platform.toUpperCase()}
              </p>
            </div>
            <button
              onClick={syncPlayerStats}
              disabled={syncing}
              style={{
                backgroundColor: syncing ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: syncing ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {syncing ? '🔄 Synchronisation...' : '🔄 Actualiser'}
            </button>
          </div>
          
          {/* Stats du club */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                {data.stats.totalPlayers}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Joueurs</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                {data.stats.totalGoals}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Buts totaux</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                {data.stats.totalAssists}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Passes décisives</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {formatRating(data.stats.avgRating)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Note moyenne</div>
            </div>
          </div>
        </div>

        {/* Liste des joueurs */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
              📋 Liste complète des joueurs ({data.players.length})
            </h2>
          </div>
          
          {data.players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚽</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                Aucun joueur trouvé
              </h3>
              <p style={{ color: '#6b7280' }}>
                Aucune statistique de joueur n'a encore été enregistrée pour ce club.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Joueur
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Position
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      MJ
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Buts
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Passes
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Note
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Tacles
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Cartons
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      ⭐ MOTM
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {data.players.map((player, index) => (
                    <tr key={player.id} style={{ borderBottom: index < data.players.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
                            {getPositionIcon(player.position)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>
                              {player.name}
                            </div>
                            {player.number && (
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                #{player.number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: '1px solid'
                        }} className={getPositionColor(player.position)}>
                          {player.position}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: '500' }}>{player.matchesPlayed}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: player.goals > 0 ? '#dc2626' : '#6b7280' }}>
                          {player.goals}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: player.assists > 0 ? '#2563eb' : '#6b7280' }}>
                          {player.assists}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 'bold',
                          color: player.averageRating >= 7.5 ? '#10b981' : player.averageRating >= 6.5 ? '#f59e0b' : '#6b7280'
                        }}>
                          {formatRating(player.averageRating)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ color: '#6b7280' }}>{player.tackles}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                          {player.yellowCards > 0 && (
                            <span style={{ fontSize: '0.875rem' }}>🟡{player.yellowCards}</span>
                          )}
                          {player.redCards > 0 && (
                            <span style={{ fontSize: '0.875rem' }}>🟥{player.redCards}</span>
                          )}
                          {player.yellowCards === 0 && player.redCards === 0 && (
                            <span style={{ color: '#6b7280' }}>-</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: player.manOfTheMatch > 0 ? '#f59e0b' : '#6b7280'
                        }}>
                          {player.manOfTheMatch > 0 ? player.manOfTheMatch : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Membres EA Sports si disponibles */}
        {data.eaMembers && data.eaMembers.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1.5rem', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              🎮 Membres EA Sports actifs ({data.eaMembers.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {data.eaMembers.map((member, index) => (
                <div key={index} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {member.position} • Overall: {member.overall}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
