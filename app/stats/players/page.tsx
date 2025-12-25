'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Target, Shield, Star, ArrowLeft } from 'lucide-react';

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
}

const statCategories = [
  { key: 'goals', label: 'Buteurs', emoji: '⚽', color: 'red' },
  { key: 'assists', label: 'Passeurs', emoji: '🎯', color: 'blue' },
  { key: 'rating', label: 'Meilleures Notes', emoji: '⭐', color: 'yellow' },
  { key: 'saves', label: 'Gardiens', emoji: '🥅', color: 'green', position: 'GK' }
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
    const icons = {
      'GK': '🥅',
      'DEF': '🛡️',
      'MID': '⚙️',
      'ATT': '⚽'
    };
    return icons[position as keyof typeof icons] || '👤';
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '📍';
  };

  const currentCategory = statCategories.find(cat => cat.key === selectedStat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-red-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="text-white hover:text-gray-200 mb-4 inline-flex items-center text-lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            ← Retour au classement
          </Link>
          
          <div className="flex items-center justify-center mb-6">
            <div className="text-5xl mr-4">📊</div>
            <h1 className="text-4xl font-bold">Statistiques Personnelles</h1>
          </div>
          <p className="text-lg">Classements individuels • Ligue Sénégalaise EA Sports FC</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        
        {/* Navigation des catégories */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🏆 Choisissez une Catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCategories.map((category) => {
              const isSelected = selectedStat === category.key;
              
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedStat(category.key)}
                  className={`p-6 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xl scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  <div className="text-3xl mb-3">{category.emoji}</div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                    {category.label}
                  </div>
                  {category.position && (
                    <div className={`text-xs mt-1 ${isSelected ? 'text-white opacity-80' : 'text-gray-500'}`}>
                      ({category.position} uniquement)
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Classement */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              <Trophy className="w-6 h-6 mr-3" />
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Joueur</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">{currentCategory?.label}</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Matchs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getMedalIcon(player.position)}</span>
                          <span className="text-lg font-bold text-gray-600">#{player.position}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{getPositionIcon(player.playerPosition)}</div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{player.name}</div>
                            <div className="text-xs text-gray-500">
                              {player.goals}⚽ {player.assists}🎯
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{player.clubName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {player.playerPosition}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {selectedStat === 'rating' ? player.value.toFixed(1) : player.value}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900">{player.matchesPlayed}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {players.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤔</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune donnée disponible</h3>
                  <p className="text-gray-500">Aucun joueur n'a encore de statistiques pour cette catégorie.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🏆 Suivez la Compétition !</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold"
              >
                🏟️ Retour au Classement
              </Link>
              <Link
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold"
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
