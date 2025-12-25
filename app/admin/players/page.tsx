'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Trophy, Target, Activity } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: string;
  number?: number;
  club: {
    id: string;
    name: string;
    eaClubId: string;
  };
  
  // Stats principales
  matchesPlayed: number;
  goals: number;
  assists: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
}

interface Club {
  id: string;
  name: string;
  eaClubId: string;
}

export default function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, clubsRes] = await Promise.all([
        fetch('/api/admin/players'),
        fetch('/api/admin/clubs')
      ]);

      if (playersRes.ok) {
        const playersData = await playersRes.json();
        setPlayers(playersData.data || []);
      }

      if (clubsRes.ok) {
        const clubsData = await clubsRes.json();
        setClubs(clubsData.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${playerName} ?`)) return;

    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData(); // Rafraîchir la liste
        alert(`${playerName} a été supprimé`);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrage des joueurs
  const filteredPlayers = players.filter(player => {
    const clubMatch = selectedClub === 'all' || player.club.id === selectedClub;
    const positionMatch = selectedPosition === 'all' || player.position === selectedPosition;
    return clubMatch && positionMatch;
  });

  const getPositionBadge = (position: string) => {
    const badges: Record<string, string> = {
      'GK': 'bg-yellow-100 text-yellow-800',
      'DEF': 'bg-blue-100 text-blue-800',
      'MID': 'bg-green-100 text-green-800',
      'ATT': 'bg-red-100 text-red-800'
    };
    return badges[position] || 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Retour à l'administration
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              👥 Gestion des Joueurs
            </h1>
            <p className="text-gray-600">Statistiques individuelles et gestion des effectifs</p>
          </div>
          
          <Link
            href="/admin/players/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Joueur
          </Link>
        </div>

        {/* Statistiques Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Joueurs</p>
                <p className="text-2xl font-bold text-gray-900">{players.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Buts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {players.reduce((sum, p) => sum + p.goals, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Passes D.</p>
                <p className="text-2xl font-bold text-gray-900">
                  {players.reduce((sum, p) => sum + p.assists, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Joueurs Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {players.filter(p => p.matchesPlayed > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Filtre par club */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club
              </label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les clubs</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes les positions</option>
                <option value="GK">🥅 Gardien (GK)</option>
                <option value="DEF">🛡️ Défenseur (DEF)</option>
                <option value="MID">⚙️ Milieu (MID)</option>
                <option value="ATT">⚽ Attaquant (ATT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Joueurs ({filteredPlayers.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                    Matchs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passes D.
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
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getPositionIcon(player.position)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {player.name}
                          </div>
                          {player.number && (
                            <div className="text-xs text-gray-500">
                              #{player.number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {player.club.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {player.club.eaClubId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPositionBadge(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {player.matchesPlayed}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-green-600">
                        {player.goals}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-blue-600">
                        {player.assists}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {player.averageRating > 0 ? player.averageRating.toFixed(1) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/players/${player.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          👁️ Voir
                        </Link>
                        <Link
                          href={`/admin/players/${player.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                        >
                          ✏️ Modifier
                        </Link>
                        <button
                          onClick={() => deletePlayer(player.id, player.name)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPlayers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun joueur</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedClub === 'all' && selectedPosition === 'all' 
                    ? 'Commencez par ajouter des joueurs à vos clubs.'
                    : 'Aucun joueur ne correspond aux filtres sélectionnés.'
                  }
                </p>
                <div className="mt-6">
                  <Link
                    href="/admin/players/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un joueur
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}