'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Target, 
  Shield, 
  Star,
  Award,
  Users,
  Eye,
  ArrowLeft,
  Medal,
  Crown,
  Flame,
  Zap
} from 'lucide-react';

interface PlayerStat {
  position: number;
  id: string;
  name: string;
  clubName: string;
  playerPosition: string;
  matchesPlayed: number;
  value: number;
  goals: number;
  assists: number;
  averageRating: number;
  saves?: number;
  cleanSheets?: number;
}

interface StatCategory {
  key: string;
  label: string;
  icon: any;
  color: string;
  gradient: string;
  emoji: string;
  position?: string;
}

const statCategories: StatCategory[] = [
  { 
    key: 'goals', 
    label: 'Buteurs', 
    icon: Trophy, 
    color: 'red',
    gradient: 'from-red-500 to-orange-600',
    emoji: '⚽'
  },
  { 
    key: 'assists', 
    label: 'Passeurs', 
    icon: Target, 
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600', 
    emoji: '🎯'
  },
  { 
    key: 'rating', 
    label: 'Meilleures Notes', 
    icon: Star, 
    color: 'yellow',
    gradient: 'from-yellow-500 to-amber-600',
    emoji: '⭐'
  },
  { 
    key: 'saves', 
    label: 'Gardiens', 
    icon: Shield, 
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    emoji: '🥅',
    position: 'GK' 
  },
  { 
    key: 'cleanSheets', 
    label: 'Clean Sheets', 
    icon: Medal, 
    color: 'cyan',
    gradient: 'from-cyan-500 to-teal-600',
    emoji: '🛡️',
    position: 'GK' 
  },
  { 
    key: 'tackles', 
    label: 'Défenseurs', 
    icon: Shield, 
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    emoji: '🛡️'
  },
  { 
    key: 'interceptions', 
    label: 'Interceptions', 
    icon: Eye, 
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    emoji: '👁️'
  },
  { 
    key: 'manOfTheMatch', 
    label: 'Hommes du Match', 
    icon: Award, 
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    emoji: '👑'
  }
];

