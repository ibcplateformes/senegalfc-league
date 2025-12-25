'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, Plus, Target, Crown } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  eaClubId: string;
  platform: string;
  active: boolean;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface ClubStats {
  totalClubs: number;
  activeClubs: number;
  leader: string | null;
  totalGoals: number;
}

export default function ClubsManagement() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clubsRes, statsRes] = await Promise.all([
        fetch('/api/admin/clubs'),
        fetch('/api/admin/clubs/stats')
      ]);

      if (clubsRes.ok) {
        const clubsData = await clubsRes.json();
        setClubs(clubsData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClub = async (clubId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) return;

    try {
      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData(); // Rafraîchir la liste
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
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
              🇸🇳 Gestion des Clubs
            </h1>
            <p className="text-gray-600">Ajouter, modifier et gérer les clubs de la ligue sénégalaise</p>
          </div>
          
          <Link
            href="/admin/clubs/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Club
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalClubs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clubs Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeClubs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leader</p>
                <p className="text-lg font-bold text-gray-900">{stats?.leader || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Buts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalGoals || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des clubs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Liste des Clubs ({clubs.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EA Club ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bilan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{club.name}</div>
                        <div className="text-sm text-gray-500">{club.goalsFor} BP • {club.goalsAgainst} BC</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {club.eaClubId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-blue-600">{club.points}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{club.wins}V</span>
                        <span className="text-gray-500 mx-1">•</span>
                        <span className="text-yellow-600 font-medium">{club.draws}N</span>
                        <span className="text-gray-500 mx-1">•</span>
                        <span className="text-red-600 font-medium">{club.losses}D</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        club.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {club.active ? '✅ Actif' : '❌ Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/clubs/${club.id}/edit`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          ✏️ Modifier
                        </Link>
                        <button
                          onClick={() => deleteClub(club.id)}
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
            
            {clubs.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun club</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un club à la ligue.</p>
                <div className="mt-6">
                  <Link
                    href="/admin/clubs/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un club
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