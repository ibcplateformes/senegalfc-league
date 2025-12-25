'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Target, 
  Shield, 
  Activity, 
  Award,
  Users,
  TrendingUp,
  Eye,
  ArrowLeft,
  Medal,
  Star
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
  position?: string;
}

const statCategories: StatCategory[] = [
  { key: 'goals', label: 'Meilleurs Buteurs', icon: Trophy, color: 'red' },
  { key: 'assists', label: 'Meilleurs Passeurs', icon: Target, color: 'blue' },
  { key: 'rating', label: 'Meilleures Notes', icon: Star, color: 'yellow' },
  { key: 'saves', label: 'Meilleurs Gardiens (Arrêts)', icon: Shield, color: 'green', position: 'GK' },
  { key: 'cleanSheets', label: 'Matchs sans Encaisser', icon: Medal, color: 'cyan', position: 'GK' },
  { key: 'tackles', label: 'Meilleurs Défenseurs (Tacles)', icon: Shield, color: 'blue' },
  { key: 'interceptions', label: 'Plus d\'Interceptions', icon: Eye, color: 'purple' },
  { key: 'manOfTheMatch', label: 'Hommes du Match', icon: Award, color: 'gold' }
];

export default function PlayersStatsPage() {
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

  const getMedalColor = (position: number) => {
    if (position === 1) return 'text-yellow-500'; // Or
    if (position === 2) return 'text-gray-400'; // Argent
    if (position === 3) return 'text-orange-600'; // Bronze
    return 'text-gray-600';
  };

  const getMedalIcon = (position: number) => {
    if (position <= 3) return '🏆';
    if (position <= 5) return '🥇';
    if (position <= 10) return '⭐';
    return '📍';
  };

  const currentCategory = statCategories.find(cat => cat.key === selectedStat);
  const IconComponent = currentCategory?.icon || Trophy;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/players" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux joueurs
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            📊 Statistiques Personnelles
          </h1>
          <p className="text-gray-600">
            Classements individuels des joueurs de la Ligue Sénégalaise EA Sports FC
          </p>
        </div>

        {/* Navigation des catégories */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Catégories de Statistiques</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCategories.map((category) => {
              const isSelected = selectedStat === category.key;
              const IconComp = category.icon;
              
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedStat(category.key)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <IconComp className={`w-6 h-6 ${
                      isSelected ? 'text-blue-500' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className={`text-sm font-medium ${
                    isSelected ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {category.label}
                  </div>
                  {category.position && (
                    <div className="text-xs text-gray-500 mt-1">
                      ({category.position} uniquement)
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Podium Top 3 */}
        {players.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
              <IconComponent className="w-6 h-6 mr-2" />
              🏆 Podium - {currentCategory?.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {players.slice(0, 3).map((player, index) => (
                <div
                  key={player.id}
                  className={`bg-white rounded-lg p-6 text-center ${
                    index === 0 ? 'transform scale-105 border-4 border-yellow-400' : ''
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="text-3xl mb-2">
                    {getPositionIcon(player.playerPosition)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {player.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {player.clubName}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionBadge(player.playerPosition)} mb-3`}>
                    {player.playerPosition}
                  </span>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedStat === 'rating' ? player.value.toFixed(1) : player.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {player.matchesPlayed} match{player.matchesPlayed > 1 ? 's' : ''}
                  </div>
                  <Link
                    href={`/admin/players/${player.id}`}
                    className="mt-3 inline-block text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Voir détails →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classement complet */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <IconComponent className="w-5 h-5 mr-2 text-blue-500" />
              Classement Complet - {currentCategory?.label}
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du classement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joueur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Club
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {currentCategory?.label.split(' ').pop()}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matchs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note Moy.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player, index) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`text-xl mr-2 ${getMedalColor(player.position)}`}>
                            {getMedalIcon(player.position)}
                          </span>
                          <span className={`text-lg font-bold ${getMedalColor(player.position)}`}>
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
                            <div className="text-sm font-medium text-gray-900">
                              {player.name}
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
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-blue-600">
                          {selectedStat === 'rating' ? player.value.toFixed(1) : player.value}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {player.matchesPlayed}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {player.averageRating > 0 ? player.averageRating.toFixed(1) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/players/${player.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          👁️ Détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {players.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucun joueur n'a encore de statistiques pour cette catégorie.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Liens d'action */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link 
            href="/admin/players"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Retour aux joueurs
          </Link>
          <Link 
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Administration
          </Link>
        </div>
      </div>
    </div>
  );
}