export default function PublicPlayerStatsPage() {
  const [selectedStat, setSelectedStat] = useState('goals');
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopPlayers(selectedStat);
  }, [selectedStat]);

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
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: string) => {
    const icons: Record<string, string> = {
      'GK': '🥅',
      'DEF': '🛡️',
      'MID': '⚙️',
      'ATT': '⚽'
    };
    return icons[position] || '👤';
  };

  const getPositionBadge = (position: string) => {
    const badges: Record<string, string> = {
      'GK': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'DEF': 'bg-blue-100 text-blue-800 border border-blue-300',
      'MID': 'bg-green-100 text-green-800 border border-green-300',
      'ATT': 'bg-red-100 text-red-800 border border-red-300'
    };
    return badges[position] || 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    if (position <= 5) return '🏅';
    if (position <= 10) return '⭐';
    return '📍';
  };

  const getRankColor = (position: number) => {
    if (position === 1) return 'from-yellow-400 to-amber-500';
    if (position === 2) return 'from-gray-300 to-gray-400';
    if (position === 3) return 'from-orange-400 to-orange-500';
    if (position <= 5) return 'from-green-400 to-green-500';
    return 'from-blue-400 to-blue-500';
  };

  const currentCategory = statCategories.find(cat => cat.key === selectedStat);
  const IconComponent = currentCategory?.icon || Trophy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-green-600 to-red-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Patterns de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-10 text-4xl animate-pulse">⚽</div>
          <div className="absolute top-10 right-20 text-3xl animate-bounce">🏆</div>
          <div className="absolute bottom-5 left-20 text-5xl animate-pulse">🥅</div>
          <div className="absolute bottom-10 right-10 text-2xl animate-bounce">⭐</div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <Link 
              href="/" 
              className="text-white/80 hover:text-white mb-4 inline-flex items-center text-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              ← Retour au classement
            </Link>
            
            <div className="flex items-center justify-center mb-6">
              <div className="text-5xl mr-4">📊</div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Statistiques Personnelles
              </h1>
            </div>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Classements individuels • Ligue Sénégalaise EA Sports FC
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8 relative z-20">
        
        {/* Navigation des catégories */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🏆 Choisissez une Catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCategories.map((category) => {
              const isSelected = selectedStat === category.key;
              const IconComp = category.icon;
              
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedStat(category.key)}
                  className={`group p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isSelected
                      ? `bg-gradient-to-r ${category.gradient} text-white shadow-2xl scale-105`
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className={`text-3xl ${isSelected ? '' : 'group-hover:animate-bounce'}`}>
                      {category.emoji}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}>
                    {category.label}
                  </div>
                  {category.position && (
                    <div className={`text-xs mt-1 ${
                      isSelected ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      ({category.position} uniquement)
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Podium */}
          {players.length >= 3 && (
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                <div className={`bg-gradient-to-r ${currentCategory?.gradient} p-6 text-white`}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    🏆 Podium
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {players.slice(0, 3).map((player, index) => (
                    <div 
                      key={player.id} 
                      className={`p-4 rounded-lg border-2 transform transition-all duration-200 hover:scale-105 ${
                        index === 0 ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100' :
                        index === 1 ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100' :
                        'border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">
                          {getMedalIcon(player.position)}
                        </div>
                        <div className="text-2xl mr-3">
                          {getPositionIcon(player.playerPosition)}
                        </div>
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 text-sm">{player.name}</div>
                          <div className="text-xs text-gray-600">{player.clubName}</div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPositionBadge(player.playerPosition)} mt-1`}>
                            {player.playerPosition}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${currentCategory?.gradient} bg-clip-text text-transparent`}>
                          {selectedStat === 'rating' ? player.value.toFixed(1) : player.value}
                        </div>
                        <div className="text-xs text-gray-500">
                          {player.matchesPlayed} match{player.matchesPlayed > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Classement complet */}
          <div className={players.length >= 3 ? 'xl:col-span-3' : 'xl:col-span-4'}>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <div className={`bg-gradient-to-r ${currentCategory?.gradient} p-6 text-white`}>
                <h2 className="text-2xl font-bold flex items-center">
                  <IconComponent className="w-6 h-6 mr-3" />
                  {currentCategory?.emoji} Classement - {currentCategory?.label}
                  <span className="ml-auto text-sm opacity-90">
                    {players.length} joueur{players.length > 1 ? 's' : ''}
                  </span>
                </h2>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-6xl animate-bounce mb-4">⚽</div>
                  <p className="text-gray-600 text-lg">Chargement du classement...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rang
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joueur
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Club
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {currentCategory?.label}
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Matchs
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {players.map((player, index) => (
                        <tr 
                          key={player.id} 
                          className={`transition-all duration-200 hover:bg-gray-50 ${
                            player.position <= 3 ? `border-l-4 bg-gradient-to-r ${getRankColor(player.position).replace('to-', 'to-transparent from-')}` : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">
                                {getMedalIcon(player.position)}
                              </span>
                              <span className={`text-lg font-bold ${
                                player.position === 1 ? 'text-yellow-600' :
                                player.position === 2 ? 'text-gray-500' :
                                player.position === 3 ? 'text-orange-600' :
                                player.position <= 5 ? 'text-green-600' :
                                'text-gray-600'
                              }`}>
                                #{player.position}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="text-2xl mr-3">
                                {getPositionIcon(player.playerPosition)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">
                                  {player.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {player.goals}⚽ {player.assists}🎯
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {player.clubName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionBadge(player.playerPosition)}`}>
                              {player.playerPosition}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`text-xl font-bold bg-gradient-to-r ${currentCategory?.gradient} bg-clip-text text-transparent`}>
                              {selectedStat === 'rating' ? player.value.toFixed(1) : player.value}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm text-gray-900">
                              {player.matchesPlayed}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {player.averageRating > 0 ? player.averageRating.toFixed(1) : '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {players.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🤔</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune donnée disponible</h3>
                      <p className="text-gray-500">
                        Aucun joueur n'a encore de statistiques pour cette catégorie.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🏆 Suivez la Compétition en Direct !
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🏟️ Retour au Classement
              </Link>
              <Link
                href="/admin"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
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
