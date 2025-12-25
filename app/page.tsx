import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  eaClubId: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  matchesPlayed: number;
  goalDifference: number;
}

interface TopPlayer {
  id: string;
  name: string;
  clubName: string;
  value: number;
}

export default function HomePage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [topScorers, setTopScorers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rankingRes = await fetch('/api/public/ranking');
        const playersRes = await fetch('/api/public/players?stat=goals&limit=5');

        if (rankingRes.ok) {
          const data = await rankingRes.json();
          setClubs(data.data || []);
        }

        if (playersRes.ok) {
          const data = await playersRes.json();
          setTopScorers(data.data || []);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e40af' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚽</div>
          <h1>Chargement...</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #16a34a, #dc2626)', padding: '4rem 0', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '4rem', marginRight: '1rem' }}>🏟️</span>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>SenegalFC League</h1>
          </div>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
            Ligue Sénégalaise EA Sports FC • Saison 2025
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{clubs.length}</div>
              <div>Clubs</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</div>
              <div>Matchs</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</div>
              <div>Points Max</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>🏆</div>
              <div>En Direct</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Classement */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed)', padding: '1.5rem', color: 'white' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                🏆 Classement Général
              </h2>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Pos</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Club</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>MJ</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>G</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>N</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>P</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>BP</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>BC</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>DIFF</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>PTS</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {clubs.map((club, index) => (
                    <tr key={club.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                            {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}
                          </span>
                          <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{index + 1}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            width: '2.5rem', 
                            height: '2.5rem', 
                            borderRadius: '50%', 
                            backgroundColor: '#3b82f6', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontWeight: 'bold',
                            marginRight: '1rem'
                          }}>
                            {club.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>
                              {club.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {club.eaClubId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>
                        {club.matchesPlayed}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#059669' }}>
                        {club.wins}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#d97706' }}>
                        {club.draws}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#dc2626' }}>
                        {club.losses}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#2563eb' }}>
                        {club.goalsFor}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#ef4444' }}>
                        {club.goalsAgainst}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 'bold',
                          color: club.goalDifference > 0 ? '#059669' : club.goalDifference < 0 ? '#dc2626' : '#6b7280'
                        }}>
                          {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8'
                        }}>
                          {club.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Meilleurs Buteurs */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                ⚽ Meilleurs Buteurs
              </h3>
              <div>
                {topScorers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚽</div>
                    <p style={{ color: '#6b7280' }}>Aucun buteur encore</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {topScorers.slice(0, 5).map((player, index) => (
                      <div key={player.id} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          marginRight: '0.75rem'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>
                            {player.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {player.clubName}
                          </div>
                        </div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {player.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link 
                  href="/stats/players"
                  style={{ 
                    marginTop: '1rem',
                    color: '#2563eb',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  Voir tous les classements →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
              🏆 Participez à la Compétition !
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Rejoignez la Ligue Sénégalaise EA Sports FC
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <Link
                href="/stats/players"
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
                📊 Statistiques Personnelles
              </Link>
              <Link
                href="/admin"
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
                👑 Espace Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
