import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PlayerStat {
  position: number;
  id: string;
  name: string;
  clubName: string;
  playerPosition: string;
  matchesPlayed: number;
  value: number;
}

const statCategories = [
  { key: 'goals', label: 'Buteurs', emoji: '⚽' },
  { key: 'assists', label: 'Passeurs', emoji: '🎯' },
  { key: 'rating', label: 'Notes', emoji: '⭐' },
  { key: 'saves', label: 'Gardiens', emoji: '🥅', position: 'GK' }
];

export default function PublicPlayerStatsPage() {
  const [selectedStat, setSelectedStat] = useState('goals');
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopPlayers = async (stat: string) => {
      setLoading(true);
      try {
        const currentCategory = statCategories.find(cat => cat.key === stat);
        const positionFilter = currentCategory?.position ? `&position=${currentCategory.position}` : '';
        
        const response = await fetch(`/api/public/players?stat=${stat}&limit=20${positionFilter}`);
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.data || []);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers(selectedStat);
  }, [selectedStat]);

  const getPositionIcon = (position: string) => {
    const icons: { [key: string]: string } = {
      'GK': '🥅',
      'DEF': '🛡️',
      'MID': '⚙️',
      'ATT': '⚽'
    };
    return icons[position] || '👤';
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '📍';
  };

  const currentCategory = statCategories.find(cat => cat.key === selectedStat);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #16a34a, #dc2626)', padding: '3rem 0', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Link 
            href="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '1.125rem',
              marginBottom: '1rem',
              display: 'inline-block'
            }}
          >
            ← Retour au classement
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '3rem', marginRight: '1rem' }}>📊</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Statistiques Personnelles</h1>
          </div>
          <p style={{ fontSize: '1.125rem' }}>
            Classements individuels • Ligue Sénégalaise EA Sports FC
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        
        {/* Navigation des catégories */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', textAlign: 'center' }}>
            🏆 Choisissez une Catégorie
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {statCategories.map((category) => {
              const isSelected = selectedStat === category.key;
              
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedStat(category.key)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    backgroundColor: isSelected ? '#2563eb' : '#f9fafb',
                    color: isSelected ? 'white' : '#374151',
                    boxShadow: isSelected ? '0 10px 15px -3px rgba(37, 99, 235, 0.5)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                    {category.emoji}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                    {category.label}
                  </div>
                  {category.position && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
                      ({category.position} uniquement)
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Classement */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed)', padding: '1.5rem', color: 'white' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '0.75rem' }}>🏆</span>
              {currentCategory?.emoji} Classement - {currentCategory?.label}
              <span style={{ marginLeft: 'auto', fontSize: '0.875rem', opacity: 0.9 }}>
                {players.length} joueur{players.length > 1 ? 's' : ''}
              </span>
            </h2>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚽</div>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Chargement du classement...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Rang
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Joueur
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Club
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Position
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      {currentCategory?.label}
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                      Matchs
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {players.map((player) => (
                    <tr key={player.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
                            {getMedalIcon(player.position)}
                          </span>
                          <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#6b7280' }}>
                            #{player.position}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
                            {getPositionIcon(player.playerPosition)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>
                              {player.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                          {player.clubName}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: '#f3f4f6',
                          color: '#374151'
                        }}>
                          {player.playerPosition}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                          {selectedStat === 'rating' ? player.value.toFixed(1) : player.value}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.875rem', color: '#111827' }}>
                          {player.matchesPlayed}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {players.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤔</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                    Aucune donnée disponible
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    Aucun joueur n'a encore de statistiques pour cette catégorie.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              🏆 Suivez la Compétition !
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <Link
                href="/"
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                🏟️ Retour au Classement
              </Link>
              <Link
                href="/admin"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                👑 Espace Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
