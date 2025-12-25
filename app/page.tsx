'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  TrendingUp,
  Star,
  Award,
  ChevronRight,
  Flame,
  Zap,
  Crown
} from 'lucide-react';

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
  form?: string[];
}

interface TopPlayer {
  id: string;
  name: string;
  clubName: string;
  position: string;
  value: number;
  stat: string;
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
  const [topAssists, setTopAssists] = useState<TopPlayer[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rankingRes, topScorersRes, topAssistsRes, matchesRes] = await Promise.all([
        fetch('/api/public/ranking'),
        fetch('/api/public/players?stat=goals&limit=5'),
        fetch('/api/public/players?stat=assists&limit=5'),
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

      if (topAssistsRes.ok) {
        const data = await topAssistsRes.json();
        setTopAssists(data.data || []);
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

  const getPositionIcon = (position: number) => {
    if (position === 1) return '👑';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    if (position <= 6) return '⚽';
    return '📍';
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return 'from-yellow-400 to-yellow-600';
    if (position === 2) return 'from-gray-300 to-gray-500';
    if (position === 3) return 'from-orange-400 to-orange-600';
    if (position <= 6) return 'from-green-400 to-green-600';
    return 'from-red-400 to-red-600';
  };

  const getTrendIcon = (points: number) => {
    if (points >= 9) return <Flame className="w-4 h-4 text-red-500" />;
    if (points >= 6) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (points >= 3) return <Zap className="w-4 h-4 text-yellow-500" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">⚽</div>
          <div className="text-white text-xl font-bold">Chargement de la ligue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-800 to-red-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-green-600 to-red-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-red-500/20"></div>
        
        {/* Patterns de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">⚽</div>
          <div className="absolute top-20 right-20 text-4xl">🏆</div>
          <div className="absolute bottom-10 left-20 text-5xl">🥅</div>
          <div className="absolute bottom-20 right-10 text-3xl">⭐</div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl mr-4">🏟️</div>
              <h1 className="text-5xl md:text-6xl font-bold text-white">
                SenegalFC League
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium">
              Ligue Sénégalaise EA Sports FC • Saison 2025
            </p>
            
            {/* Stats Hero */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">{clubs.length}</div>
                <div className="text-white/80">Clubs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">{recentMatches.length}</div>
                <div className="text-white/80">Matchs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">
                  {clubs.length > 0 ? Math.max(...clubs.map(c => c.points)) : 0}
                </div>
                <div className="text-white/80">Meilleur</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold text-white">🔥</div>
                <div className="text-white/80">En direct</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Classement Principal */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-yellow-300" />
                  🏆 Classement Général
                  <span className="ml-auto text-sm opacity-80">Mis à jour en temps réel</span>
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pos
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Club
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MJ
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        G
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BP
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BC
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diff
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PTS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clubs.map((club, index) => (
                      <tr 
                        key={club.id} 
                        className={`hover:bg-gray-50 transition-all duration-200 ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400' :
                          index < 3 ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400' :
                          index >= clubs.length - 2 ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400' :
                          ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getPositionIcon(index + 1)}</span>
                            <span className={`text-lg font-bold ${
                              index === 0 ? 'text-yellow-600' :
                              index < 3 ? 'text-green-600' :
                              index >= clubs.length - 2 ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPositionColor(index + 1)} flex items-center justify-center text-white font-bold`}>
                                {club.name.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {club.name}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {club.eaClubId}
                              </div>
                            </div>
                            <div className="ml-2">
                              {getTrendIcon(club.points)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {club.matchesPlayed}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-green-600">
                            {club.wins}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-yellow-600">
                            {club.draws}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-red-600">
                            {club.losses}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-blue-600">
                            {club.goalsFor}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-red-500">
                            {club.goalsAgainst}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-bold ${
                            club.goalDifference > 0 ? 'text-green-600' :
                            club.goalDifference < 0 ? 'text-red-600' :
                            'text-gray-500'
                          }`}>
                            {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index < 3 ? 'bg-green-100 text-green-800' :
                            index >= clubs.length - 2 ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
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
            
            {/* Podium */}
            {clubs.length >= 3 && (
              <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  🏆 Podium
                </h3>
                <div className="space-y-4">
                  {clubs.slice(0, 3).map((club, index) => (
                    <div key={club.id} className={`flex items-center p-4 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
                      'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200'
                    }`}>
                      <div className="text-2xl mr-3">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div className="flex-grow">
                        <div className="font-bold text-gray-900">{club.name}</div>
                        <div className="text-sm text-gray-600">
                          {club.points} points • {club.wins}V {club.draws}N {club.losses}D
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meilleurs Buteurs */}
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-500" />
                ⚽ Meilleurs Buteurs
              </h3>
              <div className="space-y-3">
                {topScorers.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index < 3 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="text-sm font-bold text-gray-900">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.clubName}</div>
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {player.value}
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/stats/players" 
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Voir tous les classements <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Meilleurs Passeurs */}
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-500" />
                🎯 Meilleurs Passeurs
              </h3>
              <div className="space-y-3">
                {topAssists.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index < 3 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="text-sm font-bold text-gray-900">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.clubName}</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {player.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derniers Résultats */}
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
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
                        <div className="text-xs text-gray-500">
                          {new Date(match.playedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-sm font-medium text-gray-900">
                          {match.homeClub}
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full border">
                          <span className="font-bold text-gray-900">
                            {match.homeScore} - {match.awayScore}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {match.awayClub}
                        </div>
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
          <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🏆 Participez à la Compétition !
            </h3>
            <p className="text-gray-600 mb-6">
              Rejoignez la Ligue Sénégalaise EA Sports FC et affrontez les meilleurs clubs !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/stats/players"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                📊 Voir tous les Classements
              </Link>
              <Link
                href="/admin"
                className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
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
