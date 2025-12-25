'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Target, Calendar, Star } from 'lucide-react';

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
  position: string;
  value: number;
}

interface Match {
  id: string;
  homeClub: string;
  awayClub: string;
  homeScore: number;
  awayScore: number;
  playedAt: string;
}

export default function HomePage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [topScorers, setTopScorers] = useState<TopPlayer[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rankingRes, topScorersRes, matchesRes] = await Promise.all([
        fetch('/api/public/ranking'),
        fetch('/api/public/players?stat=goals&limit=5'),
        fetch('/api/public/matches?limit=5')
      ]);

      if (rankingRes.ok) {
        const data = await rankingRes.json();
        setClubs(data.data || []);
      }

      if (topScorersRes.ok) {
        const data = await topScorersRes.json();
        setTopScorers(data.data || []);
      }

      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setRecentMatches(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">⚽</div>
          <div className="text-white text-xl font-bold">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-800 to-red-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-green-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="text-6xl mr-4">🏟️</div>
            <h1 className="text-5xl font-bold">SenegalFC League</h1>
          </div>
          <p className="text-xl mb-8">Ligue Sénégalaise EA Sports FC • Saison 2025</p>
          
          {/* Stats Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl font-bold">{clubs.length}</div>
              <div className="text-white opacity-90">Clubs</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl font-bold">0</div>
              <div className="text-white opacity-90">Matchs</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl font-bold">3</div>
              <div className="text-white opacity-90">Meilleur</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl font-bold">🏆</div>
              <div className="text-white opacity-90">En direct</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Classement Principal */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <Trophy className="w-6 h-6 mr-3" />
                  🏆 Classement Général
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">MJ</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">G</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">N</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">P</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">BP</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">BC</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">DIFF</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clubs.map((club, index) => (
                      <tr key={club.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">
                              {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}
                            </span>
                            <span className="text-lg font-bold text-gray-900">{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-4">
                              {club.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{club.name}</div>
                              <div className="text-xs text-gray-500">{club.eaClubId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">{club.matchesPlayed}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-green-600">{club.wins}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-yellow-600">{club.draws}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-red-600">{club.losses}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-blue-600">{club.goalsFor}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-red-500">{club.goalsAgainst}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-bold ${
                            club.goalDifference > 0 ? 'text-green-600' :
                            club.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                            {club.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Meilleurs Buteurs */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-500" />
                ⚽ Meilleurs Buteurs
              </h3>
              <div className="space-y-3">
                {topScorers.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-bold text-gray-900">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.clubName}</div>
                    </div>
                    <div className="text-lg font-bold text-red-600">{player.value}</div>
                  </div>
                ))}
              </div>
              <Link 
                href="/stats/players" 
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium block"
              >
                Voir tous les classements →
              </Link>
            </div>

            {/* Derniers Résultats */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                📅 Derniers Résultats
              </h3>
              {recentMatches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">⚽</div>
                  <p className="text-gray-500 text-sm">Aucun match récent</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{match.homeClub}</div>
                        <div className="px-3 py-1 bg-white rounded-full">
                          <span className="font-bold">{match.homeScore} - {match.awayScore}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{match.awayClub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🏆 Participez à la Compétition !</h3>
            <p className="text-gray-600 mb-6">Rejoignez la Ligue Sénégalaise EA Sports FC</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/stats/players"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold"
              >
                📊 Statistiques Personnelles
              </Link>
              <Link
                href="/admin"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold"
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
