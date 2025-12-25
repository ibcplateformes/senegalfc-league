'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Clock,
  Calendar,
  Edit,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';

interface Match {
  id: string;
  homeClub: { name: string };
  awayClub: { name: string };
  homeScore: number;
  awayScore: number;
  playedAt: string;
  detectedAt: string;
  validated: boolean;
  notes?: string;
  eaMatchId?: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'validated' | 'pending'>('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/admin/matches');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement matchs:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateMatch = async (matchId: string, validated: boolean) => {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/validate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validated })
      });

      if (response.ok) {
        fetchMatches(); // Rafraîchir
        alert(validated ? 'Match validé !' : 'Match rejeté !');
      }
    } catch (error) {
      console.error('Erreur validation match:', error);
      alert('Erreur lors de la validation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'validated') return match.validated;
    if (filter === 'pending') return !match.validated;
    return true;
  });

  const pendingCount = matches.filter(m => !m.validated).length;
  const validatedCount = matches.filter(m => m.validated).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des matchs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/admin"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Trophy className="w-7 h-7 text-green-500 mr-3" />
                  Gestion des Matchs
                </h1>
                <p className="text-gray-600">Valider, corriger et gérer tous les matchs de la ligue</p>
              </div>
            </div>
            
            <button
              onClick={fetchMatches}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Matchs</p>
                <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matchs Validés</p>
                <p className="text-2xl font-bold text-gray-900">{validatedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                <p className="text-lg font-bold text-gray-900">
                  {matches.filter(m => 
                    new Date(m.playedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Filtrer les matchs</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous ({matches.length})
              </button>
              <button
                onClick={() => setFilter('validated')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'validated' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Validés ({validatedCount})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente ({pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Liste des Matchs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Liste des Matchs ({filteredMatches.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredMatches.map((match) => (
              <div key={match.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {match.homeClub.name}
                      </div>
                      <div className="text-2xl font-bold text-gray-600">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {match.awayClub.name}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Joué le {formatDate(match.playedAt)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Détecté le {formatDate(match.detectedAt)}
                      </span>
                      {match.eaMatchId && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          ID: {match.eaMatchId.substring(0, 8)}...
                        </span>
                      )}
                    </div>

                    {match.notes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">{match.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Statut */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      match.validated
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.validated ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Validé
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-1" />
                          En attente
                        </>
                      )}
                    </span>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {!match.validated && (
                        <>
                          <button
                            onClick={() => validateMatch(match.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            ✓ Valider
                          </button>
                          <button
                            onClick={() => validateMatch(match.id, false)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            ✗ Rejeter
                          </button>
                        </>
                      )}
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMatches.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {filter === 'pending' ? 'Aucun match en attente' :
                 filter === 'validated' ? 'Aucun match validé' :
                 'Aucun match trouvé'}
              </h3>
              <p className="text-sm">
                {filter === 'pending' ? 'Tous les matchs ont été traités !' :
                 'Les matchs détectés apparaîtront ici après une synchronisation.'}
              </p>
            </div>
          )}
        </div>

        {/* Actions Rapides */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link 
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center block"
          >
            <RefreshCw className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Sync Manuel</h3>
            <p className="text-sm opacity-90">Détecter de nouveaux matchs</p>
          </Link>
          
          <Link 
            href="/admin/ranking"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center block"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Voir le Classement</h3>
            <p className="text-sm opacity-90">Classement mis à jour</p>
          </Link>
          
          <Link 
            href="/admin/clubs"
            className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-center block"
          >
            <Edit className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Gérer les Clubs</h3>
            <p className="text-sm opacity-90">Ajouter ou modifier clubs</p>
          </Link>
        </div>
      </div>
    </div>
  );
}