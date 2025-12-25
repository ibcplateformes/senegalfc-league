'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Users, 
  Crown,
  Medal,
  Zap,
  Flag
} from 'lucide-react';

interface ClubRanking {
  id: string;
  name: string;
  position: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  matchesPlayed: number;
}

interface RecentMatch {
  id: string;
  homeClub: { name: string };
  awayClub: { name: string };
  homeScore: number;
  awayScore: number;
  playedAt: string;
}

interface LeagueStats {
  totalClubs: number;
  totalMatches: number;
  lastMatch?: {
    homeTeam: string;
    awayTeam: string;
    score: string;
    date: string;
  };
  topScorer?: {
    name: string;
    goals: number;
  };
}

export default function HomePage() {
  const [ranking, setRanking] = useState<ClubRanking[]>([]);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [stats, setStats] = useState<LeagueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rankingRes, matchesRes, statsRes] = await Promise.all([
        fetch('/api/public/ranking'),
        fetch('/api/public/matches?limit=5'),
        fetch('/api/public/stats')
      ]);

      if (rankingRes.ok) {
        const rankingData = await rankingRes.json();
        setRanking(rankingData.data || []);
      }

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setRecentMatches(matchesData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'position-1';
    if (position === 2) return 'position-2';
    if (position === 3) return 'position-3';
    return 'position-other';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la ligue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-yellow-500 to-red-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <Flag className="w-12 h-12 mr-4" />
              <h1 className="text-4xl md:text-6xl font-black">
                SenegalFC League
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-semibold opacity-90 mb-8">
              Ligue Sénégalaise EA Sports FC • Saison 2025
            </p>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.totalClubs}</div>
                  <div className="text-sm opacity-80">Clubs</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.totalMatches}</div>
                  <div className="text-sm opacity-80">Matchs</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.topScorer?.goals || 0}</div>
                  <div className="text-sm opacity-80">Meilleur</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl font-bold">🏆</div>
                  <div className="text-sm opacity-80">En direct</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Classement */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Classement Général
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    Mis à jour en temps réel
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Club</th>
                      <th className="text-center">MJ</th>
                      <th className="text-center">G</th>
                      <th className="text-center">N</th>
                      <th className="text-center">P</th>
                      <th className="text-center">BP</th>
                      <th className="text-center">BC</th>
                      <th className="text-center">Diff</th>
                      <th className="text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((club) => (
                      <tr key={club.id} className="animate-fadeIn">
                        <td>
                          <span className={`position-badge ${getPositionBadge(club.position)}`}>
                            {club.position}
                          </span>
                        </td>
                        <td className="font-semibold">{club.name}</td>
                        <td className="text-center">{club.matchesPlayed}</td>
                        <td className="text-center text-green-600 font-semibold">{club.wins}</td>
                        <td className="text-center text-yellow-600 font-semibold">{club.draws}</td>
                        <td className="text-center text-red-600 font-semibold">{club.losses}</td>
                        <td className="text-center">{club.goalsFor}</td>
                        <td className="text-center">{club.goalsAgainst}</td>
                        <td className={`text-center font-semibold ${club.goalDifference > 0 ? 'text-green-600' : club.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                        </td>
                        <td className="text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
                            {club.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {ranking.length === 0 && (
                <div className="card-body text-center text-gray-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun club inscrit pour le moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Derniers Résultats */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Derniers Résultats
                  </h3>
                </div>
              </div>
              
              <div className="card-body space-y-3">
                {recentMatches.map((match, index) => (
                  <div key={match.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-slideIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {match.homeClub.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          vs {match.awayClub.name}
                        </div>
                      </div>
                      <div className="text-center mx-4">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(match.playedAt)}
                    </div>
                  </div>
                ))}
                
                {recentMatches.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun match récent</p>
                  </div>
                )}
              </div>
            </div>

            {/* Podium Top 3 */}
            {ranking.length >= 3 && (
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center">
                    <Medal className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Podium
                    </h3>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="space-y-3">
                    {ranking.slice(0, 3).map((club, index) => (
                      <div key={club.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`position-badge ${getPositionBadge(index + 1)} mr-3`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {club.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {club.points} points • {club.wins}V {club.draws}N {club.losses}D
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions Admin */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 text-purple-500 mr-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Administration
                  </h3>
                </div>
              </div>
              
              <div className="card-body">
                <Link 
                  href="/admin" 
                  className="w-full btn-senegal text-center block"
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Accès Admin
                </Link>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Gestion des clubs et matchs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Flag className="w-6 h-6 mr-2" />
            <span className="font-bold">SenegalFC League</span>
          </div>
          <p className="text-gray-400 text-sm">
            Ligue Sénégalaise EA Sports FC • Saison 2025 • Statistiques non-officielles
          </p>
          <div className="mt-4 space-x-4">
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm">
              Administration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}